import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n";
import { pick } from "@/lib/i18n/config";
import { getDonationPresets, getDonationFields } from "@/lib/settings";
import { Section, SectionHeading } from "@/components/ui/Section";
import {
  DonateWizard,
  type WizardCampaign,
  type WizardQr,
} from "@/features/donation/DonateWizard";

export const metadata: Metadata = {
  title: "સેવા / દાન · Donate",
  description:
    "Support Shree Chamunda Dham Aglod through seva and donation. Submit your donation details securely; the Trust verifies every payment before issuing a receipt.",
};

export const dynamic = "force-dynamic";

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const locale = await getLocale();
  const { campaign: initialCampaign } = await searchParams;

  const [campaignRows, presets, fields, generalQr] = await Promise.all([
    prisma.donationCampaign.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { qrCode: true },
    }),
    getDonationPresets(),
    getDonationFields(),
    prisma.qrCode.findFirst({ where: { isActive: true } }),
  ]);

  const campaigns: WizardCampaign[] = campaignRows.map((c) => ({
    slug: c.slug,
    name: pick(c, "name", locale),
    desc: pick(c, "desc", locale) || undefined,
  }));

  const active = campaignRows.find((c) => c.slug === initialCampaign);
  const qrRow = active?.qrCode ?? generalQr;
  const qr: WizardQr | null = qrRow
    ? {
        image: qrRow.image,
        upiId: qrRow.upiId,
        accountLabel: qrRow.accountLabel,
      }
    : null;

  return (
    <Section tone="cream" className="pt-28">
      <SectionHeading
        eyebrow="સેવા એ જ સાધના"
        title="સેવા / દાન · Donate"
        subtitle="Your contribution supports the temple and its seva. Every payment is manually verified by the Trust before a receipt is issued."
      />
      <DonateWizard
        campaigns={campaigns}
        qr={qr}
        presets={presets}
        fields={fields}
        initialCampaign={initialCampaign}
      />
    </Section>
  );
}
