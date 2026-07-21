import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export type CompanyCandidateRow = {
  id: string;
  telefono: string;
  nombreCompleto: string | null;
  edad: number | null;
  ubicacion: string | null;
  puestoBuscado: string | null;
  experiencia: string | null;
  disponibilidad: string | null;
  status: string | null;
  completeness: number;
  matchedVacancyTitles: string[];
  selectedVacancyTitles: string[];
  lastActivity: string | null;
};

const PROFILE_FIELDS = [
  "nombre_completo",
  "edad",
  "ubicacion",
  "ultimo_empleo",
  "puesto_buscado",
  "experiencia",
  "disponibilidad",
  "turno_preferido",
  "expectativa_salarial",
] as const;

type ProfileFields = Pick<
  Database["public"]["Tables"]["candidates"]["Row"],
  (typeof PROFILE_FIELDS)[number]
>;

const computeCompleteness = (candidate: ProfileFields): number => {
  const filled = PROFILE_FIELDS.filter((field) => {
    const value = candidate[field];
    return value != null && String(value).trim().length > 0;
  }).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
};

export const listCompanyCandidates = async (
  client: Client,
  companyId: string,
): Promise<CompanyCandidateRow[]> => {
  const { data: vacancies, error: vacanciesError } = await client
    .from("vacancies")
    .select("id, title")
    .eq("company_id", companyId);

  if (vacanciesError) {
    throw new Error(vacanciesError.message);
  }

  const vacancyIds = (vacancies ?? []).map((row) => row.id);
  if (vacancyIds.length === 0) {
    return [];
  }

  const titleById = new Map((vacancies ?? []).map((row) => [row.id, row.title]));

  const [{ data: matches }, { data: selected }] = await Promise.all([
    client
      .from("candidate_vacancy_matches")
      .select("candidate_phone, vacancy_id, created_at")
      .in("vacancy_id", vacancyIds),
    client
      .from("candidate_selected_vacancies")
      .select("candidate_phone, vacancy_id, created_at")
      .in("vacancy_id", vacancyIds),
  ]);

  const phones = new Set<string>();
  const matchedByPhone = new Map<string, string[]>();
  const selectedByPhone = new Map<string, string[]>();
  const lastActivityByPhone = new Map<string, string>();

  for (const row of matches ?? []) {
    if (!row.candidate_phone || !row.vacancy_id) continue;
    phones.add(row.candidate_phone);
    const titles = matchedByPhone.get(row.candidate_phone) ?? [];
    const title = titleById.get(row.vacancy_id);
    if (title && !titles.includes(title)) titles.push(title);
    matchedByPhone.set(row.candidate_phone, titles);
    if (row.created_at) {
      const prev = lastActivityByPhone.get(row.candidate_phone);
      if (!prev || row.created_at > prev) {
        lastActivityByPhone.set(row.candidate_phone, row.created_at);
      }
    }
  }

  for (const row of selected ?? []) {
    if (!row.candidate_phone || !row.vacancy_id) continue;
    phones.add(row.candidate_phone);
    const titles = selectedByPhone.get(row.candidate_phone) ?? [];
    const title = titleById.get(row.vacancy_id);
    if (title && !titles.includes(title)) titles.push(title);
    selectedByPhone.set(row.candidate_phone, titles);
    if (row.created_at) {
      const prev = lastActivityByPhone.get(row.candidate_phone);
      if (!prev || row.created_at > prev) {
        lastActivityByPhone.set(row.candidate_phone, row.created_at);
      }
    }
  }

  const phoneList = [...phones];
  if (phoneList.length === 0) {
    return [];
  }

  const { data: candidates, error: candidatesError } = await client
    .from("candidates")
    .select(
      "id, telefono, nombre_completo, edad, ubicacion, ultimo_empleo, puesto_buscado, experiencia, disponibilidad, turno_preferido, expectativa_salarial, status, last_seen_at, last_profile_update_at, updated_at, created_at",
    )
    .in("telefono", phoneList);

  if (candidatesError) {
    throw new Error(candidatesError.message);
  }

  return (candidates ?? [])
    .map((candidate) => {
      const activityCandidates = [
        lastActivityByPhone.get(candidate.telefono) ?? null,
        candidate.last_seen_at,
        candidate.last_profile_update_at,
        candidate.updated_at,
        candidate.created_at,
      ].filter(Boolean) as string[];

      const lastActivity =
        activityCandidates.length > 0
          ? activityCandidates.sort((a, b) => (a > b ? -1 : 1))[0]
          : null;

      return {
        id: candidate.id,
        telefono: candidate.telefono,
        nombreCompleto: candidate.nombre_completo,
        edad: candidate.edad,
        ubicacion: candidate.ubicacion,
        puestoBuscado: candidate.puesto_buscado,
        experiencia: candidate.experiencia,
        disponibilidad: candidate.disponibilidad,
        status: candidate.status,
        completeness: computeCompleteness(candidate),
        matchedVacancyTitles: matchedByPhone.get(candidate.telefono) ?? [],
        selectedVacancyTitles: selectedByPhone.get(candidate.telefono) ?? [],
        lastActivity,
      };
    })
    .sort((a, b) => {
      if (!a.lastActivity && !b.lastActivity) return 0;
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return a.lastActivity > b.lastActivity ? -1 : 1;
    });
};
