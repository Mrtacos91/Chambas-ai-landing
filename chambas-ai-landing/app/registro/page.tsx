import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Solicitar acceso para tu empresa",
  description: "Registra a tu empresa en Jalector. Activamos tu cuenta en menos de 24 horas hábiles.",
  robots: { index: false, follow: false },
};

const RegistroPage = () => (
  <AuthShell
    eyebrow="Solicitud de acceso"
    title="Crea la cuenta de tu empresa"
    subtitle="Recibimos tu solicitud, validamos los datos y un ejecutivo te confirma el alta en menos de 24 horas hábiles."
    footer={
      <p>
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="auth-link">
          Inicia sesión
        </Link>
        .
      </p>
    }
  >
    <SignupForm />
  </AuthShell>
);

export default RegistroPage;
