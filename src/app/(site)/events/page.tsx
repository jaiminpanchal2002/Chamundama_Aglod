import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getLocale, translate } from "@/lib/i18n";
import { pick } from "@/lib/i18n/config";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "ઉત્સવ · Events & Festivals",
  description: "Upcoming festivals and events at Shree Chamunda Dham Aglod.",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const locale = await getLocale();
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { status: "PUBLISHED", startAt: { gte: now } },
      orderBy: { startAt: "asc" },
    }),
    prisma.event.findMany({
      where: {
        status: { in: ["PUBLISHED", "COMPLETED"] },
        startAt: { lt: now },
      },
      orderBy: { startAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <Section tone="cream" className="pt-28">
      <SectionHeading
        eyebrow="✦"
        title={translate(locale, "home.upcoming")}
        subtitle="Events & Festivals"
      />

      {upcoming.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((e, i) => (
            <EventCard key={e.id} e={e} locale={locale} delay={i * 0.05} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          {translate(locale, "placeholder.trust")}
        </p>
      )}

      {past.length > 0 && (
        <div className="mt-16">
          <h3 className="mb-6 text-center font-display text-2xl text-temple-maroon">
            Past Events
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((e, i) => (
              <EventCard key={e.id} e={e} locale={locale} delay={i * 0.05} muted />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

function EventCard({
  e,
  locale,
  delay,
  muted,
}: {
  e: {
    slug: string;
    coverImage: string | null;
    startAt: Date;
    eventType: string | null;
    titleGu: string;
    titleHi: string | null;
    titleEn: string | null;
    shortGu: string | null;
    shortHi: string | null;
    shortEn: string | null;
  };
  locale: import("@/lib/i18n/config").Locale;
  delay: number;
  muted?: boolean;
}) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/events/${e.slug}`}
        className={`card-temple group block h-full overflow-hidden p-0 ${muted ? "opacity-80" : ""}`}
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
            {e.startAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
  );
}
