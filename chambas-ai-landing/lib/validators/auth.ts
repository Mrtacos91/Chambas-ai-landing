import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "El correo es obligatorio")
  .email("Ingresa un correo válido")
  .max(254)
  .transform((value) => value.toLowerCase());

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/u, "El código debe tener 6 dígitos");

export const requestOtpSchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: otpSchema,
});

export const companySignupSchema = z.object({
  email: emailSchema,
  contactName: z.string().trim().min(2, "El nombre del responsable es obligatorio").max(120),
  contactPhone: z
    .string()
    .trim()
    .min(8, "Teléfono inválido")
    .max(20)
    .regex(/^[+\d\s()-]+$/u, "El teléfono solo puede contener dígitos y símbolos"),
  companyName: z.string().trim().min(2, "El nombre de la empresa es obligatorio").max(160),
  industry: z.string().trim().min(2, "Indica la industria").max(80),
  expectedVolume: z.string().trim().min(1, "Selecciona un volumen estimado").max(80),
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(["owner", "recruiter", "viewer"]),
});

export const reviewSignupSchema = z.object({
  signupId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().trim().max(500).optional(),
});

export type CompanySignupInput = z.infer<typeof companySignupSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type ReviewSignupInput = z.infer<typeof reviewSignupSchema>;
