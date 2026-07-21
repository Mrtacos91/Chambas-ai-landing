import { redirect } from "next/navigation";
import { getAccessContext, getActiveMembership, getCurrentUser } from "@/lib/auth/session";
import type { CurrentMembership, CurrentUser } from "@/lib/auth/types";

export const requireSession = async (): Promise<CurrentUser> => {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    redirect("/login");
  }
  return user;
};

export const requireAdmin = async (): Promise<CurrentUser> => {
  const user = await requireSession();
  if (user.userType !== "admin") {
    redirect("/cliente");
  }
  return user;
};

export const requireExecutive = requireAdmin;

export interface ClientContext {
  user: CurrentUser;
  membership: CurrentMembership;
}

export const requireUsuario = async (): Promise<ClientContext> => {
  const user = await requireSession();
  if (user.userType !== "usuario") {
    redirect("/ejecutivo");
  }

  const context = await getAccessContext();
  if (!context || context.phase === "needs_registration") {
    redirect("/registro");
  }

  if (context.phase === "pending_activation") {
    redirect("/registro/pendiente");
  }

  const membership = await getActiveMembership();
  if (!membership || !membership.isCompanyActive) {
    redirect("/registro/pendiente");
  }

  return { user, membership };
};

export const requireClient = requireUsuario;

export const requireCompanyAdmin = async (): Promise<ClientContext> => {
  const ctx = await requireUsuario();
  if (ctx.membership.role !== "admin") {
    redirect("/cliente");
  }
  return ctx;
};
