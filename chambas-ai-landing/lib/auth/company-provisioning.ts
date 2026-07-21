import { createClient as createAdminClient } from "@/lib/supabase/admin";
import type { ActivationSource } from "@/types/database";

export interface ProvisionedCompany {
  companyId: string;
  companyName: string;
  isActive: boolean;
  created: boolean;
}

export const provisionInactiveCompany = async (
  userId: string,
): Promise<ProvisionedCompany | null> => {
  const admin = createAdminClient();

  const { data: existingMembership } = await admin
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existingMembership) {
    const { data: company } = await admin
      .from("companies")
      .select("id, name, active")
      .eq("id", existingMembership.company_id)
      .single();

    if (company) {
      return {
        companyId: company.id,
        companyName: company.name,
        isActive: company.active === true,
        created: false,
      };
    }
  }

  const { data: signup } = await admin
    .from("company_signups")
    .select(
      "id, company_name, contact_name, contact_phone, industry, status, created_company_id",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!signup) {
    return null;
  }

  if (signup.created_company_id) {
    const { data: company } = await admin
      .from("companies")
      .select("id, name, active")
      .eq("id", signup.created_company_id)
      .single();

    if (company) {
      await admin.from("company_users").upsert(
        {
          company_id: company.id,
          user_id: userId,
          role: "admin",
          accepted_at: new Date().toISOString(),
        },
        { onConflict: "company_id,user_id" },
      );

      return {
        companyId: company.id,
        companyName: company.name,
        isActive: company.active === true,
        created: false,
      };
    }
  }

  const { data: profile } = await admin
    .from("user_profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({
      name: signup.company_name,
      contact_name: signup.contact_name,
      contact_phone: signup.contact_phone,
      contact_email: profile?.email ?? null,
      description: signup.industry,
      active: false,
    })
    .select("id, name, active")
    .single();

  if (companyError || !company) {
    return null;
  }

  const { error: memberError } = await admin.from("company_users").upsert(
    {
      company_id: company.id,
      user_id: userId,
      role: "admin",
      accepted_at: new Date().toISOString(),
    },
    { onConflict: "company_id,user_id" },
  );

  if (memberError) {
    return null;
  }

  await admin
    .from("company_signups")
    .update({
      status: "approved",
      created_company_id: company.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", signup.id);

  return {
    companyId: company.id,
    companyName: company.name,
    isActive: false,
    created: true,
  };
};

export const activateCompany = async (
  companyId: string,
  source: ActivationSource = "manual",
) => {
  const admin = createAdminClient();
  const { error } = await admin
    .from("companies")
    .update({
      active: true,
      activated_at: new Date().toISOString(),
      activation_source: source,
    })
    .eq("id", companyId);

  return !error;
};
