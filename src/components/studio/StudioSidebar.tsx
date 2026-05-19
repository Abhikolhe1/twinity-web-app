"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Key, Settings, Wand2 } from "lucide-react";

import Logo from "@/components/ui/Logo";
import { useCreditsOptional } from "@/contexts/CreditsContext";
import { MOCK_CREDIT_BALANCE } from "@/lib/credits";
import { useUser } from "@/contexts/UserContext";

const NAV = [
  { href: "/studio",           label: "Dashboard",  Icon: Home     },
  { href: "/studio/image-ad",  label: "Image Ad",   Icon: Wand2,   badge: "New" },
  { href: "/studio/requests",  label: "Requests",   Icon: FileText },
  { href: "/studio/licenses",  label: "Licenses",   Icon: Key      },
  { href: "/studio/settings",  label: "Settings",   Icon: Settings },
] as const;

export function StudioSidebar() {
  const pathname    = usePathname();
  const creditsCtx  = useCreditsOptional();
  const { user, logout } = useUser();

  /* Use context balance if available, fall back to mock constants */
  const creditBalance = creditsCtx?.balance ?? MOCK_CREDIT_BALANCE;
  const CREDITS       = creditBalance.available;
  const CREDITS_MAX   = creditBalance.total;
  const creditPct     = CREDITS_MAX > 0 ? CREDITS / CREDITS_MAX : 0;

  /* Semantic credits bar color based on remaining percentage */
  const creditBarColor =
    creditPct > 0.5  ? "rgba(139,92,246,0.70)"  :
    creditPct > 0.2  ? "rgba(245,158,11,0.75)"  :
                       "rgba(239,68,68,0.75)";

  const displayName = user?.name ?? "Studio User";
  const initials    = displayName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <aside
      className="relative z-30 flex w-full shrink-0 flex-col md:fixed md:inset-y-0 md:start-0 md:w-[240px]"
      style={{
        background:  "#0c0b12",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
      aria-label="Studio navigation"
    >
      {/* ── Logo area ── */}
      <div
        className="flex h-[68px] shrink-0 items-center border-b px-5"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <Link href="/studio" className="inline-flex items-center gap-3" aria-label="Twinity Studio home">
          <Logo height={30} />
          {/* FIX 10: Beta badge — clearly intentional, not a ghost element */}
          <span
            className="text-[9px] font-semibold uppercase"
            style={{
              background:    "rgba(124,58,237,0.15)",
              border:        "1px solid rgba(124,58,237,0.30)",
              color:         "#A78BFA",
              padding:       "2px 7px",
              borderRadius:  9999,
              letterSpacing: "0.10em",
            }}
          >
            Beta
          </span>
        </Link>
      </div>

      {/* ── Section label — desktop only ── */}
      <div
        className="hidden px-5 pb-2 pt-5 text-[10px] font-semibold uppercase md:block"
        style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em" }}
      >
        Navigation
      </div>

      {/* ── Desktop nav ── */}
      <nav className="hidden md:flex md:flex-col md:gap-0.5 md:px-3" aria-label="Main navigation">
        {NAV.map(({ href, label, Icon, ...rest }) => {
          const badge  = "badge" in rest ? (rest as { badge?: string }).badge : undefined;
          const active =
            href === "/studio"
              ? pathname === "/studio" || pathname === "/studio/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg transition-all duration-150"
              style={{
                height:     38,
                padding:    "0 12px",
                fontSize:   13,
                fontWeight: active ? 600 : 400,
                color:      active ? "#FFFFFF" : "rgba(255,255,255,0.50)",
                background: active ? "rgba(255,255,255,0.06)" : "transparent",
                borderLeft: active ? "2px solid #7C3AED" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (active) return;
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "rgba(255,255,255,0.04)";
                el.style.color      = "rgba(255,255,255,0.75)";
              }}
              onMouseLeave={(e) => {
                if (active) return;
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "transparent";
                el.style.color      = "rgba(255,255,255,0.50)";
              }}
            >
              <Icon
                size={14}
                style={{ color: active ? "#A78BFA" : "rgba(255,255,255,0.30)", flexShrink: 0 }}
              />
              <span className="flex-1">{label}</span>
              {badge && (
                <span
                  style={{
                    fontSize:      9,
                    fontWeight:    700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color:         "#A78BFA",
                    background:    "rgba(124,58,237,0.15)",
                    border:        "1px solid rgba(124,58,237,0.25)",
                    borderRadius:  9999,
                    padding:       "1px 6px",
                    lineHeight:    1.6,
                  }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Credits widget — desktop only ── */}
      <div
        className="mx-3 mb-3 hidden rounded-xl p-4 md:block"
        style={{
          background: "rgba(255,255,255,0.03)",
          border:     "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-medium text-white">Credits</p>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            {CREDITS} / {CREDITS_MAX}
          </p>
        </div>

        {/* FIX 6: Semantic fill — track 4px, track bg 0.10, fill color by percentage */}
        <div
          className="mt-3 overflow-hidden rounded-full"
          style={{ height: 4, background: "rgba(255,255,255,0.10)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round(creditPct * 100)}%`, background: creditBarColor }}
          />
        </div>
        <p className="mt-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          Available for new requests
        </p>

        {/* FIX 3: "Buy Credits" button — neutral, not purple */}
        <button
          type="button"
          className="mt-3 w-full rounded-lg text-[12px] font-medium transition-all duration-150"
          style={{
            height:     32,
            background: "rgba(255,255,255,0.06)",
            border:     "1px solid rgba(255,255,255,0.12)",
            color:      "rgba(255,255,255,0.65)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "rgba(255,255,255,0.09)";
            el.style.color      = "rgba(255,255,255,0.90)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "rgba(255,255,255,0.06)";
            el.style.color      = "rgba(255,255,255,0.65)";
          }}
        >
          Buy Credits
        </button>
      </div>

      {/* ── User row — desktop only ── */}
      <div
        className="hidden items-center gap-3 px-4 py-3.5 md:flex"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
          style={{
            background:    "rgba(255,255,255,0.08)",
            border:        "1px solid rgba(255,255,255,0.12)",
            color:         "rgba(255,255,255,0.65)",
            letterSpacing: "0.03em",
          }}
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium text-white">
            {displayName}
          </p>
          <p className="truncate text-[11px]" style={{ color: "rgba(255,255,255,0.30)" }}>
            {user?.email ?? ""}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          aria-label="Sign out"
          title="Sign out"
          className="shrink-0 rounded-md p-1.5 transition-colors duration-150"
          style={{ color: "rgba(255,255,255,0.25)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.60)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>

      {/* ── FIX 9: Mobile bottom tab bar — fixed, only on mobile ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex h-[60px] items-stretch justify-around md:hidden"
        style={{
          background:     "rgba(12,11,18,0.95)",
          backdropFilter: "blur(16px)",
          borderTop:      "1px solid rgba(255,255,255,0.07)",
        }}
        aria-label="Mobile navigation"
      >
        {NAV.map(({ href, label, Icon }) => {
          const active =
            href === "/studio"
              ? pathname === "/studio" || pathname === "/studio/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150"
              style={{ color: active ? "#8B5CF6" : "rgba(255,255,255,0.35)" }}
            >
              <Icon size={20} aria-hidden />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
