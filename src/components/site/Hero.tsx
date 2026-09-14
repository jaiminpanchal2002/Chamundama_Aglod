"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Heart, Eye, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroSlideData {
  desktopImage: string;
  mobileImage?: string | null;
  title?: string;
  subtitle?: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  alignment: string;
  overlay: number;
  focalX: number;
  focalY: number;
}

export interface HeroCopy {
  invocation: string;
  title: string;
  subtitle: string;
  darshan: string;
  donate: string;
  events: string;
}

export function Hero({
  slides,
  copy,
}: {
  slides: HeroSlideData[];
  copy: HeroCopy;
}) {
  const [active, setActive] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % count),
      7000, // slow, cinematic (spec §4: 6–9s)
    );
    return () => clearInterval(id);
  }, [count]);

  const align =
    slides[active]?.alignment === "left"
      ? "items-start text-left"
      : slides[active]?.alignment === "right"
        ? "items-end text-right"
        : "items-center text-center";

  return (
    <section className="relative flex h-[92vh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-temple-burgundy">
      {/* Slides */}
      {count > 0 ? (
        slides.map((s, i) => (
          <div
            key={i}
            className="hero-slide"
            data-active={i === active}
            aria-hidden={i !== active}
          >
            <Image
              src={s.desktopImage}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: `${s.focalX}% ${s.focalY}%` }}
            />
          </div>
        ))
      ) : (
        <div className="absolute inset-0 bg-temple-gradient" />
      )}

      {/* Readability overlay (spec §4) */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-temple-burgundy/70"
        style={{ opacity: (slides[active]?.overlay ?? 45) / 100 + 0.15 }}
      />

      {/* Copy */}
      <div
        className={cn(
          "container-temple relative z-10 flex flex-col gap-6",
          align,
        )}
      >
        <p className="animate-fade-in font-serif text-lg tracking-wide text-temple-gold-soft lang-gu">
          {copy.invocation}
        </p>
        <h1 className="max-w-3xl animate-rise-in font-display text-4xl font-bold leading-tight text-temple-cream drop-shadow-lg sm:text-6xl lang-gu">
          {slides[active]?.title || copy.title}
        </h1>
        <p className="max-w-2xl text-lg text-temple-cream/90 lang-gu">
          {slides[active]?.subtitle || copy.subtitle}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link href="/darshan" className="btn-gold">
            <Eye className="h-5 w-5" /> {copy.darshan}
          </Link>
          <Link href="/donate" className="btn-primary">
            <Heart className="h-5 w-5" /> {copy.donate}
          </Link>
          <Link href="/events" className="btn-outline text-temple-cream">
            <CalendarDays className="h-5 w-5" /> {copy.events}
          </Link>
        </div>
      </div>

      {/* Slide dots */}
      {count > 1 && (
        <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === active
                  ? "w-8 bg-temple-gold"
                  : "w-2 bg-temple-cream/50 hover:bg-temple-cream/80",
              )}
            />
          ))}
        </div>
      )}

      {/* Scroll hint (spec §4) */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-temple-cream/70">
        <ChevronDown className="h-7 w-7 animate-scroll-hint" />
      </div>
    </section>
  );
}
