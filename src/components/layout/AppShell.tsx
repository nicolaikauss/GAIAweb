/**
 * AppShell Component
 * 
 * Standardized application layout based on the Main Dashboard.
 * Provides consistent chrome (header, background) across all pages.
 * 
 * Usage:
 * <AppShell>
 *   <YourPageContent />
 * </AppShell>
 */

import { ReactNode } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { HowItWorksModal } from "@/components/ui/how-it-works-modal";

interface AppShellProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function AppShell({ children, showHeader = true }: AppShellProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <AuroraBackground>
      <div className="relative z-10 flex min-h-screen w-full flex-col p-4 sm:p-6 lg:p-8 py-6 sm:py-8">
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Art<span className="bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">0</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <HowItWorksModal />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20"
              >
                <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </motion.div>
        )}
        
        {children}
      </div>
    </AuroraBackground>
  );
}
