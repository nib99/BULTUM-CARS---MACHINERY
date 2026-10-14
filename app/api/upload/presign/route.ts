import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createPresignedUploadUrl,
  createMultipartUpload,
  createPresignedPartUrl,
  completeMultipartUpload,
  abortMultipartUpload,
  verifyObjectExists,
  MULTIPART_THRESHOLD,
} from "@/lib/r2";
import { z } from "zod";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15 MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action || "single";

    // --- Single upload (images & small videos) ---
    if (action === "single") {
      const contentType = body.contentType as string;
      const fileName = body.fileName as string;
      const fileSize = Number(body.fileSize);
      const listingId = body.listingId as string | undefined;

      if (!contentType || !fileName || !fileSize) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }
      if (!ALLOWED_TYPES.includes(contentType)) {
        return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
      }

      const isVideo = contentType.startsWith("video/");
      if (isVideo && fileSize > MAX_VIDEO_SIZE) {
        return NextResponse.json({ error: "Video too large (max 500 MB)" }, { status: 400 });
      }
      if (!isVideo && fileSize > MAX_IMAGE_SIZE) {
        return NextResponse.json({ error: "Image too large (max 15 MB)" }, { status: 400 });
      }

      if (fileSize > MULTIPART_THRESHOLD) {
        return NextResponse.json(
          { error: "File too large for single upload. Use multipart.", useMultipart: true },
          { status: 400 }
        );
      }

      const ext = fileName.split(".").pop()?.toLowerCase() || "bin";
      const key = `listings/${session.user.id}/${listingId || "draft"}/${randomUUID()}.${ext}`;
      const uploadUrl = await createPresignedUploadUrl(key, contentType, 3600);

      return NextResponse.json({
        uploadUrl,
        key,
        publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
        method: "PUT",
      });
    }

    // --- Start multipart ---
    if (action === "start-multipart") {
      const contentType = body.contentType as string;
      const fileName = body.fileName as string;
      const fileSize = Number(body.fileSize);
      const listingId = body.listingId as string | undefined;

      if (!ALLOWED_TYPES.includes(contentType) || !contentType.startsWith("video/")) {
        return NextResponse.json({ error: "Multipart only for videos" }, { status: 400 });
      }
      if (fileSize > MAX_VIDEO_SIZE) {
        return NextResponse.json({ error: "Video too large (max 500 MB)" }, { status: 400 });
      }

      const ext = fileName.split(".").pop()?.toLowerCase() || "mp4";
      const key = `listings/${session.user.id}/${listingId || "draft"}/${randomUUID()}.${ext}`;
      const { uploadId } = await createMultipartUpload(key, contentType);

      return NextResponse.json({ key, uploadId });
    }

    // --- Get part URL ---
    if (action === "part") {
      if (!body.key?.startsWith(`listings/${session.user.id}/`)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const url = await createPresignedPartUrl(body.key, body.uploadId, body.partNumber);
      return NextResponse.json({ url });
    }

    // --- Complete multipart ---
    if (action === "complete-multipart") {
      if (!body.key?.startsWith(`listings/${session.user.id}/`)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await completeMultipartUpload(body.key, body.uploadId, body.parts);
      return NextResponse.json({
        key: body.key,
        publicUrl: `${process.env.R2_PUBLIC_URL}/${body.key}`,
      });
    }

    // --- Abort multipart ---
    if (action === "abort-multipart") {
      if (!body.key?.startsWith(`listings/${session.user.id}/`)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await abortMultipartUpload(body.key, body.uploadId);
      return NextResponse.json({ ok: true });
    }

    // --- Verify object exists ---
    if (action === "verify") {
      if (!body.key?.startsWith(`listings/${session.user.id}/`)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const result = await verifyObjectExists(body.key);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
