import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeAuthSession } from "@/lib/auth/application/complete-auth-session";

export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url);
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
