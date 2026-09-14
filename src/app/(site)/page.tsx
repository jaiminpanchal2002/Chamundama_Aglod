import Link from "next/link";
import Image from "next/image";
import { Clock, Sun, Moon, MapPin, ArrowRight, Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLocale, translate } from "@/lib/i18n";
import { pick } from "@/lib/i18n/config";
import { formatINR, youtubeId } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Hero, type HeroSlideData } from "@/components/site/Hero";

export const dynamic = "force-dynamic";

const HERO_COPY_FALLBACK = {
  invocation: "|| જય મા ચામુંડા ||",
  title: "શ્રી ચામુંડા ધામ આગલોડ",
  subtitle: "માના ચરણોમાં શ્રદ્ધા, સેવા અને સમર્પણ",
};

export default async function HomePage() {
  const locale = await getLocale();
  const now = new Date();

  const [
    slides,
    normalDarshan,
    todayOverride,
    announcement,
    temple,
    live,
    videos,
    events,
    campaigns,
    gallery,
    articles,
  ] = await Promise.all([
    prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.darshanSchedule.findMany({
      where: { isActive: true, dayType: "NORMAL" },
      orderBy: { order: "asc" },
    }),
    prisma.darshanOverride.findFirst({
      where: {
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      },
    }),
    prisma.announcement.findFirst({
      where: {
        isActive: true,
        OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
        AND: [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }],
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    }),
    prisma.templeInfo.findFirst(),
    prisma.liveDarshanSetting.findFirst(),
    prisma.video.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      take: 3,
    }),
    prisma.event.findMany({
      where: { status: "PUBLISHED", startAt: { gte: now } },
      orderBy: { startAt: "asc" },
      take: 3,
    }),
    prisma.donationCampaign.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      take: 3,
    }),
    prisma.galleryItem.findMany({
      where: { isPublished: true, type: "IMAGE" },
      orderBy: [{ featured: "desc" }, { order: "asc" }],
      take: 8,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  const heroSlides: HeroSlideData[] = slides.map((s) => ({
    desktopImage: s.desktopImage,
    mobileImage: s.mobileImage,
    title: pick(s, "title", locale) || undefined,
    subtitle: pick(s, "subtitle", locale) || undefined,
    ctaLabel: locale === "en" ? s.ctaLabelEn : s.ctaLabelGu,
    ctaHref: s.ctaHref,
    alignment: s.alignment,
    overlay: s.overlay,
    focalX: s.focalX,
    focalY: s.focalY,
  }));

  // Fallback hero uses bundled placeholders (replaceable via admin).
  if (heroSlides.length === 0) {
    heroSlides.push(
      ...["/hero/hero-1.svg", "/hero/hero-2.svg", "/hero/hero-3.svg"].map(
        (img) => ({
          desktopImage: img,
          mobileImage: img,
          alignment: "center",
          overlay: 40,
          focalX: 50,
          focalY: 40,
        }),
      ),
    );
  }

  const dateFmt = new Intl.DateTimeFormat(
    locale === "en" ? "en-IN" : locale === "hi" ? "hi-IN" : "gu-IN",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  const todaySchedule = normalDarshan;
  const nextEvent = events[0];

  return (
    <>
      <Hero
        slides={heroSlides}
        copy={{
          ...HERO_COPY_FALLBACK,
          darshan: translate(locale, "cta.darshan"),
          donate: translate(locale, "cta.donate"),
          events: translate(locale, "cta.events"),
        }}
      />

      {/* Devotional intro */}
      <Section tone="white">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-4xl text-temple-gold">॥</span>
            <h2 className="mt-4 font-display text-3xl text-temple-maroon lang-gu">
              જય મા ચામુંડા
            </h2>
            <div className="gold-divider mx-auto mt-5 w-40" />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground lang-gu">
              {temple && pick(temple, "tagline", locale)
                ? pick(temple, "tagline", locale)
                : "શ્રી ચામુંડા ધામ, આગલોડ — શક્તિ, શ્રદ્ધા અને સેવાનું પવિત્ર ધામ. માતાજીના આશીર્વાદ સૌ ભક્તો પર સદા વરસતા રહે."}
            </p>
          </div>
        </Reveal>
      </Section>

      {/* Announcement banner */}
      {announcement && (
        <div className="bg-temple-saffron/15">
          <div className="container-temple flex flex-wrap items-center justify-center gap-3 py-3 text-center text-sm text-temple-maroon">
            <Bell className="h-4 w-4 text-temple-red" />
            <span className="font-medium">{pick(announcement, "title", locale)}</span>
            {announcement.ctaHref && announcement.ctaLabel && (
              <Link
                href={announcement.ctaHref}
                className="font-semibold text-temple-red underline"
              >
                {announcement.ctaLabel}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Today at the temple */}
      <Section tone="cream">
        <SectionHeading
          eyebrow={dateFmt.format(now)}
          title={translate(locale, "home.today")}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {todayOverride && (
            <Reveal className="md:col-span-3">
              <div className="card-temple border-temple-red/40 bg-temple-red/5">
                <p className="eyebrow">Special Timing</p>
                <p className="mt-2 font-medium text-temple-maroon">
                  {pick(todayOverride, "label", locale)}
                </p>
                {todayOverride.note && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {todayOverride.note}
                  </p>
                )}
              </div>
            </Reveal>
          )}
          {todaySchedule.length > 0 ? (
            todaySchedule.map((d, i) => (
              <Reveal key={d.id} delay={i * 0.05}>
                <div className="card-temple h-full">
                  <div className="flex items-center gap-2 text-temple-red">
                    <Clock className="h-5 w-5" />
                    <h3 className="font-display text-lg">
                      {pick(d, "label", locale)}
                    </h3>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {d.openTime && d.closeTime && (
                      <li>
                        {d.openTime} – {d.closeTime}
                      </li>
                    )}
                    {d.morningAarti && (
                      <li className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-temple-saffron" /> {d.morningAarti}
                      </li>
                    )}
                    {d.eveningAarti && (
                      <li className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-temple-maroon" /> {d.eveningAarti}
                      </li>
                    )}
                  </ul>
                </div>
              </Reveal>
            ))
          ) : (
            <Reveal className="md:col-span-3">
              <p className="card-temple text-center text-muted-foreground">
                {translate(locale, "placeholder.trust")}
              </p>
            </Reveal>
          )}
          {nextEvent && (
            <Reveal className="md:col-span-3">
              <Link
                href={`/events/${nextEvent.slug}`}
                className="card-temple flex items-center justify-between gap-4 hover:shadow-gold"
              >
                <div>
                  <p className="eyebrow">{translate(locale, "home.upcoming")}</p>
                  <p className="mt-1 font-medium text-temple-maroon">
                    {pick(nextEvent, "title", locale)}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-temple-red" />
              </Link>
            </Reveal>
          )}
        </div>
      </Section>

      {/* About */}
      <Section tone="white" id="about">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-temple border border-temple-gold/30 shadow-gold">
              <Image
                src="/hero/hero-2.svg"
                alt="Shree Chamunda Dham Aglod"
                fill
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow">✦ {translate(locale, "nav.temple")}</span>
            <h2 className="mt-3 font-display text-3xl text-temple-maroon">
              {temple ? pick(temple, "name", locale) : "શ્રી ચામુંડા ધામ આગલોડ"}
            </h2>
            <div className="gold-divider mt-5 w-24" />
            <p className="mt-6 leading-relaxed text-muted-foreground lang-gu">
              {temple && pick(temple, "about", locale)
                ? pick(temple, "about", locale)
                : translate(locale, "placeholder.trust")}
            </p>
            <Link href="/about" className="btn-outline mt-6">
              {translate(locale, "cta.readMore")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* Live darshan */}
      <Section tone="maroon">
        <SectionHeading
          eyebrow="Live"
          title={translate(locale, "home.live")}
          invert
        />
        <Reveal>
          <div className="mx-auto max-w-4xl">
            <LivePlayer
              live={live}
              offlineText={translate(locale, "live.offline")}
            />
          </div>
        </Reveal>
        {videos.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {videos.map((v) => {
              const id = youtubeId(v.url);
              return (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-temple border border-temple-gold/25"
                >
                  <div className="relative aspect-video bg-black/40">
                    {id && (
                      <Image
                        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                        alt={pick(v, "title", locale)}
                        fill
                        className="object-cover transition group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="p-3 text-sm text-temple-cream/90">
                    {pick(v, "title", locale)}
                  </p>
                </a>
              );
            })}
          </div>
        )}
      </Section>

      {/* Events */}
      <Section tone="cream" id="events">
        <SectionHeading
          eyebrow={translate(locale, "nav.events")}
          title={translate(locale, "home.upcoming")}
        />
        {events.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e, i) => (
              <Reveal key={e.id} delay={i * 0.05}>
                <Link
                  href={`/events/${e.slug}`}
                  className="card-temple group block h-full overflow-hidden p-0"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={e.coverImage || "/hero/hero-3.svg"}
                      alt={pick(e, "title", locale)}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium uppercase tracking-widest text-temple-red">
                      {new Intl.DateTimeFormat(locale === "en" ? "en-IN" : "gu-IN", {
                        day: "numeric",
                        month: "short",
                      }).format(e.startAt)}
                      {e.eventType ? ` • ${e.eventType}` : ""}
                    </p>
                    <h3 className="mt-2 font-display text-xl text-temple-maroon">
                      {pick(e, "title", locale)}
                    </h3>
                    {pick(e, "short", locale) && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {pick(e, "short", locale)}
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
        <div className="mt-8 text-center">
          <Link href="/events" className="btn-outline">
            {translate(locale, "cta.viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* Donation / Seva */}
      <Section tone="white" id="donate">
        <SectionHeading
          eyebrow="✦"
          title={translate(locale, "seva.tagline")}
          subtitle={translate(locale, "home.trust")}
        />
        {campaigns.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.05}>
                <div className="card-temple flex h-full flex-col">
                  <h3 className="font-display text-xl text-temple-maroon">
                    {pick(c, "name", locale)}
                  </h3>
                  {pick(c, "desc", locale) && (
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">
                      {pick(c, "desc", locale)}
                    </p>
                  )}
                  {c.showRaised && c.targetAmount && (
                    <p className="mt-3 text-sm font-medium text-temple-red">
                      {translate(locale, "nav.donate")}: {formatINR(Number(c.targetAmount))}
                    </p>
                  )}
                  <Link
                    href={`/donate?campaign=${c.slug}`}
                    className="btn-primary mt-4"
                  >
                    {translate(locale, "cta.donate")}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <Link href="/donate" className="btn-gold">
              {translate(locale, "cta.donate")}
            </Link>
          </div>
        )}
      </Section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <Section tone="cream" id="gallery">
          <SectionHeading
            eyebrow={translate(locale, "nav.gallery")}
            title={translate(locale, "home.gallery")}
          />
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
            {gallery.map((g, i) => (
              <Reveal key={g.id} delay={(i % 4) * 0.05}>
                <div className="overflow-hidden rounded-temple border border-temple-gold/20">
                  <Image
                    src={g.url}
                    alt={g.alt || pick(g, "caption", locale) || "Darshan"}
                    width={400}
                    height={i % 3 === 0 ? 520 : 400}
                    className="w-full object-cover transition duration-500 hover:scale-[1.03]"
                  />
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/gallery" className="btn-outline">
              {translate(locale, "cta.viewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      )}

      {/* News */}
      {articles.length > 0 && (
        <Section tone="white" id="news">
          <SectionHeading
            eyebrow={translate(locale, "nav.updates")}
            title={translate(locale, "home.news")}
          />
          <div className="grid gap-6 sm:grid-cols-3">
            {articles.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.05}>
                <Link href={`/updates/${a.slug}`} className="card-temple block h-full">
                  {a.publishedAt && (
                    <p className="text-xs uppercase tracking-widest text-temple-red">
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(a.publishedAt)}
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
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* Visit */}
      <Section tone="maroon" id="visit">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow text-temple-gold-soft">✦ {translate(locale, "nav.visit")}</span>
            <h2 className="mt-3 font-display text-3xl text-temple-cream">
              {translate(locale, "home.visit")}
            </h2>
            <div className="gold-divider mt-5 w-24" />
            <p className="mt-6 text-temple-cream/80 lang-gu">
              {temple && pick(temple, "address", locale)
                ? pick(temple, "address", locale)
                : "આગલોડ, વિજાપુર, જિ. મહેસાણા, ગુજરાત"}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {temple?.mapsUrl && (
                <a
                  href={temple.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold"
                >
                  <MapPin className="h-5 w-5" /> {translate(locale, "cta.directions")}
                </a>
              )}
              <Link href="/visit" className="btn-outline text-temple-cream">
                {translate(locale, "cta.readMore")}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="aspect-[4/3] overflow-hidden rounded-temple border border-temple-gold/30">
              {temple?.latitude && temple?.longitude ? (
                <iframe
                  title="Map"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${temple.latitude},${temple.longitude}&z=15&output=embed`}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-temple-burgundy/60 text-center text-temple-cream/60">
                  Map location to be provided by the Trust.
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

function LivePlayer({
  live,
  offlineText,
}: {
  live: { status: string; youtubeUrl?: string | null; embedUrl?: string | null } | null;
  offlineText: string;
}) {
  const url = live?.youtubeUrl || live?.embedUrl;
  const id = url ? youtubeId(url) : null;
  if (live?.status === "LIVE" && (id || live?.embedUrl)) {
    return (
      <div className="aspect-video overflow-hidden rounded-temple border border-temple-gold/30">
        <iframe
          title="Live Darshan"
          className="h-full w-full"
          src={id ? `https://www.youtube.com/embed/${id}` : live.embedUrl!}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <div className="flex aspect-video items-center justify-center rounded-temple border border-temple-gold/30 bg-temple-burgundy/60 text-center">
      <div>
        <span className="mx-auto block h-3 w-3 animate-diya-glow rounded-full bg-temple-gold" />
        <p className="mt-4 text-temple-cream/80">{offlineText}</p>
      </div>
    </div>
  );
}
