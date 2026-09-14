import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { can } from "@/lib/rbac";
import { formatINR } from "@/lib/utils";
import { PageHeader, StatCard, Card } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const showDonations = can(admin.role, "donations.view");

  const [
    pendingDonations,
    upcomingEvents,
    pendingContacts,
    pendingVolunteers,
    activeAnnouncements,
    galleryCount,
    approvedMonth,
  ] = await Promise.all([
    showDonations
      ? prisma.donation.count({ where: { status: "PENDING_VERIFICATION" } })
      : Promise.resolve(0),
    prisma.event.count({
      where: { status: "PUBLISHED", startAt: { gte: now } },
    }),
    prisma.contactSubmission.count({ where: { status: "NEW" } }),
    prisma.volunteerApplication.count({ where: { status: "NEW" } }),
    prisma.announcement.count({ where: { isActive: true } }),
    prisma.galleryItem.count(),
    showDonations
      ? prisma.donation.aggregate({
          where: { status: "APPROVED", approvedAt: { gte: monthStart } },
          _sum: { amount: true },
          _count: true,
        })
      : Promise.resolve({ _sum: { amount: null }, _count: 0 }),
  ]);

  return (
    <div>
      <PageHeader
        title={`જય માતાજી, ${admin.name}`}
        description="Trust administration overview"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {showDonations && (
          <StatCard
            label="Pending verification"
            value={pendingDonations}
            tone={pendingDonations > 0 ? "warn" : "default"}
          />
        )}
        <StatCard label="Upcoming events" value={upcomingEvents} />
        <StatCard
          label="New contact requests"
          value={pendingContacts}
          tone={pendingContacts > 0 ? "warn" : "default"}
        />
        <StatCard label="Active announcements" value={activeAnnouncements} />
        {showDonations && (
          <>
            <StatCard
              label="Approved this month"
              value={approvedMonth._count}
              tone="good"
            />
            <StatCard
              label="Verified amount (month)"
              value={formatINR(Number(approvedMonth._sum.amount ?? 0))}
              tone="good"
            />
          </>
        )}
        <StatCard label="New volunteers" value={pendingVolunteers} />
        <StatCard label="Gallery items" value={galleryCount} />
      </div>

      <Card className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {can(admin.role, "content.manage") && (
            <>
              <QuickLink href="/admin/hero" label="Change Hero" />
              <QuickLink href="/admin/announcements" label="New Announcement" />
              <QuickLink href="/admin/gallery" label="Upload Gallery" />
            </>
          )}
          {can(admin.role, "events.manage") && (
            <QuickLink href="/admin/events" label="Add Event" />
          )}
          {can(admin.role, "temple.manage") && (
            <QuickLink href="/admin/darshan" label="Update Timings" />
          )}
          {showDonations && (
            <QuickLink href="/admin/donations" label="Review Donations" />
          )}
        </div>
      </Card>

      {showDonations && pendingDonations > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>{pendingDonations}</strong> donation(s) awaiting
          verification. Always verify each transaction against official
          bank/UPI records before approval.
        </div>
      )}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-temple-gold hover:bg-white"
    >
      {label}
    </Link>
  );
}
