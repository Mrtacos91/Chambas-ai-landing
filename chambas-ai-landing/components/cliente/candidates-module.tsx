"use client";

import {
  CalendarClock,
  ChevronDown,
  Loader2,
  MessageCircle,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  saveCompanyHiringMessageTemplates,
  sendInterviewInvite,
  updateCandidateNotes,
  updateCandidateStage,
} from "@/lib/candidates/actions";
import type { CompanyHiringPipelineRow } from "@/lib/candidates/application/list-company-hiring-pipeline";
import {
  HIRING_PIPELINE_ORDER,
  HIRING_STAGE_LABELS,
  QUICK_STAGE_ACTIONS,
  type HiringStage,
} from "@/lib/candidates/domain/hiring-stages";
import {
  DEFAULT_HIRING_MESSAGE_TEMPLATES,
  TEMPLATE_STAGES,
  TEMPLATE_VARIABLES,
  buildWhatsAppUrl,
  isTemplateStage,
  renderHiringMessageTemplate,
  type HiringMessageTemplateMap,
  type TemplateStage,
} from "@/lib/candidates/domain/hiring-message-templates";
import {
  CONFIRMATION_STATUS_LABELS,
  canSendInterviewInvite,
} from "@/lib/candidates/domain/confirmation-status";
import {
  formatInterviewAt,
  hasInterviewInviteReady,
  type VacancyRecord,
} from "@/lib/vacancies/domain/vacancy";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const stageBadgeClass = (stage: HiringStage): string => {
  switch (stage) {
    case "nuevo":
      return "bg-slate-100 text-slate-700";
    case "interesado":
      return "bg-sky-50 text-sky-800";
    case "contactado":
      return "bg-indigo-50 text-indigo-800";
    case "entrevista":
      return "bg-amber-50 text-amber-800";
    case "oferta":
      return "bg-violet-50 text-violet-800";
    case "contratado":
      return "bg-emerald-50 text-emerald-800";
    case "descartado":
      return "bg-rose-50 text-rose-800";
    default:
      return "bg-[var(--surface-soft)] text-[var(--muted)]";
  }
};

const isStaleActivity = (iso: string | null, hours: number): boolean => {
  if (!iso) return true;
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts > hours * 60 * 60 * 1000;
};

const confirmationBadgeClass = (status: CompanyHiringPipelineRow["confirmationStatus"]): string => {
  switch (status) {
    case "sent":
      return "bg-indigo-50 text-indigo-800";
    case "confirmed":
      return "bg-emerald-50 text-emerald-800";
    case "declined":
      return "bg-rose-50 text-rose-800";
    default:
      return "bg-[var(--surface-soft)] text-[var(--muted)]";
  }
};

const staleLabel = (iso: string | null): string | null => {
  if (isStaleActivity(iso, 72)) return "Sin respuesta 72h+";
  if (isStaleActivity(iso, 24)) return "Sin respuesta 24h+";
  return null;
};

const stageActionLabel = (stage: HiringStage): string =>
  QUICK_STAGE_ACTIONS.find((action) => action.stage === stage)?.label ??
  HIRING_STAGE_LABELS[stage];

export const CandidatesModule = ({
  canManageTemplates,
  candidates,
  companyName,
  messageTemplates,
  vacancies,
}: {
  canManageTemplates: boolean;
  candidates: CompanyHiringPipelineRow[];
  companyName: string;
  messageTemplates: HiringMessageTemplateMap;
  vacancies: VacancyRecord[];
}) => {
  const [query, setQuery] = useState("");
  const [vacancyFilter, setVacancyFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState<HiringStage | "all" | "followup">(
    "followup",
  );
  const [onlyInterest, setOnlyInterest] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rows, setRows] = useState(candidates);
  const [templates, setTemplates] = useState(messageTemplates);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRows(candidates);
  }, [candidates]);

  useEffect(() => {
    setTemplates(messageTemplates);
  }, [messageTemplates]);

  const stageCounts = useMemo(() => {
    const counts = Object.fromEntries(
      HIRING_PIPELINE_ORDER.map((stage) => [stage, 0]),
    ) as Record<HiringStage, number>;
    for (const row of rows) {
      counts[row.stage] += 1;
    }
    return counts;
  }, [rows]);

  const needsFollowUpCount = useMemo(
    () =>
      rows.filter(
        (row) =>
          (row.stage === "nuevo" || row.stage === "interesado") &&
          isStaleActivity(row.lastActivity, 24),
      ).length,
    [rows],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const sorted = rows
      .filter((row) => {
        if (vacancyFilter !== "all" && row.vacancyId !== vacancyFilter) return false;
        if (stageFilter === "followup") {
          if (row.stage !== "nuevo" && row.stage !== "interesado") return false;
        } else if (stageFilter !== "all" && row.stage !== stageFilter) {
          return false;
        }
        if (onlyInterest && !row.hasInterest) return false;
        if (!term) return true;
        return [
          row.nombreCompleto,
          row.telefono,
          row.ubicacion,
          row.puestoBuscado,
          row.experiencia,
          row.vacancyTitle,
          row.notes,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      })
      .slice();

    if (stageFilter === "followup") {
      sorted.sort((a, b) => {
        const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
        const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
        return aTime - bTime;
      });
    }

    return sorted;
  }, [rows, query, vacancyFilter, stageFilter, onlyInterest]);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? null,
    [rows, selectedId],
  );

  const closeDrawer = useCallback(() => {
    setSelectedId(null);
  }, []);

  const openWhatsAppWithTemplate = (
    row: CompanyHiringPipelineRow,
    stage: TemplateStage,
  ) => {
    const template = templates[stage]?.trim() || DEFAULT_HIRING_MESSAGE_TEMPLATES[stage];
    const message = renderHiringMessageTemplate(template, {
      nombre: row.nombreCompleto,
      vacante: row.vacancyTitle,
      empresa: companyName,
    });
    window.open(buildWhatsAppUrl(row.telefono, message), "_blank", "noopener,noreferrer");
  };

  const changeStage = (
    pipelineId: string,
    stage: HiringStage,
    options?: { openWhatsApp?: boolean },
  ) => {
    setError(null);
    const previous = rows;
    const target = rows.find((row) => row.id === pipelineId);
    setRows((current) =>
      current.map((row) =>
        row.id === pipelineId
          ? { ...row, stage, lastActivity: new Date().toISOString() }
          : row,
      ),
    );

    if (options?.openWhatsApp && target && isTemplateStage(stage)) {
      openWhatsAppWithTemplate(target, stage);
    }

    startTransition(async () => {
      const result = await updateCandidateStage({ pipelineId, stage });
      if (!result.ok) {
        setRows(previous);
        setError(result.error ?? "No se pudo actualizar la etapa.");
      }
    });
  };

  const saveNotes = (pipelineId: string, notes: string) => {
    setError(null);
    const previous = rows;
    setRows((current) =>
      current.map((row) => (row.id === pipelineId ? { ...row, notes } : row)),
    );
    startTransition(async () => {
      const result = await updateCandidateNotes({ pipelineId, notes });
      if (!result.ok) {
        setRows(previous);
        setError(result.error ?? "No se pudo guardar la nota.");
      }
    });
  };

  const sendInvite = (pipelineId: string) => {
    setError(null);
    const previous = rows;
    const now = new Date().toISOString();
    setRows((current) =>
      current.map((row) =>
        row.id === pipelineId
          ? {
              ...row,
              stage: "entrevista",
              confirmationStatus: "sent",
              confirmationSentAt: now,
              lastActivity: now,
            }
          : row,
      ),
    );
    startTransition(async () => {
      const result = await sendInterviewInvite({ pipelineId });
      if (!result.ok) {
        setRows(previous);
        setError(result.error ?? "No se pudo enviar la cita.");
      }
    });
  };

  const saveTemplates = (next: HiringMessageTemplateMap) => {
    setError(null);
    const previous = templates;
    setTemplates(next);
    startTransition(async () => {
      const result = await saveCompanyHiringMessageTemplates({ templates: next });
      if (!result.ok) {
        setTemplates(previous);
        setError(result.error ?? "No se pudieron guardar las plantillas.");
        return;
      }
      if (result.templates) setTemplates(result.templates);
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-green)]">
            Candidatos
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold">CRM de contratación</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
            Embudo por vacante: contacta, avanza etapas y contrata desde un solo lugar.
          </p>
        </div>
        <label className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--muted)] shadow-sm backdrop-blur-xl">
          <Search size={16} className="shrink-0" />
          <input
            className="w-full min-w-0 bg-transparent text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] sm:w-52"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar candidato"
            value={query}
          />
        </label>
      </div>

      <MessageTemplatesPanel
        canManage={canManageTemplates}
        pending={pending}
        templates={templates}
        onSave={saveTemplates}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${
            stageFilter === "followup"
              ? "border-[var(--brand-green)] bg-[var(--brand-green)] text-white"
              : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
          }`}
          onClick={() => setStageFilter("followup")}
          type="button"
        >
          Requieren seguimiento ({needsFollowUpCount})
        </button>
        <button
          className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${
            stageFilter === "all"
              ? "border-[var(--brand-green)] bg-[var(--brand-green)] text-white"
              : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
          }`}
          onClick={() => setStageFilter("all")}
          type="button"
        >
          Todos ({rows.length})
        </button>
        {HIRING_PIPELINE_ORDER.filter((stage) => stage !== "descartado").map((stage) => (
          <button
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${
              stageFilter === stage
                ? "border-[var(--brand-green)] bg-[var(--brand-green)] text-white"
                : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
            }`}
            key={stage}
            onClick={() => setStageFilter(stage)}
            type="button"
          >
            {HIRING_STAGE_LABELS[stage]} ({stageCounts[stage]})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)]">
          <span className="text-[var(--muted)]">Vacante</span>
          <select
            className="theme-select-inline max-w-[14rem]"
            onChange={(event) => setVacancyFilter(event.target.value)}
            value={vacancyFilter}
          >
            <option value="all">Todas</option>
            {vacancies.map((vacancy) => (
              <option key={vacancy.id} value={vacancy.id}>
                {vacancy.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm">
          <input
            checked={onlyInterest}
            className="accent-[var(--brand-green)]"
            onChange={(event) => setOnlyInterest(event.target.checked)}
            type="checkbox"
          />
          Solo con interés
        </label>
        {pending ? (
          <span className="text-xs text-[var(--muted)]">Guardando...</span>
        ) : null}
        {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      </div>

      {vacancies.length === 0 ? (
        <div className="executive-card rounded-[22px] border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-8 text-center">
          <p className="font-semibold">Publica una vacante primero</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            El CRM se llena cuando el chatbot muestra o selecciona tus vacantes.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="executive-card rounded-[22px] border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-8 text-center">
          <p className="font-semibold">Sin candidatos con estos filtros</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Cuando el chatbot muestre o seleccione tus vacantes, aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="executive-card overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-soft)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Candidato</th>
                  <th className="px-4 py-3 font-semibold">Vacante</th>
                  <th className="px-4 py-3 font-semibold">Interés</th>
                  <th className="px-4 py-3 font-semibold">Etapa</th>
                  <th className="px-4 py-3 font-semibold">Perfil</th>
                  <th className="px-4 py-3 font-semibold">Actividad</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    className="cursor-pointer border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface-soft)]"
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold">
                        {row.nombreCompleto?.trim() || "Sin nombre"}
                      </p>
                      <p className="mt-1 text-[var(--muted)]">{row.telefono}</p>
                      {row.ubicacion ? (
                        <p className="mt-1 text-xs text-[var(--muted)]">{row.ubicacion}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 align-top">{row.vacancyTitle}</td>
                    <td className="px-4 py-4 align-top">
                      {row.hasInterest ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Interesado
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          Solo mostrado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${stageBadgeClass(row.stage)}`}
                        >
                          {HIRING_STAGE_LABELS[row.stage]}
                        </span>
                        {(row.stage === "nuevo" || row.stage === "interesado") &&
                        staleLabel(row.lastActivity) ? (
                          <span className="w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                            {staleLabel(row.lastActivity)}
                          </span>
                        ) : null}
                        {row.confirmationStatus !== "none" ? (
                          <span
                            className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${confirmationBadgeClass(row.confirmationStatus)}`}
                          >
                            {row.reminderSentAt
                              ? "Recordatorio enviado"
                              : CONFIRMATION_STATUS_LABELS[row.confirmationStatus]}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p>{row.puestoBuscado || "Sin puesto"}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {row.completeness}% completo
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top text-[var(--muted)]">
                      {row.lastActivity
                        ? dateFormatter.format(new Date(row.lastActivity))
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected ? (
        <CandidateDrawer
          companyName={companyName}
          onClose={closeDrawer}
          onInvite={sendInvite}
          onSaveNotes={saveNotes}
          onStageChange={changeStage}
          pending={pending}
          row={selected}
          templates={templates}
        />
      ) : null}
    </div>
  );
};

const MessageTemplatesPanel = ({
  canManage,
  pending,
  templates,
  onSave,
}: {
  canManage: boolean;
  pending: boolean;
  templates: HiringMessageTemplateMap;
  onSave: (templates: HiringMessageTemplateMap) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [activeStage, setActiveStage] = useState<TemplateStage>("contactado");
  const [draft, setDraft] = useState(templates);

  useEffect(() => {
    setDraft(templates);
  }, [templates]);

  const dirty = TEMPLATE_STAGES.some((stage) => draft[stage] !== templates[stage]);

  const insertVariable = (key: string) => {
    const token = `{{${key}}}`;
    setDraft((prev) => ({
      ...prev,
      [activeStage]: `${prev[activeStage]}${prev[activeStage].endsWith(" ") || !prev[activeStage] ? "" : " "}${token}`,
    }));
  };

  return (
    <div className="executive-card overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <button
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-green)]">
            Plantillas WhatsApp
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Un clic en Contactar, Entrevista, Contratar o Descartar abre WhatsApp con el
            mensaje de esa etapa.
          </p>
        </div>
        <ChevronDown
          className={`shrink-0 text-[var(--muted)] transition ${open ? "rotate-180" : ""}`}
          size={18}
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-[var(--line)] px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_STAGES.map((stage) => (
              <button
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  activeStage === stage
                    ? "border-[var(--brand-green)] bg-[var(--surface-soft)] text-[var(--foreground)]"
                    : "border-[var(--line)] text-[var(--muted)]"
                }`}
                key={stage}
                onClick={() => setActiveStage(stage)}
                type="button"
              >
                {stageActionLabel(stage)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {TEMPLATE_VARIABLES.map((variable) => (
              <button
                className="rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                disabled={!canManage || pending}
                key={variable.key}
                onClick={() => insertVariable(variable.key)}
                type="button"
              >
                {`{{${variable.key}}}`} · {variable.label}
              </button>
            ))}
          </div>

          <label className="auth-label">
            Mensaje · {stageActionLabel(activeStage)}
            <textarea
              className="auth-input min-h-32"
              disabled={!canManage || pending}
              maxLength={1500}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  [activeStage]: event.target.value,
                }))
              }
              placeholder={DEFAULT_HIRING_MESSAGE_TEMPLATES[activeStage]}
              value={draft[activeStage]}
            />
            <span className="text-xs text-[var(--muted)]">
              {draft[activeStage].length}/1500
            </span>
          </label>

          {canManage ? (
            <div className="flex flex-wrap gap-2">
              <button
                className="auth-primary-button !w-auto min-h-11 px-5"
                disabled={pending || !dirty}
                onClick={() => onSave(draft)}
                type="button"
              >
                {pending ? <Loader2 className="auth-spinner" size={16} /> : null}
                Guardar plantillas
              </button>
              <button
                className="inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] px-4 text-sm font-semibold disabled:opacity-50"
                disabled={pending}
                onClick={() => setDraft({ ...DEFAULT_HIRING_MESSAGE_TEMPLATES })}
                type="button"
              >
                Restaurar sugeridas
              </button>
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)]">
              Solo el administrador puede editar las plantillas.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
};

const CandidateDrawer = ({
  row,
  pending,
  companyName,
  templates,
  onClose,
  onInvite,
  onStageChange,
  onSaveNotes,
}: {
  row: CompanyHiringPipelineRow;
  pending: boolean;
  companyName: string;
  templates: HiringMessageTemplateMap;
  onClose: () => void;
  onInvite: (pipelineId: string) => void;
  onStageChange: (
    pipelineId: string,
    stage: HiringStage,
    options?: { openWhatsApp?: boolean },
  ) => void;
  onSaveNotes: (pipelineId: string, notes: string) => void;
}) => {
  const [notes, setNotes] = useState(row.notes);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setNotes(row.notes);
  }, [row.id, row.notes]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  const previewFor = (stage: TemplateStage) => {
    const template = templates[stage]?.trim() || DEFAULT_HIRING_MESSAGE_TEMPLATES[stage];
    return renderHiringMessageTemplate(template, {
      nombre: row.nombreCompleto,
      vacante: row.vacancyTitle,
      empresa: companyName,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/35 p-0 sm:p-4">
      <button
        aria-label="Cerrar ficha"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-[var(--line)] bg-[var(--surface)] shadow-2xl sm:rounded-[22px] sm:border">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-green)]">
              Ficha CRM
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold">
              {row.nombreCompleto?.trim() || "Sin nombre"}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{row.vacancyTitle}</p>
          </div>
          <button
            className="rounded-full border border-[var(--line)] p-2 text-[var(--muted)]"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <a
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-green)] px-4 text-sm font-semibold text-white"
                href={buildWhatsAppUrl(row.telefono)}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <button
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--brand-green)] bg-[var(--surface)] px-4 text-sm font-semibold disabled:opacity-60"
                disabled={
                  pending ||
                  !hasInterviewInviteReady(row) ||
                  !canSendInterviewInvite(row.confirmationStatus)
                }
                onClick={() => onInvite(row.id)}
                type="button"
              >
                <CalendarClock size={14} />
                Confirmar cita
              </button>
              {QUICK_STAGE_ACTIONS.map((action) => (
                <button
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-sm font-semibold disabled:opacity-60"
                  disabled={pending || row.stage === action.stage}
                  key={action.stage}
                  onClick={() =>
                    onStageChange(row.id, action.stage, { openWhatsApp: true })
                  }
                  title={previewFor(action.stage)}
                  type="button"
                >
                  <MessageCircle size={14} />
                  {action.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)]">
              Confirmar cita envía WhatsApp por Jalector con fecha, sede y pruebas.
              Contactar, Entrevista, Contratar y Descartar siguen abriendo WhatsApp Web.
            </p>
            {!hasInterviewInviteReady(row) ? (
              <p className="text-xs text-amber-800">
                Completa fecha y sede de reclutamiento en la vacante para poder invitar.
              </p>
            ) : null}
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Etapa
            </span>
            <select
              className="theme-select min-h-11 w-full rounded-2xl px-4 text-sm"
              disabled={pending}
              onChange={(event) =>
                onStageChange(row.id, event.target.value as HiringStage)
              }
              value={row.stage}
            >
              {HIRING_PIPELINE_ORDER.map((stage) => (
                <option key={stage} value={stage}>
                  {HIRING_STAGE_LABELS[stage]}
                </option>
              ))}
            </select>
          </label>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <InfoItem label="Teléfono" value={row.telefono} />
            <InfoItem label="Edad" value={row.edad != null ? String(row.edad) : null} />
            <InfoItem label="Zona" value={row.ubicacion} />
            <InfoItem label="Puesto buscado" value={row.puestoBuscado} />
            <InfoItem label="Último empleo" value={row.ultimoEmpleo} />
            <InfoItem label="Experiencia" value={row.experiencia} />
            <InfoItem label="Disponibilidad" value={row.disponibilidad} />
            <InfoItem label="Turno" value={row.turnoPreferido} />
            <InfoItem label="Expectativa salarial" value={row.expectativaSalarial} />
            <InfoItem label="Documentación" value={row.documentacion} />
            <InfoItem
              label="Interés en vacante"
              value={row.hasInterest ? "Interesado" : "Solo mostrado"}
            />
            <InfoItem
              label="Seguimiento"
              value={
                (row.stage === "nuevo" || row.stage === "interesado") &&
                staleLabel(row.lastActivity)
                  ? staleLabel(row.lastActivity)
                  : "Al día"
              }
            />
            <InfoItem label="Perfil" value={`${row.completeness}% completo`} />
            <InfoItem
              label="Cita"
              value={
                row.reminderSentAt
                  ? "Recordatorio enviado"
                  : CONFIRMATION_STATUS_LABELS[row.confirmationStatus]
              }
            />
            <InfoItem
              label="Fecha de cita"
              value={formatInterviewAt(row.interviewAt) || null}
            />
            <InfoItem label="Sede" value={row.interviewAddress} />
            <InfoItem label="Pruebas" value={row.interviewDetails} />
            <InfoItem label="Inicio" value={row.workStartOn} />
          </dl>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Notas internas
            </span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm outline-none"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ej. Disponible mañana, pedir INE, buen perfil para turno matutino..."
              value={notes}
            />
            <button
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold disabled:opacity-60"
              disabled={pending || notes === row.notes}
              onClick={() => onSaveNotes(row.id, notes)}
              type="button"
            >
              Guardar nota
            </button>
          </label>
        </div>
      </aside>
    </div>,
    document.body,
  );
};

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <div className="rounded-2xl bg-[var(--surface-soft)] px-3 py-2">
    <dt className="text-xs text-[var(--muted)]">{label}</dt>
    <dd className="mt-1 font-medium">{value?.trim() || "—"}</dd>
  </div>
);
