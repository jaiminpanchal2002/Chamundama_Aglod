/**
 * Seed script — DEMO / SAMPLE data only (spec §72).
 *
 * IMPORTANT: This does NOT contain real temple facts. Timings, campaigns and
 * text below are clearly-labelled samples for the Trust to replace via the
 * admin panel. Verified information (official social links) is included because
 * it was provided by the temple owner.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data…");

  // --- Super admin -------------------------------------------------------
  const email = (process.env.SEED_SUPERADMIN_EMAIL || "admin@chamundadham.example").toLowerCase();
  const password = process.env.SEED_SUPERADMIN_PASSWORD || "ChangeMe!2026";
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: process.env.SEED_SUPERADMIN_NAME || "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`  ✓ Super admin: ${email}`);

  // --- Temple info (PLACEHOLDERS — Trust to provide) ---------------------
  const existingTemple = await prisma.templeInfo.findFirst();
  if (!existingTemple) {
    await prisma.templeInfo.create({
      data: {
        nameGu: "શ્રી ચામુંડા ધામ આગલોડ",
        nameEn: "Shree Chamunda Dham Aglod",
        taglineGu: "માના ચરણોમાં શ્રદ્ધા, સેવા અને સમર્પણ",
        aboutGu:
          "શ્રી ચામુંડા ધામ, આગલોડ વિશેની માહિતી ટ્રસ્ટ દ્વારા આપવામાં આવશે. (નમૂનો)",
        addressGu: "આગલોડ, વિજાપુર, જિ. મહેસાણા, ગુજરાત",
        addressEn: "Aglod, Vijapur, Dist. Mehsana, Gujarat, India",
      },
    });
    console.log("  ✓ Temple info (placeholder)");
  }

  // --- Official social links (verified, provided by owner) ---------------
  const socials = [
    { platform: "instagram", url: "https://www.instagram.com/shreechamundadhamaglod/", order: 1 },
    { platform: "facebook", url: "https://www.facebook.com/chamunda.mata.102/", order: 2 },
    { platform: "youtube", url: "https://www.youtube.com/watch?v=OlGoE5MlUJk", order: 3 },
  ];
  for (const s of socials) {
    const exists = await prisma.socialLink.findFirst({ where: { platform: s.platform } });
    if (!exists) await prisma.socialLink.create({ data: s });
  }
  console.log("  ✓ Social links");

  // --- Homepage sections (toggles) --------------------------------------
  const sections = ["hero", "today", "about", "live", "events", "donation", "gallery", "news", "visit", "social"];
  for (let i = 0; i < sections.length; i++) {
    await prisma.homepageSection.upsert({
      where: { key: sections[i]! },
      update: {},
      create: { key: sections[i]!, order: i, isEnabled: true },
    });
  }

  // --- Darshan timings (SAMPLE — replace) --------------------------------
  if ((await prisma.darshanSchedule.count()) === 0) {
    await prisma.darshanSchedule.createMany({
      data: [
        {
          dayType: "NORMAL",
          labelGu: "સવારના દર્શન (નમૂનો)",
          labelEn: "Morning Darshan (sample)",
          openTime: "06:00",
          closeTime: "12:00",
          morningAarti: "Aarti 07:00",
          order: 1,
        },
        {
          dayType: "NORMAL",
          labelGu: "સાંજના દર્શન (નમૂનો)",
          labelEn: "Evening Darshan (sample)",
          openTime: "16:00",
          closeTime: "21:00",
          eveningAarti: "Aarti 19:00",
          order: 2,
        },
      ],
    });
    console.log("  ✓ Darshan timings (sample)");
  }

  // --- Live darshan setting ---------------------------------------------
  if ((await prisma.liveDarshanSetting.count()) === 0) {
    await prisma.liveDarshanSetting.create({
      data: { status: "OFFLINE", youtubeUrl: "https://www.youtube.com/watch?v=OlGoE5MlUJk" },
    });
  }

  // --- QR + campaigns (SAMPLE) ------------------------------------------
  let qr = await prisma.qrCode.findFirst();
  if (!qr) {
    qr = await prisma.qrCode.create({
      data: {
        name: "Sample Donation QR",
        image: "/hero/hero-2.svg", // placeholder — replace with real QR in admin
        accountLabel: "Replace with the Trust's official QR via Admin → QR Codes",
        isActive: true,
      },
    });
  }
  if ((await prisma.donationCampaign.count()) === 0) {
    await prisma.donationCampaign.createMany({
      data: [
        { slug: "general-donation", nameGu: "સામાન્ય દાન", nameEn: "General Donation", descGu: "મંદિરની સેવા માટે સામાન્ય દાન. (નમૂનો)", order: 1 },
        { slug: "temple-development", nameGu: "મંદિર વિકાસ", nameEn: "Temple Development", descGu: "મંદિર વિકાસ માટે સહયોગ. (નમૂનો)", order: 2 },
        { slug: "annadan", nameGu: "અન્નદાન / પ્રસાદ", nameEn: "Prasad / Annadan", descGu: "પ્રસાદ અને અન્નદાન સેવા. (નમૂનો)", order: 3 },
      ],
    });
    console.log("  ✓ Donation campaigns (sample)");
  }

  // --- Donation settings -------------------------------------------------
  await prisma.siteSetting.upsert({
    where: { key: "donation.presets" },
    update: {},
    create: { key: "donation.presets", group: "donation", value: { amounts: [101, 501, 1001, 2501, 5001], allowCustom: true } },
  });
  await prisma.siteSetting.upsert({
    where: { key: "donation.fields" },
    update: {},
    create: { key: "donation.fields", group: "donation", value: { emailRequired: false, addressRequired: false, panRequired: false, allowAnonymous: true } },
  });

  // --- Demo event --------------------------------------------------------
  if ((await prisma.event.count()) === 0) {
    const start = new Date();
    start.setDate(start.getDate() + 21);
    await prisma.event.create({
      data: {
        slug: "sample-navratri-mahotsav",
        titleGu: "નવરાત્રી મહોત્સવ (નમૂનો)",
        titleEn: "Navratri Mahotsav (sample)",
        shortGu: "આ એક નમૂનારૂપ ઉત્સવ છે. ટ્રસ્ટ દ્વારા વાસ્તવિક ઉત્સવ ઉમેરવામાં આવશે.",
        eventType: "Navratri",
        startAt: start,
        status: "PUBLISHED",
        featured: true,
      },
    });
    console.log("  ✓ Demo event");
  }

  // --- Demo gallery ------------------------------------------------------
  if ((await prisma.galleryItem.count()) === 0) {
    await prisma.galleryItem.createMany({
      data: [
        { type: "IMAGE", url: "/hero/hero-1.svg", captionGu: "દર્શન (નમૂનો)", alt: "Sample darshan", featured: true, order: 1 },
        { type: "IMAGE", url: "/hero/hero-2.svg", captionGu: "મંદિર (નમૂનો)", alt: "Sample temple", order: 2 },
        { type: "IMAGE", url: "/hero/hero-3.svg", captionGu: "ઉત્સવ (નમૂનો)", alt: "Sample festival", order: 3 },
      ],
    });
  }

  console.log("Seed complete. Log in at /admin/login");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
