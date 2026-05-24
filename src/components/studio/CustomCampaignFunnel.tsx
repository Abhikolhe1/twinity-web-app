// CustomCampaignFunnel implements the B2B Licensed Advertisement / Commercial
// flow from Twinity BRD v3.1 (Section 8.1, 9, 10, 11) and User Journey Addendum
// (Section 6, Preview-to-Payment gate). It captures license scope + brief for
// enterprise campaigns without acting as an unrestricted AI studio.

/*
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AUDIT OF EXISTING FUNNELS (reference for this component)               ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  GreetingFunnel / CampaignFunnel structure:                              ║
 * ║  • Both export a `*WorkspaceProps` type { onClose, sessionId }.          ║
 * ║  • State is 100% local — no global store, no context.                   ║
 * ║  • sessionId increment triggers a useEffect that resets all local state. ║
 * ║  • Steps are numbered 1-N with a SIDEBAR array driving the left nav.     ║
 * ║  • Sidebar uses Horizon numbered circles:                                ║
 * ║      done=purple gradient, active=ring, future/locked=muted.             ║
 * ║  • Bottom action bar: glass background + gradient primary + ghost back.  ║
 * ║  • No real API calls — all data is mock / static from campaign-funnel-   ║
 * ║    data.ts (LicenseScope, LicenseChannel, estimateCampaignSubtotal, …).  ║
 * ║  • Buttons: gradient primary (horizonPrimaryStyle), ghost secondary.     ║
 * ║  • Step content is rendered with key={currentStep} to unmount/remount    ║
 * ║    on step change — no separate AnimatePresence / framer-motion.         ║
 * ║  • Modal shell: bg=#0A0812, dark glass header, rounded-xl.               ║
 * ║                                                                          ║
 * ║  Types / endpoints referenced:                                           ║
 * ║  • LicenseScope, LicenseChannel, LicenseDuration, LicenseTerritory,     ║
 * ║    LicenseExclusivity, LicenseSla from campaign-funnel-data.ts.          ║
 * ║  • estimateCampaignSubtotal(), withVat() from the same data file.        ║
 * ║  • No HTTP calls anywhere — submit is a mock action (setTimeout).        ║
 * ║  • CampaignFunnel uses "CUSTOM_CAMPAIGN" type via custom_commercial in   ║
 * ║    CAMPAIGN_TYPES; we extend that concept here as type="CUSTOM_CAMPAIGN" ║
 * ║    in the submitted payload shape.                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import {
  CAMPAIGN_CELEBRITIES,
  DEFAULT_LICENSE_SCOPE,
  estimateCampaignSubtotal,
  withVat,
} from "@/lib/studio/campaign-funnel-data";
import type {
  CampaignCelebrityFilter,
  LicenseChannel,
  LicenseDuration,
  LicenseExclusivity,
  LicenseScope,
  LicenseSla,
  LicenseTerritory,
} from "@/lib/studio/campaign-funnel-data";

/* ─── extended channel set for Custom Campaign ─────────────────────────── */
type CustomChannel = LicenseChannel | "X" | "OOH / Billboard" | "Internal Corporate" | "Other";

const ALL_CHANNELS: CustomChannel[] = [
  "Snapchat", "Instagram", "TikTok", "YouTube", "X",
  "Website", "TV", "OOH / Billboard", "Internal Corporate", "Other",
];

/* ─── campaign categories (BRD §11 restriction categories) ─────────────── */
const CATEGORIES = [
  "FMCG", "Telecom", "Banking & Finance", "Automotive",
  "Entertainment", "Real Estate", "Healthcare", "Regulated / Sensitive", "Other",
] as const;
type CampaignCategory = typeof CATEGORIES[number];

/* ─── Horizon button primitives (mirrors GreetingFunnel / CampaignFunnel) ─ */
const hPrimaryBtn =
  "inline-flex h-[44px] items-center justify-center rounded-xl px-5 text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px";
const hPrimaryStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
  boxShadow:  "0 8px 24px rgba(124,58,237,0.30)",
  border:     "none",
};
const hSecondaryBtn =
  "inline-flex h-[44px] items-center justify-center rounded-xl px-5 text-[13px] font-semibold transition-all duration-200";
const hSecondaryStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.04)",
  border:     "1px solid rgba(0,0,0,0.10)",
  color:      "rgba(15,10,30,0.60)",
};

/* ─── form input shared styles ──────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  background:   "rgba(0,0,0,0.04)",
  border:       "1px solid rgba(0,0,0,0.09)",
  borderRadius: 12,
  color:        "#0F0A1E",
  fontSize:     14,
};
const INPUT_CLS =
  "w-full px-4 py-3 text-base md:text-[14px] text-[#0F0A1E] placeholder:text-[rgba(15,10,30,0.30)] focus:outline-none transition-all duration-150 focus:border-[rgba(124,58,237,0.50)] focus:bg-[rgba(124,58,237,0.06)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]";

const LABEL_CLS = "block text-[13px] font-medium mb-2" as const;

/* ─── Sidebar step definitions ──────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Campaign Basics"     },
  { id: 2, label: "License Scope"       },
  { id: 3, label: "Creative Brief"      },
  { id: 4, label: "Review & Submit"     },
] as const;

/* ─── Indicative price band helper ─────────────────────────────────────── */
function indicativeBand(scope: LicenseScope, celebrity: string | null): string {
  const celPrice = CAMPAIGN_CELEBRITIES.find((c) => c.id === celebrity)?.priceFromSar ?? 0;
  const sub = estimateCampaignSubtotal("custom_commercial", celPrice, scope);
  const { total } = withVat(sub);
  // Give a ±20% band
  const lo = Math.round((total * 0.9) / 1000) * 1000;
  const hi = Math.round((total * 1.2) / 1000) * 1000;
  return `SAR ${lo.toLocaleString("en-SA")} – ${hi.toLocaleString("en-SA")}`;
}

/* ════════════════════════════════════════════════════════════════════════════
   STEP 1 — Campaign basics
   ════════════════════════════════════════════════════════════════════════════ */
interface Step1Props {
  campaignName: string; onCampaignName: (v: string) => void;
  brand: string;        onBrand: (v: string) => void;
  objective: string;    onObjective: (v: string) => void;
  category: CampaignCategory | ""; onCategory: (v: CampaignCategory) => void;
  budget: string;       onBudget: (v: string) => void;
  celebrityId: string | null; onCelebrity: (id: string) => void;
}
function Step1({ campaignName, onCampaignName, brand, onBrand, objective, onObjective,
  category, onCategory, budget, onBudget, celebrityId, onCelebrity }: Step1Props) {
  const [celFilter, setCelFilter] = useState<CampaignCelebrityFilter>("All");
  const filteredCelebs = useMemo(() =>
    celFilter === "All" ? CAMPAIGN_CELEBRITIES
      : CAMPAIGN_CELEBRITIES.filter((c) => c.filter === celFilter),
    [celFilter]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Left — form */}
      <div className="space-y-5">
        <div>
          <h2 className="font-display text-[22px] font-bold" style={{ letterSpacing: "-0.02em", color: "#0F0A1E" }}>
            Campaign Basics
          </h2>
          <p className="mt-1 text-[14px]" style={{ color: "rgba(15,10,30,0.45)" }}>
            Tell us about your brand and campaign goals.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>
              Campaign name <span style={{ color: "#8B5CF6" }}>*</span>
            </span>
            <input
              value={campaignName}
              onChange={(e) => onCampaignName(e.target.value)}
              placeholder="e.g. Ramadan 2026 Brand Awareness"
              className={INPUT_CLS}
              style={{ ...inputStyle, borderRadius: 12, padding: "10px 16px" }}
              required
            />
          </label>
          <label className="block">
            <span className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>
              Brand / company <span style={{ color: "#8B5CF6" }}>*</span>
            </span>
            <input
              value={brand}
              onChange={(e) => onBrand(e.target.value)}
              placeholder="e.g. Almarai, STC, Saudi Aramco"
              className={INPUT_CLS}
              style={{ ...inputStyle, borderRadius: 12, padding: "10px 16px" }}
              required
            />
          </label>
        </div>

        {/* Category chips */}
        <div>
          <p className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>
            Campaign category <span style={{ color: "#8B5CF6" }}>*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onCategory(cat)}
                className="rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all duration-150"
                style={{
                  background: category === cat ? "rgba(124,58,237,0.20)" : "rgba(0,0,0,0.04)",
                  border:     category === cat ? "1px solid rgba(124,58,237,0.40)" : "1px solid rgba(0,0,0,0.09)",
                  color:      category === cat ? "#7C3AED" : "rgba(15,10,30,0.45)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          {category === "Regulated / Sensitive" && (
            <p className="mt-2 rounded-lg px-3 py-2 text-[12px]"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.20)", color: "rgba(245,158,11,0.90)" }}>
              ⚠ Sensitive categories require additional compliance review before approval.
            </p>
          )}
        </div>

        {/* Objective */}
        <label className="block">
          <span className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>
            Campaign objective
          </span>
          <textarea
            value={objective}
            onChange={(e) => onObjective(e.target.value)}
            rows={2}
            placeholder="e.g. Drive brand recall and qualified installs among Saudi males 18-34"
            className={INPUT_CLS}
            style={{ ...inputStyle, borderRadius: 12, padding: "10px 16px", resize: "vertical" }}
          />
        </label>

        {/* Budget */}
        <label className="block">
          <span className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>
            Estimated production budget (SAR, optional)
          </span>
          <input
            type="number"
            value={budget}
            onChange={(e) => onBudget(e.target.value)}
            placeholder="e.g. 50000"
            className={INPUT_CLS}
            style={{ ...inputStyle, borderRadius: 12, padding: "10px 16px" }}
          />
        </label>

        {/* Celebrity selection */}
        <div>
          <p className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>
            Preferred talent
          </p>
          {/* Filter chips */}
          <div className="mb-3 flex flex-wrap gap-2">
            {(["All", "Music", "Entertainment", "Sports", "TV", "Business"] as CampaignCelebrityFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setCelFilter(f)}
                className="rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-150"
                style={{
                  background: celFilter === f ? "rgba(124,58,237,0.20)" : "rgba(0,0,0,0.04)",
                  border:     celFilter === f ? "1px solid rgba(124,58,237,0.40)" : "1px solid rgba(0,0,0,0.08)",
                  color:      celFilter === f ? "#7C3AED" : "rgba(15,10,30,0.40)",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="mb-3 rounded-lg px-3 py-2 text-[12px]"
            style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", color: "rgba(245,158,11,0.80)" }}>
            All bookings require celebrity/manager approval. Availability confirmed after brief review.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredCelebs.map((c) => {
              const on = celebrityId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCelebrity(c.id)}
                  className="flex flex-col items-center rounded-2xl p-4 text-center transition-all duration-200"
                  style={{
                    background: on ? "rgba(124,58,237,0.12)" : "rgba(0,0,0,0.04)",
                    border:     on ? "1px solid rgba(124,58,237,0.40)" : "1px solid rgba(0,0,0,0.08)",
                    boxShadow:  on ? "0 0 0 3px rgba(124,58,237,0.15)" : "none",
                  }}
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="size-16 rounded-full object-cover"
                      style={{
                        outline: on ? "2px solid #7C3AED" : "2px solid transparent",
                        outlineOffset: 2,
                      }}
                    />
                    {on && (
                      <span
                        className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
                      >✓</span>
                    )}
                  </div>
                  <p className="mt-2 text-[12px] font-semibold" style={{ color: "#0F0A1E" }}>{c.name}</p>
                  <p className="text-[11px]" style={{ color: "rgba(15,10,30,0.40)" }}>
                    From SAR {c.priceFromSar.toLocaleString("en-SA")}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right — info card */}
      <div className="hidden lg:block">
        <div
          className="sticky top-4 rounded-2xl p-5 space-y-4"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)" }}
        >
          <p className="text-[13px] font-bold" style={{ color: "#0F0A1E" }}>Licensed Commercial Request</p>
          <p className="text-[12px] leading-relaxed" style={{ color: "rgba(15,10,30,0.50)" }}>
            This is a governed identity licensing request — not an unrestricted AI studio. All campaigns are:
          </p>
          <ul className="space-y-2">
            {[
              "License-first: scope defined before production",
              "Approval-controlled: celebrity & manager sign-off required",
              "Escrow-ready: payment captured before delivery",
              "Audit-trailed: every state change logged",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-[12px]" style={{ color: "rgba(15,10,30,0.60)" }}>
                <span style={{ color: "#8B5CF6", flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="rounded-xl px-3 py-3 text-[11px]"
            style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", color: "rgba(15,10,30,0.45)", lineHeight: 1.6 }}>
            Sensitive categories (Finance, Healthcare, Regulated) require additional compliance review and may extend SLA timelines.
          </div>
          <div className="rounded-xl px-3 py-3 text-[11px]"
            style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", color: "rgba(15,10,30,0.45)", lineHeight: 1.6 }}>
            Final license is only active after approval + payment capture. No raw identity assets or model files are exported.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   STEP 2 — License scope & usage
   ════════════════════════════════════════════════════════════════════════════ */
const TERRITORIES: LicenseTerritory[] = ["Saudi Arabia", "GCC", "MENA", "Global"];
const DURATIONS:   LicenseDuration[]  = ["1 month", "3 months", "6 months", "1 year"];
const EXCLUSIVITIES: { id: LicenseExclusivity; label: string; desc: string }[] = [
  { id: "none",      label: "None",                 desc: "Non-exclusive usage across all brands" },
  { id: "category",  label: "Category exclusivity", desc: "Celebrity won't do same-category ads for 30 days" },
  { id: "brand",     label: "Brand exclusivity",    desc: "Dedicated to your brand for the license period" },
  { id: "territory", label: "Territory exclusivity", desc: "No competing ads in your territory" },
];
const SLAS: { id: LicenseSla; label: string; desc: string }[] = [
  { id: "standard", label: "Standard",  desc: "10–14 business days" },
  { id: "priority", label: "Priority",  desc: "5–7 business days (+12%)" },
  { id: "urgent",   label: "Rush",      desc: "2–3 business days (+28%)" },
];

interface Step2Props {
  scope: LicenseScope & { customChannels: CustomChannel[] };
  onScope: (s: LicenseScope & { customChannels: CustomChannel[] }) => void;
  celebrityId: string | null;
}
function Step2({ scope, onScope, celebrityId }: Step2Props) {
  function toggleChannel(ch: CustomChannel) {
    const has = scope.customChannels.includes(ch);
    onScope({
      ...scope,
      customChannels: has ? scope.customChannels.filter((x) => x !== ch) : [...scope.customChannels, ch],
    });
  }

  const priceBand = useMemo(() => indicativeBand(scope, celebrityId), [scope, celebrityId]);

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <div>
        <h2 className="font-display text-[22px] font-bold" style={{ letterSpacing: "-0.02em", color: "#0F0A1E" }}>
          License Scope &amp; Usage
        </h2>
        <p className="mt-1 text-[14px]" style={{ color: "rgba(15,10,30,0.45)" }}>
          Define where, how long, and under what terms the licensed content may be used.
        </p>
      </div>

      {/* Channels */}
      <div>
        <p className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>Distribution channels</p>
        <div className="flex flex-wrap gap-2">
          {ALL_CHANNELS.map((ch) => {
            const on = scope.customChannels.includes(ch);
            return (
              <button
                key={ch}
                type="button"
                onClick={() => toggleChannel(ch)}
                className="rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all duration-150"
                style={{
                  background: on ? "rgba(124,58,237,0.20)" : "rgba(0,0,0,0.04)",
                  border:     on ? "1px solid rgba(124,58,237,0.40)" : "1px solid rgba(0,0,0,0.09)",
                  color:      on ? "#7C3AED" : "rgba(15,10,30,0.45)",
                }}
              >
                {ch}
              </button>
            );
          })}
        </div>
      </div>

      {/* Territory */}
      <div>
        <p className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>Territory</p>
        <div className="flex flex-wrap gap-2">
          {TERRITORIES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onScope({ ...scope, territory: t })}
              className="rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all duration-150"
              style={{
                background: scope.territory === t ? "rgba(124,58,237,0.20)" : "rgba(0,0,0,0.04)",
                border:     scope.territory === t ? "1px solid rgba(124,58,237,0.40)" : "1px solid rgba(0,0,0,0.09)",
                color:      scope.territory === t ? "#7C3AED" : "rgba(15,10,30,0.45)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>License duration</p>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onScope({ ...scope, duration: d })}
              className="rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all duration-150"
              style={{
                background: scope.duration === d ? "rgba(124,58,237,0.20)" : "rgba(0,0,0,0.04)",
                border:     scope.duration === d ? "1px solid rgba(124,58,237,0.40)" : "1px solid rgba(0,0,0,0.09)",
                color:      scope.duration === d ? "#7C3AED" : "rgba(15,10,30,0.45)",
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Exclusivity */}
      <div>
        <p className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>Exclusivity</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXCLUSIVITIES.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => onScope({ ...scope, exclusivity: id })}
              className="flex flex-col items-start rounded-xl p-3 text-start transition-all duration-150"
              style={{
                background: scope.exclusivity === id ? "rgba(124,58,237,0.12)" : "rgba(0,0,0,0.04)",
                border:     scope.exclusivity === id ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <span className="text-[13px] font-semibold" style={{ color: scope.exclusivity === id ? "#7C3AED" : "rgba(15,10,30,0.65)" }}>
                {label}
              </span>
              <span className="mt-0.5 text-[11px]" style={{ color: "rgba(15,10,30,0.35)" }}>
                {desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SLA / Urgency */}
      <div>
        <p className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>Delivery SLA</p>
        <div className="flex flex-wrap gap-2">
          {SLAS.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => onScope({ ...scope, sla: id })}
              className="flex flex-col rounded-xl px-4 py-3 text-start transition-all duration-150"
              style={{
                background: scope.sla === id ? "rgba(124,58,237,0.12)" : "rgba(0,0,0,0.04)",
                border:     scope.sla === id ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(0,0,0,0.08)",
                minWidth:   120,
              }}
            >
              <span className="text-[13px] font-semibold" style={{ color: scope.sla === id ? "#7C3AED" : "rgba(15,10,30,0.65)" }}>{label}</span>
              <span className="mt-0.5 text-[11px]" style={{ color: "rgba(15,10,30,0.35)" }}>{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Indicative price band */}
      <div
        className="rounded-2xl px-5 py-4"
        style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.20)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium" style={{ color: "rgba(15,10,30,0.45)" }}>Indicative price band (incl. VAT)</p>
            <p className="mt-0.5 font-display text-[20px] font-bold" style={{ color: "#0F0A1E" }}>{priceBand}</p>
          </div>
          <div className="text-right text-[11px]" style={{ color: "rgba(15,10,30,0.30)", maxWidth: 160 }}>
            Range adjusts with territory, duration, exclusivity &amp; SLA.
          </div>
        </div>
        <p className="mt-3 text-[11px]" style={{ color: "rgba(15,10,30,0.35)", lineHeight: 1.6 }}>
          Final pricing and license activation occur after celebrity approval, compliance checks, and payment capture inside escrow. This figure is indicative only.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   STEP 3 — Creative brief & assets
   ════════════════════════════════════════════════════════════════════════════ */
interface Step3Props {
  message: string;    onMessage: (v: string) => void;
  script: string;     onScript: (v: string) => void;
  guidelines: string; onGuidelines: (v: string) => void;
}
function Step3({ message, onMessage, script, onScript, guidelines, onGuidelines }: Step3Props) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-[22px] font-bold" style={{ letterSpacing: "-0.02em", color: "#0F0A1E" }}>
          Creative Brief &amp; Assets
        </h2>
        <p className="mt-1 text-[14px]" style={{ color: "rgba(15,10,30,0.45)" }}>
          Your brief feeds celebrity/manager review. Be specific — it reduces revision cycles.
        </p>
      </div>

      {/* Validation / brand safety alert */}
      <div
        className="flex gap-3 rounded-xl px-4 py-3"
        style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)" }}
      >
        <span style={{ color: "#8B5CF6", fontSize: 16, flexShrink: 0, marginTop: 1 }}>🛡</span>
        <div className="text-[12px]" style={{ color: "rgba(15,10,30,0.55)", lineHeight: 1.6 }}>
          <strong style={{ color: "rgba(15,10,30,0.70)" }}>Validation &amp; Brand Safety: </strong>
          Requests are checked against prohibited categories, celebrity restrictions, and Twinity brand-safety policies.
          Some campaigns may be escalated to compliance review. Production only starts after all checks pass.
        </div>
      </div>

      {/* Primary message */}
      <label className="block">
        <span className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>
          Primary message / single-minded proposition <span style={{ color: "#8B5CF6" }}>*</span>
        </span>
        <textarea
          value={message}
          onChange={(e) => onMessage(e.target.value)}
          rows={2}
          maxLength={280}
          placeholder="e.g. 'STC gives you the fastest 5G — no compromise.'"
          className={INPUT_CLS}
          style={{ ...inputStyle, borderRadius: 12, padding: "12px 16px", resize: "vertical" }}
        />
        <p className="mt-1 text-end text-[11px]" style={{ color: "rgba(15,10,30,0.25)" }}>
          {message.length} / 280
        </p>
      </label>

      {/* Script / talking points */}
      <label className="block">
        <span className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>
          Script / talking points
        </span>
        <textarea
          value={script}
          onChange={(e) => onScript(e.target.value)}
          rows={5}
          placeholder="Provide a draft script, key talking points, or scene descriptions. The celebrity team will refine it subject to approval."
          className={INPUT_CLS}
          style={{ ...inputStyle, borderRadius: 12, padding: "12px 16px", resize: "vertical" }}
        />
      </label>

      {/* Brand guidelines */}
      <label className="block">
        <span className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>
          Brand guidelines &amp; reference links
        </span>
        <textarea
          value={guidelines}
          onChange={(e) => onGuidelines(e.target.value)}
          rows={2}
          placeholder="Paste Figma / Notion / Google Drive links to brand guidelines, logo packs, or reference media."
          className={INPUT_CLS}
          style={{ ...inputStyle, borderRadius: 12, padding: "12px 16px", resize: "vertical" }}
        />
      </label>

      {/* File upload areas */}
      <div>
        <p className={LABEL_CLS} style={{ color: "rgba(15,10,30,0.55)" }}>Asset uploads</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Brand logo (SVG / PNG)", hint: "Up to 20 MB" },
            { label: "Key visual / packshot",  hint: "JPG, PNG, WebP" },
            { label: "Script (PDF / DOCX)",    hint: "Up to 10 MB" },
            { label: "Campaign brief",          hint: "PDF" },
            { label: "Reference videos",        hint: "MP4, MOV, up to 200 MB" },
            { label: "Reference images",        hint: "Any format, up to 20 MB ea." },
          ].map(({ label, hint }) => (
            <button
              key={label}
              type="button"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl px-3 py-7 text-center transition-all duration-150 hover:border-[rgba(124,58,237,0.35)]"
              style={{
                background: "rgba(0,0,0,0.04)",
                border:     "1px dashed rgba(0,0,0,0.10)",
              }}
            >
              <span className="text-[20px]" aria-hidden>📎</span>
              <span className="mt-2 text-[12px] font-semibold" style={{ color: "rgba(15,10,30,0.60)" }}>{label}</span>
              <span className="mt-0.5 text-[11px]" style={{ color: "rgba(15,10,30,0.30)" }}>{hint}</span>
              <span className="mt-2 text-[11px] font-medium" style={{ color: "#8B5CF6" }}>Choose file</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px]" style={{ color: "rgba(15,10,30,0.30)", lineHeight: 1.5 }}>
          All assets are stored in Twinity&apos;s secure signed-URL vault. No raw identity or model files are accepted or generated here.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   STEP 4 — Review & submit
   ════════════════════════════════════════════════════════════════════════════ */
interface ReviewData {
  campaignName: string; brand: string; objective: string;
  category: CampaignCategory | ""; budget: string;
  celebrityId: string | null;
  scope: LicenseScope & { customChannels: CustomChannel[] };
  message: string; script: string; guidelines: string;
}
interface Step4Props extends ReviewData {
  confirmed: boolean; onConfirm: (v: boolean) => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
      <span className="text-[12px]" style={{ color: "rgba(15,10,30,0.40)" }}>{label}</span>
      <span className="text-right text-[13px] font-medium" style={{ color: "#0F0A1E" }}>{value || "—"}</span>
    </div>
  );
}

function Step4({ campaignName, brand, objective, category, budget, celebrityId,
  scope, message, guidelines, confirmed, onConfirm }: Step4Props) {
  const cel       = CAMPAIGN_CELEBRITIES.find((c) => c.id === celebrityId);
  const priceBand = indicativeBand(scope, celebrityId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-[22px] font-bold" style={{ letterSpacing: "-0.02em", color: "#0F0A1E" }}>
          Review &amp; Submit
        </h2>
        <p className="mt-1 text-[14px]" style={{ color: "rgba(15,10,30,0.45)" }}>
          Confirm your campaign details before we route it to the celebrity team for review.
        </p>
      </div>

      {/* Two-column summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Campaign basics + license */}
        <div className="rounded-2xl p-5" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}>
          <p className="mb-3 text-[12px] font-bold uppercase" style={{ color: "rgba(15,10,30,0.30)", letterSpacing: "0.10em" }}>
            Campaign
          </p>
          <SummaryRow label="Campaign name"    value={campaignName} />
          <SummaryRow label="Brand"            value={brand} />
          <SummaryRow label="Category"         value={category} />
          {objective && <SummaryRow label="Objective" value={objective.slice(0, 80) + (objective.length > 80 ? "…" : "")} />}
          {budget    && <SummaryRow label="Budget"    value={`SAR ${Number(budget).toLocaleString("en-SA")}`} />}
          <SummaryRow label="Preferred talent" value={cel?.name ?? "Not selected"} />

          <p className="mb-3 mt-5 text-[12px] font-bold uppercase" style={{ color: "rgba(15,10,30,0.30)", letterSpacing: "0.10em" }}>
            License Scope
          </p>
          <SummaryRow label="Channels"     value={scope.customChannels.join(", ") || "None selected"} />
          <SummaryRow label="Territory"    value={scope.territory} />
          <SummaryRow label="Duration"     value={scope.duration} />
          <SummaryRow label="Exclusivity"  value={scope.exclusivity === "none" ? "Non-exclusive" : scope.exclusivity} />
          <SummaryRow label="Delivery SLA" value={scope.sla} />
          <SummaryRow label="Indicative price" value={priceBand} />
        </div>

        {/* Commercial & governance summary */}
        <div className="rounded-2xl p-5" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)" }}>
          <p className="mb-3 text-[12px] font-bold uppercase" style={{ color: "rgba(139,92,246,0.80)", letterSpacing: "0.10em" }}>
            Commercial &amp; Governance
          </p>
          {[
            {
              icon: "🔒",
              title: "Payment via escrow",
              body: "Payment authorization and capture happen after approval — before production begins. No payment before all gates clear.",
            },
            {
              icon: "✅",
              title: "Celebrity / manager approval required",
              body: "Production does not start until the celebrity's management team reviews and approves the brief and license scope.",
            },
            {
              icon: "🚫",
              title: "No raw identity assets exported",
              body: "Twinity never exports raw model files, training data, or unmastered likenesses. Delivery is licensed final output only.",
            },
            {
              icon: "📋",
              title: "Full audit trail",
              body: "Every state change — request, approval, payment, delivery — is logged and immutable.",
            },
          ].map(({ icon, title, body }) => (
            <div key={title} className="mb-4 flex gap-3">
              <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "#0F0A1E" }}>{title}</p>
                <p className="mt-0.5 text-[12px]" style={{ color: "rgba(15,10,30,0.45)", lineHeight: 1.5 }}>{body}</p>
              </div>
            </div>
          ))}

          {message && (
            <div className="mt-4 rounded-xl px-3 py-3" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}>
              <p className="text-[11px] font-bold uppercase" style={{ color: "rgba(15,10,30,0.25)", letterSpacing: "0.08em" }}>Key message</p>
              <p className="mt-1 text-[13px]" style={{ color: "rgba(15,10,30,0.60)" }}>
                {message.slice(0, 120)}{message.length > 120 ? "…" : ""}
              </p>
            </div>
          )}
          {guidelines && (
            <div className="mt-3 rounded-xl px-3 py-3" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}>
              <p className="text-[11px] font-bold uppercase" style={{ color: "rgba(15,10,30,0.25)", letterSpacing: "0.08em" }}>Brand guidelines</p>
              <p className="mt-1 text-[12px]" style={{ color: "rgba(15,10,30,0.50)" }}>
                {guidelines.slice(0, 80)}{guidelines.length > 80 ? "…" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation checkbox */}
      <label
        className="flex cursor-pointer items-start gap-3 rounded-2xl p-4"
        style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.09)" }}
      >
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirm(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#7C3AED]"
        />
        <span className="text-[13px]" style={{ color: "rgba(15,10,30,0.60)", lineHeight: 1.6 }}>
          I confirm this brief is accurate and I understand that final approval is subject to Twinity policy, celebrity restrictions, brand-safety rules, and license scope. Payment capture occurs inside escrow after all gates clear.
        </span>
      </label>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SUCCESS STATE
   ════════════════════════════════════════════════════════════════════════════ */
function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div
        className="flex size-20 items-center justify-center rounded-full text-[36px]"
        style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.20), rgba(34,197,94,0.08))", border: "1px solid rgba(34,197,94,0.30)" }}
        aria-hidden
      >
        ✅
      </div>
      <h2 className="mt-6 font-display text-[24px] font-bold" style={{ letterSpacing: "-0.02em", color: "#0F0A1E" }}>
        Request Received
      </h2>
      <p className="mt-3 max-w-md text-[15px]" style={{ color: "rgba(15,10,30,0.55)", lineHeight: 1.6 }}>
        Your custom campaign request has been received. Our team and the celebrity manager will review the license and brief. We&apos;ll notify you when it&apos;s ready for approval and payment capture.
      </p>

      <div
        className="mt-6 max-w-sm rounded-2xl p-5 text-start"
        style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}
      >
        {[
          { step: "1", label: "Brief review", desc: "Twinity team & celebrity manager review (1–2 days)" },
          { step: "2", label: "License approval", desc: "Scope confirmed and countersigned" },
          { step: "3", label: "Payment capture", desc: "Escrow authorized — production begins" },
          { step: "4", label: "Delivery",        desc: "Licensed final output released to your portal" },
        ].map(({ step, label, desc }) => (
          <div key={step} className="mb-4 flex gap-3 last:mb-0">
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)", boxShadow: "0 2px 8px rgba(124,58,237,0.40)" }}
            >
              {step}
            </span>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "#0F0A1E" }}>{label}</p>
              <p className="text-[12px]" style={{ color: "rgba(15,10,30,0.40)" }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onClose} className={hSecondaryBtn} style={hSecondaryStyle}>
          Back to Studio Home
        </button>
        <button type="button" onClick={onClose} className={hPrimaryBtn} style={hPrimaryStyle}>
          View Request Details
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   CUSTOM CAMPAIGN FUNNEL WORKSPACE
   ════════════════════════════════════════════════════════════════════════════ */
export type CustomCampaignFunnelWorkspaceProps = {
  onClose: () => void;
  sessionId: number;
};

export function CustomCampaignFunnelWorkspace({ onClose, sessionId }: CustomCampaignFunnelWorkspaceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted,   setSubmitted]   = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [currentStep]);

  const router = useRouter();
  const [showSubmitToast, setShowSubmitToast] = useState(false);

  /* Step 1 */
  const [campaignName, setCampaignName] = useState("");
  const [brand,        setBrand]        = useState("");
  const [objective,    setObjective]    = useState("");
  const [category,     setCategory]     = useState<CampaignCategory | "">("");
  const [budget,       setBudget]       = useState("");
  const [celebrityId,  setCelebrityId]  = useState<string | null>(null);

  /* Step 2 */
  const [scope, setScope] = useState<LicenseScope & { customChannels: CustomChannel[] }>({
    ...DEFAULT_LICENSE_SCOPE,
    customChannels: ["Instagram", "YouTube"],
  });

  /* Step 3 */
  const [message,    setMessage]    = useState("");
  const [script,     setScript]     = useState("");
  const [guidelines, setGuidelines] = useState("");

  /* Step 4 */
  const [confirmed, setConfirmed] = useState(false);

  /* Reset on new session */
  useEffect(() => {
    setCurrentStep(1); setSubmitted(false);
    setCampaignName(""); setBrand(""); setObjective(""); setCategory(""); setBudget(""); setCelebrityId(null);
    setScope({ ...DEFAULT_LICENSE_SCOPE, customChannels: ["Instagram", "YouTube"] });
    setMessage(""); setScript(""); setGuidelines(""); setConfirmed(false);
  }, [sessionId]);

  /* Per-step validation */
  const canNext = useMemo(() => {
    if (currentStep === 1) return Boolean(campaignName.trim() && brand.trim() && category);
    if (currentStep === 2) return scope.customChannels.length > 0;
    if (currentStep === 3) return Boolean(message.trim());
    if (currentStep === 4) return confirmed;
    return true;
  }, [currentStep, campaignName, brand, category, scope.customChannels, message, confirmed]);

  function handleSubmit() {
    if (!confirmed) return;
    /* BRD: submit as type CUSTOM_CAMPAIGN (no generation API call) */
    console.info("[Twinity] CUSTOM_CAMPAIGN request payload:", {
      type: "CUSTOM_CAMPAIGN",
      campaignName, brand, objective, category, budget: budget ? Number(budget) : null,
      celebrity: CAMPAIGN_CELEBRITIES.find((c) => c.id === celebrityId),
      licenseScope: { ...scope },
      campaignBrief: { message, script, guidelines },
    });
    setSubmitted(true);
    setShowSubmitToast(true);
    const newId = `ord-${Date.now().toString(36)}`;
    setTimeout(() => {
      router.push(`/studio/requests/${newId}`);
    }, 1500);
  }

  /* ── Sidebar ── */
  const renderSidebar = () => (
    <nav
      className="hidden md:flex w-[200px] shrink-0 flex-col py-4"
      aria-label="Custom campaign steps"
      style={{ background: "#F8F7FF", borderRight: "1px solid rgba(0,0,0,0.08)" }}
    >
      <ul className="flex flex-col gap-0.5 px-2">
        {STEPS.map(({ id, label }) => {
          const active = id === currentStep;
          const done   = id < currentStep || submitted;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => { if (done && !submitted) setCurrentStep(id); }}
                disabled={id > currentStep}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-all duration-200 disabled:pointer-events-none"
                style={{
                  background: active ? "rgba(124,58,237,0.07)" : "transparent",
                  border:     active ? "1px solid rgba(124,58,237,0.18)" : "1px solid transparent",
                }}
              >
                <span
                  className="flex shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
                  style={{
                    width:      28, height: 28,
                    background: done ? "linear-gradient(135deg, #7C3AED, #5B21B6)" : active ? "rgba(124,58,237,0.15)" : "rgba(0,0,0,0.04)",
                    border:     done ? "none" : active ? "2px solid #7C3AED" : "1px solid rgba(0,0,0,0.09)",
                    color:      done ? "#FFFFFF" : active ? "#7C3AED" : "rgba(15,10,30,0.25)",
                    boxShadow:  done ? "0 4px 12px rgba(124,58,237,0.35)" : "none",
                  }}
                >
                  {done && !active ? "✓" : id}
                </span>
                <span
                  className="min-w-0 flex-1 truncate text-[13px]"
                  style={{
                    fontWeight: active ? 600 : 400,
                    color: active ? "#0F0A1E" : done ? "rgba(15,10,30,0.50)" : "rgba(15,10,30,0.35)",
                  }}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  /* ── Bottom action bar ── */
  const renderFooter = () => (
    <div
      className="flex shrink-0 items-center gap-3 px-4 py-3 md:h-16 md:justify-between md:py-0 md:px-6"
      style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(0,0,0,0.08)" }}
    >
      {/* Summary — desktop only */}
      <p className="hidden md:block min-w-0 flex-1 truncate text-[13px]" style={{ color: "rgba(15,10,30,0.35)" }}>
        {campaignName || "Custom Campaign"}{brand ? ` · ${brand}` : ""}{category ? ` · ${category}` : ""}
      </p>
      {/* Buttons — full-width on mobile */}
      <div className="flex w-full items-center gap-2 md:w-auto md:shrink-0">
        <button
          type="button"
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          disabled={currentStep <= 1}
          className="flex h-12 w-12 shrink-0 md:h-[44px] md:w-auto md:px-5 items-center justify-center rounded-xl text-[13px] font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-30"
          style={hSecondaryStyle}
        >
          <span className="md:hidden">←</span>
          <span className="hidden md:inline">← Back</span>
        </button>
        {currentStep < 4 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canNext}
            className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40"
            style={hPrimaryStyle}
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!confirmed}
            className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40"
            style={hPrimaryStyle}
          >
            Submit Campaign
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {/* Submit success toast */}
      {showSubmitToast && (
        <div style={{
          position: "fixed", top: 24, insetInlineEnd: 24, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 12,
          background: "#FFFFFF", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 12,
          padding: "14px 18px", boxShadow: "0 0 24px rgba(34,197,94,0.12), 0 8px 32px rgba(0,0,0,0.6)",
        }}>
          <CheckCircle2 size={20} color="#16A34A" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F0A1E" }}>
              Request submitted successfully
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(15,10,30,0.45)", marginTop: 2 }}>
              Redirecting to your request…
            </p>
          </div>
        </div>
      )}
      {renderSidebar()}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col" style={{ background: "#FFFFFF" }}>
        {/* Mobile step indicator */}
        {!submitted && (
          <div
            className="md:hidden shrink-0 px-4 pb-2.5 pt-3"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[13px] font-medium" style={{ color: "#0F0A1E" }}>
                Step {currentStep} of {STEPS.length}
              </span>
              <span className="text-[12px]" style={{ color: "rgba(15,10,30,0.45)" }}>
                {STEPS.find((s) => s.id === currentStep)?.label ?? ""}
              </span>
            </div>
            <div
              className="h-[2px] overflow-hidden rounded-full"
              style={{ background: "rgba(0,0,0,0.09)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round((currentStep / STEPS.length) * 100)}%`,
                  background: "#7C3AED",
                }}
              />
            </div>
          </div>
        )}

        {submitted ? (
          <div className="flex min-h-0 flex-1 overflow-y-auto">
            <SuccessState onClose={onClose} />
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
              <div key={currentStep} className="funnel-step-animate">
                {currentStep === 1 && (
                  <Step1
                    campaignName={campaignName} onCampaignName={setCampaignName}
                    brand={brand}              onBrand={setBrand}
                    objective={objective}      onObjective={setObjective}
                    category={category}        onCategory={setCategory}
                    budget={budget}            onBudget={setBudget}
                    celebrityId={celebrityId}  onCelebrity={setCelebrityId}
                  />
                )}
                {currentStep === 2 && (
                  <Step2 scope={scope} onScope={setScope} celebrityId={celebrityId} />
                )}
                {currentStep === 3 && (
                  <Step3
                    message={message}       onMessage={setMessage}
                    script={script}         onScript={setScript}
                    guidelines={guidelines} onGuidelines={setGuidelines}
                  />
                )}
                {currentStep === 4 && (
                  <Step4
                    campaignName={campaignName} brand={brand} objective={objective}
                    category={category} budget={budget} celebrityId={celebrityId}
                    scope={scope} message={message} script={script} guidelines={guidelines}
                    confirmed={confirmed} onConfirm={setConfirmed}
                  />
                )}
              </div>
            </div>
            {renderFooter()}
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   STANDALONE MODAL WRAPPER (used by StudioHomeWithFunnel if needed)
   ════════════════════════════════════════════════════════════════════════════ */
export type CustomCampaignFunnelProps = {
  open: boolean;
  onClose: () => void;
};

export function CustomCampaignFunnel({ open, onClose }: CustomCampaignFunnelProps) {
  const [sessionId, setSessionId] = useState(0);
  useEffect(() => {
    if (open) setSessionId((s) => s + 1);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-stretch justify-center p-0 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-campaign-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] transition-opacity duration-200"
        aria-label="Close custom campaign"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex h-full w-full max-h-[100dvh] max-w-[1400px] flex-col overflow-hidden rounded-none sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl"
        style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.09)", boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}
      >
        <header
          className="flex h-14 shrink-0 items-center justify-between px-4 md:px-5"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.97)" }}
        >
          <h2 id="custom-campaign-title" className="font-display text-[15px] font-bold" style={{ color: "#0F0A1E" }}>
            Custom Campaign — Enterprise
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl text-xl transition-all duration-150 hover:bg-black/[0.05]"
            style={{ color: "rgba(15,10,30,0.40)" }}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <CustomCampaignFunnelWorkspace key={sessionId} sessionId={sessionId} onClose={onClose} />
      </div>
    </div>
  );
}
