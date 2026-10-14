import {
  S3Client,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

/** Single-file presigned PUT (images & small videos) */
export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

/** Start multipart upload for large videos */
export async function createMultipartUpload(key: string, contentType: string) {
  const command = new CreateMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const result = await r2.send(command);
  return {
    uploadId: result.UploadId!,
    key,
  };
}

/** Presigned URL for a single part */
export async function createPresignedPartUrl(
  key: string,
  uploadId: string,
  partNumber: number,
  expiresIn = 3600
) {
  const command = new UploadPartCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

/** Complete multipart upload */
export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { ETag: string; PartNumber: number }[]
) {
  const command = new CompleteMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
    },
  });
  return r2.send(command);
}

/** Abort failed multipart */
export async function abortMultipartUpload(key: string, uploadId: string) {
  const command = new AbortMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
  });
  return r2.send(command);
}

/** Verify object exists in R2 (server-side check before attaching to listing) */
export async function verifyObjectExists(key: string) {
  try {
    const command = new HeadObjectCommand({ Bucket: BUCKET, Key: key });
    const result = await r2.send(command);
    return {
      exists: true,
      size: result.ContentLength,
      contentType: result.ContentType,
    };
  } catch {
    return { exists: false };
  }
}

export async function deleteObject(key: string) {
  const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  return r2.send(command);
}

export function getPublicUrl(key: string) {
  const base =
    process.env.R2_PUBLIC_URL || `https://${process.env.R2_BUCKET_NAME}.r2.dev`;
  return `${base}/${key}`;
}

/** Recommended part size for multipart (5 MB minimum for S3/R2) */
export const MULTIPART_PART_SIZE = 5 * 1024 * 1024; // 5 MB
export const MULTIPART_THRESHOLD = 20 * 1024 * 1024; // use multipart above 20 MB
