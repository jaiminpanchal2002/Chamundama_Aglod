"use server";

import { revalidatePath } from "next/cache";
import type { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/auth-guard";
import { writeAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { str, optStr, bool, optDate } from "@/lib/form";

export async function createEvent(formData: FormData) {
  const admin = await assertPermission("events.manage");
  const titleGu = str(formData, "titleGu");
  const startAt = optDate(formData, "startAt");
  if (!titleGu || !startAt) throw new Error("Title and start date are required");

  const base = slugify(str(formData, "titleEn") || titleGu) || "event";
  let slug = base;
  let n = 1;
  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  const event = await prisma.event.create({
    data: {
      slug,
      titleGu,
      titleEn: optStr(formData, "titleEn"),
      shortGu: optStr(formData, "shortGu"),
      bodyGu: optStr(formData, "bodyGu"),
      eventType: optStr(formData, "eventType"),
      startAt,
      endAt: optDate(formData, "endAt"),
      allDay: bool(formData, "allDay"),
      coverImage: optStr(formData, "coverImage"),
      location: optStr(formData, "location"),
      mapsUrl: optStr(formData, "mapsUrl"),
      featured: bool(formData, "featured"),
      registrationNeeded: bool(formData, "registrationNeeded"),
      contactPhone: optStr(formData, "contactPhone"),
      whatsapp: optStr(formData, "whatsapp"),
      status: (str(formData, "status") || "DRAFT") as EventStatus,
    },
  });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "event.created",
    entityType: "event",
    entityId: event.id,
    newValues: { slug, status: event.status },
  });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function setEventStatus(id: string, status: EventStatus) {
  const admin = await assertPermission("events.manage");
  await prisma.event.update({ where: { id }, data: { status } });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "event.status",
    entityType: "event",
    entityId: id,
    newValues: { status },
  });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function deleteEvent(id: string) {
  await assertPermission("events.manage");
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
  revalidatePath("/events");
}
