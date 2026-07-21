export const VACANCY_FIELD_OTHER = "Otro";

export const VACANCY_SHIFTS = [
  "Matutino",
  "Vespertino",
  "Nocturno",
  "Cualquiera",
] as const;

export const VACANCY_EXPERIENCE_LEVELS = [
  "Sin experiencia",
  "Menos de 1 año",
  "1 a 2 años",
  "3 a 5 años",
  "Más de 5 años",
] as const;

export const VACANCY_SCHEDULES = [
  "Tiempo completo",
  "Medio tiempo",
  "Fines de semana",
  "Por turnos",
  "Horario flexible",
] as const;

export type VacancyShift = (typeof VACANCY_SHIFTS)[number];
export type VacancyExperienceLevel = (typeof VACANCY_EXPERIENCE_LEVELS)[number];
export type VacancySchedule = (typeof VACANCY_SCHEDULES)[number];

const isInList = <T extends string>(
  list: readonly T[],
  value: string,
): value is T => list.includes(value as T);

export const isVacancyShift = (value: string): value is VacancyShift =>
  isInList(VACANCY_SHIFTS, value.trim());

export const isVacancyExperienceLevel = (
  value: string,
): value is VacancyExperienceLevel =>
  isInList(VACANCY_EXPERIENCE_LEVELS, value.trim());

export const isVacancySchedule = (value: string): value is VacancySchedule =>
  isInList(VACANCY_SCHEDULES, value.trim());

export const resolveCatalogOrCustom = (
  selected: string,
  custom?: string | null,
): string | null => {
  const choice = selected.trim();
  if (!choice) return null;
  if (choice === VACANCY_FIELD_OTHER) {
    const customValue = (custom ?? "").trim();
    return customValue.length > 0 ? customValue : null;
  }
  return choice;
};

export const splitCatalogOrCustom = (
  value: string | null | undefined,
  catalog: readonly string[],
): { selected: string; custom: string } => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return { selected: "", custom: "" };
  }
  if (catalog.includes(trimmed)) {
    return { selected: trimmed, custom: "" };
  }
  return { selected: VACANCY_FIELD_OTHER, custom: trimmed };
};
