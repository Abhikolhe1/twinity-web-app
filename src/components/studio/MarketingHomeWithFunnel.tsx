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

const SAMPLE_VIDEOS: {
  badge:     string;
  occasion:  string;
  gradient:  string;
  duration:  string;
}[] = [
  {
    badge:     "Greeting",
    occasion:  "Birthday Surprise",
    gradient:  "linear-gradient(145deg, #1A0D2E 0%, #0D1A2E 50%, #0A0A0A 100%)",
    duration:  "0:32",
  },
  {
    badge:     "Ad Campaign",
    occasion:  "Ramadan Campaign",
    gradient:  "linear-gradient(145deg, #0D1A3A 0%, #0A1A14 50%, #0A0A0A 100%)",
    duration:  "0:45",
  },
  {
    badge:     "Greeting",
    occasion:  "Wedding Congratulations",
    gradient:  "linear-gradient(145deg, #1A0A2A 0%, #1A0D0D 50%, #0A0A0A 100%)",
    duration:  "0:28",
  },
  {
    badge:     "Ad Campaign",
    occasion:  "Product Launch",
    gradient:  "linear-gradient(145deg, #0A1A26 0%, #1A0D1A 50%, #0A0A0A 100%)",
    duration:  "1:00",
  },
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
      className="text-[13px] font-medium transition-colors duration-150"
      style={{ color: "rgba(15,10,30,0.50)", textDecoration: "none" }}
      onMouseEnter={e => (e.currentTarget.style.color = "#0F0A1E")}
      onMouseLeave={e => (e.currentTarget.style.color = "rgba(15,10,30,0.50)")}
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

      <div style={{ minHeight: "100vh", background: "#FFFFFF", color: "#0F0A1E" }}>

        {/* ════════ NAVBAR ════════ */}
        <header
          className="sticky top-0 z-50 h-16"
          style={{
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(16px) saturate(160%)",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6 md:px-11">
          <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Twinity home">
            <Logo dark height={32} />
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
                fontSize: 12, fontWeight: 600, color: "rgba(15,10,30,0.45)",
                background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.09)",
                borderRadius: 8, padding: "6px 13px", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              EN
            </button>
            <Link
              href="/login"
              className="text-[13px] font-semibold transition-all duration-150"
              style={{
                color: "#FFFFFF", background: "#7C3AED",
                border: "1px solid rgba(124,58,237,0.80)", borderRadius: 8,
                padding: "8px 16px", textDecoration: "none", whiteSpace: "nowrap",
                boxShadow: "0 1px 3px rgba(124,58,237,0.25)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#6D28D9";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#7C3AED";
              }}
            >
              Sign In / Register
            </Link>
          </div>
          </div>
        </header>

        {/* ════════ HERO ════════ */}
        <section
          className="mx-auto grid max-w-[1200px] items-center gap-14 px-6 py-[72px] md:px-11 lg:grid-cols-[1.15fr_0.85fr]"
          style={{
            background: "radial-gradient(720px 380px at 82% -10%, rgba(124,58,237,0.06), transparent 70%)",
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
                style={{ color: "#7C3AED" }}
              >
                Saudi-first · Digital Identity Licensing
              </span>
            </div>

            {/* H1 */}
            <h1
              className="mb-5 font-bold leading-[1.08] tracking-[-0.03em]"
              style={{ fontSize: "clamp(36px, 4.5vw, 54px)", color: "#0F0A1E" }}
            >
              Bring Celebrity<br />
              Moments to Life<br />
              <span
                className="text-gradient-brand"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 50%, #9333EA 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                }}
              >
                with AI
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="mb-1 font-light leading-relaxed"
              style={{ maxWidth: 460, fontSize: 16, color: "rgba(15,10,30,0.60)" }}
            >
              Licensed. Controlled. Trusted.
            </p>
            <p
              className="mb-8 font-light leading-relaxed"
              style={{ maxWidth: 460, fontSize: 14.5, color: "rgba(15,10,30,0.45)" }}
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
                  boxShadow: "0 12px 26px -12px rgba(124,58,237,0.50)", cursor: "pointer",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 16px 32px -12px rgba(124,58,237,0.65)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 12px 26px -12px rgba(124,58,237,0.50)";
                }}
              >
                Explore the Services
              </button>
              <button
                onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-[11px] text-[14px] font-medium transition-all duration-[180ms]"
                style={{
                  background: "#FFFFFF", color: "#0F0A1E",
                  border: "1px solid rgba(0,0,0,0.12)", padding: "13px 22px",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.40)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)")}
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
                      style={{ background: "rgba(0,0,0,0.10)" }}
                    />
                  )}
                  <div>
                    <div
                      className="text-[26px] font-bold leading-none tracking-[-0.02em]"
                      style={{ color: "#0F0A1E" }}
                    >
                      {s.n}
                    </div>
                    <div
                      className="mt-1 text-[12px]"
                      style={{ color: "rgba(15,10,30,0.42)" }}
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
              background: "#F8F7FF",
              border: "1px solid rgba(124,58,237,0.12)",
              boxShadow: "0 24px 60px rgba(124,58,237,0.08), 0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.10em]"
              style={{ color: "#7C3AED" }}
            >
              Governed workflow
            </div>
            <div
              className="mb-4 text-[17px] font-semibold leading-snug tracking-[-0.01em]"
              style={{ color: "#0F0A1E" }}
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
                      background: lit ? "rgba(124,58,237,0.08)" : "rgba(0,0,0,0.03)",
                      border:     lit ? "1px solid rgba(124,58,237,0.18)" : "1px solid rgba(0,0,0,0.07)",
                    }}
                  >
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-[7px] text-[11px] font-bold"
                      style={{
                        background: lit ? "#7C3AED" : "rgba(0,0,0,0.07)",
                        color:      lit ? "#fff"    : "rgba(15,10,30,0.30)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-[13px]"
                      style={{
                        color:      lit ? "#0F0A1E" : "rgba(15,10,30,0.35)",
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
              style={{ borderColor: "rgba(0,0,0,0.08)" }}
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-[9px]"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #3D1A6E)",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.30)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              </div>
              <div>
                <div className="text-[12.5px] font-semibold" style={{ color: "#0F0A1E" }}>
                  Generation is Locked
                </div>
                <div className="mt-0.5 text-[11px]" style={{ color: "rgba(15,10,30,0.42)" }}>
                  Login and pay to generate your content
                </div>
              </div>
            </div>

            <div
              className="mt-4 pt-4 text-center text-[12.5px] font-semibold tracking-wide"
              style={{
                color: "#6D28D9",
                borderTop: "1px solid rgba(0,0,0,0.07)",
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
                style={{ color: "#7C3AED" }}
              >
                Choose your service
              </div>
              <h2
                className="text-[34px] font-semibold leading-[1.12] tracking-[-0.025em]"
                style={{ color: "#0F0A1E" }}
              >
                Three ways to create.
              </h2>
            </div>
            <p
              className="max-w-[290px] text-[13px] leading-[1.55]"
              style={{ color: "rgba(15,10,30,0.45)" }}
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
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 20px 48px rgba(124,58,237,0.12), 0 0 0 1px rgba(124,58,237,0.22)";
                  e.currentTarget.style.borderColor = "rgba(124,58,237,0.30)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                }}
              >
                {/* Badge */}
                <span
                  className="absolute right-4 top-4 rounded-full text-[9.5px] font-bold uppercase tracking-[0.04em]"
                  style={{
                    background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)",
                    color: "#6D28D9", padding: "3px 9px",
                  }}
                >
                  {badge}
                </span>

                {/* Number */}
                <div
                  className="mb-3 text-[11.5px] font-bold tracking-[0.04em]"
                  style={{ color: "rgba(15,10,30,0.22)" }}
                >
                  {num}
                </div>

                {/* Icon */}
                <div
                  className="mb-3.5 flex size-11 items-center justify-center rounded-[12px]"
                  style={{
                    background: "rgba(124,58,237,0.08)",
                    border: "1px solid rgba(124,58,237,0.14)",
                  }}
                >
                  <Icon size={20} style={{ color: "#7C3AED" }} />
                </div>

                {/* Title */}
                <h3
                  className="mb-2 text-[18px] font-semibold leading-[1.22] tracking-[-0.01em]"
                  style={{ color: "#0F0A1E" }}
                >
                  {title}
                </h3>

                {/* Desc */}
                <p
                  className="grow text-[12.5px] font-light leading-[1.56]"
                  style={{ color: "rgba(15,10,30,0.50)" }}
                >
                  {desc}
                </p>

                {/* Footer */}
                <div className="mt-3.5 flex items-center justify-between">
                  <span
                    className="flex items-center gap-1 text-[12.5px] font-semibold"
                    style={{ color: "#7C3AED" }}
                  >
                    {cta}
                    <ChevronRight size={13} aria-hidden />
                  </span>
                  <span
                    className="text-[11.5px] font-medium"
                    style={{ color: "rgba(15,10,30,0.35)" }}
                  >
                    {priceFrom}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p
            className="mt-5 text-center text-[12.5px]"
            style={{ color: "rgba(15,10,30,0.32)" }}
          >
            Browse all services and samples. You&apos;ll need to log in to generate.
          </p>
        </section>

        {/* ════════ SAMPLE VIDEOS ════════ */}
        <section
          className="mx-auto max-w-[1200px] px-6 pb-16 md:px-11"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 48 }}
        >
          {/* Header */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div
                className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.10em]"
                style={{ color: "#7C3AED" }}
              >
                Sample Work
              </div>
              <h2
                className="text-[34px] font-semibold leading-[1.12] tracking-[-0.025em]"
                style={{ color: "#0F0A1E" }}
              >
                See what&apos;s possible.
              </h2>
            </div>
            <p
              className="max-w-[290px] text-[13px] leading-[1.55]"
              style={{ color: "rgba(15,10,30,0.45)" }}
            >
              Watermarked previews of real deliverable formats. Unlock the full unbranded version after checkout.
            </p>
          </div>

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_VIDEOS.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => openFunnel(v.badge === "Greeting" ? "greeting" : "campaign")}
                className="group relative flex flex-col overflow-hidden rounded-2xl text-left transition-all duration-200"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 20px 48px rgba(124,58,237,0.14), 0 0 0 1px rgba(124,58,237,0.22)";
                  e.currentTarget.style.borderColor = "rgba(124,58,237,0.28)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                }}
              >
                {/* Thumbnail area */}
                <div
                  className="relative flex h-[180px] w-full items-center justify-center"
                  style={{ background: v.gradient }}
                >
                  {/* Watermark overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    style={{ userSelect: "none" }}
                    aria-hidden
                  >
                    {[...Array(3)].map((_, row) =>
                      [...Array(3)].map((_, col) => (
                        <span
                          key={`${row}-${col}`}
                          className="absolute text-[9px] font-bold uppercase tracking-[0.14em]"
                          style={{
                            color: "rgba(255,255,255,0.07)",
                            transform: "rotate(-35deg)",
                            top: `${22 + row * 30}%`,
                            left: `${8 + col * 33}%`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          TWINITY SAMPLE
                        </span>
                      ))
                    )}
                  </div>

                  {/* Simulated waveform */}
                  <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end gap-[2px]" aria-hidden>
                    {[5,9,14,8,12,18,11,7,15,10,13,6,16,9,12,7,10,14,8,11,15,9,13,6,10,14,8,12,9,11,7,15].map((h, j) => (
                      <div
                        key={j}
                        className="flex-1 rounded-sm"
                        style={{
                          height: h,
                          background: "rgba(124,58,237,0.50)",
                          opacity: 0.7 + (j % 3) * 0.1,
                        }}
                      />
                    ))}
                  </div>

                  {/* Play button */}
                  <div
                    className="relative flex size-14 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
                    style={{
                      background: "rgba(124,58,237,0.90)",
                      boxShadow: "0 8px 32px rgba(124,58,237,0.55), 0 0 0 8px rgba(124,58,237,0.14)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <svg
                      width="18" height="18" viewBox="0 0 24 24" fill="#fff"
                      style={{ marginLeft: 3 }}
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>

                  {/* Duration badge */}
                  <div
                    className="absolute bottom-3 right-3 rounded-md text-[10.5px] font-semibold"
                    style={{
                      background: "rgba(0,0,0,0.55)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.90)",
                      padding: "2px 7px",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {v.duration}
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-col gap-1 p-4">
                  <span
                    className="self-start rounded-full text-[9.5px] font-bold uppercase tracking-[0.05em]"
                    style={{
                      background: "rgba(124,58,237,0.08)",
                      border: "1px solid rgba(124,58,237,0.18)",
                      color: "#6D28D9",
                      padding: "3px 9px",
                    }}
                  >
                    {v.badge}
                  </span>
                  <div
                    className="mt-1 text-[14px] font-semibold leading-snug tracking-[-0.01em]"
                    style={{ color: "#0F0A1E" }}
                  >
                    {v.occasion}
                  </div>
                  <div
                    className="mt-0.5 flex items-center gap-1 text-[12px]"
                    style={{ color: "#7C3AED" }}
                  >
                    <span>Try this format</span>
                    <ChevronRight size={11} aria-hidden />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Watermark note */}
          <div
            className="mt-5 flex items-center justify-center gap-2 text-[12px]"
            style={{ color: "rgba(15,10,30,0.32)" }}
          >
            <Lock size={11} style={{ color: "#F59E0B", flexShrink: 0 }} aria-hidden />
            Previews are watermarked and for demonstration only. Final deliveries are unlocked after payment.
          </div>
        </section>

        {/* ════════ HOW IT WORKS ════════ */}
        <section id="how" className="mx-auto max-w-[1200px] px-6 pb-14 md:px-11">

          {/* Phase 1: Public browsing */}
          <div
            className="relative overflow-hidden rounded-[22px] p-9"
            style={{
              background: "#F8F7FF",
              border: "1px solid rgba(124,58,237,0.12)",
              boxShadow: "0 4px 24px rgba(124,58,237,0.07)",
            }}
          >
            {/* Purple glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: "radial-gradient(400px 200px at 90% 5%, rgba(124,58,237,0.08), transparent 70%)",
              }}
              aria-hidden
            />

            <h2
              className="relative mb-2 text-[22px] font-semibold leading-snug tracking-[-0.02em]"
              style={{ color: "#0F0A1E" }}
            >
              From browsing to delivery — one governed path.
            </h2>
            <p
              className="relative mb-6 text-[13px] font-light leading-relaxed"
              style={{ maxWidth: 540, color: "rgba(15,10,30,0.50)" }}
            >
              Guests can browse services, view samples, pick talent and see pricing.
              Login is required only at the wall — right before payment.
            </p>

            {/* Phase 1 label */}
            <div className="relative mb-3 inline-flex items-center gap-1.5">
              <span
                className="rounded-md text-[10.5px] font-bold uppercase tracking-[0.07em]"
                style={{
                  background: "rgba(124,58,237,0.10)", border: "1px solid rgba(124,58,237,0.22)",
                  color: "#6D28D9", padding: "4px 10px",
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
                    background: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
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
                    style={{ color: "#0F0A1E" }}
                  >
                    {step.title}
                  </div>
                  <div
                    className="text-[11.5px] leading-snug"
                    style={{ color: "rgba(15,10,30,0.42)" }}
                  >
                    {step.desc}
                  </div>
                </div>
              ))}

              {/* Wall step */}
              <div
                className="min-w-[130px] flex-1 rounded-[12px] p-3.5"
                style={{
                  background: "rgba(124,58,237,0.07)",
                  border: "1px solid rgba(124,58,237,0.22)",
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
                  style={{ color: "#0F0A1E" }}
                >
                  Log in / Register
                </div>
                <div
                  className="text-[11.5px] leading-snug"
                  style={{ color: "rgba(15,10,30,0.45)" }}
                >
                  The payment wall — required to generate
                </div>
              </div>
            </div>

            {/* Footnote */}
            <div
              className="relative mt-3.5 flex items-center gap-2 text-[12px]"
              style={{ color: "rgba(15,10,30,0.38)" }}
            >
              <Lock size={11} style={{ color: "#F59E0B", flexShrink: 0 }} aria-hidden />
              Non-sensitive selections are saved across the login wall — resume exactly where you left off.
            </div>
          </div>

        </section>

        {/* ════════ TRUST STRIP + IMPORTANT NOTES ════════ */}
        <section
          className="mx-auto max-w-[1200px] px-6 pb-14 pt-6 md:px-11"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          {/* Trust items */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            {TRUST_ITEMS.map(({ Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2">
                <Icon size={16} style={{ color: "#22C55E", flexShrink: 0 }} aria-hidden />
                <span
                  className="text-[13px]"
                  style={{ color: "rgba(15,10,30,0.52)" }}
                >
                  {text}
                </span>
              </div>
            ))}
            <span
              className="text-[13.5px] font-medium"
              style={{ color: "rgba(15,10,30,0.28)" }}
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
                style={{ color: "rgba(15,10,30,0.35)" }}
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
                    style={{ color: "rgba(15,10,30,0.50)" }}
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
                style={{ color: "rgba(15,10,30,0.35)" }}
              >
                WHAT YOU CAN DO BEFORE PAYMENT
              </div>
              <div className="flex flex-wrap gap-2">
                {["Browse Services", "View Templates", "See Celebrity Samples", "Check Prices"].map(item => (
                  <span
                    key={item}
                    className="rounded-md text-[12px]"
                    style={{
                      background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.09)",
                      color: "rgba(15,10,30,0.55)", padding: "4px 10px",
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
                style={{ color: "rgba(15,10,30,0.35)" }}
              >
                WHAT HAPPENS AFTER PAYMENT
              </div>
              <div className="flex flex-wrap gap-2">
                {["Secure Processing", "Approval Workflow", "Licensed Delivery", "Authorized Use Only"].map(item => (
                  <span
                    key={item}
                    className="rounded-md text-[12px]"
                    style={{
                      background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.09)",
                      color: "rgba(15,10,30,0.55)", padding: "4px 10px",
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
            color: "rgba(15,10,30,0.25)",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          Twinity ensures every piece of content is licensed, approved, and delivered securely.
        </div>
      </div>
    </>
  );
}
