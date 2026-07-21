import type { AccessContext } from "@/lib/auth/domain/access-context";
import { resolveRedirectForPath } from "@/lib/auth/domain/route-policy";

export const assertRouteAccess = (
  context: AccessContext,
  pathname: string,
): { allowed: true } | { allowed: false; redirectTo: string } => {
  const redirectTo = resolveRedirectForPath(context, pathname);
  if (!redirectTo) {
    return { allowed: true };
  }
  return { allowed: false, redirectTo };
};
