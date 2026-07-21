import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export const updatePipelineNotes = async (
  client: Client,
  params: {
    pipelineId: string;
    companyId: string;
    notes: string;
    userId: string;
  },
): Promise<void> => {
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
      notes: params.notes,
      updated_by: params.userId,
      updated_at: now,
    })
    .eq("id", params.pipelineId);

  if (error) {
    throw new Error(error.message);
  }
};
