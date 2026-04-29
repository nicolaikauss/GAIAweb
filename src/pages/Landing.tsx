import { Button } from "@/components/ui/button";
import { AmbientDottedGlobe } from "@/components/ui/ambient-dotted-globe";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { GLSLHills } from "@/components/ui/glsl-hills";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, Compass, Landmark, Mail, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const expertiseItems: Omit<BentoItem, "cta" | "status">[] = [
  {
    title: "Investissement Immobilier",
    subtitle: "REAL ESTATE INVESTMENT",
    description: "Investissements opportunistes et sélectifs dans le résidentiel, l'hôtellerie et le retail prime.",
    meta: "01",
    icon: <Landmark className="h-4 w-4 text-slate-500" />,
    metricValue: "€500M+",
    metricLabel: "Assets Under Management",
    tags: ["Immobilier"],
    colSpan: 1,
  },
  {
    title: "Structuration Financière",
    subtitle: "STRUCTURED FINANCING",
    description: "Solutions de dette sur mesure combinant dette senior, financement mezzanine et equity.",
    meta: "02",
    icon: <Compass className="h-4 w-4 text-slate-500" />,
    metricValue: "50+",
    metricLabel: "Transactions structurées",
    tags: ["Finance"],
    colSpan: 1,
  },
  {
    title: "Transition Énergétique",
    subtitle: "ENERGY TRANSITION",
    description: "Participation active à la rénovation énergétique et la lutte contre la précarité énergétique.",
    meta: "03",
    icon: <ShieldCheck className="h-4 w-4 text-slate-500" />,
    metricValue: "10K+",
    metricLabel: "Logements rénovés",
    tags: ["Impact"],
    colSpan: 1,
  },
];

const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

const primaryButtonClass =
  "h-11 rounded-full border border-white/20 bg-white px-7 text-[#101012] shadow-[0_6px_20px_rgba(0,0,0,0.28)] transition-all duration-200 hover:bg-white/90";
const secondaryButtonClass =
  "h-11 rounded-full border border-slate-300 bg-white/80 px-6 text-slate-800 transition-all duration-200 hover:bg-white";
const surfaceCardClass =
  "group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition-all duration-300 hover:border-slate-300 hover:shadow-[0_16px_42px_rgba(15,23,42,0.1)] md:p-12";

type StatCounterProps = {
  target: number;
  label: string;
  prefix?: string;
  suffix?: string;
  active: boolean;
  durationMs?: number;
};

const StatCounter = ({
  target,
  label,
  prefix = "",
  suffix = "",
  active,
  durationMs = 900,
}: StatCounterProps) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const nextValue = Math.round(target * progress);
      setValue(nextValue);
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [active, target, durationMs]);

  return (
    <div>
      <p className="text-5xl font-semibold tracking-tight text-slate-900 md:text-6xl">
        {prefix}
        {value}
        {suffix}
      </p>
      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
    </div>
  );
};

const SectionTitle = ({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) => (
  <div className="max-w-3xl">
    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
    <h2 className="mt-4 whitespace-pre-line text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">{title}</h2>
    {description ? <p className="mt-5 text-base leading-relaxed text-slate-600 md:text-lg">{description}</p> : null}
  </div>
);

const Landing = () => {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const node = statsRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const currentLang = (i18n.resolvedLanguage ?? i18n.language).toLowerCase().startsWith("fr") ? "fr" : "en";
  const languageLabel = currentLang === "fr" ? "FR | EN" : "EN | FR";

  const toggleLanguage = () => {
    const nextLang = currentLang === "en" ? "fr" : "en";
    i18n.changeLanguage(nextLang);
    document.documentElement.lang = nextLang;
  };

  const writeToUs = () => {
    window.location.href = "mailto:contact@gaia.capital";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(1200px_circle_at_8%_-8%,rgba(255,255,255,0.95),transparent_55%),radial-gradient(1000px_circle_at_100%_0%,rgba(226,232,240,0.72),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(248,250,252,0.4),rgba(248,250,252,0.88))]" />

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-10 md:py-4">
          <a href="#accueil" aria-label="Gaia Capital" className="inline-flex items-center">
            <img src="/gaia-logo-black.png" alt="Gaia Capital" className="h-10 w-auto object-contain opacity-95 sm:h-12 md:h-16" />
          </a>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#expertise" className="transition-colors hover:text-slate-900">
              {t("gaiaLanding.nav.expertise")}
            </a>
            <a href="#a-propos" className="transition-colors hover:text-slate-900">
              {t("gaiaLanding.nav.about")}
            </a>
            <a href="#contact" className="transition-colors hover:text-slate-900">
              {t("gaiaLanding.nav.contact")}
            </a>
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LiquidMetalButton label={languageLabel} onClick={toggleLanguage} size="compact" />
            <LiquidMetalButton label={isMobile ? t("gaiaLanding.nav.contact") : t("gaiaLanding.cta.contact")} onClick={scrollToContact} size="compact" />
          </div>
        </div>
      </header>

      <main id="accueil" className="relative z-10">
        <section className="relative isolate overflow-hidden border-b border-slate-200">
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
            <AmbientDottedGlobe className="right-[-16%] top-[-10%] h-[118%] w-[104%] opacity-95 md:right-[-10%] md:top-[-14%] md:h-[124%] md:w-[98%]" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_72%_40%,rgba(255,255,255,0.38),transparent_42%),radial-gradient(circle_at_center,rgba(248,250,252,0.02),rgba(248,250,252,0.4)_74%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_right,rgba(248,250,252,0.9)_0%,rgba(248,250,252,0.56)_42%,rgba(248,250,252,0.74)_100%)] md:bg-[linear-gradient(to_right,rgba(248,250,252,0.92)_0%,rgba(248,250,252,0.34)_48%,rgba(248,250,252,0.7)_100%)]"
          />
          <div className="mx-auto grid min-h-[62vh] w-full max-w-6xl place-items-start px-4 pb-10 pt-9 sm:px-6 sm:pb-12 sm:pt-12 md:min-h-[68vh] md:px-10 md:pb-14 md:pt-18">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-20 max-w-[92vw] text-left sm:max-w-xl md:max-w-2xl md:pr-10"
          >
            <ShimmerText
              variant="slate"
              duration={1.8}
              delay={1.1}
              className="font-sophisticated text-xl tracking-tight text-slate-900 sm:text-2xl md:text-4xl"
            >
              Shape Tomorrow
            </ShimmerText>
            {currentLang === "fr" ? (
              <h1 className="mt-2 text-[26px] font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-3xl md:text-5xl">
                {t("gaiaLanding.hero.titleLine1")}
                <br className="hidden md:block" /> {t("gaiaLanding.hero.titleLine2")}
              </h1>
            ) : (
              <h1 className="mt-3 max-w-[30ch] text-[20px] font-medium leading-[1.2] tracking-[-0.01em] text-slate-900 sm:mt-4 sm:max-w-[24ch] sm:text-[22px] md:max-w-[21ch] md:text-[40px]">
                {t("gaiaLanding.hero.titleLine1")}
                <span className="mt-2 block text-[13px] font-normal tracking-normal text-slate-700 sm:text-sm md:mt-3 md:text-xl">
                  {t("gaiaLanding.hero.titleLine2")}
                </span>
              </h1>
            )}
            <p className="mt-5 max-w-[36ch] text-[13px] leading-relaxed text-slate-600 sm:mt-6 sm:max-w-xl sm:text-sm md:mt-7 md:text-base">
              {t("gaiaLanding.hero.description")}
            </p>
            <div className="mt-6 flex flex-wrap justify-start gap-3 sm:mt-7 sm:gap-4">
              <Button asChild variant="ghost" className={secondaryButtonClass}>
                <a href="#contact">{t("gaiaLanding.cta.initiate")}</a>
              </Button>
              <Button asChild variant="ghost" className={secondaryButtonClass}>
                <a href="#expertise">
                  {t("gaiaLanding.cta.discover")}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </motion.div>
          </div>
        </section>

        <section id="expertise" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-24">
          <motion.div {...sectionMotion}>
            <div className="max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{t("gaiaLanding.expertise.eyebrow")}</p>
              <motion.h2
                initial={{ opacity: 0, y: -26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 whitespace-pre-line text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl"
              >
                {t("gaiaLanding.expertise.title")}
              </motion.h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600 md:text-lg">{t("gaiaLanding.expertise.description")}</p>
            </div>
            <BentoGrid
              className="mt-12"
              items={expertiseItems.map((item) => ({
                ...item,
                status: item.meta,
                cta: t("gaiaLanding.cta.learnMore"),
              }))}
            />
          </motion.div>
        </section>

        <section id="a-propos" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-24">
          <motion.div
            {...sectionMotion}
            className={`grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-12 ${surfaceCardClass}`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[length:4px_4px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div>
              <SectionTitle
                eyebrow={t("gaiaLanding.about.eyebrow")}
                title={t("gaiaLanding.about.title")}
                description={t("gaiaLanding.about.description")}
              />
            </div>
            <div
              ref={statsRef}
              className="space-y-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 md:space-y-10"
            >
              <StatCounter
                target={15}
                suffix="+"
                label={t("gaiaLanding.about.stats.years")}
                active={statsInView}
              />
              <StatCounter
                target={500}
                prefix="€"
                suffix="M"
                label={t("gaiaLanding.about.stats.assets")}
                active={statsInView}
              />
              <StatCounter
                target={100}
                suffix="%"
                label={t("gaiaLanding.about.stats.capital")}
                active={statsInView}
              />
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                {t("gaiaLanding.about.stats.note")}
              </div>
            </div>
          </motion.div>
        </section>

        <section id="contact" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-24">
          <motion.div
            {...sectionMotion}
            className={`relative isolate overflow-hidden flex flex-col items-center text-center ${surfaceCardClass}`}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-70">
              <GLSLHills width="100%" height="100%" cameraZ={125} planeSize={256} speed={0.5} />
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-white/72" />
            <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[length:4px_4px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-20 max-w-3xl">
              <SectionTitle
                eyebrow={t("gaiaLanding.contact.eyebrow")}
                title={t("gaiaLanding.contact.title")}
                description={t("gaiaLanding.contact.description")}
              />
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-700">
                <p className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  contact@gaia-capital.com
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Paris, France
                </p>
              </div>
            </div>
            <div className="relative z-20">
              <div className="mt-8">
                <LiquidMetalButton label={t("gaiaLanding.cta.bookMeeting")} onClick={writeToUs} />
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 sm:pb-10 md:px-10 md:pb-12">
          <motion.div {...sectionMotion} className="px-1 py-2 text-left">
            <p className="text-[24px] leading-tight tracking-tight text-slate-700 sm:text-[30px] md:text-[36px]">
              We invest with{" "}
              <AnimatedTextCycle
                words={["Discipline", "Precision", "Patience", "Vision"]}
                interval={2600}
                className="text-[30px] font-bold text-slate-900 sm:text-[36px] md:text-[44px]"
              />
              .
            </p>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/75">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-9 md:flex-row md:items-center md:justify-between md:px-10 md:py-10">
          <div className="space-y-2">
            <img src="/gaia-logo-black.png" alt="Gaia Capital" className="h-10 w-auto object-contain opacity-90" />
            <p className="text-sm text-slate-500">Gaia Capital</p>
          </div>
          <div className="flex gap-6 text-sm text-slate-600">
            <a href="#accueil" className="transition-colors hover:text-slate-900">
              {t("gaiaLanding.nav.home")}
            </a>
            <a href="#expertise" className="transition-colors hover:text-slate-900">
              {t("gaiaLanding.nav.expertise")}
            </a>
            <a href="#contact" className="transition-colors hover:text-slate-900">
              {t("gaiaLanding.nav.contact")}
            </a>
          </div>
          <p className="text-sm text-slate-500">{t("gaiaLanding.footer.tagline")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;