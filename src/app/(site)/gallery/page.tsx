import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getLocale, translate } from "@/lib/i18n";
import { pick } from "@/lib/i18n/config";
import { Section, SectionHeading } from "@/components/ui/Section";
import { GalleryGrid, type GalleryEntry } from "@/features/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: "ગેલેરી · Gallery",
  description: "Photo and video darshan gallery of Shree Chamunda Dham Aglod.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const locale = await getLocale();
  const [items, categories] = await Promise.all([
    prisma.galleryItem.findMany({
      where: { isPublished: true },
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      take: 120,
    }),
    prisma.galleryCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ]);

  const entries: GalleryEntry[] = items.map((it) => ({
    id: it.id,
    type: it.type,
    url: it.url,
    thumbnail: it.thumbnail,
    caption: pick(it, "caption", locale) || undefined,
    alt: it.alt || undefined,
  }));

  return (
    <Section tone="cream" className="pt-28">
      <SectionHeading
        eyebrow="✦"
        title={translate(locale, "home.gallery")}
        subtitle="દર્શન ગેલેરી"
      />
      {entries.length > 0 ? (
        <GalleryGrid
          items={entries}
          categories={categories.map((c) => ({ slug: c.slug, name: pick(c, "name", locale) }))}
        />
      ) : (
        <p className="text-center text-muted-foreground">
          {translate(locale, "placeholder.trust")}
        </p>
      )}
    </Section>
  );
}
