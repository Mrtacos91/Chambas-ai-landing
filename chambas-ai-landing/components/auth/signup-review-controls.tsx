"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { reviewSignup } from "@/lib/auth/actions";

interface SignupReviewControlsProps {
  signupId: string;
}

export const SignupReviewControls = ({ signupId }: SignupReviewControlsProps) => {
  const [pending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      const result = await reviewSignup({ signupId, decision: "approved" });
      if (!result.ok) setError(result.error ?? "Error al aprobar.");
    });
  };

  const handleReject = () => {
    setError(null);
    if (reason.trim().length < 4) {
      setError("Explica brevemente el motivo del rechazo.");
      return;
    }
    startTransition(async () => {
      const result = await reviewSignup({ signupId, decision: "rejected", reason });
      if (!result.ok) setError(result.error ?? "Error al rechazar.");
    });
  };

  return (
    <div className="review-controls">
      {showReject ? (
        <div className="review-reject">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Motivo visible para la empresa"
            disabled={pending}
            rows={3}
            className="review-reject-input"
          />
          <div className="review-reject-actions">
            <button
              type="button"
              onClick={() => setShowReject(false)}
              disabled={pending}
              className="review-secondary-button"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={pending}
              className="review-reject-button"
            >
              {pending ? <Loader2 size={14} className="auth-spinner" /> : <XCircle size={14} />}
              Confirmar rechazo
            </button>
          </div>
        </div>
      ) : (
        <div className="review-actions">
          <button
            type="button"
            onClick={handleApprove}
            disabled={pending}
            className="review-approve-button"
          >
            {pending ? <Loader2 size={14} className="auth-spinner" /> : <CheckCircle2 size={14} />}
            Aprobar
          </button>
          <button
            type="button"
            onClick={() => setShowReject(true)}
            disabled={pending}
            className="review-reject-toggle"
          >
            <XCircle size={14} />
            Rechazar
          </button>
        </div>
      )}
      {error ? <p className="auth-error">{error}</p> : null}
    </div>
  );
};
