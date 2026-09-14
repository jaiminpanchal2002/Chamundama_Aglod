import { prisma } from "@/lib/prisma";
import { getLocale, translate } from "@/lib/i18n";
import { pick, type Locale } from "@/lib/i18n/config";
import { getMaintenance, getWhatsapp, getAudio } from "@/lib/settings";
import { Navbar, type NavItem } from "@/components/site/Navbar";
import { Footer, type FooterSocial } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { AudioToggle } from "@/components/site/AudioToggle";

async function getNavItems(locale: Locale): Promise<NavItem[]> {
  const rows = await prisma.navigationItem
    .findMany({
      where: { group: "HEADER", isActive: true, parentId: null },
      orderBy: { order: "asc" },
    })
    .catch(() => []);
  if (rows.length > 0) {
    return rows.map((r) => ({
      label: pick(r, "label", locale) || r.labelGu,
      href: r.href,
    }));
  }
  // Default nav (used until the Trust customises it in the admin panel).
  return [
    { label: translate(locale, "nav.temple"), href: "/about" },
    { label: translate(locale, "nav.darshan"), href: "/darshan" },
    { label: translate(locale, "nav.events"), href: "/events" },
    { label: translate(locale, "nav.gallery"), href: "/gallery" },
    { label: translate(locale, "nav.trust"), href: "/trust" },
    { label: translate(locale, "nav.updates"), href: "/updates" },
    { label: translate(locale, "nav.visit"), href: "/visit" },
  ];
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const [temple, socialRows, nav, maintenance, whatsapp, audio] =
    await Promise.all([
      prisma.templeInfo.findFirst().catch(() => null),
      prisma.socialLink
        .findMany({ where: { isActive: true }, orderBy: { order: "asc" } })
        .catch(() => []),
      getNavItems(locale),
      getMaintenance(),
      getWhatsapp(),
      getAudio(),
    ]);

  const brand = temple ? pick(temple, "name", locale) : "શ્રી ચામુંડા ધામ આગલોડ";
  const social: FooterSocial[] = socialRows
    .filter((s) => s.platform !== "whatsapp")
    .map((s) => ({ platform: s.platform, url: s.url }));

  // Maintenance mode (spec §55) — admins reach /admin directly (separate group).
  if (maintenance.enabled) {
    const msg =
      (locale === "en" ? maintenance.messageEn : maintenance.messageGu) ||
      "The website is undergoing maintenance. Please visit again soon.";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-temple-gradient p-8 text-center text-temple-cream">
        <span className="text-5xl text-temple-gold">ॐ</span>
        <h1 className="mt-6 font-display text-3xl">{brand}</h1>
        <p className="mt-4 max-w-md text-temple-cream/80">{msg}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar
        locale={locale}
        items={nav}
        donateLabel={translate(locale, "nav.donate")}
        brand={brand}
      />
      <main className="min-h-screen">{children}</main>
      <Footer
        brand={brand}
        address={temple ? pick(temple, "address", locale) : null}
        phone={temple?.phone ?? null}
        email={temple?.email ?? null}
        quickLinks={nav}
        social={social}
        rightsText={translate(locale, "footer.rights")}
      />
      {whatsapp.enabled && whatsapp.number && (
        <WhatsAppButton number={whatsapp.number} message={whatsapp.messageGu} />
      )}
      {audio.enabled && audio.url && (
        <AudioToggle
          url={audio.url}
          label={translate(locale, "audio.ambience")}
          defaultVolume={audio.defaultVolume}
        />
      )}
    </>
  );
}
