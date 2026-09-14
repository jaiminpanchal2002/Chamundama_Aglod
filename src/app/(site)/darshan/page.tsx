import type { Metadata } from "next";
import { Clock, Sun, Moon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLocale, translate } from "@/lib/i18n";
import { pick } from "@/lib/i18n/config";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "દર્શન અને આરતી · Darshan & Aarti",
  description: "Darshan and Aarti timings at Shree Chamunda Dham Aglod.",
};

export const dynamic = "force-dynamic";

export default async function DarshanPage() {
  const locale = await getLocale();
  const now = new Date();
  const [schedules, overrides] = await Promise.all([
    prisma.darshanSchedule.findMany({
      where: { isActive: true },
      orderBy: [{ dayType: "asc" }, { order: "asc" }],
    }),
    prisma.darshanOverride.findMany({
      where: { date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } },
      orderBy: { date: "asc" },
      take: 10,
    }),
  ]);

  return (
    <Section tone="cream" className="pt-28">
      <SectionHeading
        eyebrow="✦"
        title="દર્શન અને આરતી સમય"
        subtitle="Darshan & Aarti Timings"
      />

      {schedules.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.05}>
              <div className="card-temple h-full">
                <div className="flex items-center gap-2 text-temple-red">
                  <Clock className="h-5 w-5" />
                  <h3 className="font-display text-lg">{pick(d, "label", locale)}</h3>
                </div>
                <p className="mt-1 text-xs uppercase tracking-widest text-temple-gold">
                  {d.dayType}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {d.openTime && d.closeTime && (
                    <li>{d.openTime} – {d.closeTime}</li>
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
                  {d.bhogTime && <li>Bhog: {d.bhogTime}</li>}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          {translate(locale, "placeholder.trust")}
        </p>
      )}

      {overrides.length > 0 && (
        <div className="mx-auto mt-12 max-w-3xl">
          <h3 className="mb-4 text-center font-display text-xl text-temple-maroon">
            વિશેષ સમય · Special Days
          </h3>
          <div className="space-y-3">
            {overrides.map((o) => (
              <div key={o.id} className="card-temple flex items-center justify-between">
                <div>
                  <p className="font-medium text-temple-maroon">
                    {o.date.toLocaleDateString("en-IN")} — {pick(o, "label", locale)}
                  </p>
                  {o.note && <p className="text-sm text-muted-foreground">{o.note}</p>}
                </div>
                <span className="text-sm text-temple-red">
                  {o.isClosed ? "Closed" : `${o.openTime ?? ""} ${o.closeTime ? "– " + o.closeTime : ""}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
