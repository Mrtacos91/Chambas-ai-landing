"use server";

import { revalidatePath } from "next/cache";
import { requireCompanyAdmin, requireUsuario } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  createVacancy,
  listCompanyVacancies,
  setVacancyActive,
  updateVacancy,
} from "@/lib/vacancies/application/manage-vacancies";
import {
  toggleVacancySchema,
  updateVacancySchema,
  vacancyFormSchema,
} from "@/lib/validators/vacancy";

interface ActionResult<T = unknown> {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

const fieldErrorsFromZod = (error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): Record<string, string> => {
  const flat = error.flatten().fieldErrors;
  const result: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages?.[0]) result[key] = messages[0];
  }
  return result;
};

export const createCompanyVacancy = async (
  formData: FormData,
): Promise<ActionResult> => {
  const { membership } = await requireCompanyAdmin();
  const parsed = vacancyFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
    schedule: formData.get("schedule") || undefined,
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    preferredShift: formData.get("preferredShift") || undefined,
    experienceRequired: formData.get("experienceRequired") || undefined,
    benefits: formData.get("benefits") || undefined,
    requirements: formData.get("requirements") || undefined,
    interviewAt: formData.get("interviewAt") || undefined,
    interviewAddress: formData.get("interviewAddress") || undefined,
    interviewDetails: formData.get("interviewDetails") || undefined,
    workStartOn: formData.get("workStartOn") || undefined,
    active: formData.get("active"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los datos de la vacante.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const supabase = await createClient();
    const vacancy = await createVacancy(supabase, membership.companyId, parsed.data);
    revalidatePath("/cliente");
    return { ok: true, data: vacancy };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No pudimos crear la vacante.",
    };
  }
};

export const updateCompanyVacancy = async (
  formData: FormData,
): Promise<ActionResult> => {
  const { membership } = await requireCompanyAdmin();
  const parsed = updateVacancySchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
    schedule: formData.get("schedule") || undefined,
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    preferredShift: formData.get("preferredShift") || undefined,
    experienceRequired: formData.get("experienceRequired") || undefined,
    benefits: formData.get("benefits") || undefined,
    requirements: formData.get("requirements") || undefined,
    interviewAt: formData.get("interviewAt") || undefined,
    interviewAddress: formData.get("interviewAddress") || undefined,
    interviewDetails: formData.get("interviewDetails") || undefined,
    workStartOn: formData.get("workStartOn") || undefined,
    active: formData.get("active"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los datos de la vacante.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const supabase = await createClient();
    const { id, ...input } = parsed.data;
    const vacancy = await updateVacancy(supabase, membership.companyId, id, input);
    revalidatePath("/cliente");
    return { ok: true, data: vacancy };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No pudimos actualizar la vacante.",
    };
  }
};

export const toggleCompanyVacancy = async (
  vacancyId: string,
  active: boolean,
): Promise<ActionResult> => {
  const { membership } = await requireCompanyAdmin();
  const parsed = toggleVacancySchema.safeParse({ id: vacancyId, active });
  if (!parsed.success) {
    return { ok: false, error: "Vacante inválida." };
  }

  try {
    const supabase = await createClient();
    const vacancy = await setVacancyActive(
      supabase,
      membership.companyId,
      parsed.data.id,
      parsed.data.active,
    );
    revalidatePath("/cliente");
    return { ok: true, data: vacancy };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "No pudimos cambiar el estado de la vacante.",
    };
  }
};

export const getCompanyVacanciesAction = async (): Promise<ActionResult> => {
  const { membership } = await requireUsuario();
  try {
    const supabase = await createClient();
    const vacancies = await listCompanyVacancies(supabase, membership.companyId);
    return { ok: true, data: vacancies };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No pudimos cargar las vacantes.",
    };
  }
};
