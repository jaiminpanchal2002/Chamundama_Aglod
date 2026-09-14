import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Phone } from "lucide-react";
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
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return { title: "Event" };
  const title = event.seoTitle || event.titleEn || event.titleGu;
  return {
    title,
    description: event.seoDesc || event.shortGu || undefined,
    openGraph: {
      title,
      images: event.ogImage || event.coverImage ? [event.ogImage || event.coverImage!] : [],
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getLocale();
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!event || event.status === "DRAFT") notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${siteUrl}/events/${event.slug}`;
  const title = pick(event, "title", locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.titleEn || event.titleGu,
    startDate: event.startAt.toISOString(),
    ...(event.endAt ? { endDate: event.endAt.toISOString() } : {}),
    eventStatus:
      event.status === "CANCELLED"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.location || "Shree Chamunda Dham Aglod",
      address: "Aglod, Vijapur, Gujarat, India",
    },
    ...(event.coverImage ? { image: [`${siteUrl}${event.coverImage}`] } : {}),
  };

  return (
    <>
      <div className="relative h-[45vh] min-h-[320px] w-full">
        <Image
          src={event.coverImage || "/hero/hero-1.svg"}
          alt={title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-temple-burgundy/90 to-transparent" />
        <div className="container-temple absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-temple-cream">
          {event.eventType && (
            <p className="text-sm uppercase tracking-widest text-temple-gold">
              {event.eventType}
            </p>
          )}
          <h1 className="mt-2 font-display text-3xl sm:text-5xl">{title}</h1>
        </div>
      </div>

      <Section tone="cream">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-temple-red" />
              {event.startAt.toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: event.allDay ? undefined : "short",
              })}
            </span>
            {event.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-temple-red" /> {event.location}
              </span>
            )}
            {event.contactPhone && (
              <a href={`tel:${event.contactPhone}`} className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-temple-red" /> {event.contactPhone}
              </a>
            )}
          </div>

          <div className="gold-divider my-6 w-24" />

          <p className="lang-gu whitespace-pre-line leading-relaxed text-muted-foreground">
            {pick(event, "body", locale) || pick(event, "short", locale)}
          </p>

          {event.images.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {event.images.map((img) => (
                <div key={img.id} className="overflow-hidden rounded-temple">
                  <Image
                    src={img.url}
                    alt={img.alt || title}
                    width={400}
                    height={300}
                    className="w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Link href="/events" className="btn-outline">
              ← All events
            </Link>
            <ShareButtons url={url} title={title} />
          </div>
        </div>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
