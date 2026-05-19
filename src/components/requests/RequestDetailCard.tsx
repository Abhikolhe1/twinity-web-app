/*
 * ══════════════════════════════════════════════════════════════════════════════
 *  TASK 1 — AUDIT ANSWERS (extracted from StudioHomeWithFunnel + globals.css)
 * ══════════════════════════════════════════════════════════════════════════════
 *
 *  1. ANIMATION LIBRARY
 *     CSS-only — no framer-motion, no external lib.
 *     Studio Home pattern:
 *       reveal() fn: opacity 0→1, translateY(6px)→none,
 *                    240ms ease-out, with optional delay
 *       Hover on cards: transition-all duration-200 (200ms)
 *       globals.css defines @keyframes funnelStepIn:
 *         from { opacity:0; transform:translateY(8px); }
 *         to   { opacity:1; transform:translateY(0); }
 *       Used via .funnel-step-animate className (200ms ease both)
 *
 *  2. CARD PATTERN
 *     Light-glass cards (KPI strip):
 *       background: rgba(255,255,255,0.025)
 *       border:     1px solid rgba(255,255,255,0.06)
 *       radius:     rounded-xl (12px)
 *       padding:    p-5 (20px)
 *       hover bg:   rgba(255,255,255,0.045)
 *       hover border: rgba(255,255,255,0.10)
 *       hover shadow: 0 4px 16px rgba(0,0,0,0.22)
 *       transition: transition-all duration-200
 *     Dark-solid cards (celebrity, license):
 *       background: #161616
 *       border:     1px solid #2A2A2A
 *       radius:     rounded-xl (12px) or rounded-2xl (16px)
 *       hover border: rgba(124,58,237,0.20–0.35)
 *       transition: 180ms
 *
 *  3. SECTION LABEL PATTERN
 *     Studio Home uses h2 font-display text-[22px] font-bold for section titles.
 *     Meta/caption style: text-[12px] color var(--tx-4) rgba(255,255,255,0.22)
 *     Inline muted copy: text-[13px] color var(--tx-3) rgba(255,255,255,0.35)
 *     For field section labels (used in cards): 10px, weight 600, #606060,
 *       letter-spacing 0.10em, uppercase, border-bottom 1px solid #2A2A2A,
 *       padding-bottom 8px, margin-bottom 14px
 *
 *  4. PRIMARY BUTTON PATTERN
 *     Small (h-9 = 36px):
 *       inline-flex h-9 items-center gap-2 rounded-lg px-5 text-[13px]
 *       font-semibold text-white hover:opacity-90
 *       background: #7C3AED
 *       boxShadow: 0 1px 3px rgba(0,0,0,0.40), 0 0 0 1px rgba(124,58,237,0.50)
 *     Large / gradient (h-[44px]):
 *       inline-flex h-[44px] items-center justify-center rounded-xl px-5
 *       text-[14px] font-bold text-white transition-all duration-200
 *       background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)
 *       boxShadow: 0 8px 24px rgba(124,58,237,0.30)
 *       hover: -translate-y-px
 *     Ghost:
 *       background: rgba(255,255,255,0.05)
 *       border: 1px solid rgba(255,255,255,0.10)
 *       color: rgba(255,255,255,0.65)
 *
 *  5. SPACING BETWEEN MAJOR SECTIONS
 *     mb-10 (40px) between top-level sections.
 *     gap-3 (12px) inside grids.  gap-6 (24px) between card internal sections.
 *     Section content padding: px-6 py-8 (desktop), 24px inside cards.
 *
 *  6. AMBIENT GLOW / RADIAL GRADIENTS
 *     Page background is #0A0812 (StudioChrome), with globals.css body::before
 *     noise grain at 2.2% opacity.
 *     .glow-purple utility: box-shadow 0 0 40px rgba(139,92,246,0.18)
 *     Completed gate circles: boxShadow 0 0 12px rgba(139,92,246,0.30)
 *     Primary button hover: 0 0 24px rgba(139,92,246,0.25)
 *     No explicit radial glow layer on the page itself.
 *
 *  7. PAGE BACKGROUND TREATMENT
 *     #0A0812 flat dark from StudioChrome bg-[#0A0812].
 *     Subtle film grain via body::before SVG noise at opacity 0.022.
 *     Content max-width 1200px, px-6 py-8 (desktop px-8 py-10).
 *
 *  8. TRANSITION DURATION AND EASING
 *     --transition: 180ms cubic-bezier(0.16, 1, 0.3, 1) (global default)
 *     Card hover: 200ms (transition-all duration-200)
 *     Button hover: 150ms (hover effect) / opacity hover:opacity-90
 *     Ghost button text/border color: transition-colors duration-150
 * ══════════════════════════════════════════════════════════════════════════════
 */

"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import type { RequestStatus } from "@/lib/request-statuses";

/* ── Type ────────────────────────────────────────────────────────────────── */
export type RequestDetailCardProps = {
  orderId: string;
  type: "GREETING" | "CAMPAIGN" | "CUSTOM_CAMPAIGN" | "AD_IMAGE";
  celebrity: { name: string; stageName: string; avatarUrl?: string };
  licenseScope?: {
    channels:        string[];
    territory:       string;
    duration:        string;
    exclusivity:     string;
    deliverableType: string;
  };
  /** AD_IMAGE-specific brief fields */
  adImageBrief?: {
    prompt:                string;
    style:                 string;
    aspectRatio:           string;
    usageDeclaration:      string;
    referenceImageCount?:  number;
  };
  brief?: { campaignName?: string; objective?: string };
  payment: {
    subtotal: number;
    vat:      number;
    total:    number;
    status:   string;
  };
  createdAt:    string;
  submittedAt?: string;
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)   return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleDateString("en-SA", {
    year: "numeric", month: "short", day: "numeric",
  });
}

const TYPE_LABEL: Record<string, string> = {
  GREETING:         "Personalized Greeting",
  CAMPAIGN:         "Licensed Campaign",
  CUSTOM_CAMPAIGN:  "Custom Commercial",
  AD_IMAGE:         "Image Ad — Celebrity Licensed",
};

function sarAmount(n: number): string {
  return `SAR ${n.toLocaleString("en-SA")}`;
}

/* ── Section label style ─────────────────────────────────────────────────── */
const SECTION_LABEL: React.CSSProperties = {
  display:        "block",
  fontSize:       10,
  fontWeight:     600,
  color:          "#606060",
  letterSpacing:  "0.10em",
  textTransform:  "uppercase",
  paddingBottom:  8,
  borderBottom:   "1px solid #2A2A2A",
  marginBottom:   14,
};

/* ── Row ─────────────────────────────────────────────────────────────────── */
const LABEL_CELL: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: "#606060" };
const VALUE_CELL: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: "#F0F0F0" };

function Row({
  label,
  children,
  last = false,
  alignStart = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
  alignStart?: boolean;
}) {
  return (
    <div style={{
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     alignStart ? "flex-start" : "center",
      padding:        "8px 0",
      borderBottom:   last ? "none" : "1px solid #1A1A1A",
      gap:            8,
    }}>
      <span style={LABEL_CELL}>{label}</span>
      <span style={{ ...VALUE_CELL, textAlign: "end" }}>{children}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#2A2A2A", margin: "16px 0" }} />;
}

/* ── Channel pill ────────────────────────────────────────────────────────── */
function ChannelPill({ label }: { label: string }) {
  return (
    <span style={{
      fontSize:     11,
      fontWeight:   500,
      color:        "#A0A0A0",
      background:   "#1E1E1E",
      border:       "1px solid #2A2A2A",
      borderRadius: 9999,
      padding:      "3px 10px",
      whiteSpace:   "nowrap",
    }}>
      {label}
    </span>
  );
}

/* ── Type badge — BUG 2 FIX: show request type only, never request status ── */
function TypeBadge({ type }: { type: string }) {
  return (
    <span style={{
      fontSize:      11,
      fontWeight:    600,
      color:         "#C4B5FD",
      background:    "rgba(124,58,237,0.10)",
      border:        "1px solid rgba(124,58,237,0.20)",
      borderRadius:  9999,
      padding:       "2px 8px",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      whiteSpace:    "nowrap",
    }}>
      {type.replace(/_/g, " ")}
    </span>
  );
}

/* ── Copyable Order ID ───────────────────────────────────────────────────── */
function CopyableOrderId({ orderId }: { orderId: string }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={copied ? "Copied!" : "Click to copy"}
      style={{
        display:     "inline-flex",
        alignItems:  "center",
        gap:         5,
        fontFamily:  "var(--font-mono, monospace)",
        fontSize:    12,
        color:       copied ? "#22C55E" : "#A0A0A0",
        background:  "transparent",
        border:      "none",
        cursor:      "pointer",
        padding:     0,
        transition:  "color 180ms",
      }}
    >
      {orderId}
      {(hovered || copied) && (
        copied
          ? <Check size={12} color="#22C55E" />
          : <Copy size={12} color="#606060" />
      )}
    </button>
  );
}

/* ── Celebrity avatar ────────────────────────────────────────────────────── */
function CelebAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width:          28,
        height:         28,
        borderRadius:   9999,
        background:     avatarUrl ? undefined : "linear-gradient(135deg, #7C3AED 0%, #3D1A6E 100%)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       10,
        fontWeight:     700,
        color:          "#FFFFFF",
        flexShrink:     0,
        overflow:       "hidden",
      }}>
        {avatarUrl
          /* eslint-disable-next-line @next/next/no-img-element */
          ? <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initials}
      </span>
      {name}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function RequestDetailCard({
  orderId,
  type,
  celebrity,
  licenseScope,
  adImageBrief,
  payment,
  submittedAt,
}: RequestDetailCardProps) {
  const [cardHovered, setCardHovered] = useState(false);
  const showLicenseScope = (type === "CAMPAIGN" || type === "CUSTOM_CAMPAIGN") && licenseScope;
  const showAdImageBrief = type === "AD_IMAGE" && adImageBrief;

  return (
    <div
      style={{
        background:   "#161616",
        border:       `1px solid ${cardHovered ? "rgba(124,58,237,0.20)" : "#2A2A2A"}`,
        borderRadius: 16,
        overflow:     "hidden",
        transition:   "border-color 180ms",
      }}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
    >
      {/* ── Request info ──────────────────────────────────────────────────── */}
      <div style={{
        padding:      24,
        borderBottom: "1px solid #2A2A2A",
      }}>
        <span style={SECTION_LABEL}>Request Details</span>

        {/* BUG 2 FIX: Type row shows ONLY the request type badge — no status badge */}
        <Row label="Order ID">
          <CopyableOrderId orderId={orderId} />
        </Row>
        <Row label="Type">
          <TypeBadge type={type} />
        </Row>
        <Row label="Celebrity">
          <CelebAvatar name={celebrity.stageName || celebrity.name} avatarUrl={celebrity.avatarUrl} />
        </Row>
        <Row label="Service">
          <span>{TYPE_LABEL[type] ?? type}</span>
        </Row>
        <Row label="Submitted" last>
          <span
            title={submittedAt ? formatAbsolute(submittedAt) : "Not submitted yet"}
            style={{ cursor: "default" }}
          >
            {submittedAt ? formatRelative(submittedAt) : "Not submitted"}
          </span>
        </Row>
      </div>

      {/* ── AD_IMAGE brief ────────────────────────────────────────────────── */}
      {showAdImageBrief && (
        <div style={{ padding: 24, borderBottom: "1px solid #2A2A2A" }}>
          <span style={SECTION_LABEL}>Image Brief</span>
          <Row label="Style">
            <ChannelPill label={adImageBrief!.style} />
          </Row>
          <Row label="Aspect Ratio">
            <ChannelPill label={adImageBrief!.aspectRatio} />
          </Row>
          <Row label="Usage">
            <span>{adImageBrief!.usageDeclaration}</span>
          </Row>
          {adImageBrief!.referenceImageCount !== undefined && adImageBrief!.referenceImageCount > 0 && (
            <Row label="Ref. Images">
              <span style={{ color: "#A0A0A0" }}>
                {adImageBrief!.referenceImageCount} image{adImageBrief!.referenceImageCount > 1 ? "s" : ""} uploaded
              </span>
            </Row>
          )}
          <Row label="Prompt" last alignStart>
            <span style={{ fontStyle: "italic", color: "#A0A0A0", maxWidth: 200, display: "block", textAlign: "end", lineHeight: 1.5 }}>
              {adImageBrief!.prompt.slice(0, 80)}{adImageBrief!.prompt.length > 80 ? "…" : ""}
            </span>
          </Row>
        </div>
      )}

      {/* ── License + payment ─────────────────────────────────────────────── */}
      <div style={{ padding: 24 }}>
        {showLicenseScope && (
          <>
            <span style={SECTION_LABEL}>License Scope</span>

            <Row label="Channels" alignStart>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-end" }}>
                {licenseScope!.channels.map((ch) => <ChannelPill key={ch} label={ch} />)}
              </div>
            </Row>
            <Row label="Territory">
              <ChannelPill label={licenseScope!.territory} />
            </Row>
            <Row label="Duration">
              <span>{licenseScope!.duration}</span>
            </Row>
            <Row label="Exclusivity">
              <span>{licenseScope!.exclusivity}</span>
            </Row>
            <Row label="Deliverable" last>
              <span>{licenseScope!.deliverableType}</span>
            </Row>

            <Divider />
          </>
        )}

        <span style={SECTION_LABEL}>Payment Summary</span>

        <Row label="Subtotal">
          <span style={{ color: "#A0A0A0", fontVariantNumeric: "tabular-nums" }}>
            {sarAmount(payment.subtotal)}
          </span>
        </Row>
        <Row label="VAT (15%)">
          <span style={{ color: "#A0A0A0", fontVariantNumeric: "tabular-nums" }}>
            {sarAmount(payment.vat)}
          </span>
        </Row>

        <div style={{ height: 1, background: "#2A2A2A", margin: "8px 0" }} />

        <Row label="Total" last>
          <span style={{
            fontSize:           18,
            fontWeight:         800,
            color:              "#F0F0F0",
            fontVariantNumeric: "tabular-nums",
            letterSpacing:      "-0.01em",
          }}>
            {sarAmount(payment.total)}
          </span>
        </Row>

        <div style={{ paddingTop: 8 }}>
          <Row label="Payment Status" last>
            <RequestStatusBadge
              status={payment.status as RequestStatus}
              size="sm"
            />
          </Row>
        </div>
      </div>
    </div>
  );
}
