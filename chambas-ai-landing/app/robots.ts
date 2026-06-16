import type { MetadataRoute } from "next";
import { PROTECTED_PATHS, SITE_URL } from "@/lib/seo/config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PROTECTED_PATHS,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: PROTECTED_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
