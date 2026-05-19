"use client";

/*
 ╔══════════════════════════════════════════════════════════════════════╗
 ║  TWINITY — ONE-PAGE COMING-SOON LANDING                              ║
 ╠══════════════════════════════════════════════════════════════════════╣
 ║  Design intent: Single viewport. No scroll. One action.              ║
 ║  User journey: Stranger → Curious → Convinced → Signs up            ║
 ║                                                                      ║
 ║  Layer stack:                                                        ║
 ║  z-0   UnicornScene WebGL background (full bleed)                    ║
 ║  z-1   Side mask / top mask / bottom mask / center backdrop          ║
 ║  z-10  Hero content                                                  ║
 ║  z-50  Navbar (fixed)                                                ║
 ╚══════════════════════════════════════════════════════════════════════╝
*/

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import UnicornHero from "@/components/unicorn-hero";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
function anim(delay: number, duration: number) {
  return { animation: `fadeUp ${duration}ms ${EASE} ${delay}ms both` } as React.CSSProperties;
}

export function MarketingHomeWithFunnel() {
  const [email, setEmail]         = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  // Lock the viewport — single-screen, no scroll
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const saved = {
      htmlOv: html.style.overflow, htmlH: html.style.height,
      bodyOv: body.style.overflow, bodyH: body.style.height,
    };
    html.style.overflow = "hidden"; html.style.height = "100vh";
    body.style.overflow = "hidden"; body.style.height = "100vh";
    return () => {
      html.style.overflow = saved.htmlOv; html.style.height = saved.htmlH;
      body.style.overflow = saved.bodyOv; body.style.height = saved.bodyH;
    };
  }, []);

  async function handleSubmit(e?: React.FormEvent | React.KeyboardEvent) {
    e?.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    // Replace with real API call when backend is ready
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#080808]"
      style={{ contain: "layout style" }}
    >

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FIX 1 — NAVBAR: fixed, 64px, contained logo
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav
        aria-label="Site navigation"
        className="fixed inset-x-0 top-0 z-50 flex h-[64px] items-center px-8"
        style={{
          background: "rgba(8,8,8,0.75)",
          backdropFilter: "blur(16px) saturate(160%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo — inline-flex, width auto, NOT stretched */}
        <Link
          href="/"
          aria-label="Twinity home"
          className="inline-flex shrink-0 items-center gap-[10px]"
          style={{ width: "auto" }}
        >
          <Logo height={36} />
        </Link>

        {/* Right side — pushed by margin-left auto */}
        <div className="ml-auto flex items-center gap-4">
          <span
            className="hidden text-[13px] whitespace-nowrap sm:block"
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            Already have access?
          </span>
          <Link
            href="/studio"
            className="inline-flex items-center justify-center whitespace-nowrap text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
            style={{
              height: 36,
              padding: "0 18px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 7,
              color: "rgba(255,255,255,0.70)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "rgba(255,255,255,0.08)";
              el.style.borderColor = "rgba(255,255,255,0.18)";
              el.style.color = "#F0F0F0";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "rgba(255,255,255,0.05)";
              el.style.borderColor = "rgba(255,255,255,0.10)";
              el.style.color = "rgba(255,255,255,0.70)";
            }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STATIC FALLBACK — renders in <16ms, no JS
          Shows instantly while Unicorn SDK loads.
          Unicorn fades in over it once ready.
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 65% 40%,
              rgba(124,58,237,0.18) 0%,
              rgba(124,58,237,0.06) 40%,
              transparent 70%
            ),
            radial-gradient(ellipse 50% 80% at 30% 60%,
              rgba(139,92,246,0.08) 0%,
              transparent 60%
            ),
            #080808
          `,
        }}
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          UNICORN SCENE — z-0, full bleed, immediate
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <UnicornHero lazyLoad={false} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FIX 2 — OVERLAYS: suppress letter matrix
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      {/* Layer 1 — Heavy side masks */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(90deg, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.70) 18%, rgba(8,8,8,0.10) 38%, rgba(8,8,8,0.10) 62%, rgba(8,8,8,0.70) 82%, rgba(8,8,8,0.97) 100%)",
        }}
      />

      {/* Layer 2 — Top mask (protect navbar) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 z-[1]"
        style={{
          height: 160,
          background:
            "linear-gradient(to bottom, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.40) 60%, transparent 100%)",
        }}
      />

      {/* Layer 3 — Bottom mask (ground the page) */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1]"
        style={{
          height: 220,
          background:
            "linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.60) 50%, transparent 100%)",
        }}
      />

      {/* Layer 4 — Center content backdrop (readable dark zone behind text) */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-[1]"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 600,
          background:
            "radial-gradient(ellipse at center, rgba(8,8,8,0.82) 0%, rgba(8,8,8,0.50) 45%, transparent 75%)",
          filter: "blur(20px)",
        }}
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FIX 5 — CONTENT: perfectly centred
          (absolute inset-0 fills parent, flex centers children)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
        style={{ padding: "80px 24px 80px" }}
      >
        <div className="mx-auto w-full max-w-[760px]">

          {/* ── FIX 3a: Badge ── */}
          <div
            className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-[6px]"
            style={{
              background: "rgba(8,8,8,0.70)",
              border: "1px solid rgba(139,92,246,0.35)",
              backdropFilter: "blur(8px)",
              ...anim(100, 600),
            }}
          >
            <span
              aria-hidden
              className="block size-[6px] shrink-0 rounded-full bg-[#8B5CF6]"
              style={{ animation: "badgePulse 2.5s ease-in-out infinite" }}
            />
            <span
              className="text-[12px] font-medium text-[#C4B5FD]"
              style={{ letterSpacing: "0.05em" }}
            >
              Licensed · Controlled · Trusted
            </span>
          </div>

          {/* ── FIX 3b: H1 — three-line structure ── */}
          <h1 style={{ maxWidth: 780, margin: "0 auto", marginBottom: 28, contain: "layout" }}>

            {/* Line 1 — the WHAT (receding) */}
            <span
              className="block"
              style={{
                fontSize: "clamp(18px, 2.5vw, 26px)",
                fontWeight: 400,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "-0.01em",
                marginBottom: 4,
                ...anim(200, 700),
              }}
            >
              The platform for
            </span>

            {/* Line 2 — the SUBJECT (dominant white) */}
            <span
              className="block text-white"
              style={{
                fontSize: "clamp(52px, 8vw, 92px)",
                fontWeight: 900,
                letterSpacing: "-0.05em",
                lineHeight: 0.92,
                textShadow: "0 2px 40px rgba(0,0,0,0.8)",
                ...anim(280, 700),
              }}
            >
              licensed celebrity
            </span>

            {/* Line 3 — the OUTCOME (purple gradient) */}
            <span
              className="block"
              style={{
                fontSize: "clamp(52px, 8vw, 92px)",
                fontWeight: 900,
                letterSpacing: "-0.05em",
                lineHeight: 0.92,
                background: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 50%, #C4B5FD 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                ...anim(360, 700),
              }}
            >
              video &amp; voice.
            </span>
          </h1>

          {/* ── FIX 3c: Subtitle ── */}
          <p
            className="mx-auto text-center"
            style={{
              maxWidth: 480,
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.70,
              color: "rgba(255,255,255,0.48)",
              margin: "20px auto 36px",
              ...anim(460, 600),
            }}
          >
            Saudi Arabia&apos;s first governed platform to license celebrity identity for
            commercial video and voice — approved, watermarked, and delivered.
          </p>

          {/* ── FIX 4: Email capture / success ── */}
          <div style={anim(560, 600)}>
            {submitted ? (
              <div
                className="mx-auto flex items-center justify-center gap-[10px]"
                aria-live="polite"
                style={{
                  color: "rgba(255,255,255,0.60)",
                  fontSize: 14,
                  justifyContent: "center",
                  marginBottom: 20,
                  animation: "fadeUp 400ms ease both",
                }}
              >
                <span style={{ color: "#22C55E", fontSize: 18 }}>✓</span>
                You&apos;re on the list — we&apos;ll reach out before launch.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mx-auto flex w-full flex-wrap gap-2"
                style={{ maxWidth: 460, marginBottom: 20 }}
                aria-label="Early access request"
              >
                <label htmlFor="early-access-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="early-access-email"
                  type="email"
                  name="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                  className="
                    h-[50px] min-w-[200px] flex-1 rounded-[10px] px-[18px]
                    text-[14px] text-[#F0F0F0]
                    placeholder:text-[rgba(255,255,255,0.35)]
                    backdrop-blur-[8px]
                    transition-all duration-200
                    focus:outline-none
                    focus:border-[#7C3AED]
                    focus:bg-[rgba(124,58,237,0.12)]
                    focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15),0_0_20px_rgba(124,58,237,0.10)]
                    disabled:opacity-60
                  "
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1.5px solid rgba(255,255,255,0.18)",
                    fontFamily: "var(--font-geist), sans-serif",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    inline-flex h-[50px] items-center justify-center gap-2
                    whitespace-nowrap rounded-[10px]
                    bg-[#7C3AED] text-[14px] font-semibold
                    tracking-[0.02em] text-white
                    transition-all duration-[180ms]
                    hover:bg-[#6D28D9]
                    hover:-translate-y-px
                    hover:shadow-[0_0_24px_rgba(124,58,237,0.40),0_4px_12px_rgba(0,0,0,0.30)]
                    active:translate-y-0
                    focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-[#7C3AED]
                    focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]
                    disabled:cursor-wait disabled:opacity-80
                  "
                  style={{
                    padding: "0 26px",
                    minHeight: 44,
                    minWidth: 44,
                    fontFamily: "var(--font-geist), sans-serif",
                  }}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin"
                        width="16" height="16"
                        viewBox="0 0 16 16" fill="none"
                        aria-hidden
                      >
                        <circle
                          cx="8" cy="8" r="6"
                          stroke="currentColor"
                          strokeOpacity="0.30"
                          strokeWidth="2"
                        />
                        <path
                          d="M8 2a6 6 0 0 1 6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      Requesting…
                    </>
                  ) : (
                    "Request Access"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Trust micro-copy */}
          <p
            className="text-[12px]"
            style={{
              color: "rgba(255,255,255,0.20)",
              letterSpacing: "0.06em",
              ...anim(640, 500),
            }}
          >
            Launching Q3 2026 &nbsp;·&nbsp; Saudi Arabia &amp; GCC &nbsp;·&nbsp; SAR Pricing
          </p>

        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FIX 6 — BOTTOM TRUST STRIP
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div
        className="absolute left-0 right-0 z-10 px-4 text-center"
        style={{ bottom: 24, ...anim(800, 500) }}
        aria-hidden
      >
        <p
          className="text-[11px] font-normal"
          style={{ color: "rgba(255,255,255,0.18)", letterSpacing: "0.10em" }}
        >
          Celebrity Licensed &nbsp;&middot;&nbsp; 9-Gate Approval &nbsp;&middot;&nbsp;
          Watermarked Previews &nbsp;&middot;&nbsp; VAT Compliant
        </p>
      </div>

    </div>
  );
}
