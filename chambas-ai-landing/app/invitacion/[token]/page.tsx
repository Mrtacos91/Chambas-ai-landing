import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Building2, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { InvitationActions } from "@/components/auth/invitation-actions";
import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Aceptar invitación",
  description: "Únete al equipo de tu empresa en Jalector.",
  robots: { index: false, follow: false },
};

interface InvitationPageProps {
  params: Promise<{ token: string }>;
}

const computeInvitationStatus = (expiresAt: string, acceptedAt: string | null) => ({
  expired: new Date(expiresAt).getTime() < Date.now(),
  alreadyAccepted: Boolean(acceptedAt),
});

const InvitationPage = async ({ params }: InvitationPageProps) => {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("company_invitations")
    .select("id, email, role, expires_at, accepted_at, company_id")
    .eq("token", token)
    .maybeSingle();

  if (!invitation) {
    return (
      <AuthShell
        eyebrow="Invitación"
        title="Esta invitación no es válida"
        subtitle="El enlace ya fue usado o nunca existió. Pide una nueva al administrador de la empresa."
        footer={
          <p>
            ¿Tienes otra cuenta?{" "}
            <Link href="/login" className="auth-link">
              Inicia sesión
            </Link>
            .
          </p>
        }
      >
        <div className="auth-warning">
          <AlertTriangle size={18} />
          <span>El token de invitación no se encontró.</span>
        </div>
      </AuthShell>
    );
  }

  const status = computeInvitationStatus(invitation.expires_at, invitation.accepted_at);
  const expired = status.expired;
  const alreadyAccepted = status.alreadyAccepted;
  const { data: companyRow } = await admin
    .from("companies")
    .select("name")
    .eq("id", invitation.company_id)
    .maybeSingle();
  const companyName = companyRow?.name ?? "tu empresa";
  const roleLabels: Record<string, string> = {
    owner: "Administrador",
    recruiter: "Reclutador",
    viewer: "Observador",
  };

  if (alreadyAccepted || expired) {
    return (
      <AuthShell
        eyebrow="Invitación"
        title={alreadyAccepted ? "Esta invitación ya fue aceptada" : "Esta invitación venció"}
        subtitle={
          alreadyAccepted
            ? "Si necesitas acceso, contacta al administrador para que te envíe una nueva."
            : "Las invitaciones tienen una vigencia de 7 días. Pide una nueva al administrador."
        }
      >
        <div className="auth-warning">
          <AlertTriangle size={18} />
          <span>
            {alreadyAccepted ? "Ya fue usada por otra persona." : "El enlace expiró."}
          </span>
        </div>
      </AuthShell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/invitacion/${token}`)}`);
  }

  const sameEmail = user.email?.toLowerCase() === invitation.email.toLowerCase();

  return (
    <AuthShell
      eyebrow="Invitación"
      title={`Te invitaron a colaborar en ${companyName}`}
      subtitle={`Iniciarás sesión como ${roleLabels[invitation.role] ?? invitation.role} y verás los candidatos capturados por el chatbot.`}
      footer={
        <p>
          Acceso autenticado como <strong>{user.email}</strong>.
        </p>
      }
    >
      <div className="auth-summary">
        <div>
          <Building2 size={18} />
          <div>
            <p className="auth-summary-label">Empresa</p>
            <p className="auth-summary-text">{companyName}</p>
          </div>
        </div>
        <div>
          <ShieldCheck size={18} />
          <div>
            <p className="auth-summary-label">Rol</p>
            <p className="auth-summary-text">{roleLabels[invitation.role] ?? invitation.role}</p>
          </div>
        </div>
      </div>

      {!sameEmail ? (
        <div className="auth-warning">
          <AlertTriangle size={18} />
          <span>
            Esta invitación se envió a {invitation.email}. Cierra sesión e inicia con ese
            correo para aceptarla.
          </span>
        </div>
      ) : (
        <InvitationActions token={token} />
      )}
    </AuthShell>
  );
};

export default InvitationPage;
