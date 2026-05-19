/*
 * AUDIT — Image Ad Studio Page
 * ─────────────────────────────────────────────────────────────────────
 * A. REPLACED / DELETED:
 *    - ImageAdSidebar.tsx      (deleted — step-based sidebar)
 *    - ImageAdCanvas.tsx       (deleted — step-based canvas)
 *    - StepContent.tsx         (deleted — 5-step form components)
 *    - page.tsx                (this file — complete rewrite)
 *
 * B. KEPT UNTOUCHED:
 *    - ImageAdSuccess.tsx      (success overlay, reused as-is)
 *    - src/lib/studio/image-ad-pricing.ts  (calcAdImagePrice, types)
 *    - src/app/studio/(main)/requests/[requestId]/page.tsx
 *    - StudioHomeWithFunnel.tsx  (Studio Home card unchanged)
 *
 * C. ANIMATION LIBRARY:
 *    globals.css imports @import "tw-animate-css" — Tailwind animation
 *    utilities are available. Custom keyframes defined in globals.css:
 *    fadeUp, fade-in, funnelStepIn, shimmer, pulse-glow, badgePulse.
 *    All component-specific animations use scoped <style> blocks with
 *    CSS @keyframes — NO external animation library (no framer-motion).
 * ─────────────────────────────────────────────────────────────────────
 */

"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ImageAdLeftPanel }  from "@/components/studio/image-ad/ImageAdLeftPanel";
import { ImageAdRightPanel } from "@/components/studio/image-ad/ImageAdRightPanel";
import { ImageAdSuccess }    from "@/components/studio/image-ad/ImageAdSuccess";

import {
  calcAdImagePrice,
  type AspectRatio,
  type UsageChannel,
  type Duration,
  type Territory,
  type RefImage,
  type AdPricingResult,
} from "@/lib/studio/image-ad-pricing";

import type { FunnelCelebrity } from "@/lib/studio/studio-funnel-data";

export default function ImageAdPage() {
  const router = useRouter();

  /* ── Form state ─────────────────────────────────────────────────── */
  const [celebrity,    setCelebrity]    = useState<FunnelCelebrity | null>(null);
  const [prompt,       setPrompt]       = useState("");
  const [style,        setStyle]        = useState<string | null>(null);
  const [ratio,        setRatio]        = useState<AspectRatio | null>(null);
  const [references,   setReferences]   = useState<RefImage[]>([]);
  const [channels,     setChannels]     = useState<UsageChannel[]>([]);
  const [duration,     setDuration]     = useState<Duration>("12 months");
  const [territory,    setTerritory]    = useState<Territory>("GCC");
  const [exclusivity,  setExclusivity]  = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Derived ────────────────────────────────────────────────────── */
  const pricing: AdPricingResult = useMemo(
    () =>
      calcAdImagePrice({
        style:           style ?? undefined,
        aspectRatio:     ratio ?? undefined,
        usageChannels:   channels,
        licenseDuration: duration,
        territory,
        exclusivity,
      }),
    [style, ratio, channels, duration, territory, exclusivity],
  );

  const canGenerate =
    !!celebrity &&
    prompt.trim().length >= 10 &&
    !!style &&
    !!ratio &&
    channels.length > 0 &&
    acknowledged;

  const hint: string | null = (() => {
    if (!celebrity)                   return "Select a celebrity to continue";
    if (prompt.trim().length < 10)    return "Add an image description";
    if (!style)                       return "Choose a visual style";
    if (!ratio)                       return "Select an output format";
    if (channels.length === 0)        return "Select at least one usage channel";
    if (!acknowledged)                return "Confirm the license declaration above";
    return null;
  })();

  /* ── Handlers ───────────────────────────────────────────────────── */
  function handleSubmit() {
    if (!canGenerate || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        height:         "100%",
        overflow:       "hidden",
        background:     "var(--color-bg-deep)",
      }}
    >
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header
        style={{
          flexShrink:    0,
          height:        52,
          display:       "flex",
          alignItems:    "center",
          justifyContent:"space-between",
          paddingInline: 24,
          background:    "var(--color-surface)",
          borderBottom:  "1px solid var(--color-border)",
          zIndex:        10,
        }}
      >
        {/* Back link */}
        <button
          type="button"
          onClick={() => router.push("/studio")}
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        6,
            background: "none",
            border:     "none",
            padding:    0,
            cursor:     "pointer",
            color:      "var(--color-text-muted)",
            fontSize:   13,
            transition: "color var(--transition)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)"; }}
        >
          <ChevronLeft size={16} />
          Studio
        </button>

        {/* Center title */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>
            Image Ad
          </span>
          <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>·</span>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Licensed Celebrity Image
          </span>
        </div>

        {/* Celebrity indicator */}
        {celebrity ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width:          28,
                height:         28,
                borderRadius:   "50%",
                background:     "var(--gradient-brand)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       11,
                fontWeight:     700,
                color:          "#FFFFFF",
                flexShrink:     0,
                textTransform:  "uppercase",
              }}
            >
              {celebrity.name.slice(0, 1)}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text)" }}>
              {celebrity.name}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
            No celebrity selected
          </span>
        )}
      </header>

      {/* ── Two-panel body ───────────────────────────────────────── */}
      <div
        style={{
          flex:     1,
          display:  "flex",
          overflow: "hidden",
        }}
        className="flex-col md:flex-row"
      >
        <ImageAdLeftPanel
          celebrity={celebrity}
          onSelectCelebrity={setCelebrity}
          prompt={prompt}
          onPromptChange={setPrompt}
          style={style}
          onStyleChange={setStyle}
          ratio={ratio}
          onRatioChange={setRatio}
          references={references}
          onReferencesChange={setReferences}
          channels={channels}
          onChannelsChange={setChannels}
          duration={duration}
          onDurationChange={setDuration}
          territory={territory}
          onTerritoryChange={setTerritory}
          exclusivity={exclusivity}
          onExclusivityChange={setExclusivity}
          acknowledged={acknowledged}
          onAcknowledgeChange={setAcknowledged}
          pricing={pricing}
          canGenerate={canGenerate}
          hint={hint}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        <ImageAdRightPanel
          celebrity={celebrity}
          style={style}
          ratio={ratio}
          pricing={pricing}
          canGenerate={canGenerate}
          onSubmit={handleSubmit}
        />
      </div>

      {/* ── Success overlay ──────────────────────────────────────── */}
      {submitted && (
        <ImageAdSuccess
          onViewRequest={()  => router.push("/studio/requests/req-ad-001")}
          onBackToStudio={() => router.push("/studio")}
        />
      )}
    </div>
  );
}
