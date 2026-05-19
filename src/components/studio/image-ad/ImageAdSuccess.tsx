"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ImageAdSuccessProps {
  onViewRequest:  () => void;
  onBackToStudio: () => void;
}

export function ImageAdSuccess({ onViewRequest, onBackToStudio }: ImageAdSuccessProps) {
  return (
    <>
      <style>{`
        @keyframes _successIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1);    }
        }
      `}</style>

      {/* Fixed overlay */}
      <div
        style={{
          position:       "fixed",
          inset:          0,
          zIndex:         50,
          background:     "rgba(13,13,13,0.96)",
          backdropFilter: "blur(10px)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        24,
        }}
      >
        {/* Content card */}
        <div
          style={{
            background:    "var(--color-surface)",
            border:        "1px solid var(--color-border)",
            borderRadius:  "var(--radius-xl)",
            padding:       40,
            maxWidth:      400,
            width:         "100%",
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           16,
            textAlign:     "center",
            animation:     "_successIn 300ms cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <CheckCircle2 size={52} color="var(--color-success)" />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h2 style={{
              fontSize:      22,
              fontWeight:    800,
              color:         "var(--color-text)",
              letterSpacing: "-0.025em",
              margin:        0,
            }}>
              Request submitted!
            </h2>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>
              Your Image Ad is now in review.
            </p>
          </div>

          <span style={{
            fontFamily:    "var(--font-mono, monospace)",
            fontSize:      12,
            color:         "var(--color-text-muted)",
            background:    "var(--color-surface-2)",
            paddingInline:  12,
            paddingBlock:   6,
            borderRadius:  "var(--radius-md)",
            display:       "inline-block",
          }}>
            ORD-2026-AD001
          </span>

          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
            You will be notified at each approval stage.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 8 }}>
            <button
              type="button"
              onClick={onViewRequest}
              style={{
                width:        "100%",
                height:       44,
                borderRadius: "var(--radius-lg)",
                background:   "var(--gradient-brand)",
                border:       "none",
                color:        "#FFFFFF",
                fontSize:     14,
                fontWeight:   600,
                cursor:       "pointer",
                transition:   "box-shadow var(--transition)",
                boxShadow:    "none",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              View Request
            </button>
            <button
              type="button"
              onClick={onBackToStudio}
              style={{
                width:        "100%",
                height:       44,
                borderRadius: "var(--radius-lg)",
                background:   "transparent",
                border:       "1px solid var(--color-border)",
                color:        "var(--color-text-secondary)",
                fontSize:     14,
                fontWeight:   600,
                cursor:       "pointer",
                transition:   "border-color var(--transition), color var(--transition)",
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = "var(--color-border-strong)";
                b.style.color = "var(--color-text)";
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = "var(--color-border)";
                b.style.color = "var(--color-text-secondary)";
              }}
            >
              Back to Studio
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
