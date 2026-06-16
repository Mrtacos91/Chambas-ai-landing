"use client";

import { useTransition } from "react";
import { Loader2, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";

interface LogoutButtonProps {
  label?: string;
  className?: string;
}

export const LogoutButton = ({ label = "Cerrar sesión", className }: LogoutButtonProps) => {
  const [pending, startTransition] = useTransition();

  return (
    <form action={() => startTransition(() => signOut())}>
      <button type="submit" disabled={pending} className={className ?? "auth-link-button"}>
        {pending ? <Loader2 size={14} className="auth-spinner" /> : <LogOut size={14} />}
        {label}
      </button>
    </form>
  );
};
