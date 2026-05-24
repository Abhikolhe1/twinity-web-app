"use client";

import type { ReactNode } from "react";

export type SidebarStep = {
  id: number;
  label: string;
  icon: ReactNode;
  locked: boolean;
  afterPayment?: boolean;
};

const iconClass = "size-4 shrink-0 text-current";

function IconGrid() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconLayout() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="3" width="18" height="6" rx="1" />
      <rect x="3" y="12" width="10" height="9" rx="1" />
      <rect x="15" y="12" width="6" height="9" rx="1" />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20v-1a7 7 0 0 1 14 0v1" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconSliders() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M9 10h6M15 16h6M5 8h2" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="1" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 16V4M8 8l4-4 4 4M4 20h16" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
    </svg>
  );
}

export const SIDEBAR_STEPS: Omit<SidebarStep, "icon">[] = [
  { id: 1, label: "Service", locked: false },
  { id: 2, label: "Template", locked: false },
  { id: 3, label: "Celebrity", locked: false },
  { id: 4, label: "Preview Sample", locked: false },
  { id: 5, label: "Configure", locked: false },
  { id: 6, label: "Sign In", locked: true, afterPayment: true },
  { id: 7, label: "Submit Brief", locked: true },
  { id: 8, label: "Approval", locked: true },
  { id: 9, label: "Delivery", locked: true },
];

const ICONS: Record<number, ReactNode> = {
  1: <IconGrid />,
  2: <IconLayout />,
  3: <IconPerson />,
  4: <IconPlay />,
  5: <IconSliders />,
  6: <IconLock />,
  7: <IconUpload />,
  8: <IconShield />,
  9: <IconDownload />,
};

export type SidebarNavProps = {
  currentStep: number;
  onStepClick: (step: number) => void;
};

export function SidebarNav({ currentStep, onStepClick }: SidebarNavProps) {
  return (
    <nav
      className="flex w-[220px] shrink-0 flex-col py-4"
      aria-label="Funnel steps"
      style={{ background: "#F8F7FF", borderRight: "1px solid rgba(0,0,0,0.08)" }}
    >
      <ul className="flex flex-col gap-0.5 px-2">
        {SIDEBAR_STEPS.map((s) => {
          const isActive = !s.locked && s.id === currentStep;
          const isDone   = !s.locked && s.id < currentStep;
          const isLocked = s.locked;
          const canGoBack = !isLocked && isDone;

          const rowContent = (
            <>
              {/* Horizon step circle */}
              <span
                className="flex shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-all duration-200"
                style={{
                  width:      28,
                  height:     28,
                  background: isDone
                    ? "linear-gradient(135deg, #7C3AED, #5B21B6)"
                    : isActive
                      ? "rgba(124,58,237,0.10)"
                      : "rgba(0,0,0,0.04)",
                  border: isDone
                    ? "none"
                    : isActive
                      ? "2px solid #7C3AED"
                      : "1px solid rgba(0,0,0,0.10)",
                  color: isDone ? "#FFFFFF" : isActive ? "#7C3AED" : "rgba(15,10,30,0.25)",
                  boxShadow: isDone ? "0 4px 12px rgba(124,58,237,0.35)" : "none",
                }}
              >
                {isDone ? "✓" : s.id}
              </span>
              <span
                className="min-w-0 flex-1 truncate text-[13px]"
                style={{
                  fontWeight: isActive ? 600 : 400,
                  color: isLocked
                    ? "rgba(15,10,30,0.25)"
                    : isActive
                      ? "#0F0A1E"
                      : isDone
                        ? "rgba(15,10,30,0.50)"
                        : "rgba(15,10,30,0.35)",
                }}
              >
                {s.label}
              </span>
            </>
          );

          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={isLocked || (!isDone && s.id !== currentStep)}
                onClick={() => { if (canGoBack) onStepClick(s.id); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start transition-all duration-200 disabled:pointer-events-none"
                style={{
                  background: isActive ? "rgba(124,58,237,0.07)" : "transparent",
                  border: isActive
                    ? "1px solid rgba(124,58,237,0.18)"
                    : "1px solid transparent",
                }}
              >
                {rowContent}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
