"use client";

import React, { useRef, useState } from "react";

/* ── Quick prompt suggestions ────────────────────────────────────────────── */
const QUICK_PROMPTS = [
  "Make it warmer and more personal",
  "Use a more energetic tone",
  "Make it shorter and punchier",
  "Add more emotion to the message",
] as const;

/* ── Props ───────────────────────────────────────────────────────────────── */
export type RegenerationPromptInputProps = {
  value:        string;
  onChange:     (value: string) => void;
  disabled:     boolean;
  maxLength?:   number;
  placeholder?: string;
  /** Override the quick-prompt suggestions list (default: QUICK_PROMPTS) */
  suggestions?: readonly string[];
};

/* ── Main component ──────────────────────────────────────────────────────── */
export function RegenerationPromptInput({
  value,
  onChange,
  disabled,
  maxLength   = 500,
  placeholder = "Describe what you'd like changed — tone, message, energy, delivery style…",
  suggestions = QUICK_PROMPTS,
}: RegenerationPromptInputProps) {
  const [focused, setFocused] = useState(false);
  const textareaRef           = useRef<HTMLTextAreaElement>(null);
  const charCount             = value.length;
  const charPct               = charCount / maxLength;

  const counterColor =
    charPct >= 1    ? "#EF4444" :
    charPct >= 0.80 ? "#F59E0B" :
    "#606060";

  function applyQuickPrompt(prompt: string) {
    if (disabled) return;
    const next = value.trim() === "" ? prompt : `${value.trimEnd()} — ${prompt}`;
    onChange(next.slice(0, maxLength));
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  return (
    <div>
      {/* Label */}
      <label>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#0F0A1E", margin: "0 0 2px" }}>
          Describe your changes
        </p>
        <p style={{ fontSize: 11, color: "#606060", margin: "0 0 10px", lineHeight: 1.5 }}>
          Describe what you&apos;d like changed — tone, message, energy, style.
        </p>

        {/* Textarea — matches GreetingFunnel + request page card style */}
        <div style={{ position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            placeholder={placeholder}
            rows={4}
            style={{
              display:        "block",
              width:          "100%",
              background:     "#FFFFFF",
              border:         `1px solid ${focused ? "#7C3AED" : "rgba(0,0,0,0.10)"}`,
              borderRadius:   10,
              padding:        "14px 16px",
              color:          "#0F0A1E",
              fontSize:       14,
              lineHeight:     1.6,
              minHeight:      100,
              resize:         "vertical",
              outline:        "none",
              transition:     "border-color 180ms, box-shadow 180ms",
              boxShadow:      focused ? "0 0 0 3px rgba(124,58,237,0.15)" : "none",
              opacity:        disabled ? 0.4 : 1,
              cursor:         disabled ? "not-allowed" : "text",
              pointerEvents:  disabled ? "none" : "auto",
              fontFamily:     "inherit",
            }}
          />

          {/* Placeholder color override via scoped style */}
          <style>{`
            textarea::placeholder { color: #606060; }
          `}</style>
        </div>
      </label>

      {/* Character counter */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: counterColor, transition: "color 150ms" }}>
          {charCount} / {maxLength}
        </span>
      </div>

      {/* Quick prompt pills */}
      {!disabled && (
        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: 11, color: "#606060", marginRight: 8 }}>
            Quick prompts:
          </span>
          <div
            style={{
              display:  "inline-flex",
              flexWrap: "wrap",
              gap:      6,
              marginTop: 4,
            }}
          >
            {suggestions.map((p) => (
              <QuickPromptPill
                key={p}
                label={p}
                onClick={() => applyQuickPrompt(p)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Quick prompt pill ───────────────────────────────────────────────────── */
function QuickPromptPill({
  label,
  onClick,
  disabled,
}: {
  label:    string;
  onClick:  () => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   "#F8F7FF",
        border:       `1px solid ${hovered ? "rgba(124,58,237,0.35)" : "rgba(0,0,0,0.10)"}`,
        borderRadius: 9999,
        padding:      "4px 12px",
        fontSize:     11,
        color:        hovered ? "#C4B5FD" : "rgba(15,10,30,0.45)",
        cursor:       "pointer",
        transition:   "border-color 150ms, color 150ms",
        whiteSpace:   "nowrap",
      }}
    >
      {label}
    </button>
  );
}
