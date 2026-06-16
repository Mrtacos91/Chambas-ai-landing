export type { UserType, CompanyRole, SignupStatus } from "@/types/database";

export type AuthEventType =
  | "otp_requested"
  | "otp_verified"
  | "oauth_google"
  | "login_success"
  | "login_failed"
  | "logout"
  | "signup_submitted"
  | "signup_approved"
  | "signup_rejected"
  | "invitation_sent"
  | "invitation_accepted";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  userType: "executive" | "client";
  isActive: boolean;
}

export interface CurrentMembership {
  companyId: string;
  companyName: string;
  role: "owner" | "recruiter" | "viewer";
}
