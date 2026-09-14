import type { Metadata } from "next";
import { MapPin, Phone, Mail, Navigation } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLocale, translate } from "@/lib/i18n";
import { pick } from "@/lib/i18n/config";
import { Section, SectionHeading } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "પધારો · Visit",
  description:
    "Visit Shree Chamunda Dham, Aglod (Vijapur, Gujarat). Address, directions and contact.",
};

export const dynamic = "force-dynamic";

export default async function VisitPage() {
  const locale = await getLocale();
  const temple = await prisma.templeInfo.findFirst();
  const address = temple ? pick(temple, "address", locale) : "આગલોડ, વિજાપુર, જિ. મહેસાણા, ગુજરાત";
  const directions = temple?.mapsUrl
    ? temple.mapsUrl
    : temple?.latitude && temple?.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`
      : "https://www.google.com/maps/search/?api=1&query=Shree+Chamunda+Dham+Aglod";

  return (
    <Section tone="cream" className="pt-28">
      <SectionHeading
        eyebrow="✦"
        title={translate(locale, "home.visit")}
        subtitle="Aglod, Vijapur, Gujarat, India"
      />
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="card-temple space-y-4">
          <div className="flex gap-3">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-temple-red" />
            <p className="lang-gu text-muted-foreground">{address}</p>
          </div>
          {temple?.phone && (
            <div className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-temple-red" />
              <a href={`tel:${temple.phone}`} className="text-muted-foreground hover:text-temple-red">
                {temple.phone}
              </a>
            </div>
          )}
          {temple?.email && (
            <div className="flex gap-3">
              <Mail className="h-5 w-5 shrink-0 text-temple-red" />
              <a href={`mailto:${temple.email}`} className="text-muted-foreground hover:text-temple-red">
                {temple.email}
              </a>
            </div>
          )}
          <a href={directions} target="_blank" rel="noopener noreferrer" className="btn-gold">
            <Navigation className="h-5 w-5" /> Open in Google Maps
          </a>
          {!temple && (
            <p className="text-sm text-muted-foreground">
              {translate(locale, "placeholder.trust")}
            </p>
          )}
        </div>

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
            <iframe
              title="Map"
              className="h-full w-full"
              loading="lazy"
              src="https://maps.google.com/maps?q=Aglod,Vijapur,Gujarat&z=12&output=embed"
            />
          )}
        </div>
      </div>
    </Section>
  );
}
