import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { requireExecutive } from "@/lib/auth/guards";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { SignupReviewControls } from "@/components/auth/signup-review-controls";

export const metadata: Metadata = {
  title: "Cola de solicitudes",
  description: "Aprobar o rechazar las solicitudes de nuevas empresas.",
  robots: { index: false, follow: false },
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const EmpresasPage = async () => {
  const executive = await requireExecutive();
  const admin = createAdminClient();
  const { data: signups } = await admin
    .from("company_signups")
    .select(
      "id, company_name, contact_name, contact_phone, industry, expected_volume, status, created_at, reviewed_at, rejection_reason, user_id",
    )
    .order("created_at", { ascending: false });

  const rows = signups ?? [];
  const pendingCount = rows.filter((row) => row.status === "pending").length;
  const userIds = rows.map((row) => row.user_id);
  const { data: profiles } = userIds.length
    ? await admin
        .from("user_profiles")
        .select("id, email")
        .in("id", userIds)
    : { data: [] };
  const emailByUser = new Map((profiles ?? []).map((row) => [row.id, row.email]));

  return (
    <main className="dashboard-main">
      <DashboardHeader
        user={{ email: executive.email, fullName: executive.fullName }}
        subtitle="Panel ejecutivo"
        nav={
          <>
            <a href="/ejecutivo" className="dashboard-nav-link">
              Inicio
            </a>
            <a href="/ejecutivo/empresas" className="dashboard-nav-link is-active">
              Empresas
            </a>
          </>
        }
      />

      <section className="dashboard-section">
        <div className="dashboard-section-head">
          <div>
            <p className="dashboard-eyebrow">Solicitudes</p>
            <h1 className="dashboard-title">Cola de aprobación de empresas</h1>
            <p className="dashboard-subtitle">
              Revisa las solicitudes que llegan desde el formulario público de registro.
              Aprobarlas crea la empresa y asigna al responsable como administrador.
            </p>
          </div>
          <span className="dashboard-pill">{pendingCount} pendientes</span>
        </div>

        {rows.length === 0 ? (
          <div className="dashboard-empty">
            <Inbox size={20} />
            <p>Aún no hay solicitudes registradas.</p>
          </div>
        ) : (
          <div className="signup-table">
            {rows.map((row) => (
              <article key={row.id} className="signup-card">
                <header className="signup-card-head">
                  <div>
                    <h2 className="signup-card-title">{row.company_name}</h2>
                    <p className="signup-card-subtitle">
                      {row.contact_name ?? "Responsable sin nombre"} · {emailByUser.get(row.user_id) ?? "correo no disponible"}
                    </p>
                  </div>
                  <span className={`signup-status signup-status-${row.status}`}>
                    {statusLabels[row.status] ?? row.status}
                  </span>
                </header>

                <dl className="signup-card-grid">
                  <div>
                    <dt>Teléfono</dt>
                    <dd>{row.contact_phone ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Industria</dt>
                    <dd>{row.industry ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Volumen esperado</dt>
                    <dd>{row.expected_volume ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Solicitada</dt>
                    <dd>{row.created_at ? dateFormatter.format(new Date(row.created_at)) : "—"}</dd>
                  </div>
                </dl>

                {row.status === "rejected" && row.rejection_reason ? (
                  <p className="signup-reject-note">Motivo: {row.rejection_reason}</p>
                ) : null}

                {row.status === "pending" ? <SignupReviewControls signupId={row.id} /> : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default EmpresasPage;
