"use client";

import React, { useState, useMemo } from "react";
import { Check, Search, ShieldCheck } from "lucide-react";

import {
  FUNNEL_CELEBRITIES,
  type FunnelCelebrity,
} from "@/lib/studio/studio-funnel-data";

/* ── Style tags per category ───────────────────────────────────────── */
const STYLE_TAGS: Record<FunnelCelebrity["filter"], string[]> = {
  Sports:        ["Athletic", "Lifestyle"],
  Music:         ["Artistry", "Fashion"],
  Entertainment: ["Luxury", "Versatile"],
  Business:      ["Professional", "Premium"],
  TV:            ["Relatable", "Comedy"],
};

type FilterCategory = "All" | FunnelCelebrity["filter"];
const CATEGORIES: FilterCategory[] = ["All", "Sports", "Music", "Entertainment", "Business", "TV"];

interface CelebrityPickerProps {
  selected: FunnelCelebrity | null;
  onSelect: (c: FunnelCelebrity) => void;
}

export function CelebrityPicker({ selected, onSelect }: CelebrityPickerProps) {
  const [query,    setQuery]    = useState("");
  const [category, setCategory] = useState<FilterCategory>("All");
  const [hovered,  setHovered]  = useState<string | null>(null);
  const [pressed,  setPressed]  = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return FUNNEL_CELEBRITIES.filter((c) => {
      const matchSearch   = !q || c.name.toLowerCase().includes(q);
      const matchCategory = category === "All" || c.filter === category;
      return matchSearch && matchCategory;
    }).slice(0, 8);
  }, [query, category]);

  function handleCardClick(c: FunnelCelebrity) {
    setPressed(c.id);
    setTimeout(() => setPressed(null), 200);
    onSelect(c);
  }

  return (
    <div>
      {/* Search input */}
      <div style={{ position: "relative" }}>
        <Search
          size={13}
          style={{
            position:         "absolute",
            insetInlineStart: 9,
            top:              "50%",
            transform:        "translateY(-50%)",
            color:            "var(--color-text-muted)",
            pointerEvents:    "none",
          }}
        />
        <input
          type="text"
          placeholder="Search celebrities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width:              "100%",
            height:             34,
            paddingInlineStart: 29,
            paddingInlineEnd:   10,
            background:         "var(--color-surface-2)",
            border:             "1px solid var(--color-border)",
            borderRadius:       "var(--radius-md)",
            color:              "var(--color-text)",
            fontSize:           12,
            outline:            "none",
            transition:         "border-color var(--transition)",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = "var(--color-accent)";
            (e.currentTarget as HTMLInputElement).style.boxShadow   = "0 0 0 3px rgba(124,58,237,0.12)";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = "var(--color-border)";
            (e.currentTarget as HTMLInputElement).style.boxShadow   = "none";
          }}
        />
      </div>

      {/* Category filter pills */}
      <div style={{ display: "flex", gap: 5, marginTop: 7, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => {
          const on = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              style={{
                flexShrink:    0,
                height:        24,
                paddingInline: 9,
                fontSize:      10,
                fontWeight:    on ? 600 : 400,
                borderRadius:  "var(--radius-full)",
                border:        `1px solid ${on ? "var(--color-accent)" : "var(--color-border)"}`,
                background:    on ? "var(--color-accent-subtle)" : "var(--color-surface-2)",
                color:         on ? "var(--color-text-accent)" : "var(--color-text-muted)",
                cursor:        "pointer",
                transition:    "all var(--transition)",
                whiteSpace:    "nowrap",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Celebrity grid — 4 columns */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap:                 6,
          marginTop:           8,
        }}
      >
        {filtered.map((c) => {
          const isSelected = selected?.id === c.id;
          const isHovered  = hovered === c.id;
          const isPressed  = pressed === c.id;
          const tags       = STYLE_TAGS[c.filter];

          return (
            <div
              key={c.id}
              style={{ position: "relative" }}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <button
                type="button"
                onClick={() => handleCardClick(c)}
                style={{
                  width:          "100%",
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  gap:            5,
                  padding:        "9px 6px",
                  borderRadius:   "var(--radius-md)",
                  border:         `1px solid ${isSelected ? "var(--color-accent)" : isHovered ? "var(--color-border-strong)" : "var(--color-border)"}`,
                  background:     isSelected ? "var(--color-accent-subtle)" : "var(--color-surface)",
                  cursor:         "pointer",
                  position:       "relative",
                  transform:      isPressed ? "scale(0.96)" : isHovered ? "translateY(-1px)" : "none",
                  transition:     "all var(--transition)",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width:          34,
                    height:         34,
                    borderRadius:   "50%",
                    background:     "var(--gradient-brand)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       12,
                    fontWeight:     700,
                    color:          "#FFFFFF",
                    overflow:       "hidden",
                    position:       "relative",
                    boxShadow:      isSelected ? "0 0 10px rgba(139,92,246,0.35)" : "none",
                    transition:     "box-shadow var(--transition)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <span style={{ position: "relative", zIndex: 1 }}>{c.name.slice(0, 1)}</span>
                </div>

                {/* Name */}
                <span
                  style={{
                    fontSize:     10,
                    fontWeight:   600,
                    color:        isSelected ? "var(--color-text-accent)" : "var(--color-text)",
                    textAlign:    "center",
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace:   "nowrap",
                    width:        "100%",
                  }}
                >
                  {c.name.split(" ")[0]}
                </span>

                {/* Category */}
                <span style={{ fontSize: 9, color: "var(--color-text-muted)", textAlign: "center" }}>
                  {c.filter}
                </span>

                {/* Selected checkmark */}
                {isSelected && (
                  <div
                    style={{
                      position:       "absolute",
                      top:            5,
                      insetInlineEnd: 5,
                      width:          13,
                      height:         13,
                      borderRadius:   "50%",
                      background:     "var(--gradient-brand)",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={7} color="#FFFFFF" strokeWidth={3} />
                  </div>
                )}
              </button>

              {/* Hover expansion overlay */}
              {isHovered && (
                <div
                  style={{
                    position:     "absolute",
                    top:          "calc(100% + 4px)",
                    insetInlineStart: 0,
                    insetInlineEnd:   0,
                    background:   "var(--color-surface-2)",
                    border:       "1px solid var(--color-border-strong)",
                    borderRadius: "var(--radius-md)",
                    padding:      "8px 10px",
                    zIndex:       30,
                    display:      "flex",
                    flexDirection:"column",
                    gap:          6,
                    boxShadow:    "0 8px 24px rgba(0,0,0,0.6)",
                    animation:    "_cardHover 120ms ease both",
                  }}
                >
                  {/* Licensed badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <ShieldCheck size={10} color="var(--color-success)" />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--color-success)" }}>Licensed</span>
                  </div>

                  {/* Style tags */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize:      9,
                          paddingInline: 6,
                          paddingBlock:  2,
                          background:    "var(--color-surface-3)",
                          border:        "1px solid var(--color-border)",
                          borderRadius:  "var(--radius-full)",
                          color:         "var(--color-text-muted)",
                          whiteSpace:    "nowrap",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Quick preview button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(c);
                    }}
                    style={{
                      height:        22,
                      paddingInline: 8,
                      fontSize:      9,
                      fontWeight:    600,
                      borderRadius:  "var(--radius-full)",
                      border:        "1px solid var(--color-border-accent)",
                      background:    "var(--color-accent-subtle)",
                      color:         "var(--color-text-accent)",
                      cursor:        "pointer",
                      whiteSpace:    "nowrap",
                      width:         "100%",
                    }}
                  >
                    Quick preview
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", paddingBlock: 20, textAlign: "center", fontSize: 11, color: "var(--color-text-muted)" }}>
            No celebrities match
          </div>
        )}
      </div>

      <style>{`
        @keyframes _cardHover { from { opacity:0; transform:translateY(-3px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
