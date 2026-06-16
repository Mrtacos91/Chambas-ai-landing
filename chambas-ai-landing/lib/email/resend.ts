import "server-only";
import { Resend } from "resend";

let cachedClient: Resend | null = null;

export const getResendClient = () => {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Falta RESEND_API_KEY en el entorno del servidor.");
  }
  cachedClient = new Resend(apiKey);
  return cachedClient;
};

export const getDefaultFrom = () => {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error("Falta RESEND_FROM_EMAIL en el entorno del servidor.");
  }
  return from;
};

export const getReplyTo = () => process.env.RESEND_REPLY_TO ?? undefined;
