import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requestMeta } from "@/lib/audit";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2).max(120),
  age: z.coerce.number().int().min(1).max(120).optional(),
  mobile: z.string().min(7).max(20),
  email: z.string().email().max(160).optional().or(z.literal("")),
  city: z.string().max(80).optional(),
  availableDates: z.string().max(200).optional(),
  areaOfInterest: z.string().max(160).optional(),
  message: z.string().max(1000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(request: Request) {
  const { ip } = await requestMeta();
  if (!rateLimit(`volunteer:${ip ?? "x"}`, 5, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || parsed.data.website) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  const d = parsed.data;
  const created = await prisma.volunteerApplication.create({
    data: {
      name: d.name,
      age: d.age ?? null,
      mobile: d.mobile,
      email: d.email || null,
      city: d.city || null,
      availableDates: d.availableDates || null,
      areaOfInterest: d.areaOfInterest || null,
      message: d.message || null,
    },
  });
  await prisma.adminNotification
    .create({
      data: {
        type: "volunteer",
        title: "New volunteer registration",
        body: `${d.name}${d.city ? " · " + d.city : ""}`,
        entityType: "volunteer",
        entityId: created.id,
      },
    })
    .catch(() => undefined);
  return NextResponse.json({ ok: true });
}
