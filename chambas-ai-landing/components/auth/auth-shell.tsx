import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthShell = ({ title, subtitle, eyebrow, children, footer }: AuthShellProps) => (
  <div className="auth-shell">
    <Link href="/" className="auth-brand" aria-label="Volver al inicio">
      <span className="auth-brand-logo">
        <Image src="/logo.png" alt="" width={40} height={40} />
      </span>
      <span>
        <span className="auth-brand-name">Jalector</span>
        <span className="auth-brand-tag">Captación conversacional · Panel ejecutivo</span>
      </span>
    </Link>

    <div className="auth-card">
      {eyebrow ? <p className="auth-eyebrow">{eyebrow}</p> : null}
      <h1 className="auth-title">{title}</h1>
      {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
      <div className="auth-body">{children}</div>
      {footer ? <div className="auth-footer">{footer}</div> : null}
    </div>
  </div>
);
