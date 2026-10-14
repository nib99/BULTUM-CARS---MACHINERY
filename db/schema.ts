import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  pgEnum,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ========== ENUMS ==========
export const userRoleEnum = pgEnum("user_role", [
  "buyer",
  "seller",
  "dealer",
  "admin",
]);

export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "pending_review",
  "published",
  "sold",
  "expired",
  "rejected",
  "archived",
]);

export const listingCategoryEnum = pgEnum("listing_category", [
  "cars",
  "trucks",
  "heavy_machinery",
  "agricultural",
  "parts",
]);

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

export const mediaStatusEnum = pgEnum("media_status", [
  "uploading",
  "processing",
  "ready",
  "failed",
  "rejected",
]);

export const sellerVerificationEnum = pgEnum("seller_verification", [
  "unverified",
  "pending",
  "verified",
  "rejected",
]);

// ========== USERS ==========
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    role: userRoleEnum("role").default("buyer").notNull(),
    preferredLocale: text("preferred_locale").default("en").notNull(),
    phone: text("phone"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
  ]
);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========== SELLER PROFILES ==========
export const sellerProfiles = pgTable(
  "seller_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    businessName: text("business_name"),
    description: text("description"),
    verificationStatus: sellerVerificationEnum("verification_status")
      .default("unverified")
      .notNull(),
    verificationDocuments: jsonb("verification_documents"),
    logo: text("logo"),
    location: text("location"),
    region: text("region"),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    isDealer: boolean("is_dealer").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("seller_profiles_user_idx").on(table.userId),
    index("seller_profiles_verification_idx").on(table.verificationStatus),
  ]
);

// ========== LISTINGS ==========
export const listings = pgTable(
  "listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: listingCategoryEnum("category").notNull(),
    status: listingStatusEnum("status").default("draft").notNull(),
    price: decimal("price", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").default("ETB").notNull(),
    location: text("location").notNull(),
    region: text("region"),
    city: text("city"),
    isFeatured: boolean("is_featured").default(false).notNull(),
    featuredUntil: timestamp("featured_until"),
    viewsCount: integer("views_count").default(0).notNull(),
    slug: text("slug").notNull(),
    coverImageKey: text("cover_image_key"),
    publishedAt: timestamp("published_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("listings_seller_idx").on(table.sellerId),
    index("listings_category_idx").on(table.category),
    index("listings_status_idx").on(table.status),
    index("listings_price_idx").on(table.price),
    index("listings_location_idx").on(table.location),
    index("listings_featured_idx").on(table.isFeatured),
    uniqueIndex("listings_slug_idx").on(table.slug),
  ]
);

// ========== VEHICLE SPECS ==========
export const vehicleSpecs = pgTable("vehicle_specs", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" })
    .unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage"),
  fuelType: text("fuel_type"),
  transmission: text("transmission"),
  bodyType: text("body_type"),
  engineSize: text("engine_size"),
  color: text("color"),
  condition: text("condition"),
  seats: integer("seats"),
  doors: integer("doors"),
  driveType: text("drive_type"),
  extraSpecs: jsonb("extra_specs"),
});

// ========== MACHINERY SPECS ==========
export const machinerySpecs = pgTable("machinery_specs", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" })
    .unique(),
  equipmentType: text("equipment_type").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  operatingHours: integer("operating_hours"),
  capacity: text("capacity"),
  condition: text("condition"),
  power: text("power"),
  weight: text("weight"),
  extraSpecs: jsonb("extra_specs"),
});

// ========== LISTING TRANSLATIONS ==========
export const listingTranslations = pgTable(
  "listing_translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    title: text("title").notNull(),
    description: text("description"),
  },
  (table) => [
    uniqueIndex("listing_translations_unique").on(table.listingId, table.locale),
  ]
);

// ========== LISTING MEDIA ==========
export const listingMedia = pgTable(
  "listing_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    type: mediaTypeEnum("type").notNull(),
    status: mediaStatusEnum("status").default("uploading").notNull(),
    order: integer("order").default(0).notNull(),
    width: integer("width"),
    height: integer("height"),
    duration: integer("duration"),
    sizeBytes: integer("size_bytes"),
    mimeType: text("mime_type"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("listing_media_listing_idx").on(table.listingId),
    index("listing_media_status_idx").on(table.status),
  ]
);

// ========== FAVORITES ==========
export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("favorites_unique").on(table.userId, table.listingId),
  ]
);

// ========== INQUIRIES ==========
export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    phone: text("phone"),
    status: text("status").default("new").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("inquiries_listing_idx").on(table.listingId),
    index("inquiries_seller_idx").on(table.sellerId),
  ]
);

// ========== REPORTS ==========
export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id").references(() => listings.id, {
    onDelete: "set null",
  }),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ========== SUBSCRIPTIONS ==========
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(),
  status: text("status").default("active").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ========== PAYMENTS ==========
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("ETB").notNull(),
  method: text("method"),
  reference: text("reference"),
  status: text("status").default("pending").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ========== AUDIT LOGS ==========
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: text("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    metadata: jsonb("metadata"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("audit_logs_actor_idx").on(table.actorId)]
);

// ========== RELATIONS ==========
export const usersRelations = relations(users, ({ one, many }) => ({
  sellerProfile: one(sellerProfiles, {
    fields: [users.id],
    references: [sellerProfiles.userId],
  }),
  listings: many(listings),
  favorites: many(favorites),
}));

export const sellerProfilesRelations = relations(sellerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [sellerProfiles.userId],
    references: [users.id],
  }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, {
    fields: [listings.sellerId],
    references: [users.id],
  }),
  vehicleSpecs: one(vehicleSpecs, {
    fields: [listings.id],
    references: [vehicleSpecs.listingId],
  }),
  machinerySpecs: one(machinerySpecs, {
    fields: [listings.id],
    references: [machinerySpecs.listingId],
  }),
  translations: many(listingTranslations),
  media: many(listingMedia),
}));

export const vehicleSpecsRelations = relations(vehicleSpecs, ({ one }) => ({
  listing: one(listings, {
    fields: [vehicleSpecs.listingId],
    references: [listings.id],
  }),
}));

export const machinerySpecsRelations = relations(machinerySpecs, ({ one }) => ({
  listing: one(listings, {
    fields: [machinerySpecs.listingId],
    references: [listings.id],
  }),
}));

export const listingTranslationsRelations = relations(
  listingTranslations,
  ({ one }) => ({
    listing: one(listings, {
      fields: [listingTranslations.listingId],
      references: [listings.id],
    }),
  })
);

export const listingMediaRelations = relations(listingMedia, ({ one }) => ({
  listing: one(listings, {
    fields: [listingMedia.listingId],
    references: [listings.id],
  }),
}));
