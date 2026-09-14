import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requestMeta } from "@/lib/audit";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2).max(120),
  mobile: z.string().min(7).max(20),
  email: z.string().email().max(160).optional().or(z.literal("")),
  subject: z.string().max(160).optional(),
  category: z.string().max(40).optional(),
  message: z.string().min(3).max(2000),
  // Honeypot — bots fill this; humans never see it.
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const { ip } = await requestMeta();
  if (!rateLimit(`contact:${ip ?? "x"}`, 5, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || parsed.data.website) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  const d = parsed.data;
  const created = await prisma.contactSubmission.create({
    data: {
      name: d.name,
      mobile: d.mobile,
      email: d.email || null,
      subject: d.subject || null,
      category: d.category || "General",
      message: d.message,
      ipAddress: ip,
    },
  });
  await prisma.adminNotification
    .create({
      data: {
        type: "contact",
        title: "New contact request",
        body: `${d.name} — ${d.subject || d.category || "General"}`,
        entityType: "contact",
        entityId: created.id,
      },
    })
    .catch(() => undefined);
  return NextResponse.json({ ok: true });
}
