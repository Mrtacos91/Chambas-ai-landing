import { NextResponse, type NextRequest } from "next/server";
import { Webhook } from "standardwebhooks";
import { render } from "@react-email/render";
import { getDefaultFrom, getReplyTo, getResendClient } from "@/lib/email/resend";
import { OtpCodeEmail } from "@/lib/email/templates/otp-code";

export const runtime = "nodejs";

interface SupabaseEmailHookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type:
      | "signup"
      | "magiclink"
      | "recovery"
      | "invite"
      | "email_change"
      | "email";
    site_url: string;
  };
}

const subjectByAction: Record<SupabaseEmailHookPayload["email_data"]["email_action_type"], string> = {
  signup: "Confirma tu correo y entra a Jalector",
  magiclink: "Tu código de acceso a Jalector",
  email: "Tu código de acceso a Jalector",
  recovery: "Recupera tu acceso a Jalector",
  invite: "Te invitaron a Jalector",
  email_change: "Confirma el cambio de correo en Jalector",
};

export const POST = async (request: NextRequest) => {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "missing SEND_EMAIL_HOOK_SECRET" },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
  };

  let payload: SupabaseEmailHookPayload;
  try {
    const webhook = new Webhook(secret);
    payload = webhook.verify(rawBody, headers) as SupabaseEmailHookPayload;
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          http_code: 401,
          message: error instanceof Error ? error.message : "Invalid signature",
        },
      },
      { status: 401 },
    );
  }

  try {
    const { user, email_data: data } = payload;
    const action = data.email_action_type;
    const subject = subjectByAction[action] ?? "Tu código de acceso a Jalector";

    const html = await render(
      OtpCodeEmail({
        code: data.token,
        email: user.email,
        expiresInMinutes: 10,
      }),
    );

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getDefaultFrom(),
      to: user.email,
      subject,
      html,
      replyTo: getReplyTo(),
    });

    if (error) {
      return NextResponse.json(
        { error: { http_code: 500, message: error.message } },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          http_code: 500,
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
};
