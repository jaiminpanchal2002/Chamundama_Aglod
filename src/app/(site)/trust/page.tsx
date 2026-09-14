import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getLocale, translate } from "@/lib/i18n";
import { pick } from "@/lib/i18n/config";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "ટ્રસ્ટ · Trust",
  description: "About the Trust behind Shree Chamunda Dham Aglod and its service activities.",
};

export const dynamic = "force-dynamic";

export default async function TrustPage() {
  const locale = await getLocale();
  const [trust, trustees] = await Promise.all([
    prisma.trust.findFirst(),
    prisma.trustee.findMany({
      where: { isPublic: true },
      orderBy: { order: "asc" },
    }),
  ]);
  const placeholder = translate(locale, "placeholder.trust");

  return (
    <>
      <Section tone="cream" className="pt-28">
        <SectionHeading
          eyebrow="✦ Trust"
          title={trust?.legalName || "શ્રી ચામુંડા ધામ આગલોડ ટ્રસ્ટ"}
        />
        <div className="mx-auto max-w-3xl space-y-6 text-muted-foreground">
          <p className="lang-gu whitespace-pre-line">
            {trust ? pick(trust, "story", locale) || placeholder : placeholder}
          </p>
          {trust && pick(trust, "mission", locale) && (
            <div>
              <h3 className="font-display text-xl text-temple-maroon">Mission</h3>
              <p className="lang-gu mt-2 whitespace-pre-line">{pick(trust, "mission", locale)}</p>
            </div>
          )}
          {trust?.registrationNo && (
            <p className="text-sm text-temple-red">
              Reg. No: {trust.registrationNo}
            </p>
          )}
        </div>
      </Section>

      {trustees.length > 0 && (
        <Section tone="white">
          <SectionHeading eyebrow="✦" title="Trustees" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustees.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.05}>
                <div className="card-temple text-center">
                  {t.photo ? (
                    <Image
                      src={t.photo}
                      alt={t.name}
                      width={96}
                      height={96}
                      className="mx-auto h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-temple-cream text-2xl text-temple-gold">
                      ॐ
                    </div>
                  )}
                  <h3 className="mt-3 font-medium text-temple-maroon">{t.name}</h3>
                  {pick(t, "position", locale) && (
                    <p className="text-sm text-muted-foreground">
                      {pick(t, "position", locale)}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
