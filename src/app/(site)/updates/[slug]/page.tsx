import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n";
import { pick } from "@/lib/i18n/config";
import { Section } from "@/components/ui/Section";
import { ShareButtons } from "@/components/site/ShareButtons";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await prisma.article.findUnique({ where: { slug } });
  if (!a) return { title: "Update" };
  return {
    title: a.seoTitle || a.titleEn || a.titleGu,
    description: a.seoDesc || a.excerptGu || undefined,
    openGraph: { images: a.ogImage || a.coverImage ? [a.ogImage || a.coverImage!] : [] },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getLocale();
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || article.status !== "PUBLISHED") notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const title = pick(article, "title", locale);

  return (
    <Section tone="cream" className="pt-28">
      <article className="mx-auto max-w-3xl">
        {article.publishedAt && (
          <p className="text-sm uppercase tracking-widest text-temple-red">
            {article.publishedAt.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
        <h1 className="mt-2 font-display text-3xl text-temple-maroon sm:text-4xl">
          {title}
        </h1>
        <div className="gold-divider my-6 w-24" />
        {article.coverImage && (
          <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-temple">
            <Image src={article.coverImage} alt={title} fill className="object-cover" />
          </div>
        )}
        <div className="lang-gu whitespace-pre-line leading-relaxed text-muted-foreground">
          {pick(article, "body", locale)}
        </div>
        <div className="mt-8 flex items-center justify-between">
          <Link href="/updates" className="btn-outline">
            ← All updates
          </Link>
          <ShareButtons url={`${siteUrl}/updates/${article.slug}`} title={title} />
        </div>
      </article>
    </Section>
  );
}
