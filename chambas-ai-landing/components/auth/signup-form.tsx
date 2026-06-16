"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { submitCompanySignup } from "@/lib/auth/actions";

const volumeOptions = [
  { value: "menos-10", label: "Menos de 10 vacantes al mes" },
  { value: "10-50", label: "Entre 10 y 50 vacantes al mes" },
  { value: "50-200", label: "Entre 50 y 200 vacantes al mes" },
  { value: "mas-200", label: "Más de 200 vacantes al mes" },
];

const industryOptions = [
  "Retail y autoservicio",
  "Restaurantes y quick service",
  "Logística y delivery",
  "Manufactura",
  "Call center y BPO",
  "Servicios corporativos",
  "Otra",
];

export const SignupForm = () => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await submitCompanySignup(formData);
      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors as Record<string, string>);
        if (result.error) setError(result.error);
        return;
      }
      const email = (result.data as { email: string }).email;
      router.push(`/verify?email=${encodeURIComponent(email)}&redirect=/registro/pendiente`);
    });
  };

  return (
    <form action={handleSubmit} className="auth-form auth-form-grid">
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
        {fieldErrors.email ? <span className="auth-field-error">{fieldErrors.email}</span> : null}
      </label>

      <label className="auth-label" htmlFor="contactName">
        Nombre del responsable
        <input
          id="contactName"
          name="contactName"
          type="text"
          autoComplete="name"
          required
          className="auth-input"
          disabled={pending}
        />
        {fieldErrors.contactName ? <span className="auth-field-error">{fieldErrors.contactName}</span> : null}
      </label>

      <label className="auth-label" htmlFor="contactPhone">
        Teléfono de contacto
        <input
          id="contactPhone"
          name="contactPhone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="+52 55 0000 0000"
          className="auth-input"
          disabled={pending}
        />
        {fieldErrors.contactPhone ? <span className="auth-field-error">{fieldErrors.contactPhone}</span> : null}
      </label>

      <label className="auth-label" htmlFor="companyName">
        Nombre de la empresa
        <input
          id="companyName"
          name="companyName"
          type="text"
          autoComplete="organization"
          required
          className="auth-input"
          disabled={pending}
        />
        {fieldErrors.companyName ? <span className="auth-field-error">{fieldErrors.companyName}</span> : null}
      </label>

      <label className="auth-label" htmlFor="industry">
        Industria
        <select
          id="industry"
          name="industry"
          required
          className="auth-input"
          defaultValue=""
          disabled={pending}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          {industryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {fieldErrors.industry ? <span className="auth-field-error">{fieldErrors.industry}</span> : null}
      </label>

      <label className="auth-label" htmlFor="expectedVolume">
        Volumen mensual estimado
        <select
          id="expectedVolume"
          name="expectedVolume"
          required
          className="auth-input"
          defaultValue=""
          disabled={pending}
        >
          <option value="" disabled>
            Selecciona un rango
          </option>
          {volumeOptions.map((option) => (
            <option key={option.value} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors.expectedVolume ? <span className="auth-field-error">{fieldErrors.expectedVolume}</span> : null}
      </label>

      <div className="auth-form-actions">
        <button type="submit" disabled={pending} className="auth-primary-button">
          {pending ? <Loader2 size={16} className="auth-spinner" /> : null}
          Enviar solicitud
          {!pending ? <ArrowRight size={16} /> : null}
        </button>
        {error ? <p className="auth-error">{error}</p> : null}
      </div>
    </form>
  );
};
