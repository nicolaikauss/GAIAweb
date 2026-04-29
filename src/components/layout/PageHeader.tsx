/**
 * PageHeader Component
 * 
 * Standardized page header with title, subtitle, back button, and actions.
 * Consistent with Dashboard patterns.
 */

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, backTo, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 sm:mb-8"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {backTo && (
            <Button
              variant="outline"
              onClick={() => navigate(backTo)}
              className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}
