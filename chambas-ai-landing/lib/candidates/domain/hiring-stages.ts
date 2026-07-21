export const HIRING_STAGES = [
  "nuevo",
  "interesado",
  "contactado",
  "entrevista",
  "oferta",
  "contratado",
  "descartado",
] as const;

export type HiringStage = (typeof HIRING_STAGES)[number];

export const HIRING_STAGE_LABELS: Record<HiringStage, string> = {
  nuevo: "Nuevo",
  interesado: "Interesado",
  contactado: "Contactado",
  entrevista: "Entrevista",
  oferta: "Oferta",
  contratado: "Contratado",
  descartado: "Descartado",
};

export const HIRING_PIPELINE_ORDER: HiringStage[] = [
  "nuevo",
  "interesado",
  "contactado",
  "entrevista",
  "oferta",
  "contratado",
  "descartado",
];

export const QUICK_STAGE_ACTIONS: { stage: HiringStage; label: string }[] = [
  { stage: "contactado", label: "Contactar" },
  { stage: "entrevista", label: "Entrevista" },
  { stage: "contratado", label: "Contratar" },
  { stage: "descartado", label: "Descartar" },
];

export const isHiringStage = (value: string): value is HiringStage =>
  (HIRING_STAGES as readonly string[]).includes(value);

export const PIPELINE_SOURCES = ["match", "interest", "manual"] as const;
export type PipelineSource = (typeof PIPELINE_SOURCES)[number];
