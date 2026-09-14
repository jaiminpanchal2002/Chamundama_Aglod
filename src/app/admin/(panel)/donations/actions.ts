"use server";

import { revalidatePath } from "next/cache";
import type { DonationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/auth-guard";
import { writeAudit } from "@/lib/audit";
import { nextReceiptNumber } from "@/lib/reference";
import { generateReceiptPdf } from "@/lib/receipt";
import { storage } from "@/lib/storage";
import { getEightyG } from "@/lib/settings";
import { nanoid } from "nanoid";

async function transition(
  donationId: string,
  to: DonationStatus,
  reason: string | undefined,
  actorId: string,
  actorEmail: string,
) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    select: { id: true, status: true },
  });
  if (!donation) throw new Error("Donation not found");

  await prisma.$transaction([
    prisma.donation.update({
      where: { id: donationId },
      data: {
        status: to,
        ...(to === "VERIFIED" ? { verifiedAt: new Date(), verifiedById: actorId } : {}),
        ...(to === "APPROVED" ? { approvedAt: new Date(), approvedById: actorId } : {}),
        ...(to === "REJECTED" ? { rejectedAt: new Date(), rejectionReason: reason ?? null } : {}),
      },
    }),
    prisma.donationStatusHistory.create({
      data: {
        donationId,
        previousStatus: donation.status,
        newStatus: to,
        changedById: actorId,
        reason: reason ?? null,
      },
    }),
  ]);

  await writeAudit({
    actorId,
    actorEmail,
    action: `donation.${to.toLowerCase()}`,
    entityType: "donation",
    entityId: donationId,
    oldValues: { status: donation.status },
    newValues: { status: to, reason },
  });
}

/** Mark a donation VERIFIED (payment confirmed against records). */
export async function verifyDonation(donationId: string, reason?: string) {
  const admin = await assertPermission("donations.verify");
  await transition(donationId, "VERIFIED", reason, admin.id, admin.email);
  revalidatePath(`/admin/donations/${donationId}`);
  revalidatePath("/admin/donations");
}

/** Request clarification from the donor. */
export async function clarifyDonation(donationId: string, reason: string) {
  const admin = await assertPermission("donations.verify");
  await transition(donationId, "CLARIFICATION_REQUIRED", reason, admin.id, admin.email);
  revalidatePath(`/admin/donations/${donationId}`);
  revalidatePath("/admin/donations");
}

/** Reject a donation with a donor-safe reason. */
export async function rejectDonation(donationId: string, reason: string) {
  const admin = await assertPermission("donations.approve");
  await transition(donationId, "REJECTED", reason, admin.id, admin.email);
  revalidatePath(`/admin/donations/${donationId}`);
  revalidatePath("/admin/donations");
}

/**
 * Approve a donation and generate a receipt (spec §18). Only authorized
 * financial roles reach here (donations.approve). A receipt is created ONLY
 * after approval — never before verification.
 */
export async function approveDonation(donationId: string) {
  const admin = await assertPermission("donations.approve");

  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { donor: true, campaign: true, receipt: true },
  });
  if (!donation) throw new Error("Donation not found");

  await transition(donationId, "APPROVED", undefined, admin.id, admin.email);

  // Generate the receipt if one does not already exist.
  if (!donation.receipt) {
    const receiptNumber = await nextReceiptNumber();
    const verificationToken = nanoid(24);
    const [trust, temple, eightyG] = await Promise.all([
      prisma.trust.findFirst(),
      prisma.templeInfo.findFirst(),
      getEightyG(),
    ]);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const verifyUrl = `${siteUrl}/verify-receipt/${verificationToken}`;

    const pdf = await generateReceiptPdf({
      receiptNumber,
      donationDate: donation.paymentDate ?? donation.submittedAt,
      approvalDate: new Date(),
      donorName: donation.donor.anonymous ? "Anonymous Devotee" : donation.donor.name,
      amount: Number(donation.amount),
      purpose: donation.purpose || donation.campaign?.nameEn || "General Donation",
      paymentReference: donation.transactionReference || "-",
      paymentMode: donation.paymentMethod || "UPI",
      trustLegalName: trust?.legalName || "Shree Chamunda Dham Aglod Trust",
      templeName: temple?.nameEn || "Shree Chamunda Dham Aglod",
      trustContact: [trust?.phone, trust?.email].filter(Boolean).join("  •  ") ||
        "Aglod, Vijapur, Gujarat",
      verifyUrl,
      eightyG,
    });

    const pdfKey = await storage.put(Buffer.from(pdf), "pdf");

    await prisma.donationReceipt.create({
      data: {
        donationId,
        receiptNumber,
        verificationToken,
        pdfKey,
      },
    });

    await writeAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "receipt.generated",
      entityType: "donationReceipt",
      entityId: donationId,
      newValues: { receiptNumber },
    });
  }

  revalidatePath(`/admin/donations/${donationId}`);
  revalidatePath("/admin/donations");
}
