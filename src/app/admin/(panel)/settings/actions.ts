"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/auth-guard";
import { writeAudit } from "@/lib/audit";
import { setSetting, SETTING_KEYS } from "@/lib/settings";
import { str, optStr, bool, num } from "@/lib/form";

export async function saveMaintenance(formData: FormData) {
  const admin = await assertPermission("settings.manage");
  await setSetting(SETTING_KEYS.maintenance, {
    enabled: bool(formData, "enabled"),
    messageGu: str(formData, "messageGu"),
    messageEn: str(formData, "messageEn"),
  });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "settings.maintenance",
    entityType: "siteSetting",
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export async function saveWhatsapp(formData: FormData) {
  await assertPermission("settings.manage");
  await setSetting(SETTING_KEYS.whatsapp, {
    enabled: bool(formData, "enabled"),
    number: str(formData, "number"),
    messageGu: str(formData, "messageGu"),
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export async function saveFestival(formData: FormData) {
  const admin = await assertPermission("settings.manage");
  await setSetting(SETTING_KEYS.festival, {
    enabled: bool(formData, "enabled"),
    name: str(formData, "name"),
    from: optStr(formData, "from") ?? undefined,
    until: optStr(formData, "until") ?? undefined,
    bannerGu: str(formData, "bannerGu"),
  });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "settings.festival",
    entityType: "siteSetting",
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export async function saveDonationConfig(formData: FormData) {
  await assertPermission("settings.manage");
  const amounts = str(formData, "amounts")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  await setSetting(SETTING_KEYS.donationPresets, {
    amounts: amounts.length ? amounts : [101, 501, 1001, 2501, 5001],
    allowCustom: bool(formData, "allowCustom"),
  });
  await setSetting(SETTING_KEYS.donationFields, {
    emailRequired: bool(formData, "emailRequired"),
    addressRequired: bool(formData, "addressRequired"),
    panRequired: bool(formData, "panRequired"),
    allowAnonymous: bool(formData, "allowAnonymous"),
  });
  revalidatePath("/donate");
  revalidatePath("/admin/settings");
}

export async function saveTempleInfo(formData: FormData) {
  const admin = await assertPermission("temple.manage").catch(() =>
    assertPermission("settings.manage"),
  );
  const existing = await prisma.templeInfo.findFirst();
  const data = {
    nameGu: str(formData, "nameGu") || "શ્રી ચામુંડા ધામ આગલોડ",
    nameEn: optStr(formData, "nameEn"),
    taglineGu: optStr(formData, "taglineGu"),
    aboutGu: optStr(formData, "aboutGu"),
    addressGu: optStr(formData, "addressGu"),
    phone: optStr(formData, "phone"),
    email: optStr(formData, "email"),
    whatsapp: optStr(formData, "whatsapp"),
    mapsUrl: optStr(formData, "mapsUrl"),
    latitude: formData.get("latitude") ? num(formData, "latitude") : null,
    longitude: formData.get("longitude") ? num(formData, "longitude") : null,
  };
  if (existing) {
    await prisma.templeInfo.update({ where: { id: existing.id }, data });
  } else {
    await prisma.templeInfo.create({ data });
  }
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "settings.templeInfo",
    entityType: "templeInfo",
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export async function addSocialLink(formData: FormData) {
  await assertPermission("settings.manage");
  const platform = str(formData, "platform");
  const url = str(formData, "url");
  if (!platform || !url) throw new Error("Platform and URL required");
  await prisma.socialLink.create({
    data: { platform, url, order: num(formData, "order", 0) },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export async function deleteSocialLink(id: string) {
  await assertPermission("settings.manage");
  await prisma.socialLink.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}
