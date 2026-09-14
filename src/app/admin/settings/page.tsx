import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import {
  getMaintenance,
  getWhatsapp,
  getFestival,
  getDonationPresets,
  getDonationFields,
} from "@/lib/settings";
import {
  PageHeader,
  Card,
  Field,
  TextArea,
  SubmitButton,
} from "@/components/admin/ui";
import {
  saveMaintenance,
  saveWhatsapp,
  saveFestival,
  saveDonationConfig,
  saveTempleInfo,
  addSocialLink,
  deleteSocialLink,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  await requireAdmin("settings.manage");
  const [temple, socials, maintenance, whatsapp, festival, presets, fields] =
    await Promise.all([
      prisma.templeInfo.findFirst(),
      prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
      getMaintenance(),
      getWhatsapp(),
      getFestival(),
      getDonationPresets(),
      getDonationFields(),
    ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Website Settings"
        description="Temple information, social links, donation configuration, festival theme and maintenance mode."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Temple information</h2>
          <form action={saveTempleInfo} className="space-y-3">
            <Field label="Name (Gujarati)" name="nameGu" defaultValue={temple?.nameGu} />
            <Field label="Name (English)" name="nameEn" defaultValue={temple?.nameEn} />
            <Field label="Tagline (Gujarati)" name="taglineGu" defaultValue={temple?.taglineGu} />
            <TextArea label="About (Gujarati)" name="aboutGu" defaultValue={temple?.aboutGu} />
            <Field label="Address (Gujarati)" name="addressGu" defaultValue={temple?.addressGu} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" name="phone" defaultValue={temple?.phone} />
              <Field label="Email" name="email" defaultValue={temple?.email} />
            </div>
            <Field label="WhatsApp" name="whatsapp" defaultValue={temple?.whatsapp} />
            <Field label="Google Maps URL" name="mapsUrl" defaultValue={temple?.mapsUrl} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude" name="latitude" defaultValue={temple?.latitude ?? undefined} />
              <Field label="Longitude" name="longitude" defaultValue={temple?.longitude ?? undefined} />
            </div>
            <SubmitButton>Save temple info</SubmitButton>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Social links</h2>
            <div className="mb-4 space-y-2">
              {socials.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="w-24 font-medium capitalize">{s.platform}</span>
                  <span className="flex-1 truncate text-slate-500">{s.url}</span>
                  <form action={deleteSocialLink.bind(null, s.id)}>
                    <button className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600">
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
            <form action={addSocialLink} className="flex flex-wrap items-end gap-2">
              <label className="flex-1">
                <span className="admin-label">Platform</span>
                <select name="platform" className="admin-input">
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="x">X</option>
                </select>
              </label>
              <label className="flex-[2]">
                <span className="admin-label">URL</span>
                <input name="url" className="admin-input" />
              </label>
              <SubmitButton variant="secondary">Add</SubmitButton>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold">WhatsApp button</h2>
            <form action={saveWhatsapp} className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="enabled" defaultChecked={whatsapp.enabled} /> Show floating WhatsApp button
              </label>
              <Field label="Number" name="number" defaultValue={whatsapp.number} placeholder="91XXXXXXXXXX" />
              <TextArea label="Preset message" name="messageGu" defaultValue={whatsapp.messageGu} rows={2} />
              <SubmitButton>Save WhatsApp</SubmitButton>
            </form>
          </Card>
        </div>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Donation configuration</h2>
          <form action={saveDonationConfig} className="space-y-3">
            <Field
              label="Preset amounts (comma separated)"
              name="amounts"
              defaultValue={presets.amounts.join(", ")}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="allowCustom" defaultChecked={presets.allowCustom} /> Allow custom amount
            </label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="emailRequired" defaultChecked={fields.emailRequired} /> Email required
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="addressRequired" defaultChecked={fields.addressRequired} /> Address required
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="panRequired" defaultChecked={fields.panRequired} /> PAN required
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="allowAnonymous" defaultChecked={fields.allowAnonymous} /> Allow anonymous
              </label>
            </div>
            <SubmitButton>Save donation config</SubmitButton>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Festival theme</h2>
          <form action={saveFestival} className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="enabled" defaultChecked={festival.enabled} /> Enable festival theme
            </label>
            <Field label="Festival name" name="name" defaultValue={festival.name} placeholder="Navratri" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="From" name="from" type="datetime-local" defaultValue={festival.from} />
              <Field label="Until" name="until" type="datetime-local" defaultValue={festival.until} />
            </div>
            <Field label="Banner (Gujarati)" name="bannerGu" defaultValue={festival.bannerGu} />
            <SubmitButton>Save festival theme</SubmitButton>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Maintenance mode</h2>
          <form action={saveMaintenance} className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="enabled" defaultChecked={maintenance.enabled} /> Enable maintenance mode (public site only)
            </label>
            <Field label="Message (Gujarati)" name="messageGu" defaultValue={maintenance.messageGu} />
            <Field label="Message (English)" name="messageEn" defaultValue={maintenance.messageEn} />
            <SubmitButton variant="danger">Save maintenance</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
