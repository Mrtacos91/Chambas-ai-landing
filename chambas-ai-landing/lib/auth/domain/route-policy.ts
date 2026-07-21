import type { AccessPhase, AccessContext } from "@/lib/auth/domain/access-context";

const PHASE_POLICY: Record<
  AccessPhase,
  { redirectPath: string; allowedPrefixes: string[] }
> = {
  admin_panel: {
    redirectPath: "/ejecutivo",
    allowedPrefixes: ["/ejecutivo"],
  },
  needs_registration: {
    redirectPath: "/registro",
    allowedPrefixes: ["/registro", "/verify", "/callback"],
  },
  pending_activation: {
    redirectPath: "/registro/pendiente",
    allowedPrefixes: ["/registro/pendiente", "/verify", "/callback"],
  },
  active_user: {
    redirectPath: "/cliente",
    allowedPrefixes: ["/cliente", "/invitacion"],
  },
};

export const getPhasePolicy = (phase: AccessPhase) => PHASE_POLICY[phase];

export const withRoutePolicy = (
  context: Omit<AccessContext, "redirectPath" | "allowedPrefixes">,
): AccessContext => {
  const policy = getPhasePolicy(context.phase);
  return {
    ...context,
    redirectPath: policy.redirectPath,
    allowedPrefixes: policy.allowedPrefixes,
  };
};

export const isPathAllowedForPhase = (phase: AccessPhase, pathname: string) => {
  if (pathname === "/login" || pathname === "/verify" || pathname === "/callback") {
    return true;
  }

  const { allowedPrefixes } = getPhasePolicy(phase);
  return allowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
};

export const resolveRedirectForPath = (
  context: AccessContext,
  pathname: string,
): string | null => {
  if (isPathAllowedForPhase(context.phase, pathname)) {
    return null;
  }
  return context.redirectPath;
};
