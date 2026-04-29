import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useTranslation } from "react-i18next";

interface MobileNavProps {
  children?: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 tap-target"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <div className="flex flex-col gap-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("common.navigation")}</h2>
              <LanguageToggle />
            </div>
            <div className="flex flex-col gap-4">
              {children}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}