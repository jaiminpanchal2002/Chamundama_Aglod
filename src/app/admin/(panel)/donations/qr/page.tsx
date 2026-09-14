import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { PageHeader, Card, Field, SubmitButton } from "@/components/admin/ui";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { createQr, toggleQr, deleteQr } from "./actions";

export const dynamic = "force-dynamic";

export default async function QrAdminPage() {
  await requireAdmin("qr.manage");
  const codes = await prisma.qrCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader
        title="Donation QR Codes"
        description="Upload the payment QR shown to devotees. You can change it any time without redeployment. Only publish information meant to be public — never secret banking credentials."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">QR codes</h2>
          <div className="space-y-3">
            {codes.map((q) => (
              <div key={q.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={q.image} alt="" className="h-16 w-16 rounded border object-contain" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{q.name}</p>
                  <p className="text-xs text-slate-400">
                    {q.upiId || "—"} · {q.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <form action={toggleQr.bind(null, q.id)}>
                  <button className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
                    {q.isActive ? "Deactivate" : "Activate"}
                  </button>
                </form>
                <form action={deleteQr.bind(null, q.id)}>
                  <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>
            ))}
            {codes.length === 0 && (
              <p className="text-sm text-slate-400">
                No QR configured. The donate page shows a placeholder until you add one.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Add QR code</h2>
          <form action={createQr} className="space-y-4">
            <Field label="Name" name="name" required placeholder="Temple UPI QR" />
            <ImageUploadField name="image" label="QR image *" folder="qr" />
            <Field label="UPI ID (optional, public)" name="upiId" placeholder="temple@upi" />
            <Field label="Account label (optional)" name="accountLabel" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked /> Active
            </label>
            <SubmitButton>Add QR code</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
