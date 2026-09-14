import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import {
  PageHeader,
  Card,
  Field,
  TextArea,
  SubmitButton,
  StatusBadge,
} from "@/components/admin/ui";
import {
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AnnouncementsAdminPage() {
  await requireAdmin("content.manage");
  const items = await prisma.announcement.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Urgent notices, festival messages and appeals. Expired announcements stop showing automatically."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Announcements</h2>
          <div className="space-y-3">
            {items.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.titleGu}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {a.display} · priority {a.priority}
                    {a.expiryDate
                      ? ` · until ${a.expiryDate.toLocaleDateString("en-IN")}`
                      : ""}
                  </p>
                </div>
                <span>
                  <StatusBadge status={a.isActive ? "PUBLISHED" : "DRAFT"} />
                </span>
                <form action={toggleAnnouncement.bind(null, a.id)}>
                  <button className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
                    {a.isActive ? "Disable" : "Enable"}
                  </button>
                </form>
                <form action={deleteAnnouncement.bind(null, a.id)}>
                  <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-slate-400">No announcements.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">New announcement</h2>
          <form action={createAnnouncement} className="space-y-4">
            <Field label="Title (Gujarati)" name="titleGu" required />
            <Field label="Title (English)" name="titleEn" />
            <TextArea label="Message (Gujarati)" name="bodyGu" />
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="admin-label">Display</span>
                <select name="display" className="admin-input" defaultValue="TICKER">
                  <option value="TICKER">Ticker</option>
                  <option value="BANNER">Top banner</option>
                  <option value="POPUP">Popup</option>
                  <option value="CARD">Card</option>
                </select>
              </label>
              <Field label="Priority" name="priority" type="number" defaultValue={0} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="CTA label" name="ctaLabel" />
              <Field label="CTA link" name="ctaHref" placeholder="/events" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date" name="startDate" type="date" />
              <Field label="Expiry date" name="expiryDate" type="date" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked /> Active
            </label>
            <SubmitButton>Create announcement</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
