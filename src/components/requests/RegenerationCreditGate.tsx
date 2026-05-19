"use client";

import React from "react";
import { AlertTriangle, Clock, Lock, Zap } from "lucide-react";

import type { CreditBalance } from "@/lib/credits";
import { REGENERATION_CREDIT_COST } from "@/lib/credits";

/* ── Props ───────────────────────────────────────────────────────────────── */
export type RegenerationCreditGateProps = {
  creditBalance:    CreditBalance;
  costPerAttempt?:  number;
  onPurchaseCredits?: () => void;
};

/* ── Relative date helper ────────────────────────────────────────────────── */
function formatRelativeDate(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const days  = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0)  return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} day${days !== 1 ? "s" : ""}`;
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function RegenerationCreditGate({
  creditBalance,
  costPerAttempt = REGENERATION_CREDIT_COST,
  onPurchaseCredits,
}: RegenerationCreditGateProps) {
  const { available, used, total, resetsAt } = creditBalance;
  const usedPct = total > 0 ? used / total : 0;
  const isLow   = available > 0 && available <= 3;
  const isEmpty = available === 0;

  /* Progress bar fill color: warning at 80%, danger at 95% */
  const barColor =
    usedPct >= 0.95 ? "#EF4444" :
    usedPct >= 0.80 ? "#F59E0B" :
    "linear-gradient(90deg, #8B5CF6 0%, #3D1A6E 100%)";

  const barStyle: React.CSSProperties =
    usedPct >= 0.95 || usedPct >= 0.80
      ? { background: barColor, width: `${Math.min(usedPct * 100, 100)}%` }
      : { background: barColor, width: `${Math.min(usedPct * 100, 100)}%` };

  return (
    <div
      style={{
        background:   "#161616",
        border:       "1px solid #2A2A2A",
        borderRadius: 12,
        padding:      "16px 20px",
      }}
    >
      {/* ── State B: Low credits warning (shown above, not blocking) ──────── */}
      {isLow && !isEmpty && (
        <div
          style={{
            display:                "flex",
            alignItems:             "flex-start",
            gap:                    10,
            background:             "rgba(245,158,11,0.08)",
            border:                 "1px solid rgba(245,158,11,0.20)",
            borderInlineStart:      "3px solid #F59E0B",
            borderStartStartRadius: 0,
            borderEndStartRadius:   0,
            borderStartEndRadius:   10,
            borderEndEndRadius:     10,
            padding:                "12px 16px",
            marginBottom:           14,
          }}
        >
          <AlertTriangle size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#F0F0F0", margin: 0 }}>
              Only {available} credit{available !== 1 ? "s" : ""} remaining
            </p>
            <p style={{ fontSize: 12, color: "#A0A0A0", marginTop: 3, margin: "3px 0 0" }}>
              Purchase more credits to continue regenerating.{" "}
              {onPurchaseCredits && (
                <button
                  type="button"
                  onClick={onPurchaseCredits}
                  style={{
                    background:     "transparent",
                    border:         "none",
                    color:          "#C4B5FD",
                    fontSize:       12,
                    fontWeight:     600,
                    cursor:         "pointer",
                    padding:        0,
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                  }}
                >
                  Buy credits →
                </button>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── State C: No credits — icon + buy CTA (inline, not an overlay) ─── */}
      {isEmpty && (
        <div
          style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            textAlign:      "center",
            padding:        "20px 0",
            gap:            8,
          }}
        >
          <div
            style={{
              width:          52,
              height:         52,
              borderRadius:   9999,
              background:     "#1E1E1E",
              border:         "1px solid #2A2A2A",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
          >
            <Lock size={22} color="#606060" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#F0F0F0", margin: "4px 0 0" }}>
            No credits remaining
          </p>
          <p style={{ fontSize: 13, color: "#A0A0A0", margin: "2px 0 0" }}>
            Purchase credits to regenerate your greeting.
          </p>
          {onPurchaseCredits && (
            <button
              type="button"
              onClick={onPurchaseCredits}
              style={{
                marginTop:      8,
                display:        "inline-flex",
                alignItems:     "center",
                gap:            6,
                height:         40,
                paddingInline:  20,
                borderRadius:   10,
                background:     "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)",
                color:          "#FFFFFF",
                fontWeight:     600,
                fontSize:       13,
                border:         "none",
                cursor:         "pointer",
                boxShadow:      "0 1px 3px rgba(0,0,0,0.40), 0 0 0 1px rgba(139,92,246,0.40)",
              }}
            >
              <Lock size={13} />
              Buy Credits
            </button>
          )}
        </div>
      )}

      {/* ── State A / D: Credit cost row + progress bar (always shown) ─────── */}
      {!isEmpty && (
        <>
          {/* Cost row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={14} color="#7C3AED" />
              <span style={{ fontSize: 13, color: "#A0A0A0" }}>
                {costPerAttempt} credit{costPerAttempt !== 1 ? "s" : ""} per regeneration
              </span>
            </div>
            {/* Balance pill */}
            <span
              style={{
                fontSize:     11,
                fontWeight:   600,
                color:        "#C4B5FD",
                background:   "rgba(124,58,237,0.10)",
                border:       "1px solid rgba(124,58,237,0.20)",
                borderRadius: 9999,
                padding:      "3px 10px",
                whiteSpace:   "nowrap",
              }}
            >
              {available} credit{available !== 1 ? "s" : ""} remaining
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              marginTop:    10,
              height:       4,
              borderRadius: 9999,
              background:   "#1E1E1E",
              overflow:     "hidden",
            }}
          >
            <div
              style={{
                height:       "100%",
                borderRadius: 9999,
                transition:   "width 400ms ease-out, background 300ms ease",
                ...barStyle,
              }}
            />
          </div>

          {/* Sub-label */}
          <div style={{ marginTop: 5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#606060" }}>
              {used} of {total} credits used
            </span>

            {/* State D: reset timer */}
            {resetsAt && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#606060" }}>
                <Clock size={11} color="#606060" />
                Credits reset {formatRelativeDate(resetsAt)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Exported credit balance pill (used in RegenerationStudio header) ─────── */
export function CreditBalancePill({
  available,
  onClick,
}: {
  available: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display:     "inline-flex",
        alignItems:  "center",
        gap:         5,
        fontSize:    11,
        fontWeight:  600,
        color:       available === 0 ? "#606060" : "#C4B5FD",
        background:  available === 0 ? "rgba(96,96,96,0.10)" : "rgba(124,58,237,0.10)",
        border:      available === 0 ? "1px solid rgba(96,96,96,0.20)" : "1px solid rgba(124,58,237,0.20)",
        borderRadius: 9999,
        padding:     "3px 10px",
        cursor:      onClick ? "pointer" : "default",
        whiteSpace:  "nowrap",
      }}
    >
      <Zap size={10} />
      {available} credit{available !== 1 ? "s" : ""}
    </button>
  );
}
