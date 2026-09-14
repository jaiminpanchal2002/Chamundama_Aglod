"use server";

import { revalidatePath } from "next/cache";
import type { GalleryItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/auth-guard";
import { writeAudit } from "@/lib/audit";
import { slugify, youtubeId } from "@/lib/utils";
import { str, optStr, num, bool } from "@/lib/form";

export async function createCategory(formData: FormData) {
  await assertPermission("content.manage");
  const nameGu = str(formData, "nameGu");
  if (!nameGu) throw new Error("Name is required");
  const base = slugify(str(formData, "nameEn") || nameGu) || "category";
  let slug = base;
  let n = 1;
  while (await prisma.galleryCategory.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }
  await prisma.galleryCategory.create({
    data: {
      slug,
      nameGu,
      nameEn: optStr(formData, "nameEn"),
      order: num(formData, "order", 0),
    },
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function createItem(formData: FormData) {
  const admin = await assertPermission("content.manage");
  const type = (str(formData, "type") || "IMAGE") as GalleryItemType;
  const url = str(formData, "url");
  if (!url) throw new Error("Image/video URL is required");

  let thumbnail: string | null = null;
  if (type === "YOUTUBE") {
    const id = youtubeId(url);
    if (id) {
      thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
  }

  const item = await prisma.galleryItem.create({
    data: {
      type,
      url,
      thumbnail,
      captionGu: optStr(formData, "captionGu"),
      alt: optStr(formData, "alt"),
      categoryId: optStr(formData, "categoryId"),
      order: num(formData, "order", 0),
      featured: bool(formData, "featured"),
      isPublished: bool(formData, "isPublished"),
    },
  });
  await writeAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "gallery.item.created",
    entityType: "galleryItem",
    entityId: item.id,
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function toggleItem(id: string) {
  await assertPermission("content.manage");
  const it = await prisma.galleryItem.findUnique({ where: { id } });
  if (!it) return;
  await prisma.galleryItem.update({
    where: { id },
    data: { isPublished: !it.isPublished },
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function deleteItem(id: string) {
  await assertPermission("content.manage");
  await prisma.galleryItem.delete({ where: { id } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}
