import { z } from "zod";
import { isCanonicalVacancyLocation } from "@/lib/vacancies/domain/mexico-locations";
import { parseMexicoDateTimeToIso } from "@/lib/vacancies/domain/vacancy";

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null));

const optionalMoney = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null || value === "") return null;
    const parsed = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return Math.round(parsed);
  });

const optionalLocation = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .refine(
    (value) => {
      if (value == null || value.length === 0) return true;
      return isCanonicalVacancyLocation(value);
    },
    {
      message:
        'Usa el formato "Ciudad, Estado" o "Remoto" con una entidad federativa válida',
    },
  )
  .transform((value) => (value && value.length > 0 ? value : null));


export const vacancyFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "El título es obligatorio")
      .max(160)
      .refine((value) => value.toLowerCase() !== "otro", {
        message: "Escribe el nombre del puesto en Otro",
      }),
    description: optionalText,
    location: optionalLocation,
    schedule: optionalText,
    salaryMin: optionalMoney,
    salaryMax: optionalMoney,
    preferredShift: optionalText,
    experienceRequired: optionalText,
    benefits: optionalText,
    requirements: optionalText,
    interviewAt: z
      .string()
      .trim()
      .optional()
      .transform((value) => parseMexicoDateTimeToIso(value ?? "")),
    interviewAddress: optionalText,
    interviewDetails: optionalText,
    workStartOn: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
        { message: "Usa una fecha de inicio válida" },
      )
      .transform((value) => (value && value.length > 0 ? value : null)),
    active: z
      .union([z.boolean(), z.string(), z.null(), z.undefined()])
      .transform((value) => {
        if (typeof value === "boolean") return value;
        if (value == null) return true;
        if (value === "false" || value === "0" || value === "off") return false;
        return value === "true" || value === "on" || value === "1";
      }),
  })
  .refine(
    (data) =>
      data.salaryMin == null ||
      data.salaryMax == null ||
      data.salaryMin <= data.salaryMax,
    {
      message: "El salario mínimo no puede ser mayor al máximo",
      path: ["salaryMax"],
    },
  );


export const updateVacancySchema = vacancyFormSchema.extend({
  id: z.string().uuid("Vacante inválida"),
});

export const toggleVacancySchema = z.object({
  id: z.string().uuid("Vacante inválida"),
  active: z.boolean(),
});

export type VacancyFormInput = z.infer<typeof vacancyFormSchema>;
export type UpdateVacancyInput = z.infer<typeof updateVacancySchema>;
