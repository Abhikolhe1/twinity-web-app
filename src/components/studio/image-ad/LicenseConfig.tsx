"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

import {
  DURATIONS,
  TERRITORIES,
  type Duration,
  type Territory,
  type AdPricingResult,
} from "@/lib/studio/image-ad-pricing";

/* ── Types ─────────────────────────────────────────────────────────── */
interface LicenseConfigProps {
  duration:            Duration;
  onDurationChange:    (d: Duration) => void;
  territory:           Territory;
  onTerritoryChange:   (t: Territory) => void;
  exclusivity:         boolean;
  onExclusivityChange: (v: boolean) => void;
  pricing:             AdPricingResult;
}

/* ── Component ─────────────────────────────────────────────────────── */
export function LicenseConfig({
  duration,
  onDurationChange,
  territory,
  onTerritoryChange,
  exclusivity,
  onExclusivityChange,
  pricing,
}: LicenseConfigProps) {
  const exclAddon = exclusivity && pricing ? pricing.excl : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Duration + Territory side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {/* Duration */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{ fontSize: 9, color: "var(--color-text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Duration
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={duration}
              onChange={(e) => onDurationChange(e.target.value as Duration)}
              style={{
                width:              "100%",
                height:             32,
                paddingInline:      9,
                paddingInlineEnd:   26,
                appearance:         "none",
                background:         "var(--color-surface-2)",
                border:             "1px solid var(--color-border)",
                borderRadius:       "var(--radius-md)",
                color:              "var(--color-text)",
                fontSize:           11,
                cursor:             "pointer",
                outline:            "none",
                transition:         "border-color var(--transition)",
              }}
              onFocus={(e) => { (e.currentTarget as HTMLSelectElement).style.borderColor = "var(--color-accent)"; }}
              onBlur={(e)  => { (e.currentTarget as HTMLSelectElement).style.borderColor = "var(--color-border)"; }}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown size={10} color="var(--color-text-muted)" style={{ position: "absolute", insetInlineEnd: 7, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Territory */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{ fontSize: 9, color: "var(--color-text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Territory
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={territory}
              onChange={(e) => onTerritoryChange(e.target.value as Territory)}
              style={{
                width:            "100%",
                height:           32,
                paddingInline:    9,
                paddingInlineEnd: 26,
                appearance:       "none",
                background:       "var(--color-surface-2)",
                border:           "1px solid var(--color-border)",
                borderRadius:     "var(--radius-md)",
                color:            "var(--color-text)",
                fontSize:         11,
                cursor:           "pointer",
                outline:          "none",
                transition:       "border-color var(--transition)",
              }}
              onFocus={(e) => { (e.currentTarget as HTMLSelectElement).style.borderColor = "var(--color-accent)"; }}
              onBlur={(e)  => { (e.currentTarget as HTMLSelectElement).style.borderColor = "var(--color-border)"; }}
            >
              {TERRITORIES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown size={10} color="var(--color-text-muted)" style={{ position: "absolute", insetInlineEnd: 7, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>
      </div>

      {/* Exclusivity toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text)", margin: 0 }}>Exclusivity</p>
          <p style={{ fontSize: 9, color: "var(--color-text-muted)", margin: "1px 0 0" }}>Prevent same use by others.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
          {exclusivity && exclAddon != null && (
            <span style={{ fontSize: 9, fontWeight: 600, color: "var(--color-warning)", background: "rgba(245,158,11,0.10)", paddingInline: 7, paddingBlock: 2, borderRadius: "var(--radius-full)", whiteSpace: "nowrap" }}>
              +SAR&nbsp;{exclAddon.toLocaleString()}
            </span>
          )}
          <button
            type="button"
            role="switch"
            aria-checked={exclusivity}
            onClick={() => onExclusivityChange(!exclusivity)}
            style={{
              width:        34,
              height:       18,
              borderRadius: "var(--radius-full)",
              background:   exclusivity ? "var(--color-accent)" : "var(--color-surface-3)",
              border:       `1px solid ${exclusivity ? "var(--color-accent)" : "var(--color-border)"}`,
              padding:      2,
              cursor:       "pointer",
              transition:   "background var(--transition)",
              display:      "flex",
              alignItems:   "center",
              flexShrink:   0,
            }}
          >
            <div
              style={{
                width:        12,
                height:       12,
                borderRadius: "50%",
                background:   "#FFFFFF",
                transform:    exclusivity ? "translateX(16px)" : "translateX(0)",
                transition:   "transform 150ms cubic-bezier(0.16,1,0.3,1)",
                boxShadow:    "0 1px 3px rgba(0,0,0,0.4)",
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
