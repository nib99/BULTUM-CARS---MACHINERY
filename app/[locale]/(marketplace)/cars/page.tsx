import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ListingCard, type ListingCardData } from "@/components/listings/listing-card";
import { Link } from "@/i18n/routing";

const demoCars: ListingCardData[] = [
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
    id: "5",
    slug: "hyundai-tucson-addis-ababa-q7r8s9t0",
    title: "Hyundai Tucson 2021",
    price: "2800000",
    currency: "ETB",
    location: "Addis Ababa",
    year: 2021,
    mileage: 42000,
    isFeatured: false,
    isVerified: true,
    category: "cars",
    coverImage:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop",
  },
];

export default async function CarsPage({
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
        <h1 className="text-xl font-bold">{t("cars")}</h1>
        <Link href="/search?category=cars" className="text-sm text-brand-emerald">
          Filters →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {demoCars.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
