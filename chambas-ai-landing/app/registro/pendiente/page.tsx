import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, Rocket } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireSession } from "@/lib/auth/guards";
import { getAccessContext, getCompanyActivationState } from "@/lib/auth/session";
import { provisionInactiveCompany } from "@/lib/auth/company-provisioning";

export const metadata: Metadata = {
  title: "Cuenta pendiente de activación",
  description: "Tu cuenta está creada. Un administrador de Jalector la activará pronto.",
  robots: { index: false, follow: false },
};

const PendientePage = async () => {
  const user = await requireSession();
  let activation = await getCompanyActivationState();

  if (!activation) {
    const provisioned = await provisionInactiveCompany(user.id);
    if (provisioned) {
      activation = {
        companyId: provisioned.companyId,
        companyName: provisioned.companyName,
        isActive: provisioned.isActive,
      };
    }
  }

  const context = await getAccessContext();
  if (context?.phase === "active_user") {
    redirect("/cliente");
  }
  if (context?.phase === "admin_panel") {
    redirect("/ejecutivo");
  }
  if (context?.phase === "needs_registration") {
    redirect("/registro");
  }

  const companyName = activation?.companyName ?? "tu empresa";

  return (
    <AuthShell
      eyebrow="Activación"
      title="Tu cuenta está lista"
      subtitle={`Registramos ${companyName}. Un administrador de Jalector activará tu acceso al panel. Te avisamos en ${user.email}.`}
      footer={
        <div className="auth-pending-footer">
          <span>Correo: {user.email}</span>
          <LogoutButton label="Cerrar sesión" />
        </div>
      }
    >
      <ul className="auth-timeline">
        <li className="auth-timeline-active">
          <CheckCircle2 size={18} />
          <div>
            <p className="auth-timeline-title">Cuenta creada</p>
            <p className="auth-timeline-text">
              Validamos tu correo y creamos la empresa con tu usuario como administrador.
            </p>
          </div>
        </li>
        <li className="auth-timeline-active">
          <Clock size={18} />
          <div>
            <p className="auth-timeline-title">Activación por el equipo</p>
            <p className="auth-timeline-text">
              Un administrador revisa y activa tu cuenta. Suele tomar menos de 24 horas hábiles.
            </p>
          </div>
        </li>
        <li>
          <Rocket size={18} />
          <div>
            <p className="auth-timeline-title">Panel habilitado</p>
            <p className="auth-timeline-text">
              Cuando esté activa podrás entrar al panel, publicar vacantes y conectar WhatsApp Business.
            </p>
          </div>
        </li>
      </ul>
    </AuthShell>
  );
};

export default PendientePage;
