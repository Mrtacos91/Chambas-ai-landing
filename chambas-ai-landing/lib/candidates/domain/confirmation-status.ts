export const CONFIRMATION_STATUSES = [
  "none",
  "sent",
  "confirmed",
  "declined",
] as const;

export type ConfirmationStatus = (typeof CONFIRMATION_STATUSES)[number];

export const CONFIRMATION_STATUS_LABELS: Record<ConfirmationStatus, string> = {
  none: "Sin invitar",
  sent: "Cita enviada",
  confirmed: "Cita confirmada",
  declined: "Declinó",
};

export const isConfirmationStatus = (value: string): value is ConfirmationStatus =>
  (CONFIRMATION_STATUSES as readonly string[]).includes(value);

export const canSendInterviewInvite = (status: ConfirmationStatus): boolean =>
  status === "none" || status === "declined";
