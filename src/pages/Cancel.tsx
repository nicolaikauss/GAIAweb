import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const Cancel = () => {
  return (
    <AuroraBackground className="bg-white dark:bg-zinc-900">
      <div className="max-w-2xl mx-auto text-center py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
            >
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              Payment Cancelled
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-lg text-muted-foreground"
            >
              Your payment was cancelled. No charges have been made to your account. 
              You can try again anytime or contact us if you need assistance.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => window.location.href = '/pricing'}
              className="gap-2 text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="gap-2 text-lg px-8 py-6 rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
};

export default Cancel;
