"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./language-switcher";
import { Button } from "@/components/ui/button";
import { Menu, Search, User } from "lucide-react";
import { useState } from "react";

export function Header() {
  const t = useTranslations("Nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-brand-charcoal text-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">DALALA</span>
          <span className="hidden text-xs text-brand-gold sm:inline">
            Motors & Machinery
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/cars" className="text-sm hover:text-brand-gold">
            {t("cars")}
          </Link>
          <Link href="/machinery" className="text-sm hover:text-brand-gold">
            {t("machinery")}
          </Link>
          <Link href="/agricultural" className="text-sm hover:text-brand-gold">
            {t("agricultural")}
          </Link>
          <Link href="/sell" className="text-sm font-medium text-brand-gold">
            {t("sell")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/favorites" className="hidden sm:block">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-brand-charcoal px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="/cars" onClick={() => setMobileOpen(false)}>
              {t("cars")}
            </Link>
            <Link href="/machinery" onClick={() => setMobileOpen(false)}>
              {t("machinery")}
            </Link>
            <Link href="/agricultural" onClick={() => setMobileOpen(false)}>
              {t("agricultural")}
            </Link>
            <Link href="/sell" onClick={() => setMobileOpen(false)} className="text-brand-gold">
              {t("sell")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
