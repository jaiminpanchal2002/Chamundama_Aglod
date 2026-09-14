"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/auth-guard";
import { writeAudit } from "@/lib/audit";
import { str, optStr, num, bool } from "@/lib/form";

export async function createHeroSlide(formData: FormData) {
  const admin = await assertPermission("content.manage");
  const desktopImage = str(formData, "desktopImage");
  if (!desktopImage) throw new Error("Desktop image is required");

  const slide = await prisma.heroSlide.create({
    data: {
      desktopImage,
      mobileImage: optStr(formData, "mobileImage"),
      titleGu: optStr(formData, "titleGu"),
      titleHi: optStr(formData, "titleHi"),
      titleEn: optStr(formData, "titleEn"),
      subtitleGu: optStr(formData, "subtitleGu"),
      subtitleEn: optStr(formData, "subtitleEn"),
      ctaLabelGu: optStr(formData, "ctaLabelGu"),
      ctaHref: optStr(formData, "ctaHref"),
      alignment: str(formData, "alignment") || "center",
      overlay: num(formData, "overlay", 45),
      focalX: num(formData, "focalX", 50),
      focalY: num(formData, "focalY", 50),
      order: num(formData, "order", 0),
      isActive: bool(formData, "isActive"),
    },
  });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "hero.created",
    entityType: "heroSlide",
    entityId: slide.id,
  });
  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function toggleHeroSlide(id: string) {
  await assertPermission("content.manage");
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  if (!slide) return;
  await prisma.heroSlide.update({
    where: { id },
    data: { isActive: !slide.isActive },
  });
  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function deleteHeroSlide(id: string) {
  const admin = await assertPermission("content.manage");
  await prisma.heroSlide.delete({ where: { id } });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "hero.deleted",
    entityType: "heroSlide",
    entityId: id,
  });
  revalidatePath("/admin/hero");
  revalidatePath("/");
}
