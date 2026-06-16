export const SITE_URL = "https://jalector.com" as const;
export const SITE_NAME = "Jalector" as const;
export const SITE_LOCALE = "es-MX" as const;
export const OG_LOCALE = "es_MX" as const;
export const TWITTER_HANDLE = "@jalector" as const;

export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface PublicRoute {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

export const PUBLIC_ROUTES: PublicRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/soporte", changeFrequency: "monthly", priority: 0.5 },
  { path: "/seguridad", changeFrequency: "monthly", priority: 0.5 },
  { path: "/status", changeFrequency: "weekly", priority: 0.4 },
  { path: "/terminos", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/aviso-de-privacidad", changeFrequency: "yearly", priority: 0.3 },
];

export const PROTECTED_PATHS = [
  "/login",
  "/verify",
  "/registro",
  "/registro/",
  "/invitacion/",
  "/callback",
  "/ejecutivo",
  "/ejecutivo/",
  "/cliente",
  "/cliente/",
  "/api/",
];

export const publicUrl = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
};
