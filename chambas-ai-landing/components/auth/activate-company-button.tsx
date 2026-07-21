"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { activateAccountManually } from "@/lib/auth/actions";

interface ActivateCompanyButtonProps {
  companyId: string;
  companyName: string;
}

export const ActivateCompanyButton = ({
  companyId,
  companyName,
}: ActivateCompanyButtonProps) => {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  if (done) {
    return (
      <div className="signup-activate-actions">
        <p className="signup-activate-done">
          <CheckCircle2 size={16} />
          {companyName} activada
        </p>
        {emailNotice ? (
          <p className="auth-info">
            <Mail size={14} />
            {emailNotice}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="signup-activate-actions">
      <button
        type="button"
        className="auth-primary-button"
        disabled={pending}
        onClick={() => {
          setError(null);
          setEmailNotice(null);
          startTransition(async () => {
            const result = await activateAccountManually(companyId);
            if (!result.ok) {
              setError(result.error ?? "No pudimos activar la cuenta.");
              return;
            }

            const data = result.data as
              | { emailSent?: boolean; email?: string | null; emailError?: string }
              | undefined;

            if (data?.emailSent && data.email) {
              setEmailNotice(`Aviso enviado a ${data.email}`);
            } else if (data?.emailError) {
              setEmailNotice(
                `Cuenta activada, pero el correo no se envió: ${data.emailError}`,
              );
            } else {
              setEmailNotice("Cuenta activada. No se envió correo de aviso.");
            }

            setDone(true);
          });
        }}
      >
        {pending ? <Loader2 size={16} className="auth-spinner" /> : null}
        Activar cuenta
      </button>
      {error ? <p className="auth-error">{error}</p> : null}
    </div>
  );
};
