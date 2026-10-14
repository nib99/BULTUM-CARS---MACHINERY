# DALALA Motors & Machinery

Production-ready Ethiopian Vehicle & Machinery Marketplace SaaS.

**Phases included: 0 (Foundation) + 1 (Core Marketplace) + 2 (Real Media Pipeline)**

## Features

### Foundation & Marketplace
- Next.js 15 (App Router) + TypeScript + Tailwind
- Better Auth (email/password)
- Neon PostgreSQL + Drizzle ORM (full production schema)
- next-intl – English, Afaan Oromoo, አማርኛ, Soomaali
- Mobile-first UI (sticky header + bottom nav)
- Home, Search, Category pages, Listing detail, Sell, Favorites
- Zod validation schemas

### Phase 2 – Real Media Pipeline
- **Multi-step listing wizard** with draft creation & localStorage recovery
- **Camera + Gallery upload** (Android Chrome `capture="environment"`)
- **Direct-to-R2 uploads** via short-lived presigned URLs
- **Multipart upload** for large videos (>20 MB) with per-part retry
- **Progress indicators** (XMLHttpRequest progress events)
- **Server-side verification** (HeadObject) before attaching media to listing
- **Media status tracking** in PostgreSQL
- **Listing gallery** with swipe, thumbnails, video player, fullscreen lightbox
- Image size limit: 15 MB · Video size limit: 500 MB
- Ownership checks on every media key (`listings/{userId}/...`)

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill DATABASE_URL, BETTER_AUTH_SECRET, R2_* credentials

npx drizzle-kit push
npm run dev
```

Open http://localhost:3000/en

### Required R2 setup
1. Create a Cloudflare R2 bucket
2. Create API token with Object Read & Write
3. (Recommended) Attach a custom domain for public URLs
4. Set CORS on the bucket to allow PUT from your domain:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Media upload flow

```
Android camera/gallery
        ↓
Client: request presigned URL (or start multipart)
        ↓
Direct PUT / multipart parts → Cloudflare R2
        ↓
Client: verify object exists (server HeadObject)
        ↓
Server action: attachMediaToListing (ownership check + DB insert)
        ↓
Published listing with responsive gallery + video player
```

## Project structure (key Phase 2 files)

```
lib/
  r2.ts                 # Single + multipart + verify + abort
  upload-client.ts      # Browser upload with progress & retry
  actions/listings.ts   # createDraft, updateDetails, attachMedia, publish
app/api/upload/presign/ # All upload actions (single, multipart, verify)
components/media/
  media-uploader.tsx    # Camera/gallery UI + progress
  listing-gallery.tsx   # Public gallery + video player + lightbox
app/[locale]/(marketplace)/sell/new/  # Multi-step wizard
```

## Next phases

- **Phase 3** – Seller dashboard, inquiries, verification workflow, admin moderation
- **Phase 4** – Featured listings, subscriptions, payment reconciliation
- **Phase 5** – Full SEO (structured data, sitemaps), PWA install + offline
- **Phase 6** – Production hardening, tests, launch checklist

## Security

- Presigned URLs are short-lived and scoped
- Media keys always include `listings/{userId}/` – enforced server-side
- Only authenticated sellers can upload
- Object verified in R2 before DB attachment
- Never expose R2 secrets to the browser

---

Built for the Ethiopian market – mid/low-end Android phones and slow internet.
