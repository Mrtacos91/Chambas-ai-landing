import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, SITE_URL, publicUrl } from "@/lib/seo/config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const landingImage = `${SITE_URL}/opengraph-image.png`;

  return [
    ...PUBLIC_ROUTES.map((route) => ({
      url: publicUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          "es-MX": publicUrl(route.path),
        },
      },
      images: route.path === "/" ? [landingImage] : undefined,
    })),
  ];
}
