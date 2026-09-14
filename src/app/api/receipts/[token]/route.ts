import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * Stream an approved donation's receipt PDF, addressed by its verification
 * token (the receipt's own secret). Only APPROVED donations resolve.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const receipt = await prisma.donationReceipt.findUnique({
    where: { verificationToken: token },
    include: { donation: { select: { status: true } } },
  });

  if (!receipt || !receipt.pdfKey || receipt.donation.status !== "APPROVED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const buffer = await storage.get(receipt.pdfKey);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${receipt.receiptNumber}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
