export const LOCALES = ["gu", "hi", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Gujarati is the natural/default temple language (spec §2). */
export const DEFAULT_LOCALE: Locale = "gu";

export const LOCALE_COOKIE = "cda_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  gu: "ગુજરાતી",
  hi: "हिन्दी",
  en: "English",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Pick the best available translation for a record that stores per-locale
 * fields (e.g. titleGu/titleHi/titleEn). Falls back gracefully: requested ->
 * Gujarati -> English -> first non-empty (spec §2).
 */
export function pick(
  record: Record<string, unknown>,
  base: string,
  locale: Locale,
): string {
  const cap = (l: string) => base + l.charAt(0).toUpperCase() + l.slice(1);
  const order: Locale[] = [locale, "gu", "en", "hi"];
  for (const l of order) {
    const v = record[cap(l)];
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return "";
}
