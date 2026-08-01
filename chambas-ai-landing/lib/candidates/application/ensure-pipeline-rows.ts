import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { HiringStage, PipelineSource } from "@/lib/candidates/domain/hiring-stages";

type Client = SupabaseClient<Database>;

type PipelineSeed = {
  vacancyId: string;
  candidatePhone: string;
  hasInterest: boolean;
  source: PipelineSource;
  lastActivityAt: string;
};

const ADVANCED_STAGES = new Set<HiringStage>([
  "contactado",
  "entrevista",
  "oferta",
  "contratado",
  "descartado",
]);

export const ensurePipelineRowsForCompany = async (
  client: Client,
  companyId: string,
): Promise<void> => {
  const { data: vacancies, error: vacanciesError } = await client
    .from("vacancies")
    .select("id")
    .eq("company_id", companyId);

  if (vacanciesError) {
    throw new Error(vacanciesError.message);
  }

  const vacancyIds = (vacancies ?? []).map((row) => row.id);
  if (vacancyIds.length === 0) {
    return;
  }

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

  const seeds = new Map<string, PipelineSeed>();

  for (const row of matches ?? []) {
    if (!row.candidate_phone || !row.vacancy_id) continue;
    const key = `${row.vacancy_id}:${row.candidate_phone}`;
    const prev = seeds.get(key);
    const createdAt = row.created_at ?? new Date(0).toISOString();
    seeds.set(key, {
      vacancyId: row.vacancy_id,
      candidatePhone: row.candidate_phone,
      hasInterest: prev?.hasInterest ?? false,
      source: prev?.hasInterest ? "interest" : "match",
      lastActivityAt:
        prev && prev.lastActivityAt > createdAt ? prev.lastActivityAt : createdAt,
    });
  }

  for (const row of selected ?? []) {
    if (!row.candidate_phone || !row.vacancy_id) continue;
    const key = `${row.vacancy_id}:${row.candidate_phone}`;
    const prev = seeds.get(key);
    const createdAt = row.created_at ?? new Date(0).toISOString();
    seeds.set(key, {
      vacancyId: row.vacancy_id,
      candidatePhone: row.candidate_phone,
      hasInterest: true,
      source: "interest",
      lastActivityAt:
        prev && prev.lastActivityAt > createdAt ? prev.lastActivityAt : createdAt,
    });
  }

  if (seeds.size === 0) {
    return;
  }

  const payload = [...seeds.values()].map((seed) => ({
    vacancy_id: seed.vacancyId,
    candidate_phone: seed.candidatePhone,
    stage: (seed.hasInterest ? "interesado" : "nuevo") as HiringStage,
    has_interest: seed.hasInterest,
    source: seed.source,
    last_activity_at: seed.lastActivityAt,
  }));

  for (const row of payload) {
    const { data: existing, error: existingError } = await client
      .from("vacancy_candidate_pipeline")
      .select("id, stage, has_interest, source, last_activity_at")
      .eq("vacancy_id", row.vacancy_id)
      .eq("candidate_phone", row.candidate_phone)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (!existing) {
      const { error } = await client.from("vacancy_candidate_pipeline").insert(row);
      if (error) {
        throw new Error(error.message);
      }
      continue;
    }

    const existingStage = existing.stage as HiringStage;
    const nextStage =
      row.has_interest && existingStage === "nuevo" ? "interesado" : existingStage;
    const nextHasInterest = existing.has_interest || row.has_interest;
    const nextSource: PipelineSource =
      nextHasInterest || existing.source === "interest"
        ? "interest"
        : ((existing.source as PipelineSource) ?? row.source);
    const nextActivity =
      existing.last_activity_at && existing.last_activity_at > row.last_activity_at
        ? existing.last_activity_at
        : row.last_activity_at;

    const shouldUpdate =
      existing.has_interest !== nextHasInterest ||
      existing.stage !== nextStage ||
      existing.source !== nextSource ||
      existing.last_activity_at !== nextActivity;

    if (!shouldUpdate) {
      continue;
    }

    if (ADVANCED_STAGES.has(existingStage) && existingStage !== nextStage) {
      const { error } = await client
        .from("vacancy_candidate_pipeline")
        .update({
          has_interest: nextHasInterest,
          source: nextSource,
          last_activity_at: nextActivity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) {
        throw new Error(error.message);
      }
      continue;
    }

    const { error } = await client
      .from("vacancy_candidate_pipeline")
      .update({
        has_interest: nextHasInterest,
        source: nextSource,
        stage: nextStage,
        last_activity_at: nextActivity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }
  }
};
