import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { formatPrice, formatMileage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BadgeCheck, MapPin, Phone, MessageCircle, Heart, Eye } from "lucide-react";
import { notFound } from "next/navigation";

// Demo listing – replace with real DB fetch by slug/id
const demoListing = {
  id: "a1b2c3d4",
  slug: "toyota-land-cruiser-addis-ababa-a1b2c3d4",
  title: "Toyota Land Cruiser Prado 2019",
  description:
    "Well-maintained Toyota Land Cruiser Prado. Full service history, leather seats, sunroof, reverse camera. Single owner. Perfect for Ethiopian roads.",
  price: "4500000",
  currency: "ETB",
  location: "Addis Ababa",
  region: "Addis Ababa",
  year: 2019,
  mileage: 85000,
  make: "Toyota",
  model: "Land Cruiser Prado",
  fuelType: "Diesel",
  transmission: "Automatic",
  condition: "Used",
  bodyType: "SUV",
  color: "White",
  seats: 7,
  driveType: "4WD",
  isFeatured: true,
  isVerified: true,
  viewsCount: 342,
  seller: {
    name: "Abebe Motors",
    phone: "+251911234567",
    whatsapp: "+251911234567",
    isDealer: true,
    verificationStatus: "verified",
  },
  images: [
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop",
  ],
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Listing");

  // In production: fetch from DB by slug, increment views, return 404 if not published
  if (!id) notFound();

  const listing = demoListing;

  return (
    <div className="px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gallery + details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {listing.images.map((img, i) => (
              <div
                key={i}
                className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg"
              >
                <Image src={img} alt="" fill className="object-cover" sizes="112px" />
              </div>
            ))}
          </div>

          <div>
            <h1 className="text-xl font-bold md:text-2xl">{listing.title}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {listing.location}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {listing.viewsCount} {t("views")}
              </span>
            </div>
          </div>

          <div>
            <h2 className="mb-2 font-semibold">{t("specs")}</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">{t("year")}</dt>
                <dd className="font-medium">{listing.year}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("mileage")}</dt>
                <dd className="font-medium">{formatMileage(listing.mileage)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("fuel")}</dt>
                <dd className="font-medium">{listing.fuelType}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("transmission")}</dt>
                <dd className="font-medium">{listing.transmission}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("condition")}</dt>
                <dd className="font-medium">{listing.condition}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Drive</dt>
                <dd className="font-medium">{listing.driveType}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="mb-2 font-semibold">{t("description")}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Sidebar – price + contact */}
        <div className="space-y-4">
          <div className="sticky top-20 rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-brand-emerald">
              {formatPrice(listing.price, listing.currency)}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald font-bold">
                {listing.seller.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{listing.seller.name}</p>
                {listing.isVerified && (
                  <span className="flex items-center gap-1 text-xs text-brand-emerald">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {t("verified")}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button className="w-full" size="lg" asChild>
                <a href={`tel:${listing.seller.phone}`}>
                  <Phone className="h-4 w-4" />
                  {t("call")}
                </a>
              </Button>
              <Button variant="outline" className="w-full" size="lg" asChild>
                <a
                  href={`https://wa.me/${listing.seller.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t("whatsapp")}
                </a>
              </Button>
              <Button variant="secondary" className="w-full" size="lg">
                <Heart className="h-4 w-4" />
                {t("save")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
