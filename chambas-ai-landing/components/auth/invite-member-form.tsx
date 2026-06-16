"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2, UserPlus } from "lucide-react";
import { inviteCompanyMember } from "@/lib/auth/actions";

export const InviteMemberForm = () => {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await inviteCompanyMember(formData);
      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors as Record<string, string>);
        if (result.error) setError(result.error);
        return;
      }
      setSuccess("Invitación enviada por correo.");
    });
  };

  return (
    <form action={handleSubmit} className="invite-form">
      <div className="invite-row">
        <label className="auth-label" htmlFor="invite-email">
          Correo del invitado
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            placeholder="persona@empresa.com"
            className="auth-input"
            disabled={pending}
          />
          {fieldErrors.email ? <span className="auth-field-error">{fieldErrors.email}</span> : null}
        </label>

        <label className="auth-label" htmlFor="invite-role">
          Rol
          <select
            id="invite-role"
            name="role"
            required
            defaultValue="recruiter"
            disabled={pending}
            className="auth-input"
          >
            <option value="owner">Administrador</option>
            <option value="recruiter">Reclutador</option>
            <option value="viewer">Observador</option>
          </select>
        </label>
      </div>

      <button type="submit" disabled={pending} className="auth-primary-button">
        {pending ? <Loader2 size={16} className="auth-spinner" /> : <UserPlus size={16} />}
        Enviar invitación
        {!pending ? <ArrowRight size={16} /> : null}
      </button>

      {error ? <p className="auth-error">{error}</p> : null}
      {success ? <p className="auth-info">{success}</p> : null}
    </form>
  );
};
