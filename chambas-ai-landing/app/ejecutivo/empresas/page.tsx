import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { ActivateCompanyButton } from "@/components/auth/activate-company-button";

export const metadata: Metadata = {
  title: "Activación de cuentas · Uso interno",
  description: "Activa las cuentas de empresas registradas en Jalector. Panel de uso interno.",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const EmpresasPage = async () => {
  const adminUser = await requireAdmin();
  const admin = createAdminClient();

  const { data: companies } = await admin
    .from("companies")
    .select(
      "id, name, contact_name, contact_phone, contact_email, active, activated_at, activation_source, created_at",
    )
    .order("created_at", { ascending: false });

  const rows = companies ?? [];
  const inactive = rows.filter((row) => row.active !== true);
  const active = rows.filter((row) => row.active === true);

  const companyIds = rows.map((row) => row.id);
  const { data: memberships } = companyIds.length
    ? await admin
        .from("company_users")
        .select("company_id, user_id, role")
        .in("company_id", companyIds)
        .eq("role", "admin")
    : { data: [] };

  const ownerByCompany = new Map(
    (memberships ?? []).map((row) => [row.company_id, row.user_id]),
  );
  const ownerIds = [...new Set([...(memberships ?? []).map((row) => row.user_id)])];
  const { data: profiles } = ownerIds.length
    ? await admin.from("user_profiles").select("id, email, full_name").in("id", ownerIds)
    : { data: [] };
  const profileById = new Map((profiles ?? []).map((row) => [row.id, row]));

  return (
    <main className="dashboard-main">
      <DashboardHeader
        user={{ email: adminUser.email, fullName: adminUser.fullName }}
        subtitle="Uso interno Jalector"
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
            <p className="dashboard-eyebrow">Activación</p>
            <h1 className="dashboard-title">Cuentas pendientes de activación</h1>
            <p className="dashboard-subtitle">
              Las empresas se crean al registrarse. Activa la cuenta para habilitar el panel del cliente.
            </p>
          </div>
          <span className="dashboard-pill">{inactive.length} pendientes</span>
        </div>

        {inactive.length === 0 ? (
          <div className="dashboard-empty">
            <Inbox size={20} />
            <p>No hay cuentas pendientes de activación.</p>
          </div>
        ) : (
          <div className="signup-table">
            {inactive.map((row) => {
              const ownerId = ownerByCompany.get(row.id);
              const owner = ownerId ? profileById.get(ownerId) : null;
              return (
                <article key={row.id} className="signup-card">
                  <header className="signup-card-head">
                    <div>
                      <h2 className="signup-card-title">{row.name}</h2>
                      <p className="signup-card-subtitle">
                        {row.contact_name ?? owner?.full_name ?? "Sin responsable"} ·{" "}
                        {owner?.email ?? row.contact_email ?? "correo no disponible"}
                      </p>
                    </div>
                    <span className="signup-status signup-status-pending">Inactiva</span>
                  </header>

                  <dl className="signup-card-grid">
                    <div>
                      <dt>Teléfono</dt>
                      <dd>{row.contact_phone ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Registrada</dt>
                      <dd>
                        {row.created_at
                          ? dateFormatter.format(new Date(row.created_at))
                          : "—"}
                      </dd>
                    </div>
                  </dl>

                  <ActivateCompanyButton companyId={row.id} companyName={row.name} />
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-head">
          <div>
            <p className="dashboard-eyebrow">Historial</p>
            <h2 className="dashboard-title">Cuentas activas</h2>
          </div>
          <span className="dashboard-pill">{active.length} activas</span>
        </div>

        {active.length === 0 ? (
          <div className="dashboard-empty">
            <p>Aún no hay empresas activas.</p>
          </div>
        ) : (
          <div className="signup-table">
            {active.map((row) => {
              const ownerId = ownerByCompany.get(row.id);
              const owner = ownerId ? profileById.get(ownerId) : null;
              return (
                <article key={row.id} className="signup-card">
                  <header className="signup-card-head">
                    <div>
                      <h2 className="signup-card-title">{row.name}</h2>
                      <p className="signup-card-subtitle">
                        {owner?.email ?? row.contact_email ?? "sin correo"}
                      </p>
                    </div>
                    <span className="signup-status signup-status-approved">Activa</span>
                  </header>
                  <dl className="signup-card-grid">
                    <div>
                      <dt>Activada</dt>
                      <dd>
                        {row.activated_at
                          ? dateFormatter.format(new Date(row.activated_at))
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Origen</dt>
                      <dd>{row.activation_source ?? "—"}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default EmpresasPage;
