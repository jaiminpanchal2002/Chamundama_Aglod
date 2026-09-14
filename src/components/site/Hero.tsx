"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ChevronDown, Heart, Eye, CalendarDays } from "lucide-react";
import { Particles } from "./Particles";

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

const SLIDE_MS = 7000; // slow, cinematic (spec §4: 6–9s)

export function Hero({
  slides,
  copy,
  videoUrl,
}: {
  slides: HeroSlideData[];
  copy: HeroCopy;
  videoUrl?: string | null;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const count = slides.length;

  // Subtle desktop mouse parallax.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 40, damping: 20 });
  const py = useSpring(my, { stiffness: 40, damping: 20 });

  // Scroll-driven parallax — works on mobile touch scroll (spec §4, §35).
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgScrollY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 130]);
  const copyScrollY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);

  useEffect(() => {
    if (count <= 1 || reduce || videoUrl) return;
    const id = setInterval(() => setActive((i) => (i + 1) % count), SLIDE_MS);
    return () => clearInterval(id);
  }, [count, reduce, videoUrl]);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mx.set(x * 14);
      my.set(y * 10);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, reduce]);

  const current = slides[active];
  const align =
    current?.alignment === "left"
      ? "items-start text-left"
      : current?.alignment === "right"
        ? "items-end text-right"
        : "items-center text-center";

  return (
    <section
      ref={heroRef}
      className="relative flex h-[94vh] min-h-[580px] w-full items-center justify-center overflow-hidden bg-temple-burgundy"
    >
      {/* Background: cinematic video, or cross-dissolving Ken Burns slides */}
      <motion.div className="absolute inset-0" style={{ y: imgScrollY }}>
       <motion.div className="absolute inset-0" style={{ x: px, y: py }}>
        {videoUrl ? (
          <video
            className="absolute inset-[-3%] h-[106%] w-[106%] object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={slides[0]?.desktopImage}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <AnimatePresence>
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute inset-[-4%]"
                initial={reduce ? {} : { scale: 1.05 }}
                animate={reduce ? {} : { scale: 1.16 }}
                transition={{ duration: (SLIDE_MS + 2000) / 1000, ease: "linear" }}
              >
                {current && (
                  <Image
                    src={current.desktopImage}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                    style={{ objectPosition: `${current.focalX}% ${current.focalY}%` }}
                  />
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
       </motion.div>
      </motion.div>

      {/* Cinematic overlays: top scrim, vignette, bottom fade to burgundy */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, transparent 40%, rgba(46,7,15,0.55) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-temple-burgundy"
        style={{ opacity: (current?.overlay ?? 45) / 100 + 0.2 }}
      />

      {/* Floating diya sparks + drifting petals */}
      <Particles />

      {/* Ornamental gold corner frames */}
      <GoldCorners />

      {/* Copy */}
      <motion.div
        style={{ y: copyScrollY, opacity: copyOpacity }}
        className={`container-temple relative z-10 flex flex-col gap-5 ${align}`}
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="font-serif text-lg tracking-[0.15em] text-temple-gold-soft drop-shadow lang-gu"
        >
          {copy.invocation}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl font-display text-4xl font-bold leading-tight text-temple-cream drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] sm:text-6xl lang-gu"
        >
          {current?.title || copy.title}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.9 }}
          className="h-px w-52 origin-center bg-gradient-to-r from-transparent via-temple-gold to-transparent"
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="max-w-2xl text-lg text-temple-cream/90 lang-gu"
        >
          {current?.subtitle || copy.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.9 }}
          className="mt-2 flex flex-wrap items-center gap-3"
        >
          <Link href="/darshan" className="btn-gold group">
            <Eye className="h-5 w-5 transition group-hover:scale-110" /> {copy.darshan}
          </Link>
          <Link href="/donate" className="btn-primary group">
            <Heart className="h-5 w-5 transition group-hover:scale-110" /> {copy.donate}
          </Link>
          <Link href="/events" className="btn-outline text-temple-cream">
            <CalendarDays className="h-5 w-5" /> {copy.events}
          </Link>
        </motion.div>
      </motion.div>

      {/* Slide dots */}
      {!videoUrl && count > 1 && (
        <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === active ? "w-10 bg-temple-gold" : "w-2 bg-temple-cream/50 hover:bg-temple-cream/80"
              }`}
            />
          ))}
        </div>
      )}

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-temple-cream/70"
      >
        <ChevronDown className="h-7 w-7 animate-scroll-hint" />
      </motion.div>
    </section>
  );
}

function GoldCorners() {
  const corner = (
    <svg viewBox="0 0 120 120" className="h-24 w-24" fill="none" aria-hidden>
      <path
        d="M4 40 Q4 4 40 4"
        stroke="hsl(var(--temple-gold))"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path d="M16 40 Q16 16 40 16" stroke="hsl(var(--temple-gold))" strokeWidth="1" opacity="0.4" />
      <circle cx="40" cy="4" r="2.5" fill="hsl(var(--temple-gold))" />
    </svg>
  );
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 1.2 }}
      className="pointer-events-none absolute inset-0 z-[5] hidden sm:block"
    >
      <div className="absolute left-4 top-4">{corner}</div>
      <div className="absolute right-4 top-4 rotate-90">{corner}</div>
      <div className="absolute bottom-4 left-4 -rotate-90">{corner}</div>
      <div className="absolute bottom-4 right-4 rotate-180">{corner}</div>
    </motion.div>
  );
}
