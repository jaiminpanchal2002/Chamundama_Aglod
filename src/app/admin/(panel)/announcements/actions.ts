"use server";

import { revalidatePath } from "next/cache";
import type { AnnouncementDisplay } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/auth-guard";
import { writeAudit } from "@/lib/audit";
import { str, optStr, num, bool, optDate } from "@/lib/form";

export async function createAnnouncement(formData: FormData) {
  const admin = await assertPermission("content.manage");
  const titleGu = str(formData, "titleGu");
  if (!titleGu) throw new Error("Title is required");
  const a = await prisma.announcement.create({
    data: {
      titleGu,
      titleHi: optStr(formData, "titleHi"),
      titleEn: optStr(formData, "titleEn"),
      bodyGu: optStr(formData, "bodyGu"),
      display: (str(formData, "display") || "TICKER") as AnnouncementDisplay,
      priority: num(formData, "priority", 0),
      ctaLabel: optStr(formData, "ctaLabel"),
      ctaHref: optStr(formData, "ctaHref"),
      startDate: optDate(formData, "startDate"),
      expiryDate: optDate(formData, "expiryDate"),
      isActive: bool(formData, "isActive"),
    },
  });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "announcement.created",
    entityType: "announcement",
    entityId: a.id,
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function toggleAnnouncement(id: string) {
  await assertPermission("content.manage");
  const a = await prisma.announcement.findUnique({ where: { id } });
  if (!a) return;
  await prisma.announcement.update({
    where: { id },
    data: { isActive: !a.isActive },
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function deleteAnnouncement(id: string) {
  await assertPermission("content.manage");
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}
