import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingCard, type ListingCardData } from "@/components/listings/listing-card";
import { Search, Car, Truck, Tractor, HardHat } from "lucide-react";

// Demo data for Phase 1 – replace with real DB queries in production
const featuredListings: ListingCardData[] = [
  {
    id: "1",
    slug: "toyota-land-cruiser-addis-ababa-a1b2c3d4",
    title: "Toyota Land Cruiser Prado 2019",
    price: "4500000",
    currency: "ETB",
    location: "Addis Ababa",
    year: 2019,
    mileage: 85000,
    make: "Toyota",
    model: "Land Cruiser Prado",
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
    make: "Caterpillar",
    model: "320D",
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
    make: "HOWO",
    model: "Dump Truck",
    isFeatured: false,
    isVerified: false,
    category: "trucks",
    coverImage:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop",
  },
  {
    id: "4",
    slug: "john-deere-tractor-amhara-m3n4o5p6",
    title: "John Deere 5075E Tractor",
    price: "1850000",
    currency: "ETB",
    location: "Amhara",
    year: 2021,
    make: "John Deere",
    model: "5075E",
    isFeatured: true,
    isVerified: true,
    category: "agricultural",
    coverImage:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
  },
];

const categories = [
  { href: "/cars", labelKey: "cars", icon: Car },
  { href: "/machinery", labelKey: "heavy_machinery", icon: HardHat },
  { href: "/agricultural", labelKey: "agricultural", icon: Tractor },
  { href: "/cars?type=trucks", labelKey: "trucks", icon: Truck },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("Home");
  const tCat = useTranslations("Categories");
  const tNav = useTranslations("Nav");

  return (
    <div className="space-y-8 pb-8">
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-charcoal to-brand-charcoal/95 px-4 py-10 text-white md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold leading-tight md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm text-white/80 md:text-base">
            {t("subtitle")}
          </p>

          {/* Search box */}
          <form
            action={`/${/* locale injected by Link */ ""}search`}
            className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder={t("searchPlaceholder")}
                className="h-12 border-0 bg-white pl-10 text-brand-charcoal"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 shrink-0">
              {t("searchButton")}
            </Button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.href}
                href={cat.href}
                className="flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">{tCat(cat.labelKey as any)}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("featured")}</h2>
          <Link href="/search" className="text-sm font-medium text-brand-emerald">
            {t("viewAll")} →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
