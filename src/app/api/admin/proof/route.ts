import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { storage, verifyStorageToken } from "@/lib/storage";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * Serve a private donation payment proof to authorized admins only (spec §17).
 * Defence in depth: requires BOTH a valid admin session with donations.view
 * AND a short-lived signed token that resolves to a real proof's storage key.
 */
export async function GET(request: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user?.role || !can(user.role, "donations.view")) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const key = verifyStorageToken(token);
  if (!key) {
    return NextResponse.json({ error: "Link expired" }, { status: 403 });
  }

  const proof = await prisma.donationProof.findFirst({
    where: { privateStorageKey: key },
    select: { id: true, mimeType: true, donationId: true },
  });
  if (!proof) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const buffer = await storage.get(key);
    await writeAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "donation.proof.viewed",
      entityType: "donation",
      entityId: proof.donationId,
    });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": proof.mimeType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
