import type { Metadata } from "next";
import ExecutiveDashboard, {
  type CandidateRow,
  type DashboardStats,
  type ExecutiveModule,
} from "./executive-dashboard";
import { requireExecutive } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Panel ejecutivo de candidatos",
  description:
    "Panel ejecutivo para dar seguimiento a candidatos capturados desde el chat de WhatsApp.",
  robots: {
    index: false,
    follow: false,
  },
};

type Candidate = {
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
};

type CandidateSession = {
  id: string;
  telefono: string;
  current_step: string;
  data: Record<string, unknown> | null;
  last_interaction_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type WhatsAppMessage = {
  id: string;
  telefono: string;
  whatsapp_message_id: string | null;
  direction: "inbound" | "outbound" | string;
  message_type: string | null;
  payload: Record<string, unknown> | null;
  created_at: string | null;
};

type SelectedVacancy = {
  id: string;
  candidate_phone: string;
  vacancy_id: string | null;
  status: string | null;
  created_at: string | null;
};

type CandidateVacancyMatch = {
  id: string;
  candidate_phone: string;
  vacancy_id: string | null;
  match_status: string | null;
  created_at: string | null;
};

type Vacancy = {
  id: string;
  company_id: string | null;
  title: string;
  description: string | null;
  location: string | null;
  schedule: string | null;
  salary_min: number | null;
  salary_max: number | null;
  preferred_shift: string | null;
  experience_required: string | null;
  benefits: string | null;
  requirements: string | null;
  active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  companies?: {
    name: string | null;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    active: boolean | null;
  } | null;
};

type SupabaseState<T> = {
  data: T[];
  error?: string;
};

type DashboardData = {
  candidates: SupabaseState<Candidate>;
  sessions: SupabaseState<CandidateSession>;
  messages: SupabaseState<WhatsAppMessage>;
  matches: SupabaseState<CandidateVacancyMatch>;
  selectedVacancies: SupabaseState<SelectedVacancy>;
  vacancies: SupabaseState<Vacancy>;
  configured: boolean;
};

const profileFields: Array<keyof Candidate> = [
  "nombre_completo",
  "edad",
  "ubicacion",
  "ultimo_empleo",
  "puesto_buscado",
  "experiencia",
  "disponibilidad",
  "turno_preferido",
  "expectativa_salarial",
  "documentacion",
];

export default async function ExecutiveDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ modulo?: ExecutiveModule }>;
}) {
  await requireExecutive();
  const params = await searchParams;
  const data = await getDashboardData();
  const rows = buildRows(data);
  const stats = buildStats(rows, data.sessions.data, data.vacancies.data);
  const dataErrors = [
    data.candidates.error,
    data.sessions.error,
    data.messages.error,
    data.matches.error,
    data.selectedVacancies.error,
    data.vacancies.error,
  ].filter((error): error is string => Boolean(error));

  return (
    <ExecutiveDashboard
      configured={data.configured}
      dataErrors={dataErrors}
      initialModule={params?.modulo}
      isLocked={false}
      rows={rows}
      stats={stats}
    />
  );
}

async function getDashboardData(): Promise<DashboardData> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return emptyDashboardData(false);
  }

  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };

  const [candidates, sessions, messages, matches, selectedVacancies, vacancies] = await Promise.all([
    fetchSupabase<Candidate>(
      `${baseUrl}/rest/v1/candidates?select=id,telefono,nombre_completo,edad,ubicacion,ultimo_empleo,puesto_buscado,experiencia,disponibilidad,turno_preferido,expectativa_salarial,documentacion,curp,source,campaign,medium,status,created_at,updated_at,profile_completed_at,last_seen_at,last_profile_update_at&order=created_at.desc&limit=150`,
      headers,
    ),
    fetchSupabase<CandidateSession>(
      `${baseUrl}/rest/v1/candidate_sessions?select=id,telefono,current_step,data,last_interaction_at,created_at,updated_at&order=last_interaction_at.desc&limit=250`,
      headers,
    ),
    fetchSupabase<WhatsAppMessage>(
      `${baseUrl}/rest/v1/whatsapp_messages?select=id,telefono,whatsapp_message_id,direction,message_type,payload,created_at&order=created_at.desc&limit=900`,
      headers,
    ),
    fetchSupabase<CandidateVacancyMatch>(
      `${baseUrl}/rest/v1/candidate_vacancy_matches?select=id,candidate_phone,vacancy_id,match_status,created_at&order=created_at.desc&limit=500`,
      headers,
    ),
    fetchSupabase<SelectedVacancy>(
      `${baseUrl}/rest/v1/candidate_selected_vacancies?select=id,candidate_phone,vacancy_id,status,created_at&order=created_at.desc&limit=350`,
      headers,
    ),
    fetchSupabase<Vacancy>(
      `${baseUrl}/rest/v1/vacancies?select=id,company_id,title,description,location,schedule,salary_min,salary_max,preferred_shift,experience_required,benefits,requirements,active,created_at,updated_at,companies(name,contact_name,contact_phone,contact_email,active)&order=created_at.desc&limit=300`,
      headers,
    ),
  ]);

  return {
    candidates,
    sessions,
    messages,
    matches,
    selectedVacancies,
    vacancies,
    configured: true,
  };
}

async function fetchSupabase<T>(
  url: string,
  headers: Record<string, string>,
): Promise<SupabaseState<T>> {
  try {
    const response = await fetch(url, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        data: [],
        error: `Supabase respondió ${response.status} en ${new URL(url).pathname}.`,
      };
    }

    const data = (await response.json()) as T[];
    return { data };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : "Error desconocido consultando Supabase.",
    };
  }
}

function emptyDashboardData(configured: boolean): DashboardData {
  return {
    candidates: { data: [] },
    sessions: { data: [] },
    messages: { data: [] },
    matches: { data: [] },
    selectedVacancies: { data: [] },
    vacancies: { data: [] },
    configured,
  };
}

function buildRows(data: DashboardData): CandidateRow[] {
  const candidateByPhone = new Map(data.candidates.data.map((candidate) => [candidate.telefono, candidate]));
  const sessionByPhone = new Map(data.sessions.data.map((session) => [session.telefono, session]));
  const vacancyById = new Map(data.vacancies.data.map((vacancy) => [vacancy.id, vacancy]));
  const matchedByPhone = new Map<string, CandidateRow["matchedVacancies"]>();
  const selectedByPhone = new Map<string, CandidateRow["selectedVacancies"]>();
  const messageCountByPhone = new Map<
    string,
    { inbound: number; outbound: number; last: string | null }
  >();

  for (const match of data.matches.data) {
    const vacancy = match.vacancy_id ? vacancyById.get(match.vacancy_id) : undefined;
    const existing = matchedByPhone.get(match.candidate_phone) || [];

    existing.push({
      ...vacancyDetails(vacancy),
      matchedAt: match.created_at,
      status: match.match_status || "shown",
    });
    matchedByPhone.set(match.candidate_phone, existing);
  }

  for (const selected of data.selectedVacancies.data) {
    const vacancy = selected.vacancy_id ? vacancyById.get(selected.vacancy_id) : undefined;
    const existing = selectedByPhone.get(selected.candidate_phone) || [];

    existing.push({
      ...vacancyDetails(vacancy),
      selectedAt: selected.created_at,
      status: selected.status || "interested",
    });
    selectedByPhone.set(selected.candidate_phone, existing);
  }

  for (const message of data.messages.data) {
    const current = messageCountByPhone.get(message.telefono) || {
      inbound: 0,
      outbound: 0,
      last: null,
    };

    if (message.direction === "inbound") {
      current.inbound += 1;
    } else {
      current.outbound += 1;
    }

    current.last = latestDate(current.last, message.created_at);
    messageCountByPhone.set(message.telefono, current);
  }

  const phones = new Set<string>();

  for (const candidate of data.candidates.data) {
    phones.add(candidate.telefono);
  }

  for (const session of data.sessions.data) {
    phones.add(session.telefono);
  }

  for (const message of data.messages.data) {
    phones.add(message.telefono);
  }

  for (const selected of data.selectedVacancies.data) {
    phones.add(selected.candidate_phone);
  }

  for (const match of data.matches.data) {
    phones.add(match.candidate_phone);
  }

  return [...phones].map((telefono) => {
    const candidate = normalizeCandidate(candidateByPhone.get(telefono), sessionByPhone.get(telefono), telefono);
    const session = sessionByPhone.get(candidate.telefono);
    const messageCount = messageCountByPhone.get(candidate.telefono);
    const completeness = calculateCompleteness(candidate);
    const lastActivity = latestDate(
      latestDate(candidate.last_seen_at, session?.last_interaction_at || null),
      messageCount?.last || null,
    );

    return {
      ...candidate,
      activeStep:
        session?.current_step ||
        (candidate.profile_completed_at || completeness >= 90 ? "completado" : "registrado"),
      completeness,
      followUp: calculatePriority(candidate, session, completeness, lastActivity),
      inboundMessages: messageCount?.inbound || 0,
      outboundMessages: messageCount?.outbound || 0,
      matchedVacancies: matchedByPhone.get(candidate.telefono) || [],
      selectedVacancies: selectedByPhone.get(candidate.telefono) || [],
      lastActivity,
    };
  }).sort((a, b) => new Date(b.lastActivity || b.created_at || 0).getTime() - new Date(a.lastActivity || a.created_at || 0).getTime());
}

function normalizeCandidate(
  candidate: Candidate | undefined,
  session: CandidateSession | undefined,
  telefono: string,
): Candidate {
  const data = session?.data || {};

  return {
    id: candidate?.id || session?.id || `telefono-${telefono}`,
    telefono,
    nombre_completo: candidate?.nombre_completo || readString(data, "nombre_completo"),
    edad: candidate?.edad ?? readNumber(data, "edad"),
    ubicacion: candidate?.ubicacion || readString(data, "ubicacion"),
    ultimo_empleo: candidate?.ultimo_empleo || readString(data, "ultimo_empleo"),
    puesto_buscado: candidate?.puesto_buscado || readString(data, "puesto_buscado"),
    experiencia: candidate?.experiencia || readString(data, "experiencia"),
    disponibilidad: candidate?.disponibilidad || readString(data, "disponibilidad"),
    turno_preferido: candidate?.turno_preferido || readString(data, "turno_preferido"),
    expectativa_salarial:
      candidate?.expectativa_salarial || readString(data, "expectativa_salarial"),
    documentacion: candidate?.documentacion || readString(data, "documentacion"),
    curp: candidate?.curp || readString(data, "curp"),
    source: candidate?.source || readString(data, "source"),
    campaign: candidate?.campaign || readString(data, "campaign"),
    medium: candidate?.medium || readString(data, "medium"),
    status: candidate?.status || (session ? "registered" : null),
    created_at: earliestDate(candidate?.created_at || null, session?.created_at || null),
    updated_at: latestDate(candidate?.updated_at || null, session?.updated_at || null),
    profile_completed_at: candidate?.profile_completed_at || null,
    last_seen_at: latestDate(candidate?.last_seen_at || null, session?.last_interaction_at || null),
    last_profile_update_at: candidate?.last_profile_update_at || null,
  };
}

function buildStats(
  rows: CandidateRow[],
  sessions: CandidateSession[],
  vacancies: Vacancy[],
): DashboardStats {
  const inboundMessages = rows.reduce((total, row) => total + row.inboundMessages, 0);
  const outboundMessages = rows.reduce((total, row) => total + row.outboundMessages, 0);
  const completedProfiles = rows.filter((row) => row.profile_completed_at || row.completeness >= 90).length;
  const activeLast7Days = rows.filter((row) => isWithinDays(row.lastActivity, 7)).length;
  const withVacancyInterest = rows.filter((row) => row.selectedVacancies.length > 0).length;
  const shownMatches = rows.reduce((total, row) => total + row.matchedVacancies.length, 0);
  const averageCompletion = rows.length
    ? Math.round(rows.reduce((total, row) => total + row.completeness, 0) / rows.length)
    : 0;

  return {
    activeLast7Days,
    averageCompletion,
    completedProfiles,
    completionRate: rows.length ? Math.round((completedProfiles / rows.length) * 100) : 0,
    highPriority: rows.filter((row) => row.followUp === "Alta").length,
    inboundMessages,
    matchToInterestRate: shownMatches
      ? Math.round((rows.reduce((total, row) => total + row.selectedVacancies.length, 0) / shownMatches) * 100)
      : 0,
    openVacancies: vacancies.filter((vacancy) => vacancy.active !== false).length,
    outboundMessages,
    shownMatches,
    totalCandidates: rows.length,
    totalSessions: sessions.length,
    withVacancyInterest,
  };
}

function vacancyDetails(vacancy: Vacancy | undefined) {
  return {
    benefits: vacancy?.benefits || "Sin beneficios registrados",
    company: vacancy?.companies?.name || "Empresa sin nombre",
    companyContactEmail: vacancy?.companies?.contact_email || null,
    companyContactName: vacancy?.companies?.contact_name || null,
    companyContactPhone: vacancy?.companies?.contact_phone || null,
    description: vacancy?.description || "Sin descripción",
    experienceRequired: vacancy?.experience_required || "Sin experiencia requerida registrada",
    location: vacancy?.location || "Sin ubicación",
    preferredShift: vacancy?.preferred_shift || "Sin turno preferido",
    requirements: vacancy?.requirements || "Sin requisitos registrados",
    salaryRange: formatSalaryRange(vacancy?.salary_min ?? null, vacancy?.salary_max ?? null),
    schedule: vacancy?.schedule || "Sin horario",
    title: vacancy?.title || "Vacante sin título",
  };
}

function formatSalaryRange(min: number | null, max: number | null) {
  if (min === null && max === null) {
    return "Sueldo no publicado";
  }

  const formatter = new Intl.NumberFormat("es-MX", {
    currency: "MXN",
    maximumFractionDigits: 0,
    style: "currency",
  });

  if (min !== null && max !== null) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  return min !== null ? `Desde ${formatter.format(min)}` : `Hasta ${formatter.format(max || 0)}`;
}

function calculateCompleteness(candidate: Candidate) {
  const completeFields = profileFields.filter((field) => {
    const value = candidate[field];
    return value !== null && value !== undefined && String(value).trim() !== "";
  }).length;

  return Math.round((completeFields / profileFields.length) * 100);
}

function calculatePriority(
  candidate: Candidate,
  session: CandidateSession | undefined,
  completeness: number,
  lastActivity: string | null,
): CandidateRow["followUp"] {
  if (!candidate.profile_completed_at && completeness < 60) {
    return "Alta";
  }

  if (session && session.current_step !== "completado" && isOlderThanHours(lastActivity, 24)) {
    return "Alta";
  }

  if (completeness < 90 || isOlderThanHours(lastActivity, 48)) {
    return "Media";
  }

  return "Baja";
}

function readString(data: Record<string, unknown>, key: string) {
  const value = data[key];

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function readNumber(data: Record<string, unknown>, key: string) {
  const value = data[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function earliestDate(a: string | null, b: string | null) {
  if (!a) {
    return b;
  }

  if (!b) {
    return a;
  }

  return new Date(a).getTime() < new Date(b).getTime() ? a : b;
}

function latestDate(a: string | null, b: string | null) {
  if (!a) {
    return b;
  }

  if (!b) {
    return a;
  }

  return new Date(a).getTime() > new Date(b).getTime() ? a : b;
}

function isOlderThanHours(value: string | null, hours: number) {
  if (!value) {
    return true;
  }

  const elapsed = Date.now() - new Date(value).getTime();
  return elapsed > hours * 60 * 60 * 1000;
}

function isWithinDays(value: string | null, days: number) {
  if (!value) {
    return false;
  }

  const elapsed = Date.now() - new Date(value).getTime();
  return elapsed <= days * 24 * 60 * 60 * 1000;
}
