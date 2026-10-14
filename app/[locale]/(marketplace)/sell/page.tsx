"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, HardHat, Tractor, Truck } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/routing";

const categories = [
  { id: "cars", icon: Car, labelKey: "cars" },
  { id: "trucks", icon: Truck, labelKey: "trucks" },
  { id: "heavy_machinery", icon: HardHat, labelKey: "heavy_machinery" },
  { id: "agricultural", icon: Tractor, labelKey: "agricultural" },
];

export default function SellPage() {
  const t = useTranslations("Sell");
  const tCat = useTranslations("Categories");
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("step1")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelected(cat.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-5 transition-all ${
                    selected === cat.id
                      ? "border-brand-emerald bg-brand-emerald/5 ring-2 ring-brand-emerald"
                      : "hover:border-brand-emerald/50"
                  }`}
                >
                  <Icon className="h-8 w-8 text-brand-emerald" />
                  <span className="text-sm font-medium">
                    {tCat(cat.labelKey as any)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Button disabled={!selected} asChild={!!selected}>
              {selected ? (
                <Link href={`/sell/new?category=${selected}`}>{t("continue")}</Link>
              ) : (
                t("continue")
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        You need to be logged in as a seller to publish listings.{" "}
        <Link href="/login" className="text-brand-emerald underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
