"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/auth-guard";
import { writeAudit } from "@/lib/audit";
import { str, optStr, bool } from "@/lib/form";

export async function createQr(formData: FormData) {
  const admin = await assertPermission("qr.manage");
  const name = str(formData, "name");
  const image = str(formData, "image");
  if (!name || !image) throw new Error("Name and QR image are required");
  const qr = await prisma.qrCode.create({
    data: {
      name,
      image,
      upiId: optStr(formData, "upiId"),
      accountLabel: optStr(formData, "accountLabel"),
      isActive: bool(formData, "isActive"),
    },
  });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "qr.created",
    entityType: "qrCode",
    entityId: qr.id,
    newValues: { name },
  });
  revalidatePath("/admin/donations/qr");
  revalidatePath("/donate");
}

export async function toggleQr(id: string) {
  const admin = await assertPermission("qr.manage");
  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr) return;
  await prisma.qrCode.update({ where: { id }, data: { isActive: !qr.isActive } });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "qr.toggled",
    entityType: "qrCode",
    entityId: id,
    newValues: { isActive: !qr.isActive },
  });
  revalidatePath("/admin/donations/qr");
  revalidatePath("/donate");
}

export async function deleteQr(id: string) {
  const admin = await assertPermission("qr.manage");
  await prisma.qrCode.delete({ where: { id } });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "qr.deleted",
    entityType: "qrCode",
    entityId: id,
  });
  revalidatePath("/admin/donations/qr");
  revalidatePath("/donate");
}
