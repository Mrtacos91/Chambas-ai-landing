import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { VacancyFormInput } from "@/lib/validators/vacancy";
import type { VacancyRecord } from "@/lib/vacancies/domain/vacancy";

type AdminOrUserClient = SupabaseClient<Database>;

const VACANCY_COLUMNS =
  "id, company_id, title, description, location, schedule, salary_min, salary_max, preferred_shift, experience_required, benefits, requirements, interview_at, interview_address, interview_details, work_start_on, active, created_at, updated_at";

const mapVacancy = (row: Database["public"]["Tables"]["vacancies"]["Row"]): VacancyRecord => ({
  id: row.id,
  companyId: row.company_id ?? "",
  title: row.title,
  description: row.description,
  location: row.location,
  schedule: row.schedule,
  salaryMin: row.salary_min,
  salaryMax: row.salary_max,
  preferredShift: row.preferred_shift,
  experienceRequired: row.experience_required,
  benefits: row.benefits,
  requirements: row.requirements,
  interviewAt: row.interview_at,
  interviewAddress: row.interview_address,
  interviewDetails: row.interview_details,
  workStartOn: row.work_start_on,
  active: row.active ?? false,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listCompanyVacancies = async (
  client: AdminOrUserClient,
  companyId: string,
): Promise<VacancyRecord[]> => {
  const { data, error } = await client
    .from("vacancies")
    .select(VACANCY_COLUMNS)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapVacancy);
};

export const createVacancy = async (
  client: AdminOrUserClient,
  companyId: string,
  input: VacancyFormInput,
): Promise<VacancyRecord> => {
  const { data, error } = await client
    .from("vacancies")
    .insert({
      company_id: companyId,
      title: input.title,
      description: input.description,
      location: input.location,
      schedule: input.schedule,
      salary_min: input.salaryMin,
      salary_max: input.salaryMax,
      preferred_shift: input.preferredShift,
      experience_required: input.experienceRequired,
      benefits: input.benefits,
      requirements: input.requirements,
      interview_at: input.interviewAt,
      interview_address: input.interviewAddress,
      interview_details: input.interviewDetails,
      work_start_on: input.workStartOn,
      active: input.active,
    })
    .select(VACANCY_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No pudimos crear la vacante.");
  }

  return mapVacancy(data);
};

export const updateVacancy = async (
  client: AdminOrUserClient,
  companyId: string,
  vacancyId: string,
  input: VacancyFormInput,
): Promise<VacancyRecord> => {
  const { data, error } = await client
    .from("vacancies")
    .update({
      title: input.title,
      description: input.description,
      location: input.location,
      schedule: input.schedule,
      salary_min: input.salaryMin,
      salary_max: input.salaryMax,
      preferred_shift: input.preferredShift,
      experience_required: input.experienceRequired,
      benefits: input.benefits,
      requirements: input.requirements,
      interview_at: input.interviewAt,
      interview_address: input.interviewAddress,
      interview_details: input.interviewDetails,
      work_start_on: input.workStartOn,
      active: input.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vacancyId)
    .eq("company_id", companyId)
    .select(VACANCY_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No pudimos actualizar la vacante.");
  }

  return mapVacancy(data);
};

export const setVacancyActive = async (
  client: AdminOrUserClient,
  companyId: string,
  vacancyId: string,
  active: boolean,
): Promise<VacancyRecord> => {
  const { data, error } = await client
    .from("vacancies")
    .update({
      active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vacancyId)
    .eq("company_id", companyId)
    .select(VACANCY_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No pudimos actualizar el estado de la vacante.");
  }

  return mapVacancy(data);
};
