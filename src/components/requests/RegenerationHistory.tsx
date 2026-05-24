"use client";

import React, { useState } from "react";
import { Loader2, XCircle } from "lucide-react";

import type { RegenerationAttempt, RegenerationAttemptStatus } from "@/lib/credits";

/* ── Props ───────────────────────────────────────────────────────────────── */
export type RegenerationHistoryProps = {
  attempts:        RegenerationAttempt[];
  onSelectAttempt: (attempt: RegenerationAttempt) => void;
};

/* ── Status badge colors ─────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<RegenerationAttemptStatus, {
  bg: string; border: string; color: string; label: string;
}> = {
  PENDING:    { bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.25)",  color: "#F59E0B", label: "Pending"    },
  PROCESSING: { bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.25)",  color: "#3B82F6", label: "Processing" },
  COMPLETE:   { bg: "rgba(34,197,94,0.10)",   border: "rgba(34,197,94,0.25)",   color: "#22C55E", label: "Complete"   },
  FAILED:     { bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.25)",   color: "#EF4444", label: "Failed"     },
};

/* ── Relative timestamp ──────────────────────────────────────────────────── */
function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ── Status badge component ─────────────────────────────────────────────── */
function StatusBadge({ status }: { status: RegenerationAttemptStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      fontSize:     10,
      fontWeight:   600,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      color:         cfg.color,
      background:    cfg.bg,
      border:        `1px solid ${cfg.border}`,
      borderRadius:  9999,
      padding:       "2px 7px",
      whiteSpace:    "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}

/* ── Attempt card ────────────────────────────────────────────────────────── */
function AttemptCard({
  attempt,
  versionNumber,
  onSelectAttempt,
}: {
  attempt:         RegenerationAttempt;
  versionNumber:   number;
  onSelectAttempt: (a: RegenerationAttempt) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const canView = attempt.status === "COMPLETE" && attempt.resultPreviewUrl;

  const truncatedPrompt =
    attempt.prompt.length > 60
      ? `${attempt.prompt.slice(0, 57)}…`
      : attempt.prompt;

  return (
    <div
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          12,
        background:   "#FFFFFF",
        border:       `1px solid ${hovered ? "rgba(124,58,237,0.25)" : "rgba(0,0,0,0.08)"}`,
        boxShadow:    hovered ? "0 2px 12px rgba(124,58,237,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        borderRadius: 12,
        padding:      "14px 16px",
        marginBottom: 8,
        cursor:       canView ? "pointer" : "default",
        transition:   "border-color 180ms",
        /* New attempt animate-in is triggered via parent className */
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => canView && onSelectAttempt(attempt)}
    >
      {/* Version badge */}
      <div
        style={{
          width:          24,
          height:         24,
          borderRadius:   6,
          background:     "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
          fontSize:       10,
          fontWeight:     700,
          color:          "#FFFFFF",
        }}
      >
        v{versionNumber}
      </div>

      {/* Center info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {attempt.prompt.trim() ? (
          <p style={{ fontSize: 13, fontWeight: 500, color: "#0F0A1E", margin: 0 }}>
            {truncatedPrompt}
          </p>
        ) : (
          <p style={{ fontSize: 13, fontStyle: "italic", color: "#606060", margin: 0 }}>
            Voice reference only
          </p>
        )}

        {/* Status row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <StatusBadge status={attempt.status} />
          <span style={{ fontSize: 11, color: "#606060" }}>
            · {formatRelative(attempt.createdAt)}
          </span>
          <span style={{ marginInlineStart: "auto", fontSize: 11, color: "#606060" }}>
            −{attempt.creditsCost} credit{attempt.creditsCost !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Right: action or status indicator */}
      <div style={{ flexShrink: 0 }}>
        {canView && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelectAttempt(attempt); }}
            style={{
              fontSize:     11,
              fontWeight:   500,
              color:        "rgba(15,10,30,0.45)",
              background:   "transparent",
              border:       "1px solid rgba(0,0,0,0.10)",
              borderRadius: 6,
              padding:      "4px 10px",
              cursor:       "pointer",
              transition:   "border-color 150ms, color 150ms",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "rgba(124,58,237,0.35)";
              el.style.color       = "#C4B5FD";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "rgba(0,0,0,0.10)";
              el.style.color       = "rgba(15,10,30,0.45)";
            }}
          >
            View
          </button>
        )}
        {(attempt.status === "PROCESSING" || attempt.status === "PENDING") && (
          <Loader2 size={14} color="#3B82F6" style={{ animation: "spin 1s linear infinite" }} />
        )}
        {attempt.status === "FAILED" && (
          <span title={attempt.failureReason ?? "Generation failed"}>
            <XCircle size={14} color="#EF4444" />
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function RegenerationHistory({
  attempts,
  onSelectAttempt,
}: RegenerationHistoryProps) {
  /* Do not render at all if no attempts */
  if (attempts.length === 0) return null;

  /* Sort newest first */
  const sorted = [...attempts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div>
      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{
          fontSize:      10,
          fontWeight:    600,
          color:         "#606060",
          letterSpacing: "0.10em",
          textTransform: "uppercase",
        }}>
          Previous Versions
        </span>
        <span style={{
          fontSize:     10,
          fontWeight:   600,
          color:        "#C4B5FD",
          background:   "rgba(124,58,237,0.10)",
          border:       "1px solid rgba(124,58,237,0.20)",
          borderRadius: 9999,
          padding:      "2px 8px",
        }}>
          {sorted.length} version{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Stagger entrance via scoped style */}
      <style>{`
        @keyframes attemptIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .regen-attempt-card {
          animation: attemptIn 220ms ease both;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div>
        {sorted.map((attempt, idx) => (
          <div
            key={attempt.id}
            className="regen-attempt-card"
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            {/* Version number is length - idx (newest = highest version) */}
            <AttemptCard
              attempt={attempt}
              versionNumber={sorted.length - idx}
              onSelectAttempt={onSelectAttempt}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
