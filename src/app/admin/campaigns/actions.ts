"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/auth-guard";
import { writeAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { str, optStr, optNum, num, bool } from "@/lib/form";

export async function createCampaign(formData: FormData) {
  const admin = await assertPermission("campaigns.manage");
  const nameGu = str(formData, "nameGu");
  if (!nameGu) throw new Error("Name is required");
  const base = slugify(str(formData, "nameEn") || nameGu) || "campaign";
  let slug = base;
  let n = 1;
  while (await prisma.donationCampaign.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }
  const c = await prisma.donationCampaign.create({
    data: {
      slug,
      nameGu,
      nameHi: optStr(formData, "nameHi"),
      nameEn: optStr(formData, "nameEn"),
      descGu: optStr(formData, "descGu"),
      descEn: optStr(formData, "descEn"),
      image: optStr(formData, "image"),
      targetAmount: optNum(formData, "targetAmount"),
      showRaised: bool(formData, "showRaised"),
      order: num(formData, "order", 0),
      isActive: bool(formData, "isActive"),
    },
  });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "campaign.created",
    entityType: "donationCampaign",
    entityId: c.id,
  });
  revalidatePath("/admin/campaigns");
  revalidatePath("/donate");
  revalidatePath("/");
}

export async function toggleCampaign(id: string) {
  await assertPermission("campaigns.manage");
  const c = await prisma.donationCampaign.findUnique({ where: { id } });
  if (!c) return;
  await prisma.donationCampaign.update({
    where: { id },
    data: { isActive: !c.isActive },
  });
  revalidatePath("/admin/campaigns");
  revalidatePath("/donate");
}

export async function deleteCampaign(id: string) {
  await assertPermission("campaigns.manage");
  await prisma.donationCampaign.delete({ where: { id } });
  revalidatePath("/admin/campaigns");
  revalidatePath("/donate");
}
