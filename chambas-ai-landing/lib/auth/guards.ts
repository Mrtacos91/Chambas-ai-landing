import { redirect } from "next/navigation";
import { getActiveMembership, getCurrentUser, getPendingSignup } from "@/lib/auth/session";
import type { CurrentMembership, CurrentUser } from "@/lib/auth/types";

export const requireSession = async (): Promise<CurrentUser> => {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    redirect("/login");
  }
  return user;
};

export const requireExecutive = async (): Promise<CurrentUser> => {
  const user = await requireSession();
  if (user.userType !== "executive") {
    redirect("/cliente");
  }
  return user;
};

export interface ClientContext {
  user: CurrentUser;
  membership: CurrentMembership;
}

export const requireClient = async (): Promise<ClientContext> => {
  const user = await requireSession();
  if (user.userType !== "client") {
    redirect("/ejecutivo");
  }

  const membership = await getActiveMembership();

  if (!membership) {
    const signup = await getPendingSignup();
    if (!signup) {
      redirect("/registro");
    }
    redirect("/registro/pendiente");
  }

  return { user, membership };
};
