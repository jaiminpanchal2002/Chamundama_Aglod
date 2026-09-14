import { prisma } from "@/lib/prisma";

/**
 * Generate a human-friendly, sequential public reference for a donation, e.g.
 * `CDA-2026-000123`. Uses the current count for the year as a base and probes
 * upward to avoid rare collisions under concurrency (spec §15 step 6, §42).
 */
export async function nextDonationReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CDA-${year}-`;
  const count = await prisma.donation.count({
    where: { publicReferenceNumber: { startsWith: prefix } },
  });
  let seq = count + 1;
  // Probe for an unused number (bounded loop).
  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = `${prefix}${String(seq).padStart(6, "0")}`;
    const existing = await prisma.donation.findUnique({
      where: { publicReferenceNumber: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    seq++;
  }
  // Extremely unlikely fallback.
  return `${prefix}${Date.now().toString().slice(-6)}`;
}

/** Generate a receipt number, e.g. `CDA-RCPT-2026-000045`. */
export async function nextReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CDA-RCPT-${year}-`;
  const count = await prisma.donationReceipt.count({
    where: { receiptNumber: { startsWith: prefix } },
  });
  let seq = count + 1;
  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = `${prefix}${String(seq).padStart(6, "0")}`;
    const existing = await prisma.donationReceipt.findUnique({
      where: { receiptNumber: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    seq++;
  }
  return `${prefix}${Date.now().toString().slice(-6)}`;
}
