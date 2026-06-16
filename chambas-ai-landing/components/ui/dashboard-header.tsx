import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";

interface DashboardHeaderProps {
  user: { email: string; fullName: string | null };
  subtitle?: string;
  nav?: ReactNode;
}

export const DashboardHeader = ({ user, subtitle, nav }: DashboardHeaderProps) => (
  <header className="dashboard-header">
    <div className="dashboard-header-inner">
      <Link href="/" className="dashboard-brand">
        <span className="dashboard-brand-logo">
          <Image src="/logo.png" alt="" width={32} height={32} />
        </span>
        <span>
          <span className="dashboard-brand-name">Jalector</span>
          {subtitle ? <span className="dashboard-brand-tag">{subtitle}</span> : null}
        </span>
      </Link>

      {nav ? <nav className="dashboard-nav">{nav}</nav> : null}

      <div className="dashboard-user">
        <div className="dashboard-user-info">
          <span className="dashboard-user-name">{user.fullName ?? user.email}</span>
          <span className="dashboard-user-email">{user.email}</span>
        </div>
        <LogoutButton className="dashboard-logout" />
      </div>
    </div>
  </header>
);
