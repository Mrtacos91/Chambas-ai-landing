import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  type HiringStage,
  isHiringStage,
} from "@/lib/candidates/domain/hiring-stages";
import { ensurePipelineRowsForCompany } from "@/lib/candidates/application/ensure-pipeline-rows";

type Client = SupabaseClient<Database>;

export type CompanyHiringPipelineRow = {
  id: string;
  vacancyId: string;
  vacancyTitle: string;
  candidateId: string | null;
  telefono: string;
  nombreCompleto: string | null;
  edad: number | null;
  ubicacion: string | null;
  ultimoEmpleo: string | null;
  puestoBuscado: string | null;
  experiencia: string | null;
  disponibilidad: string | null;
  turnoPreferido: string | null;
  expectativaSalarial: string | null;
  documentacion: string | null;
  stage: HiringStage;
  notes: string;
  hasInterest: boolean;
  source: string;
  completeness: number;
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

const computeCompleteness = (candidate: ProfileFields | null): number => {
  if (!candidate) return 0;
  const filled = PROFILE_FIELDS.filter((field) => {
    const value = candidate[field];
    return value != null && String(value).trim().length > 0;
  }).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
};

export const listCompanyHiringPipeline = async (
  client: Client,
  companyId: string,
): Promise<CompanyHiringPipelineRow[]> => {
  try {
    await ensurePipelineRowsForCompany(client, companyId);
  } catch {
    // El listado sigue con filas ya sincronizadas si el upsert falla por RLS.
  }

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

  const { data: pipeline, error: pipelineError } = await client
    .from("vacancy_candidate_pipeline")
    .select(
      "id, vacancy_id, candidate_phone, stage, notes, has_interest, source, last_activity_at, updated_at, created_at",
    )
    .in("vacancy_id", vacancyIds)
    .order("last_activity_at", { ascending: false });

  if (pipelineError) {
    throw new Error(pipelineError.message);
  }

  if (!pipeline || pipeline.length === 0) {
    return [];
  }

  const phones = [...new Set(pipeline.map((row) => row.candidate_phone))];
  const { data: candidates, error: candidatesError } = await client
    .from("candidates")
    .select(
      "id, telefono, nombre_completo, edad, ubicacion, ultimo_empleo, puesto_buscado, experiencia, disponibilidad, turno_preferido, expectativa_salarial, documentacion, last_seen_at, last_profile_update_at, updated_at, created_at",
    )
    .in("telefono", phones);

  if (candidatesError) {
    throw new Error(candidatesError.message);
  }

  const candidateByPhone = new Map(
    (candidates ?? []).map((candidate) => [candidate.telefono, candidate]),
  );

  return pipeline.map((row) => {
    const candidate = candidateByPhone.get(row.candidate_phone) ?? null;
    const stage = isHiringStage(row.stage) ? row.stage : "nuevo";
    const activityCandidates = [
      row.last_activity_at,
      row.updated_at,
      candidate?.last_seen_at ?? null,
      candidate?.last_profile_update_at ?? null,
      candidate?.updated_at ?? null,
    ].filter(Boolean) as string[];

    const lastActivity =
      activityCandidates.length > 0
        ? activityCandidates.sort((a, b) => (a > b ? -1 : 1))[0]
        : null;

    return {
      id: row.id,
      vacancyId: row.vacancy_id,
      vacancyTitle: titleById.get(row.vacancy_id) ?? "Vacante",
      candidateId: candidate?.id ?? null,
      telefono: row.candidate_phone,
      nombreCompleto: candidate?.nombre_completo ?? null,
      edad: candidate?.edad ?? null,
      ubicacion: candidate?.ubicacion ?? null,
      ultimoEmpleo: candidate?.ultimo_empleo ?? null,
      puestoBuscado: candidate?.puesto_buscado ?? null,
      experiencia: candidate?.experiencia ?? null,
      disponibilidad: candidate?.disponibilidad ?? null,
      turnoPreferido: candidate?.turno_preferido ?? null,
      expectativaSalarial: candidate?.expectativa_salarial ?? null,
      documentacion: candidate?.documentacion ?? null,
      stage,
      notes: row.notes ?? "",
      hasInterest: row.has_interest,
      source: row.source,
      completeness: computeCompleteness(candidate),
      lastActivity,
    };
  });
};
