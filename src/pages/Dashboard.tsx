import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Palette, Receipt, Package, BarChart3, Sparkles, Loader2 } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ShineBorder } from "@/components/ui/shine-border";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { HowItWorksModal } from "@/components/ui/how-it-works-modal";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isFrench = (i18n.resolvedLanguage ?? i18n.language).toLowerCase().startsWith("fr");
    document.title = isFrench ? "Tableau de Bord Gaia Capital" : "Gaia Capital Dashboard";
  }, [i18n.language, i18n.resolvedLanguage]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsLoading(true);
    setAiResponse("");

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { query: aiQuery }
      });

      if (error) throw error;

      setAiResponse(data.response);

      // Handle export all command
      if (data.data?.artworks && aiQuery.toLowerCase().includes('export')) {
        // Generate PDFs for all artworks
        const artworks = data.data.artworks;
        
        toast({
          title: "Exporting artworks...",
          description: `Preparing ${artworks.length} PDFs`,
        });

        // Create a PDF for each artwork
        for (const artwork of artworks) {
          const doc = new jsPDF();
          const pageWidth = doc.internal.pageSize.getWidth();
          let yPosition = 20;

          doc.setFontSize(24);
          doc.setFont("helvetica", "bold");
          doc.text("Artwork Details", pageWidth / 2, yPosition, { align: "center" });
          yPosition += 15;

          doc.setFontSize(18);
          doc.text(artwork.title, 20, yPosition);
          yPosition += 10;
          doc.setFontSize(14);
          doc.setFont("helvetica", "normal");
          doc.text(`by ${artwork.artist}`, 20, yPosition);
          yPosition += 15;

          if (artwork.description) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Description:", 20, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const descLines = doc.splitTextToSize(artwork.description, pageWidth - 40);
            doc.text(descLines, 20, yPosition);
            yPosition += descLines.length * 7 + 8;
          }

          doc.setFont("helvetica", "bold");
          doc.text("Details:", 20, yPosition);
          yPosition += 7;
          doc.setFont("helvetica", "normal");

          if (artwork.year) {
            doc.text(`Year: ${artwork.year}`, 20, yPosition);
            yPosition += 7;
          }
          if (artwork.medium) {
            doc.text(`Medium: ${artwork.medium}`, 20, yPosition);
            yPosition += 7;
          }
          if (artwork.dimensions) {
            doc.text(`Dimensions: ${artwork.dimensions}`, 20, yPosition);
            yPosition += 7;
          }
          if (artwork.price) {
            doc.text(`Price: $${artwork.price.toLocaleString()}`, 20, yPosition);
            yPosition += 7;
          }

          doc.save(`${artwork.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.pdf`);
        }

        toast({
          title: "Export Complete",
          description: `${artworks.length} PDFs exported successfully`,
        });
      }
    } catch (error: any) {
      console.error('AI query error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process query",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cards = [
    {
      title: t("dashboard.cards.inventory.title"),
      icon: Palette,
      href: "/inventory",
      description: t("dashboard.cards.inventory.description"),
    },
    {
      title: t("dashboard.cards.transactions.title"),
      icon: Receipt,
      href: "/transactions",
      description: t("dashboard.cards.transactions.description"),
    },
    {
      title: t("dashboard.cards.consignments.title"),
      icon: Package,
      href: "/consignments",
      description: t("dashboard.cards.consignments.description"),
    },
    {
      title: t("dashboard.cards.reports.title"),
      icon: BarChart3,
      href: "/reports",
      description: t("dashboard.cards.reports.description"),
    },
  ];

  return (
    <AuroraBackground>
      <div className="relative z-10 flex min-h-dvh w-full flex-col mobile-container py-6 sm:py-8 safe-top safe-bottom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Gaia Capital</h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <LanguageToggle />
            <HowItWorksModal />
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20"
            >
              <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t("dashboard.logout")}</span>
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="mx-auto w-full max-w-6xl flex-1 flex flex-col justify-center pb-8 no-scroll-x">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 sm:mb-8 lg:mb-12 text-center"
          >
            <h1 className="mb-4 text-responsive-h1 font-bold leading-tight break-words" data-testid="dashboard-title">
              <span className="italic font-sophisticated text-responsive-h2 tracking-wide font-bold">Gaia Capital Dashboard</span>
            </h1>
            <p className="text-mobile-base text-muted-foreground max-w-3xl mx-auto break-words">
              {t("dashboard.subtitle")}
            </p>
          </motion.div>

          {/* AI Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6 sm:mb-8 lg:mb-12"
          >
            <form onSubmit={handleAiQuery} className="relative max-w-3xl mx-auto">
              <div className="relative">
                <Sparkles className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                <Input
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder={t("dashboard.aiPlaceholder")}
                  className="pl-10 sm:pl-12 pr-20 sm:pr-24 h-12 sm:h-14 text-mobile-sm bg-white/80 backdrop-blur-md border-white/40 rounded-full shadow-lg tap-target min-w-0"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-xs sm:text-sm">{t("dashboard.aiButton")}</span>
                  )}
                </Button>
              </div>
            </form>
            
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 max-w-3xl mx-auto p-4 sm:p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <p className="text-mobile-sm text-slate-700 whitespace-pre-wrap break-words">{aiResponse}</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Cards Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid-mobile lg:grid-cols-4"
          >
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <Link to={card.href}>
                  <ShineBorder
                    borderWidth={2}
                    className="group h-full cursor-pointer transition-all hover:scale-105 active:scale-95 tap-target"
                    color={["#a1a1aa", "#71717a", "#52525b"]}
                  >
                    <div className="flex h-full min-h-[160px] sm:min-h-[180px] flex-col items-start justify-between p-4 sm:p-6 min-w-0">
                      <card.icon className="mb-3 sm:mb-4 h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 sm:mb-2 text-mobile-lg font-semibold break-words">{card.title}</h3>
                        <p className="text-mobile-xs text-muted-foreground break-words">{card.description}</p>
                      </div>
                    </div>
                  </ShineBorder>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}
