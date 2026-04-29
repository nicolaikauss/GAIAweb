import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

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
        className="relative flex flex-col gap-6 items-center justify-center px-4 text-center z-10"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-6xl md:text-9xl font-bold text-foreground/90"
        >
          Gaia Capital
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-xl md:text-3xl text-foreground/80 font-semibold max-w-2xl"
        >
          Gaia Capital - Holding Family
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="text-base md:text-lg text-muted-foreground max-w-xl"
        >
          Manage your collection, track transactions, handle consignments, and generate insightful reports
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="flex gap-4 mt-4"
        >
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="gap-2 text-lg px-8 py-6"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>
    </AuroraBackground>
  );
};

export default Index;
