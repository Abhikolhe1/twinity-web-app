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

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ImageAdLeftPanel }  from "@/components/studio/image-ad/ImageAdLeftPanel";
import { ImageAdRightPanel } from "@/components/studio/image-ad/ImageAdRightPanel";
import { ImageAdSuccess }    from "@/components/studio/image-ad/ImageAdSuccess";

import { imageAdApi, jobApi } from "@/lib/api";
import {
  clearImageAdResumeDraft,
  readImageAdResumeDraft,
  type ImageAdResumeDraft,
} from "@/lib/request-recovery";

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
  const promptTextareaRef = useRef<HTMLTextAreaElement | null>(null);

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
  const [resumeDraft, setResumeDraft] = useState<ImageAdResumeDraft | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("resume") !== "1") return;

    const draft = readImageAdResumeDraft();
    if (!draft) return;

    setResumeDraft(draft);
    setCelebrity(draft.celebrity);
    setPrompt(draft.prompt);
    setStyle(draft.style ?? null);
    setRatio((draft.aspectRatio as AspectRatio) ?? null);
    setChannels(draft.channels as UsageChannel[]);
    setDuration((draft.duration as Duration) ?? "12 months");
    setTerritory((draft.territory as Territory) ?? "GCC");
    setExclusivity(Boolean(draft.exclusivity));
    setAcknowledged(true);
    setGenerateError(null);

    window.setTimeout(() => {
      document.getElementById("image-ad-prompt-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      promptTextareaRef.current?.focus();
    }, 120);
  }, []);

  function continueEditing() {
    document.getElementById("image-ad-prompt-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => promptTextareaRef.current?.focus(), 180);
  }

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
    (!!style || !!resumeDraft) &&
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
      const payload = {
        celebrityId:    celebrity.id,
        prompt:         prompt.trim(),
        style:          style ?? undefined,
        aspectRatio:    ratio  ?? undefined,
        channels,
        duration,
        territory,
        exclusivity,
        estimatedPrice: pricing?.total ?? 0,
      };

      const validation = await jobApi.validateSubmission({
        ...payload,
        productType: "image-ad",
        purpose: "Image ad generation",
        script: payload.prompt,
        resumeReferenceId: resumeDraft?.requestId ?? null,
      });
      if (!validation.data.valid) {
        throw new Error(validation.data.errors[0]?.message || "Please review the image ad brief before submitting.");
      }

      if (resumeDraft?.requestId) {
        await imageAdApi.retry(resumeDraft.requestId, payload);
      } else {
        await imageAdApi.generate(payload);
      }

      clearImageAdResumeDraft();
      setResumeDraft(null);
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
        background:     "#FFFFFF",
        /* Override dark CSS vars so all child components flip to light theme */
        "--color-bg-deep":        "#FFFFFF",
        "--color-surface":        "#FFFFFF",
        "--color-surface-2":      "#F8F7FF",
        "--color-surface-3":      "#F0EEFF",
        "--color-border":         "rgba(0,0,0,0.08)",
        "--color-border-strong":  "rgba(0,0,0,0.12)",
        "--color-border-accent":  "rgba(124,58,237,0.25)",
        "--color-text":           "#0F0A1E",
        "--color-text-secondary": "rgba(15,10,30,0.55)",
        "--color-text-muted":     "rgba(15,10,30,0.38)",
        "--color-text-accent":    "#7C3AED",
        "--color-accent-subtle":  "rgba(124,58,237,0.08)",
        "--color-accent-glow":    "rgba(124,58,237,0.12)",
        "--color-success":        "#16A34A",
        "--color-warning":        "#D97706",
        "--color-error":          "#DC2626",
        "--transition":           "150ms ease",
      } as React.CSSProperties}
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

      {resumeDraft && (
        <div
          style={{
            margin: "16px 24px 0",
            padding: "14px 18px",
            borderRadius: 14,
            border: "1px solid rgba(239,68,68,0.18)",
            background: "rgba(239,68,68,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#991B1B" }}>
              You&apos;re reviewing request #{resumeDraft.orderId}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, lineHeight: 1.6, color: "rgba(15,10,30,0.65)" }}>
              We restored the last submitted brief so you can continue from the validation-failed section.
              {resumeDraft.validationReason ? ` Last issue: ${resumeDraft.validationReason}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={continueEditing}
            style={{
              height: 38,
              paddingInline: 16,
              borderRadius: 10,
              border: "1px solid rgba(239,68,68,0.22)",
              background: "#FFFFFF",
              color: "#B91C1C",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Continue Editing
          </button>
        </div>
      )}

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
          promptTextareaRef={promptTextareaRef}
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
            color:         "#DC2626",
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
          <p style={{ fontSize: 15, fontWeight: 600, color: "#0F0A1E", margin: 0 }}>
            Generating your image ad…
          </p>
          <p style={{ fontSize: 13, color: "rgba(15,10,30,0.45)", margin: 0 }}>
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
