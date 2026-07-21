"use client";

import { useTransition } from "react";
import { Loader2, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";

interface LogoutButtonProps {
  label?: string;
  className?: string;
  formClassName?: string;
  iconOnly?: boolean;
}

export const LogoutButton = ({
  label = "Cerrar sesión",
  className,
  formClassName,
  iconOnly = false,
}: LogoutButtonProps) => {
  const [pending, startTransition] = useTransition();
  const showLabel = !iconOnly && label.length > 0;

  return (
    <form
      className={formClassName}
      action={() => startTransition(() => signOut())}
    >
      <button
        type="submit"
        disabled={pending}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        className={className ?? "auth-link-button"}
      >
        {pending ? <Loader2 size={16} className="auth-spinner" /> : <LogOut size={16} />}
        {showLabel ? label : null}
      </button>
    </form>
  );
};
