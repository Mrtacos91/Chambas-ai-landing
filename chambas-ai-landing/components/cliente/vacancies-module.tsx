"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import type { VacancyRecord } from "@/lib/vacancies/domain/vacancy";
import { formatSalaryRange } from "@/lib/vacancies/domain/vacancy";
import { toggleCompanyVacancy } from "@/lib/vacancies/actions";
import { VacancyForm } from "@/components/cliente/vacancy-form";

export const VacanciesModule = ({
  canManage,
  vacancies,
}: {
  canManage: boolean;
  vacancies: VacancyRecord[];
}) => {
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<VacancyRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
    setError(null);
  };

  const openEdit = (vacancy: VacancyRecord) => {
    setEditing(vacancy);
    setFormOpen(true);
    setError(null);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
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
          <h2 className="mt-1 font-display text-2xl font-bold">
            Publicaciones de tu empresa
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
            Usa las opciones del catálogo para que WhatsApp ofrezca esta vacante sin
            errores de acentos u ortografía. Solo el administrador puede crear o editar.
          </p>
        </div>
        {canManage && !formOpen ? (
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
        <VacancyForm
          initial={editing}
          onCancel={closeForm}
          onSaved={closeForm}
        />
      ) : null}

      {vacancies.length === 0 && !formOpen ? (
        <div className="executive-card rounded-[22px] border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-8 text-center">
          <p className="font-semibold">Aún no hay vacantes</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {canManage
              ? "Crea la primera vacante para empezar a recibir candidatos."
              : "Cuando el administrador publique vacantes aparecerán aquí."}
          </p>
          {canManage ? (
            <button
              className="auth-primary-button mx-auto mt-5 !w-auto min-h-11 px-5"
              onClick={openCreate}
              type="button"
            >
              <Plus size={16} />
              Crear primera vacante
            </button>
          ) : null}
        </div>
      ) : vacancies.length > 0 ? (
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
                    disabled={pending || formOpen}
                    onClick={() => openEdit(vacancy)}
                    type="button"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                  <button
                    className="inline-flex min-h-10 items-center rounded-full border border-[var(--line)] px-3 text-xs font-semibold"
                    disabled={pending || formOpen}
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
      ) : null}
      {error && !formOpen ? <p className="auth-error">{error}</p> : null}
    </div>
  );
};
