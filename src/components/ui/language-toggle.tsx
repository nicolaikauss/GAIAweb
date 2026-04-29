import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const getNormalizedLang = (lang?: string) => (lang?.toLowerCase().startsWith('fr') ? 'fr' : 'en');
  const [currentLang, setCurrentLang] = useState(getNormalizedLang(i18n.resolvedLanguage ?? i18n.language));

  useEffect(() => {
    setCurrentLang(getNormalizedLang(i18n.resolvedLanguage ?? i18n.language));
  }, [i18n.language, i18n.resolvedLanguage]);

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    
    // Update document language attribute
    document.documentElement.lang = newLang;
    
    // Update document title
    document.title = newLang === 'en'
      ? 'Gaia Capital Dashboard'
      : 'Tableau de Bord Gaia Capital';
  };

  const getDisplayText = () => {
    return currentLang === 'en' ? 'EN | FR' : 'FR | EN';
  };

  const getTooltipText = () => {
    return currentLang === 'en' ? 'Switch to Français' : 'Switch to English';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="rounded-full border-white/60 bg-white/95 px-4 shadow-[0_6px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-200 hover:bg-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.45)] focus:ring-2 focus:ring-white/80 focus:outline-none"
            aria-label={getTooltipText()}
          >
            <span className="text-xs font-semibold tracking-wide text-slate-950">
              {getDisplayText()}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-600">
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
