import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getLocale, translate } from "@/lib/i18n";
import { pick } from "@/lib/i18n/config";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "સમાચાર · Updates",
  description: "Latest news and updates from Shree Chamunda Dham Aglod.",
};

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const locale = await getLocale();
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  return (
    <Section tone="cream" className="pt-28">
      <SectionHeading eyebrow="✦" title={translate(locale, "home.news")} />
      {articles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.05}>
              <Link href={`/updates/${a.slug}`} className="card-temple block h-full overflow-hidden p-0">
                {a.coverImage && (
                  <div className="relative aspect-[16/10]">
                    <Image src={a.coverImage} alt={pick(a, "title", locale)} fill className="object-cover" />
                  </div>
                )}
                <div className="p-5">
                  {a.publishedAt && (
                    <p className="text-xs uppercase tracking-widest text-temple-red">
                      {a.publishedAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  <h3 className="mt-2 font-display text-lg text-temple-maroon">
                    {pick(a, "title", locale)}
                  </h3>
                  {pick(a, "excerpt", locale) && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {pick(a, "excerpt", locale)}
                    </p>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          {translate(locale, "placeholder.trust")}
        </p>
      )}
    </Section>
  );
}
