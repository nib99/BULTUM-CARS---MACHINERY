import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number, currency = "ETB") {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatMileage(km: number | null | undefined) {
  if (km == null) return "—";
  return new Intl.NumberFormat("en-ET").format(km) + " km";
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateListingSlug(
  make: string,
  model: string,
  city: string,
  id: string
) {
  const shortId = id.slice(0, 8);
  return `${slugify(make)}-${slugify(model)}-${slugify(city)}-${shortId}`;
}
