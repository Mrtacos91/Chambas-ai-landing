"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { requestOtp, signInWithGoogle } from "@/lib/auth/actions";

interface LoginFormProps {
  redirect?: string;
}

export const LoginForm = ({ redirect }: LoginFormProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [googlePending, startGoogle] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await requestOtp(formData);
      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors as Record<string, string>);
        if (result.error) setError(result.error);
        return;
      }
      const email = (result.data as { email: string }).email;
      const params = new URLSearchParams({ email });
      if (redirect) params.set("redirect", redirect);
      router.push(`/verify?${params.toString()}`);
    });
  };

  const handleGoogle = () => {
    setError(null);
    startGoogle(async () => {
      const result = await signInWithGoogle(redirect);
      if (result && !result.ok && result.error) setError(result.error);
    });
  };

  return (
    <div className="auth-form-stack">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googlePending || pending}
        className="auth-oauth-button"
      >
        {googlePending ? (
          <Loader2 size={16} className="auth-spinner" />
        ) : (
          <GoogleIcon />
        )}
        Continuar con Google
      </button>

      <div className="auth-divider">
        <span>o con tu correo</span>
      </div>

      <form action={handleSubmit} className="auth-form">
        <label className="auth-label" htmlFor="email">
          Correo corporativo
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@empresa.com"
            className="auth-input"
            disabled={pending}
          />
        </label>
        {fieldErrors.email ? <p className="auth-field-error">{fieldErrors.email}</p> : null}

        <button type="submit" disabled={pending || googlePending} className="auth-primary-button">
          {pending ? <Loader2 size={16} className="auth-spinner" /> : null}
          Enviar código
          {!pending ? <ArrowRight size={16} /> : null}
        </button>
        {error ? <p className="auth-error">{error}</p> : null}
      </form>
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.11A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.44.36-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.42 3.47 1.18 4.95l3.66-2.84Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
    />
  </svg>
);
