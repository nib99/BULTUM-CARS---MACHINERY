"use client";

import { useCallback, useRef, useState } from "react";
import { uploadFile, type UploadResult, type UploadProgress } from "@/lib/upload-client";
import { attachMediaToListing } from "@/lib/actions/listings";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, Video, X, Loader2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type MediaItem = {
  id: string; // temp or db id
  key: string;
  publicUrl: string;
  type: "image" | "video";
  progress?: number;
  uploading?: boolean;
  error?: string;
};

type Props = {
  listingId: string;
  initialMedia?: MediaItem[];
  maxFiles?: number;
  onChange?: (media: MediaItem[]) => void;
};

export function MediaUploader({
  listingId,
  initialMedia = [],
  maxFiles = 20,
  onChange,
}: Props) {
  const [items, setItems] = useState<MediaItem[]>(initialMedia);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const updateItems = useCallback(
    (next: MediaItem[]) => {
      setItems(next);
      onChange?.(next);
    },
    [onChange]
  );

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).slice(0, maxFiles - items.length);
    if (list.length === 0) return;

    for (const file of list) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const previewUrl = URL.createObjectURL(file);

      // Add placeholder
      setItems((prev) => [
        ...prev,
        {
          id: tempId,
          key: "",
          publicUrl: previewUrl,
          type: file.type.startsWith("video/") ? "video" : "image",
          uploading: true,
          progress: 0,
        },
      ]);

      try {
        const result = await uploadFile(file, listingId, (p: UploadProgress) => {
          setItems((prev) =>
            prev.map((m) =>
              m.id === tempId ? { ...m, progress: p.percent } : m
            )
          );
        });

        // Attach to listing in DB
        const { mediaId } = await attachMediaToListing({
          listingId,
          key: result.key,
          type: result.type,
          mimeType: result.mimeType,
          sizeBytes: result.sizeBytes,
          width: result.width,
          height: result.height,
          duration: result.duration,
          order: items.length,
        });

        setItems((prev) => {
          const next = prev.map((m) =>
            m.id === tempId
              ? {
                  id: mediaId,
                  key: result.key,
                  publicUrl: result.publicUrl,
                  type: result.type,
                  uploading: false,
                  progress: 100,
                }
              : m
          );
          onChange?.(next);
          return next;
        });
      } catch (err: any) {
        setItems((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, uploading: false, error: err.message || "Upload failed" }
              : m
          )
        );
      }
    }
  }

  function removeItem(id: string) {
    const next = items.filter((m) => m.id !== id);
    updateItems(next);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone + buttons */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          isDragging ? "border-brand-emerald bg-brand-emerald/5" : "border-muted"
        )}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Drag photos/videos here, or use the buttons below
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {/* Gallery / file picker */}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <ImagePlus className="h-4 w-4" />
            Gallery
          </Button>
          {/* Camera (Android Chrome supports capture) */}
          <Button
            type="button"
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            Camera
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = "video/*";
                fileInputRef.current.click();
                // reset accept after
                setTimeout(() => {
                  if (fileInputRef.current) fileInputRef.current.accept = "image/*,video/*";
                }, 500);
              }
            }}
            className="gap-2"
          >
            <Video className="h-4 w-4" />
            Video
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {/* capture="environment" opens rear camera on Android */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {item.type === "image" ? (
                <Image
                  src={item.publicUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="150px"
                  unoptimized={item.publicUrl.startsWith("blob:")}
                />
              ) : (
                <video
                  src={item.publicUrl}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              )}

              {/* Progress overlay */}
              {item.uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                  <Loader2 className="mb-1 h-6 w-6 animate-spin" />
                  <span className="text-xs">{item.progress ?? 0}%</span>
                </div>
              )}

              {/* Error */}
              {item.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/80 p-2 text-center text-xs text-white">
                  {item.error}
                </div>
              )}

              {/* Cover badge */}
              {index === 0 && !item.uploading && !item.error && (
                <span className="absolute left-1 top-1 rounded bg-brand-gold px-1.5 py-0.5 text-[10px] font-semibold text-brand-charcoal">
                  Cover
                </span>
              )}

              {/* Remove */}
              {!item.uploading && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Max {maxFiles} files. Images up to 15 MB. Videos up to 500 MB (multipart + retry).
        First image becomes the cover.
      </p>
    </div>
  );
}
