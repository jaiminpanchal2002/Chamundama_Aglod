import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { donationSubmissionSchema } from "@/lib/validation/donation";
import { storage, validateProofUpload } from "@/lib/storage";
import { nextDonationReference } from "@/lib/reference";
import { rateLimit } from "@/lib/rate-limit";
import { requestMeta, writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * Donation submission (spec §15). Accepts multipart/form-data with the donor
 * details and a REQUIRED payment proof. The proof is validated and stored
 * PRIVATELY (§17). The donation is created as PENDING_VERIFICATION — never
 * auto-approved on the basis of a screenshot (§16).
 */
export async function POST(request: Request) {
  const { ip, userAgent } = await requestMeta();
  const limit = rateLimit(`donate:${ip ?? "unknown"}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = Object.fromEntries(
    Array.from(form.entries()).filter(([, v]) => typeof v === "string"),
  );
  const parsed = donationSubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Payment proof is required (spec §15 step 5).
  const file = form.get("proof");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Payment proof is required." },
      { status: 400 },
    );
  }

  let proofKey: string;
  let mimeType: string;
  let size: number;
  let sha256: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const validated = validateProofUpload(buffer, file.type);
    sha256 = createHash("sha256").update(validated.buffer).digest("hex");
    size = validated.buffer.length;
    mimeType = validated.mimeType;
    proofKey = await storage.put(validated.buffer, validated.ext);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid file." },
      { status: 400 },
    );
  }

  try {
    const campaign = data.campaignSlug
      ? await prisma.donationCampaign.findUnique({
          where: { slug: data.campaignSlug },
          select: { id: true },
        })
      : null;

    const reference = await nextDonationReference();

    const donation = await prisma.$transaction(async (tx) => {
      const donor = await tx.donor.create({
        data: {
          name: data.name,
          mobile: data.mobile,
          email: data.email || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          country: data.country || "India",
          pan: data.pan || null,
          anonymous: Boolean(data.anonymous),
        },
      });

      const created = await tx.donation.create({
        data: {
          publicReferenceNumber: reference,
          campaignId: campaign?.id ?? null,
          donorId: donor.id,
          amount: data.amount,
          purpose: data.purpose || null,
          paymentMethod: data.paymentMethod || "UPI",
          transactionReference: data.transactionReference,
          paymentDate: new Date(data.paymentDate),
          status: "PENDING_VERIFICATION",
          ipAddress: ip,
          userAgent,
          proofs: {
            create: {
              privateStorageKey: proofKey,
              originalName: file.name?.slice(0, 160) ?? null,
              mimeType,
              size,
              sha256,
            },
          },
          statusHistory: {
            create: {
              previousStatus: null,
              newStatus: "PENDING_VERIFICATION",
              reason: "Donor submitted payment details and proof.",
            },
          },
        },
      });

      await tx.adminNotification.create({
        data: {
          type: "donation",
          title: "New donation awaiting verification",
          body: `${reference} — amount submitted for review.`,
          entityType: "donation",
          entityId: created.id,
        },
      });

      return created;
    });

    await writeAudit({
      action: "donation.submitted",
      entityType: "donation",
      entityId: donation.id,
      newValues: { reference, status: "PENDING_VERIFICATION" },
    });

    return NextResponse.json({
      reference: donation.publicReferenceNumber,
      status: donation.status,
    });
  } catch (error) {
    // Clean up the orphaned proof if the transaction failed.
    await storage.remove(proofKey).catch(() => undefined);
    console.error("Donation submission failed:", error);
    return NextResponse.json(
      { error: "Could not save your submission. Please try again." },
      { status: 500 },
    );
  }
}
