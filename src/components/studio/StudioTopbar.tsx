"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, Search, LogOut, User } from "lucide-react";

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
  const [focused, setFocused]   = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name ?? "Studio User";
  const initials    = displayName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const currentLabel = PAGE_LABELS[pathname] ?? "Studio";
  const isHome = pathname === "/studio" || pathname === "/studio/";

  return (
    <header
      className="sticky top-0 z-20 flex h-[60px] shrink-0 items-center gap-4 px-6"
      style={{
        background:     "rgba(255,255,255,0.94)",
        backdropFilter: "blur(16px)",
        borderBottom:   "1px solid rgba(0,0,0,0.07)",
      }}
    >
      {/* Breadcrumb — hidden on dashboard home */}
      {!isHome && (
        <nav aria-label="Breadcrumb" className="flex shrink-0 items-center gap-2 text-[13px]">
          <span style={{ color: "rgba(15,10,30,0.35)" }}>Pages</span>
          <span aria-hidden style={{ color: "rgba(15,10,30,0.20)" }}>/</span>
          <span className="font-medium" style={{ color: "#0F0A1E" }}>{currentLabel}</span>
        </nav>
      )}

      {/* Search — centered */}
      <div className="flex flex-1 items-center justify-center">
        <div
          className="relative flex w-full max-w-[380px] items-center"
          style={{
            height:       36,
            borderRadius: 8,
            background:   focused ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.03)",
            border:       focused ? "1px solid rgba(124,58,237,0.45)" : "1px solid rgba(0,0,0,0.09)",
            boxShadow:    focused ? "0 0 0 3px rgba(124,58,237,0.10)" : "none",
            transition:   "all 180ms ease",
          }}
        >
          <Search
            size={13}
            className="pointer-events-none absolute left-3 shrink-0"
            style={{
              color:      focused ? "#7C3AED" : "rgba(15,10,30,0.28)",
              transition: "color 180ms ease",
            }}
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search celebrities, requests, licenses…"
            className="h-full w-full bg-transparent pl-8 pr-4 text-[13px] placeholder:text-[rgba(15,10,30,0.28)] focus:outline-none"
            style={{ color: "#0F0A1E" }}
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
          style={{ width: 34, height: 34, background: "transparent", color: "rgba(15,10,30,0.38)" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(0,0,0,0.05)";
            el.style.color      = "rgba(15,10,30,0.70)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "transparent";
            el.style.color      = "rgba(15,10,30,0.38)";
          }}
        >
          <Bell size={15} />
          <span
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              top: 6, right: 6, width: 5, height: 5,
              borderRadius: 9999,
              background:   "#7C3AED",
              boxShadow:    "0 0 0 1.5px #fff",
            }}
          />
        </button>

        {/* Help */}
        <button
          type="button"
          aria-label="Help"
          className="flex items-center justify-center rounded-lg transition-all duration-150"
          style={{ width: 34, height: 34, background: "transparent", color: "rgba(15,10,30,0.38)" }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(0,0,0,0.05)";
            el.style.color      = "rgba(15,10,30,0.70)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "transparent";
            el.style.color      = "rgba(15,10,30,0.38)";
          }}
        >
          <HelpCircle size={15} />
        </button>

        {/* Account avatar + dropdown */}
        <div className="relative ms-0.5" ref={menuRef}>
          <button
            type="button"
            aria-label="Account menu"
            onClick={() => setMenuOpen(v => !v)}
            className="flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-150"
            style={{
              width:         32,
              height:        32,
              background:    menuOpen ? "rgba(124,58,237,0.16)" : "rgba(124,58,237,0.10)",
              border:        "1px solid rgba(124,58,237,0.18)",
              color:         "#7C3AED",
              letterSpacing: "0.03em",
            }}
          >
            {initials}
          </button>

          {menuOpen && (
            <>
              {/* Click-outside overlay */}
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 top-9 z-40 w-48 rounded-xl overflow-hidden"
                style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
              >
                <div className="px-4 py-3 border-b border-black/6">
                  <p className="text-[13px] font-semibold truncate" style={{ color: '#0F0A1E' }}>{displayName}</p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(15,10,30,0.40)' }}>{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); logout() }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-left transition-colors"
                  style={{ color: '#DC2626' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
