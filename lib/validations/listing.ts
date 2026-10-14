import { z } from "zod";

export const vehicleListingSchema = z.object({
  category: z.enum(["cars", "trucks"]),
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(5000).optional(),
  price: z.coerce.number().positive().max(100_000_000),
  currency: z.literal("ETB").default("ETB"),
  location: z.string().min(2),
  region: z.string().optional(),
  city: z.string().min(2),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1970).max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().int().min(0).optional(),
  fuelType: z.enum(["petrol", "diesel", "electric", "hybrid", "other"]).optional(),
  transmission: z.enum(["automatic", "manual"]).optional(),
  bodyType: z.string().optional(),
  condition: z.enum(["new", "used", "certified"]).optional(),
  color: z.string().optional(),
  seats: z.coerce.number().int().min(1).max(60).optional(),
  doors: z.coerce.number().int().min(2).max(6).optional(),
  driveType: z.enum(["2WD", "4WD", "AWD"]).optional(),
});

export const machineryListingSchema = z.object({
  category: z.enum(["heavy_machinery", "agricultural"]),
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(5000).optional(),
  price: z.coerce.number().positive().max(500_000_000),
  currency: z.literal("ETB").default("ETB"),
  location: z.string().min(2),
  region: z.string().optional(),
  city: z.string().min(2),
  equipmentType: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1970).max(new Date().getFullYear() + 1).optional(),
  operatingHours: z.coerce.number().int().min(0).optional(),
  capacity: z.string().optional(),
  condition: z.enum(["new", "used", "refurbished"]).optional(),
  power: z.string().optional(),
  weight: z.string().optional(),
});

export type VehicleListingInput = z.infer<typeof vehicleListingSchema>;
export type MachineryListingInput = z.infer<typeof machineryListingSchema>;

export const searchFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.enum(["cars", "trucks", "heavy_machinery", "agricultural", "parts"]).optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minYear: z.coerce.number().optional(),
  maxYear: z.coerce.number().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  condition: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  sellerType: z.enum(["all", "verified", "dealer"]).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "featured"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
