"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

interface Bit {
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}

/**
 * Subtle ambient particles for the hero (spec §4): rising diya sparks (gold)
 * and slowly drifting flower petals. Elegant, never covering Maa's face.
 * Rendered only after mount (no SSR mismatch) and disabled for reduced motion.
 */
export function Particles() {
  const reduce = useReducedMotion();
  const [sparks, setSparks] = useState<Bit[]>([]);
  const [petals, setPetals] = useState<Bit[]>([]);

  useEffect(() => {
    if (reduce) return;
    const mk = (n: number, dur: [number, number]): Bit[] =>
      Array.from({ length: n }, () => ({
        left: Math.random() * 100,
        size: 4 + Math.random() * 6,
        delay: Math.random() * 8,
        duration: dur[0] + Math.random() * (dur[1] - dur[0]),
        drift: (Math.random() - 0.5) * 60,
      }));
    setSparks(mk(16, [6, 11]));
    setPetals(mk(10, [11, 18]));
  }, [reduce]);

  if (reduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden" aria-hidden>
      {sparks.map((b, i) => (
        <span
          key={`s${i}`}
          className="absolute bottom-[-20px] rounded-full"
          style={{
            left: `${b.left}%`,
            width: b.size / 1.5,
            height: b.size / 1.5,
            background:
              "radial-gradient(circle, rgba(243,210,122,0.95), rgba(201,154,58,0))",
            animation: `spark-rise ${b.duration}s ease-in ${b.delay}s infinite`,
            "--drift": `${b.drift}px`,
          } as CSSProperties}
        />
      ))}
      {petals.map((b, i) => (
        <span
          key={`p${i}`}
          className="absolute top-[-24px]"
          style={{
            left: `${b.left}%`,
            width: b.size + 4,
            height: b.size + 2,
            borderRadius: "60% 60% 60% 0",
            background:
              i % 2 === 0
                ? "linear-gradient(135deg, #d6336c, #a61e4d)"
                : "linear-gradient(135deg, #f3b23e, #d98324)",
            opacity: 0.55,
            animation: `petal-fall ${b.duration}s linear ${b.delay}s infinite`,
            "--drift": `${b.drift}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
