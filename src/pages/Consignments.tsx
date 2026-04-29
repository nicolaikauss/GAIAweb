// @ts-nocheck
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Calendar, User, Package, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ConsignedArtwork } from "@/types";

export default function Consignments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [consignments, setConsignments] = useState<ConsignedArtwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsignments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('consignments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks'
        },
        () => {
          fetchConsignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const fetchConsignments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Filter artworks with "consignment" or "consigned" tag
      const consignmentArtworks = data?.filter(artwork => 
        Array.isArray(artwork.tags) && artwork.tags.some((tag: string) => 
          tag.toLowerCase().includes('consignment') || tag.toLowerCase() === 'consigned'
        )
      ) || [];

      if (error) throw error;
      setConsignments(consignmentArtworks);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
      case 'consigned':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'sold':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative z-10 w-full max-w-8xl px-4 sm:px-6 py-6 sm:py-12 mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto text-center sm:text-left">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="hidden sm:block w-px h-8 bg-slate-200" />
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-2">Consignments</h1>
              <p className="text-sm sm:text-base text-slate-600">
                Manage artworks on consignment with galleries and artists
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Active Consignments</p>
                <p className="text-2xl font-bold text-slate-800">{consignments.filter(c => c.status !== 'sold').length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Consigned</p>
                <p className="text-2xl font-bold text-slate-800">{consignments.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Sold from Consignment</p>
                <p className="text-2xl font-bold text-slate-800">{consignments.filter(c => c.status === 'sold').length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Avg Commission</p>
                <p className="text-2xl font-bold text-slate-800">
                  {consignments.length > 0 
                    ? `${(consignments.reduce((sum, c) => sum + c.commission_rate, 0) / consignments.length).toFixed(0)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Consignments List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 text-slate-600">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Loading consignments...
            </div>
          </div>
        ) : consignments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-3">
              No consignments yet
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Consignments will appear here when artworks are tagged with "consignment".
            </p>
          </div>
        ) : (
          <div className="space-y-6 min-h-[600px]">
            <h2 className="text-2xl font-semibold text-slate-800">Active Consignments</h2>
            {consignments.map((consignment, index) => (
              <motion.div
                key={consignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all min-h-[120px]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div 
                      className="flex items-center gap-6 flex-1 cursor-pointer"
                      onClick={() => navigate(`/inventory/${consignment.id}`)}
                    >
                      {/* Artwork Image */}
                      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {consignment.image_url ? (
                          <img src={consignment.image_url} alt={consignment.title} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-8 w-8 text-slate-400" />
                        )}
                      </div>
                      
                      {/* Consignment Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-800">
                            {consignment.title}
                          </h3>
                          <Badge className={`${getStatusColor(consignment.status)} text-xs font-medium px-3 py-1`}>
                            {consignment.status}
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-sm">by {consignment.artist}</p>
                        {consignment.seller_name && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <User className="h-4 w-4" />
                            <span>Consignor: {consignment.seller_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>Added: {new Date(consignment.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Commission Rate & Edit Button */}
                    <div className="flex items-center gap-4">
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold text-slate-800">
                          {consignment.commission_rate.toFixed(0)}%
                        </div>
                        <div className="text-sm text-slate-500">
                          Commission Rate
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AuroraBackground>
  );
}
