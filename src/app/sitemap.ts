import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticPaths = [
    "",
    "/about",
    "/darshan",
    "/events",
    "/gallery",
    "/trust",
    "/visit",
    "/updates",
    "/donate",
    "/volunteer",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/donation-policy",
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));

  let dynamicPaths: MetadataRoute.Sitemap = [];
  try {
    const [events, articles] = await Promise.all([
      prisma.event.findMany({
        where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
    ]);
    dynamicPaths = [
      ...events.map((e) => ({
        url: `${base}/events/${e.slug}`,
        lastModified: e.updatedAt,
      })),
      ...articles.map((a) => ({
        url: `${base}/updates/${a.slug}`,
        lastModified: a.updatedAt,
      })),
    ];
  } catch {
    // Database unavailable at build time — return static paths only.
  }

  return [...staticPaths, ...dynamicPaths];
}
