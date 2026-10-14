"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";

type MediaItem = {
  key: string;
  publicUrl: string;
  type: "image" | "video";
};

type Props = {
  media: MediaItem[];
  title: string;
};

export function ListingGallery({ media, title }: Props) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (media.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-muted text-muted-foreground">
        No media
      </div>
    );
  }

  const current = media[active];

  function prev() {
    setActive((i) => (i === 0 ? media.length - 1 : i - 1));
  }
  function next() {
    setActive((i) => (i === media.length - 1 ? 0 : i + 1));
  }

  return (
    <>
      {/* Main view */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
        {current.type === "image" ? (
          <Image
            src={current.publicUrl}
            alt={title}
            fill
            className="cursor-pointer object-cover"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
            onClick={() => setFullscreen(true)}
          />
        ) : (
          <video
            src={current.publicUrl}
            controls
            playsInline
            className="h-full w-full object-contain"
            poster={media.find((m) => m.type === "image")?.publicUrl}
          />
        )}

        {media.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
          {active + 1} / {media.length}
        </div>
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {media.map((m, i) => (
            <button
              key={m.key}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2",
                i === active ? "border-brand-emerald" : "border-transparent"
              )}
            >
              {m.type === "image" ? (
                <Image
                  src={m.publicUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Play className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox (images) */}
      {fullscreen && current.type === "image" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
            onClick={() => setFullscreen(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-full max-h-[90vh] w-full max-w-5xl">
            <Image
              src={current.publicUrl}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
