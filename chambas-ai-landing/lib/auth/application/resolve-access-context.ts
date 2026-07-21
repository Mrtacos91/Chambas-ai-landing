import { createClient as createAdminClient } from "@/lib/supabase/admin";
import type {
  AccessContext,
  AccessPhase,
  CompanyRole,
  PlatformRole,
} from "@/lib/auth/domain/access-context";
import { withRoutePolicy } from "@/lib/auth/domain/route-policy";

interface AccessContextRow {
  user_id: string;
  platform_role: string;
  company_role: string | null;
  phase: string;
  company_id: string | null;
  company_name: string | null;
  company_active: boolean;
  redirect_path: string;
}

const asPlatformRole = (value: string): PlatformRole =>
  value === "admin" ? "admin" : "usuario";

const asCompanyRole = (value: string | null): CompanyRole | null => {
  if (value === "admin" || value === "usuario") return value;
  return null;
};

const asPhase = (value: string): AccessPhase => {
  if (
    value === "admin_panel" ||
    value === "needs_registration" ||
    value === "pending_activation" ||
    value === "active_user"
  ) {
    return value;
  }
  return "needs_registration";
};

const resolveFromQueries = async (userId: string): Promise<AccessContext | null> => {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("user_profiles")
    .select("user_type")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return null;

  const platformRole = asPlatformRole(profile.user_type);

  if (platformRole === "admin") {
    return withRoutePolicy({
      userId,
      platformRole,
      companyRole: null,
      phase: "admin_panel",
      companyId: null,
      companyName: null,
      companyActive: false,
    });
  }

  const { data: membership } = await admin
    .from("company_users")
    .select("company_id, role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return withRoutePolicy({
      userId,
      platformRole,
      companyRole: null,
      phase: "needs_registration",
      companyId: null,
      companyName: null,
      companyActive: false,
    });
  }

  const { data: company } = await admin
    .from("companies")
    .select("id, name, active")
    .eq("id", membership.company_id)
    .single();

  const companyActive = company?.active === true;

  return withRoutePolicy({
    userId,
    platformRole,
    companyRole: asCompanyRole(membership.role),
    phase: companyActive ? "active_user" : "pending_activation",
    companyId: company?.id ?? membership.company_id,
    companyName: company?.name ?? null,
    companyActive,
  });
};

export const resolveAccessContext = async (
  userId: string,
): Promise<AccessContext | null> => {
  const admin = createAdminClient();

  try {
    const { data, error } = await admin.rpc("get_access_context", {
      p_user_id: userId,
    });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      const row = data[0] as AccessContextRow;
      return withRoutePolicy({
        userId: row.user_id,
        platformRole: asPlatformRole(row.platform_role),
        companyRole: asCompanyRole(row.company_role),
        phase: asPhase(row.phase),
        companyId: row.company_id,
        companyName: row.company_name,
        companyActive: row.company_active === true,
      });
    }
  } catch {
    // Fall through to direct queries.
  }

  return resolveFromQueries(userId);
};
