import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/ui/language-toggle";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageToggle />
      </div>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">{t("notFound.title")}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("notFound.subtitle")}</p>
        <a href="/" className="text-primary underline hover:text-primary/80 transition-colors">
          {t("notFound.backHome")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
