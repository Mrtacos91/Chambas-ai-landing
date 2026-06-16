"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { requestOtp, verifyOtp } from "@/lib/auth/actions";

interface VerifyFormProps {
  email: string;
  redirect?: string;
}

const RESEND_COOLDOWN_SECONDS = 45;

export const VerifyForm = ({ email, redirect }: VerifyFormProps) => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [verifying, startVerify] = useTransition();
  const [resending, startResend] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const submit = (value: string) => {
    if (value.length !== 6) return;
    setError(null);
    const formData = new FormData();
    formData.set("email", email);
    formData.set("code", value);
    if (redirect) formData.set("redirect", redirect);

    startVerify(async () => {
      const result = await verifyOtp(formData);
      if (!result.ok) {
        setError(result.error ?? "No pudimos verificar el código.");
        setCode("");
        inputRef.current?.focus();
        return;
      }
      const target = (result.data as { redirect?: string }).redirect ?? "/cliente";
      router.push(target);
    });
  };

  const handleChange = (rawValue: string) => {
    const digits = rawValue.replace(/\D/gu, "").slice(0, 6);
    setCode(digits);
    if (digits.length === 6) submit(digits);
  };

  const handleResend = () => {
    setError(null);
    setInfo(null);
    const formData = new FormData();
    formData.set("email", email);
    startResend(async () => {
      const result = await requestOtp(formData);
      if (!result.ok) {
        setError(result.error ?? "No pudimos reenviar el código.");
        return;
      }
      setInfo("Te enviamos un nuevo código.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    });
  };

  return (
    <div className="auth-form-stack">
      <p className="auth-helper">
        Enviamos un código de 6 dígitos a <strong>{email}</strong>. Tienes 10 minutos
        para usarlo.
      </p>

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={6}
        value={code}
        onChange={(event) => handleChange(event.target.value)}
        disabled={verifying}
        className="auth-otp-input"
        aria-label="Código de verificación"
      />

      <button
        type="button"
        onClick={() => submit(code)}
        disabled={code.length !== 6 || verifying}
        className="auth-primary-button"
      >
        {verifying ? <Loader2 size={16} className="auth-spinner" /> : null}
        Confirmar código
        {!verifying ? <ArrowRight size={16} /> : null}
      </button>

      {error ? <p className="auth-error">{error}</p> : null}
      {info ? <p className="auth-info">{info}</p> : null}

      <div className="auth-resend">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="auth-link-button"
        >
          {resending ? (
            <Loader2 size={14} className="auth-spinner" />
          ) : null}
          {cooldown > 0
            ? `Reenviar código en ${cooldown}s`
            : "Reenviar código"}
        </button>
      </div>
    </div>
  );
};
