import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Uploaded images (hero photos, og images) are served from /api/uploads
        // and should stay crawlable; the longer Allow rule wins over /api.
        allow: ["/", "/api/uploads/"],
        disallow: ["/admin", "/setup", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
