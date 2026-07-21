"use client";

import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  LayoutDashboard,
  Users,
  UsersRound,
} from "lucide-react";
import { AppDashboardShell } from "@/components/dashboard/app-dashboard-shell";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { MetricCard } from "@/components/dashboard/metric-card";
import { CandidatesModule } from "@/components/cliente/candidates-module";
import { TeamModule, type TeamInvitationView, type TeamMemberView } from "@/components/cliente/team-module";
import { VacanciesModule } from "@/components/cliente/vacancies-module";
import type { CompanyHiringPipelineRow } from "@/lib/candidates/application/list-company-hiring-pipeline";
import type { VacancyRecord } from "@/lib/vacancies/domain/vacancy";

export type ClientModule = "inicio" | "vacantes" | "candidatos" | "equipo";

export type ClientDashboardStats = {
  activeVacancies: number;
  candidateCount: number;
  interestCount: number;
  teamCount: number;
};

type ClientDashboardProps = {
  candidates: CompanyHiringPipelineRow[];
  canManageVacancies: boolean;
  companyName: string;
  initialModule?: ClientModule;
  invitations: TeamInvitationView[];
  members: TeamMemberView[];
  stats: ClientDashboardStats;
  user: {
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  vacancies: VacancyRecord[];
};

const modules = [
  { id: "inicio" as const, label: "Inicio", icon: LayoutDashboard },
  { id: "vacantes" as const, label: "Vacantes", icon: BriefcaseBusiness },
  { id: "candidatos" as const, label: "Candidatos", icon: UsersRound },
  { id: "equipo" as const, label: "Equipo", icon: Users },
];

export const ClientDashboard = ({
  candidates,
  canManageVacancies,
  companyName,
  initialModule = "inicio",
  invitations,
  members,
  stats,
  user,
  vacancies,
}: ClientDashboardProps) => {
  const [activeModule, setActiveModule] = useState<ClientModule>(
    modules.some((module) => module.id === initialModule) ? initialModule : "inicio",
  );

  const nextAction = useMemo(() => {
    if (stats.activeVacancies === 0) {
      return {
        title: "Publica tu primera vacante",
        detail: "Sin vacantes activas el chatbot no tiene ofertas que mostrar.",
        cta: "Ir a Vacantes",
        module: "vacantes" as const,
      };
    }
    if (stats.candidateCount === 0) {
      return {
        title: "Espera candidatos del chatbot",
        detail: "Cuando haya matches o interés en tus vacantes, los verás en Candidatos.",
        cta: "Ver Candidatos",
        module: "candidatos" as const,
      };
    }
    return {
      title: "Revisa tu embudo de talento",
      detail: `${stats.candidateCount} candidatos y ${stats.interestCount} con interés declarado.`,
      cta: "Abrir Candidatos",
      module: "candidatos" as const,
    };
  }, [stats]);

  const selectModule = (module: ClientModule) => {
    setActiveModule(module);
    const url = new URL(window.location.href);
    url.searchParams.set("modulo", module);
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <AppDashboardShell
      badgeLabel="Empresa activa"
      bottomNav={
        <BottomNav
          activeId={activeModule}
          items={modules}
          label="Módulos de empresa"
          onSelect={selectModule}
        />
      }
      companyName={companyName}
      metrics={
        <>
          <MetricCard
            detail={`${vacancies.length} publicadas en total`}
            icon={BriefcaseBusiness}
            label="Vacantes activas"
            value={stats.activeVacancies}
          />
          <MetricCard
            detail="Relacionados con tus vacantes"
            icon={UsersRound}
            label="Candidatos"
            value={stats.candidateCount}
          />
          <MetricCard
            detail="Seleccionaron alguna vacante"
            icon={CheckCircle2}
            label="Con interés"
            value={stats.interestCount}
          />
          <MetricCard
            detail={`${invitations.length} invitaciones pendientes`}
            icon={Users}
            label="Equipo"
            value={stats.teamCount}
          />
        </>
      }
      moduleKey={activeModule}
      title="Panel de tu empresa"
      user={user}
    >
      {activeModule === "inicio" ? (
        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-green)]">
              Inicio
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">
              Hola, {user.fullName ?? user.email}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
              Gestiona vacantes y revisa candidatos capturados para {companyName}.
            </p>
          </div>

          <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--panel-inverse)] p-6 text-[var(--panel-inverse-fg)] shadow-[var(--shadow)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--panel-inverse-accent)]">
              Siguiente mejor acción
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-[var(--panel-inverse-fg)]">
              {nextAction.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-[var(--panel-inverse-muted)]">
              {nextAction.detail}
            </p>
            <button
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--panel-inverse-fg)] px-5 text-sm font-semibold text-[var(--panel-inverse)]"
              onClick={() => selectModule(nextAction.module)}
              type="button"
            >
              {nextAction.cta}
            </button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
              <h3 className="font-semibold">Vacantes recientes</h3>
              <ul className="mt-4 space-y-3">
                {vacancies.slice(0, 5).map((vacancy) => (
                  <li
                    className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface-soft)] px-3 py-2"
                    key={vacancy.id}
                  >
                    <span className="font-medium">{vacancy.title}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        vacancy.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-[var(--surface)] text-[var(--muted)]"
                      }`}
                    >
                      {vacancy.active ? "Activa" : "Pausada"}
                    </span>
                  </li>
                ))}
                {vacancies.length === 0 ? (
                  <li className="text-sm text-[var(--muted)]">Todavía no hay vacantes.</li>
                ) : null}
              </ul>
            </div>
            <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
              <h3 className="font-semibold">Candidatos recientes</h3>
              <ul className="mt-4 space-y-3">
                {candidates.slice(0, 5).map((candidate) => (
                  <li
                    className="rounded-2xl bg-[var(--surface-soft)] px-3 py-2"
                    key={candidate.id}
                  >
                    <p className="font-medium">
                      {candidate.nombreCompleto?.trim() || "Sin nombre"}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {candidate.vacancyTitle} · {candidate.completeness}%
                    </p>
                  </li>
                ))}
                {candidates.length === 0 ? (
                  <li className="text-sm text-[var(--muted)]">Todavía no hay candidatos.</li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {activeModule === "vacantes" ? (
        <VacanciesModule canManage={canManageVacancies} vacancies={vacancies} />
      ) : null}

      {activeModule === "candidatos" ? (
        <CandidatesModule candidates={candidates} vacancies={vacancies} />
      ) : null}

      {activeModule === "equipo" ? (
        <TeamModule
          canInvite={canManageVacancies}
          invitations={invitations}
          members={members}
        />
      ) : null}
    </AppDashboardShell>
  );
};
