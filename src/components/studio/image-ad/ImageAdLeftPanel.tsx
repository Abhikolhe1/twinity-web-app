"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, ChevronRight, Sparkles, AlertTriangle, Info } from "lucide-react";

import {
  STYLE_OPTIONS,
  USAGE_CHANNELS,
  type AspectRatio,
  type UsageChannel,
  type Duration,
  type Territory,
  type RefImage,
  type AdPricingResult,
} from "@/lib/studio/image-ad-pricing";
import type { FunnelCelebrity } from "@/lib/studio/studio-funnel-data";

import { CelebrityPicker } from "./CelebrityPicker";
import { ReferenceUpload } from "./ReferenceUpload";
import { LicenseConfig }   from "./LicenseConfig";

/* ── Channel risk ──────────────────────────────────────────────────── */
const CHANNEL_RISK: Record<UsageChannel, { level: "normal" | "warning"; tip: string }> = {
  "Social Media":         { level: "normal",  tip: "Standard social license included" },
  "Digital Advertising":  { level: "normal",  tip: "Digital placement included" },
  "Website & Web Banners":{ level: "normal",  tip: "Web usage included" },
  "Email Marketing":      { level: "normal",  tip: "Email distribution included" },
  "Print":                { level: "warning", tip: "High reach — extended license required" },
  "Broadcast":            { level: "warning", tip: "High reach — extended license required" },
};

const CHANNEL_SHORT: Record<UsageChannel, string> = {
  "Social Media":         "Social",
  "Digital Advertising":  "Digital Ads",
  "Website & Web Banners":"Website",
  "Email Marketing":      "Email",
  "Print":                "Print",
  "Broadcast":            "Broadcast",
};

/* ── Prompt strength ───────────────────────────────────────────────── */
function promptStrength(text: string, chips: number) {
  if (text.length < 20) return { label: "Add more detail", color: "var(--color-warning)", icon: false };
  if (text.length >= 80 || chips >= 2) return { label: "Strong", color: "var(--color-success)", icon: true };
  return { label: "Good", color: "var(--color-success)", icon: false };
}

/* ── Animated price total ──────────────────────────────────────────── */
function AnimatedTotal({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const [animKey, setAnimKey]  = useState(0);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      setAnimKey((k) => k + 1);
      setDisplay(value);
    }
  }, [value]);

  return (
    <span key={animKey} style={{ animation: "_totIn 200ms ease-out both", display: "inline-block" }}>
      {display}
    </span>
  );
}

/* ── Price card ────────────────────────────────────────────────────── */
function PriceCard({ pricing }: { pricing: AdPricingResult }) {
  const totalStr = pricing
    ? `SAR ${pricing.total.toLocaleString("en-SA", { minimumFractionDigits: 0 })}`
    : "Contact sales";

  const scopeAddon = pricing ? pricing.dur + pricing.ter + pricing.excl : 0;

  return (
    <>
      <style>{`
        @keyframes _totIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div
        style={{
          background:   "var(--color-surface-2)",
          border:       "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding:      "12px 14px",
          overflow:     "hidden",
        }}
      >
        {/* Total row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: pricing ? 10 : 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--color-text-muted)" }}>
            Estimated Price
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
            <AnimatedTotal value={totalStr} />
          </span>
        </div>

        {/* Breakdown */}
        {pricing && (
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              gap:           3,
              borderTop:     "1px solid var(--color-border)",
              paddingTop:    8,
            }}
          >
            {[
              { label: "Base generation",  val: `SAR ${pricing.base.toLocaleString()}` },
              ...(scopeAddon > 0
                ? [{ label: "License scope", val: `SAR ${scopeAddon.toLocaleString()}` }]
                : []),
              { label: "VAT 15%",          val: `SAR ${Math.round(pricing.vat).toLocaleString()}` },
            ].map(({ label, val }) => (
              <div
                key={label}
                style={{
                  display:            "flex",
                  justifyContent:     "space-between",
                  fontSize:           10,
                  color:              "var(--color-text-muted)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span>{label}</span>
                <span>{val}</span>
              </div>
            ))}
          </div>
        )}

        {!pricing && (
          <p style={{ fontSize: 10, color: "var(--color-text-muted)", margin: 0, marginTop: 4 }}>
            Perpetual license — contact for pricing
          </p>
        )}
      </div>
    </>
  );
}

/* ── Section header ────────────────────────────────────────────────── */
function SectionHeader({
  step,
  title,
  badge,
}: {
  step:  number;
  title: string;
  badge?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          width:          18,
          height:         18,
          borderRadius:   "50%",
          background:     "var(--color-surface-3)",
          border:         "1px solid var(--color-border)",
          fontSize:       9,
          fontWeight:     700,
          color:          "var(--color-text-muted)",
          flexShrink:     0,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(step).padStart(2, "0")}
      </span>
      <span
        style={{
          fontSize:      11,
          fontWeight:    700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color:         "var(--color-text-secondary)",
          flex:          1,
        }}
      >
        {title}
      </span>
      {badge}
    </div>
  );
}

/* ── Format specs ──────────────────────────────────────────────────── */
const FORMAT_SPECS: { id: AspectRatio; name: string; w: number; h: number }[] = [
  { id: "1:1",  name: "Feed",     w: 32, h: 32 },
  { id: "4:5",  name: "Portrait", w: 26, h: 33 },
  { id: "16:9", name: "Banner",   w: 46, h: 26 },
  { id: "9:16", name: "Story",    w: 22, h: 39 },
];

/* ── Suggestion chips ──────────────────────────────────────────────── */
const CHIPS = ["Brand ambassador", "Editorial lifestyle", "Luxury endorsement", "Street style"] as const;

/* ── Channel button ────────────────────────────────────────────────── */
function ChannelBtn({ ch, active, onClick }: { ch: UsageChannel; active: boolean; onClick: () => void }) {
  const [tip, setTip] = useState(false);
  const risk = CHANNEL_RISK[ch];

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          display:       "flex",
          alignItems:    "center",
          gap:           5,
          height:        30,
          paddingInline: 11,
          fontSize:      11,
          fontWeight:    active ? 600 : 400,
          borderRadius:  "var(--radius-full)",
          border:        `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
          background:    active ? "var(--color-accent-subtle)" : "var(--color-surface-2)",
          color:         active ? "var(--color-text-accent)" : "var(--color-text-muted)",
          cursor:        "pointer",
          transition:    "all var(--transition)",
          whiteSpace:    "nowrap",
        }}
      >
        {active && <Check size={10} strokeWidth={2.5} />}
        {CHANNEL_SHORT[ch]}
        <span
          onMouseEnter={() => setTip(true)}
          onMouseLeave={() => setTip(false)}
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", alignItems: "center", cursor: "help" }}
        >
          {risk.level === "warning"
            ? <AlertTriangle size={10} color="var(--color-warning)" />
            : <Info size={10} color="var(--color-text-muted)" />
          }
        </span>
      </button>
      {tip && (
        <div
          style={{
            position:         "absolute",
            bottom:           "calc(100% + 6px)",
            insetInlineStart: 0,
            background:       "var(--color-surface-3)",
            border:           `1px solid ${risk.level === "warning" ? "rgba(245,158,11,0.25)" : "var(--color-border)"}`,
            borderRadius:     "var(--radius-md)",
            padding:          "6px 10px",
            fontSize:         11,
            color:            risk.level === "warning" ? "var(--color-warning)" : "var(--color-text-secondary)",
            whiteSpace:       "nowrap",
            zIndex:           30,
            boxShadow:        "0 4px 16px rgba(0,0,0,0.6)",
            pointerEvents:    "none",
          }}
        >
          {risk.tip}
        </div>
      )}
    </div>
  );
}

/* ── Props ─────────────────────────────────────────────────────────── */
interface ImageAdLeftPanelProps {
  celebrity:           FunnelCelebrity | null;
  onSelectCelebrity:   (c: FunnelCelebrity) => void;
  prompt:              string;
  onPromptChange:      (v: string) => void;
  style:               string | null;
  onStyleChange:       (v: string | null) => void;
  ratio:               AspectRatio | null;
  onRatioChange:       (v: AspectRatio | null) => void;
  references:          RefImage[];
  onReferencesChange:  (v: RefImage[]) => void;
  channels:            UsageChannel[];
  onChannelsChange:    (v: UsageChannel[]) => void;
  duration:            Duration;
  onDurationChange:    (v: Duration) => void;
  territory:           Territory;
  onTerritoryChange:   (v: Territory) => void;
  exclusivity:         boolean;
  onExclusivityChange: (v: boolean) => void;
  acknowledged:        boolean;
  onAcknowledgeChange: (v: boolean) => void;
  pricing:             AdPricingResult;
  canGenerate:         boolean;
  hint:                string | null;
  onSubmit:            () => void;
  isSubmitting:        boolean;
  promptTextareaRef?:  React.RefObject<HTMLTextAreaElement | null>;
}

/* ── Component ─────────────────────────────────────────────────────── */
export function ImageAdLeftPanel({
  celebrity,
  onSelectCelebrity,
  prompt,
  onPromptChange,
  style,
  onStyleChange,
  ratio,
  onRatioChange,
  references,
  onReferencesChange,
  channels,
  onChannelsChange,
  duration,
  onDurationChange,
  territory,
  onTerritoryChange,
  exclusivity,
  onExclusivityChange,
  acknowledged,
  onAcknowledgeChange,
  pricing,
  canGenerate,
  hint,
  onSubmit,
  isSubmitting,
  promptTextareaRef,
}: ImageAdLeftPanelProps) {

  const [activeChips, setActiveChips] = useState<Set<string>>(new Set());
  const [refsOpen,    setRefsOpen]    = useState(false);

  const MAX_PROMPT = 600;
  const strength   = promptStrength(prompt, activeChips.size);

  function toggleChip(chip: string) {
    const next = new Set(activeChips);
    if (next.has(chip)) {
      next.delete(chip);
    } else {
      next.add(chip);
      const sep = prompt.trim() ? " " : "";
      onPromptChange((prompt + sep + chip).slice(0, MAX_PROMPT));
    }
    setActiveChips(next);
  }

  function toggleChannel(ch: UsageChannel) {
    if (channels.includes(ch)) {
      onChannelsChange(channels.filter((c) => c !== ch));
    } else {
      onChannelsChange([...channels, ch]);
    }
  }

  /* Section divider style */
  const S: React.CSSProperties = {
    paddingBlock:  20,
    paddingInline: 24,
    borderBottom:  "1px solid var(--color-border)",
  };

  return (
    <div
      style={{
        display:         "flex",
        flexDirection:   "column",
        overflow:        "hidden",
        borderInlineEnd: "1px solid var(--color-border)",
        background:      "var(--color-surface)",
      }}
      className="w-full md:w-[340px] md:min-w-[340px] lg:w-[380px] lg:min-w-[380px]"
    >
      {/* ── Scrollable form ─────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── 01 CELEBRITY ─────────────────────────────── */}
        <div id="image-ad-celebrity-section" style={S}>
          <SectionHeader step={1} title="Celebrity" />
          <CelebrityPicker selected={celebrity} onSelect={onSelectCelebrity} />
        </div>

        {/* ── 02 PROMPT ────────────────────────────────── */}
        <div id="image-ad-prompt-section" style={S}>
          <SectionHeader
            step={2}
            title="Prompt"
            badge={
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: strength.color, fontWeight: 600 }}>
                {strength.icon && <Check size={9} strokeWidth={3} />}
                {strength.label}
              </span>
            }
          />

          <textarea
            ref={promptTextareaRef}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value.slice(0, MAX_PROMPT))}
            placeholder="Describe the scene, mood, and how the celebrity appears in the ad…"
            rows={3}
            style={{
              width:        "100%",
              minHeight:    92,
              maxHeight:    160,
              padding:      "11px 13px",
              background:   "var(--color-surface-2)",
              border:       "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              color:        "var(--color-text)",
              fontSize:     13,
              lineHeight:   1.65,
              resize:       "vertical",
              outline:      "none",
              transition:   "border-color var(--transition), box-shadow var(--transition)",
              fontFamily:   "inherit",
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--color-accent)";
              (e.currentTarget as HTMLTextAreaElement).style.boxShadow   = "0 0 0 3px rgba(124,58,237,0.10)";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--color-border)";
              (e.currentTarget as HTMLTextAreaElement).style.boxShadow   = "none";
            }}
          />

          {/* Char count */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>
              {prompt.length}/{MAX_PROMPT}
            </span>
          </div>

          {/* Chips */}
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {CHIPS.map((chip) => {
              const on = activeChips.has(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleChip(chip)}
                  style={{
                    height:        26,
                    paddingInline: 10,
                    fontSize:      11,
                    fontWeight:    on ? 600 : 400,
                    borderRadius:  "var(--radius-full)",
                    border:        `1px solid ${on ? "var(--color-accent)" : "var(--color-border)"}`,
                    background:    on ? "var(--color-accent-subtle)" : "var(--color-surface-2)",
                    color:         on ? "var(--color-text-accent)" : "var(--color-text-muted)",
                    cursor:        "pointer",
                    transition:    "all var(--transition)",
                    whiteSpace:    "nowrap",
                  }}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 03 STYLE & FORMAT ────────────────────────── */}
        <div id="image-ad-style-section" style={S}>
          <SectionHeader step={3} title="Style &amp; Format" />

          {/* Visual style pills */}
          <p style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-muted)", marginBottom: 8, letterSpacing: "0.03em" }}>
            Visual style
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STYLE_OPTIONS.map((opt) => {
              const on = style === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onStyleChange(on ? null : opt.id)}
                  style={{
                    height:        30,
                    paddingInline: 12,
                    fontSize:      11,
                    fontWeight:    on ? 600 : 500,
                    borderRadius:  "var(--radius-full)",
                    border:        `1px solid ${on ? "var(--color-accent)" : "var(--color-border)"}`,
                    background:    on ? "var(--color-accent-subtle)" : "var(--color-surface-2)",
                    color:         on ? "var(--color-text-accent)" : "var(--color-text-secondary)",
                    cursor:        "pointer",
                    transition:    "all var(--transition)",
                    whiteSpace:    "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (!on) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border-strong)";
                  }}
                  onMouseLeave={(e) => {
                    if (!on) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
                  }}
                >
                  {opt.id.charAt(0).toUpperCase() + opt.id.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Format 2×2 grid */}
          <p style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-muted)", marginTop: 16, marginBottom: 8, letterSpacing: "0.03em" }}>
            Output format
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {FORMAT_SPECS.map((spec) => {
              const on = ratio === spec.id;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => onRatioChange(on ? null : spec.id)}
                  style={{
                    display:       "flex",
                    alignItems:    "center",
                    gap:           10,
                    padding:       "10px 12px",
                    borderRadius:  "var(--radius-md)",
                    border:        `1px solid ${on ? "var(--color-accent)" : "var(--color-border)"}`,
                    background:    on ? "var(--color-accent-subtle)" : "var(--color-surface-2)",
                    cursor:        "pointer",
                    transition:    "all var(--transition)",
                  }}
                  onMouseEnter={(e) => {
                    if (!on) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border-strong)";
                  }}
                  onMouseLeave={(e) => {
                    if (!on) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, flexShrink: 0 }}>
                    <div
                      style={{
                        width:        spec.w * 0.55,
                        height:       spec.h * 0.55,
                        borderRadius: 2,
                        background:   on ? "var(--color-accent)" : "var(--color-surface-3)",
                        border:       `1px solid ${on ? "rgba(124,58,237,0.5)" : "var(--color-border-strong)"}`,
                        transition:   "all var(--transition)",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "start" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: on ? "var(--color-text-accent)" : "var(--color-text)", lineHeight: 1 }}>
                      {spec.name}
                    </span>
                    <span style={{ fontSize: 9, color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {spec.id}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 04 CHANNELS & LICENSE ────────────────────── */}
        <div id="image-ad-license-section" style={S}>
          <SectionHeader step={4} title="License &amp; Channels" />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {USAGE_CHANNELS.map((ch) => (
              <ChannelBtn
                key={ch}
                ch={ch}
                active={channels.includes(ch)}
                onClick={() => toggleChannel(ch)}
              />
            ))}
          </div>

          <div
            style={{
              marginTop:    14,
              paddingTop:   14,
              borderTop:    "1px solid var(--color-border)",
            }}
          >
            <LicenseConfig
              duration={duration}
              onDurationChange={onDurationChange}
              territory={territory}
              onTerritoryChange={onTerritoryChange}
              exclusivity={exclusivity}
              onExclusivityChange={onExclusivityChange}
              pricing={pricing}
            />
          </div>
        </div>

        {/* ── 05 REFERENCES (accordion) ─────────────────── */}
        <div id="image-ad-references-section" style={{ ...S, borderBottom: "none" }}>
          <button
            type="button"
            onClick={() => setRefsOpen((v) => !v)}
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          8,
              width:        "100%",
              background:   "none",
              border:       "none",
              padding:      0,
              cursor:       "pointer",
              marginBottom: refsOpen ? 14 : 0,
            }}
          >
            <span style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              width:          18, height: 18,
              borderRadius:   "50%",
              background:     "var(--color-surface-3)",
              border:         "1px solid var(--color-border)",
              fontSize:       9,
              fontWeight:     700,
              color:          "var(--color-text-muted)",
              flexShrink:     0,
            }}>
              05
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", flex: 1, textAlign: "start" }}>
              References
            </span>
            <span style={{ fontSize: 9, color: "var(--color-text-muted)", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-full)", paddingInline: 7, paddingBlock: 2, flexShrink: 0 }}>
              Optional
            </span>
            <div style={{ flexShrink: 0, color: "var(--color-text-muted)" }}>
              {refsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </div>
          </button>

          {refsOpen && (
            <ReferenceUpload references={references} onChange={onReferencesChange} />
          )}
        </div>
      </div>

      {/* ── Sticky bottom bar ───────────────────────────── */}
      <div
        style={{
          flexShrink:    0,
          borderTop:     "1px solid var(--color-border)",
          padding:       "16px 24px",
          background:    "var(--color-surface)",
          display:       "flex",
          flexDirection: "column",
          gap:           10,
        }}
      >
        {/* Price card */}
        <PriceCard pricing={pricing} />

        {/* Acknowledgment */}
        <button
          type="button"
          role="checkbox"
          aria-checked={acknowledged}
          onClick={() => onAcknowledgeChange(!acknowledged)}
          style={{
            display:    "flex",
            alignItems: "flex-start",
            gap:        9,
            background: "none",
            border:     "none",
            padding:    0,
            cursor:     "pointer",
            textAlign:  "start",
          }}
        >
          <div
            style={{
              flexShrink:     0,
              width:          15,
              height:         15,
              borderRadius:   3,
              background:     acknowledged ? "var(--color-accent)" : "var(--color-surface-2)",
              border:         `1px solid ${acknowledged ? "var(--color-accent)" : "var(--color-border)"}`,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              marginTop:      1,
              transition:     "all var(--transition)",
            }}
          >
            {acknowledged && <Check size={9} color="#FFFFFF" strokeWidth={3} />}
          </div>
          <span style={{ fontSize: 10, color: "var(--color-text-muted)", lineHeight: 1.55 }}>
            I confirm my usage declaration is accurate and understand that usage
            beyond the declared scope is a license violation.
          </span>
        </button>

        {/* Generate button */}
        <button
          type="button"
          disabled={!canGenerate || isSubmitting}
          onClick={canGenerate ? onSubmit : undefined}
          style={{
            width:          "100%",
            height:         46,
            borderRadius:   "var(--radius-lg)",
            border:         canGenerate ? "none" : "1px solid var(--color-border)",
            background:     canGenerate ? "var(--gradient-brand)" : "var(--color-surface-2)",
            boxShadow:      canGenerate ? "var(--shadow-accent)" : "none",
            color:          canGenerate ? "#FFFFFF" : "var(--color-text-muted)",
            fontSize:       13,
            fontWeight:     700,
            cursor:         canGenerate ? "pointer" : "not-allowed",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            7,
            transition:     "background 200ms, box-shadow 200ms, filter var(--transition), transform var(--transition)",
          }}
          onMouseEnter={(e) => {
            if (canGenerate) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)";
          }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)"; }}
          onMouseDown={(e) => {
            if (canGenerate) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.985)";
          }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          {isSubmitting ? (
            <>
              <span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.30)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "_spin 600ms linear infinite", display: "inline-block", flexShrink: 0 }} />
              Generating&hellip;
            </>
          ) : (
            <>
              {canGenerate && <Sparkles size={14} />}
              {!celebrity ? "Select a celebrity to start" : "Generate Image Ad"}
            </>
          )}
        </button>

        {/* Hint */}
        {!canGenerate && hint && (
          <p style={{ textAlign: "center", fontSize: 10, color: "var(--color-text-muted)", margin: 0, animation: "_hintFade 150ms ease both" }}>
            ↑ {hint}
          </p>
        )}
      </div>

      <style>{`
        @keyframes _spin     { to { transform: rotate(360deg); } }
        @keyframes _hintFade { from { opacity:0; transform:translateY(3px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
