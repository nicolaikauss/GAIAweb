// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Search, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Artwork } from "@/types";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/ui/language-toggle";

export default function Transactions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [purchases, setPurchases] = useState<Artwork[]>([]);
  const [sales, setSales] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTransactions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks'
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: artworks, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter purchases (artworks with purchase_price - meaning they've been acquired)
      const purchasesList = artworks?.filter(art => art.purchase_price && art.purchase_price > 0) || [];
      setPurchases(purchasesList);

      // Filter sales (artworks with "sold" tag OR sale_date)
      const salesList = artworks?.filter(art => 
        art.tags?.includes("sold") || art.sale_date
      ) || [];
      setSales(salesList);
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

  const getPaymentStatus = (paymentDate: string | null, expectedDate: string | null) => {
    if (paymentDate) return "paid";
    if (!expectedDate) return "paid"; // Default to paid for new purchases
    const today = new Date();
    const expected = new Date(expectedDate);
    return expected < today ? "overdue" : "pending";
  };

  const calculateProfit = (artwork: Artwork) => {
    if (!artwork.price) return 0;
    if (artwork.on_consignment) {
      return artwork.price * (artwork.commission_rate / 100);
    }
    return artwork.price - (artwork.purchase_price || 0);
  };

  const updatePaymentStatus = async (artworkId: string, newStatus: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: any = {};
      
      if (newStatus === "paid") {
        updateData.payment_received_date = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
      } else if (newStatus === "pending") {
        updateData.payment_received_date = null;
      }

      const { error } = await supabase
        .from("artworks")
        .update(updateData)
        .eq("id", artworkId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Payment status updated to ${newStatus}`,
      });

      // Refresh the transactions
      fetchTransactions();
    } catch (error: any) {
      console.error('Status update error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredPurchases = purchases.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.seller_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSales = sales.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const purchasesThisMonth = purchases.filter(p => {
    if (!p.purchase_date) return false;
    const date = new Date(p.purchase_date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const salesThisMonth = sales.filter(s => {
    if (!s.sale_date) return false;
    const date = new Date(s.sale_date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const totalPurchasesAmount = purchasesThisMonth.reduce((sum, p) => sum + (p.purchase_price || 0), 0);
  const totalSalesAmount = salesThisMonth.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalProfit = salesThisMonth.reduce((sum, s) => sum + calculateProfit(s), 0);

  return (
    <AuroraBackground>
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative z-10 w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8 mx-auto"
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
              {t("common.back")}
            </Button>
            <div className="hidden sm:block w-px h-8 bg-slate-200" />
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-2">{t("transactions.title")}</h1>
              <p className="text-sm sm:text-base text-slate-600">
                {t("transactions.subtitle")}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="purchases" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-transparent p-0 gap-4">
            <TabsTrigger value="purchases" className="data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=inactive]:text-slate-500 hover:text-slate-700 transition-colors bg-transparent border-none shadow-none">Purchases</TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=inactive]:text-slate-500 hover:text-slate-700 transition-colors bg-transparent border-none shadow-none">Sales</TabsTrigger>
          </TabsList>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Purchases This Month</p>
                    <p className="text-2xl font-bold text-slate-800">${totalPurchasesAmount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{purchasesThisMonth.length} items</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-yellow-500/10">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {purchases.filter(p => getPaymentStatus(p.payment_received_date, p.purchase_date) !== "paid").length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Average Purchase Price</p>
                    <p className="text-2xl font-bold text-slate-800">
                      ${purchases.length > 0 ? (purchases.reduce((sum, p) => sum + (p.purchase_price || 0), 0) / purchases.length).toFixed(2) : "0.00"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by title, artist, or seller..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-200 hover:text-slate-900 focus:text-slate-900 caret-black"
                />
              </div>
            </div>

            {/* Purchases Table */}
            <Card className="bg-white border border-slate-200 shadow-sm min-h-[600px]">
              {loading ? (
                <div className="p-8 text-center text-slate-600">Loading transactions...</div>
              ) : filteredPurchases.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-600 mb-4">No purchases yet</p>
                  <p className="text-sm text-slate-500">Purchases are automatically created when you add artwork to your inventory.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Date</TableHead>
                        <TableHead className="min-w-[250px]">Artwork</TableHead>
                        <TableHead className="min-w-[150px]">Seller</TableHead>
                        <TableHead className="min-w-[120px]">Amount</TableHead>
                        <TableHead className="min-w-[120px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchases.map((purchase) => (
                        <TableRow
                          key={purchase.id}
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => navigate(`/inventory/${purchase.id}`)}
                        >
                          <TableCell className="text-sm text-slate-900 font-medium">
                            {purchase.purchase_date ? format(new Date(purchase.purchase_date), "MMM dd, yyyy") : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3 min-w-0">
                              {purchase.image_url && (
                                <img
                                  src={purchase.image_url}
                                  alt={purchase.title}
                                  className="w-12 h-12 object-cover rounded flex-shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-800 truncate">{purchase.title}</p>
                                <p className="text-sm text-slate-600 truncate">{purchase.artist}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-900 font-medium truncate">{purchase.seller_name || "N/A"}</TableCell>
                          <TableCell className="font-semibold text-sm text-slate-900">
                            ${purchase.purchase_price?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div className="cursor-pointer">
                                  <Badge
                                    variant={
                                      getPaymentStatus(purchase.payment_received_date, purchase.purchase_date) === "paid"
                                        ? "default"
                                        : getPaymentStatus(purchase.payment_received_date, purchase.purchase_date) === "overdue"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className="text-xs hover:opacity-80 transition-opacity"
                                  >
                                    {getPaymentStatus(purchase.payment_received_date, purchase.purchase_date)}
                                  </Badge>
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  updatePaymentStatus(purchase.id, "paid");
                                }}>
                                  <Badge variant="default" className="text-xs mr-2">paid</Badge>
                                  Mark as Paid
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  updatePaymentStatus(purchase.id, "pending");
                                }}>
                                  <Badge variant="secondary" className="text-xs mr-2">pending</Badge>
                                  Mark as Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  updatePaymentStatus(purchase.id, "overdue");
                                }}>
                                  <Badge variant="destructive" className="text-xs mr-2">overdue</Badge>
                                  Mark as Overdue
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Sales This Month</p>
                    <p className="text-2xl font-bold text-slate-800">${totalSalesAmount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{salesThisMonth.length} items</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-yellow-500/10">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {sales.filter(s => getPaymentStatus(s.payment_received_date, s.sale_date) !== "paid").length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Profit This Month</p>
                    <p className="text-2xl font-bold text-green-600">${totalProfit.toFixed(2)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <TrendingDown className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Average Sale Price</p>
                    <p className="text-2xl font-bold text-slate-800">
                      ${sales.length > 0 ? (sales.reduce((sum, s) => sum + (s.price || 0), 0) / sales.length).toFixed(2) : "0.00"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by title, artist, or buyer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-200 hover:text-slate-900 focus:text-slate-900 caret-black"
                />
              </div>
            </div>

            {/* Sales Table */}
            <Card className="bg-white border border-slate-200 shadow-sm min-h-[600px]">
              {loading ? (
                <div className="p-8 text-center text-slate-600">Loading transactions...</div>
              ) : filteredSales.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-600 mb-4">No sales yet</p>
                  <p className="text-sm text-slate-500">Sales are automatically recorded when you mark artwork as sold.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Date</TableHead>
                        <TableHead className="min-w-[250px]">Artwork</TableHead>
                        <TableHead className="min-w-[150px]">Buyer</TableHead>
                        <TableHead className="min-w-[120px]">Amount</TableHead>
                        <TableHead className="min-w-[120px]">Profit</TableHead>
                        <TableHead className="min-w-[120px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales.map((sale) => {
                        const profit = calculateProfit(sale);
                        return (
                          <TableRow
                            key={sale.id}
                            className="cursor-pointer hover:bg-slate-50"
                            onClick={() => navigate(`/inventory/${sale.id}`)}
                          >
                            <TableCell className="text-sm text-slate-900 font-medium">
                              {sale.sale_date ? format(new Date(sale.sale_date), "MMM dd, yyyy") : "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3 min-w-0">
                                {sale.image_url && (
                                  <img
                                    src={sale.image_url}
                                    alt={sale.title}
                                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-slate-800 truncate">{sale.title}</p>
                                  <p className="text-sm text-slate-600 truncate">{sale.artist}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-900 font-medium truncate">{sale.buyer_name || "N/A"}</TableCell>
                            <TableCell className="font-semibold text-sm text-slate-900">
                              ${sale.price?.toFixed(2) || "0.00"}
                            </TableCell>
                            <TableCell>
                              <span className={`text-sm font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                ${profit.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <div className="cursor-pointer">
                                    <Badge
                                      variant={
                                        getPaymentStatus(sale.payment_received_date, sale.sale_date) === "paid"
                                          ? "default"
                                          : getPaymentStatus(sale.payment_received_date, sale.sale_date) === "overdue"
                                          ? "destructive"
                                          : "secondary"
                                      }
                                      className="text-xs hover:opacity-80 transition-opacity"
                                    >
                                      {getPaymentStatus(sale.payment_received_date, sale.sale_date)}
                                    </Badge>
                                  </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    updatePaymentStatus(sale.id, "paid");
                                  }}>
                                    <Badge variant="default" className="text-xs mr-2">paid</Badge>
                                    Mark as Paid
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    updatePaymentStatus(sale.id, "pending");
                                  }}>
                                    <Badge variant="secondary" className="text-xs mr-2">pending</Badge>
                                    Mark as Pending
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    updatePaymentStatus(sale.id, "overdue");
                                  }}>
                                    <Badge variant="destructive" className="text-xs mr-2">overdue</Badge>
                                    Mark as Overdue
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AuroraBackground>
  );
}
