export type VacancyRecord = {
  id: string;
  companyId: string;
  title: string;
  description: string | null;
  location: string | null;
  schedule: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  preferredShift: string | null;
  experienceRequired: string | null;
  benefits: string | null;
  requirements: string | null;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type VacancyInput = {
  title: string;
  description?: string | null;
  location?: string | null;
  schedule?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  preferredShift?: string | null;
  experienceRequired?: string | null;
  benefits?: string | null;
  requirements?: string | null;
  active?: boolean;
};

export const formatSalaryRange = (
  salaryMin: number | null,
  salaryMax: number | null,
): string => {
  if (salaryMin == null && salaryMax == null) {
    return "Sin rango";
  }
  if (salaryMin != null && salaryMax != null) {
    return `$${salaryMin.toLocaleString("es-MX")} – $${salaryMax.toLocaleString("es-MX")}`;
  }
  if (salaryMin != null) {
    return `Desde $${salaryMin.toLocaleString("es-MX")}`;
  }
  return `Hasta $${salaryMax!.toLocaleString("es-MX")}`;
};
