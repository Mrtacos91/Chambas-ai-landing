import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

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
  if (pathname.startsWith("/invitacion/")) return true;
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

export const updateSession = async (request: NextRequest) => {
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

  if (user) {
    const isAuthRoute =
      pathname === "/login" || pathname === "/registro" || pathname === "/verify";

    if (isAuthRoute) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      return redirectTo(request, profile?.user_type === "executive" ? "/ejecutivo" : "/cliente");
    }

    if (pathname.startsWith("/ejecutivo") || pathname.startsWith("/cliente")) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("user_type, is_active")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.is_active) {
        return redirectTo(request, "/login");
      }

      if (pathname.startsWith("/ejecutivo") && profile.user_type !== "executive") {
        return redirectTo(request, "/cliente");
      }

      if (pathname.startsWith("/cliente") && profile.user_type === "executive") {
        return redirectTo(request, "/ejecutivo");
      }

      if (profile.user_type === "client" && pathname.startsWith("/cliente")) {
        const { data: signup } = await supabase
          .from("company_signups")
          .select("status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count: memberships } = await supabase
          .from("company_users")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        const hasCompany = (memberships ?? 0) > 0;

        if (!hasCompany && pathname !== "/registro/pendiente") {
          if (!signup) {
            return redirectTo(request, "/registro");
          }
          if (signup.status === "pending" || signup.status === "rejected") {
            return redirectTo(request, "/registro/pendiente");
          }
        }
      }
    }
  }

  return response;
};
