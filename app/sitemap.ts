import type { MetadataRoute } from "next";
import { listScans } from "@/lib/db/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://fauxscan.vercel.app";
  const scans = await listScans();
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/dashboard`, lastModified: new Date() },
    { url: `${base}/scan/new`, lastModified: new Date() },
    { url: `${base}/methodology`, lastModified: new Date() },
    ...scans.map((s) => ({
      url: `${base}/scan/${s.id}`,
      lastModified: new Date(s.createdAt),
    })),
  ];
}
