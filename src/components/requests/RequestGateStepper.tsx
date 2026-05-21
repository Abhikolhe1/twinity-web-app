"use client";

import React from "react";
import { AlertTriangle, Check, Minus } from "lucide-react";

import type { GateStatus } from "@/lib/request-statuses";

/* ── Gate definitions (BRD v3.1 §3) ─────────────────────────────────────── */
const GATES: { id: number; label: string; estimated: string }[] = [
  { id: 1, label: "License Scope",       estimated: "Immediate"          },
  { id: 2, label: "Validation",           estimated: "~30 minutes"        },
  { id: 3, label: "Payment",              estimated: "Immediate"          },
  { id: 4, label: "Compliance Review",    estimated: "~1 business day"    },
  { id: 5, label: "Celebrity Approval",   estimated: "~2 business days"   },
  { id: 6, label: "Content Production",   estimated: "~1–2 business days" },
  { id: 7, label: "Preview Sign-off",     estimated: "~1 business day"    },
  { id: 8, label: "License Activation",   estimated: "Immediate"          },
  { id: 9, label: "Delivery",             estimated: "Immediate"          },
];

/** AD_IMAGE overrides — different labels for gates 6 and 7 */
const AD_IMAGE_GATE_LABEL_OVERRIDES: Partial<Record<number, string>> = {
  6: "Image Generation",
  7: "Preview Review",
};

/* ── Props ───────────────────────────────────────────────────────────────── */
export type RequestGateStepperProps = {
  currentGate: number;
  gateStatuses: Record<number, GateStatus>;
  requestType: "GREETING" | "CAMPAIGN" | "CUSTOM_CAMPAIGN" | "AD_IMAGE";
  /** When true, gate 4 (Compliance) is always shown as a full gate — never skipped */
  complianceRequired?: boolean;
};

/* ── Gate circle ─────────────────────────────────────────────────────────── */
function GateCircle({ status, gateId }: { status: GateStatus; gateId: number }) {
  const base: React.CSSProperties = {
    width:          36,
    height:         36,
    borderRadius:   9999,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
    position:       "relative",
  };

  if (status === "completed") {
    return (
      <div style={{
        ...base,
        background: "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)",
        boxShadow:  "0 0 12px rgba(139,92,246,0.30)",
      }}>
        <Check size={14} color="#FFFFFF" />
      </div>
    );
  }

  if (status === "active") {
    return (
      /*
       * Task 4.2: border-color pulse animation (1.4s ease-in-out infinite).
       * Uses className for the keyframe defined in the parent <style> block.
       */
      <div
        className="gate-active-circle"
        style={{
          ...base,
          background: "rgba(124,58,237,0.15)",
        }}
      >
        <span style={{ color: "#C4B5FD", fontWeight: 700, fontSize: 13, userSelect: "none" }}>
          {gateId}
        </span>
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div style={{
        ...base,
        background: "rgba(239,68,68,0.08)",
        border:     "1px solid #EF4444",
      }}>
        <AlertTriangle size={14} color="#EF4444" />
      </div>
    );
  }

  if (status === "skipped") {
    /* Task 4.5: dashed border, Minus icon — tooltip via title attribute */
    return (
      <div
        style={{
          ...base,
          background: "transparent",
          border:     "1px dashed #686868",
        }}
        title="Not required for this request type"
      >
        <Minus size={12} color="#606060" />
      </div>
    );
  }

  /* pending */
  return (
    <div style={{
      ...base,
      background: "#161616",
      border:     "1px solid #2A2A2A",
    }}>
      <span style={{ color: "#606060", fontWeight: 500, fontSize: 13, userSelect: "none" }}>
        {gateId}
      </span>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function RequestGateStepper({ gateStatuses, requestType, complianceRequired }: RequestGateStepperProps) {
  /* For AD_IMAGE: gate 4 (Compliance) is NEVER skipped */
  const resolvedStatuses: Record<number, GateStatus> = { ...gateStatuses };
  if ((requestType === "AD_IMAGE" || complianceRequired) && resolvedStatuses[4] === "skipped") {
    resolvedStatuses[4] = "pending";
  }

  /* Gate label resolver — AD_IMAGE overrides gates 6 + 7 */
  function gateLabel(id: number, defaultLabel: string): string {
    if (requestType === "AD_IMAGE") {
      return AD_IMAGE_GATE_LABEL_OVERRIDES[id] ?? defaultLabel;
    }
    return defaultLabel;
  }

  return (
    <>
      {/* Keyframes — scoped to this component */}
      <style>{`
        @keyframes gatePulse {
          0%, 100% { border-color: rgba(124,58,237,0.6); }
          50%       { border-color: rgba(124,58,237,1.0); }
        }
        .gate-active-circle {
          border: 2px solid rgba(124,58,237,0.6);
          animation: gatePulse 1.4s ease-in-out infinite;
        }
      `}</style>

      {/* Task 4.6: card matches Studio Home dark-solid card pattern */}
      <div
        style={{
          background:   "#161616",
          border:       "1px solid #2A2A2A",
          borderRadius: 16,
          padding:      24,
          width:        "100%",
        }}
      >
        {/* ── Desktop: horizontal row ────────────────────────────────────── */}
        <div className="hidden md:flex items-start">
          {GATES.filter(g => !(g.id === 4 && requestType === "GREETING")).map((gate, idx, arr) => {
            const status    = resolvedStatuses[gate.id] ?? "pending";
            const isLast    = idx === arr.length - 1;
            const isActive  = status === "active";
            const isSkipped = status === "skipped";
            const isDone    = status === "completed";

            return (
              <React.Fragment key={gate.id}>
                {/* Gate column */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0, flex: 1 }}>
                  <GateCircle status={status} gateId={gate.id} />

                  {/* Task 4.3: labels with distinct colors per state */}
                  <div style={{ marginTop: 8, textAlign: "center", minWidth: 0, padding: "0 4px" }}>
                    <p style={{
                      fontSize:   11,
                      fontWeight: isActive ? 600 : 500,
                      color:      isActive  ? "#C4B5FD"
                                : isDone    ? "#A0A0A0"
                                : isSkipped ? "#686868"
                                : "#606060",
                      lineHeight: 1.3,
                    }}>
                      {gateLabel(gate.id, gate.label)}
                    </p>
                    {isActive && (
                      <p style={{
                        fontSize:      10,
                        fontWeight:    600,
                        color:         "#7C3AED",
                        marginTop:     2,
                        lineHeight:    1.3,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}>
                        In progress
                      </p>
                    )}
                    {/* Task 4.4: estimated time on pending gates */}
                    {status === "pending" && !isSkipped && (
                      <p style={{ fontSize: 10, fontWeight: 400, color: "#606060", marginTop: 2, lineHeight: 1.3 }}>
                        {gate.estimated}
                      </p>
                    )}
                  </div>
                </div>

                {/* Task 4.1: connector lines — gradient for completed, #2A2A2A pending */}
                {!isLast && (
                  <div style={{ flex: "0 0 20px", marginTop: 17, minWidth: 8 }}>
                    {isDone ? (
                      <div style={{
                        height:     2,
                        background: "linear-gradient(90deg, #8B5CF6 0%, #3D1A6E 100%)",
                        borderRadius: 1,
                      }} />
                    ) : (
                      <div style={{ height: 1, background: "#2A2A2A" }} />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Mobile: vertical list ──────────────────────────────────────── */}
        <div className="flex flex-col gap-3 md:hidden">
          {GATES.filter(g => !(g.id === 4 && requestType === "GREETING")).map((gate, idx, arr) => {
            const status    = resolvedStatuses[gate.id] ?? "pending";
            const isLast    = idx === arr.length - 1;
            const isActive  = status === "active";
            const isSkipped = status === "skipped";
            const isDone    = status === "completed";

            return (
              <React.Fragment key={gate.id}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                  title={isSkipped ? "Not required for this request type" : undefined}
                >
                  <GateCircle status={status} gateId={gate.id} />

                  {/* Label + hint */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                      fontSize:   12,
                      fontWeight: isActive ? 600 : 500,
                      color:      isActive  ? "#C4B5FD"
                                : isDone    ? "#A0A0A0"
                                : isSkipped ? "#686868"
                                : "#606060",
                      lineHeight: 1.3,
                    }}>
                      {gateLabel(gate.id, gate.label)}
                      {isSkipped && (
                        <span style={{ marginInlineStart: 6, fontSize: 10, color: "#606060", fontWeight: 400 }}>
                          — skipped
                        </span>
                      )}
                    </p>
                    {isActive && (
                      <p style={{
                        fontSize:      10,
                        fontWeight:    600,
                        color:         "#7C3AED",
                        marginTop:     2,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}>
                        In progress
                      </p>
                    )}
                    {status === "pending" && !isSkipped && (
                      <p style={{ fontSize: 10, color: "#606060", marginTop: 2 }}>
                        {gate.estimated}
                      </p>
                    )}
                  </div>

                  {/* Status chip on right */}
                  <div style={{ flexShrink: 0 }}>
                    {isDone && (
                      <span style={{ fontSize: 10, color: "#22C55E", fontWeight: 500 }}>Done</span>
                    )}
                    {status === "blocked" && (
                      <span style={{ fontSize: 10, color: "#EF4444", fontWeight: 500 }}>Blocked</span>
                    )}
                    {isActive && (
                      <span style={{ fontSize: 10, color: "#7C3AED", fontWeight: 500 }}>Active</span>
                    )}
                  </div>
                </div>

                {/* Vertical connector between gates */}
                {!isLast && (
                  <div style={{
                    width:       2,
                    height:      12,
                    marginInlineStart: 17,
                    background:  isDone
                      ? "linear-gradient(180deg, #8B5CF6 0%, #3D1A6E 100%)"
                      : "#2A2A2A",
                    borderRadius: 1,
                    flexShrink:  0,
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Task 4.5: remove verbose inline text — tooltip on the skipped gate handles it */}
        {requestType === "CUSTOM_CAMPAIGN" && (
          <p style={{ marginTop: 12, fontSize: 10, color: "#606060", textAlign: "center" }}>
            Gate 6 (Content Production) is not required for upload-only Custom Campaign requests.
          </p>
        )}
      </div>
    </>
  );
}
