"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Gauge,
  LayoutDashboard,
  MessageCircle,
  Moon,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  Zap,
} from "lucide-react";
import { animate, stagger } from "animejs";

export type ExecutiveModule =
  | "radar"
  | "candidatos"
  | "conversaciones"
  | "vacantes"
  | "inteligencia";

export type CandidateRow = {
  id: string;
  telefono: string;
  nombre_completo: string | null;
  edad: number | null;
  ubicacion: string | null;
  ultimo_empleo: string | null;
  puesto_buscado: string | null;
  experiencia: string | null;
  disponibilidad: string | null;
  turno_preferido: string | null;
  expectativa_salarial: string | null;
  documentacion: string | null;
  curp: string | null;
  source: string | null;
  campaign: string | null;
  medium: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  profile_completed_at: string | null;
  last_seen_at: string | null;
  last_profile_update_at: string | null;
  activeStep: string;
  completeness: number;
  followUp: "Alta" | "Media" | "Baja";
  inboundMessages: number;
  outboundMessages: number;
  matchedVacancies: Array<{
    benefits: string;
    company: string;
    companyContactEmail: string | null;
    companyContactName: string | null;
    companyContactPhone: string | null;
    description: string;
    experienceRequired: string;
    location: string;
    matchedAt: string | null;
    preferredShift: string;
    requirements: string;
    salaryRange: string;
    schedule: string;
    status: string;
    title: string;
  }>;
  selectedVacancies: Array<{
    benefits: string;
    company: string;
    companyContactEmail: string | null;
    companyContactName: string | null;
    companyContactPhone: string | null;
    description: string;
    experienceRequired: string;
    location: string;
    preferredShift: string;
    requirements: string;
    salaryRange: string;
    schedule: string;
    selectedAt: string | null;
    status: string;
    title: string;
  }>;
  lastActivity: string | null;
};

export type DashboardStats = {
  activeLast7Days: number;
  averageCompletion: number;
  completedProfiles: number;
  completionRate: number;
  highPriority: number;
  inboundMessages: number;
  matchToInterestRate: number;
  openVacancies: number;
  outboundMessages: number;
  shownMatches: number;
  totalCandidates: number;
  totalSessions: number;
  withVacancyInterest: number;
};

type DashboardProps = {
  configured: boolean;
  dataErrors: string[];
  initialModule?: ExecutiveModule;
  isLocked: boolean;
  rows: CandidateRow[];
  stats: DashboardStats;
};

const modules: Array<{
  id: ExecutiveModule;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "radar", label: "Radar", icon: LayoutDashboard },
  { id: "candidatos", label: "Talento", icon: UsersRound },
  { id: "conversaciones", label: "Chat", icon: MessageCircle },
  { id: "vacantes", label: "Vacantes", icon: BriefcaseBusiness },
  { id: "inteligencia", label: "IA", icon: Sparkles },
];

const statusLabels: Record<string, string> = {
  registered: "Registrado",
  interested: "Interesado",
  contacted: "Contactado",
  shortlisted: "Preseleccionado",
  hired: "Contratado",
  rejected: "Descartado",
};

const stepLabels: Record<string, string> = {
  bienvenida: "Bienvenida",
  nombre: "Nombre",
  edad: "Edad",
  ubicacion: "Ubicación",
  experiencia: "Experiencia",
  disponibilidad: "Disponibilidad",
  vacantes: "Vacantes",
  completado: "Perfil completo",
  registrado: "Registrado",
  registro_exitoso: "Registro exitoso",
  menu_candidato_existente: "Candidato existente",
};

export default function ExecutiveDashboard({
  configured,
  dataErrors,
  initialModule = "radar",
  isLocked,
  rows,
  stats,
}: DashboardProps) {
  const [activeModule, setActiveModule] = useState<ExecutiveModule>(
    modules.some((module) => module.id === initialModule)
      ? initialModule
      : "radar",
  );
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") {
      return "light";
    }

    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  });

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return rows;
    }

    return rows.filter((row) =>
      [
        displayName(row),
        row.telefono,
        row.ubicacion,
        row.puesto_buscado,
        row.ultimo_empleo,
        row.experiencia,
        row.campaign,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [query, rows]);

  const priorityRows = useMemo(
    () =>
      [...rows]
        .filter((row) => row.followUp !== "Baja")
        .sort((a, b) => priorityScore(b) - priorityScore(a))
        .slice(0, 6),
    [rows],
  );

  useEffect(() => {
    const root = document.querySelector("[data-executive-dashboard]");

    if (!root) {
      return;
    }

    const cards = root.querySelectorAll(".executive-card");
    const panel = root.querySelectorAll(".module-panel");

    animate(panel, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 420,
      easing: "out(3)",
    });

    animate(cards, {
      opacity: [0, 1],
      translateY: [18, 0],
      delay: stagger(45),
      duration: 520,
      easing: "out(3)",
    });
  }, [activeModule, query]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("jalector-theme", nextTheme);
    setTheme(nextTheme);
  };

  return (
    <main
      className="min-h-screen bg-[var(--background)] pb-28 text-[var(--foreground)]"
      data-executive-dashboard
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-[var(--brand-navy)] text-[var(--background)] shadow-sm">
              <Sparkles size={19} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-green)]">
                Jalector
              </p>
              <h1 className="font-display text-2xl font-bold tracking-normal sm:text-3xl">
                Panel ejecutivo
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--muted)] shadow-sm backdrop-blur-xl">
              <Search size={16} className="shrink-0" />
              <input
                className="w-full min-w-0 bg-transparent text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] sm:w-52"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar candidato"
                value={query}
              />
            </label>
            <button
              aria-label="Cambiar tema"
              className="theme-toggle"
              onClick={toggleTheme}
              type="button"
            >
              <Sun className="theme-icon theme-icon-sun" size={18} />
              <Moon className="theme-icon theme-icon-moon" size={18} />
            </button>
            <div className="flex min-h-11 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700">
              <ShieldCheck size={16} />
              <span>{isLocked ? "Acceso requerido" : "Conectado"}</span>
            </div>
          </div>
        </header>

        {isLocked ? (
          <AccessNotice />
        ) : (
          <>
            {!configured ? <ConfigurationNotice /> : null}
            {dataErrors.length > 0 ? (
              <DataErrorNotice errors={dataErrors} />
            ) : null}

            <section className="grid gap-3 py-5 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                detail={`${stats.totalSessions} sesiones de chat`}
                icon={UsersRound}
                label="Candidatos"
                value={stats.totalCandidates}
              />
              <MetricCard
                detail={`${stats.completionRate}% de avance global`}
                icon={CheckCircle2}
                label="Perfiles completos"
                value={stats.completedProfiles}
              />
              <MetricCard
                detail="Requieren acción comercial"
                icon={CalendarClock}
                label="Seguimientos"
                value={stats.highPriority}
              />
              <MetricCard
                detail={`${stats.matchToInterestRate}% pasan a selección`}
                icon={BriefcaseBusiness}
                label="Matches mostrados"
                value={stats.shownMatches}
              />
            </section>

            <section className="module-panel flex-1">
              {activeModule === "radar" ? (
                <RadarModule
                  priorityRows={priorityRows}
                  rows={rows}
                  stats={stats}
                />
              ) : null}
              {activeModule === "candidatos" ? (
                <CandidatesModule rows={filteredRows} />
              ) : null}
              {activeModule === "conversaciones" ? (
                <ConversationsModule rows={filteredRows} />
              ) : null}
              {activeModule === "vacantes" ? (
                <VacanciesModule rows={rows} stats={stats} />
              ) : null}
              {activeModule === "inteligencia" ? (
                <IntelligenceModule rows={rows} stats={stats} />
              ) : null}
            </section>
          </>
        )}
      </div>

      <BottomNavbar activeModule={activeModule} onSelect={setActiveModule} />
    </main>
  );
}

function RadarModule({
  priorityRows,
  rows,
  stats,
}: {
  priorityRows: CandidateRow[];
  rows: CandidateRow[];
  stats: DashboardStats;
}) {
  const funnel = [
    { label: "Capturados", value: stats.totalCandidates },
    { label: "Matches mostrados", value: stats.shownMatches },
    { label: "Activos 7 días", value: stats.activeLast7Days },
    { label: "Perfil completo", value: stats.completedProfiles },
    { label: "Vacantes elegidas", value: stats.withVacancyInterest },
  ];
  const max = Math.max(...funnel.map((item) => item.value), 1);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-green)]">
              Radar operativo
            </p>
            <h2 className="mt-2 font-display text-xl font-bold">
              Embudo de candidatos
            </h2>
          </div>
          <StatusPill
            label={`${stats.averageCompletion}% completitud promedio`}
          />
        </div>
        <div className="mt-6 space-y-4">
          {funnel.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold">{item.label}</span>
                <span className="text-[var(--muted)]">{item.value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[var(--track)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                  style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">
              Siguiente mejor acción
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Prioriza contacto y recuperación.
            </p>
          </div>
          <Zap size={20} className="text-amber-500" />
        </div>
        <div className="mt-5 space-y-3">
          {priorityRows.length > 0 ? (
            priorityRows.map((row) => (
              <PriorityCandidate key={row.id} row={row} />
            ))
          ) : (
            <EmptyPanel
              text="Cuando haya candidatos incompletos o sin actividad reciente aparecerán aquí."
              title="Sin pendientes críticos"
            />
          )}
        </div>
      </div>

      <div className="executive-card grid gap-3 sm:grid-cols-3 xl:col-span-2">
        <InsightTile
          icon={Target}
          label="Conversión a interés"
          value={`${stats.matchToInterestRate}%`}
          text="Vacantes seleccionadas contra matches mostrados."
        />
        <InsightTile
          icon={MessageCircle}
          label="Balance de mensajes"
          value={`${stats.inboundMessages}/${stats.outboundMessages}`}
          text="Entrantes contra respuestas enviadas."
        />
        <InsightTile
          icon={Gauge}
          label="Capacidad activa"
          value={rows.filter((row) => row.followUp === "Baja").length}
          text="Perfiles con riesgo bajo de seguimiento."
        />
      </div>
    </div>
  );
}

function CandidatesModule({ rows }: { rows: CandidateRow[] }) {
  return (
    <div className="executive-card overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">
            Candidatos del chat
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Información operativa para seguimiento, contacto y asignación.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted)]">
          <span className="rounded-full bg-[var(--surface-soft)] px-3 py-2">
            Todos
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700">
            Pendientes
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">
            Completos
          </span>
        </div>
      </div>
      <CandidateTable rows={rows} />
    </div>
  );
}

function ConversationsModule({ rows }: { rows: CandidateRow[] }) {
  const sortedRows = [...rows].sort(
    (a, b) =>
      new Date(b.lastActivity || 0).getTime() -
      new Date(a.lastActivity || 0).getTime(),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {sortedRows.length > 0 ? (
        sortedRows.slice(0, 12).map((row) => (
          <div
            className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl"
            key={row.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{displayName(row)}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {row.telefono}
                </p>
              </div>
              <StatusPill
                label={stepLabels[row.activeStep] || row.activeStep}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Recibidos" value={row.inboundMessages} />
              <MiniStat label="Enviados" value={row.outboundMessages} />
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Última actividad: {formatDate(row.lastActivity)}
            </p>
            <a
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-green)]"
              href={`https://wa.me/${row.telefono.replace(/\D/g, "")}`}
              rel="noreferrer"
              target="_blank"
            >
              Abrir WhatsApp <ArrowUpRight size={15} />
            </a>
          </div>
        ))
      ) : (
        <EmptyPanel
          text="Los mensajes entrantes y salientes aparecerán aquí agrupados por candidato."
          title="Sin conversaciones"
        />
      )}
    </div>
  );
}

function VacanciesModule({
  rows,
  stats,
}: {
  rows: CandidateRow[];
  stats: DashboardStats;
}) {
  const vacancySummary = summarizeVacancies(rows);

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-green)]">
          Matching
        </p>
        <h2 className="mt-2 font-display text-xl font-bold">
          Gestión de vacantes
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <MiniStat label="Activas" value={stats.openVacancies} />
          <MiniStat label="Mostradas" value={stats.shownMatches} />
          <MiniStat label="Elegidas" value={stats.withVacancyInterest} />
          <MiniStat label="Conversión" value={`${stats.matchToInterestRate}%`} />
        </div>
        <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
          Usa este módulo para comparar vacantes mostradas contra vacantes
          seleccionadas, con salario, horario, requisitos y contacto de empresa.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {vacancySummary.length > 0 ? (
          vacancySummary.map((vacancy) => (
            <div
              className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl"
              key={vacancy.title}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{vacancy.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {vacancy.company}
                  </p>
                </div>
                <StatusPill label={`${vacancy.selectedCount} elegidas`} />
              </div>
              <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                <InfoLine icon={BriefcaseBusiness} text={vacancy.location} />
                <InfoLine icon={Clock3} text={vacancy.schedule} />
                <InfoLine icon={FileText} text={vacancy.salaryRange} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniStat label="Mostrada" value={vacancy.shownCount} />
                <MiniStat label="Turno" value={vacancy.preferredShift} />
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                {vacancy.requirements}
              </p>
              {vacancy.companyContactPhone || vacancy.companyContactEmail ? (
                <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
                  Contacto:{" "}
                  {vacancy.companyContactName || "Sin nombre"} ·{" "}
                  {vacancy.companyContactPhone || vacancy.companyContactEmail}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {vacancy.candidates.slice(0, 4).map((candidate) => (
                  <span
                    className="rounded-full bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold"
                    key={candidate}
                  >
                    {candidate}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <EmptyPanel
            text="Cuando el bot muestre o el candidato seleccione vacantes, se agruparán aquí para gestión ejecutiva."
            title="Sin vacantes mostradas"
          />
        )}
      </div>
    </div>
  );
}

function IntelligenceModule({
  rows,
  stats,
}: {
  rows: CandidateRow[];
  stats: DashboardStats;
}) {
  const topCampaigns = summarizeBy(rows, "campaign").slice(0, 5);
  const incomplete = rows.filter((row) => row.completeness < 90).length;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <InsightTile
        icon={Sparkles}
        label="Recomendación IA"
        value={stats.highPriority}
        text="Contactar candidatos en prioridad alta antes de abrir nuevos flujos."
      />
      <InsightTile
        icon={FileText}
        label="Datos incompletos"
        value={incomplete}
        text="Pide disponibilidad, turno y expectativa salarial cuando falten."
      />
      <InsightTile
        icon={MessageCircle}
        label="Conversión match"
        value={`${stats.matchToInterestRate}%`}
        text="Vacantes elegidas contra todas las vacantes mostradas."
      />

      <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl xl:col-span-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">
              Campañas con tracción
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Origen declarado por candidatos.
            </p>
          </div>
          <BarChart3 className="text-[var(--brand-green)]" size={20} />
        </div>
        <div className="mt-5 space-y-3">
          {topCampaigns.length > 0 ? (
            topCampaigns.map((campaign) => (
              <div key={campaign.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold">{campaign.label}</span>
                  <span className="text-[var(--muted)]">{campaign.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--track)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                    style={{
                      width: `${Math.max(8, percentage(campaign.value, rows.length))}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <EmptyPanel
              text="Agrega `campaign`, `source` o `medium` en los candidatos para analizar adquisición."
              title="Sin campañas registradas"
            />
          )}
        </div>
      </div>

      <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--brand-navy)] p-5 text-[var(--background)] shadow-[var(--shadow)]">
        <TrendingUp size={22} className="text-emerald-300" />
        <h2 className="mt-4 font-display text-lg font-bold">
          Lectura ejecutiva
        </h2>
        <p className="mt-3 text-sm leading-6 opacity-80">
          El pipeline tiene {stats.totalCandidates} candidatos,{" "}
          {stats.completedProfiles} perfiles listos, {stats.shownMatches}{" "}
          vacantes mostradas y {stats.withVacancyInterest} señales de interés.
        </p>
      </div>
    </div>
  );
}

function CandidateTable({ rows }: { rows: CandidateRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="p-6">
        <EmptyPanel
          text="Cuando el chat registre candidatos, aparecerán en esta tabla con su avance y datos de contacto."
          title="No hay candidatos para mostrar"
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="border-b border-[var(--line)] bg-[var(--surface-soft)] text-left text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            <th className="px-5 py-4">Candidato</th>
            <th className="px-5 py-4">Perfil</th>
            <th className="px-5 py-4">Preferencias</th>
            <th className="px-5 py-4">Chat</th>
            <th className="px-5 py-4">Vacantes</th>
            <th className="px-5 py-4">Prioridad</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {rows.map((row) => (
            <tr
              className="align-top transition hover:bg-[var(--surface-soft)]"
              key={row.id}
            >
              <td className="px-5 py-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--track)] text-sm font-bold">
                    {initials(row)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{displayName(row)}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Phone size={13} />
                        {row.telefono}
                      </span>
                      {row.ubicacion ? <span>{row.ubicacion}</span> : null}
                    </div>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Alta: {formatDate(row.created_at)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {row.source || "sin source"} · {row.campaign || "sin campaña"} ·{" "}
                      {row.medium || "sin medium"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-5">
                <p className="font-semibold">
                  {row.puesto_buscado ||
                    row.ultimo_empleo ||
                    "Sin puesto definido"}
                </p>
                <p className="mt-1 line-clamp-2 max-w-[220px] text-sm leading-6 text-[var(--muted)]">
                  {row.experiencia || "Experiencia pendiente de capturar"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted)]">
                  {row.edad ? (
                    <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5">
                      {row.edad} años
                    </span>
                  ) : null}
                  {row.curp ? (
                    <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5">
                      CURP {row.curp}
                    </span>
                  ) : null}
                  {row.documentacion ? (
                    <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5">
                      Docs: {row.documentacion}
                    </span>
                  ) : null}
                </div>
                <ProgressBar value={row.completeness} />
              </td>
              <td className="px-5 py-5 text-sm leading-6 text-[var(--muted)]">
                <InfoLine
                  icon={Clock3}
                  text={row.disponibilidad || "Disponibilidad pendiente"}
                />
                <InfoLine
                  icon={CalendarClock}
                  text={row.turno_preferido || "Turno pendiente"}
                />
                <InfoLine
                  icon={FileText}
                  text={row.expectativa_salarial || "Salario pendiente"}
                />
              </td>
              <td className="px-5 py-5">
                <StatusPill
                  label={stepLabels[row.activeStep] || row.activeStep}
                />
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {row.inboundMessages} recibidos / {row.outboundMessages}{" "}
                  enviados
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Última actividad: {formatDate(row.lastActivity)}
                </p>
              </td>
              <td className="px-5 py-5">
                {row.selectedVacancies.length > 0 ? (
                  <div className="space-y-2">
                    {row.selectedVacancies.slice(0, 2).map((vacancy) => (
                      <div
                        className="rounded-2xl bg-[var(--surface-soft)] px-3 py-2"
                        key={`${row.id}-${vacancy.title}`}
                      >
                        <p className="text-sm font-bold">{vacancy.title}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {vacancy.company} · {vacancy.salaryRange}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-[var(--muted)]">
                    {row.matchedVacancies.length} mostradas
                  </span>
                )}
              </td>
              <td className="px-5 py-5">
                <PriorityPill priority={row.followUp} />
                <p className="mt-3 text-xs text-[var(--muted)]">
                  {statusLabels[row.status || ""] ||
                    row.status ||
                    "Sin estatus"}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BottomNavbar({
  activeModule,
  onSelect,
}: {
  activeModule: ExecutiveModule;
  onSelect: (module: ExecutiveModule) => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-4 z-50 px-3"
      aria-label="Módulos ejecutivos"
    >
      <div className="mx-auto grid max-w-[680px] grid-cols-5 gap-1 rounded-[24px] border border-[var(--line)] bg-[var(--nav-bg)] p-2 shadow-[var(--shadow-strong)] backdrop-blur-2xl">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;

          return (
            <button
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[18px] px-2 text-[11px] font-bold transition ${
                isActive
                  ? "bg-[var(--brand-navy)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
              }`}
              key={module.id}
              onClick={() => onSelect(module.id)}
              type="button"
            >
              <Icon size={18} />
              <span>{module.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function MetricCard({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
          <p className="mt-3 font-display text-3xl font-bold">{value}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{detail}</p>
        </div>
        <div className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function PriorityCandidate({ row }: { row: CandidateRow }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{displayName(row)}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{row.telefono}</p>
        </div>
        <PriorityPill priority={row.followUp} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
        <span className="rounded-full bg-[var(--surface)] px-3 py-2">
          {row.completeness}% completo
        </span>
        <span className="rounded-full bg-[var(--surface)] px-3 py-2">
          {stepLabels[row.activeStep] || row.activeStep}
        </span>
      </div>
      <a
        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-green)]"
        href={`https://wa.me/${row.telefono.replace(/\D/g, "")}`}
        rel="noreferrer"
        target="_blank"
      >
        Abrir WhatsApp <ArrowUpRight size={15} />
      </a>
    </div>
  );
}

function InsightTile({
  icon: Icon,
  label,
  text,
  value,
}: {
  icon: LucideIcon;
  label: string;
  text: string;
  value: number | string;
}) {
  return (
    <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
      <div className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
        <Icon size={18} />
      </div>
      <p className="mt-5 text-sm font-semibold text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function AccessNotice() {
  return (
    <section className="grid flex-1 place-items-center py-20">
      <div className="max-w-xl rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0" size={22} />
          <div>
            <h2 className="font-display text-xl font-bold">Panel protegido</h2>
            <p className="mt-2 text-sm leading-6">
              Agrega el token configurado en `EXECUTIVE_DASHBOARD_TOKEN` como
              parámetro `?token=...`.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConfigurationNotice() {
  return (
    <div className="mt-5 rounded-[22px] border border-sky-200 bg-sky-50 p-5 text-sky-900">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="font-bold">Conecta Supabase para ver datos reales</p>
          <p className="mt-1 text-sm leading-6">
            Define `NEXT_PUBLIC_SUPABASE_URL` y
            `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local`. Si tus
            tablas tienen RLS activo, habilita políticas de lectura para este
            panel o usa una key de servidor.
          </p>
        </div>
      </div>
    </div>
  );
}

function DataErrorNotice({ errors }: { errors: string[] }) {
  return (
    <div className="mt-5 rounded-[22px] border border-rose-200 bg-rose-50 p-5 text-rose-900">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="font-bold">Algunas consultas no respondieron</p>
          <p className="mt-1 text-sm leading-6">{errors.join(" ")}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-6 text-center">
      <UserRound className="mx-auto text-[var(--muted)]" size={24} />
      <p className="mt-3 font-bold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{text}</p>
    </div>
  );
}

function InfoLine({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <p className="flex items-center gap-2">
      <Icon className="shrink-0" size={14} />
      <span>{text}</span>
    </p>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
      {label}
    </span>
  );
}

function PriorityPill({ priority }: { priority: CandidateRow["followUp"] }) {
  const classes = {
    Alta: "bg-rose-50 text-rose-700",
    Media: "bg-amber-50 text-amber-700",
    Baja: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${classes[priority]}`}
    >
      {priority}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-3">
      <div className="h-2 overflow-hidden rounded-full bg-[var(--track)]">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
        {value}% completo
      </p>
    </div>
  );
}

function summarizeVacancies(rows: CandidateRow[]) {
  const summary = new Map<
    string,
    {
      candidates: string[];
      company: string;
      companyContactEmail: string | null;
      companyContactName: string | null;
      companyContactPhone: string | null;
      location: string;
      preferredShift: string;
      requirements: string;
      salaryRange: string;
      schedule: string;
      selectedCount: number;
      shownCount: number;
      title: string;
    }
  >();

  for (const row of rows) {
    for (const vacancy of row.matchedVacancies) {
      const current = summary.get(vacancy.title) || {
        candidates: [],
        company: vacancy.company,
        companyContactEmail: vacancy.companyContactEmail,
        companyContactName: vacancy.companyContactName,
        companyContactPhone: vacancy.companyContactPhone,
        location: vacancy.location,
        preferredShift: vacancy.preferredShift,
        requirements: vacancy.requirements,
        salaryRange: vacancy.salaryRange,
        schedule: vacancy.schedule,
        selectedCount: 0,
        shownCount: 0,
        title: vacancy.title,
      };

      current.shownCount += 1;
      summary.set(vacancy.title, current);
    }

    for (const vacancy of row.selectedVacancies) {
      const current = summary.get(vacancy.title) || {
        candidates: [],
        company: vacancy.company,
        companyContactEmail: vacancy.companyContactEmail,
        companyContactName: vacancy.companyContactName,
        companyContactPhone: vacancy.companyContactPhone,
        location: vacancy.location,
        preferredShift: vacancy.preferredShift,
        requirements: vacancy.requirements,
        salaryRange: vacancy.salaryRange,
        schedule: vacancy.schedule,
        selectedCount: 0,
        shownCount: 0,
        title: vacancy.title,
      };

      current.selectedCount += 1;
      current.candidates.push(displayName(row));
      summary.set(vacancy.title, current);
    }
  }

  return [...summary.values()]
    .sort((a, b) => b.selectedCount - a.selectedCount || b.shownCount - a.shownCount)
    .slice(0, 8);
}

function summarizeBy(
  rows: CandidateRow[],
  key: "campaign" | "source" | "medium",
) {
  const summary = new Map<string, number>();

  for (const row of rows) {
    const label = row[key]?.trim();

    if (!label) {
      continue;
    }

    summary.set(label, (summary.get(label) || 0) + 1);
  }

  return [...summary.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function priorityScore(row: CandidateRow) {
  const base =
    row.followUp === "Alta" ? 100 : row.followUp === "Media" ? 50 : 0;
  return base - row.completeness + row.inboundMessages;
}

function percentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function displayName(candidate: CandidateRow) {
  return (
    candidate.nombre_completo || `Candidato ${candidate.telefono.slice(-4)}`
  );
}

function initials(candidate: CandidateRow) {
  const name = displayName(candidate);
  const parts = name.split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) {
    return "Sin registro";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
