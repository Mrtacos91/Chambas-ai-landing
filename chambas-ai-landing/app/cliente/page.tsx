import type { Metadata } from "next";
import { requireClient } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { listCompanyHiringPipeline } from "@/lib/candidates/application/list-company-hiring-pipeline";
import { listCompanyVacancies } from "@/lib/vacancies/application/manage-vacancies";
import {
  ClientDashboard,
  type ClientModule,
} from "@/app/cliente/client-dashboard";

export const metadata: Metadata = {
  title: "Panel de tu empresa",
  description: "Publica vacantes y revisa candidatos capturados por el chatbot.",
  robots: { index: false, follow: false },
};

const MODULES: ClientModule[] = ["inicio", "vacantes", "candidatos", "equipo"];

const ClientePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ modulo?: string }>;
}) => {
  const { user, membership } = await requireClient();
  const params = await searchParams;
  const initialModule = MODULES.includes(params.modulo as ClientModule)
    ? (params.modulo as ClientModule)
    : "inicio";

  const supabase = await createClient();
  const admin = createAdminClient();

  const [vacancies, pipeline, membersResult, invitationsResult] = await Promise.all([
    listCompanyVacancies(supabase, membership.companyId),
    listCompanyHiringPipeline(supabase, membership.companyId),
    supabase
      .from("company_users")
      .select("id, user_id, role, created_at")
      .eq("company_id", membership.companyId)
      .order("created_at", { ascending: true }),
    supabase
      .from("company_invitations")
      .select("id, email, role, expires_at")
      .eq("company_id", membership.companyId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const members = membersResult.data ?? [];
  const memberIds = members.map((row) => row.user_id);
  const { data: profiles } = memberIds.length
    ? await admin.from("user_profiles").select("id, email, full_name").in("id", memberIds)
    : { data: [] };

  const profileById = new Map(
    (profiles ?? []).map((row) => [row.id, { email: row.email, fullName: row.full_name }]),
  );

  const uniquePhones = new Set(pipeline.map((row) => row.telefono));
  const interestCount = pipeline.filter((row) => row.hasInterest).length;

  return (
    <ClientDashboard
      canManageVacancies={membership.role === "admin"}
      candidates={pipeline}
      companyName={membership.companyName}
      initialModule={initialModule}
      invitations={(invitationsResult.data ?? []).map((row) => ({
        id: row.id,
        email: row.email,
        role: row.role,
        expiresAt: row.expires_at,
      }))}
      members={members.map((member) => {
        const profile = profileById.get(member.user_id);
        return {
          id: member.id,
          role: member.role,
          createdAt: member.created_at,
          fullName: profile?.fullName ?? null,
          email: profile?.email ?? null,
        };
      })}
      stats={{
        activeVacancies: vacancies.filter((row) => row.active).length,
        candidateCount: uniquePhones.size,
        interestCount,
        teamCount: members.length,
      }}
      user={{
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      }}
      vacancies={vacancies}
    />
  );
};

export default ClientePage;
