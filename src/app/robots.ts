import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.theauditionguidebook.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/auth", "/modules", "/welcome"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}