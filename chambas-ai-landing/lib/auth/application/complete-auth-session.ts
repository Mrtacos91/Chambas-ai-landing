import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { resolveAccessContext } from "@/lib/auth/application/resolve-access-context";
import { provisionInactiveCompany } from "@/lib/auth/company-provisioning";
import type { AccessContext } from "@/lib/auth/domain/access-context";

const completeSignupFromAuthEvents = async (userId: string, email: string) => {
  const admin = createAdminClient();

  const { data: pending } = await admin
    .from("company_signups")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (pending) return;

  const { data: event } = await admin
    .from("auth_events")
    .select("metadata")
    .eq("email", email)
    .eq("event_type", "signup_submitted")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const metadata = (event?.metadata ?? {}) as Record<string, string>;
  if (!metadata.company_name) return;

  await admin.from("company_signups").insert({
    user_id: userId,
    company_name: metadata.company_name,
    contact_name: metadata.contact_name ?? null,
    contact_phone: metadata.contact_phone ?? null,
    industry: metadata.industry ?? null,
    expected_volume: metadata.expected_volume ?? null,
    status: "pending",
  });

  await provisionInactiveCompany(userId);
};

export const completeAuthSession = async (
  userId: string,
): Promise<AccessContext | null> => {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("user_profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", userId);

  const { data: profile } = await admin
    .from("user_profiles")
    .select("user_type, email")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    if (user?.email) {
      await admin.from("user_profiles").insert({
        id: userId,
        email: user.email,
        full_name:
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : typeof user.user_metadata?.name === "string"
              ? user.user_metadata.name
              : null,
        avatar_url:
          typeof user.user_metadata?.avatar_url === "string"
            ? user.user_metadata.avatar_url
            : null,
        user_type: "usuario",
        is_active: true,
      });
    }
  }

  const platformRole = profile?.user_type === "admin" ? "admin" : "usuario";

  if (platformRole === "usuario") {
    const email = profile?.email ?? user?.email;
    if (email) {
      await completeSignupFromAuthEvents(userId, email);
    }
    await provisionInactiveCompany(userId);
  }

  return resolveAccessContext(userId);
};
