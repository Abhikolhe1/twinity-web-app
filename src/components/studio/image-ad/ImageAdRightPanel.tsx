"use client";

import React, { useState } from "react";
import { Sparkles, Shield } from "lucide-react";

import {
  STYLE_OPTIONS,
  type AspectRatio,
  type AdPricingResult,
} from "@/lib/studio/image-ad-pricing";
import type { FunnelCelebrity } from "@/lib/studio/studio-funnel-data";

/* ── Format specs ─────────────────────────────────────────────────── */
const FORMAT_CARDS: {
  id:    AspectRatio;
  name:  string;
  /* visual proportions inside the card (relative to 200px wide) */
  ar:    number;   /* h/w ratio */
}[] = [
  { id: "1:1",  name: "Feed",     ar: 1      },
  { id: "4:5",  name: "Portrait", ar: 1.25   },
  { id: "16:9", name: "Banner",   ar: 0.5625 },
  { id: "9:16", name: "Story",    ar: 1.7778 },
];

/* ── Shimmer box ──────────────────────────────────────────────────── */
function Shimmer({ w, h }: { w: number; h: number }) {
  return (
    <>
      <style>{`
        @keyframes _shimmerSlide {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
      <div
        style={{
          width:        w,
          height:       h,
          borderRadius: "var(--radius-md)",
          background:   "linear-gradient(90deg, var(--color-surface-2) 25%, var(--color-surface-3) 50%, var(--color-surface-2) 75%)",
          backgroundSize: "200% 100%",
          animation:    "_shimmerSlide 1.8s ease-in-out infinite",
        }}
      />
    </>
  );
}

/* ── Single preview card ──────────────────────────────────────────── */
function PreviewCard({
  format,
  celebrity,
  styleName,
  isSelected,
  canGenerate,
  onSubmit,
}: {
  format:      typeof FORMAT_CARDS[number];
  celebrity:   FunnelCelebrity | null;
  styleName:   string | null;
  isSelected:  boolean;
  canGenerate: boolean;
  onSubmit:    () => void;
}) {
  const [hovered, setHovered] = useState(false);

  /* Preview box dimensions — max 180px wide */
  const maxW  = 140;
  const previewW = maxW;
  const previewH = Math.round(maxW * format.ar);

  return (
    <div
      style={{
        background:   "var(--color-surface)",
        border:       `1px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-xl)",
        overflow:     "hidden",
        display:      "flex",
        flexDirection:"column",
        transition:   "border-color var(--transition), box-shadow var(--transition)",
        boxShadow:    isSelected ? "0 0 20px rgba(124,58,237,0.12)" : "none",
        position:     "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card header */}
      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          padding:        "10px 14px 8px",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text)" }}>
          {format.name}
        </span>
        <span
          style={{
            fontSize:      9,
            fontWeight:    600,
            color:         isSelected ? "var(--color-text-accent)" : "var(--color-text-muted)",
            background:    isSelected ? "var(--color-accent-subtle)" : "var(--color-surface-2)",
            border:        `1px solid ${isSelected ? "var(--color-border-accent)" : "var(--color-border)"}`,
            borderRadius:  "var(--radius-full)",
            paddingInline: 6,
            paddingBlock:  2,
            transition:    "all var(--transition)",
          }}
        >
          {format.id}
        </span>
      </div>

      {/* Preview area */}
      <div
        style={{
          flex:           1,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "8px 14px 12px",
          minHeight:      120,
        }}
      >
        {celebrity ? (
          /* Celebrity + style info */
          <div
            style={{
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              gap:            8,
              width:          "100%",
            }}
          >
            {/* Aspect ratio preview box with celebrity inside */}
            <div
              style={{
                width:          previewW,
                height:         previewH,
                maxHeight:      180,
                borderRadius:   "var(--radius-md)",
                background:     "var(--color-surface-2)",
                border:         "1px solid var(--color-border)",
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                justifyContent: "center",
                gap:            6,
                overflow:       "hidden",
                position:       "relative",
              }}
            >
              {/* Celebrity avatar */}
              <div
                style={{
                  width:          36,
                  height:         36,
                  borderRadius:   "50%",
                  background:     "var(--gradient-brand)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       13,
                  fontWeight:     700,
                  color:          "#FFFFFF",
                  overflow:       "hidden",
                  position:       "relative",
                  boxShadow:      "0 0 16px rgba(139,92,246,0.25)",
                  flexShrink:     0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={celebrity.imageUrl}
                  alt={celebrity.name}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <span style={{ position: "relative", zIndex: 1 }}>{celebrity.name.slice(0, 1)}</span>
              </div>

              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text)", textAlign: "center", paddingInline: 8 }}>
                {celebrity.name.split(" ")[0]}
              </span>

              {styleName && (
                <span
                  style={{
                    fontSize:      9,
                    paddingInline: 7,
                    paddingBlock:  2,
                    background:    "var(--color-accent-subtle)",
                    border:        "1px solid var(--color-border-accent)",
                    borderRadius:  "var(--radius-full)",
                    color:         "var(--color-text-accent)",
                  }}
                >
                  {styleName}
                </span>
              )}

              {!styleName && (
                <Shimmer w={previewW - 20} h={8} />
              )}
            </div>
          </div>
        ) : (
          /* Empty shimmer state */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Shimmer w={previewW} h={Math.min(previewH, 160)} />
            <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>Select a celebrity</span>
          </div>
        )}
      </div>

      {/* Hover overlay — "Generate this format" */}
      {hovered && canGenerate && (
        <div
          style={{
            position:       "absolute",
            inset:          0,
            background:     "rgba(8,8,8,0.75)",
            backdropFilter: "blur(4px)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            animation:      "_overlayIn 120ms ease both",
          }}
        >
          <button
            type="button"
            onClick={onSubmit}
            style={{
              height:        36,
              paddingInline: 16,
              borderRadius:  "var(--radius-lg)",
              background:    "var(--gradient-brand)",
              border:        "none",
              color:         "#FFFFFF",
              fontSize:      12,
              fontWeight:    700,
              cursor:        "pointer",
              display:       "flex",
              alignItems:    "center",
              gap:           6,
              boxShadow:     "var(--shadow-accent)",
            }}
          >
            <Sparkles size={13} />
            Generate this format
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Props ─────────────────────────────────────────────────────────── */
interface ImageAdRightPanelProps {
  celebrity:   FunnelCelebrity | null;
  style:       string | null;
  ratio:       AspectRatio | null;
  pricing:     AdPricingResult;
  canGenerate: boolean;
  onSubmit:    () => void;
}

/* ── Main component ────────────────────────────────────────────────── */
export function ImageAdRightPanel({
  celebrity,
  style,
  ratio,
  pricing,
  canGenerate,
  onSubmit,
}: ImageAdRightPanelProps) {
  const styleLabel = STYLE_OPTIONS.find((o) => o.id === style)?.label ?? null;

  const totalStr = pricing
    ? `SAR ${pricing.total.toLocaleString("en-SA", { minimumFractionDigits: 0 })}`
    : "Contact pricing";

  return (
    <div
      style={{
        flex:          1,
        background:    "var(--color-bg-deep)",
        display:       "flex",
        flexDirection: "column",
        overflow:      "hidden",
      }}
    >
      {/* Canvas header */}
      <div
        style={{
          flexShrink:    0,
          height:        44,
          display:       "flex",
          alignItems:    "center",
          justifyContent:"space-between",
          paddingInline: 24,
          borderBottom:  "1px solid var(--color-border)",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>
          Preview Canvas
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {pricing && (
            <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>
              {totalStr}
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Shield size={10} color="var(--color-text-muted)" />
            <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>Licensed &middot; Governed</span>
          </div>
        </div>
      </div>

      {/* Grid canvas */}
      <div
        style={{
          flex:      1,
          overflowY: "auto",
          padding:   "24px",
          display:   "grid",
          gap:       16,
          alignContent: "start",
        }}
        className="grid-cols-1 xl:grid-cols-2"
      >
        {FORMAT_CARDS.map((format) => (
          <PreviewCard
            key={format.id}
            format={format}
            celebrity={celebrity}
            styleName={styleLabel}
            isSelected={ratio === format.id}
            canGenerate={canGenerate}
            onSubmit={onSubmit}
          />
        ))}
      </div>

      <style>{`
        @keyframes _overlayIn { from { opacity:0; } to { opacity:1; } }
      `}</style>
    </div>
  );
}
