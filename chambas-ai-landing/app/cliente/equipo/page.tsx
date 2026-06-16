import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { requireClient } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { InviteMemberForm } from "@/components/auth/invite-member-form";

export const metadata: Metadata = {
  title: "Equipo de tu empresa",
  description: "Invita y gestiona a los miembros con acceso al panel.",
  robots: { index: false, follow: false },
};

const roleLabels: Record<string, string> = {
  owner: "Administrador",
  recruiter: "Reclutador",
  viewer: "Observador",
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
});

const EquipoPage = async () => {
  const { user, membership } = await requireClient();
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: members }, { data: invitations }] = await Promise.all([
    supabase
      .from("company_users")
      .select("id, user_id, role, accepted_at, created_at")
      .eq("company_id", membership.companyId)
      .order("created_at", { ascending: true }),
    supabase
      .from("company_invitations")
      .select("id, email, role, created_at, expires_at, accepted_at")
      .eq("company_id", membership.companyId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const memberIds = (members ?? []).map((row) => row.user_id);
  const { data: profiles } = memberIds.length
    ? await admin.from("user_profiles").select("id, email, full_name").in("id", memberIds)
    : { data: [] };
  const profileById = new Map(
    (profiles ?? []).map((row) => [row.id, { email: row.email, fullName: row.full_name }]),
  );

  const isOwner = membership.role === "owner";

  return (
    <main className="dashboard-main">
      <DashboardHeader
        user={{ email: user.email, fullName: user.fullName }}
        subtitle={membership.companyName}
        nav={
          <>
            <Link href="/cliente" className="dashboard-nav-link">
              Inicio
            </Link>
            <Link href="/cliente/equipo" className="dashboard-nav-link is-active">
              Equipo
            </Link>
          </>
        }
      />

      <section className="dashboard-section">
        <div className="dashboard-section-head">
          <div>
            <p className="dashboard-eyebrow">Equipo</p>
            <h1 className="dashboard-title">Miembros con acceso al panel</h1>
            <p className="dashboard-subtitle">
              Solo el administrador puede invitar a nuevos miembros. Las invitaciones se
              envían por correo y caducan en 7 días.
            </p>
          </div>
        </div>

        {isOwner ? (
          <div className="dashboard-block">
            <h2 className="dashboard-block-title">Invitar miembro</h2>
            <InviteMemberForm />
          </div>
        ) : null}

        <div className="dashboard-block">
          <h2 className="dashboard-block-title">Miembros actuales</h2>
          <ul className="team-list">
            {(members ?? []).map((member) => {
              const profile = profileById.get(member.user_id);
              return (
                <li key={member.id} className="team-item">
                  <div>
                    <p className="team-name">{profile?.fullName ?? profile?.email ?? "Sin nombre"}</p>
                    <p className="team-email">{profile?.email ?? "—"}</p>
                  </div>
                  <div className="team-meta">
                    <span className={`team-role team-role-${member.role}`}>
                      {roleLabels[member.role] ?? member.role}
                    </span>
                    <span className="team-since">
                      desde {member.created_at ? dateFormatter.format(new Date(member.created_at)) : "—"}
                    </span>
                  </div>
                </li>
              );
            })}
            {(!members || members.length === 0) ? (
              <li className="team-empty">
                <Users size={18} />
                <span>No hay miembros registrados todavía.</span>
              </li>
            ) : null}
          </ul>
        </div>

        {invitations && invitations.length > 0 ? (
          <div className="dashboard-block">
            <h2 className="dashboard-block-title">Invitaciones pendientes</h2>
            <ul className="team-list">
              {invitations.map((invitation) => (
                <li key={invitation.id} className="team-item">
                  <div>
                    <p className="team-name">{invitation.email}</p>
                    <p className="team-email">
                      Vence el {dateFormatter.format(new Date(invitation.expires_at))}
                    </p>
                  </div>
                  <span className={`team-role team-role-${invitation.role}`}>
                    {roleLabels[invitation.role] ?? invitation.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default EquipoPage;
