import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://theauditionguidebook.vercel.app";
const today = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/modules`, lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/welcome`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
  ];

  return routes;
}
