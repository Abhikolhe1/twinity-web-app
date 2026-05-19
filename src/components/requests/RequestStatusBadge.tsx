"use client";

import React from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  Eye,
  FileText,
  KeyRound,
  ListOrdered,
  Lock,
  PencilLine,
  RotateCcw,
  Scale,
  ScanSearch,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import type { RequestStatus } from "@/lib/request-statuses";
import { REQUEST_STATUS_MAP } from "@/lib/request-statuses";

/* ── Icon registry ──────────────────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  Eye,
  FileText,
  KeyRound,
  ListOrdered,
  Lock,
  PencilLine,
  RotateCcw,
  Scale,
  ScanSearch,
  ShieldCheck,
  XCircle,
};

/* ── Color tokens → CSS values ──────────────────────────────────────────── */
type BadgeColor = "success" | "warning" | "error" | "info" | "muted" | "purple";

const COLOR_TOKENS: Record<BadgeColor, { text: string; bg: string; border: string }> = {
  success: {
    text:   "#22C55E",
    bg:     "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.20)",
  },
  warning: {
    text:   "#F59E0B",
    bg:     "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.20)",
  },
  error: {
    text:   "#EF4444",
    bg:     "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.20)",
  },
  info: {
    text:   "#3B82F6",
    bg:     "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.20)",
  },
  muted: {
    text:   "#606060",
    bg:     "rgba(96,96,96,0.10)",
    border: "rgba(96,96,96,0.20)",
  },
  purple: {
    text:   "#C4B5FD",
    bg:     "rgba(124,58,237,0.10)",
    border: "rgba(124,58,237,0.20)",
  },
};

/* ── Size tokens ─────────────────────────────────────────────────────────── */
const SIZE_TOKENS = {
  sm: { fontSize: 10, iconSize: 10, paddingBlock: 2,  paddingInline: 8  },
  md: { fontSize: 11, iconSize: 12, paddingBlock: 3,  paddingInline: 10 },
  lg: { fontSize: 12, iconSize: 14, paddingBlock: 4,  paddingInline: 12 },
} as const;

/* ── Props ───────────────────────────────────────────────────────────────── */
export type RequestStatusBadgeProps = {
  status: RequestStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
};

export function RequestStatusBadge({
  status,
  size = "md",
  showIcon = true,
}: RequestStatusBadgeProps) {
  const meta  = REQUEST_STATUS_MAP[status as keyof typeof REQUEST_STATUS_MAP];
  if (!meta) {
    /* Unknown / unmapped status — render a safe muted fallback */
    const sz = SIZE_TOKENS[size];
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        borderRadius: 9999, border: "1px solid rgba(96,96,96,0.20)",
        background: "rgba(96,96,96,0.10)", color: "#606060",
        fontSize: sz.fontSize, fontWeight: 600, letterSpacing: "0.04em",
        textTransform: "uppercase", paddingBlock: sz.paddingBlock, paddingInline: sz.paddingInline,
        whiteSpace: "nowrap", lineHeight: 1,
      }}>
        {String(status).toLowerCase().replace(/_/g, " ")}
      </span>
    );
  }
  const color = COLOR_TOKENS[meta.color];
  const sz    = SIZE_TOKENS[size];
  const Icon  = showIcon ? ICON_MAP[meta.icon] : null;

  return (
    <span
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            4,
        borderRadius:   9999,
        border:         `1px solid ${color.border}`,
        background:     color.bg,
        color:          color.text,
        fontSize:       sz.fontSize,
        fontWeight:     600,
        letterSpacing:  "0.04em",
        textTransform:  "uppercase",
        paddingBlock:   sz.paddingBlock,
        paddingInline:  sz.paddingInline,
        whiteSpace:     "nowrap",
        lineHeight:     1,
      }}
    >
      {Icon && <Icon size={sz.iconSize} />}
      {meta.label}
    </span>
  );
}
