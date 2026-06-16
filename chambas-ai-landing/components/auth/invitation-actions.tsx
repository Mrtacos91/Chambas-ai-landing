"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { acceptInvitation } from "@/lib/auth/actions";

interface InvitationActionsProps {
  token: string;
}

export const InvitationActions = ({ token }: InvitationActionsProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvitation(token);
      if (!result.ok) {
        setError(result.error ?? "No pudimos procesar la invitación.");
        return;
      }
      router.push("/cliente");
    });
  };

  return (
    <div className="auth-form-stack">
      <button type="button" onClick={handleAccept} disabled={pending} className="auth-primary-button">
        {pending ? <Loader2 size={16} className="auth-spinner" /> : null}
        Aceptar invitación
        {!pending ? <ArrowRight size={16} /> : null}
      </button>
      {error ? <p className="auth-error">{error}</p> : null}
    </div>
  );
};
