import type { Metadata } from "next";
import { CheckCircle2, Clock, MailQuestion } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireSession } from "@/lib/auth/guards";
import { getPendingSignup } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Solicitud en revisión",
  description: "Estamos revisando tu solicitud de acceso.",
  robots: { index: false, follow: false },
};

const PendientePage = async () => {
  const user = await requireSession();
  const signup = await getPendingSignup();

  const statusLabel: Record<string, string> = {
    pending: "En revisión",
    approved: "Aprobada",
    rejected: "No aprobada",
  };
  const status = signup?.status ?? "pending";

  return (
    <AuthShell
      eyebrow="Solicitud"
      title="Estamos revisando tu acceso"
      subtitle={`Recibimos la solicitud de ${signup?.company_name ?? "tu empresa"}. Te avisamos al correo ${user.email} en cuanto haya respuesta.`}
      footer={
        <div className="auth-pending-footer">
          <span>¿Necesitas algo más?</span>
          <LogoutButton label="Cerrar sesión" />
        </div>
      }
    >
      <ul className="auth-timeline">
        <li className={status !== "rejected" ? "auth-timeline-active" : undefined}>
          <CheckCircle2 size={18} />
          <div>
            <p className="auth-timeline-title">Solicitud recibida</p>
            <p className="auth-timeline-text">
              Guardamos los datos de tu empresa y validamos tu correo corporativo.
            </p>
          </div>
        </li>
        <li className={status === "pending" ? "auth-timeline-active" : undefined}>
          <Clock size={18} />
          <div>
            <p className="auth-timeline-title">Revisión por ejecutivo: {statusLabel[status]}</p>
            <p className="auth-timeline-text">
              Un ejecutivo de Jalector revisa la información en menos de 24 horas hábiles
              y te notifica por correo.
            </p>
          </div>
        </li>
        <li>
          <MailQuestion size={18} />
          <div>
            <p className="auth-timeline-title">Activación del panel</p>
            <p className="auth-timeline-text">
              Cuando aprobemos tu cuenta podrás entrar al panel ejecutivo, configurar
              tu número de WhatsApp Business y publicar vacantes.
            </p>
          </div>
        </li>
      </ul>

      {status === "rejected" && signup?.rejection_reason ? (
        <div className="auth-rejection-box">
          <p className="auth-rejection-label">Motivo</p>
          <p className="auth-rejection-text">{signup.rejection_reason}</p>
        </div>
      ) : null}
    </AuthShell>
  );
};

export default PendientePage;
