import { type HiringStage } from "@/lib/candidates/domain/hiring-stages";

export const TEMPLATE_STAGES = [
  "contactado",
  "entrevista",
  "contratado",
  "descartado",
] as const;

export type TemplateStage = (typeof TEMPLATE_STAGES)[number];

export type HiringMessageTemplateMap = Record<TemplateStage, string>;

export const TEMPLATE_VARIABLES = [
  { key: "nombre", label: "Nombre del candidato" },
  { key: "vacante", label: "Título de la vacante" },
  { key: "empresa", label: "Nombre de la empresa" },
] as const;

export type TemplateVariableKey = (typeof TEMPLATE_VARIABLES)[number]["key"];

export const DEFAULT_HIRING_MESSAGE_TEMPLATES: HiringMessageTemplateMap = {
  contactado:
    "Hola {{nombre}}, te escribe {{empresa}}. Vimos tu perfil para la vacante de {{vacante}} y nos gustaría platicar contigo. ¿Tienes un momento esta semana?",
  entrevista:
    "Hola {{nombre}}, soy de {{empresa}}. Quedamos en agendar una entrevista para la vacante de {{vacante}}. ¿Qué día y horario te acomodan?",
  contratado:
    "Hola {{nombre}}, buenas noticias: en {{empresa}} queremos avanzar contigo para la vacante de {{vacante}}. ¿Podemos coordinar los siguientes pasos?",
  descartado:
    "Hola {{nombre}}, gracias por tu interés en {{vacante}} con {{empresa}}. Por ahora continuamos con otros perfiles, pero guardamos tu información para futuras vacantes.",
};

export const emptyHiringMessageTemplates = (): HiringMessageTemplateMap => ({
  contactado: "",
  entrevista: "",
  contratado: "",
  descartado: "",
});

export const isTemplateStage = (value: string): value is TemplateStage =>
  (TEMPLATE_STAGES as readonly string[]).includes(value);

export const mergeHiringMessageTemplates = (
  stored: Partial<Record<string, string>> | null | undefined,
): HiringMessageTemplateMap => {
  const base = { ...DEFAULT_HIRING_MESSAGE_TEMPLATES };
  if (!stored) return base;
  for (const stage of TEMPLATE_STAGES) {
    const value = stored[stage];
    if (typeof value === "string") {
      base[stage] = value;
    }
  }
  return base;
};

export const renderHiringMessageTemplate = (
  template: string,
  vars: Partial<Record<TemplateVariableKey, string | null | undefined>>,
): string => {
  const replacements: Record<TemplateVariableKey, string> = {
    nombre: (vars.nombre ?? "").trim() || "candidato",
    vacante: (vars.vacante ?? "").trim() || "la vacante",
    empresa: (vars.empresa ?? "").trim() || "nuestro equipo",
  };

  return template
    .replace(/\{\{\s*(nombre|vacante|empresa)\s*\}\}/gi, (_match, key: string) => {
      const normalized = key.toLowerCase() as TemplateVariableKey;
      return replacements[normalized];
    })
    .trim();
};

export const buildWhatsAppUrl = (phone: string, message?: string | null): string => {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  const text = (message ?? "").trim();
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
};

export const isHiringStageWithTemplate = (
  stage: HiringStage,
): stage is TemplateStage => isTemplateStage(stage);
