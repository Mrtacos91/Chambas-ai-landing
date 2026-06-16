"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { render } from "@react-email/render";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { requireClient, requireExecutive } from "@/lib/auth/guards";
import { getDefaultFrom, getReplyTo, getResendClient } from "@/lib/email/resend";
import { CompanyInvitationEmail } from "@/lib/email/templates/company-invitation";
import { SignupApprovedEmail } from "@/lib/email/templates/signup-approved";
import { SignupRejectedEmail } from "@/lib/email/templates/signup-rejected";
import {
  companySignupSchema,
  inviteMemberSchema,
  requestOtpSchema,
  reviewSignupSchema,
  verifyOtpSchema,
} from "@/lib/validators/auth";
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

export const requestOtp = async (formData: FormData): Promise<ActionResult> => {
  const parsed = requestOtpSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    await logEvent({
      email: parsed.data.email,
      eventType: "login_failed",
      metadata: { stage: "request_otp", message: error.message },
    });
    return { ok: false, error: "No pudimos enviar el código. Inténtalo en un momento." };
  }

  await logEvent({ email: parsed.data.email, eventType: "otp_requested" });
  return { ok: true, data: { email: parsed.data.email } };
};

export const verifyOtp = async (formData: FormData): Promise<ActionResult> => {
  const parsed = verifyOtpSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: "email",
  });

  if (error || !data.user) {
    await logEvent({
      email: parsed.data.email,
      eventType: "login_failed",
      metadata: { stage: "verify_otp", message: error?.message },
    });
    return { ok: false, error: "Código inválido o vencido. Solicita uno nuevo." };
  }

  await supabase
    .from("user_profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", data.user.id);

  await logEvent({
    userId: data.user.id,
    email: data.user.email ?? parsed.data.email,
    eventType: "otp_verified",
  });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("user_type")
    .eq("id", data.user.id)
    .single();

  const redirectParam = formData.get("redirect");
  const safeRedirect =
    typeof redirectParam === "string" && redirectParam.startsWith("/")
      ? redirectParam
      : null;

  return {
    ok: true,
    data: {
      redirect: safeRedirect ?? (profile?.user_type === "executive" ? "/ejecutivo" : "/cliente"),
    },
  };
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
    contactName: formData.get("contactName"),
    contactPhone: formData.get("contactPhone"),
    companyName: formData.get("companyName"),
    industry: formData.get("industry"),
    expectedVolume: formData.get("expectedVolume"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: true,
      data: { full_name: parsed.data.contactName },
    },
  });

  if (otpError) {
    return { ok: false, error: "No pudimos enviar el código de verificación." };
  }

  const admin = createAdminClient();
  const { data: existingUser } = await admin
    .from("user_profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (existingUser) {
    const { error: insertError } = await admin.from("company_signups").insert({
      user_id: existingUser.id,
      company_name: parsed.data.companyName,
      contact_name: parsed.data.contactName,
      contact_phone: parsed.data.contactPhone,
      industry: parsed.data.industry,
      expected_volume: parsed.data.expectedVolume,
      status: "pending",
    });

    if (insertError) {
      return { ok: false, error: "Recibimos tu correo pero falló el registro de empresa." };
    }
  } else {
    await admin.from("auth_events").insert({
      email: parsed.data.email,
      event_type: "signup_submitted",
      metadata: {
        company_name: parsed.data.companyName,
        contact_name: parsed.data.contactName,
        contact_phone: parsed.data.contactPhone,
        industry: parsed.data.industry,
        expected_volume: parsed.data.expectedVolume,
      },
    });
  }

  await logEvent({ email: parsed.data.email, eventType: "signup_submitted" });
  return { ok: true, data: { email: parsed.data.email } };
};

export const completeSignupAfterVerification = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return;

  const admin = createAdminClient();
  const { data: pending } = await admin
    .from("company_signups")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (pending) return;

  const { data: event } = await admin
    .from("auth_events")
    .select("metadata")
    .eq("email", user.email)
    .eq("event_type", "signup_submitted")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const metadata = (event?.metadata ?? {}) as Record<string, string>;
  if (!metadata.company_name) return;

  await admin.from("company_signups").insert({
    user_id: user.id,
    company_name: metadata.company_name,
    contact_name: metadata.contact_name ?? null,
    contact_phone: metadata.contact_phone ?? null,
    industry: metadata.industry ?? null,
    expected_volume: metadata.expected_volume ?? null,
    status: "pending",
  });
};

export const reviewSignup = async (input: {
  signupId: string;
  decision: "approved" | "rejected";
  reason?: string;
}): Promise<ActionResult> => {
  const executive = await requireExecutive();
  const parsed = reviewSignupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Decisión inválida." };
  }

  const admin = createAdminClient();
  const { data: signup, error: fetchError } = await admin
    .from("company_signups")
    .select("id, user_id, company_name, contact_name, contact_phone, industry, status")
    .eq("id", parsed.data.signupId)
    .single();

  if (fetchError || !signup) {
    return { ok: false, error: "No encontramos la solicitud." };
  }

  if (signup.status !== "pending") {
    return { ok: false, error: "La solicitud ya fue revisada." };
  }

  if (parsed.data.decision === "approved") {
    const { data: company, error: companyError } = await admin
      .from("companies")
      .insert({
        name: signup.company_name,
        contact_name: signup.contact_name,
        contact_phone: signup.contact_phone,
        contact_email: null,
        description: signup.industry,
        active: true,
      })
      .select("id, name")
      .single();

    if (companyError || !company) {
      return { ok: false, error: "No pudimos crear la empresa." };
    }

    const { error: memberError } = await admin.from("company_users").insert({
      company_id: company.id,
      user_id: signup.user_id,
      role: "owner",
      invited_by: executive.id,
      accepted_at: new Date().toISOString(),
    });

    if (memberError) {
      return { ok: false, error: "Empresa creada, pero no logramos asignar al responsable." };
    }

    await admin
      .from("company_signups")
      .update({
        status: "approved",
        reviewed_by: executive.id,
        reviewed_at: new Date().toISOString(),
        created_company_id: company.id,
      })
      .eq("id", signup.id);

    const { data: ownerProfile } = await admin
      .from("user_profiles")
      .select("email, full_name")
      .eq("id", signup.user_id)
      .single();

    if (ownerProfile?.email) {
      try {
        const origin = await getOrigin();
        const html = await render(
          SignupApprovedEmail({
            companyName: company.name,
            contactName: ownerProfile.full_name ?? signup.contact_name ?? "ahí",
            loginUrl: `${origin}/login`,
          }),
        );
        await getResendClient().emails.send({
          from: getDefaultFrom(),
          to: ownerProfile.email,
          subject: `Tu cuenta de ${company.name} ya está activa en Jalector`,
          html,
          replyTo: getReplyTo(),
        });
      } catch {
        return { ok: true };
      }
    }

    await logEvent({
      userId: signup.user_id,
      eventType: "signup_approved",
      metadata: { company_id: company.id },
    });

    revalidatePath("/ejecutivo/empresas");
    return { ok: true };
  }

  await admin
    .from("company_signups")
    .update({
      status: "rejected",
      reviewed_by: executive.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: parsed.data.reason ?? null,
    })
    .eq("id", signup.id);

  const { data: ownerProfile } = await admin
    .from("user_profiles")
    .select("email, full_name")
    .eq("id", signup.user_id)
    .single();

  if (ownerProfile?.email) {
    try {
      const html = await render(
        SignupRejectedEmail({
          companyName: signup.company_name,
          contactName: ownerProfile.full_name ?? signup.contact_name ?? "ahí",
          reason: parsed.data.reason,
        }),
      );
      await getResendClient().emails.send({
        from: getDefaultFrom(),
        to: ownerProfile.email,
        subject: `Actualización sobre tu solicitud para Jalector`,
        html,
        replyTo: getReplyTo(),
      });
    } catch {
      return { ok: true };
    }
  }

  await logEvent({
    userId: signup.user_id,
    eventType: "signup_rejected",
    metadata: { reason: parsed.data.reason },
  });

  revalidatePath("/ejecutivo/empresas");
  return { ok: true };
};

export const inviteCompanyMember = async (formData: FormData): Promise<ActionResult> => {
  const { user, membership } = await requireClient();
  if (membership.role !== "owner") {
    return { ok: false, error: "Solo el administrador de la empresa puede invitar miembros." };
  }

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

  revalidatePath("/cliente/equipo");
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

  const { error: insertError } = await admin
    .from("company_users")
    .upsert(
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
