import Image from "next/image";
import { Link } from "@/i18n/routing";
import { formatPrice, formatMileage } from "@/lib/utils";
import { BadgeCheck, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type ListingCardData = {
  id: string;
  slug: string;
  title: string;
  price: string;
  currency: string;
  location: string;
  coverImage?: string | null;
  year?: number | null;
  mileage?: number | null;
  make?: string | null;
  model?: string | null;
  isFeatured?: boolean;
  isVerified?: boolean;
  category: string;
};

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const imageUrl =
    listing.coverImage ||
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop";

  return (
    <Link href={`/listings/${listing.slug}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] bg-muted">
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {listing.isFeatured && (
            <span className="absolute left-2 top-2 rounded bg-brand-gold px-2 py-0.5 text-xs font-semibold text-brand-charcoal">
              Featured
            </span>
          )}
        </div>
        <CardContent className="space-y-1.5 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
              {listing.title}
            </h3>
          </div>
          <p className="text-lg font-bold text-brand-emerald">
            {formatPrice(listing.price, listing.currency)}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {listing.year && <span>{listing.year}</span>}
            {listing.mileage != null && <span>{formatMileage(listing.mileage)}</span>}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{listing.location}</span>
            {listing.isVerified && (
              <BadgeCheck className="ml-1 h-3.5 w-3.5 text-brand-emerald" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
