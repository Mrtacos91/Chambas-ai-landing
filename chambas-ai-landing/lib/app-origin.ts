import { headers } from "next/headers";
import { SITE_URL } from "@/lib/seo/config";

const isLocalHost = (value: string) => {
  try {
    const url = value.includes("://") ? new URL(value) : new URL(`https://${value}`);
    const host = url.hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  } catch {
    return /localhost|127\.0\.0\.1/i.test(value);
  }
};

const normalizeOrigin = (value: string) => value.replace(/\/$/, "");

export const getAppOrigin = async () => {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "https";

  if (host && !isLocalHost(host)) {
    return normalizeOrigin(`${proto}://${host}`);
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl && !isLocalHost(envUrl)) {
    return normalizeOrigin(envUrl);
  }

  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return normalizeOrigin(SITE_URL);
  }

  if (host) {
    return normalizeOrigin(`${proto}://${host}`);
  }

  if (envUrl) {
    return normalizeOrigin(envUrl);
  }

  if (process.env.VERCEL_URL) {
    return normalizeOrigin(`https://${process.env.VERCEL_URL}`);
  }

  return normalizeOrigin(SITE_URL);
};
