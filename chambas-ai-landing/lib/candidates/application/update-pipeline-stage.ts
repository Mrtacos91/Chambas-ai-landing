import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  type HiringStage,
  isHiringStage,
} from "@/lib/candidates/domain/hiring-stages";

type Client = SupabaseClient<Database>;

export const updatePipelineStage = async (
  client: Client,
  params: {
    pipelineId: string;
    companyId: string;
    stage: HiringStage;
    userId: string;
  },
): Promise<void> => {
  if (!isHiringStage(params.stage)) {
    throw new Error("Etapa no válida.");
  }

  const { data: row, error: fetchError } = await client
    .from("vacancy_candidate_pipeline")
    .select("id, vacancy_id")
    .eq("id", params.pipelineId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }
  if (!row) {
    throw new Error("No encontramos al candidato en el embudo.");
  }

  const { data: vacancy, error: vacancyError } = await client
    .from("vacancies")
    .select("id, company_id")
    .eq("id", row.vacancy_id)
    .maybeSingle();

  if (vacancyError) {
    throw new Error(vacancyError.message);
  }
  if (!vacancy || vacancy.company_id !== params.companyId) {
    throw new Error("No tienes acceso a esta vacante.");
  }

  const now = new Date().toISOString();
  const { error } = await client
    .from("vacancy_candidate_pipeline")
    .update({
      stage: params.stage,
      updated_by: params.userId,
      last_activity_at: now,
      updated_at: now,
    })
    .eq("id", params.pipelineId);

  if (error) {
    throw new Error(error.message);
  }
};
