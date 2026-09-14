import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { translate, type DictKey } from "./dictionaries";

/** Read the active locale from the cookie (server components / actions). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Server-side translator bound to the current request locale. */
export async function getTranslator() {
  const locale = await getLocale();
  return {
    locale,
    t: (key: DictKey) => translate(locale, key),
  };
}

export * from "./config";
export { translate } from "./dictionaries";
export type { DictKey } from "./dictionaries";
