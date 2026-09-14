import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sniffMime, saveMedia } from "@/lib/storage";

export const runtime = "nodejs";

const PUBLIC_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Public media upload for admin CMS (hero, gallery, QR, campaigns). Uses
 * Cloudinary when STORAGE_DRIVER=cloudinary (persistent on Vercel), otherwise
 * writes to /public/uploads for local development. See src/lib/storage.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.role) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 6MB" }, { status: 400 });
  }
  const mime = sniffMime(buffer);
  if (!mime || !PUBLIC_TYPES[mime]) {
    return NextResponse.json(
      { error: "Only JPEG, PNG or WEBP images allowed" },
      { status: 400 },
    );
  }

  const folder = (form?.get("folder") as string) || "general";
  const url = await saveMedia(buffer, folder, PUBLIC_TYPES[mime]!);

  await prisma.mediaAsset
    .create({
      data: {
        url,
        kind: "image",
        folder,
        bytes: buffer.length,
        createdBy: session.user.id,
      },
    })
    .catch(() => undefined);

  return NextResponse.json({ url });
}
