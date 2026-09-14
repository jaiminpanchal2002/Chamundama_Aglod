import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { can } from "@/lib/rbac";
import { formatINR } from "@/lib/utils";
import { signStorageKey } from "@/lib/storage";
import { PageHeader, Card, StatusBadge } from "@/components/admin/ui";
import { DonationActions } from "./DonationActions";

export const dynamic = "force-dynamic";

export default async function DonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin("donations.view");
  const { id } = await params;

  const donation = await prisma.donation.findUnique({
    where: { id },
    include: {
      donor: true,
      campaign: true,
      proofs: true,
      receipt: true,
      statusHistory: {
        include: { changedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!donation) notFound();

  const proofs = donation.proofs.map((p) => ({
    id: p.id,
    mimeType: p.mimeType,
    url: `/api/admin/proof?token=${encodeURIComponent(signStorageKey(p.privateStorageKey, 300))}`,
  }));

  return (
    <div>
      <PageHeader
        title={donation.publicReferenceNumber}
        description="Donation detail & verification"
        action={
          <Link href="/admin/donations" className="text-sm text-slate-500 hover:underline">
            ← Back to list
          </Link>
        }
      />

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        A payment screenshot is not sufficient proof of payment. Verify this
        transaction with official bank/UPI records before approval.
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Donation</h2>
              <StatusBadge status={donation.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Detail label="Amount" value={formatINR(Number(donation.amount))} />
              <Detail label="Currency" value={donation.currency} />
              <Detail
                label="Campaign"
                value={donation.campaign?.nameEn || donation.campaign?.nameGu || "General Donation"}
              />
              <Detail label="Purpose" value={donation.purpose || "—"} />
              <Detail label="Payment method" value={donation.paymentMethod || "—"} />
              <Detail label="Transaction Ref / UTR" value={donation.transactionReference || "—"} />
              <Detail
                label="Payment date"
                value={donation.paymentDate?.toLocaleDateString("en-IN") || "—"}
              />
              <Detail
                label="Submitted"
                value={donation.submittedAt.toLocaleString("en-IN")}
              />
            </dl>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">Donor</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Detail label="Name" value={donation.donor.anonymous ? "Anonymous (hidden publicly)" : donation.donor.name} />
              <Detail label="Mobile" value={donation.donor.mobile} />
              <Detail label="Email" value={donation.donor.email || "—"} />
              <Detail label="City" value={donation.donor.city || "—"} />
              <Detail label="State" value={donation.donor.state || "—"} />
              <Detail label="PAN" value={donation.donor.pan || "—"} />
            </dl>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">Payment proof (private)</h2>
            {proofs.length === 0 && (
              <p className="text-sm text-slate-400">No proof uploaded.</p>
            )}
            <div className="space-y-4">
              {proofs.map((p) => (
                <div key={p.id}>
                  {p.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.url}
                      alt="Payment proof"
                      className="max-h-96 rounded-lg border border-slate-200"
                    />
                  ) : (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      Open proof ({p.mimeType})
                    </a>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Access links expire in 5 minutes and every view is audit-logged.
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Actions</h2>
            <DonationActions
              donationId={donation.id}
              status={donation.status}
              canVerify={can(admin.role, "donations.verify")}
              canApprove={can(admin.role, "donations.approve")}
            />
            {donation.rejectionReason && (
              <p className="mt-3 rounded bg-red-50 p-2 text-xs text-red-700">
                Rejection reason (shown to donor): {donation.rejectionReason}
              </p>
            )}
          </Card>

          {donation.receipt && (
            <Card>
              <h2 className="mb-2 text-lg font-semibold">Receipt</h2>
              <p className="font-mono text-sm text-temple-maroon">
                {donation.receipt.receiptNumber}
              </p>
              <a
                href={`/api/receipts/${donation.receipt.verificationToken}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-sm text-blue-600 hover:underline"
              >
                Download receipt PDF
              </a>
            </Card>
          )}

          <Card>
            <h2 className="mb-3 text-lg font-semibold">Status history</h2>
            <ol className="space-y-3 text-sm">
              {donation.statusHistory.map((h) => (
                <li key={h.id} className="border-l-2 border-slate-200 pl-3">
                  <p className="font-medium">
                    {h.previousStatus ? `${h.previousStatus} → ` : ""}
                    {h.newStatus}
                  </p>
                  <p className="text-xs text-slate-400">
                    {h.createdAt.toLocaleString("en-IN")}
                    {h.changedBy ? ` · ${h.changedBy.name}` : ""}
                  </p>
                  {h.reason && (
                    <p className="mt-1 text-xs text-slate-500">{h.reason}</p>
                  )}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-800">{value}</dd>
    </div>
  );
}
