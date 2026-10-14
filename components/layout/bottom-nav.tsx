"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Home, Search, PlusCircle, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  const items = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/search", label: t("cars"), icon: Search },
    { href: "/sell", label: t("sell"), icon: PlusCircle },
    { href: "/favorites", label: t("favorites"), icon: Heart },
    { href: "/login", label: t("account"), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs touch-target",
                isActive ? "text-brand-emerald" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", item.href === "/sell" && "text-brand-gold")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
