import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { activateCompany } from "@/lib/auth/company-provisioning";
import type { Json } from "@/types/database";

export interface ActivateAccountParams {
  companyId: string;
  source: "manual" | "stripe";
  activatedBy?: string | null;
  userId?: string | null;
  amountCents?: number | null;
  currency?: string;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  metadata?: Record<string, unknown>;
}

export const activateAccount = async (
  params: ActivateAccountParams,
): Promise<{ ok: true } | { ok: false; error: string }> => {
  const admin = createAdminClient();

  const { data: company } = await admin
    .from("companies")
    .select("id, active")
    .eq("id", params.companyId)
    .maybeSingle();

  if (!company) {
    return { ok: false, error: "No encontramos la empresa." };
  }

  if (company.active === true) {
    return { ok: true };
  }

  const { error: recordError } = await admin.from("company_activation_records").insert({
    company_id: params.companyId,
    user_id: params.userId ?? null,
    source: params.source,
    status: "completed",
    amount_cents: params.amountCents ?? null,
    currency: params.currency ?? "mxn",
    stripe_session_id: params.stripeSessionId ?? null,
    stripe_payment_intent_id: params.stripePaymentIntentId ?? null,
    activated_by: params.activatedBy ?? null,
    completed_at: new Date().toISOString(),
    metadata: (params.metadata ?? {}) as Json,
  });

  if (recordError) {
    return { ok: false, error: "No pudimos registrar la activación." };
  }

  const activated = await activateCompany(params.companyId, params.source);
  if (!activated) {
    return { ok: false, error: "No pudimos activar la empresa." };
  }

  return { ok: true };
};
