"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import type { VacancyRecord } from "@/lib/vacancies/domain/vacancy";
import { formatSalaryRange } from "@/lib/vacancies/domain/vacancy";
import {
  JOB_TITLE_OTHER,
  JOB_TITLES,
  resolveJobTitle,
  splitJobTitleForForm,
} from "@/lib/vacancies/domain/job-titles";
import {
  VACANCY_EXPERIENCE_LEVELS,
  VACANCY_FIELD_OTHER,
  VACANCY_SCHEDULES,
  VACANCY_SHIFTS,
  resolveCatalogOrCustom,
  splitCatalogOrCustom,
} from "@/lib/vacancies/domain/vacancy-form-options";
import {
  createCompanyVacancy,
  toggleCompanyVacancy,
  updateCompanyVacancy,
} from "@/lib/vacancies/actions";

type VacancyFormState = {
  id?: string;
  titleSelected: string;
  titleCustom: string;
  description: string;
  location: string;
  scheduleSelected: string;
  scheduleCustom: string;
  salaryMin: string;
  salaryMax: string;
  preferredShift: string;
  experienceSelected: string;
  experienceCustom: string;
  benefits: string;
  requirements: string;
  active: boolean;
};

const emptyForm = (): VacancyFormState => ({
  titleSelected: "",
  titleCustom: "",
  description: "",
  location: "",
  scheduleSelected: "",
  scheduleCustom: "",
  salaryMin: "",
  salaryMax: "",
  preferredShift: "",
  experienceSelected: "",
  experienceCustom: "",
  benefits: "",
  requirements: "",
  active: true,
});

const fromRecord = (vacancy: VacancyRecord): VacancyFormState => {
  const titleParts = splitJobTitleForForm(vacancy.title);
  const scheduleParts = splitCatalogOrCustom(vacancy.schedule, VACANCY_SCHEDULES);
  const experienceParts = splitCatalogOrCustom(
    vacancy.experienceRequired,
    VACANCY_EXPERIENCE_LEVELS,
  );
  const shiftValue = (vacancy.preferredShift ?? "").trim();
  const preferredShift = (VACANCY_SHIFTS as readonly string[]).includes(shiftValue)
    ? shiftValue
    : "";

  return {
    id: vacancy.id,
    titleSelected: titleParts.selected,
    titleCustom: titleParts.custom,
    description: vacancy.description ?? "",
    location: vacancy.location ?? "",
    scheduleSelected: scheduleParts.selected,
    scheduleCustom: scheduleParts.custom,
    salaryMin: vacancy.salaryMin?.toString() ?? "",
    salaryMax: vacancy.salaryMax?.toString() ?? "",
    preferredShift,
    experienceSelected: experienceParts.selected,
    experienceCustom: experienceParts.custom,
    benefits: vacancy.benefits ?? "",
    requirements: vacancy.requirements ?? "",
    active: vacancy.active,
  };
};

export const VacanciesModule = ({
  canManage,
  vacancies,
}: {
  canManage: boolean;
  vacancies: VacancyRecord[];
}) => {
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<VacancyFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const openCreate = () => {
    setForm(emptyForm());
    setFormOpen(true);
    setError(null);
    setFieldErrors({});
  };

  const openEdit = (vacancy: VacancyRecord) => {
    setForm(fromRecord(vacancy));
    setFormOpen(true);
    setError(null);
    setFieldErrors({});
  };

  const submit = (formData: FormData) => {
    setError(null);
    setFieldErrors({});

    const resolvedTitle = resolveJobTitle(form.titleSelected, form.titleCustom);
    if (!resolvedTitle || resolvedTitle.length < 2) {
      setFieldErrors({
        title:
          form.titleSelected === JOB_TITLE_OTHER
            ? "Escribe el nombre del puesto"
            : "Selecciona un puesto",
      });
      return;
    }

    if (form.scheduleSelected === VACANCY_FIELD_OTHER && !form.scheduleCustom.trim()) {
      setFieldErrors({ schedule: "Escribe el horario o elige una opción" });
      return;
    }

    if (
      form.experienceSelected === VACANCY_FIELD_OTHER &&
      !form.experienceCustom.trim()
    ) {
      setFieldErrors({
        experienceRequired: "Escribe la experiencia o elige una opción",
      });
      return;
    }

    const resolvedSchedule = resolveCatalogOrCustom(
      form.scheduleSelected,
      form.scheduleCustom,
    );
    const resolvedExperience = resolveCatalogOrCustom(
      form.experienceSelected,
      form.experienceCustom,
    );

    formData.set("title", resolvedTitle);
    formData.set("schedule", resolvedSchedule ?? "");
    formData.set("preferredShift", form.preferredShift.trim());
    formData.set("experienceRequired", resolvedExperience ?? "");

    startTransition(async () => {
      const result = form.id
        ? await updateCompanyVacancy(formData)
        : await createCompanyVacancy(formData);
      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        setError(result.error ?? "No pudimos guardar la vacante.");
        return;
      }
      setFormOpen(false);
      setForm(emptyForm());
    });
  };

  const toggleActive = (vacancy: VacancyRecord) => {
    startTransition(async () => {
      const result = await toggleCompanyVacancy(vacancy.id, !vacancy.active);
      if (!result.ok) {
        setError(result.error ?? "No pudimos cambiar el estado.");
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-green)]">
            Vacantes
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold">Publicaciones de tu empresa</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
            Usa las opciones del catálogo para que WhatsApp ofrezca esta vacante sin errores
            de acentos u ortografía. Solo el administrador puede crear o editar.
          </p>
        </div>
        {canManage ? (
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-navy)] px-4 text-sm font-semibold text-[var(--background)]"
            onClick={openCreate}
            type="button"
          >
            <Plus size={16} />
            Nueva vacante
          </button>
        ) : null}
      </div>

      {formOpen && canManage ? (
        <form
          action={submit}
          className="executive-card space-y-6 rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
        >
          {form.id ? <input name="id" type="hidden" value={form.id} /> : null}

          <section className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold">Puesto</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                El chatbot busca candidatos con este mismo título.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="auth-label sm:col-span-2">
                Puesto
                <select
                  className="auth-input"
                  disabled={pending}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      titleSelected: event.target.value,
                      titleCustom:
                        event.target.value === JOB_TITLE_OTHER ? prev.titleCustom : "",
                    }))
                  }
                  required
                  value={form.titleSelected}
                >
                  <option disabled value="">
                    Selecciona un puesto
                  </option>
                  {JOB_TITLES.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                  <option value={JOB_TITLE_OTHER}>{JOB_TITLE_OTHER}</option>
                </select>
                {fieldErrors.title ? (
                  <span className="auth-field-error">{fieldErrors.title}</span>
                ) : null}
              </label>
              {form.titleSelected === JOB_TITLE_OTHER ? (
                <label className="auth-label sm:col-span-2">
                  Nombre del puesto
                  <input
                    className="auth-input"
                    disabled={pending}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, titleCustom: event.target.value }))
                    }
                    placeholder="Ej. Ayudante de piso"
                    required
                    value={form.titleCustom}
                  />
                </label>
              ) : null}
              <label className="auth-label sm:col-span-2">
                Descripción breve
                <textarea
                  className="auth-input min-h-24"
                  disabled={pending}
                  name="description"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Qué hará la persona en el día a día"
                  value={form.description}
                />
              </label>
            </div>
          </section>

          <section className="space-y-4 border-t border-[var(--line)] pt-5">
            <div>
              <h3 className="font-display text-lg font-bold">Condiciones</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Turno y experiencia deben coincidir con las opciones del chat.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="auth-label">
                Ubicación
                <input
                  className="auth-input"
                  disabled={pending}
                  name="location"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, location: event.target.value }))
                  }
                  placeholder="Ej. Polanco, CDMX"
                  value={form.location}
                />
              </label>
              <label className="auth-label">
                Turno
                <select
                  className="auth-input"
                  disabled={pending}
                  name="preferredShift"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, preferredShift: event.target.value }))
                  }
                  value={form.preferredShift}
                >
                  <option value="">Sin preferencia</option>
                  {VACANCY_SHIFTS.map((shift) => (
                    <option key={shift} value={shift}>
                      {shift}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-[var(--muted)]">
                  Matutino, Vespertino, Nocturno o Cualquiera
                </span>
              </label>
              <label className="auth-label">
                Horario
                <select
                  className="auth-input"
                  disabled={pending}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      scheduleSelected: event.target.value,
                      scheduleCustom:
                        event.target.value === VACANCY_FIELD_OTHER
                          ? prev.scheduleCustom
                          : "",
                    }))
                  }
                  value={form.scheduleSelected}
                >
                  <option value="">Selecciona un horario</option>
                  {VACANCY_SCHEDULES.map((schedule) => (
                    <option key={schedule} value={schedule}>
                      {schedule}
                    </option>
                  ))}
                  <option value={VACANCY_FIELD_OTHER}>{VACANCY_FIELD_OTHER}</option>
                </select>
                {fieldErrors.schedule ? (
                  <span className="auth-field-error">{fieldErrors.schedule}</span>
                ) : null}
              </label>
              {form.scheduleSelected === VACANCY_FIELD_OTHER ? (
                <label className="auth-label">
                  Horario personalizado
                  <input
                    className="auth-input"
                    disabled={pending}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, scheduleCustom: event.target.value }))
                    }
                    placeholder="Ej. Lunes a viernes 8:00 a 16:00"
                    required
                    value={form.scheduleCustom}
                  />
                </label>
              ) : (
                <div className="hidden sm:block" />
              )}
              <label className="auth-label">
                Experiencia requerida
                <select
                  className="auth-input"
                  disabled={pending}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      experienceSelected: event.target.value,
                      experienceCustom:
                        event.target.value === VACANCY_FIELD_OTHER
                          ? prev.experienceCustom
                          : "",
                    }))
                  }
                  value={form.experienceSelected}
                >
                  <option value="">Sin especificar</option>
                  {VACANCY_EXPERIENCE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                  <option value={VACANCY_FIELD_OTHER}>{VACANCY_FIELD_OTHER}</option>
                </select>
                {fieldErrors.experienceRequired ? (
                  <span className="auth-field-error">{fieldErrors.experienceRequired}</span>
                ) : null}
              </label>
              {form.experienceSelected === VACANCY_FIELD_OTHER ? (
                <label className="auth-label">
                  Experiencia personalizada
                  <input
                    className="auth-input"
                    disabled={pending}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        experienceCustom: event.target.value,
                      }))
                    }
                    placeholder="Ej. 2 años en retail"
                    required
                    value={form.experienceCustom}
                  />
                </label>
              ) : (
                <div className="hidden sm:block" />
              )}
              <label className="auth-label">
                Salario mínimo (MXN)
                <input
                  className="auth-input"
                  disabled={pending}
                  inputMode="numeric"
                  name="salaryMin"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, salaryMin: event.target.value }))
                  }
                  placeholder="10000"
                  value={form.salaryMin}
                />
              </label>
              <label className="auth-label">
                Salario máximo (MXN)
                <input
                  className="auth-input"
                  disabled={pending}
                  inputMode="numeric"
                  name="salaryMax"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, salaryMax: event.target.value }))
                  }
                  placeholder="15000"
                  value={form.salaryMax}
                />
                {fieldErrors.salaryMax ? (
                  <span className="auth-field-error">{fieldErrors.salaryMax}</span>
                ) : null}
              </label>
            </div>
          </section>

          <section className="space-y-4 border-t border-[var(--line)] pt-5">
            <div>
              <h3 className="font-display text-lg font-bold">Detalle para el candidato</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Texto claro y corto; el bot lo muestra en WhatsApp.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="auth-label sm:col-span-2">
                Beneficios
                <textarea
                  className="auth-input min-h-20"
                  disabled={pending}
                  name="benefits"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, benefits: event.target.value }))
                  }
                  placeholder="Ej. Vales de despensa, transporte, comedor"
                  value={form.benefits}
                />
              </label>
              <label className="auth-label sm:col-span-2">
                Requisitos
                <textarea
                  className="auth-input min-h-20"
                  disabled={pending}
                  name="requirements"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, requirements: event.target.value }))
                  }
                  placeholder="Ej. Disponibilidad inmediata, INE vigente"
                  value={form.requirements}
                />
              </label>
            </div>
          </section>

          <div className="space-y-4 border-t border-[var(--line)] pt-5">
            <input name="active" type="hidden" value={form.active ? "true" : "false"} />
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                checked={form.active}
                disabled={pending}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, active: event.target.checked }))
                }
                type="checkbox"
              />
              Vacante activa (visible para el chatbot)
            </label>
            <div className="flex flex-wrap gap-2">
              <button className="auth-primary-button" disabled={pending} type="submit">
                {pending ? <Loader2 className="auth-spinner" size={16} /> : null}
                {form.id ? "Guardar cambios" : "Publicar vacante"}
              </button>
              <button
                className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-4 text-sm font-semibold"
                disabled={pending}
                onClick={() => setFormOpen(false)}
                type="button"
              >
                Cancelar
              </button>
            </div>
            {error ? <p className="auth-error">{error}</p> : null}
          </div>
        </form>
      ) : null}

      {vacancies.length === 0 ? (
        <div className="executive-card rounded-[22px] border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-8 text-center">
          <p className="font-semibold">Aún no hay vacantes</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {canManage
              ? "Crea la primera vacante para empezar a recibir candidatos."
              : "Cuando el administrador publique vacantes aparecerán aquí."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {vacancies.map((vacancy) => (
            <article
              className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
              key={vacancy.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold">{vacancy.title}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {vacancy.location || "Sin ubicación"} ·{" "}
                    {formatSalaryRange(vacancy.salaryMin, vacancy.salaryMax)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {[vacancy.preferredShift, vacancy.schedule, vacancy.experienceRequired]
                      .filter(Boolean)
                      .join(" · ") || "Sin turno ni experiencia definidos"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    vacancy.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-[var(--surface-soft)] text-[var(--muted)]"
                  }`}
                >
                  {vacancy.active ? "Activa" : "Pausada"}
                </span>
              </div>
              {vacancy.description ? (
                <p className="mt-3 line-clamp-3 text-sm text-[var(--muted)]">
                  {vacancy.description}
                </p>
              ) : null}
              {canManage ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[var(--line)] px-3 text-xs font-semibold"
                    disabled={pending}
                    onClick={() => openEdit(vacancy)}
                    type="button"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                  <button
                    className="inline-flex min-h-10 items-center rounded-full border border-[var(--line)] px-3 text-xs font-semibold"
                    disabled={pending}
                    onClick={() => toggleActive(vacancy)}
                    type="button"
                  >
                    {vacancy.active ? "Pausar" : "Activar"}
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
      {error && !formOpen ? <p className="auth-error">{error}</p> : null}
    </div>
  );
};
