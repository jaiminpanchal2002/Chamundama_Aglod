import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { PageHeader, Card, Field, SubmitButton } from "@/components/admin/ui";
import {
  createSchedule,
  deleteSchedule,
  createOverride,
  deleteOverride,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function DarshanAdminPage() {
  await requireAdmin("temple.manage");
  const [schedules, overrides] = await Promise.all([
    prisma.darshanSchedule.findMany({ orderBy: [{ dayType: "asc" }, { order: "asc" }] }),
    prisma.darshanOverride.findMany({ orderBy: { date: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Darshan & Aarti Timings"
        description="Manage regular timings and date-specific overrides (e.g. Navratri, festival closures)."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Timings</h2>
          <div className="space-y-3">
            {schedules.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                <div className="flex-1">
                  <p className="font-medium">{s.labelGu}</p>
                  <p className="text-xs text-slate-400">
                    {s.dayType} · {s.openTime}–{s.closeTime}
                    {s.morningAarti ? ` · ${s.morningAarti}` : ""}
                  </p>
                </div>
                <form action={deleteSchedule.bind(null, s.id)}>
                  <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>
            ))}
            {schedules.length === 0 && (
              <p className="text-sm text-slate-400">
                No timings set. Content to be provided by the Trust.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Add timing</h2>
          <form action={createSchedule} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="admin-label">Day type</span>
                <select name="dayType" className="admin-input" defaultValue="NORMAL">
                  <option value="NORMAL">Normal</option>
                  <option value="WEEKEND">Weekend</option>
                  <option value="FESTIVAL">Festival</option>
                </select>
              </label>
              <Field label="Order" name="order" type="number" defaultValue={0} />
            </div>
            <Field label="Label (Gujarati)" name="labelGu" required placeholder="સવારના દર્શન" />
            <Field label="Label (English)" name="labelEn" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Open time" name="openTime" placeholder="05:30" />
              <Field label="Close time" name="closeTime" placeholder="21:00" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Morning Aarti" name="morningAarti" placeholder="06:00" />
              <Field label="Evening Aarti" name="eveningAarti" placeholder="19:00" />
            </div>
            <Field label="Bhog time" name="bhogTime" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked /> Active
            </label>
            <SubmitButton>Add timing</SubmitButton>
          </form>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Date overrides</h2>
          <div className="space-y-3">
            {overrides.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                <div className="flex-1">
                  <p className="font-medium">
                    {o.date.toLocaleDateString("en-IN")} — {o.labelGu}
                  </p>
                  <p className="text-xs text-slate-400">
                    {o.isClosed ? "Closed" : `${o.openTime}–${o.closeTime}`}
                  </p>
                </div>
                <form action={deleteOverride.bind(null, o.id)}>
                  <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>
            ))}
            {overrides.length === 0 && (
              <p className="text-sm text-slate-400">No overrides.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Add override</h2>
          <form action={createOverride} className="space-y-3">
            <Field label="Date" name="date" type="date" required />
            <Field label="Label (Gujarati)" name="labelGu" required placeholder="નવરાત્રી વિશેષ" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Open time" name="openTime" />
              <Field label="Close time" name="closeTime" />
            </div>
            <Field label="Special Aarti" name="specialAarti" />
            <Field label="Note" name="note" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isClosed" /> Temple closed this day
            </label>
            <SubmitButton>Add override</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
