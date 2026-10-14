import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ListingCard, type ListingCardData } from "@/components/listings/listing-card";
import { SearchFilters } from "@/components/search/search-filters";

// Demo results – replace with real DB query using searchFiltersSchema
const demoResults: ListingCardData[] = [
  {
    id: "1",
    slug: "toyota-land-cruiser-addis-ababa-a1b2c3d4",
    title: "Toyota Land Cruiser Prado 2019",
    price: "4500000",
    currency: "ETB",
    location: "Addis Ababa",
    year: 2019,
    mileage: 85000,
    isFeatured: true,
    isVerified: true,
    category: "cars",
    coverImage:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=400&fit=crop",
  },
  {
    id: "2",
    slug: "caterpillar-320d-excavator-oromia-e5f6g7h8",
    title: "Caterpillar 320D Hydraulic Excavator",
    price: "8500000",
    currency: "ETB",
    location: "Oromia",
    year: 2018,
    isFeatured: true,
    isVerified: true,
    category: "heavy_machinery",
    coverImage:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop",
  },
  {
    id: "3",
    slug: "howo-dump-truck-addis-ababa-i9j0k1l2",
    title: "HOWO Dump Truck 371HP 6x4",
    price: "3200000",
    currency: "ETB",
    location: "Addis Ababa",
    year: 2020,
    mileage: 120000,
    isFeatured: false,
    isVerified: false,
    category: "trucks",
    coverImage:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop",
  },
];

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Search");
  const sp = await searchParams;

  // In production: parse with searchFiltersSchema, query Neon with filters + pagination

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-64">
        <SearchFilters />
      </aside>
      <div className="flex-1">
        <p className="mb-4 text-sm text-muted-foreground">
          {t("results", { count: demoResults.length })}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {demoResults.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
}
