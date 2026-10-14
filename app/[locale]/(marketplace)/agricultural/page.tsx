import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ListingCard, type ListingCardData } from "@/components/listings/listing-card";
import { Link } from "@/i18n/routing";

const demoAgri: ListingCardData[] = [
  {
    id: "4",
    slug: "john-deere-tractor-amhara-m3n4o5p6",
    title: "John Deere 5075E Tractor",
    price: "1850000",
    currency: "ETB",
    location: "Amhara",
    year: 2021,
    isFeatured: true,
    isVerified: true,
    category: "agricultural",
    coverImage:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
  },
];

export default async function AgriculturalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Categories");

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("agricultural")}</h1>
        <Link href="/search?category=agricultural" className="text-sm text-brand-emerald">
          Filters →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {demoAgri.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
