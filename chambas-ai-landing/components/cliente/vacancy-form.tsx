"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Loader2,
  MapPin,
  Wallet,
  X,
} from "lucide-react";
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
  CITY_OTHER,
  MEXICO_STATE_NAMES,
  REMOTE_LOCATION,
  composeVacancyLocation,
  getCitiesForState,
  parseVacancyLocation,
} from "@/lib/vacancies/domain/mexico-locations";
import { formatSalaryRange, type VacancyRecord } from "@/lib/vacancies/domain/vacancy";
import {
  createCompanyVacancy,
  updateCompanyVacancy,
} from "@/lib/vacancies/actions";

type VacancyFormState = {
  id?: string;
  titleSelected: string;
  titleCustom: string;
  description: string;
  locationState: string;
  locationCity: string;
  locationCityCustom: string;
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

type FormStep = "puesto" | "ubicacion" | "condiciones" | "detalle";

const STEPS: { id: FormStep; label: string; hint: string }[] = [
  { id: "puesto", label: "Puesto", hint: "Qué se publica" },
  { id: "ubicacion", label: "Ubicación", hint: "Dónde trabaja" },
  { id: "condiciones", label: "Condiciones", hint: "Turno y sueldo" },
  { id: "detalle", label: "Detalle", hint: "Beneficios y requisitos" },
];

const emptyForm = (): VacancyFormState => ({
  titleSelected: "",
  titleCustom: "",
  description: "",
  locationState: "",
  locationCity: "",
  locationCityCustom: "",
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
  const locationParts = parseVacancyLocation(vacancy.location);

  return {
    id: vacancy.id,
    titleSelected: titleParts.selected,
    titleCustom: titleParts.custom,
    description: vacancy.description ?? "",
    locationState: locationParts.state,
    locationCity: locationParts.city,
    locationCityCustom: locationParts.cityCustom,
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

const moneyPreview = (min: string, max: string) => {
  const minN = min.trim() ? Number(min) : null;
  const maxN = max.trim() ? Number(max) : null;
  const safeMin = minN != null && Number.isFinite(minN) ? Math.round(minN) : null;
  const safeMax = maxN != null && Number.isFinite(maxN) ? Math.round(maxN) : null;
  return formatSalaryRange(safeMin, safeMax);
};

const ChoiceChip = ({
  active,
  disabled,
  label,
  onSelect,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onSelect: () => void;
}) => (
  <button
    aria-pressed={active}
    className={`inline-flex min-h-10 items-center justify-center rounded-xl border px-3.5 text-sm font-semibold transition ${
      active
        ? "border-[var(--brand-green)] bg-[var(--surface-soft)] text-[var(--foreground)] ring-1 ring-[var(--brand-green)]"
        : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand-green)] hover:text-[var(--foreground)]"
    }`}
    disabled={disabled}
    onClick={onSelect}
    type="button"
  >
    {label}
  </button>
);

export const VacancyForm = ({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: VacancyRecord | null;
  onCancel: () => void;
  onSaved: () => void;
}) => {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<VacancyFormState>(() =>
    initial ? fromRecord(initial) : emptyForm(),
  );
  const [step, setStep] = useState<FormStep>("puesto");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const rootRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const stepIndex = STEPS.findIndex((item) => item.id === step);
  const isRemoteLocation = form.locationState === REMOTE_LOCATION;
  const cityOptions =
    form.locationState && !isRemoteLocation
      ? getCitiesForState(form.locationState)
      : [];

  const previewTitle =
    resolveJobTitle(form.titleSelected, form.titleCustom) || "Sin puesto aún";
  const previewLocation =
    composeVacancyLocation({
      state: form.locationState,
      city: form.locationCity,
      cityCustom: form.locationCityCustom,
    }) || "Ubicación pendiente";
  const previewSchedule = resolveCatalogOrCustom(
    form.scheduleSelected,
    form.scheduleCustom,
  );
  const previewExperience = resolveCatalogOrCustom(
    form.experienceSelected,
    form.experienceCustom,
  );

  const progress = useMemo(
    () => Math.round(((stepIndex + 1) / STEPS.length) * 100),
    [stepIndex],
  );

  const validateStep = (target: FormStep): boolean => {
    setError(null);
    setFieldErrors({});

    if (target === "puesto") {
      const resolvedTitle = resolveJobTitle(form.titleSelected, form.titleCustom);
      if (!resolvedTitle || resolvedTitle.length < 2) {
        setFieldErrors({
          title:
            form.titleSelected === JOB_TITLE_OTHER
              ? "Escribe el nombre del puesto"
              : "Selecciona un puesto",
        });
        return false;
      }
      return true;
    }

    if (target === "ubicacion") {
      if (form.locationState && form.locationState !== REMOTE_LOCATION) {
        if (!form.locationCity) {
          setFieldErrors({ location: "Selecciona una ciudad o municipio" });
          return false;
        }
        if (form.locationCity === CITY_OTHER && !form.locationCityCustom.trim()) {
          setFieldErrors({ location: "Escribe la ciudad o municipio" });
          return false;
        }
      }
      return true;
    }

    if (target === "condiciones") {
      if (form.scheduleSelected === VACANCY_FIELD_OTHER && !form.scheduleCustom.trim()) {
        setFieldErrors({ schedule: "Escribe el horario o elige una opción" });
        return false;
      }
      if (
        form.experienceSelected === VACANCY_FIELD_OTHER &&
        !form.experienceCustom.trim()
      ) {
        setFieldErrors({
          experienceRequired: "Escribe la experiencia o elige una opción",
        });
        return false;
      }
      const minN = form.salaryMin.trim() ? Number(form.salaryMin) : null;
      const maxN = form.salaryMax.trim() ? Number(form.salaryMax) : null;
      if (
        minN != null &&
        maxN != null &&
        Number.isFinite(minN) &&
        Number.isFinite(maxN) &&
        minN > maxN
      ) {
        setFieldErrors({
          salaryMax: "El salario mínimo no puede ser mayor al máximo",
        });
        return false;
      }
      return true;
    }

    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.id);
  };

  const goBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev.id);
  };

  const goToStep = (next: FormStep) => {
    const nextIndex = STEPS.findIndex((item) => item.id === next);
    if (nextIndex <= stepIndex) {
      setStep(next);
      return;
    }
    for (let i = 0; i < nextIndex; i += 1) {
      if (!validateStep(STEPS[i].id)) {
        setStep(STEPS[i].id);
        return;
      }
    }
    setStep(next);
  };

  const submit = () => {
    for (const item of STEPS) {
      if (!validateStep(item.id)) {
        setStep(item.id);
        return;
      }
    }

    const resolvedTitle = resolveJobTitle(form.titleSelected, form.titleCustom);
    const resolvedSchedule = resolveCatalogOrCustom(
      form.scheduleSelected,
      form.scheduleCustom,
    );
    const resolvedExperience = resolveCatalogOrCustom(
      form.experienceSelected,
      form.experienceCustom,
    );
    const resolvedLocation = composeVacancyLocation({
      state: form.locationState,
      city: form.locationCity,
      cityCustom: form.locationCityCustom,
    });

    const formData = new FormData();
    if (form.id) formData.set("id", form.id);
    formData.set("title", resolvedTitle ?? "");
    formData.set("description", form.description);
    formData.set("location", resolvedLocation ?? "");
    formData.set("schedule", resolvedSchedule ?? "");
    formData.set("preferredShift", form.preferredShift.trim());
    formData.set("experienceRequired", resolvedExperience ?? "");
    formData.set("salaryMin", form.salaryMin);
    formData.set("salaryMax", form.salaryMax);
    formData.set("benefits", form.benefits);
    formData.set("requirements", form.requirements);
    formData.set("active", form.active ? "true" : "false");

    startTransition(async () => {
      const result = form.id
        ? await updateCompanyVacancy(formData)
        : await createCompanyVacancy(formData);
      if (!result.ok) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          if (result.fieldErrors.title) setStep("puesto");
          else if (result.fieldErrors.location) setStep("ubicacion");
          else if (
            result.fieldErrors.schedule ||
            result.fieldErrors.experienceRequired ||
            result.fieldErrors.salaryMax ||
            result.fieldErrors.salaryMin
          ) {
            setStep("condiciones");
          } else {
            setStep("detalle");
          }
        }
        setError(result.error ?? "No pudimos guardar la vacante.");
        return;
      }
      onSaved();
    });
  };

  return (
    <form
      className="executive-card overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]"
      onSubmit={(event) => {
        event.preventDefault();
        if (step === "detalle") submit();
        else goNext();
      }}
      ref={rootRef}
    >
      <div className="border-b border-[var(--line)] bg-[var(--surface-soft)] px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-green)]">
              {form.id ? "Editar vacante" : "Nueva vacante"}
            </p>
            <h3 className="mt-1 font-display text-xl font-bold sm:text-2xl">
              {STEPS[stepIndex].label}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{STEPS[stepIndex].hint}</p>
          </div>
          <button
            aria-label="Cerrar formulario"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            disabled={pending}
            onClick={onCancel}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
            <span>
              Paso {stepIndex + 1} de {STEPS.length}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--track)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--brand-green)] to-[var(--brand-teal)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STEPS.map((item, index) => {
              const done = index < stepIndex;
              const current = item.id === step;
              return (
                <li key={item.id}>
                  <button
                    className={`flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition ${
                      current
                        ? "border-[var(--brand-green)] bg-[var(--surface)]"
                        : done
                          ? "border-[var(--line)] bg-[var(--surface)]"
                          : "border-transparent bg-transparent opacity-70"
                    }`}
                    disabled={pending}
                    onClick={() => goToStep(item.id)}
                    type="button"
                  >
                    <span
                      className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        current || done
                          ? "bg-[var(--brand-navy)] text-[var(--background)]"
                          : "bg-[var(--track)] text-[var(--muted)]"
                      }`}
                    >
                      {done ? <Check size={12} /> : index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold">
                        {item.label}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5 p-5 sm:p-6">
          {step === "puesto" ? (
            <div className="space-y-4">
              <label className="auth-label">
                Puesto
                <select
                  autoFocus
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
                ) : (
                  <span className="text-xs text-[var(--muted)]">
                    Usa el catálogo para que coincida con WhatsApp
                  </span>
                )}
              </label>

              {form.titleSelected === JOB_TITLE_OTHER ? (
                <label className="auth-label">
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

              <label className="auth-label">
                Descripción breve
                <textarea
                  className="auth-input min-h-28"
                  disabled={pending}
                  maxLength={2000}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Qué hará la persona en el día a día"
                  value={form.description}
                />
                <span className="text-xs text-[var(--muted)]">
                  {form.description.length}/2000 · Opcional, pero ayuda al match
                </span>
              </label>
            </div>
          ) : null}

          {step === "ubicacion" ? (
            <div className="space-y-4">
              <label className="auth-label">
                Entidad federativa
                <select
                  autoFocus
                  className="auth-input"
                  disabled={pending}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      locationState: event.target.value,
                      locationCity: "",
                      locationCityCustom: "",
                    }))
                  }
                  value={form.locationState}
                >
                  <option value="">Selecciona una entidad</option>
                  <option value={REMOTE_LOCATION}>{REMOTE_LOCATION}</option>
                  {MEXICO_STATE_NAMES.map((stateName) => (
                    <option key={stateName} value={stateName}>
                      {stateName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="auth-label">
                Ciudad / municipio
                <select
                  className="auth-input"
                  disabled={pending || !form.locationState || isRemoteLocation}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      locationCity: event.target.value,
                      locationCityCustom:
                        event.target.value === CITY_OTHER ? prev.locationCityCustom : "",
                    }))
                  }
                  value={form.locationCity}
                >
                  <option value="">
                    {isRemoteLocation
                      ? "No aplica para Remoto"
                      : "Selecciona una ciudad"}
                  </option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                  {form.locationState && !isRemoteLocation ? (
                    <option value={CITY_OTHER}>{CITY_OTHER}</option>
                  ) : null}
                </select>
              </label>

              {form.locationCity === CITY_OTHER ? (
                <label className="auth-label">
                  Nombre de la ciudad o municipio
                  <input
                    className="auth-input"
                    disabled={pending}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        locationCityCustom: event.target.value,
                      }))
                    }
                    placeholder="Ej. San Pedro Garza García"
                    required
                    value={form.locationCityCustom}
                  />
                </label>
              ) : null}

              {fieldErrors.location ? (
                <span className="auth-field-error">{fieldErrors.location}</span>
              ) : (
                <p className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--muted)]">
                  Se guarda como Ciudad, Estado para que el chatbot filtre por zona.
                </p>
              )}
            </div>
          ) : null}

          {step === "condiciones" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Turno preferido
                </p>
                <div className="flex flex-wrap gap-2">
                  <ChoiceChip
                    active={form.preferredShift === ""}
                    disabled={pending}
                    label="Sin preferencia"
                    onSelect={() =>
                      setForm((prev) => ({ ...prev, preferredShift: "" }))
                    }
                  />
                  {VACANCY_SHIFTS.map((shift) => (
                    <ChoiceChip
                      active={form.preferredShift === shift}
                      disabled={pending}
                      key={shift}
                      label={shift}
                      onSelect={() =>
                        setForm((prev) => ({ ...prev, preferredShift: shift }))
                      }
                    />
                  ))}
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Cualquiera = sin filtro de turno en WhatsApp
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Horario
                </p>
                <div className="flex flex-wrap gap-2">
                  {VACANCY_SCHEDULES.map((schedule) => (
                    <ChoiceChip
                      active={form.scheduleSelected === schedule}
                      disabled={pending}
                      key={schedule}
                      label={schedule}
                      onSelect={() =>
                        setForm((prev) => ({
                          ...prev,
                          scheduleSelected: schedule,
                          scheduleCustom: "",
                        }))
                      }
                    />
                  ))}
                  <ChoiceChip
                    active={form.scheduleSelected === VACANCY_FIELD_OTHER}
                    disabled={pending}
                    label={VACANCY_FIELD_OTHER}
                    onSelect={() =>
                      setForm((prev) => ({
                        ...prev,
                        scheduleSelected: VACANCY_FIELD_OTHER,
                      }))
                    }
                  />
                </div>
                {fieldErrors.schedule ? (
                  <span className="auth-field-error">{fieldErrors.schedule}</span>
                ) : null}
                {form.scheduleSelected === VACANCY_FIELD_OTHER ? (
                  <label className="auth-label">
                    Horario personalizado
                    <input
                      className="auth-input"
                      disabled={pending}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          scheduleCustom: event.target.value,
                        }))
                      }
                      placeholder="Ej. Lunes a viernes 8:00 a 16:00"
                      required
                      value={form.scheduleCustom}
                    />
                  </label>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Experiencia requerida
                </p>
                <div className="flex flex-wrap gap-2">
                  <ChoiceChip
                    active={form.experienceSelected === ""}
                    disabled={pending}
                    label="Sin especificar"
                    onSelect={() =>
                      setForm((prev) => ({
                        ...prev,
                        experienceSelected: "",
                        experienceCustom: "",
                      }))
                    }
                  />
                  {VACANCY_EXPERIENCE_LEVELS.map((level) => (
                    <ChoiceChip
                      active={form.experienceSelected === level}
                      disabled={pending}
                      key={level}
                      label={level}
                      onSelect={() =>
                        setForm((prev) => ({
                          ...prev,
                          experienceSelected: level,
                          experienceCustom: "",
                        }))
                      }
                    />
                  ))}
                  <ChoiceChip
                    active={form.experienceSelected === VACANCY_FIELD_OTHER}
                    disabled={pending}
                    label={VACANCY_FIELD_OTHER}
                    onSelect={() =>
                      setForm((prev) => ({
                        ...prev,
                        experienceSelected: VACANCY_FIELD_OTHER,
                      }))
                    }
                  />
                </div>
                {fieldErrors.experienceRequired ? (
                  <span className="auth-field-error">
                    {fieldErrors.experienceRequired}
                  </span>
                ) : (
                  <p className="text-xs text-[var(--muted)]">
                    Mismas opciones que responde el candidato en WhatsApp
                  </p>
                )}
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
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="auth-label">
                  Salario mínimo (MXN)
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
                      $
                    </span>
                    <input
                      className="auth-input pl-7"
                      disabled={pending}
                      inputMode="numeric"
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          salaryMin: event.target.value.replace(/[^\d]/g, ""),
                        }))
                      }
                      placeholder="10000"
                      value={form.salaryMin}
                    />
                  </div>
                </label>
                <label className="auth-label">
                  Salario máximo (MXN)
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
                      $
                    </span>
                    <input
                      className="auth-input pl-7"
                      disabled={pending}
                      inputMode="numeric"
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          salaryMax: event.target.value.replace(/[^\d]/g, ""),
                        }))
                      }
                      placeholder="15000"
                      value={form.salaryMax}
                    />
                  </div>
                  {fieldErrors.salaryMax ? (
                    <span className="auth-field-error">{fieldErrors.salaryMax}</span>
                  ) : null}
                </label>
              </div>
            </div>
          ) : null}

          {step === "detalle" ? (
            <div className="space-y-4">
              <label className="auth-label">
                Beneficios
                <textarea
                  autoFocus
                  className="auth-input min-h-24"
                  disabled={pending}
                  maxLength={2000}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, benefits: event.target.value }))
                  }
                  placeholder="Ej. Vales de despensa, transporte, comedor"
                  value={form.benefits}
                />
              </label>
              <label className="auth-label">
                Requisitos
                <textarea
                  className="auth-input min-h-24"
                  disabled={pending}
                  maxLength={2000}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, requirements: event.target.value }))
                  }
                  placeholder="Ej. Disponibilidad inmediata, INE vigente"
                  value={form.requirements}
                />
              </label>

              <button
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  form.active
                    ? "border-[var(--brand-green)] bg-[var(--surface)] ring-1 ring-[var(--brand-green)]"
                    : "border-[var(--line)] bg-[var(--surface-soft)]"
                }`}
                disabled={pending}
                onClick={() =>
                  setForm((prev) => ({ ...prev, active: !prev.active }))
                }
                type="button"
              >
                <span>
                  <span className="block text-sm font-semibold">
                    {form.active ? "Vacante activa" : "Vacante pausada"}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">
                    {form.active
                      ? "Visible para el chatbot de WhatsApp"
                      : "No se ofrecerá a candidatos hasta activarla"}
                  </span>
                </span>
                <span
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                    form.active ? "bg-[var(--brand-green)]" : "bg-[var(--track)]"
                  }`}
                >
                  <span
                    className={`inline-block size-5 rounded-full bg-white shadow transition ${
                      form.active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </span>
              </button>
            </div>
          ) : null}

          {error ? <p className="auth-error">{error}</p> : null}
        </div>

        <aside className="border-t border-[var(--line)] bg-[var(--surface-soft)] p-5 lg:border-l lg:border-t-0 lg:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            Vista previa
          </p>
          <div className="mt-3 space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="flex items-start gap-2">
              <Briefcase
                className="mt-0.5 shrink-0 text-[var(--brand-green)]"
                size={18}
              />
              <div className="min-w-0">
                <p className="font-display text-lg font-bold leading-tight">
                  {previewTitle}
                </p>
                {form.description ? (
                  <p className="mt-1 line-clamp-3 text-sm text-[var(--muted)]">
                    {form.description}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-[var(--muted)]">Sin descripción</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 shrink-0 text-[var(--muted)]" size={16} />
              <span>{previewLocation}</span>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <Wallet className="mt-0.5 shrink-0 text-[var(--muted)]" size={16} />
              <span>{moneyPreview(form.salaryMin, form.salaryMax)}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {form.preferredShift ? (
                <span className="rounded-lg bg-[var(--surface-soft)] px-2 py-1 text-xs font-medium">
                  {form.preferredShift}
                </span>
              ) : null}
              {previewSchedule ? (
                <span className="rounded-lg bg-[var(--surface-soft)] px-2 py-1 text-xs font-medium">
                  {previewSchedule}
                </span>
              ) : null}
              {previewExperience ? (
                <span className="rounded-lg bg-[var(--surface-soft)] px-2 py-1 text-xs font-medium">
                  {previewExperience}
                </span>
              ) : null}
              {!form.preferredShift && !previewSchedule && !previewExperience ? (
                <span className="text-xs text-[var(--muted)]">
                  Condiciones pendientes
                </span>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
            Así verán reclutadores y el bot la información clave de la vacante.
          </p>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--surface)] px-5 py-4 sm:px-6">
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line)] px-4 text-sm font-semibold disabled:opacity-50"
          disabled={pending || stepIndex === 0}
          onClick={goBack}
          type="button"
        >
          <ArrowLeft size={16} />
          Atrás
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] px-4 text-sm font-semibold"
            disabled={pending}
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          {step === "detalle" ? (
            <button
              className="auth-primary-button !w-auto min-h-11 px-5"
              disabled={pending}
              type="submit"
            >
              {pending ? <Loader2 className="auth-spinner" size={16} /> : null}
              {form.id ? "Guardar cambios" : "Publicar vacante"}
            </button>
          ) : (
            <button
              className="auth-primary-button !w-auto min-h-11 px-5"
              disabled={pending}
              type="submit"
            >
              Continuar
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </form>
  );
};
