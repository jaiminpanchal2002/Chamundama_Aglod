import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { PageHeader, Card, Field, SubmitButton } from "@/components/admin/ui";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { createHeroSlide, toggleHeroSlide, deleteHeroSlide } from "./actions";

export const dynamic = "force-dynamic";

export default async function HeroAdminPage() {
  await requireAdmin("content.manage");
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <PageHeader
        title="Hero Slides"
        description="Cinematic homepage hero. Slides cross-fade automatically. Upload high-quality images; Maa's face must not be cropped."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Current slides</h2>
          <div className="space-y-3">
            {slides.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.desktopImage}
                  alt=""
                  className="h-14 w-24 rounded object-cover"
                />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{s.titleGu || "(no title)"}</p>
                  <p className="text-xs text-slate-400">
                    Order {s.order} · {s.isActive ? "Active" : "Hidden"}
                  </p>
                </div>
                <form action={toggleHeroSlide.bind(null, s.id)}>
                  <button className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
                    {s.isActive ? "Hide" : "Show"}
                  </button>
                </form>
                <form action={deleteHeroSlide.bind(null, s.id)}>
                  <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>
            ))}
            {slides.length === 0 && (
              <p className="text-sm text-slate-400">
                No slides yet — the site shows placeholder art until you add one.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Add slide</h2>
          <form action={createHeroSlide} className="space-y-4">
            <ImageUploadField
              name="desktopImage"
              label="Desktop image *"
              folder="hero"
            />
            <ImageUploadField
              name="mobileImage"
              label="Mobile image (optional)"
              folder="hero"
            />
            <Field label="Title (Gujarati)" name="titleGu" />
            <Field label="Title (Hindi)" name="titleHi" />
            <Field label="Title (English)" name="titleEn" />
            <Field label="Subtitle (Gujarati)" name="subtitleGu" />
            <div className="grid grid-cols-3 gap-3">
              <label>
                <span className="admin-label">Alignment</span>
                <select name="alignment" className="admin-input" defaultValue="center">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>
              <Field label="Overlay %" name="overlay" type="number" defaultValue={45} />
              <Field label="Order" name="order" type="number" defaultValue={0} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Focal X %" name="focalX" type="number" defaultValue={50} />
              <Field label="Focal Y %" name="focalY" type="number" defaultValue={50} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked /> Active
            </label>
            <SubmitButton>Add slide</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
