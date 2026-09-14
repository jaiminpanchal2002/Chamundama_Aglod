import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getLocale, translate } from "@/lib/i18n";
import { pick } from "@/lib/i18n/config";
import { Section, SectionHeading } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "મંદિર વિશે · About",
  description:
    "About Shree Chamunda Dham Aglod — Maa Chamunda, temple story, spiritual significance and traditions.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const locale = await getLocale();
  const temple = await prisma.templeInfo.findFirst();
  const placeholder = translate(locale, "placeholder.trust");

  const about = temple ? pick(temple, "about", locale) : "";
  const history = temple ? pick(temple, "history", locale) : "";

  return (
    <>
      <Section tone="cream" className="pt-28">
        <SectionHeading
          eyebrow="✦ Maa Chamunda"
          title={temple ? pick(temple, "name", locale) : "શ્રી ચામુંડા ધામ આગલોડ"}
          subtitle={temple ? pick(temple, "tagline", locale) : undefined}
        />
        <div className="prose-temple mx-auto max-w-3xl space-y-6 text-muted-foreground">
          <p className="lang-gu whitespace-pre-line">{about || placeholder}</p>
        </div>
      </Section>

      <Section tone="white">
        <SectionHeading eyebrow="Temple Story" title="ઇતિહાસ · History" />
        <div className="mx-auto max-w-3xl">
          <p className="lang-gu whitespace-pre-line text-muted-foreground">
            {history || placeholder}
          </p>
        </div>
      </Section>
    </>
  );
}
