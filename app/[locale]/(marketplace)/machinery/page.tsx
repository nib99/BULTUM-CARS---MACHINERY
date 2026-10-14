import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ListingCard, type ListingCardData } from "@/components/listings/listing-card";
import { Link } from "@/i18n/routing";

const demoMachinery: ListingCardData[] = [
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
];

export default async function MachineryPage({
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
        <h1 className="text-xl font-bold">{t("heavy_machinery")}</h1>
        <Link href="/search?category=heavy_machinery" className="text-sm text-brand-emerald">
          Filters →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {demoMachinery.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
