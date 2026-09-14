import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { formatINR } from "@/lib/utils";
import {
  PageHeader,
  Card,
  Field,
  TextArea,
  SubmitButton,
} from "@/components/admin/ui";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { createCampaign, toggleCampaign, deleteCampaign } from "./actions";

export const dynamic = "force-dynamic";

export default async function CampaignsAdminPage() {
  await requireAdmin("campaigns.manage");
  const campaigns = await prisma.donationCampaign.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Donation Campaigns"
        description="Configure the causes devotees can donate to. The Trust decides the actual categories."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Campaigns</h2>
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                <div className="flex-1">
                  <p className="font-medium">{c.nameGu}</p>
                  <p className="text-xs text-slate-400">
                    /{c.slug} · {c.isActive ? "Active" : "Hidden"}
                    {c.targetAmount ? ` · target ${formatINR(Number(c.targetAmount))}` : ""}
                  </p>
                </div>
                <form action={toggleCampaign.bind(null, c.id)}>
                  <button className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
                    {c.isActive ? "Hide" : "Show"}
                  </button>
                </form>
                <form action={deleteCampaign.bind(null, c.id)}>
                  <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>
            ))}
            {campaigns.length === 0 && (
              <p className="text-sm text-slate-400">No campaigns yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">New campaign</h2>
          <form action={createCampaign} className="space-y-4">
            <Field label="Name (Gujarati)" name="nameGu" required />
            <Field label="Name (English)" name="nameEn" />
            <TextArea label="Description (Gujarati)" name="descGu" />
            <ImageUploadField name="image" label="Image (optional)" folder="campaigns" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Target amount ₹ (optional)" name="targetAmount" type="number" />
              <Field label="Order" name="order" type="number" defaultValue={0} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="showRaised" /> Show target publicly
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked /> Active
            </label>
            <SubmitButton>Create campaign</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
