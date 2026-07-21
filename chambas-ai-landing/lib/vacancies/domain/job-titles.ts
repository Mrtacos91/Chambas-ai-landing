export const JOB_TITLE_OTHER = "Otro";

export const JOB_TITLES = [
  "Almacenista",
  "Analista de datos",
  "Asistente administrativo",
  "Auxiliar administrativo",
  "Ayudante de almacén",
  "Ayudante de cocina",
  "Ayudante general",
  "Bartender",
  "Cajero",
  "Cajera",
  "Chofer",
  "Cocinero",
  "Community manager",
  "Desarrollador de software",
  "Diseñador gráfico",
  "Diseñador UI/UX",
  "Electricista",
  "Guardia de seguridad",
  "Hostess",
  "Lavaloza",
  "Limpieza",
  "Mesero",
  "Mesera",
  "Montacargas",
  "Recepcionista",
  "Repartidor",
  "Soporte técnico",
  "Supervisor de piso",
  "Ventas",
] as const;

export type CatalogJobTitle = (typeof JOB_TITLES)[number];

export const isCatalogJobTitle = (title: string): title is CatalogJobTitle =>
  (JOB_TITLES as readonly string[]).includes(title.trim());

export const resolveJobTitle = (
  selected: string,
  custom?: string | null,
): string => {
  const choice = selected.trim();
  if (choice === JOB_TITLE_OTHER) {
    return (custom ?? "").trim();
  }
  if (isCatalogJobTitle(choice)) {
    return choice;
  }
  return choice || (custom ?? "").trim();
};

export const splitJobTitleForForm = (
  title: string,
): { selected: string; custom: string } => {
  const trimmed = title.trim();
  if (!trimmed) {
    return { selected: "", custom: "" };
  }
  if (isCatalogJobTitle(trimmed)) {
    return { selected: trimmed, custom: "" };
  }
  return { selected: JOB_TITLE_OTHER, custom: trimmed };
};

export const formatJobTitlesForWhatsApp = (): string =>
  JOB_TITLES.map((title, index) => `${index + 1}. ${title}`).join("\n");

export const resolveJobTitleFromWhatsAppReply = (
  reply: string,
): string | null => {
  const normalized = reply.trim();
  if (!normalized) return null;

  const asNumber = Number(normalized);
  if (
    Number.isInteger(asNumber) &&
    asNumber >= 1 &&
    asNumber <= JOB_TITLES.length
  ) {
    return JOB_TITLES[asNumber - 1];
  }

  const matchByIndex = normalized.match(/^(\d+)\s*[.)\-:]?\s*/);
  if (matchByIndex) {
    const index = Number(matchByIndex[1]);
    if (Number.isInteger(index) && index >= 1 && index <= JOB_TITLES.length) {
      return JOB_TITLES[index - 1];
    }
  }

  const lower = normalized.toLowerCase();
  const catalogHit = JOB_TITLES.find(
    (title) => title.toLowerCase() === lower,
  );
  if (catalogHit) return catalogHit;

  return normalized.replace(/\s+/g, " ");
};
