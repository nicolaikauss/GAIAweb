// @ts-nocheck
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading while verifying payment
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
              className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              Payment Successful!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-lg text-muted-foreground"
            >
              Thank you for subscribing to Art<span className="bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">0</span>. 
              Your subscription is now active and you can start managing your art collection.
            </motion.p>

            {sessionId && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="text-sm text-muted-foreground/70"
              >
                Session ID: {sessionId}
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="gap-2 text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Go to Dashboard
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

export default Success;
