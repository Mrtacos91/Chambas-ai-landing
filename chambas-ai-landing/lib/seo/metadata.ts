import type { Metadata } from "next";
import { OG_LOCALE, SITE_LOCALE, SITE_NAME, SITE_URL, publicUrl } from "@/lib/seo/config";

interface BuildPageMetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: { url: string; alt: string; width?: number; height?: number };
  type?: "website" | "article";
  noindex?: boolean;
}

const DEFAULT_IMAGE = {
  url: `${SITE_URL}/opengraph-image.png`,
  width: 1200,
  height: 630,
  alt: "Jalector - Captación de candidatos por WhatsApp con panel ejecutivo",
};

export const buildPageMetadata = ({
  title,
  description,
  path,
  keywords,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
}: BuildPageMetadataInput): Metadata => {
  const url = publicUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: { [SITE_LOCALE]: url },
    },
    openGraph: {
      type,
      locale: OG_LOCALE,
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: image.url, width: image.width ?? 1200, height: image.height ?? 630, alt: image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    robots: noindex
      ? { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, nocache: true } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  };
};
