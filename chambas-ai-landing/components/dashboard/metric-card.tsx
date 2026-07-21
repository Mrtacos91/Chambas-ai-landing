"use client";

import type { LucideIcon } from "lucide-react";

export const MetricCard = ({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: LucideIcon;
  label: string;
  value: number | string;
}) => (
  <div className="executive-card rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
        <p className="mt-3 font-display text-3xl font-bold">{value}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{detail}</p>
      </div>
      <div className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
        <Icon size={20} />
      </div>
    </div>
  </div>
);
