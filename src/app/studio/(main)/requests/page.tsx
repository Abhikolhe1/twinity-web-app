"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  InboxIcon,
  Layers,
  Play,
  Plus,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";

import styles from "@/components/studio/StudioHome.module.css";
import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import { REQUEST_STATUS_MAP }  from "@/lib/request-statuses";
import type { RequestStatus }  from "@/lib/request-statuses";
import type { MockRequest }    from "@/lib/studio/mock-requests";
import { jobApi, mapApiJobToRequest } from "@/lib/api";
import { useStudioFunnel } from "@/contexts/StudioFunnelContext";

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS  (scoped to this page; no global pollution)
   Premium SaaS palette — precise hex, no opacity arithmetic for main surfaces
───────────────────────────────────────────────────────────────────────────── */
const T = {
  /* surfaces */
  pageBg:        "transparent",
  cardBg:        "rgba(255,255,255,0.025)",      // Studio Home exact
  cardBgHover:   "rgba(255,255,255,0.045)",
  tableBg:       "rgba(255,255,255,0.018)",
  rowHoverBg:    "rgba(255,255,255,0.028)",
  headerBg:      "rgba(0,0,0,0.28)",

  /* borders */
  border:        "rgba(255,255,255,0.055)",
  borderHover:   "rgba(255,255,255,0.10)",
  rowDivider:    "rgba(255,255,255,0.038)",

  /* text hierarchy */
  textPrimary:   "#F4F4F5",
  textSecondary: "rgba(255,255,255,0.55)",       // var(--tx-2)
  textTertiary:  "rgba(255,255,255,0.32)",       // var(--tx-3)
  textMuted:     "rgba(255,255,255,0.20)",       // var(--tx-4)
  textLabel:     "rgba(255,255,255,0.20)",

  /* brand */
  violet:        "#7C3AED",
  violetBg:      "rgba(124,58,237,0.12)",
  violetBorder:  "rgba(124,58,237,0.35)",

  /* semantic */
  amber:         "#F59E0B",
  amberBg:       "rgba(245,158,11,0.08)",
  green:         "#22C55E",
  greenBg:       "rgba(34,197,94,0.08)",
  blue:          "#3B82F6",
  blueBg:        "rgba(59,130,246,0.08)",
  red:           "#EF4444",
} as const;

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */

const ACTIVE_EXCLUDED = new Set<RequestStatus>([
  "DELIVERED","REJECTED","CANCELLED","REFUNDED","DRAFT",
]);
const PENDING_ACTION = new Set<RequestStatus>([
  "PENDING_PAYMENT","VALIDATION_FAILED","EDIT_REQUESTED","PREVIEW_REVIEW",
]);

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  GREETING:        { label: "Greeting",  color: "#A78BFA", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.16)" },
  CAMPAIGN:        { label: "Campaign",  color: "#7DD3FC", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.16)" },
  CUSTOM_CAMPAIGN: { label: "Custom",    color: "#FCD34D", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.16)" },
  AD_IMAGE:        { label: "Image Ad",  color: "#C4B5FD", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.22)" },
};

/* Row left border — meaningful status signal only */
const ROW_ACCENT: Partial<Record<RequestStatus, { border: string; tint: string }>> = {
  PREVIEW_REVIEW:    { border: T.blue,   tint: "rgba(59,130,246,0.015)"  },
  PENDING_PAYMENT:   { border: T.amber,  tint: "rgba(245,158,11,0.015)"  },
  EDIT_REQUESTED:    { border: T.amber,  tint: "rgba(245,158,11,0.015)"  },
  VALIDATION_FAILED: { border: T.red,    tint: "rgba(239,68,68,0.015)"   },
  DELIVERED:         { border: T.green,  tint: "rgba(34,197,94,0.015)"   },
  APPROVED:          { border: T.green,  tint: "rgba(34,197,94,0.015)"   },
};

const FILTER_TABS = [
  { id: "all",             label: "All"            },
  { id: "GREETING",        label: "Greeting"       },
  { id: "CAMPAIGN",        label: "Campaign"       },
  { id: "AD_IMAGE",        label: "Image Ad"       },
  { id: "CUSTOM_CAMPAIGN", label: "Custom"         },
] as const;
type TabId = typeof FILTER_TABS[number]["id"];

const STATUS_OPTIONS = Object.keys(REQUEST_STATUS_MAP) as RequestStatus[];

/*
 * GRID — 9 columns
 * ORDER ID  TYPE   CELEBRITY  STATUS   GATE    TOTAL   DATE    ACTION  CHEVRON
 *  128px    84px    1fr       176px    96px    100px   72px    80px    28px
 *
 * Gate bumped to 96px so the progress bar and label have breathing room.
 * Action column added (80px) for preview/download buttons on DELIVERED rows.
 */
const COLS = "128px 84px 1fr 176px 96px 100px 72px 80px 28px";
const COL_HEADERS = [
  { label: "Order ID",  align: "start" as const },
  { label: "Type",      align: "start" as const },
  { label: "Celebrity", align: "start" as const },
  { label: "Status",    align: "start" as const },
  { label: "Gate",      align: "start" as const },
  { label: "Total",     align: "end"   as const },
  { label: "Date",      align: "end"   as const },
  { label: "Action",    align: "end"   as const },
  { label: "",          align: "end"   as const },
];

/* Statuses where a generated video is available */
const VIDEO_READY = new Set<RequestStatus>(["DELIVERED", "APPROVED", "PREVIEW_REVIEW"]);

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m  = Math.floor(ms / 60000);
  if (m < 2)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "1d ago" : `${d}d ago`;
}
function absoluteDate(iso: string): string {
  return new Date(iso).toLocaleString("en-SA", {
    year:"numeric", month:"short", day:"numeric",
    hour:"2-digit", minute:"2-digit",
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   KPI CARD  — Studio Home §2 exact token match
───────────────────────────────────────────────────────────────────────────── */

type KpiProps = {
  label:      string;
  value:      number;
  sub:        string;
  Icon:       React.ComponentType<{ size?: number; style?: React.CSSProperties; "aria-hidden"?: boolean }>;
  delay:      number;
  accent?:    "warning" | "success";
};

function KpiCard({ label, value, sub, Icon, delay, accent }: KpiProps) {
  const [hov, setHov] = useState(false);
  const valueColor = accent === "warning" && value > 0 ? T.amber
                   : accent === "success" && value > 0 ? T.green
                   : T.textPrimary;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:       "flex",
        flexDirection: "column",
        borderRadius:  12,
        padding:       20,
        cursor:        "default",
        transition:    "background 200ms, border-color 200ms, box-shadow 200ms",
        background:    hov ? T.cardBgHover : T.cardBg,
        border:        `1px solid ${hov ? T.borderHover : T.border}`,
        boxShadow:     hov ? "0 4px 16px rgba(0,0,0,0.22)" : "none",
        animation:     `_fadeUp 220ms ease-out ${delay}ms both`,
      }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <Icon size={12} aria-hidden style={{ color: T.textMuted, flexShrink:0 }} />
        <span style={{ fontSize:12, fontWeight:500, color:T.textSecondary }}>{label}</span>
      </div>
      <div style={{ marginTop:12 }}>
        <p style={{ margin:0, fontSize:22, fontWeight:700, fontVariantNumeric:"tabular-nums",
                    color:valueColor, letterSpacing:"-0.02em", lineHeight:1 }}>
          {value}
        </p>
        <p style={{ margin:"6px 0 0", fontSize:12, color:T.textMuted }}>{sub}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TYPE PILL
───────────────────────────────────────────────────────────────────────────── */

function TypePill({ type }: { type: string }) {
  const m = TYPE_META[type] ?? {
    label: type, color: T.textTertiary,
    bg: "rgba(96,96,96,0.08)", border: "rgba(96,96,96,0.16)",
  };
  return (
    <span style={{
      display:       "inline-flex",
      alignItems:    "center",
      fontSize:      10,
      fontWeight:    600,
      letterSpacing: "0.055em",
      textTransform: "uppercase",
      color:         m.color,
      background:    m.bg,
      border:        `1px solid ${m.border}`,
      borderRadius:  5,
      padding:       "2px 7px",
      whiteSpace:    "nowrap",
      lineHeight:    1.4,
    }}>
      {m.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CELEB AVATAR
───────────────────────────────────────────────────────────────────────────── */

function CelebAvatar({ name }: { name: string }) {
  const initials = name.trim().split(/\s+/).map(w => w[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
      <span aria-hidden style={{
        width:24, height:24, borderRadius:9999, flexShrink:0,
        background:     "rgba(124,58,237,0.40)",
        border:         "1px solid rgba(124,58,237,0.25)",
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:9, fontWeight:700,
        color:          "rgba(255,255,255,0.85)",
        letterSpacing:  "0.04em",
      }}>
        {initials}
      </span>
      <span style={{
        fontSize:13, fontWeight:450,
        color:        "rgba(255,255,255,0.78)",
        overflow:     "hidden",
        textOverflow: "ellipsis",
        whiteSpace:   "nowrap",
      }}>
        {name}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   GATE CELL
───────────────────────────────────────────────────────────────────────────── */

function GateCell({ status }: { status: RequestStatus }) {
  const gate = REQUEST_STATUS_MAP[status]?.gate ?? 0;
  const pct  = Math.min((gate / 9) * 100, 100);
  const done = gate >= 9;
  const barColor = done
    ? T.green
    : gate >= 7 ? "#7C3AED"
    : gate >= 4 ? "#8B5CF6"
    : "rgba(255,255,255,0.20)";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {/* Number display — larger and more legible */}
      <div style={{ display:"flex", alignItems:"baseline", gap:1.5 }}>
        <span style={{
          fontSize:      16,
          fontWeight:    700,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
          lineHeight:    1,
          color:         done ? T.green : T.textPrimary,
        }}>
          {gate}
        </span>
        <span style={{
          fontSize:   11,
          fontWeight: 400,
          color:      T.textMuted,
          lineHeight: 1,
        }}>
          /9
        </span>
      </div>

      {/* Progress bar — taller and wider */}
      <div style={{
        height:       3,
        width:        56,
        background:   "rgba(255,255,255,0.07)",
        borderRadius: 9999,
        overflow:     "hidden",
      }}>
        <div style={{
          height:       "100%",
          borderRadius: 9999,
          width:        `${pct}%`,
          background:   barColor,
          transition:   "width 600ms cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TABLE ROW
───────────────────────────────────────────────────────────────────────────── */

function TableRow({ request, isLast }: {
  request: MockRequest; index: number; isLast: boolean;
}) {
  const [hov, setHov] = useState(false);
  const accent      = ROW_ACCENT[request.status];
  const dimmed      = request.status === "REJECTED" || request.status === "CANCELLED";
  const hasVideo    = VIDEO_READY.has(request.status);
  const videoUrl    = (request as MockRequest & { videoUrl?: string }).videoUrl ?? null;
  const showActions = hasVideo;

  return (
    <Link
      href={`/studio/requests/${request.requestId}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:             "grid",
        gridTemplateColumns: COLS,
        alignItems:          "center",
        minHeight:           64,
        paddingInline:       "18px 16px",
        gap:                 0,
        borderBottom:        isLast ? "none" : `1px solid ${T.rowDivider}`,
        background:          hov ? T.rowHoverBg : (accent?.tint ?? "transparent"),
        borderInlineStart:   `2px solid ${accent?.border ?? "transparent"}`,
        cursor:              "pointer",
        textDecoration:      "none",
        transition:          "background 130ms ease",
        opacity:             dimmed ? 0.46 : 1,
      }}
    >
      {/* ORDER ID */}
      <span style={{
        fontFamily:"var(--font-mono,monospace)",
        fontSize:11, fontWeight:500,
        color:T.textMuted, letterSpacing:"0.02em",
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        paddingInlineEnd:8,
      }}>
        {request.orderId}
      </span>

      {/* TYPE */}
      <div style={{ display:"flex", alignItems:"center" }}>
        <TypePill type={request.type} />
      </div>

      {/* CELEBRITY */}
      <CelebAvatar name={request.celebrity.stageName || request.celebrity.name} />

      {/* STATUS */}
      <div style={{ display:"inline-flex", alignItems:"center" }}>
        <RequestStatusBadge status={request.status} size="sm" />
      </div>

      {/* GATE */}
      <GateCell status={request.status} />

      {/* TOTAL */}
      <div style={{ textAlign:"end", paddingInlineEnd:4 }}>
        <span style={{ fontSize:10, color:T.textMuted, marginInlineEnd:2, letterSpacing:"0.03em" }}>
          SAR
        </span>
        <span style={{ fontSize:13, fontWeight:600, color:T.textPrimary,
                       fontVariantNumeric:"tabular-nums", letterSpacing:"-0.01em" }}>
          {request.payment.total.toLocaleString("en-SA")}
        </span>
      </div>

      {/* DATE */}
      <div style={{ textAlign:"end" }}>
        <span title={absoluteDate(request.createdAt)} style={{
          fontSize:11, color:T.textMuted, whiteSpace:"nowrap", cursor:"help",
        }}>
          {relativeTime(request.createdAt)}
        </span>
      </div>

      {/* ACTION — preview / download for video-ready rows */}
      <div
        style={{ display:"flex", justifyContent:"flex-end", gap:4, paddingInlineEnd:4 }}
        onClick={e => e.preventDefault()}
      >
        {showActions ? (
          <>
            {/* Preview */}
            <button
              aria-label="Preview video"
              title="Preview video"
              style={{
                display:         "inline-flex",
                alignItems:      "center",
                justifyContent:  "center",
                width:           30,
                height:          30,
                borderRadius:    7,
                border:          `1px solid ${hov ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.09)"}`,
                background:      hov ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)",
                cursor:          "pointer",
                color:           hov ? T.violet : T.textMuted,
                transition:      "all 150ms ease",
                flexShrink:      0,
              }}
            >
              <Play size={11} fill="currentColor" />
            </button>

            {/* Download */}
            <a
              href={videoUrl ?? "#"}
              download
              aria-label="Download video"
              title="Download video"
              onClick={e => e.stopPropagation()}
              style={{
                display:         "inline-flex",
                alignItems:      "center",
                justifyContent:  "center",
                width:           30,
                height:          30,
                borderRadius:    7,
                border:          `1px solid ${hov ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.09)"}`,
                background:      hov ? "rgba(34,197,94,0.10)" : "rgba(255,255,255,0.04)",
                cursor:          "pointer",
                color:           hov ? T.green : T.textMuted,
                transition:      "all 150ms ease",
                textDecoration:  "none",
                flexShrink:      0,
              }}
            >
              <Download size={11} />
            </a>
          </>
        ) : null}
      </div>

      {/* CHEVRON */}
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <ChevronRight size={13} style={{
          color:      hov ? T.violet : T.textMuted,
          transform:  hov ? "translateX(2px)" : "none",
          transition: "color 130ms, transform 130ms",
        }} />
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MOBILE CARD
───────────────────────────────────────────────────────────────────────────── */

function MobileCard({ request, index }: { request: MockRequest; index: number }) {
  const [hov, setHov] = useState(false);
  const accent = ROW_ACCENT[request.status];
  const dimmed = request.status === "REJECTED" || request.status === "CANCELLED";
  const gate   = REQUEST_STATUS_MAP[request.status]?.gate ?? 0;
  const pct    = Math.min((gate / 9) * 100, 100);
  const done   = gate >= 9;

  return (
    <Link
      href={`/studio/requests/${request.requestId}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:           "block",
        background:        hov ? T.cardBgHover : T.cardBg,
        border:            `1px solid ${hov ? T.borderHover : T.border}`,
        borderInlineStart: `2px solid ${accent?.border ?? T.border}`,
        borderRadius:      12,
        padding:           "14px 16px",
        marginBottom:      8,
        cursor:            "pointer",
        textDecoration:    "none",
        transition:        "background 160ms, border-color 160ms",
        opacity:           dimmed ? 0.46 : 1,
        animation:         `_fadeUp 200ms ease ${index * 35}ms both`,
      }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
        <span style={{ fontFamily:"var(--font-mono,monospace)", fontSize:11, color:T.textMuted,
                       overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {request.orderId}
        </span>
        <TypePill type={request.type} />
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
        <CelebAvatar name={request.celebrity.stageName || request.celebrity.name} />
        <RequestStatusBadge status={request.status} size="sm" />
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:12 }}>
        {/* Gate progress */}
        <div>
          <div style={{ display:"flex", alignItems:"baseline", gap:1.5, marginBottom:5 }}>
            <span style={{ fontSize:16, fontWeight:700, color: done ? T.green : T.textPrimary,
                           fontVariantNumeric:"tabular-nums", letterSpacing:"-0.02em" }}>
              {gate}
            </span>
            <span style={{ fontSize:11, color:T.textMuted }}>/9 gates</span>
          </div>
          <div style={{ height:3, width:52, background:"rgba(255,255,255,0.07)",
                        borderRadius:9999, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:9999, width:`${pct}%`,
                          background: done ? T.green : gate >= 7 ? "#7C3AED" : gate >= 4 ? "#8B5CF6" : "rgba(255,255,255,0.20)",
                          transition: "width 600ms cubic-bezier(0.16,1,0.3,1)" }} />
          </div>
        </div>
        <div style={{ textAlign:"end" }}>
          <p style={{ margin:0, fontSize:14, fontWeight:600, color:T.textPrimary, fontVariantNumeric:"tabular-nums" }}>
            <span style={{ fontSize:10, color:T.textMuted, marginInlineEnd:2 }}>SAR</span>
            {request.payment.total.toLocaleString("en-SA")}
          </p>
          <p style={{ margin:"3px 0 0", fontSize:11, color:T.textMuted }}>
            {relativeTime(request.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────────────────────── */

function EmptyState({ typeFilter, onNewRequest }: { typeFilter: TabId; onNewRequest: () => void }) {
  const isAll     = typeFilter === "all";
  const typeLabel = TYPE_META[typeFilter]?.label ?? typeFilter;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", padding:"72px 24px", textAlign:"center" }}>
      {isAll
        ? <InboxIcon size={34} style={{ color:"rgba(255,255,255,0.09)", marginBottom:14 }} />
        : <SearchX   size={30} style={{ color:"rgba(255,255,255,0.09)", marginBottom:14 }} />
      }
      <p style={{ margin:"0 0 6px", fontSize:15, fontWeight:600, color:T.textPrimary, letterSpacing:"-0.01em" }}>
        {isAll ? "No requests yet" : `No ${typeLabel} requests`}
      </p>
      <p style={{ margin:"0 0 20px", fontSize:13, color:T.textTertiary, lineHeight:1.65, maxWidth:300 }}>
        {isAll
          ? "Browse celebrities and select a service to get started."
          : `You haven't submitted any ${typeLabel} requests yet.`
        }
      </p>
      <button
        type="button"
        onClick={onNewRequest}
        style={{
          display:"inline-flex", alignItems:"center", gap:6,
          height:34, paddingInline:16, borderRadius:7,
          background:     isAll ? T.violet : "transparent",
          border:         isAll ? "none" : `1px solid ${T.border}`,
          boxShadow:      isAll ? "0 1px 3px rgba(0,0,0,0.40),0 0 0 1px rgba(124,58,237,0.45)" : "none",
          color:          isAll ? "#FFFFFF" : T.textTertiary,
          fontSize:13, fontWeight:600, cursor:"pointer",
          transition:"opacity 150ms",
        }}
      >
        {isAll ? "New Request" : `Start a ${typeLabel} Request`}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   STATUS FILTER
   • Desktop (≥768px): position:fixed dropdown anchored to button
   • Mobile  (<768px) : bottom sheet — full-width, safe-area-aware, 44px rows
───────────────────────────────────────────────────────────────────────────── */

function StatusFilter({
  selected, onChange,
}: {
  selected: RequestStatus[];
  onChange:  (v: RequestStatus[]) => void;
}) {
  const [open,     setOpen]    = useState(false);
  const [isMobile, setMobile]  = useState(false);
  const [dropPos,  setDropPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  /* Detect mobile breakpoint — runs client-side only */
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Compute desktop dropdown position each time it opens */
  useEffect(() => {
    if (!open || isMobile || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setDropPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
  }, [open, isMobile]);

  /* Close desktop dropdown on scroll / resize */
  useEffect(() => {
    if (!open || isMobile) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close, { passive: true });
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [open, isMobile]);

  /* Prevent body scroll while mobile sheet is open */
  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open, isMobile]);

  const toggle = (s: RequestStatus) =>
    onChange(selected.includes(s) ? selected.filter(x => x !== s) : [...selected, s]);

  const hasFilters = selected.length > 0;
  const btnLabel   = hasFilters ? `Status · ${selected.length}` : "Status";
  const isActive   = open || hasFilters;

  return (
    <>
      {/* ── Trigger button ──────────────────────────────────────────── */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={hasFilters ? `Filter by status, ${selected.length} selected` : "Filter by status"}
        aria-expanded={open}
        style={{
          display:      "inline-flex",
          alignItems:   "center",
          gap:          5,
          height:       isMobile ? 36 : 30,
          paddingInline: isMobile ? 14 : 12,
          borderRadius: 9999,
          border:       `1px solid ${isActive ? T.violetBorder : T.border}`,
          background:   isActive ? T.violetBg : "rgba(255,255,255,0.022)",
          color:        hasFilters ? "#C4B5FD" : T.textTertiary,
          fontSize:     isMobile ? 13 : 12,
          fontWeight:   500,
          cursor:       "pointer",
          whiteSpace:   "nowrap",
          transition:   "all 150ms",
          touchAction:  "manipulation",
        }}
      >
        {isMobile
          ? <SlidersHorizontal size={13} />
          : null
        }
        {btnLabel}
        {!isMobile && (
          <ChevronDown size={10} style={{
            transform:  open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 150ms",
          }} />
        )}
      </button>

      {/* ── Desktop dropdown ─────────────────────────────────────────── */}
      {open && !isMobile && (
        <>
          <div style={{ position:"fixed", inset:0, zIndex:999 }} onClick={() => setOpen(false)} />
          <div style={{
            position:             "fixed",
            top:                  dropPos.top,
            right:                dropPos.right,
            zIndex:               1000,
            background:           "rgba(13,11,20,0.98)",
            backdropFilter:       "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border:               `1px solid ${T.border}`,
            borderRadius:         11,
            padding:              5,
            width:                232,
            maxHeight:            360,
            overflowY:            "auto",
            boxShadow:            "0 20px 60px rgba(0,0,0,0.90),0 0 0 1px rgba(255,255,255,0.04)",
            animation:            "_fadeUp 120ms ease both",
          }}>
            {STATUS_OPTIONS.map(s => {
              const isSel = selected.includes(s);
              return (
                <button key={s} type="button" onClick={() => toggle(s)} style={{
                  display:"flex", alignItems:"center", gap:8,
                  width:"100%", padding:"5px 8px", borderRadius:7,
                  border:"none", cursor:"pointer", textAlign:"start",
                  background:  isSel ? T.violetBg : "transparent",
                  transition:  "background 100ms",
                }}>
                  <RequestStatusBadge status={s} size="sm" />
                  {isSel && (
                    <span style={{ marginInlineStart:"auto" }}>
                      <Check size={11} style={{ color:"#A78BFA" }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── Mobile bottom sheet ──────────────────────────────────────── */}
      {open && isMobile && (
        <>
          {/* Scrim */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position:   "fixed",
              inset:      0,
              zIndex:     998,
              background: "rgba(0,0,0,0.65)",
              backdropFilter:       "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              animation:  "_scrimIn 200ms ease both",
            }}
          />

          {/* Sheet */}
          <div style={{
            position:      "fixed",
            bottom:        0,
            left:          0,
            right:         0,
            zIndex:        999,
            background:    "#12101C",
            borderRadius:  "16px 16px 0 0",
            display:       "flex",
            flexDirection: "column",
            maxHeight:     "82dvh",
            boxShadow:     "0 -8px 40px rgba(0,0,0,0.70)",
            animation:     "_sheetUp 260ms cubic-bezier(0.16,1,0.3,1) both",
          }}>

            {/* Drag handle */}
            <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
              <div style={{ width:36, height:4, borderRadius:9999,
                            background:"rgba(255,255,255,0.12)" }} />
            </div>

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                          padding:"8px 20px 12px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:16, fontWeight:600, color:T.textPrimary }}>
                  Filter by Status
                </span>
                {hasFilters && (
                  <span style={{
                    fontSize:10, fontWeight:700,
                    color:          "#A78BFA",
                    background:     T.violetBg,
                    border:         `1px solid ${T.violetBorder}`,
                    borderRadius:   9999,
                    padding:        "2px 7px",
                    lineHeight:     1.4,
                  }}>
                    {selected.length} selected
                  </span>
                )}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    style={{
                      fontSize:12, fontWeight:500, color:T.textTertiary,
                      background:"none", border:"none", cursor:"pointer",
                      padding:"4px 8px",
                    }}
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close filter"
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center",
                    width:30, height:30, borderRadius:9999,
                    background:"rgba(255,255,255,0.06)", border:"none",
                    cursor:"pointer", color:T.textSecondary,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Thin separator */}
            <div style={{ height:1, background:T.rowDivider }} />

            {/* Scrollable option list — 52px rows, touch-friendly */}
            <div style={{ overflowY:"auto", flex:1 }}>
              {STATUS_OPTIONS.map((s, idx) => {
                const isSel = selected.includes(s);
                const isLast = idx === STATUS_OPTIONS.length - 1;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    style={{
                      display:       "flex",
                      alignItems:    "center",
                      justifyContent:"space-between",
                      width:         "100%",
                      minHeight:     52,
                      padding:       "10px 20px",
                      border:        "none",
                      borderBottom:  isLast ? "none" : `1px solid ${T.rowDivider}`,
                      background:    isSel ? "rgba(124,58,237,0.07)" : "transparent",
                      cursor:        "pointer",
                      textAlign:     "start",
                      transition:    "background 100ms",
                      touchAction:   "manipulation",
                    }}
                  >
                    <RequestStatusBadge status={s} size="md" />
                    {/* Checkbox indicator */}
                    <span style={{
                      width:         20,
                      height:        20,
                      borderRadius:  5,
                      border:        `1.5px solid ${isSel ? T.violet : "rgba(255,255,255,0.15)"}`,
                      background:    isSel ? T.violet : "transparent",
                      display:       "flex",
                      alignItems:    "center",
                      justifyContent:"center",
                      flexShrink:    0,
                      transition:    "all 150ms",
                    }}>
                      {isSel && <Check size={11} style={{ color:"#FFFFFF" }} />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Apply CTA — safe area aware */}
            <div style={{
              padding:       "12px 20px",
              paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))",
              borderTop:     `1px solid ${T.rowDivider}`,
            }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  width:        "100%",
                  height:       48,
                  borderRadius: 10,
                  background:   hasFilters ? T.violet : "rgba(255,255,255,0.06)",
                  border:       "none",
                  color:        hasFilters ? "#FFFFFF" : T.textTertiary,
                  fontSize:     15,
                  fontWeight:   600,
                  cursor:       "pointer",
                  transition:   "background 150ms, color 150ms",
                  boxShadow:    hasFilters
                    ? "0 1px 3px rgba(0,0,0,0.40),0 0 0 1px rgba(124,58,237,0.45)"
                    : "none",
                }}
              >
                {hasFilters
                  ? `Show results · ${selected.length} filter${selected.length > 1 ? "s" : ""} active`
                  : "Done"
                }
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */

export default function StudioRequestsPage() {
  const [typeFilter,   setTypeFilter]   = useState<TabId>("all");
  const [statusFilter, setStatusFilter] = useState<RequestStatus[]>([]);
  const [requests,     setRequests]     = useState<MockRequest[]>([]);
  const [loadingReqs,  setLoadingReqs]  = useState(true);
  const { openFunnel } = useStudioFunnel();

  useEffect(() => {
    jobApi.myJobs(undefined, 1, 100)
      .then((res) => setRequests(res.data.map(mapApiJobToRequest)))
      .catch(() => { /* fall back to empty list */ })
      .finally(() => setLoadingReqs(false));
  }, []);

  const total     = requests.length;
  const active    = requests.filter(r => !ACTIVE_EXCLUDED.has(r.status)).length;
  const pending   = requests.filter(r => PENDING_ACTION.has(r.status)).length;
  const delivered = requests.filter(r => r.status === "DELIVERED").length;

  const tabCounts = useMemo(() => {
    const c: Record<string, number> = { all: total };
    for (const t of FILTER_TABS) {
      if (t.id !== "all") c[t.id] = requests.filter(r => r.type === t.id).length;
    }
    return c;
  }, [total, requests]);

  const filtered = useMemo(() =>
    requests.filter(r => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(r.status)) return false;
      return true;
    }),
    [typeFilter, statusFilter, requests],
  );

  return (
    <div className={styles.pageRoot}>
      <style>{`
        @keyframes _fadeUp {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0);   }
        }
        @keyframes _sheetUp {
          from { transform:translateY(100%); }
          to   { transform:translateY(0);    }
        }
        @keyframes _scrimIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
      `}</style>

      <div className="md:px-8" style={{ padding:"28px 20px 72px", maxWidth:1280, margin:"0 auto" }}>

        {/* ── HEADER ───────────────────────────────────────────────── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
                      gap:16, marginBottom:24, flexWrap:"wrap",
                      animation:"_fadeUp 200ms ease both" }}>
          <div>
            <h1 style={{
              margin:0,
              fontFamily:    "var(--font-display,var(--font-sans))",
              fontSize:      22,
              fontWeight:    700,
              color:         T.textPrimary,
              letterSpacing: "-0.025em",
              lineHeight:    1.1,
            }}>
              My Requests
            </h1>
            <p style={{ margin:"5px 0 0", fontSize:13, color:T.textTertiary, lineHeight:1.5 }}>
              {total} request{total !== 1 ? "s" : ""}
              {pending > 0 && <>
                {" · "}
                <span style={{ color:T.amber, fontWeight:600 }}>
                  {pending} need{pending === 1 ? "s" : ""} attention
                </span>
              </>}
            </p>
          </div>

          <button
            type="button"
            onClick={() => openFunnel("greeting")}
            style={{
              display:"inline-flex", alignItems:"center", gap:6,
              height:34, paddingInline:16, borderRadius:7,
              background: T.violet,
              boxShadow:  "0 1px 3px rgba(0,0,0,0.40),0 0 0 1px rgba(124,58,237,0.45)",
              color:"#FFFFFF", fontSize:13, fontWeight:600,
              border:"none", flexShrink:0, cursor:"pointer", transition:"opacity 150ms",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity="0.84"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity="1"; }}
          >
            <Plus size={13} aria-hidden />
            New Request
          </button>
        </div>

        {/* ── KPI STRIP ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4"
             style={{ gap:10, marginBottom:24 }}>
          <KpiCard label="Total Requests" value={total}     sub="all time"             Icon={Layers}       delay={40}  />
          <KpiCard label="Active"         value={active}    sub="in progress"          Icon={Activity}     delay={80}  />
          <KpiCard label="Need Attention" value={pending}   sub="pending your action"  Icon={AlertCircle}  delay={120} accent="warning" />
          <KpiCard label="Delivered"      value={delivered} sub="completed"            Icon={CheckCircle2} delay={160} accent="success" />
        </div>

        {/* ── FILTER ROW ────────────────────────────────────────────── */}
        {/* NOTE: No CSS animation on this div to avoid creating a stacking context
                  that would trap the StatusFilter fixed dropdown */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      gap:12, marginBottom:10, flexWrap:"wrap",
                      opacity:1 /* explicit, not animated — see note above */ }}>

          {/* Type tabs — underline-style, premium SaaS (Linear/Vercel pattern) */}
          <div style={{ display:"flex", gap:0 }}>
            {FILTER_TABS.map(tab => {
              const isAct = typeFilter === tab.id;
              const count = tabCounts[tab.id] ?? 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id)}
                  style={{
                    display:        "inline-flex",
                    alignItems:     "center",
                    gap:            5,
                    fontSize:       13,
                    fontWeight:     isAct ? 600 : 400,
                    color:          isAct ? T.textPrimary : T.textTertiary,
                    background:     "transparent",
                    border:         "none",
                    borderBottom:   `2px solid ${isAct ? T.violet : "transparent"}`,
                    padding:        "6px 14px 8px",
                    cursor:         "pointer",
                    transition:     "color 150ms, border-color 150ms",
                    whiteSpace:     "nowrap",
                  }}
                  onMouseEnter={e => {
                    if (isAct) return;
                    (e.currentTarget as HTMLButtonElement).style.color = T.textSecondary;
                  }}
                  onMouseLeave={e => {
                    if (isAct) return;
                    (e.currentTarget as HTMLButtonElement).style.color = T.textTertiary;
                  }}
                >
                  {tab.label}
                  <span style={{
                    fontSize:     10,
                    fontWeight:   600,
                    color:        isAct ? "#A78BFA" : T.textMuted,
                    background:   isAct ? T.violetBg : "rgba(255,255,255,0.04)",
                    borderRadius: 9999,
                    padding:      "1px 5px",
                    lineHeight:   1.5,
                    minWidth:     18,
                    textAlign:    "center",
                    transition:   "color 150ms, background 150ms",
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <StatusFilter selected={statusFilter} onChange={setStatusFilter} />
        </div>

        {/* Thin line under filter tabs */}
        <div style={{ height:1, background:T.rowDivider, marginBottom:12 }} />

        {/* ── TABLE ─────────────────────────────────────────────────── */}
        <div style={{ animation:"_fadeUp 200ms ease 200ms both" }}>
          {loadingReqs ? (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height:64, borderRadius:12, background:"rgba(255,255,255,0.025)",
                                      border:`1px solid ${T.border}`, animation:"_shimmer 1.2s ease infinite" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background:T.cardBg, border:`1px solid ${T.border}`,
                          borderRadius:12, overflow:"hidden" }}>
              <EmptyState typeFilter={typeFilter} onNewRequest={() => openFunnel("greeting")} />
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block" style={{
                background:   T.tableBg,
                border:       `1px solid ${T.border}`,
                borderRadius: 12,
                overflow:     "hidden",
              }}>
                {/* Column header */}
                <div style={{
                  display:             "grid",
                  gridTemplateColumns: COLS,
                  alignItems:          "center",
                  height:              40,
                  paddingInline:       "18px 16px",
                  background:          T.headerBg,
                  borderBottom:        `1px solid ${T.rowDivider}`,
                }}>
                  {COL_HEADERS.map((h, i) => (
                    <span key={`h${i}`} style={{
                      fontSize:      10,
                      fontWeight:    600,
                      textTransform: "uppercase",
                      letterSpacing: "0.09em",
                      color:         T.textLabel,
                      textAlign:     h.align,
                      userSelect:    "none",
                    }}>
                      {h.label}
                    </span>
                  ))}
                </div>

                {/* Rows — no individual animation, no stacking context created */}
                {filtered.map((r, idx) => (
                  <TableRow
                    key={r.requestId}
                    request={r}
                    index={idx}
                    isLast={idx === filtered.length - 1}
                  />
                ))}
              </div>

              {/* Mobile */}
              <div className="md:hidden">
                {filtered.map((r, idx) => (
                  <MobileCard key={r.requestId} request={r} index={idx} />
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
