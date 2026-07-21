import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Crear cuenta de empresa",
  description: "Crea tu cuenta en Jalector con correo y contraseña. Un administrador la activará.",
  robots: { index: false, follow: false },
};

const RegistroPage = () => (
  <AuthShell
    eyebrow="Registro"
    title="Crea la cuenta de tu empresa"
    subtitle="Registra tus datos y define tu contraseña. Un administrador de Jalector activa la cuenta para habilitar el panel."
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
