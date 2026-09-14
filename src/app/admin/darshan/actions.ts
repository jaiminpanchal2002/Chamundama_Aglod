"use server";

import { revalidatePath } from "next/cache";
import type { DarshanDayType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/auth-guard";
import { writeAudit } from "@/lib/audit";
import { str, optStr, num, bool, optDate } from "@/lib/form";

export async function createSchedule(formData: FormData) {
  const admin = await assertPermission("temple.manage");
  const labelGu = str(formData, "labelGu");
  if (!labelGu) throw new Error("Label is required");
  await prisma.darshanSchedule.create({
    data: {
      dayType: (str(formData, "dayType") || "NORMAL") as DarshanDayType,
      labelGu,
      labelEn: optStr(formData, "labelEn"),
      openTime: optStr(formData, "openTime"),
      closeTime: optStr(formData, "closeTime"),
      morningAarti: optStr(formData, "morningAarti"),
      eveningAarti: optStr(formData, "eveningAarti"),
      specialAarti: optStr(formData, "specialAarti"),
      bhogTime: optStr(formData, "bhogTime"),
      order: num(formData, "order", 0),
      isActive: bool(formData, "isActive"),
    },
  });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "darshan.schedule.created",
    entityType: "darshanSchedule",
  });
  revalidatePath("/admin/darshan");
  revalidatePath("/");
  revalidatePath("/darshan");
}

export async function deleteSchedule(id: string) {
  await assertPermission("temple.manage");
  await prisma.darshanSchedule.delete({ where: { id } });
  revalidatePath("/admin/darshan");
  revalidatePath("/darshan");
}

export async function createOverride(formData: FormData) {
  await assertPermission("temple.manage");
  const date = optDate(formData, "date");
  const labelGu = str(formData, "labelGu");
  if (!date || !labelGu) throw new Error("Date and label are required");
  await prisma.darshanOverride.upsert({
    where: { date },
    create: {
      date,
      labelGu,
      openTime: optStr(formData, "openTime"),
      closeTime: optStr(formData, "closeTime"),
      specialAarti: optStr(formData, "specialAarti"),
      note: optStr(formData, "note"),
      isClosed: bool(formData, "isClosed"),
    },
    update: {
      labelGu,
      openTime: optStr(formData, "openTime"),
      closeTime: optStr(formData, "closeTime"),
      specialAarti: optStr(formData, "specialAarti"),
      note: optStr(formData, "note"),
      isClosed: bool(formData, "isClosed"),
    },
  });
  revalidatePath("/admin/darshan");
  revalidatePath("/");
}

export async function deleteOverride(id: string) {
  await assertPermission("temple.manage");
  await prisma.darshanOverride.delete({ where: { id } });
  revalidatePath("/admin/darshan");
  revalidatePath("/");
}
