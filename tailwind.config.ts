import type { Config } from "tailwindcss";

/**
 * Temple design system (see spec §3).
 * Colors are inspired by Maa Chamunda worship: deep temple red, sindoor,
 * sacred saffron, antique gold, warm cream. Exposed as CSS variables in
 * globals.css so admin/festival themes can override at runtime.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        temple: {
          red: "hsl(var(--temple-red) / <alpha-value>)",
          maroon: "hsl(var(--temple-maroon) / <alpha-value>)",
          sindoor: "hsl(var(--temple-sindoor) / <alpha-value>)",
          saffron: "hsl(var(--temple-saffron) / <alpha-value>)",
          gold: "hsl(var(--temple-gold) / <alpha-value>)",
          "gold-soft": "hsl(var(--temple-gold-soft) / <alpha-value>)",
          cream: "hsl(var(--temple-cream) / <alpha-value>)",
          burgundy: "hsl(var(--temple-burgundy) / <alpha-value>)",
        },
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        "muted-foreground": "hsl(var(--muted-foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        "card-foreground": "hsl(var(--card-foreground) / <alpha-value>)",
      },
      fontFamily: {
        gujarati: ["var(--font-gujarati)", "Noto Sans Gujarati", "sans-serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "serif"],
        display: ["var(--font-display)", "Cinzel", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        temple: "0.75rem",
      },
      boxShadow: {
        gold: "0 0 0 1px hsl(var(--temple-gold) / 0.35), 0 8px 30px -12px hsl(var(--temple-maroon) / 0.5)",
        "gold-glow": "0 0 24px -4px hsl(var(--temple-gold) / 0.55)",
      },
      backgroundImage: {
        "temple-gradient":
          "linear-gradient(160deg, hsl(var(--temple-maroon)) 0%, hsl(var(--temple-burgundy)) 100%)",
        "gold-line":
          "linear-gradient(90deg, transparent, hsl(var(--temple-gold)), transparent)",
      },
      keyframes: {
        "ken-burns": {
          "0%": { transform: "scale(1) translate(0,0)" },
          "100%": { transform: "scale(1.12) translate(-1.5%, -1%)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "diya-glow": {
          "0%, 100%": { opacity: "0.75", filter: "brightness(1)" },
          "50%": { opacity: "1", filter: "brightness(1.25)" },
        },
        "scroll-hint": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.6" },
          "50%": { transform: "translateY(8px)", opacity: "1" },
        },
      },
      animation: {
        "ken-burns": "ken-burns 9s ease-out both",
        "fade-in": "fade-in 0.8s ease-out both",
        "rise-in": "rise-in 0.7s ease-out both",
        "diya-glow": "diya-glow 3s ease-in-out infinite",
        "scroll-hint": "scroll-hint 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
