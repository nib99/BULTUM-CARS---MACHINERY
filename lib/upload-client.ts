/**
 * Client-side upload helpers for Android Chrome camera/gallery
 * Supports single PUT and multipart with automatic retry of failed parts.
 */

import { MULTIPART_PART_SIZE, MULTIPART_THRESHOLD } from "./r2";

export type UploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

export type UploadResult = {
  key: string;
  publicUrl: string;
  type: "image" | "video";
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  duration?: number;
};

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

async function getVideoMeta(
  file: File
): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Math.round(video.duration),
      });
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      resolve({ width: 0, height: 0, duration: 0 });
      URL.revokeObjectURL(url);
    };
    video.src = url;
  });
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status < 500) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastError = e as Error;
    }
    // Exponential backoff
    await new Promise((r) => setTimeout(r, 500 * Math.pow(2, i)));
  }
  throw lastError || new Error("Upload failed after retries");
}

/** Upload a single file (image or small video) with progress + retry */
export async function uploadFile(
  file: File,
  listingId: string | undefined,
  onProgress?: (p: UploadProgress) => void
): Promise<UploadResult> {
  const isVideo = file.type.startsWith("video/");
  const type = isVideo ? "video" : "image";

  // Get dimensions
  let width = 0;
  let height = 0;
  let duration = 0;
  if (isVideo) {
    const meta = await getVideoMeta(file);
    width = meta.width;
    height = meta.height;
    duration = meta.duration;
  } else {
    const dims = await getImageDimensions(file);
    width = dims.width;
    height = dims.height;
  }

  // Use multipart for large videos
  if (isVideo && file.size > MULTIPART_THRESHOLD) {
    return uploadMultipart(file, listingId, onProgress, { width, height, duration });
  }

  // Single PUT
  const presignRes = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "single",
      contentType: file.type,
      fileName: file.name,
      fileSize: file.size,
      listingId,
    }),
  });

  if (!presignRes.ok) {
    const err = await presignRes.json();
    if (err.useMultipart) {
      return uploadMultipart(file, listingId, onProgress, { width, height, duration });
    }
    throw new Error(err.error || "Failed to get upload URL");
  }

  const { uploadUrl, key, publicUrl } = await presignRes.json();

  // Upload with XMLHttpRequest for progress events (works better on mobile)
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));
    xhr.timeout = 5 * 60 * 1000; // 5 min
    xhr.send(file);
  });

  // Server-side verify
  const verifyRes = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "verify", key }),
  });
  const verified = await verifyRes.json();
  if (!verified.exists) {
    throw new Error("Upload verification failed");
  }

  return {
    key,
    publicUrl,
    type,
    mimeType: file.type,
    sizeBytes: file.size,
    width: width || undefined,
    height: height || undefined,
    duration: duration || undefined,
  };
}

/** Multipart upload with per-part retry */
async function uploadMultipart(
  file: File,
  listingId: string | undefined,
  onProgress?: (p: UploadProgress) => void,
  meta?: { width: number; height: number; duration: number }
): Promise<UploadResult> {
  // Start
  const startRes = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "start-multipart",
      contentType: file.type,
      fileName: file.name,
      fileSize: file.size,
      listingId,
    }),
  });
  if (!startRes.ok) {
    const err = await startRes.json();
    throw new Error(err.error || "Failed to start multipart");
  }
  const { key, uploadId } = await startRes.json();

  const partSize = MULTIPART_PART_SIZE;
  const totalParts = Math.ceil(file.size / partSize);
  const parts: { ETag: string; PartNumber: number }[] = [];
  let uploadedBytes = 0;

  try {
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * partSize;
      const end = Math.min(start + partSize, file.size);
      const blob = file.slice(start, end);

      // Get presigned URL for this part
      const partRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "part",
          key,
          uploadId,
          partNumber,
        }),
      });
      if (!partRes.ok) throw new Error("Failed to get part URL");
      const { url } = await partRes.json();

      // Upload part with retry
      const partUploadRes = await fetchWithRetry(url, {
        method: "PUT",
        body: blob,
      });

      const etag = partUploadRes.headers.get("ETag") || `"part-${partNumber}"`;
      parts.push({ ETag: etag.replace(/"/g, ""), PartNumber: partNumber });

      uploadedBytes += blob.size;
      if (onProgress) {
        onProgress({
          loaded: uploadedBytes,
          total: file.size,
          percent: Math.round((uploadedBytes / file.size) * 100),
        });
      }
    }

    // Complete
    const completeRes = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "complete-multipart",
        key,
        uploadId,
        parts,
      }),
    });
    if (!completeRes.ok) throw new Error("Failed to complete multipart");
    const { publicUrl } = await completeRes.json();

    return {
      key,
      publicUrl,
      type: "video",
      mimeType: file.type,
      sizeBytes: file.size,
      width: meta?.width,
      height: meta?.height,
      duration: meta?.duration,
    };
  } catch (err) {
    // Abort on failure
    await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "abort-multipart", key, uploadId }),
    }).catch(() => {});
    throw err;
  }
}
