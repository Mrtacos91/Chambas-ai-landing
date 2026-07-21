"use client";

import type { LucideIcon } from "lucide-react";

export type BottomNavItem<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

export const BottomNav = <T extends string>({
  activeId,
  items,
  label,
  onSelect,
  trailing,
}: {
  activeId: T;
  items: Array<BottomNavItem<T>>;
  label: string;
  onSelect: (id: T) => void;
  trailing?: React.ReactNode;
}) => (
  <nav className="fixed inset-x-0 bottom-4 z-50 px-3" aria-label={label}>
    <div
      className={`mx-auto grid max-w-[780px] gap-1 rounded-[24px] border border-[var(--line)] bg-[var(--nav-bg)] p-2 shadow-[var(--shadow-strong)] backdrop-blur-2xl`}
      style={{
        gridTemplateColumns: `repeat(${items.length + (trailing ? 1 : 0)}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;

        return (
          <button
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[18px] px-1.5 text-[10px] font-bold transition sm:px-2 sm:text-[11px] ${
              isActive
                ? "bg-[var(--brand-navy)] text-[var(--background)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
            }`}
            key={item.id}
            onClick={() => onSelect(item.id)}
            type="button"
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
      {trailing}
    </div>
  </nav>
);
