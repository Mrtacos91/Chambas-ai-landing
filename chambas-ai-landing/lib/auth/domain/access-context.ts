export type PlatformRole = "usuario" | "admin";
export type CompanyRole = "admin" | "usuario";

export type AccessPhase =
  | "admin_panel"
  | "needs_registration"
  | "pending_activation"
  | "active_user";

export interface AccessContext {
  userId: string;
  platformRole: PlatformRole;
  companyRole: CompanyRole | null;
  phase: AccessPhase;
  companyId: string | null;
  companyName: string | null;
  companyActive: boolean;
  redirectPath: string;
  allowedPrefixes: string[];
}

export const isPlatformAdmin = (role: PlatformRole) => role === "admin";
export const isCompanyAdmin = (role: CompanyRole | null) => role === "admin";
