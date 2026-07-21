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

  const { error } = await client.from("vacancy_candidate_pipeline").upsert(payload, {
    onConflict: "vacancy_id,candidate_phone",
    ignoreDuplicates: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const interestUpdates = payload.filter((row) => row.has_interest);
  if (interestUpdates.length === 0) {
    return;
  }

  await Promise.all(
    interestUpdates.map(async (row) => {
      const { data: existing } = await client
        .from("vacancy_candidate_pipeline")
        .select("id, stage, has_interest")
        .eq("vacancy_id", row.vacancy_id)
        .eq("candidate_phone", row.candidate_phone)
        .maybeSingle();

      if (!existing) return;

      const nextStage =
        existing.stage === "nuevo" && !existing.has_interest
          ? "interesado"
          : existing.stage;

      if (existing.has_interest && existing.stage === nextStage) {
        return;
      }

      await client
        .from("vacancy_candidate_pipeline")
        .update({
          has_interest: true,
          source: "interest",
          stage: nextStage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }),
  );
};
