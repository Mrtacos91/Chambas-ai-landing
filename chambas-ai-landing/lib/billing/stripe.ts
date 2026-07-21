import { createHmac, timingSafeEqual } from "node:crypto";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

export const isStripeBillingEnabled = () =>
  process.env.BILLING_PROVIDER === "stripe" &&
  Boolean(process.env.STRIPE_SECRET_KEY) &&
  Boolean(process.env.STRIPE_ACTIVATION_PRICE_ID);

const encodeForm = (params: Record<string, string>) =>
  new URLSearchParams(params).toString();

export const createActivationCheckoutSession = async (params: {
  companyId: string;
  companyName: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  if (!isStripeBillingEnabled()) {
    return {
      ok: false as const,
      error: "El cobro en línea no está habilitado. Un administrador activará tu cuenta.",
    };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY as string;
  const priceId = process.env.STRIPE_ACTIVATION_PRICE_ID as string;

  const body = encodeForm({
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    "metadata[company_id]": params.companyId,
    "metadata[company_name]": params.companyName,
    "metadata[purpose]": "company_activation",
  });

  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = (await response.json()) as {
    url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.url) {
    return {
      ok: false as const,
      error: payload.error?.message ?? "No pudimos iniciar el pago de activación.",
    };
  }

  return { ok: true as const, url: payload.url };
};

export const verifyStripeWebhookSignature = (
  payload: string,
  signature: string | null,
) => {
  if (!isStripeBillingEnabled()) {
    return false;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !signature) {
    return false;
  }

  const parts = signature.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  const timestamp = parts.t;
  const expected = parts.v1;
  if (!timestamp || !expected) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const computed = createHmac("sha256", webhookSecret)
    .update(signedPayload, "utf8")
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(expected));
  } catch {
    return false;
  }
};
