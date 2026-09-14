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
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { createEvent, setEventStatus, deleteEvent } from "./actions";

export const dynamic = "force-dynamic";

export default async function EventsAdminPage() {
  await requireAdmin("events.manage");
  const events = await prisma.event.findMany({ orderBy: { startAt: "desc" } });

  return (
    <div>
      <PageHeader
        title="Events & Festivals"
        description="Create events. Published events appear on the site and calendar; past events move to history automatically."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Events</h2>
          <div className="space-y-3">
            {events.map((e) => (
              <div key={e.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{e.titleGu}</p>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {e.startAt.toLocaleDateString("en-IN")} · /{e.slug}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {e.status !== "PUBLISHED" && (
                    <form action={setEventStatus.bind(null, e.id, "PUBLISHED")}>
                      <button className="rounded border border-green-300 px-2 py-1 text-xs text-green-700 hover:bg-green-50">
                        Publish
                      </button>
                    </form>
                  )}
                  {e.status === "PUBLISHED" && (
                    <form action={setEventStatus.bind(null, e.id, "DRAFT")}>
                      <button className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
                        Unpublish
                      </button>
                    </form>
                  )}
                  <form action={setEventStatus.bind(null, e.id, "CANCELLED")}>
                    <button className="rounded border border-orange-300 px-2 py-1 text-xs text-orange-700 hover:bg-orange-50">
                      Cancel
                    </button>
                  </form>
                  <form action={deleteEvent.bind(null, e.id)}>
                    <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-slate-400">No events yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">New event</h2>
          <form action={createEvent} className="space-y-4">
            <Field label="Title (Gujarati)" name="titleGu" required />
            <Field label="Title (English)" name="titleEn" />
            <Field label="Event type" name="eventType" placeholder="Navratri / Yagna / Maha Aarti" />
            <TextArea label="Short description (Gujarati)" name="shortGu" rows={2} />
            <TextArea label="Full description (Gujarati)" name="bodyGu" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date/time" name="startAt" type="datetime-local" required />
              <Field label="End date/time" name="endAt" type="datetime-local" />
            </div>
            <ImageUploadField name="coverImage" label="Cover image" folder="events" />
            <Field label="Location" name="location" />
            <Field label="Google Maps URL" name="mapsUrl" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact phone" name="contactPhone" />
              <Field label="WhatsApp" name="whatsapp" />
            </div>
            <label>
              <span className="admin-label">Status</span>
              <select name="status" className="admin-input" defaultValue="DRAFT">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="featured" /> Featured
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="registrationNeeded" /> Registration needed
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="allDay" /> All day
              </label>
            </div>
            <SubmitButton>Create event</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
