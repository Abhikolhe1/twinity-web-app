"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";

/* ── Types ───────────────────────────────────────────────────────────────── */
export type TimelineEventType =
  | "REQUEST_CREATED"
  | "PAYMENT_AUTHORIZED"
  | "PAYMENT_CAPTURED"
  | "VALIDATION_PASSED"
  | "VALIDATION_FAILED"
  | "COMPLIANCE_REVIEW"
  | "APPROVAL_DECISION"
  | "EDIT_REQUESTED"
  | "CLIENT_REVISION_SUBMITTED"
  | "PROVIDER_JOB"
  | "PREVIEW_READY"
  | "LICENSE_ACTIVATED"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED"
  | "REFUND_PROCESSED"
  | "ADMIN_NOTE";

export type TimelineActor =
  | "CLIENT"
  | "CELEBRITY"
  | "MANAGER"
  | "SYSTEM"
  | "COMPLIANCE"
  | "ADMIN";

export type TimelineEvent = {
  id: string;
  eventType: TimelineEventType;
  actor: TimelineActor;
  label: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, string>;
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)   return "just now";
  const m = Math.floor(s / 60);
  if (m < 60)   return `${m} minute${m !== 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h} hour${h !== 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d < 30)   return `${d} day${d !== 1 ? "s" : ""} ago`;
  const mo = Math.floor(d / 30);
  return `${mo} month${mo !== 1 ? "s" : ""} ago`;
}

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString("en-SA", {
    year:    "numeric",
    month:   "short",
    day:     "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
    hour12:  true,
  });
}

/* ── Task 5.1: semantic dot colors per event type ────────────────────────── */
const EVENT_DOT_COLOR: Record<TimelineEventType, string> = {
  REQUEST_CREATED:           "#606060",
  PAYMENT_AUTHORIZED:        "#7C3AED",
  PAYMENT_CAPTURED:          "#7C3AED",
  VALIDATION_PASSED:         "#3B82F6",
  VALIDATION_FAILED:         "#EF4444",
  COMPLIANCE_REVIEW:         "#F59E0B",
  APPROVAL_DECISION:         "#22C55E",
  EDIT_REQUESTED:            "#F59E0B",
  CLIENT_REVISION_SUBMITTED: "#3B82F6",
  PROVIDER_JOB:              "#3B82F6",
  PREVIEW_READY:             "#3B82F6",
  LICENSE_ACTIVATED:         "#22C55E",
  DELIVERED:                 "#22C55E",
  REJECTED:                  "#EF4444",
  CANCELLED:                 "#606060",
  REFUND_PROCESSED:          "#606060",
  ADMIN_NOTE:                "#F59E0B",
};

/* ── Task 5.2: actor pill — visually distinct with borders ───────────────── */
const ACTOR_STYLE: Record<TimelineActor, {
  bg: string; text: string; border: string;
}> = {
  CLIENT:     { bg: "rgba(96,96,96,0.12)",   text: "#606060", border: "rgba(96,96,96,0.20)"   },
  CELEBRITY:  { bg: "rgba(124,58,237,0.12)", text: "#C4B5FD", border: "rgba(124,58,237,0.20)" },
  MANAGER:    { bg: "rgba(124,58,237,0.12)", text: "#C4B5FD", border: "rgba(124,58,237,0.20)" },
  SYSTEM:     { bg: "rgba(59,130,246,0.12)", text: "#3B82F6", border: "rgba(59,130,246,0.20)" },
  COMPLIANCE: { bg: "rgba(245,158,11,0.12)", text: "#F59E0B", border: "rgba(245,158,11,0.20)" },
  ADMIN:      { bg: "rgba(245,158,11,0.12)", text: "#F59E0B", border: "rgba(245,158,11,0.20)" },
};

/* ── Task 5.3: timestamp with hover tooltip showing absolute date ─────────── */
function TimestampCell({ iso }: { iso: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <time
      dateTime={iso}
      style={{ position: "relative", display: "inline-block", cursor: "default" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 11, color: "#606060" }}>
        {formatRelative(iso)}
      </span>
      {hovered && (
        <span
          role="tooltip"
          style={{
            position:  "absolute",
            bottom:    "calc(100% + 4px)",
            insetInlineStart: 0,
            background: "#FFFFFF",
            border:     "1px solid rgba(0,0,0,0.10)",
            borderRadius: 6,
            padding:    "4px 8px",
            fontSize:   10,
            color:      "rgba(15,10,30,0.55)",
            whiteSpace: "nowrap",
            zIndex:     10,
            pointerEvents: "none",
            boxShadow:  "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {formatAbsolute(iso)}
        </span>
      )}
    </time>
  );
}

/* ── Safe metadata keys — never expose internal refs ────────────────────── */
const SAFE_METADATA_KEYS = new Set([
  "channel",
  "territory",
  "duration",
  "amount_sar",
  "occasion",
  "template",
  "deliverable",
  "note",
]);

/* ── Single event card ───────────────────────────────────────────────────── */
function EventCard({ event }: { event: TimelineEvent }) {
  const [hovered, setHovered] = useState(false);

  const dotColor   = EVENT_DOT_COLOR[event.eventType];
  const actorStyle = ACTOR_STYLE[event.actor];
  const safeMetadata = event.metadata
    ? Object.fromEntries(
        Object.entries(event.metadata).filter(([k]) => SAFE_METADATA_KEYS.has(k)),
      )
    : null;

  return (
    <div style={{ display: "flex", gap: 16, position: "relative", zIndex: 1, marginBottom: 12 }}>
      {/* Dot */}
      <div
        style={{
          width:        16,
          height:       16,
          borderRadius: 9999,
          background:   dotColor,
          flexShrink:   0,
          marginTop:    16,
          border:       "2px solid #FFFFFF",
          boxShadow:    "0 0 0 1px rgba(0,0,0,0.10)",
        }}
      />

      {/* Task 5.4: event card with hover border transition */}
      <div
        style={{
          flex:         1,
          background:   "#FFFFFF",
          border:       `1px solid ${hovered ? "rgba(124,58,237,0.25)" : "rgba(0,0,0,0.08)"}`,
          borderRadius: 12,
          padding:      "12px 16px",
          minWidth:     0,
          transition:   "border-color 180ms",
          boxShadow:    hovered ? "0 2px 12px rgba(124,58,237,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Task 5.2: actor pill with border */}
        <span
          style={{
            display:       "inline-flex",
            alignItems:    "center",
            marginBottom:  6,
            fontSize:      9,
            fontWeight:    700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderRadius:  9999,
            padding:       "2px 8px",
            background:    actorStyle.bg,
            color:         actorStyle.text,
            border:        `1px solid ${actorStyle.border}`,
          }}
        >
          {event.actor}
        </span>

        {/* Label */}
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F0A1E", margin: 0 }}>
          {event.label}
        </p>

        {/* Description */}
        {event.description && (
          <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(15,10,30,0.50)", margin: "2px 0 0", lineHeight: 1.5 }}>
            {event.description}
          </p>
        )}

        {/* Safe metadata */}
        {safeMetadata && Object.keys(safeMetadata).length > 0 && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 1 }}>
            {Object.entries(safeMetadata).map(([k, v]) => (
              <span
                key={k}
                style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "#606060" }}
              >
                {k}: {v}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div style={{ marginTop: 6 }}>
          <TimestampCell iso={event.timestamp} />
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export type RequestTimelineProps = {
  events: TimelineEvent[];
};

export function RequestTimeline({ events }: RequestTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "40px 24px",
          background:     "#FFFFFF",
          border:         "1px solid rgba(0,0,0,0.08)",
          borderRadius:   16,
          textAlign:      "center",
          gap:            12,
          boxShadow:      "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <Clock size={28} color="rgba(0,0,0,0.18)" />
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F0A1E", margin: 0 }}>
          No activity recorded yet.
        </p>
        <p style={{ fontSize: 12, color: "#606060", margin: 0 }}>
          Your request is being prepared.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Task 5.5: "Activity" section label */}
      <span
        style={{
          display:       "block",
          fontSize:      10,
          fontWeight:    600,
          color:         "#606060",
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          marginBottom:  16,
        }}
      >
        Activity
      </span>

      <div style={{ position: "relative" }}>
        {/* Vertical connector line */}
        <div
          style={{
            position:         "absolute",
            insetInlineStart: 7,
            top:              8,
            bottom:           8,
            width:            1,
            background:       "rgba(0,0,0,0.10)",
            zIndex:           0,
          }}
          aria-hidden="true"
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          {sorted.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}
