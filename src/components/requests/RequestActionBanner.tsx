"use client";

import React from "react";
import { AlertTriangle, Eye, Lock, PencilLine } from "lucide-react";

import type { RequestStatus } from "@/lib/request-statuses";

/* ── Semantic color tokens ───────────────────────────────────────────────── */
type BannerColor = "purple" | "error" | "warning" | "info";

const COLOR_TOKENS: Record<BannerColor, {
  bg: string; border: string; accent: string; iconBg: string; iconColor: string;
}> = {
  purple: {
    bg:        "rgba(124,58,237,0.08)",
    border:    "rgba(124,58,237,0.20)",
    accent:    "#7C3AED",
    iconBg:    "rgba(124,58,237,0.15)",
    iconColor: "#C4B5FD",
  },
  error: {
    bg:        "rgba(239,68,68,0.08)",
    border:    "rgba(239,68,68,0.20)",
    accent:    "#EF4444",
    iconBg:    "rgba(239,68,68,0.15)",
    iconColor: "#EF4444",
  },
  warning: {
    bg:        "rgba(245,158,11,0.08)",
    border:    "rgba(245,158,11,0.20)",
    accent:    "#F59E0B",
    iconBg:    "rgba(245,158,11,0.15)",
    iconColor: "#F59E0B",
  },
  info: {
    bg:        "rgba(59,130,246,0.08)",
    border:    "rgba(59,130,246,0.20)",
    accent:    "#3B82F6",
    iconBg:    "rgba(59,130,246,0.15)",
    iconColor: "#3B82F6",
  },
};

/* ── CTA button variants ─────────────────────────────────────────────────── */
type CtaVariant = "gradient" | "error-ghost" | "warning-ghost" | "info-ghost";

function CtaButton({
  label,
  variant,
  LeadIcon,
  onClick,
}: {
  label: string;
  variant: CtaVariant;
  LeadIcon?: React.ComponentType<{ size?: number; color?: string }>;
  onClick?: () => void;
}) {
  const base: React.CSSProperties = {
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            7,
    height:         40,
    paddingInline:  20,
    borderRadius:   10,
    fontSize:       13,
    fontWeight:     600,
    cursor:         "pointer",
    border:         "none",
    whiteSpace:     "nowrap",
    flexShrink:     0,
  };

  const variants: Record<CtaVariant, React.CSSProperties> = {
    gradient: {
      background:  "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)",
      color:       "#FFFFFF",
      boxShadow:   "0 1px 3px rgba(0,0,0,0.40), 0 0 0 1px rgba(139,92,246,0.40)",
      transition:  "box-shadow 180ms, opacity 150ms",
    },
    "error-ghost": {
      background:  "rgba(239,68,68,0.08)",
      color:       "#EF4444",
      border:      "1px solid rgba(239,68,68,0.40)",
      transition:  "background 150ms",
    },
    "warning-ghost": {
      background:  "rgba(245,158,11,0.08)",
      color:       "#F59E0B",
      border:      "1px solid rgba(245,158,11,0.40)",
      transition:  "background 150ms",
    },
    "info-ghost": {
      background:  "rgba(59,130,246,0.08)",
      color:       "#3B82F6",
      border:      "1px solid rgba(59,130,246,0.40)",
      transition:  "background 150ms",
    },
  };

  return (
    <button
      type="button"
      style={{ ...base, ...variants[variant] }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (variant === "gradient") {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 0 24px rgba(139,92,246,0.25), 0 1px 3px rgba(0,0,0,0.40), 0 0 0 1px rgba(139,92,246,0.50)";
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "gradient") {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 1px 3px rgba(0,0,0,0.40), 0 0 0 1px rgba(139,92,246,0.40)";
        }
      }}
    >
      {LeadIcon && <LeadIcon size={14} />}
      {label}
    </button>
  );
}

/* ── Banner config per status ────────────────────────────────────────────── */
type BannerConfig = {
  color:       BannerColor;
  Icon:        React.ComponentType<{ size?: number; color?: string }>;
  title:       string;
  body:        string;
  ctaLabel:    string;
  ctaVariant:  CtaVariant;
  ctaIcon?:    React.ComponentType<{ size?: number; color?: string }>;
};

function getBannerConfig(
  status: RequestStatus,
  editFeedback?: string,
  validationReason?: string,
): BannerConfig | null {
  switch (status) {
    case "PENDING_PAYMENT":
      return {
        color:      "purple",
        Icon:       Lock,
        title:      "Payment required to begin production",
        body:       "Your request has been received and validated. Authorize payment to move into the celebrity approval queue.",
        ctaLabel:   "Authorize Payment",
        ctaVariant: "gradient",
        ctaIcon:    Lock,
      };
    case "VALIDATION_FAILED":
      return {
        color:      "error",
        Icon:       AlertTriangle,
        title:      "Your request needs adjustments",
        body:       validationReason ??
          "Our validation system flagged an issue with your request. Review the details and resubmit.",
        ctaLabel:   "Review & Resubmit",
        ctaVariant: "error-ghost",
      };
    case "PROCESSING_FAILED":
      return {
        color:      "error",
        Icon:       AlertTriangle,
        title:      "Production could not be completed",
        body:       validationReason ??
          "Your request passed submission, but production stopped before a preview was prepared. Review the latest details and submit again.",
        ctaLabel:   "Review & Resubmit",
        ctaVariant: "error-ghost",
      };
    case "EDIT_REQUESTED":
      return {
        color:      "warning",
        Icon:       PencilLine,
        title:      "Changes requested by the celebrity",
        body:       editFeedback ??
          "The celebrity or their manager has requested changes to your brief before approval.",
        ctaLabel:   "Submit Revision",
        ctaVariant: "warning-ghost",
      };
    case "PREVIEW_REVIEW":
      return {
        color:      "info",
        Icon:       Eye,
        title:      "Your watermarked preview is ready for review",
        body:       "Review the preview below. Final delivery follows after approval and payment capture. Do not share or screenshot the watermarked preview.",
        ctaLabel:   "View Preview",
        ctaVariant: "gradient",
        ctaIcon:    Eye,
      };
    default:
      return null;
  }
}

/* ── Props ───────────────────────────────────────────────────────────────── */
export type RequestActionBannerProps = {
  status: RequestStatus;
  editFeedback?: string;
  validationReason?: string;
  onAction?: () => void;
};

export function RequestActionBanner({
  status,
  editFeedback,
  validationReason,
  onAction,
}: RequestActionBannerProps) {
  const config = getBannerConfig(status, editFeedback, validationReason);
  if (!config) return null;

  const ct = COLOR_TOKENS[config.color];
  const { Icon, title, body, ctaLabel, ctaVariant, ctaIcon } = config;

  return (
    /*
     * Entrance animation matches Studio Home reveal() pattern:
     *   opacity 0→1, translateY 8px→0, 300ms ease-out
     */
    <div
      style={{
        display:                "flex",
        gap:                    14,
        alignItems:             "flex-start",
        padding:                "16px 20px",
        background:             ct.bg,
        border:                 `1px solid ${ct.border}`,
        /* Left accent bar — Task 3.1 */
        borderInlineStart:      `3px solid ${ct.accent}`,
        /* Remove radius on inline-start side only */
        borderStartStartRadius: 0,
        borderEndStartRadius:   0,
        borderStartEndRadius:   12,
        borderEndEndRadius:     12,
        /* Entrance animation */
        animation:              "bannerEnter 300ms ease-out both",
      }}
    >
      {/* Entrance keyframe — scoped inline */}
      <style>{`
        @keyframes bannerEnter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Icon circle — Task 3.2 */}
      <div
        style={{
          width:          36,
          height:         36,
          borderRadius:   9999,
          background:     ct.iconBg,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
        }}
      >
        <Icon size={16} color={ct.iconColor} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0F0A1E", margin: 0 }}>
          {title}
        </p>
        <p style={{ fontSize: 13, fontWeight: 400, color: "rgba(15,10,30,0.55)", marginTop: 4, lineHeight: 1.5 }}>
          {body}
        </p>
      </div>

      {/* CTA — Task 3.3 */}
      <CtaButton
        label={ctaLabel}
        variant={ctaVariant}
        LeadIcon={ctaIcon}
        onClick={onAction}
      />
    </div>
  );
}
