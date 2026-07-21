import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";
import { isPathAllowedForPhase } from "@/lib/auth/domain/route-policy";
import type { AccessPhase, PlatformRole } from "@/lib/auth/domain/access-context";
import { getPhasePolicy } from "@/lib/auth/domain/route-policy";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) as string;

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/registro",
  "/verify",
  "/callback",
  "/aviso-de-privacidad",
  "/cookies",
  "/seguridad",
  "/soporte",
  "/status",
  "/terminos",
];

const ASSET_PREFIXES = ["/_next", "/favicon", "/logo", "/file", "/globe", "/next.svg", "/vercel.svg", "/window.svg"];

const isPublicPath = (pathname: string) => {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/.well-known/")) return true;
  if (pathname.startsWith("/invitacion/")) return true;
  if (pathname.startsWith("/api/webhooks/")) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  if (ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  return false;
};

const redirectTo = (request: NextRequest, pathname: string, redirect?: string) => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (redirect) {
    url.searchParams.set("redirect", redirect);
  }
  return NextResponse.redirect(url);
};

const resolvePhaseFromProfile = async (
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string,
): Promise<{ phase: AccessPhase; platformRole: PlatformRole } | null> => {
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("user_type, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) return null;

  if (profile.user_type === "admin") {
    return { phase: "admin_panel", platformRole: "admin" };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    return { phase: "needs_registration", platformRole: "usuario" };
  }

  const { data: company } = await supabase
    .from("companies")
    .select("active")
    .eq("id", membership.company_id)
    .maybeSingle();

  if (company?.active === true) {
    return { phase: "active_user", platformRole: "usuario" };
  }

  return { phase: "pending_activation", platformRole: "usuario" };
};

export const updateSession = async (request: NextRequest) => {
  if (request.nextUrl.pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/callback";
    return NextResponse.redirect(callbackUrl);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublic = isPublicPath(pathname);

  if (!user && !isPublic) {
    return redirectTo(request, "/login", pathname);
  }

  if (!user) {
    return response;
  }

  const access = await resolvePhaseFromProfile(supabase, user.id);
  if (!access) {
    if (!isPublic) {
      return redirectTo(request, "/login");
    }
    return response;
  }

  const isAuthRoute = pathname === "/login" || pathname === "/verify";
  if (isAuthRoute) {
    return redirectTo(request, getPhasePolicy(access.phase).redirectPath);
  }

  if (pathname === "/registro/activacion") {
    return redirectTo(request, "/registro/pendiente");
  }

  const needsGuard =
    pathname.startsWith("/ejecutivo") ||
    pathname.startsWith("/cliente") ||
    pathname.startsWith("/registro");

  if (needsGuard && !isPathAllowedForPhase(access.phase, pathname)) {
    return redirectTo(request, getPhasePolicy(access.phase).redirectPath);
  }

  return response;
};
