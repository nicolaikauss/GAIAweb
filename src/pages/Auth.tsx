import { LightBackground } from "@/components/ui/light-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/ui/language-toggle";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [_user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        navigate("/dashboard");
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
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

  return (
    <LightBackground>
      <div className="min-h-dvh flex flex-col items-center justify-center mobile-container safe-top safe-bottom">
        {/* Language Toggle */}
        <div className="absolute top-4 right-4 z-30">
          <LanguageToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-8 text-center">
            <h1 className="text-responsive-h1 font-bold mb-2 text-gray-900 break-words">
              Art<span className="bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent animate-pulse">0</span>
            </h1>
            <p className="text-mobile-base text-gray-700 font-medium break-words">
              {t("auth.subtitle")}
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-card border-border shadow-lg tap-target">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold text-sm mb-1.5 block">
                  {t("auth.email")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-900 w-full min-w-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-semibold text-sm mb-1.5 block">
                  {t("auth.password")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-slate-50 border-slate-200 text-slate-900 w-full min-w-0"
                />
              </div>

              <Button type="submit" className="w-full tap-target px-6 py-3 bg-black text-white rounded-lg hover:opacity-90 transition" disabled={loading}>
                {loading ? t("common.loading") : t("auth.signIn")}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </LightBackground>
  );
}
