import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n";
import { pick } from "@/lib/i18n/config";
import { Section, SectionHeading } from "@/components/ui/Section";

/**
 * Renders a legal/policy page from the Page CMS model by slug, falling back to
 * a sensible default body until the Trust provides its own content.
 */
export async function PolicyPage({
  slug,
  title,
  fallback,
}: {
  slug: string;
  title: string;
  fallback: string;
}) {
  const locale = await getLocale();
  const page = await prisma.page.findUnique({ where: { slug } }).catch(() => null);
  const body = page && page.isPublished ? pick(page, "body", locale) : "";

  return (
    <Section tone="cream" className="pt-28">
      <SectionHeading eyebrow="✦" title={page ? pick(page, "title", locale) || title : title} />
      <div className="mx-auto max-w-3xl whitespace-pre-line leading-relaxed text-muted-foreground">
        {body || fallback}
      </div>
    </Section>
  );
}
