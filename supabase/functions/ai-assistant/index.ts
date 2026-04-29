import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Get authorization header from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create a client to verify the user's token
    const supabaseClient = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error("Unauthorized");
    }

    // Create Supabase client with service role for database operations
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Define available tools for the AI
    const tools = [
      {
        type: "function",
        function: {
          name: "export_all_artworks",
          description: "Export all artworks from the database. Returns a list of all artworks with their details.",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_artworks",
          description: "Search for artworks by title, artist, or tags",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query"
              }
            },
            required: ["query"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_statistics",
          description: "Get statistics about the gallery including total artworks, sales, revenue, etc.",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      }
    ];

    // Call AI with tools
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for an art gallery management system. You have access to the user's artwork database and can help them:
- Export all artworks to PDF files
- Search for specific artworks by title, artist, or tags
- Provide statistics about their collection (total artworks, sales, revenue, etc.)

When users ask to "export all", use the export_all_artworks tool and mention that the data has been retrieved for export.
Be specific, accurate, and helpful. Format numbers with proper separators.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        tools: tools,
        tool_choice: 'auto'
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const message = aiData.choices[0].message;

    // Handle tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      let toolResult;

      switch (functionName) {
        case 'export_all_artworks':
          const { data: artworks, error: artworksError } = await supabase
            .from('artworks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (artworksError) throw artworksError;
          
          toolResult = {
            artworks: artworks,
            count: artworks?.length || 0
          };
          break;

        case 'search_artworks':
          const searchQuery = functionArgs.query.toLowerCase();
          const { data: searchResults, error: searchError } = await supabase
            .from('artworks')
            .select('*')
            .eq('user_id', user.id)
            .or(`title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%`);

          if (searchError) throw searchError;
          
          toolResult = {
            artworks: searchResults,
            count: searchResults?.length || 0
          };
          break;

        case 'get_statistics':
          const { data: allArtworks, error: statsError } = await supabase
            .from('artworks')
            .select('*')
            .eq('user_id', user.id);

          if (statsError) throw statsError;

          const stats = {
            total_artworks: allArtworks?.length || 0,
            available: allArtworks?.filter(a => a.status === 'available').length || 0,
            sold: allArtworks?.filter(a => a.status === 'sold').length || 0,
            consigned: allArtworks?.filter(a => a.on_consignment).length || 0,
            total_value: allArtworks?.reduce((sum, a) => sum + (a.price || 0), 0) || 0,
            total_purchase_cost: allArtworks?.reduce((sum, a) => sum + (a.purchase_price || 0), 0) || 0,
            total_revenue: allArtworks?.filter(a => a.status === 'sold').reduce((sum, a) => sum + (a.price || 0), 0) || 0
          };
          
          toolResult = stats;
          break;

        default:
          toolResult = { error: "Unknown function" };
      }

      // Make a second call to the AI with the tool result
      const finalResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant for an art gallery management system. Present the data you received in a clear, organized way. Use bullet points and format numbers properly. Be specific about counts, values, and artwork details.`
            },
            {
              role: 'user',
              content: query
            },
            message,
            {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult)
            }
          ],
        }),
      });

      const finalData = await finalResponse.json();
      
      return new Response(
        JSON.stringify({
          response: finalData.choices[0].message.content,
          data: toolResult
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No tool call needed, return AI response directly
    return new Response(
      JSON.stringify({
        response: message.content,
        data: null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in ai-assistant function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});