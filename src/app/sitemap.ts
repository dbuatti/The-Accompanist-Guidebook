import type { MetadataRoute } from "next";

import { FREE_PREVIEWS, previewHref } from "@/lib/constants";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://theauditionguidebook.vercel.app";

// Only public, indexable pages. Module and lesson URLs are deliberately left
// out: to a search engine every one of them is the same paywall, which reads
// as dozens of duplicate thin pages and drags the whole site down.
const GUIDES = [
  "how-many-songs-for-a-musical-theatre-audition",
  "how-to-cut-sheet-music-for-an-audition",
  "how-to-hand-over-your-music-to-the-audition-pianist",
  "what-to-bring-to-a-musical-theatre-audition",
  "the-48-hour-pre-audition-checklist",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();
  return [
    { url: `${BASE}/`, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/guides`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    ...GUIDES.map((slug) => ({
      url: `${BASE}/guides/${slug}`,
      lastModified: today,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...FREE_PREVIEWS.map((p) => ({
      url: `${BASE}${previewHref(p)}`,
      lastModified: today,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${BASE}/terms`, lastModified: today, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/privacy`, lastModified: today, changeFrequency: "yearly", priority: 0.2 },
  ];
}
