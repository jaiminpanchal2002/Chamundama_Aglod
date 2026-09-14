import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { PageHeader, Card, Field, SubmitButton } from "@/components/admin/ui";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  createCategory,
  createItem,
  toggleItem,
  deleteItem,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
  await requireAdmin("content.manage");
  const [categories, items] = await Promise.all([
    prisma.galleryCategory.findMany({ orderBy: { order: "asc" } }),
    prisma.galleryItem.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { category: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gallery"
        description="Manage photos and videos. Images upload directly; YouTube/Facebook videos use a URL."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Add image / video</h2>
          <form action={createItem} className="space-y-4">
            <label>
              <span className="admin-label">Type</span>
              <select name="type" className="admin-input" defaultValue="IMAGE">
                <option value="IMAGE">Image</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="VIDEO">Video URL</option>
              </select>
            </label>
            <ImageUploadField name="url" label="Image (upload) or paste URL" folder="gallery" />
            <label>
              <span className="admin-label">Category</span>
              <select name="categoryId" className="admin-input" defaultValue="">
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameGu}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Caption (Gujarati)" name="captionGu" />
            <Field label="Alt text" name="alt" />
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="featured" /> Featured
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isPublished" defaultChecked /> Published
              </label>
            </div>
            <SubmitButton>Add to gallery</SubmitButton>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Add category</h2>
          <form action={createCategory} className="space-y-3">
            <Field label="Name (Gujarati)" name="nameGu" required />
            <Field label="Name (English)" name="nameEn" />
            <Field label="Order" name="order" type="number" defaultValue={0} />
            <SubmitButton variant="secondary">Add category</SubmitButton>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {c.nameGu}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Items ({items.length})</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((it) => (
            <div key={it.id} className="rounded-lg border border-slate-200 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.thumbnail || it.url}
                alt={it.alt || ""}
                className="aspect-square w-full rounded object-cover"
              />
              <p className="mt-1 truncate text-xs text-slate-400">
                {it.type} {it.isPublished ? "" : "· hidden"}
              </p>
              <div className="mt-1 flex gap-1">
                <form action={toggleItem.bind(null, it.id)} className="flex-1">
                  <button className="w-full rounded border border-slate-200 py-0.5 text-[10px] hover:bg-slate-50">
                    {it.isPublished ? "Hide" : "Show"}
                  </button>
                </form>
                <form action={deleteItem.bind(null, it.id)} className="flex-1">
                  <button className="w-full rounded border border-red-200 py-0.5 text-[10px] text-red-600 hover:bg-red-50">
                    Del
                  </button>
                </form>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="col-span-full text-sm text-slate-400">No items yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
