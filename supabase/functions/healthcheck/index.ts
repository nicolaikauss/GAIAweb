import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'gaia-capital-api',
      version: '1.0.0',
    };

    return new Response(
      JSON.stringify(health),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: errorMessage,
      }),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
