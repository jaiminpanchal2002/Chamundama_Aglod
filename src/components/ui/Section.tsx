import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function Section({
  children,
  className,
  id,
  tone = "cream",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "cream" | "white" | "maroon";
}) {
  const tones: Record<string, string> = {
    cream: "bg-background",
    white: "bg-card",
    maroon: "bg-temple-gradient text-temple-cream",
  };
  return (
    <section id={id} className={cn("py-16 sm:py-24", tones[tone], className)}>
      <div className="container-temple">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  invert?: boolean;
}) {
  return (
    <Reveal>
      <div className={cn("mb-10", center && "text-center")}>
        {eyebrow && (
          <span
            className={cn(
              "eyebrow",
              invert && "text-temple-gold-soft",
            )}
          >
            ✦ {eyebrow}
          </span>
        )}
        <h2
          className={cn(
            "mt-3 font-display text-3xl font-semibold sm:text-4xl",
            invert ? "text-temple-cream" : "text-temple-maroon",
          )}
        >
          {title}
        </h2>
        <div
          className={cn(
            "gold-divider mx-auto mt-5",
            center ? "w-40" : "w-24",
          )}
        />
        {subtitle && (
          <p
            className={cn(
              "mx-auto mt-4 max-w-2xl text-base",
              invert ? "text-temple-cream/80" : "text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  );
}
