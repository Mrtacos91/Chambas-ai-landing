"use client";

import Image from "next/image";
import { Moon, ShieldCheck, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { animate, stagger } from "animejs";
import { LogoutButton } from "@/components/auth/logout-button";

type AppDashboardShellProps = {
  badgeLabel?: string;
  brandEyebrow?: string;
  children: ReactNode;
  companyName?: string | null;
  metrics?: ReactNode;
  moduleKey: string;
  searchSlot?: ReactNode;
  subtitle?: string;
  title: string;
  user: {
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  bottomNav: ReactNode;
};

export const AppDashboardShell = ({
  badgeLabel = "Conectado",
  brandEyebrow = "Jalector",
  children,
  companyName,
  metrics,
  moduleKey,
  searchSlot,
  subtitle,
  title,
  user,
  bottomNav,
}: AppDashboardShellProps) => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.querySelector("[data-app-dashboard]");
    if (!root) return;

    const cards = root.querySelectorAll(".executive-card");
    const panel = root.querySelectorAll(".module-panel");

    animate(panel, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 420,
      easing: "out(3)",
      complete: () => {
        panel.forEach((node) => {
          const element = node as HTMLElement;
          element.style.removeProperty("transform");
          element.style.removeProperty("opacity");
        });
      },
    });

    animate(cards, {
      opacity: [0, 1],
      translateY: [18, 0],
      delay: stagger(45),
      duration: 520,
      easing: "out(3)",
      complete: () => {
        cards.forEach((node) => {
          const element = node as HTMLElement;
          element.style.removeProperty("transform");
          element.style.removeProperty("opacity");
        });
      },
    });
  }, [moduleKey]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("jalector-theme", nextTheme);
    setTheme(nextTheme);
  };

  return (
    <main
      className="min-h-screen bg-[var(--background)] pb-28 text-[var(--foreground)]"
      data-app-dashboard
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <ProfileMark avatarUrl={user.avatarUrl} />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-green)]">
                {brandEyebrow}
              </p>
              <h1 className="font-display text-2xl font-bold tracking-normal sm:text-3xl">
                {title}
              </h1>
              <p className="mt-0.5 text-sm text-[var(--muted)]">
                {subtitle ?? companyName ?? user.fullName ?? user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {searchSlot}
            <button
              aria-label="Cambiar tema"
              className="theme-toggle"
              onClick={toggleTheme}
              type="button"
            >
              <Sun className="theme-icon theme-icon-sun" size={18} />
              <Moon className="theme-icon theme-icon-moon" size={18} />
            </button>
            <LogoutButton
              className="executive-logout"
              formClassName="executive-logout-form"
              iconOnly
            />
            <div className="flex min-h-11 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700">
              <ShieldCheck size={16} />
              <span>{badgeLabel}</span>
            </div>
          </div>
        </header>

        {metrics ? (
          <section className="grid gap-3 py-5 sm:grid-cols-2 xl:grid-cols-4">{metrics}</section>
        ) : null}

        <section className="module-panel flex-1">{children}</section>
      </div>

      {bottomNav}
    </main>
  );
};

const ProfileMark = ({ avatarUrl }: { avatarUrl: string | null }) => (
  <div className="executive-profile-mark">
    {avatarUrl ? (
      <img
        alt=""
        className="executive-profile-image"
        referrerPolicy="no-referrer"
        src={avatarUrl}
      />
    ) : (
      <Image
        alt=""
        className="executive-profile-image"
        height={48}
        src="/apple-icon.png"
        width={48}
      />
    )}
  </div>
);
