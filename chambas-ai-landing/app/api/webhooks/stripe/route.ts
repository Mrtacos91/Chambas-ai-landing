import { NextResponse, type NextRequest } from "next/server";
import { activateCompanyAfterPayment } from "@/lib/auth/actions";
import {
  isStripeBillingEnabled,
  verifyStripeWebhookSignature,
} from "@/lib/billing/stripe";

export const runtime = "nodejs";

interface StripeCheckoutSession {
  metadata?: Record<string, string>;
  payment_status?: string;
}

interface StripeWebhookEvent {
  type: string;
  data: { object: StripeCheckoutSession };
}

export const POST = async (request: NextRequest) => {
  if (!isStripeBillingEnabled()) {
    return NextResponse.json({ error: "billing_disabled" }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!verifyStripeWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeWebhookEvent;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const companyId = session.metadata?.company_id;
    const purpose = session.metadata?.purpose;

    if (
      purpose === "company_activation" &&
      companyId &&
      session.payment_status === "paid"
    ) {
      await activateCompanyAfterPayment(companyId);
    }
  }

  return NextResponse.json({ received: true });
};
