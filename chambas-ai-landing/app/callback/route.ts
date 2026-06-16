import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  await supabase
    .from("user_profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", data.user.id);

  if (redirectTo && redirectTo.startsWith("/")) {
    return NextResponse.redirect(new URL(redirectTo, origin));
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("user_type")
    .eq("id", data.user.id)
    .single();

  const { data: memberships } = await supabase
    .from("company_users")
    .select("id")
    .eq("user_id", data.user.id)
    .limit(1);

  const { data: pendingSignup } = await supabase
    .from("company_signups")
    .select("id, status")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (profile?.user_type === "executive") {
    return NextResponse.redirect(new URL("/ejecutivo", origin));
  }

  if (memberships && memberships.length > 0) {
    return NextResponse.redirect(new URL("/cliente", origin));
  }

  if (pendingSignup) {
    return NextResponse.redirect(new URL("/registro/pendiente", origin));
  }

  return NextResponse.redirect(new URL("/registro", origin));
};
