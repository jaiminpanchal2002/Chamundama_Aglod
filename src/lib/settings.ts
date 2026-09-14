import { prisma } from "@/lib/prisma";

/**
 * Typed access to the SiteSetting key/value store. Everything configurable
 * without a redeploy (spec §1, §34) lives here or in dedicated models.
 */

export const SETTING_KEYS = {
  maintenance: "site.maintenance",
  festival: "site.festival",
  specialDarshan: "site.specialDarshan",
  heroVideo: "hero.video",
  audio: "site.audio",
  whatsapp: "site.whatsapp",
  analytics: "site.analytics",
  seoDefaults: "site.seoDefaults",
  donationPresets: "donation.presets",
  donationFields: "donation.fields",
  eightyG: "donation.80g",
} as const;

export interface MaintenanceSetting {
  enabled: boolean;
  messageGu?: string;
  messageEn?: string;
}
export interface FestivalSetting {
  enabled: boolean;
  name?: string;
  from?: string;
  until?: string;
  bannerGu?: string;
  bannerEn?: string;
}
export interface SpecialDarshanSetting {
  enabled: boolean;
  titleGu?: string;
  titleEn?: string;
  timings?: string;
  expiresAt?: string;
}
export interface AudioSetting {
  enabled: boolean;
  url?: string;
  defaultVolume?: number;
}
export interface WhatsappSetting {
  enabled: boolean;
  number?: string;
  messageGu?: string;
}
export interface EightyGSetting {
  enabled: boolean;
  registrationNo?: string;
  validFrom?: string;
  validUntil?: string;
  legalWording?: string;
}
export interface DonationPresets {
  amounts: number[];
  allowCustom: boolean;
}
export interface DonationFieldConfig {
  emailRequired: boolean;
  addressRequired: boolean;
  panRequired: boolean;
  allowAnonymous: boolean;
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if (!row) return fallback;
    return row.value as T;
  } catch {
    return fallback;
  }
}

export async function setSetting(
  key: string,
  value: unknown,
  group = "general",
): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, group, value: value as object },
    update: { value: value as object },
  });
}

// Convenience getters with sensible defaults.
export const getMaintenance = () =>
  getSetting<MaintenanceSetting>(SETTING_KEYS.maintenance, { enabled: false });

export const getFestival = () =>
  getSetting<FestivalSetting>(SETTING_KEYS.festival, { enabled: false });

export const getSpecialDarshan = () =>
  getSetting<SpecialDarshanSetting>(SETTING_KEYS.specialDarshan, {
    enabled: false,
  });

export const getAudio = () =>
  getSetting<AudioSetting>(SETTING_KEYS.audio, { enabled: false });

export interface HeroVideoSetting {
  url?: string;
  poster?: string;
}
export const getHeroVideo = () =>
  getSetting<HeroVideoSetting>(SETTING_KEYS.heroVideo, {});

export const getWhatsapp = () =>
  getSetting<WhatsappSetting>(SETTING_KEYS.whatsapp, { enabled: false });

export const getEightyG = () =>
  getSetting<EightyGSetting>(SETTING_KEYS.eightyG, { enabled: false });

export const getDonationPresets = () =>
  getSetting<DonationPresets>(SETTING_KEYS.donationPresets, {
    amounts: [101, 501, 1001, 2501, 5001],
    allowCustom: true,
  });

export const getDonationFields = () =>
  getSetting<DonationFieldConfig>(SETTING_KEYS.donationFields, {
    emailRequired: false,
    addressRequired: false,
    panRequired: false,
    allowAnonymous: true,
  });

/** Is the festival theme currently within its active window? */
export function festivalActive(f: FestivalSetting, now = new Date()): boolean {
  if (!f.enabled) return false;
  const from = f.from ? new Date(f.from) : null;
  const until = f.until ? new Date(f.until) : null;
  if (from && now < from) return false;
  if (until && now > until) return false;
  return true;
}
