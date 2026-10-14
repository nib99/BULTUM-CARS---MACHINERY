"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const locales = [
  { code: "en", label: "EN" },
  { code: "om", label: "OM" },
  { code: "am", label: "አማ" },
  { code: "so", label: "SO" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-white/80 p-1 text-sm">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={cn(
            "rounded-md px-2.5 py-1.5 font-medium transition-colors touch-target",
            locale === l.code
              ? "bg-brand-emerald text-white"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
