"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  listings,
  vehicleSpecs,
  machinerySpecs,
  listingTranslations,
  listingMedia,
  sellerProfiles,
} from "@/db/schema";
import { vehicleListingSchema, machineryListingSchema } from "@/lib/validations/listing";
import { generateListingSlug } from "@/lib/utils";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireSeller() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const role = (session.user as any).role;
  if (!["seller", "dealer", "admin"].includes(role)) {
    // Auto-promote buyer to seller on first listing attempt
    // In production you may require explicit "become a seller" flow
  }
  return session.user;
}

export async function createDraftListing(input: {
  category: "cars" | "trucks" | "heavy_machinery" | "agricultural";
  locale?: string;
}) {
  const user = await requireSeller();

  const [listing] = await db
    .insert(listings)
    .values({
      sellerId: user.id,
      category: input.category,
      status: "draft",
      price: "0",
      location: "Addis Ababa",
      city: "Addis Ababa",
      slug: `draft-${user.id.slice(0, 8)}-${Date.now()}`,
    })
    .returning();

  // Ensure seller profile exists
  const existing = await db.query.sellerProfiles.findFirst({
    where: eq(sellerProfiles.userId, user.id),
  });
  if (!existing) {
    await db.insert(sellerProfiles).values({
      userId: user.id,
      location: "Addis Ababa",
    });
  }

  return { listingId: listing.id };
}

export async function updateListingDetails(
  listingId: string,
  data: Record<string, unknown>
) {
  const user = await requireSeller();

  const listing = await db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.sellerId, user.id)),
  });
  if (!listing) throw new Error("Listing not found or not owned by you");

  const isVehicle = listing.category === "cars" || listing.category === "trucks";
  const schema = isVehicle ? vehicleListingSchema : machineryListingSchema;
  const parsed = schema.safeParse({ ...data, category: listing.category });
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const d = parsed.data as any;

  // Update core listing
  const slug = generateListingSlug(
    d.make || "item",
    d.model || "unknown",
    d.city || "ethiopia",
    listingId
  );

  await db
    .update(listings)
    .set({
      price: String(d.price),
      location: d.location,
      region: d.region || null,
      city: d.city,
      slug,
      updatedAt: new Date(),
    })
    .where(eq(listings.id, listingId));

  // Translation (title + description)
  await db
    .insert(listingTranslations)
    .values({
      listingId,
      locale: "en",
      title: d.title,
      description: d.description || null,
    })
    .onConflictDoUpdate({
      target: [listingTranslations.listingId, listingTranslations.locale],
      set: {
        title: d.title,
        description: d.description || null,
      },
    });

  if (isVehicle) {
    await db
      .insert(vehicleSpecs)
      .values({
        listingId,
        make: d.make,
        model: d.model,
        year: d.year,
        mileage: d.mileage ?? null,
        fuelType: d.fuelType ?? null,
        transmission: d.transmission ?? null,
        bodyType: d.bodyType ?? null,
        condition: d.condition ?? null,
        color: d.color ?? null,
        seats: d.seats ?? null,
        doors: d.doors ?? null,
        driveType: d.driveType ?? null,
      })
      .onConflictDoUpdate({
        target: vehicleSpecs.listingId,
        set: {
          make: d.make,
          model: d.model,
          year: d.year,
          mileage: d.mileage ?? null,
          fuelType: d.fuelType ?? null,
          transmission: d.transmission ?? null,
          bodyType: d.bodyType ?? null,
          condition: d.condition ?? null,
          color: d.color ?? null,
          seats: d.seats ?? null,
          doors: d.doors ?? null,
          driveType: d.driveType ?? null,
        },
      });
  } else {
    await db
      .insert(machinerySpecs)
      .values({
        listingId,
        equipmentType: d.equipmentType,
        make: d.make,
        model: d.model,
        year: d.year ?? null,
        operatingHours: d.operatingHours ?? null,
        capacity: d.capacity ?? null,
        condition: d.condition ?? null,
        power: d.power ?? null,
        weight: d.weight ?? null,
      })
      .onConflictDoUpdate({
        target: machinerySpecs.listingId,
        set: {
          equipmentType: d.equipmentType,
          make: d.make,
          model: d.model,
          year: d.year ?? null,
          operatingHours: d.operatingHours ?? null,
          capacity: d.capacity ?? null,
          condition: d.condition ?? null,
          power: d.power ?? null,
          weight: d.weight ?? null,
        },
      });
  }

  revalidatePath(`/[locale]/sell`);
  return { success: true, slug };
}

export async function attachMediaToListing(input: {
  listingId: string;
  key: string;
  type: "image" | "video";
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  duration?: number;
  order?: number;
}) {
  const user = await requireSeller();

  const listing = await db.query.listings.findFirst({
    where: and(eq(listings.id, input.listingId), eq(listings.sellerId, user.id)),
  });
  if (!listing) throw new Error("Listing not found");

  // Server-side verification: key must belong to this user
  if (!input.key.startsWith(`listings/${user.id}/`)) {
    throw new Error("Invalid media key");
  }

  const [media] = await db
    .insert(listingMedia)
    .values({
      listingId: input.listingId,
      key: input.key,
      type: input.type,
      status: "ready", // in full pipeline: "processing" then job sets "ready"
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      width: input.width,
      height: input.height,
      duration: input.duration,
      order: input.order ?? 0,
    })
    .returning();

  // Set cover if first image
  if (input.type === "image" && !listing.coverImageKey) {
    await db
      .update(listings)
      .set({ coverImageKey: input.key })
      .where(eq(listings.id, input.listingId));
  }

  return { mediaId: media.id };
}

export async function reorderMedia(listingId: string, mediaIds: string[]) {
  const user = await requireSeller();
  const listing = await db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.sellerId, user.id)),
  });
  if (!listing) throw new Error("Listing not found");

  await Promise.all(
    mediaIds.map((id, index) =>
      db
        .update(listingMedia)
        .set({ order: index })
        .where(and(eq(listingMedia.id, id), eq(listingMedia.listingId, listingId)))
    )
  );

  return { success: true };
}

export async function setCoverImage(listingId: string, mediaKey: string) {
  const user = await requireSeller();
  await db
    .update(listings)
    .set({ coverImageKey: mediaKey })
    .where(and(eq(listings.id, listingId), eq(listings.sellerId, user.id)));
  return { success: true };
}

export async function publishListing(listingId: string) {
  const user = await requireSeller();

  const listing = await db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.sellerId, user.id)),
    with: {
      media: true,
      translations: true,
      vehicleSpecs: true,
      machinerySpecs: true,
    },
  });

  if (!listing) throw new Error("Listing not found");

  // Basic publish checks
  const hasTitle = listing.translations?.some((t) => t.title);
  const hasMedia = listing.media?.some((m) => m.status === "ready");
  const hasPrice = Number(listing.price) > 0;

  if (!hasTitle || !hasMedia || !hasPrice) {
    return {
      error: "Listing needs a title, at least one photo/video, and a valid price before publishing.",
    };
  }

  await db
    .update(listings)
    .set({
      status: "pending_review", // or "published" if you skip moderation at start
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(listings.id, listingId));

  revalidatePath(`/[locale]/listings/${listing.slug}`);
  return { success: true, slug: listing.slug };
}

export async function getListingForEdit(listingId: string) {
  const user = await requireSeller();
  const listing = await db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.sellerId, user.id)),
    with: {
      media: true,
      translations: true,
      vehicleSpecs: true,
      machinerySpecs: true,
    },
  });
  return listing;
}
