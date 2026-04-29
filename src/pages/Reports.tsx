// @ts-nocheck
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, TrendingUp, Package, DollarSign, Calendar, Palette, Users, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StockReport } from "@/types";

export default function Reports() {
  const navigate = useNavigate();
  const [report, setReport] = useState<StockReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockReport();
  }, []);

  const fetchStockReport = async () => {
    try {
      // Fetch artworks data
      const { data: artworks, error } = await supabase
        .from("artworks")
        .select("*");

      if (error) throw error;

      // Calculate report data
      const totalArtworks = artworks?.length || 0;
      const availableArtworks = artworks?.filter(a => a.status === 'available').length || 0;
      const soldArtworks = artworks?.filter(a => a.status === 'sold').length || 0;
      
      // Filter consigned artworks by tags
      const consignedArtworks = artworks?.filter(a => 
        a.tags?.some((tag: string) => tag.toLowerCase().includes('consignment'))
      ).length || 0;
      
      const reservedArtworks = artworks?.filter(a => a.status === 'reserved').length || 0;
      
      const consignmentPercentage = totalArtworks > 0 
        ? Math.round((consignedArtworks / totalArtworks) * 100) 
        : 0;
      
      const totalValue = artworks?.reduce((sum, artwork) => sum + (artwork.price || 0), 0) || 0;
      const availableValue = artworks?.filter(a => a.status === 'available').reduce((sum, artwork) => sum + (artwork.price || 0), 0) || 0;
      const soldValue = artworks?.filter(a => a.status === 'sold').reduce((sum, artwork) => sum + (artwork.price || 0), 0) || 0;
      const consignmentValue = artworks?.filter(a => a.on_consignment).reduce((sum, artwork) => sum + (artwork.price || 0), 0) || 0;

      // Top artists
      const artistCounts = artworks?.reduce((acc, artwork) => {
        acc[artwork.artist] = (acc[artwork.artist] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      const topArtists = Object.entries(artistCounts)
        .map(([artist, count]) => ({ name: artist, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top mediums
      const mediumCounts = artworks?.reduce((acc, artwork) => {
        if (artwork.medium) {
          acc[artwork.medium] = (acc[artwork.medium] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};
      const topMediums = Object.entries(mediumCounts)
        .map(([medium, count]) => ({ name: medium, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent additions
      const recentAdditions = artworks
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(artwork => ({
          title: artwork.title,
          artist: artwork.artist,
          date: artwork.created_at
        })) || [];

      setReport({
        totalArtworks,
        availableArtworks,
        soldArtworks,
        consignedArtworks,
        reservedArtworks,
        totalValue,
        availableValue,
        soldValue,
        consignmentValue,
        topArtists,
        topMediums,
        recentAdditions,
        consignmentPercentage
      });
    } catch (error) {
      console.error('Error fetching stock report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'sold':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'consigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'reserved':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
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
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-2">Collection Analytics</h1>
              <p className="text-sm sm:text-base text-slate-600">
                Detailed insights into your art collection and stock status
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 text-slate-600">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Generating analytics report...
            </div>
          </div>
        ) : report ? (
          <div className="space-y-12">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Artworks</p>
                    <p className="text-2xl font-bold text-slate-800">{report.totalArtworks}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Available</p>
                    <p className="text-2xl font-bold text-slate-800">{report.availableArtworks}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Value</p>
                    <p className="text-2xl font-bold text-slate-800">${report.totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Consigned</p>
                    <p className="text-2xl font-bold text-slate-800">{report.consignmentPercentage}%</p>
                    <p className="text-xs text-slate-500">{report.consignedArtworks} artworks</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <Card className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">Status Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-50 text-green-700 border-green-200">Available</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-800">{report.availableArtworks}</div>
                      <div className="text-sm text-slate-500">
                        {report.totalArtworks > 0 ? Math.round((report.availableArtworks / report.totalArtworks) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-red-50 text-red-700 border-red-200">Sold</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-800">{report.soldArtworks}</div>
                      <div className="text-sm text-slate-500">
                        {report.totalArtworks > 0 ? Math.round((report.soldArtworks / report.totalArtworks) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">Consigned</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-800">{report.consignedArtworks}</div>
                      <div className="text-sm text-slate-500">
                        {report.totalArtworks > 0 ? Math.round((report.consignedArtworks / report.totalArtworks) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Reserved</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-800">{report.reservedArtworks}</div>
                      <div className="text-sm text-slate-500">
                        {report.totalArtworks > 0 ? Math.round((report.reservedArtworks / report.totalArtworks) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">Top Artists</h3>
                <div className="space-y-4">
                  {report.topArtists.map((artist, index) => (
                    <div key={artist.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                          {index + 1}
                        </div>
                        <span className="text-slate-800 font-medium">{artist.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-slate-800">{artist.count}</div>
                        <div className="text-sm text-slate-500">artworks</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Top Mediums and Recent Additions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <Card className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">Popular Mediums</h3>
                <div className="space-y-4">
                  {report.topMediums.map((medium) => (
                    <div key={medium.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <Palette className="h-4 w-4 text-slate-600" />
                        </div>
                        <span className="text-slate-800 font-medium">{medium.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-slate-800">{medium.count}</div>
                        <div className="text-sm text-slate-500">artworks</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">Recent Additions</h3>
                <div className="space-y-4">
                  {report.recentAdditions.map((addition, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="text-slate-800 font-medium">{addition.title}</div>
                          <div className="text-sm text-slate-500">by {addition.artist}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500">
                          {new Date(addition.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-3">
              No data available
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Add some artworks to your collection to see detailed analytics and reports.
            </p>
            <Button 
              onClick={() => navigate("/inventory/add")}
              variant="outline"
              className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20"
            >
              <Package className="h-4 w-4 mr-2" />
              Add Your First Artwork
            </Button>
          </div>
        )}
      </motion.div>
    </AuroraBackground>
  );
}
