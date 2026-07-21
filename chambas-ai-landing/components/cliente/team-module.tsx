"use client";

import { Users } from "lucide-react";
import { InviteMemberForm } from "@/components/auth/invite-member-form";

export type TeamMemberView = {
  id: string;
  role: string;
  createdAt: string | null;
  fullName: string | null;
  email: string | null;
};

export type TeamInvitationView = {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
};

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  usuario: "Usuario",
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
});

export const TeamModule = ({
  canInvite,
  invitations,
  members,
}: {
  canInvite: boolean;
  invitations: TeamInvitationView[];
  members: TeamMemberView[];
}) => (
  <div className="space-y-5">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-green)]">
        Equipo
      </p>
      <h2 className="mt-1 font-display text-2xl font-bold">Miembros con acceso al panel</h2>
      <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
        Solo el administrador puede invitar. Las invitaciones caducan en 7 días.
      </p>
    </div>

    {canInvite ? (
      <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
        <h3 className="mb-4 font-semibold">Invitar miembro</h3>
        <InviteMemberForm />
      </div>
    ) : null}

    <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <h3 className="mb-4 font-semibold">Miembros actuales</h3>
      <ul className="space-y-3">
        {members.map((member) => (
          <li
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3"
            key={member.id}
          >
            <div>
              <p className="font-semibold">{member.fullName ?? member.email ?? "Sin nombre"}</p>
              <p className="text-sm text-[var(--muted)]">{member.email ?? "—"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-[var(--surface)] px-3 py-1 font-semibold">
                {roleLabels[member.role] ?? member.role}
              </span>
              <span className="text-[var(--muted)]">
                desde{" "}
                {member.createdAt
                  ? dateFormatter.format(new Date(member.createdAt))
                  : "—"}
              </span>
            </div>
          </li>
        ))}
        {members.length === 0 ? (
          <li className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Users size={18} />
            No hay miembros registrados todavía.
          </li>
        ) : null}
      </ul>
    </div>

    {invitations.length > 0 ? (
      <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
        <h3 className="mb-4 font-semibold">Invitaciones pendientes</h3>
        <ul className="space-y-3">
          {invitations.map((invitation) => (
            <li
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3"
              key={invitation.id}
            >
              <div>
                <p className="font-semibold">{invitation.email}</p>
                <p className="text-sm text-[var(--muted)]">
                  Vence el {dateFormatter.format(new Date(invitation.expiresAt))}
                </p>
              </div>
              <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold">
                {roleLabels[invitation.role] ?? invitation.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ) : null}
  </div>
);
