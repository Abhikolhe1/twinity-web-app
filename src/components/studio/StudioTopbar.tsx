"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, Search } from "lucide-react";

import { useUser } from "@/contexts/UserContext";

const PAGE_LABELS: Record<string, string> = {
  "/studio":                  "Dashboard",
  "/studio/requests":         "My Requests",
  "/studio/licenses":         "Licenses",
  "/studio/settings":         "Settings",
  "/studio/select-celebrity": "Select Celebrity",
  "/studio/configure":        "Configure",
  "/studio/checkout":         "Checkout",
};

export function StudioTopbar() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [focused, setFocused] = useState(false);

  const displayName = user?.name ?? "Studio User";
  const initials    = displayName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const currentLabel = PAGE_LABELS[pathname] ?? "Studio";
  const isHome = pathname === "/studio" || pathname === "/studio/";

  return (
    <header
      className="sticky top-0 z-20 flex h-[60px] shrink-0 items-center gap-4 px-6"
      style={{
        background:   "rgba(12,11,18,0.90)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Breadcrumb — hidden on dashboard home */}
      {!isHome && (
        <nav aria-label="Breadcrumb" className="flex shrink-0 items-center gap-2 text-[13px]">
          <span style={{ color: "rgba(255,255,255,0.22)" }}>Pages</span>
          <span aria-hidden style={{ color: "rgba(255,255,255,0.12)" }}>/</span>
          <span className="font-medium text-white">{currentLabel}</span>
        </nav>
      )}

      {/* Search — centered */}
      <div className="flex flex-1 items-center justify-center">
        <div
          className="relative flex w-full max-w-[380px] items-center"
          style={{
            height:       36,
            borderRadius: 8,
            background:   focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
            border:       focused ? "1px solid rgba(124,58,237,0.45)" : "1px solid rgba(255,255,255,0.07)",
            boxShadow:    focused ? "0 0 0 3px rgba(124,58,237,0.10)" : "none",
            transition:   "all 180ms ease",
          }}
        >
          <Search
            size={13}
            className="pointer-events-none absolute left-3 shrink-0"
            style={{
              color:      focused ? "rgba(167,139,250,0.70)" : "rgba(255,255,255,0.22)",
              transition: "color 180ms ease",
            }}
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search celebrities, requests, licenses…"
            className="h-full w-full bg-transparent pl-8 pr-4 text-[13px] text-white placeholder:text-[rgba(255,255,255,0.22)] focus:outline-none"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Search celebrities, requests, and licenses"
          />
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex shrink-0 items-center gap-1.5">

        {/* Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex items-center justify-center rounded-lg transition-all duration-150"
          style={{
            width:      34,
            height:     34,
            background: "transparent",
            color:      "rgba(255,255,255,0.35)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(255,255,255,0.06)";
            el.style.color      = "rgba(255,255,255,0.70)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "transparent";
            el.style.color      = "rgba(255,255,255,0.35)";
          }}
        >
          <Bell size={15} />
          {/* Notification dot */}
          <span
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              top:          6,
              right:        6,
              width:        5,
              height:       5,
              borderRadius: 9999,
              background:   "#7C3AED",
              boxShadow:    "0 0 0 1.5px #0c0b12",
            }}
          />
        </button>

        {/* Help */}
        <button
          type="button"
          aria-label="Help"
          className="flex items-center justify-center rounded-lg transition-all duration-150"
          style={{
            width:      34,
            height:     34,
            background: "transparent",
            color:      "rgba(255,255,255,0.35)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(255,255,255,0.06)";
            el.style.color      = "rgba(255,255,255,0.70)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "transparent";
            el.style.color      = "rgba(255,255,255,0.35)";
          }}
        >
          <HelpCircle size={15} />
        </button>

        {/* Account avatar — neutral, not purple */}
        <button
          type="button"
          aria-label="Account menu"
          title={`${displayName} — click to sign out`}
          onClick={logout}
          className="ms-0.5 flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-150"
          style={{
            width:      32,
            height:     32,
            background: "rgba(255,255,255,0.08)",
            border:     "1px solid rgba(255,255,255,0.13)",
            color:      "rgba(255,255,255,0.65)",
            letterSpacing: "0.03em",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background  = "rgba(255,255,255,0.13)";
            el.style.borderColor = "rgba(255,255,255,0.20)";
            el.style.color       = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background  = "rgba(255,255,255,0.08)";
            el.style.borderColor = "rgba(255,255,255,0.13)";
            el.style.color       = "rgba(255,255,255,0.65)";
          }}
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
