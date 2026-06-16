import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyForm } from "@/components/auth/verify-form";

export const metadata: Metadata = {
  title: "Verifica tu código",
  description: "Confirma tu correo con el código de un solo uso.",
  robots: { index: false, follow: false },
};

interface VerifyPageProps {
  searchParams?: Promise<{ email?: string; redirect?: string }>;
}

const VerifyPage = async ({ searchParams }: VerifyPageProps) => {
  const params = await searchParams;
  const email = params?.email?.trim().toLowerCase();
  const redirectAfter = params?.redirect && params.redirect.startsWith("/") ? params.redirect : undefined;

  if (!email) {
    redirect("/login");
  }

  return (
    <AuthShell
      eyebrow="Verificación"
      title="Confirma tu identidad"
      subtitle="Teclea el código de 6 dígitos que enviamos a tu correo."
      footer={
        <p>
          ¿Te equivocaste de correo?{" "}
          <Link href="/login" className="auth-link">
            Volver a iniciar sesión
          </Link>
          .
        </p>
      }
    >
      <VerifyForm email={email} redirect={redirectAfter} />
    </AuthShell>
  );
};

export default VerifyPage;
