import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { canSendInterviewInvite } from "@/lib/candidates/domain/confirmation-status";
import { isConfirmationStatus } from "@/lib/candidates/domain/confirmation-status";
import { hasInterviewInviteReady } from "@/lib/vacancies/domain/vacancy";
import { signCitaWebhookPayload } from "@/lib/n8n/cita-webhook";

type Client = SupabaseClient<Database>;

export type InterviewInvitePayload = {
  pipelineId: string;
  vacancyId: string;
  phone: string;
  nombre: string;
  vacante: string;
  empresa: string;
  interview_at: string;
  interview_address: string;
  interview_details: string;
  work_start_on: string;
  last_seen_at: string;
};

export const inviteCandidateToInterview = async (
  client: Client,
  params: {
    pipelineId: string;
    companyId: string;
    companyName: string;
    userId: string;
  },
): Promise<{ payload: InterviewInvitePayload }> => {
  const webhookUrl = process.env.N8N_CITA_WEBHOOK_URL?.trim();
  const webhookSecret = process.env.N8N_CITA_WEBHOOK_SECRET?.trim();
  if (!webhookUrl || !webhookSecret) {
    throw new Error("Falta configurar el webhook de citas (n8n).");
  }

  const { data: row, error: rowError } = await client
    .from("vacancy_candidate_pipeline")
    .select(
      "id, vacancy_id, candidate_phone, confirmation_status, stage",
    )
    .eq("id", params.pipelineId)
    .maybeSingle();

  if (rowError) throw new Error(rowError.message);
  if (!row) throw new Error("No encontramos al candidato en el embudo.");

  const status = isConfirmationStatus(row.confirmation_status)
    ? row.confirmation_status
    : "none";
  if (!canSendInterviewInvite(status)) {
    throw new Error("Esta cita ya fue enviada o confirmada.");
  }

  const { data: vacancy, error: vacancyError } = await client
    .from("vacancies")
    .select(
      "id, company_id, title, interview_at, interview_address, interview_details, work_start_on, active",
    )
    .eq("id", row.vacancy_id)
    .maybeSingle();

  if (vacancyError) throw new Error(vacancyError.message);
  if (!vacancy || vacancy.company_id !== params.companyId) {
    throw new Error("No tienes acceso a esta vacante.");
  }
  if (!hasInterviewInviteReady({
    interviewAt: vacancy.interview_at,
    interviewAddress: vacancy.interview_address,
  })) {
    throw new Error("Completa fecha y sede de reclutamiento en la vacante.");
  }
  if (!vacancy.interview_at || new Date(vacancy.interview_at).getTime() <= Date.now()) {
    throw new Error("La fecha de la cita debe ser futura.");
  }

  const { data: candidate } = await client
    .from("candidates")
    .select("nombre_completo, last_seen_at")
    .eq("telefono", row.candidate_phone)
    .maybeSingle();

  const payload: InterviewInvitePayload = {
    pipelineId: row.id,
    vacancyId: vacancy.id,
    phone: row.candidate_phone,
    nombre: (candidate?.nombre_completo ?? "").trim() || "candidato",
    vacante: vacancy.title,
    empresa: params.companyName,
    interview_at: vacancy.interview_at,
    interview_address: (vacancy.interview_address ?? "").trim(),
    interview_details: (vacancy.interview_details ?? "").trim(),
    work_start_on: vacancy.work_start_on ?? "",
    last_seen_at: candidate?.last_seen_at ?? "",
  };

  const body = JSON.stringify(payload);
  const signature = signCitaWebhookPayload(body, webhookSecret);
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Jalector-Signature": signature,
      "X-Jalector-Secret": webhookSecret,
    },
    body,
  });

  if (!response.ok) {
    throw new Error("n8n no pudo enviar la confirmación de cita.");
  }

  const now = new Date().toISOString();
  const { error: updateError } = await client
    .from("vacancy_candidate_pipeline")
    .update({
      stage: "entrevista",
      confirmation_status: "sent",
      confirmation_sent_at: now,
      last_activity_at: now,
      updated_at: now,
      updated_by: params.userId,
    })
    .eq("id", params.pipelineId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { payload };
};
