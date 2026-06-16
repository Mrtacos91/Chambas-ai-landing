import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CurrentMembership, CurrentUser } from "@/lib/auth/types";

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("email, full_name, avatar_url, user_type, is_active")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return null;
  }

  return {
    id: user.id,
    email: profile.email,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    userType: profile.user_type,
    isActive: profile.is_active,
  };
});

export const getCurrentMemberships = cache(async (): Promise<CurrentMembership[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: memberships } = await supabase
    .from("company_users")
    .select("company_id, role")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) return [];

  const companyIds = memberships.map((row) => row.company_id);
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .in("id", companyIds);

  const companyNameById = new Map(
    (companies ?? []).map((row) => [row.id, row.name]),
  );

  return memberships.map((row) => ({
    companyId: row.company_id,
    companyName: companyNameById.get(row.company_id) ?? "Empresa",
    role: row.role,
  }));
});

export const getActiveMembership = cache(async (): Promise<CurrentMembership | null> => {
  const memberships = await getCurrentMemberships();
  return memberships[0] ?? null;
});

export const getPendingSignup = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("company_signups")
    .select("id, status, company_name, rejection_reason, created_at, reviewed_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
});
