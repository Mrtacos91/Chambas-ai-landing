import type { Metadata } from "next";
import Link from "next/link";
import { Building2, MessageCircle, Users } from "lucide-react";
import { requireClient } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/ui/dashboard-header";

export const metadata: Metadata = {
  title: "Panel de tu empresa",
  description: "Tablero principal con candidatos capturados por el chatbot.",
  robots: { index: false, follow: false },
};

const ClientePage = async () => {
  const { user, membership } = await requireClient();
  const supabase = await createClient();

  const { data: vacancies } = await supabase
    .from("vacancies")
    .select("id, title, active, created_at")
    .eq("company_id", membership.companyId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: vacancyCount } = await supabase
    .from("vacancies")
    .select("id", { count: "exact", head: true })
    .eq("company_id", membership.companyId);

  const { count: teamCount } = await supabase
    .from("company_users")
    .select("id", { count: "exact", head: true })
    .eq("company_id", membership.companyId);

  const { count: pendingInvites } = await supabase
    .from("company_invitations")
    .select("id", { count: "exact", head: true })
    .eq("company_id", membership.companyId)
    .is("accepted_at", null);

  return (
    <main className="dashboard-main">
      <DashboardHeader
        user={{ email: user.email, fullName: user.fullName }}
        subtitle={membership.companyName}
        nav={
          <>
            <Link href="/cliente" className="dashboard-nav-link is-active">
              Inicio
            </Link>
            <Link href="/cliente/equipo" className="dashboard-nav-link">
              Equipo
            </Link>
          </>
        }
      />

      <section className="dashboard-section">
        <div className="dashboard-section-head">
          <div>
            <p className="dashboard-eyebrow">Bienvenida</p>
            <h1 className="dashboard-title">Hola, {user.fullName ?? user.email}</h1>
            <p className="dashboard-subtitle">
              Este es el inicio del panel de {membership.companyName}. Desde aquí
              gestionarás candidatos capturados por el chatbot y configurarás tu
              equipo de talento.
            </p>
          </div>
          <span className="dashboard-pill">Rol: {membership.role}</span>
        </div>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <Building2 size={20} className="dashboard-card-icon" />
            <p className="dashboard-card-label">Vacantes activas</p>
            <p className="dashboard-card-value">{vacancyCount ?? 0}</p>
            <p className="dashboard-card-help">
              {(vacancies ?? []).length === 0
                ? "Aún no tienes vacantes. En la próxima entrega podrás crearlas desde el panel."
                : "Últimas vacantes registradas para tu empresa."}
            </p>
          </article>

          <article className="dashboard-card">
            <Users size={20} className="dashboard-card-icon" />
            <p className="dashboard-card-label">Miembros del equipo</p>
            <p className="dashboard-card-value">{teamCount ?? 0}</p>
            <p className="dashboard-card-help">
              {pendingInvites && pendingInvites > 0
                ? `${pendingInvites} invitaciones pendientes de aceptación.`
                : "Invita a más miembros desde la sección de equipo."}
            </p>
          </article>

          <article className="dashboard-card">
            <MessageCircle size={20} className="dashboard-card-icon" />
            <p className="dashboard-card-label">Captación por WhatsApp</p>
            <p className="dashboard-card-value">Activa</p>
            <p className="dashboard-card-help">
              El chatbot está listo. En la próxima fase conectaremos tu número de
              WhatsApp Business y publicaremos tus QR de captación.
            </p>
          </article>
        </div>

        {vacancies && vacancies.length > 0 ? (
          <div className="dashboard-list">
            <h2 className="dashboard-subtitle-strong">Vacantes recientes</h2>
            <ul>
              {vacancies.map((vacancy) => (
                <li key={vacancy.id}>
                  <span>{vacancy.title}</span>
                  <span className={`dashboard-tag ${vacancy.active ? "is-active" : ""}`}>
                    {vacancy.active ? "Activa" : "Pausada"}
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

export default ClientePage;
