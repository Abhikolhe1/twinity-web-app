"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { TimelineAnimation } from "@/components/timeline-animation";
import type { FunnelServiceId } from "@/lib/studio/studio-funnel-data";

/* ─── Dot-grid: 28px cells, white circles at 5.5% opacity ───────────── */
const DOT_GRID =
  "url(\"data:image/svg+xml,%3Csvg width='28' height='28' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.055)'/%3E%3C/svg%3E\")";

interface HeroAiInfrastructureProps {
  onOpenService: (id: FunnelServiceId) => void;
}

export const HeroAiInfrastructure = ({ onOpenService }: HeroAiInfrastructureProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-white"
      style={{ background: "#080808", paddingTop: 60 }}
    >
      {/* ── BG 1: dot grid ─────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: DOT_GRID, backgroundSize: "28px 28px" }}
      />

      {/* ── BG 2: top-edge purple hairline ─────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.35) 25%, rgba(139,92,246,0.55) 50%, rgba(124,58,237,0.35) 75%, transparent 100%)",
        }}
      />

      {/* ── BG 3: main radial glow — breathing float ───────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 rounded-full"
        style={{
          top: "18%",
          width: 960,
          height: 640,
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0.04) 45%, transparent 70%)",
          filter: "blur(80px)",
          animation: "ambientFloat 18s ease-in-out infinite",
        }}
      />

      {/* ── BG 4: secondary offset glow (upper-right) ──────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: "6%",
          right: "6%",
          width: 480,
          height: 360,
          background:
            "radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 60%)",
          filter: "blur(80px)",
          animation: "ambientFloat 26s ease-in-out infinite reverse",
        }}
      />

      {/* ── BG 5: bottom vignette ──────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{
          height: 320,
          background: "linear-gradient(to top, #0D0D0D 0%, transparent 100%)",
        }}
      />

      {/* ── Content ────────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center px-6 text-center"
        style={{ maxWidth: 960 }}
      >
        {/* Badge */}
        <TimelineAnimation
          timelineRef={sectionRef}
          animationNum={1}
          className="mb-9 inline-flex items-center gap-2 rounded-full border border-[rgba(124,58,237,0.25)] bg-[rgba(124,58,237,0.10)] px-[14px] py-[5px]"
        >
          <span
            aria-hidden
            className="block size-[6px] shrink-0 rounded-full bg-[#7C3AED]"
            style={{ animation: "badgePulse 2.4s ease-in-out infinite" }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: "#C4B5FD",
            }}
          >
            Licensed · Controlled · Trusted
          </span>
        </TimelineAnimation>

        {/* H1 — Geist 900, tight */}
        <TimelineAnimation
          timelineRef={sectionRef}
          as="h1"
          animationNum={2}
          className="mb-6"
          style={{
            fontSize: "clamp(52px, 8.5vw, 96px)",
            fontWeight: 900,
            lineHeight: 0.96,
            letterSpacing: "-0.04em",
          }}
        >
          <span className="block text-white">Twinity is</span>
          <span
            className="block"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #C4B5FD 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            coming.
          </span>
        </TimelineAnimation>

        {/* Subtitle */}
        <TimelineAnimation
          timelineRef={sectionRef}
          as="p"
          animationNum={3}
          className="mx-auto mb-11"
          style={{
            maxWidth: 480,
            fontSize: 18,
            fontWeight: 400,
            lineHeight: 1.65,
            color: "#A0A0A0",
          }}
        >
          License celebrity digital identity for video and voice.
          <br />
          Governed, approved, and delivered.
        </TimelineAnimation>

        {/* CTA row */}
        <TimelineAnimation
          timelineRef={sectionRef}
          animationNum={4}
          className="mb-10 flex flex-wrap items-center justify-center gap-[14px]"
        >
          {/* Primary */}
          <button
            type="button"
            onClick={() => onOpenService("greeting")}
            className="rounded-[8px] bg-[#7C3AED] px-8 py-[13px] text-[15px] font-semibold tracking-[0.01em] text-white transition-all duration-200 hover:-translate-y-[2px] hover:bg-[#6D28D9] hover:shadow-[0_10px_32px_rgba(124,58,237,0.40)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
          >
            Get Started
          </button>

          {/* Secondary */}
          <Link
            href="/how-it-works"
            className="rounded-[8px] border border-[rgba(255,255,255,0.08)] bg-transparent px-6 py-[13px] text-[15px] font-normal text-[rgba(255,255,255,0.45)] transition-all duration-200 hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[rgba(255,255,255,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,255,255,0.30)]"
          >
            How it Works
          </Link>
        </TimelineAnimation>

        {/* Trust row */}
        <TimelineAnimation
          timelineRef={sectionRef}
          as="p"
          animationNum={5}
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: "#606060",
            letterSpacing: "0.05em",
          }}
        >
          Secure Payments · Celebrity Licensed · Fast Delivery
        </TimelineAnimation>
      </div>
    </section>
  );
};
