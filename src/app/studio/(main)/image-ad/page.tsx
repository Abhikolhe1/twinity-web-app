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

import { imageAdApi } from "@/lib/api";

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
  const [generateError, setGenerateError] = useState<string | null>(null);

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
  async function handleSubmit() {
    if (!celebrity || !canGenerate) return;
    setIsSubmitting(true);
    setGenerateError(null);
    try {
      await imageAdApi.generate({
        celebrityId:    celebrity.id,
        prompt:         prompt.trim(),
        style:          style ?? undefined,
        aspectRatio:    ratio  ?? undefined,
        channels,
        duration,
        territory,
        exclusivity,
        estimatedPrice: pricing?.total ?? 0,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setGenerateError(msg);
    } finally {
      setIsSubmitting(false);
    }
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

      {/* ── Generation error ─────────────────────────────────────── */}
      {generateError && (
        <div
          style={{
            position:      "fixed",
            bottom:        24,
            left:          "50%",
            transform:     "translateX(-50%)",
            zIndex:        60,
            background:    "rgba(239,68,68,0.12)",
            border:        "1px solid rgba(239,68,68,0.30)",
            borderRadius:  12,
            padding:       "12px 20px",
            color:         "#FCA5A5",
            fontSize:      13,
            maxWidth:      480,
            textAlign:     "center",
          }}
        >
          {generateError}
        </div>
      )}

      {/* ── Generating overlay ───────────────────────────────────────── */}
      {isSubmitting && (
        <div
          style={{
            position:       "fixed",
            inset:          0,
            zIndex:         50,
            background:     "rgba(8,8,8,0.75)",
            backdropFilter: "blur(6px)",
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            16,
          }}
        >
          <div
            style={{
              width:        44,
              height:       44,
              borderRadius: "50%",
              border:       "3px solid rgba(124,58,237,0.20)",
              borderTop:    "3px solid #7C3AED",
              animation:    "spin 0.9s linear infinite",
            }}
          />
          <p style={{ fontSize: 15, fontWeight: 600, color: "#F0F0F0", margin: 0 }}>
            Generating your image ad…
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.40)", margin: 0 }}>
            This usually takes 15–30 seconds
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Success overlay ──────────────────────────────────────── */}
      {submitted && (
        <ImageAdSuccess
          onViewRequest={()  => router.push("/studio/requests")}
          onBackToStudio={() => router.push("/studio")}
        />
      )}
    </div>
  );
}
