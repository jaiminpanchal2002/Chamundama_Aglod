import Link from "next/link";
import type { DonationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { formatINR } from "@/lib/utils";
import { PageHeader, Card, StatusBadge } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const STATUSES: DonationStatus[] = [
  "PENDING_VERIFICATION",
  "VERIFIED",
  "APPROVED",
  "REJECTED",
  "CLARIFICATION_REQUIRED",
];

export default async function DonationsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin("donations.view");
  const { status, q } = await searchParams;

  const where: Prisma.DonationWhereInput = {};
  if (status && STATUSES.includes(status as DonationStatus)) {
    where.status = status as DonationStatus;
  }
  if (q) {
    where.OR = [
      { publicReferenceNumber: { contains: q, mode: "insensitive" } },
      { transactionReference: { contains: q, mode: "insensitive" } },
      { donor: { name: { contains: q, mode: "insensitive" } } },
      { donor: { mobile: { contains: q } } },
    ];
  }

  const donations = await prisma.donation.findMany({
    where,
    include: { donor: true, campaign: true },
    orderBy: { submittedAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Donations"
        description="Review and verify donation submissions. Verify every transaction against official bank/UPI records before approval."
      />

      <Card className="mb-4">
        <form className="flex flex-wrap items-end gap-3" method="get">
          <label className="flex-1">
            <span className="admin-label">Search</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Reference, UTR, name, mobile"
              className="admin-input"
            />
          </label>
          <label>
            <span className="admin-label">Status</span>
            <select name="status" defaultValue={status} className="admin-input">
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <button className="rounded-md bg-temple-maroon px-4 py-2 text-sm font-medium text-white">
            Filter
          </button>
        </form>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">Reference</th>
              <th className="p-3">Donor</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Campaign</th>
              <th className="p-3">Status</th>
              <th className="p-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr
                key={d.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="p-3">
                  <Link
                    href={`/admin/donations/${d.id}`}
                    className="font-mono font-medium text-temple-maroon hover:underline"
                  >
                    {d.publicReferenceNumber}
                  </Link>
                </td>
                <td className="p-3">
                  {d.donor.anonymous ? (
                    <span className="text-slate-400">Anonymous</span>
                  ) : (
                    <>
                      <span className="block">{d.donor.name}</span>
                      <span className="text-xs text-slate-400">
                        {d.donor.mobile}
                      </span>
                    </>
                  )}
                </td>
                <td className="p-3 font-medium">
                  {formatINR(Number(d.amount))}
                </td>
                <td className="p-3 text-slate-500">
                  {d.campaign?.nameEn || d.campaign?.nameGu || "General"}
                </td>
                <td className="p-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="p-3 text-slate-500">
                  {d.submittedAt.toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No donations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
