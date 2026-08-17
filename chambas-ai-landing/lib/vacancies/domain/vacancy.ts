export type VacancyRecord = {
  id: string;
  companyId: string;
  title: string;
  description: string | null;
  location: string | null;
  schedule: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  preferredShift: string | null;
  experienceRequired: string | null;
  benefits: string | null;
  requirements: string | null;
  interviewAt: string | null;
  interviewAddress: string | null;
  interviewDetails: string | null;
  workStartOn: string | null;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type VacancyInput = {
  title: string;
  description?: string | null;
  location?: string | null;
  schedule?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  preferredShift?: string | null;
  experienceRequired?: string | null;
  benefits?: string | null;
  requirements?: string | null;
  interviewAt?: string | null;
  interviewAddress?: string | null;
  interviewDetails?: string | null;
  workStartOn?: string | null;
  active?: boolean;
};

export const MEXICO_CITY_TZ = "America/Mexico_City";

export const hasInterviewInviteReady = (vacancy: {
  interviewAt: string | null;
  interviewAddress: string | null;
}): boolean =>
  Boolean(vacancy.interviewAt && vacancy.interviewAddress?.trim());

export const toMexicoDatetimeLocal = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MEXICO_CITY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
};

export const parseMexicoDateTimeToIso = (value: string | null | undefined): string | null => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed) && !/[zZ]|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    const withSeconds = trimmed.length === 16 ? `${trimmed}:00` : trimmed;
    const parsed = new Date(`${withSeconds}-06:00`);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

export const formatInterviewAt = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: MEXICO_CITY_TZ,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const sanitizeTemplateParam = (value: string | null | undefined): string =>
  (value ?? "")
    .replace(/[\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "—";

export const formatSalaryRange = (
  salaryMin: number | null,
  salaryMax: number | null,
): string => {
  if (salaryMin == null && salaryMax == null) {
    return "Sin rango";
  }
  if (salaryMin != null && salaryMax != null) {
    return `$${salaryMin.toLocaleString("es-MX")} – $${salaryMax.toLocaleString("es-MX")}`;
  }
  if (salaryMin != null) {
    return `Desde $${salaryMin.toLocaleString("es-MX")}`;
  }
  return `Hasta $${salaryMax!.toLocaleString("es-MX")}`;
};
