import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { resolveAccessContext } from "@/lib/auth/application/resolve-access-context";
import { provisionInactiveCompany } from "@/lib/auth/company-provisioning";
import type { AccessContext } from "@/lib/auth/domain/access-context";
import type { CompanySignupInput } from "@/lib/validators/auth";

export interface RegisterAccountInput extends CompanySignupInput {
  userId: string;
}

export const registerAccount = async (
  input: RegisterAccountInput,
): Promise<{ ok: true; context: AccessContext } | { ok: false; error: string }> => {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("user_profiles")
    .select("id, email")
    .eq("id", input.userId)
    .maybeSingle();

  if (!profile) {
    const { error: profileError } = await admin.from("user_profiles").insert({
      id: input.userId,
      email: input.email,
      full_name: input.contactName,
      user_type: "usuario",
      is_active: true,
    });

    if (profileError) {
      return { ok: false, error: "No pudimos preparar tu perfil de usuario." };
    }
  } else if (profile.email.toLowerCase() !== input.email.toLowerCase()) {
    return {
      ok: false,
      error: "El correo del formulario no coincide con tu sesión actual.",
    };
  }

  const { data: membership } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", input.userId)
    .limit(1)
    .maybeSingle();

  if (membership) {
    const context = await resolveAccessContext(input.userId);
    if (!context) {
      return { ok: false, error: "No pudimos resolver el estado de tu cuenta." };
    }
    return { ok: true, context };
  }

  const signupPayload = {
    user_id: input.userId,
    company_name: input.companyName,
    contact_name: input.contactName,
    contact_phone: input.contactPhone,
    industry: input.industry,
    expected_volume: input.expectedVolume,
    status: "pending" as const,
  };

  const { data: existingSignup } = await admin
    .from("company_signups")
    .select("id")
    .eq("user_id", input.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: signupError } = existingSignup
    ? await admin.from("company_signups").update(signupPayload).eq("id", existingSignup.id)
    : await admin.from("company_signups").insert(signupPayload);

  if (signupError) {
    return { ok: false, error: "No pudimos guardar los datos de tu empresa." };
  }

  const provisioned = await provisionInactiveCompany(input.userId);
  if (!provisioned) {
    return { ok: false, error: "No pudimos crear la cuenta de tu empresa." };
  }

  await admin.from("user_profiles").update({ full_name: input.contactName }).eq("id", input.userId);

  const context = await resolveAccessContext(input.userId);
  if (!context) {
    return { ok: false, error: "Cuenta creada, pero no pudimos resolver el acceso." };
  }

  return { ok: true, context };
};
