"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Film, Mic, Building2, Lock, ChevronRight, Shield, Clock, FileText } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { StudioTabbedFunnels } from "@/components/studio/StudioTabbedFunnels";
import type { StudioFunnelTab } from "@/components/studio/StudioTabbedFunnels";

/* ─── Data ─────────────────────────────────────────────────────────────── */

const SERVICES: {
  tab:       StudioFunnelTab;
  num:       string;
  badge:     string;
  Icon:      React.ElementType;
  title:     string;
  desc:      string;
  cta:       string;
  priceFrom: string;
}[] = [
  {
    tab:       "greeting",
    num:       "01",
    badge:     "B2C · Fast-track",
    Icon:      Mic,
    title:     "Personalized Greeting",
    desc:      "Birthday, congratulations, Ramadan and more — a personal video message from your favourite celebrity.",
    cta:       "Explore Greetings",
    priceFrom: "From SAR 299",
  },
  {
    tab:       "campaign",
    num:       "02",
    badge:     "Licensed",
    Icon:      Film,
    title:     "Advertisement Campaign",
    desc:      "Create professional licensed ads for your brand with celebrity endorsement and full rights management.",
    cta:       "Explore Ad Campaigns",
    priceFrom: "From SAR 9,999",
  },
  {
    tab:       "custom",
    num:       "03",
    badge:     "Enterprise",
    Icon:      Building2,
    title:     "Custom Campaign",
    desc:      "Have something unique in mind? Describe your idea and our team will review and create a tailored campaign.",
    cta:       "Submit Custom Request",
    priceFrom: "From SAR 8,000",
  },
];

const PUBLIC_STEPS = [
  { num: "01", title: "Choose a Service",               desc: "Greeting, Advertisement Campaign, or Custom" },
  { num: "02", title: "Select Template & See Samples",  desc: "Browse pre-approved templates with watermarked previews" },
  { num: "03", title: "Select a Celebrity",             desc: "Choose from our roster of licensed celebrities" },
  { num: "04", title: "Preview Sample (Watermarked)",   desc: "See exactly what your content will look like" },
];

const TRUST_ITEMS = [
  { Icon: Shield, text: "Celebrity-approved & rights-managed" },
  { Icon: FileText, text: "Immutable audit trail on every action" },
  { Icon: Clock, text: "1–3 day delivery" },
];

/* ─── Nav link ─────────────────────────────────────────────────────────── */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-[13px] transition-colors duration-150"
      style={{ color: "rgba(255,255,255,0.50)", textDecoration: "none" }}
      onMouseEnter={e => (e.currentTarget.style.color = "#F0F0F0")}
      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.50)")}
    >
      {children}
    </a>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */

export function MarketingHomeWithFunnel() {
  const [funnelOpen, setFunnelOpen]   = useState(false);
  const [funnelTab, setFunnelTab]     = useState<StudioFunnelTab>("greeting");
  const [sessionId, setSessionId]     = useState(0);

  function openFunnel(tab: StudioFunnelTab) {
    setFunnelTab(tab);
    setFunnelOpen(true);
    setSessionId(s => s + 1);
  }

  return (
    <>
      <StudioTabbedFunnels
        open={funnelOpen}
        onClose={() => setFunnelOpen(false)}
        initialTab={funnelTab}
        sessionId={sessionId}
      />

      <div style={{ minHeight: "100vh", background: "#080808", color: "#F0F0F0" }}>

        {/* ════════ NAVBAR ════════ */}
        <header
          className="sticky top-0 z-50 flex h-16 items-center justify-between px-6 md:px-11"
          style={{
            background: "rgba(8,8,8,0.92)",
            backdropFilter: "blur(16px) saturate(160%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Twinity home">
            <Logo height={30} />
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <NavLink href="#services">Services</NavLink>
            <NavLink href="#celebrities">Celebrities</NavLink>
            <NavLink href="#how">How It Works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#about">About</NavLink>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              style={{
                fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.50)",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8, padding: "6px 13px", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              EN
            </button>
            <Link
              href="/login"
              className="text-[13px] font-semibold transition-all duration-150"
              style={{
                color: "#F0F0F0", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)", borderRadius: 8,
                padding: "8px 16px", textDecoration: "none", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
              }}
            >
              Sign In / Register
            </Link>
          </div>
        </header>

        {/* ════════ PUBLIC BROWSING BANNER ════════ */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 md:px-11"
          style={{
            background: "rgba(124,58,237,0.08)",
            borderBottom: "1px solid rgba(124,58,237,0.18)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="text-[10.5px] font-bold tracking-widest uppercase"
              style={{
                background: "rgba(124,58,237,0.20)", border: "1px solid rgba(124,58,237,0.35)",
                color: "#C4B5FD", borderRadius: 6, padding: "3px 9px",
              }}
            >
              PUBLIC BROWSING (No Login Required)
            </span>
            <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>
              Explore. Preview. Get Inspired.
            </span>
          </div>
          <span className="hidden text-[12px] sm:block" style={{ color: "rgba(255,255,255,0.38)" }}>
            No Login Required to Browse &amp; Preview
          </span>
        </div>

        {/* ════════ HERO ════════ */}
        <section
          className="mx-auto grid max-w-[1200px] items-center gap-14 px-6 py-[72px] md:px-11 lg:grid-cols-[1.15fr_0.85fr]"
          style={{
            background: "radial-gradient(720px 380px at 82% -10%, rgba(124,58,237,0.10), transparent 70%)",
          }}
        >
          {/* Left: copy */}
          <div>
            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2">
              <span
                className="block size-[6px] shrink-0 rounded-full"
                style={{ background: "#7C3AED" }}
                aria-hidden
              />
              <span
                className="text-[11.5px] font-semibold tracking-[0.09em] uppercase"
                style={{ color: "#A78BFA" }}
              >
                Saudi-first · Digital Identity Licensing
              </span>
            </div>

            {/* H1 */}
            <h1
              className="mb-5 font-bold leading-[1.08] tracking-[-0.03em]"
              style={{ fontSize: "clamp(36px, 4.5vw, 54px)" }}
            >
              Bring Celebrity<br />
              Moments to Life<br />
              <span
                style={{
                  background: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 50%, #C4B5FD 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                with AI
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="mb-1 font-light leading-relaxed"
              style={{ maxWidth: 460, fontSize: 16, color: "rgba(255,255,255,0.60)" }}
            >
              Licensed. Controlled. Trusted.
            </p>
            <p
              className="mb-8 font-light leading-relaxed"
              style={{ maxWidth: 460, fontSize: 14.5, color: "rgba(255,255,255,0.42)" }}
            >
              Create personalized greetings and advertisements with your favourite celebrities.
            </p>

            {/* CTAs */}
            <div className="mb-9 flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-[11px] text-[14px] font-semibold text-white transition-all duration-[180ms] hover:-translate-y-0.5"
                style={{
                  background: "#7C3AED", border: "none", padding: "13px 24px",
                  boxShadow: "0 12px 26px -12px rgba(124,58,237,0.55)", cursor: "pointer",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 16px 32px -12px rgba(124,58,237,0.70)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 12px 26px -12px rgba(124,58,237,0.55)";
                }}
              >
                Explore the Services
              </button>
              <button
                onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-[11px] text-[14px] font-medium transition-all duration-[180ms]"
                style={{
                  background: "rgba(255,255,255,0.05)", color: "#F0F0F0",
                  border: "1px solid rgba(255,255,255,0.10)", padding: "13px 22px",
                  cursor: "pointer", fontFamily: "inherit",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.40)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)")}
              >
                See How It Works
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-7">
              {[
                { n: "3",       l: "Service types" },
                { n: "3-layer", l: "Approval & governance" },
                { n: "100%",    l: "Licensed & auditable" },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div
                      className="w-px"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    />
                  )}
                  <div>
                    <div
                      className="text-[26px] font-bold leading-none tracking-[-0.02em]"
                      style={{ color: "#F0F0F0" }}
                    >
                      {s.n}
                    </div>
                    <div
                      className="mt-1 text-[12px]"
                      style={{ color: "rgba(255,255,255,0.40)" }}
                    >
                      {s.l}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right: governed-workflow panel */}
          <div
            className="hidden rounded-[20px] p-6 lg:block"
            style={{
              background: "#161616",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.50)",
            }}
          >
            <div
              className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.10em]"
              style={{ color: "#A78BFA" }}
            >
              Governed workflow
            </div>
            <div
              className="mb-4 text-[17px] font-semibold leading-snug tracking-[-0.01em]"
              style={{ color: "#F0F0F0" }}
            >
              Every request, licensed and approved.
            </div>

            <div className="flex flex-col gap-2">
              {[
                "Configure license scope",
                "Validation & brand-safety",
                "Celebrity approval",
                "Watermarked preview",
              ].map((step, i) => {
                const lit = i < 3;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-[10px] px-3 py-[9px]"
                    style={{
                      background: lit ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
                      border:     lit ? "1px solid rgba(124,58,237,0.20)" : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-[7px] text-[11px] font-bold"
                      style={{
                        background: lit ? "#7C3AED" : "rgba(255,255,255,0.06)",
                        color:      lit ? "#fff"    : "rgba(255,255,255,0.30)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-[13px]"
                      style={{
                        color:      lit ? "#F0F0F0" : "rgba(255,255,255,0.30)",
                        fontWeight: lit ? 500 : 400,
                      }}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Lock seal */}
            <div
              className="mt-4 flex items-center gap-3 border-t pt-4"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-[9px]"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #3D1A6E)",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              </div>
              <div>
                <div className="text-[12.5px] font-semibold" style={{ color: "#F0F0F0" }}>
                  Generation is Locked
                </div>
                <div className="mt-0.5 text-[11px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                  Login and pay to generate your content
                </div>
              </div>
            </div>

            <div
              className="mt-4 pt-4 text-center text-[12.5px] font-semibold tracking-wide"
              style={{
                color: "#C4B5FD",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              Secure. Licensed. Controlled.
            </div>
          </div>
        </section>

        {/* ════════ SERVICES ════════ */}
        <section id="services" className="mx-auto max-w-[1200px] px-6 pb-12 md:px-11">
          {/* Section header */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div
                className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.10em]"
                style={{ color: "#A78BFA" }}
              >
                Choose your service
              </div>
              <h2
                className="text-[34px] font-semibold leading-[1.12] tracking-[-0.025em]"
                style={{ color: "#F0F0F0" }}
              >
                Three ways to create.
              </h2>
            </div>
            <p
              className="max-w-[290px] text-[13px] leading-[1.55]"
              style={{ color: "rgba(255,255,255,0.40)" }}
            >
              Pick a service to browse sample work and talent. No account needed until checkout.
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ tab, num, badge, Icon, title, desc, cta, priceFrom }) => (
              <button
                key={tab}
                type="button"
                onClick={() => openFunnel(tab)}
                className="relative flex min-h-[220px] cursor-pointer flex-col rounded-2xl p-5 text-left transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 20px 48px rgba(0,0,0,0.50), 0 0 0 1px rgba(124,58,237,0.22)";
                  e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                {/* Badge */}
                <span
                  className="absolute right-4 top-4 rounded-full text-[9.5px] font-bold uppercase tracking-[0.04em]"
                  style={{
                    background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)",
                    color: "#C4B5FD", padding: "3px 9px",
                  }}
                >
                  {badge}
                </span>

                {/* Number */}
                <div
                  className="mb-3 text-[11.5px] font-bold tracking-[0.04em]"
                  style={{ color: "rgba(255,255,255,0.22)" }}
                >
                  {num}
                </div>

                {/* Icon */}
                <div
                  className="mb-3.5 flex size-11 items-center justify-center rounded-[12px]"
                  style={{
                    background: "rgba(124,58,237,0.10)",
                    border: "1px solid rgba(124,58,237,0.15)",
                  }}
                >
                  <Icon size={20} style={{ color: "#8B5CF6" }} />
                </div>

                {/* Title */}
                <h3
                  className="mb-2 text-[18px] font-semibold leading-[1.22] tracking-[-0.01em]"
                  style={{ color: "#F0F0F0" }}
                >
                  {title}
                </h3>

                {/* Desc */}
                <p
                  className="grow text-[12.5px] font-light leading-[1.56]"
                  style={{ color: "rgba(255,255,255,0.42)" }}
                >
                  {desc}
                </p>

                {/* Footer */}
                <div className="mt-3.5 flex items-center justify-between">
                  <span
                    className="flex items-center gap-1 text-[12.5px] font-semibold"
                    style={{ color: "#8B5CF6" }}
                  >
                    {cta}
                    <ChevronRight size={13} aria-hidden />
                  </span>
                  <span
                    className="text-[11.5px] font-medium"
                    style={{ color: "rgba(255,255,255,0.32)" }}
                  >
                    {priceFrom}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p
            className="mt-5 text-center text-[12.5px]"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            Browse all services and samples. You&apos;ll need to log in to generate.
          </p>
        </section>

        {/* ════════ HOW IT WORKS ════════ */}
        <section id="how" className="mx-auto max-w-[1200px] px-6 pb-14 md:px-11">

          {/* Phase 1: Public browsing */}
          <div
            className="relative overflow-hidden rounded-[22px] p-9"
            style={{
              background: "#0D0D0D",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Purple glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: "radial-gradient(400px 200px at 90% 5%, rgba(124,58,237,0.14), transparent 70%)",
              }}
              aria-hidden
            />

            <h2
              className="relative mb-2 text-[22px] font-semibold leading-snug tracking-[-0.02em]"
              style={{ color: "#F0F0F0" }}
            >
              From browsing to delivery — one governed path.
            </h2>
            <p
              className="relative mb-6 text-[13px] font-light leading-relaxed"
              style={{ maxWidth: 540, color: "rgba(255,255,255,0.42)" }}
            >
              Guests can browse services, view samples, pick talent and see pricing.
              Login is required only at the wall — right before payment.
            </p>

            {/* Phase 1 label */}
            <div className="relative mb-3 inline-flex items-center gap-1.5">
              <span
                className="rounded-md text-[10.5px] font-bold uppercase tracking-[0.07em]"
                style={{
                  background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.28)",
                  color: "#A78BFA", padding: "4px 10px",
                }}
              >
                PUBLIC BROWSING — No Login Required
              </span>
            </div>

            {/* Steps row */}
            <div className="relative flex flex-wrap gap-2">
              {PUBLIC_STEPS.map((step, i) => (
                <div
                  key={i}
                  className="min-w-[130px] flex-1 rounded-[12px] p-3.5"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="mb-1.5 text-[11px] font-bold"
                    style={{ color: "#7C3AED" }}
                  >
                    {step.num}
                  </div>
                  <div
                    className="mb-1 text-[12.5px] font-semibold leading-snug"
                    style={{ color: "#F0F0F0" }}
                  >
                    {step.title}
                  </div>
                  <div
                    className="text-[11.5px] leading-snug"
                    style={{ color: "rgba(255,255,255,0.38)" }}
                  >
                    {step.desc}
                  </div>
                </div>
              ))}

              {/* Wall step */}
              <div
                className="min-w-[130px] flex-1 rounded-[12px] p-3.5"
                style={{
                  background: "rgba(124,58,237,0.10)",
                  border: "1px solid rgba(124,58,237,0.28)",
                }}
              >
                <div
                  className="mb-1.5 text-[11px] font-bold"
                  style={{ color: "#F59E0B" }}
                >
                  05
                </div>
                <div
                  className="mb-1 text-[12.5px] font-bold leading-snug"
                  style={{ color: "#F0F0F0" }}
                >
                  Log in / Register
                </div>
                <div
                  className="text-[11.5px] leading-snug"
                  style={{ color: "rgba(255,255,255,0.38)" }}
                >
                  The payment wall — required to generate
                </div>
              </div>
            </div>

            {/* Footnote */}
            <div
              className="relative mt-3.5 flex items-center gap-2 text-[12px]"
              style={{ color: "rgba(255,255,255,0.32)" }}
            >
              <Lock size={11} style={{ color: "#F59E0B", flexShrink: 0 }} aria-hidden />
              Non-sensitive selections are saved across the login wall — resume exactly where you left off.
            </div>
          </div>

        </section>

        {/* ════════ TRUST STRIP + IMPORTANT NOTES ════════ */}
        <section
          className="mx-auto max-w-[1200px] px-6 pb-14 pt-6 md:px-11"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Trust items */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            {TRUST_ITEMS.map(({ Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2">
                <Icon size={16} style={{ color: "#22C55E", flexShrink: 0 }} aria-hidden />
                <span
                  className="text-[13px]"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {text}
                </span>
              </div>
            ))}
            <span
              className="text-[13.5px] font-medium"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              Saudi-first. Governed by design.
            </span>
          </div>

          {/* Notes grid */}
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Important notes */}
            <div>
              <div
                className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.07em]"
                style={{ color: "rgba(255,255,255,0.32)" }}
              >
                IMPORTANT NOTES
              </div>
              <ul className="flex flex-col gap-2" style={{ listStyle: "none", padding: 0 }}>
                {[
                  "Samples are watermarked and for demonstration only.",
                  "No content is generated before payment and approval.",
                  "All celebrity likeness usage is licensed and governed.",
                ].map((note, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12.5px] leading-snug"
                    style={{ color: "rgba(255,255,255,0.42)" }}
                  >
                    <span
                      className="mt-1 shrink-0 text-[10px]"
                      style={{ color: "#7C3AED" }}
                      aria-hidden
                    >
                      •
                    </span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            {/* Before payment */}
            <div>
              <div
                className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.07em]"
                style={{ color: "rgba(255,255,255,0.32)" }}
              >
                WHAT YOU CAN DO BEFORE PAYMENT
              </div>
              <div className="flex flex-wrap gap-2">
                {["Browse Services", "View Templates", "See Celebrity Samples", "Check Prices"].map(item => (
                  <span
                    key={item}
                    className="rounded-md text-[12px]"
                    style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.52)", padding: "4px 10px",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* After payment */}
            <div>
              <div
                className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.07em]"
                style={{ color: "rgba(255,255,255,0.32)" }}
              >
                WHAT HAPPENS AFTER PAYMENT
              </div>
              <div className="flex flex-wrap gap-2">
                {["Secure Processing", "Approval Workflow", "Licensed Delivery", "Authorized Use Only"].map(item => (
                  <span
                    key={item}
                    className="rounded-md text-[12px]"
                    style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.52)", padding: "4px 10px",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════ BOTTOM TAGLINE ════════ */}
        <div
          className="py-5 text-center text-[11px] tracking-[0.10em]"
          style={{
            color: "rgba(255,255,255,0.16)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          Twinity ensures every piece of content is licensed, approved, and delivered securely.
        </div>
      </div>
    </>
  );
}
