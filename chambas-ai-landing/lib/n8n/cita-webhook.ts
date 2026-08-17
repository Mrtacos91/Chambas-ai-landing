import { createHmac, timingSafeEqual } from "crypto";

export const signCitaWebhookPayload = (body: string, secret: string): string =>
  createHmac("sha256", secret).update(body).digest("hex");

export const verifyCitaWebhookSignature = (
  body: string,
  secret: string,
  signature: string | null,
): boolean => {
  if (!signature) return false;
  const expected = signCitaWebhookPayload(body, secret);
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
};
