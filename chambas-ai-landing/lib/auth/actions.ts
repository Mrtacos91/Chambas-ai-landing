"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { render } from "@react-email/render";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import {
  requireClient,
  requireCompanyAdmin,
  requireAdmin,
  requireSession,
} from "@/lib/auth/guards";
import { activateAccount } from "@/lib/auth/application/activate-account";
import { completeAuthSession } from "@/lib/auth/application/complete-auth-session";
import { registerAccount } from "@/lib/auth/application/register-account";
import { getDefaultFrom, getReplyTo, getResendClient } from "@/lib/email/resend";
import { CompanyInvitationEmail } from "@/lib/email/templates/company-invitation";
import { AccountActivatedEmail } from "@/lib/email/templates/account-activated";
import {
  companySignupSchema,
  inviteMemberSchema,
  loginWithPasswordSchema,
} from "@/lib/validators/auth";
import { provisionInactiveCompany } from "@/lib/auth/company-provisioning";
import {
  createActivationCheckoutSession,
  isStripeBillingEnabled,
} from "@/lib/billing/stripe";
import type { AuthEventType } from "@/lib/auth/types";
import type { Json } from "@/types/database";

export interface ActionResult<T = unknown> {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

const getOrigin = async () => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "https://jalector.com";
};

const authFailureMessage = (fallback: string, detail?: string) => {
  if (process.env.NODE_ENV !== "production" && detail) {
    return `${fallback} Detalle: ${detail}`;
  }
  return fallback;
};

const flattenFieldErrors = (error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): Record<string, string> => {
  const flat = error.flatten().fieldErrors;
  const result: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages?.[0]) result[key] = messages[0];
  }
  return result;
};

const resolvePostAuthRedirect = async (
  userId: string,
  redirectParam: FormDataEntryValue | null,
) => {
  const context = await completeAuthSession(userId);
  const safeRedirect =
    typeof redirectParam === "string" && redirectParam.startsWith("/")
      ? redirectParam
      : null;

  if (
    safeRedirect &&
    !safeRedirect.startsWith("/registro") &&
    context?.phase === "active_user"
  ) {
    return safeRedirect;
  }

  return context?.redirectPath ?? "/registro";
};

const logEvent = async (params: {
  userId?: string | null;
  email?: string | null;
  eventType: AuthEventType;
  metadata?: Record<string, unknown>;
}) => {
  try {
    const headerStore = await headers();
    const admin = createAdminClient();
    await admin.from("auth_events").insert({
      user_id: params.userId ?? null,
      email: params.email ?? null,
      event_type: params.eventType,
      metadata: (params.metadata ?? {}) as Json,
      ip_address: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: headerStore.get("user-agent") ?? null,
    });
  } catch {
    return;
  }
};

export const signInWithPassword = async (formData: FormData): Promise<ActionResult> => {
  const parsed = loginWithPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    await logEvent({
      email: parsed.data.email,
      eventType: "login_failed",
      metadata: { stage: "password_login", message: error?.message },
    });
    return {
      ok: false,
      error: "Correo o contraseña incorrectos. Inténtalo de nuevo.",
    };
  }

  await logEvent({
    userId: data.user.id,
    email: data.user.email ?? parsed.data.email,
    eventType: "login_success",
  });

  const redirectTo = await resolvePostAuthRedirect(data.user.id, formData.get("redirect"));
  return { ok: true, data: { redirect: redirectTo } };
};

export const signInWithGoogle = async (redirectAfter?: string) => {
  const supabase = await createClient();
  const origin = await getOrigin();
  const callback = new URL("/callback", origin);
  if (redirectAfter && redirectAfter.startsWith("/")) {
    callback.searchParams.set("redirect", redirectAfter);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString() },
  });

  if (error || !data.url) {
    return { ok: false, error: "No pudimos iniciar Google. Inténtalo de nuevo." } as ActionResult;
  }

  redirect(data.url);
};

export const signOut = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  await logEvent({ userId: user?.id, email: user?.email, eventType: "logout" });
  redirect("/login");
};

export const submitCompanySignup = async (formData: FormData): Promise<ActionResult> => {
  const parsed = companySignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    contactName: formData.get("contactName"),
    contactPhone: formData.get("contactPhone"),
    companyName: formData.get("companyName"),
    industry: formData.get("industry"),
    expectedVolume: formData.get("expectedVolume"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const {
    data: { user: existingSessionUser },
  } = await supabase.auth.getUser();

  if (existingSessionUser) {
    const result = await registerAccount({
      ...parsed.data,
      userId: existingSessionUser.id,
    });

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    await logEvent({
      userId: existingSessionUser.id,
      email: parsed.data.email,
      eventType: "account_created",
      metadata: { source: "authenticated", company_id: result.context.companyId },
    });

    return {
      ok: true,
      data: { email: parsed.data.email, redirect: result.context.redirectPath },
    };
  }

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.contactName },
  });

  if (createError || !created.user) {
    const alreadyExists =
      createError?.message?.toLowerCase().includes("already") ||
      createError?.message?.toLowerCase().includes("registered") ||
      createError?.message?.toLowerCase().includes("exists");

    return {
      ok: false,
      error: alreadyExists
        ? "Ese correo ya tiene una cuenta. Inicia sesión con tu contraseña."
        : authFailureMessage(
            "No pudimos crear tu cuenta. Inténtalo de nuevo.",
            createError?.message,
          ),
    };
  }

  const { data: signedIn, error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError || !signedIn.user) {
    return {
      ok: false,
      error: authFailureMessage(
        "La cuenta se creó, pero no pudimos iniciar sesión. Entra desde Iniciar sesión.",
        signInError?.message,
      ),
    };
  }

  const result = await registerAccount({
    ...parsed.data,
    userId: signedIn.user.id,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  await logEvent({
    userId: signedIn.user.id,
    email: parsed.data.email,
    eventType: "account_created",
    metadata: { source: "password_signup", company_id: result.context.companyId },
  });

  return {
    ok: true,
    data: { email: parsed.data.email, redirect: result.context.redirectPath },
  };
};

export const completeSignupAfterVerification = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await completeAuthSession(user.id);
};

export const activateAccountManually = async (companyId: string): Promise<ActionResult> => {
  const adminUser = await requireAdmin();
  const admin = createAdminClient();

  const { data: company } = await admin
    .from("companies")
    .select("id, name, contact_email, contact_name, active")
    .eq("id", companyId)
    .maybeSingle();

  if (!company) {
    return { ok: false, error: "No encontramos la empresa." };
  }

  const { data: memberships } = await admin
    .from("company_users")
    .select("user_id, role, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  const ownerMembership =
    memberships?.find((row) => row.role === "admin") ?? memberships?.[0] ?? null;

  const result = await activateAccount({
    companyId,
    source: "manual",
    activatedBy: adminUser.id,
    userId: ownerMembership?.user_id ?? null,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  let recipientEmail: string | null = company.contact_email;
  let contactName = company.contact_name ?? "ahí";
  let recipientUserId = ownerMembership?.user_id ?? null;

  if (ownerMembership?.user_id) {
    const { data: ownerProfile } = await admin
      .from("user_profiles")
      .select("email, full_name")
      .eq("id", ownerMembership.user_id)
      .maybeSingle();

    if (ownerProfile?.email) {
      recipientEmail = ownerProfile.email;
      contactName = ownerProfile.full_name ?? company.contact_name ?? "ahí";
      recipientUserId = ownerMembership.user_id;
    }
  }

  let emailSent = false;
  let emailError: string | undefined;

  if (recipientEmail) {
    try {
      const origin = await getOrigin();
      const html = await render(
        AccountActivatedEmail({
          companyName: company.name,
          contactName,
          loginUrl: `${origin}/login`,
        }),
      );
      const { error: resendError } = await getResendClient().emails.send({
        from: getDefaultFrom(),
        to: recipientEmail,
        subject: `Tu cuenta de ${company.name} ya está activa en Jalector`,
        html,
        replyTo: getReplyTo(),
      });

      if (resendError) {
        emailError = resendError.message;
      } else {
        emailSent = true;
      }
    } catch (error) {
      emailError =
        error instanceof Error ? error.message : "No pudimos enviar el correo de activación.";
    }
  } else {
    emailError = "No encontramos un correo para notificar la activación.";
  }

  await logEvent({
    userId: recipientUserId,
    email: recipientEmail,
    eventType: "account_activated",
    metadata: {
      company_id: companyId,
      source: "manual",
      activated_by: adminUser.id,
      email_sent: emailSent,
      email_error: emailError ?? null,
    },
  });

  revalidatePath("/ejecutivo/empresas");
  revalidatePath("/registro/pendiente");
  revalidatePath("/cliente");

  return {
    ok: true,
    data: {
      emailSent,
      email: recipientEmail,
      emailError,
    },
  };
};

export const inviteCompanyMember = async (formData: FormData): Promise<ActionResult> => {
  const { user, membership } = await requireCompanyAdmin();

  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  const admin = createAdminClient();
  const { error } = await admin.from("company_invitations").insert({
    company_id: membership.companyId,
    email: parsed.data.email,
    role: parsed.data.role,
    invited_by: user.id,
    token,
    expires_at: expiresAt,
  });

  if (error) {
    return { ok: false, error: "No pudimos crear la invitación. Verifica que el correo no esté duplicado." };
  }

  try {
    const origin = await getOrigin();
    const html = await render(
      CompanyInvitationEmail({
        companyName: membership.companyName,
        inviterName: user.fullName ?? user.email,
        role: parsed.data.role,
        acceptUrl: `${origin}/invitacion/${token}`,
      }),
    );
    await getResendClient().emails.send({
      from: getDefaultFrom(),
      to: parsed.data.email,
      subject: `Te invitaron a ${membership.companyName} en Jalector`,
      html,
      replyTo: getReplyTo(),
    });
  } catch {
    return { ok: true };
  }

  await logEvent({
    userId: user.id,
    eventType: "invitation_sent",
    metadata: { invited_email: parsed.data.email, role: parsed.data.role },
  });

  revalidatePath("/cliente");
  return { ok: true };
};

export const acceptInvitation = async (token: string): Promise<ActionResult> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Debes iniciar sesión antes de aceptar la invitación." };
  }

  const admin = createAdminClient();
  const { data: invitation, error: fetchError } = await admin
    .from("company_invitations")
    .select("id, company_id, email, role, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();

  if (fetchError || !invitation) {
    return { ok: false, error: "Esta invitación no existe o ya fue usada." };
  }

  if (invitation.accepted_at) {
    return { ok: false, error: "Esta invitación ya fue aceptada antes." };
  }

  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "La invitación venció. Pide una nueva al administrador." };
  }

  if (invitation.email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return {
      ok: false,
      error: "Esta invitación fue enviada a otro correo. Inicia sesión con el correo invitado.",
    };
  }

  const { error: insertError } = await admin.from("company_users").upsert(
    {
      company_id: invitation.company_id,
      user_id: user.id,
      role: invitation.role,
      accepted_at: new Date().toISOString(),
    },
    { onConflict: "company_id,user_id" },
  );

  if (insertError) {
    return { ok: false, error: "No pudimos agregarte a la empresa." };
  }

  await admin
    .from("company_invitations")
    .update({ accepted_at: new Date().toISOString(), accepted_by: user.id })
    .eq("id", invitation.id);

  await logEvent({
    userId: user.id,
    eventType: "invitation_accepted",
    metadata: { company_id: invitation.company_id, role: invitation.role },
  });

  return { ok: true, data: { companyId: invitation.company_id } };
};

export const startActivationCheckout = async (): Promise<ActionResult> => {
  if (!isStripeBillingEnabled()) {
    return {
      ok: false,
      error: "El cobro en línea no está habilitado. Un administrador activará tu cuenta.",
    };
  }

  const user = await requireSession();
  const provisioned = await provisionInactiveCompany(user.id);

  if (!provisioned) {
    return { ok: false, error: "No encontramos una empresa asociada a tu cuenta." };
  }

  if (provisioned.isActive) {
    return { ok: false, error: "Tu cuenta ya está activa." };
  }

  const origin = await getOrigin();
  const checkout = await createActivationCheckoutSession({
    companyId: provisioned.companyId,
    companyName: provisioned.companyName,
    customerEmail: user.email,
    successUrl: `${origin}/registro/pendiente?status=success`,
    cancelUrl: `${origin}/registro/pendiente?status=cancelled`,
  });

  if (!checkout.ok) {
    return { ok: false, error: checkout.error };
  }

  return { ok: true, data: { url: checkout.url } };
};

export const activateCompanyAfterPayment = async (companyId: string) => {
  const result = await activateAccount({
    companyId,
    source: "stripe",
  });

  if (result.ok) {
    revalidatePath("/registro/pendiente");
    revalidatePath("/cliente");
  }

  return result.ok;
};
