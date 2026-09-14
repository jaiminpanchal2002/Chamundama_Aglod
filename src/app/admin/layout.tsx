import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { can, ROLE_LABELS, type Permission } from "@/lib/rbac";
import { Sidebar, type SidebarGroup } from "@/components/admin/Sidebar";
import { signOut } from "@/auth";

export const metadata = { title: { default: "Admin", template: "%s · Admin" } };

// Admin is intentionally plain/fast (spec §30) — no heavy devotional motion.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  const groups: SidebarGroup[] = [
    {
      label: "Overview",
      items: [{ href: "/admin", label: "Dashboard" }],
    },
    {
      label: "Website",
      perm: "content.manage",
      items: [
        { href: "/admin/hero", label: "Hero Slides" },
        { href: "/admin/announcements", label: "Announcements" },
        { href: "/admin/gallery", label: "Gallery" },
      ],
    },
    {
      label: "Temple",
      perm: "temple.manage",
      items: [{ href: "/admin/darshan", label: "Darshan Timings" }],
    },
    {
      label: "Events",
      perm: "events.manage",
      items: [{ href: "/admin/events", label: "Events" }],
    },
    {
      label: "Donations",
      perm: "donations.view",
      items: [
        { href: "/admin/donations", label: "Donations" },
        { href: "/admin/campaigns", label: "Campaigns", perm: "campaigns.manage" },
        { href: "/admin/donations/qr", label: "QR Codes", perm: "qr.manage" },
      ],
    },
    {
      label: "Configuration",
      perm: "settings.manage",
      items: [{ href: "/admin/settings", label: "Website Settings" }],
    },
    {
      label: "Administration",
      perm: "audit.view",
      items: [{ href: "/admin/audit", label: "Audit Log" }],
    },
  ];

  // Filter groups/items by the admin's permissions.
  const visible = groups
    .filter((g) => !g.perm || can(admin.role, g.perm as Permission))
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (i) => !i.perm || can(admin.role, i.perm as Permission),
      ),
    }))
    .filter((g) => g.items.length > 0);

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <Sidebar
        groups={visible}
        user={{ name: admin.name, role: ROLE_LABELS[admin.role] }}
        signOutAction={doSignOut}
      />
      <div className="flex-1 lg:pl-64">
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          <div className="lg:hidden">
            <Link href="/admin" className="font-display text-lg text-temple-maroon">
              ॐ Admin
            </Link>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
