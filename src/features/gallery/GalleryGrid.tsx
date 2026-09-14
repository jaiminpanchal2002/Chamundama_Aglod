"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";

export interface GalleryEntry {
  id: string;
  type: string;
  url: string;
  thumbnail?: string | null;
  caption?: string;
  alt?: string;
}

export function GalleryGrid({
  items,
  categories,
}: {
  items: GalleryEntry[];
  categories: { slug: string; name: string }[];
}) {
  const [active, setActive] = useState<number | null>(null);

  const visible = items; // category filter applied server-side via links (kept simple)

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(
    () => setActive((i) => (i === null ? i : (i - 1 + visible.length) % visible.length)),
    [visible.length],
  );
  const next = useCallback(
    () => setActive((i) => (i === null ? i : (i + 1) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close, prev, next]);

  return (
    <>
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-temple-red px-4 py-1.5 text-sm text-temple-cream">
            All
          </span>
          {categories.map((c) => (
            <span
              key={c.slug}
              className="rounded-full border border-temple-gold/40 px-4 py-1.5 text-sm text-temple-maroon"
            >
              {c.name}
            </span>
          ))}
        </div>
      )}

      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
        {visible.map((it, i) => (
          <button
            key={it.id}
            onClick={() => setActive(i)}
            className="group relative block w-full overflow-hidden rounded-temple border border-temple-gold/20"
          >
            <Image
              src={it.thumbnail || it.url}
              alt={it.alt || it.caption || "Darshan"}
              width={400}
              height={i % 3 === 0 ? 520 : 400}
              className="w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            {it.type !== "IMAGE" && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="h-10 w-10 text-white" />
              </span>
            )}
          </button>
        ))}
      </div>

      {active !== null && visible[active] && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button className="absolute right-4 top-4 text-white" onClick={close} aria-label="Close">
            <X className="h-8 w-8" />
          </button>
          <button
            className="absolute left-4 text-white"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
          <div className="max-h-[85vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {visible[active].type === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={visible[active].url}
                alt={visible[active].alt || ""}
                className="max-h-[85vh] rounded-lg object-contain"
              />
            ) : (
              <div className="aspect-video w-[90vw] max-w-3xl">
                <iframe
                  src={embed(visible[active].url)}
                  className="h-full w-full rounded-lg"
                  allowFullScreen
                  title="Video"
                />
              </div>
            )}
            {visible[active].caption && (
              <p className="mt-3 text-center text-sm text-white/80">
                {visible[active].caption}
              </p>
            )}
          </div>
          <button
            className="absolute right-4 text-white"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next"
          >
            <ChevronRight className="h-10 w-10" />
          </button>
        </div>
      )}
    </>
  );
}

function embed(url: string): string {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  return url;
}
