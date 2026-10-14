"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function SearchFilters() {
  const t = useTranslations("Search");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    make: searchParams.get("make") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minYear: searchParams.get("minYear") || "",
    maxYear: searchParams.get("maxYear") || "",
    fuelType: searchParams.get("fuelType") || "",
    transmission: searchParams.get("transmission") || "",
    condition: searchParams.get("condition") || "",
    region: searchParams.get("region") || "",
  });

  function apply() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  function clear() {
    setFilters({
      make: "",
      minPrice: "",
      maxPrice: "",
      minYear: "",
      maxYear: "",
      fuelType: "",
      transmission: "",
      condition: "",
      region: "",
    });
    router.push(pathname);
  }

  return (
    <div className="space-y-4 rounded-xl border bg-white p-4">
      <h3 className="font-semibold">{t("filters")}</h3>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium">{t("make")}</label>
          <Input
            value={filters.make}
            onChange={(e) => setFilters({ ...filters, make: e.target.value })}
            placeholder="Toyota, Caterpillar…"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium">{t("minPrice")}</label>
            <Input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">{t("maxPrice")}</label>
            <Input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="10000000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium">{t("minYear")}</label>
            <Input
              type="number"
              value={filters.minYear}
              onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
              placeholder="2010"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">{t("maxYear")}</label>
            <Input
              type="number"
              value={filters.maxYear}
              onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })}
              placeholder="2025"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">{t("region")}</label>
          <Input
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            placeholder="Addis Ababa, Oromia…"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={apply} className="flex-1">
          {t("apply")}
        </Button>
        <Button variant="outline" onClick={clear}>
          {t("clear")}
        </Button>
      </div>
    </div>
  );
}
