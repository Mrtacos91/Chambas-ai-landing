import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a Jalector con tu correo y contraseña, o con Google.",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams?: Promise<{ redirect?: string; error?: string }>;
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const params = await searchParams;
  const redirect = params?.redirect && params.redirect.startsWith("/") ? params.redirect : undefined;

  return (
    <AuthShell
      eyebrow="Acceso"
      title="Inicia sesión en Jalector"
      subtitle="Entra con tu correo y contraseña, o continúa con Google."
      footer={
        <p>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="auth-link">
            Crea la cuenta de tu empresa
          </Link>
          .
        </p>
      }
    >
      <LoginForm redirect={redirect} />
      {params?.error ? <p className="auth-error">{decodeURIComponent(params.error)}</p> : null}
    </AuthShell>
  );
};

export default LoginPage;
