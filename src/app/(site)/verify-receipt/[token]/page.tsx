import Link from "next/link";
import { CheckCircle2, XCircle, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";
import { Section } from "@/components/ui/Section";

export const dynamic = "force-dynamic";

/**
 * Public receipt verification (spec §18). Exposes ONLY safe fields — never the
 * donor's phone, email, address, PAN, or payment screenshot.
 */
export default async function VerifyReceiptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const receipt = await prisma.donationReceipt
    .findUnique({
      where: { verificationToken: token },
      include: {
        donation: {
          select: { amount: true, approvedAt: true, status: true, purpose: true },
        },
      },
    })
    .catch(() => null);

  const trust = await prisma.trust.findFirst().catch(() => null);
  const trustName = trust?.legalName || "Shree Chamunda Dham Aglod Trust";

  const valid =
    receipt && receipt.donation.status === "APPROVED";

  return (
    <Section tone="cream" className="pt-28">
      <div className="mx-auto max-w-lg">
        <div className="card-temple text-center">
          {valid ? (
            <>
              <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
              <h1 className="mt-4 font-display text-2xl text-temple-maroon">
                Valid Receipt
              </h1>
              <div className="mt-6 space-y-3 text-left">
                <Row label="Receipt Number" value={receipt.receiptNumber} />
                <Row
                  label="Date"
                  value={
                    receipt.donation.approvedAt?.toLocaleDateString("en-IN") ??
                    receipt.issuedAt.toLocaleDateString("en-IN")
                  }
                />
                <Row
                  label="Amount"
                  value={formatINR(Number(receipt.donation.amount))}
                />
                <Row label="Trust" value={trustName} />
              </div>
              <a
                href={`/api/receipts/${token}`}
                className="btn-outline mt-6 inline-flex"
              >
                <Download className="h-4 w-4" /> Download Receipt (PDF)
              </a>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-14 w-14 text-red-500" />
              <h1 className="mt-4 font-display text-2xl text-temple-maroon">
                Receipt Not Found
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                This receipt could not be verified. Please check the link or
                contact the Trust.
              </p>
              <Link href="/" className="btn-primary mt-6 inline-flex">
                Home
              </Link>
            </>
          )}
        </div>
      </div>
    </Section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-temple-maroon">{value}</span>
    </div>
  );
}
