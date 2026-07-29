import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeAuthSession } from "@/lib/auth/application/complete-auth-session";
import { SITE_URL } from "@/lib/seo/config";

const resolveRequestOrigin = (request: NextRequest) => {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";

  if (host && !/localhost|127\.0\.0\.1/i.test(host)) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl && !/localhost|127\.0\.0\.1/i.test(envUrl)) {
    return envUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return SITE_URL;
  }

  return new URL(request.url).origin;
};

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const origin = resolveRequestOrigin(request);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error?.message ?? "exchange_failed")}`, origin),
    );
  }

  const context = await completeAuthSession(data.user.id);

  if (
    redirectTo &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("/registro") &&
    context?.phase === "active_user"
  ) {
    return NextResponse.redirect(new URL(redirectTo, origin));
  }

  const target = context?.redirectPath ?? "/registro";
  return NextResponse.redirect(new URL(target, origin));
};
