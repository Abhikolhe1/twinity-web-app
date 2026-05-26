"use client";

import { useMemo, useState } from "react";
import type { ApiTemplate } from "@/lib/api";

const TEMPLATE_GRADIENTS = [
  { from: "#1e3a5f", to: "#0f172a" },
  { from: "#312e81", to: "#1e1b4b" },
  { from: "#422006", to: "#1c1917" },
  { from: "#134e4a", to: "#042f2e" },
  { from: "#4c0519", to: "#2a0410" },
  { from: "#713f12", to: "#422006" },
];

export type SelectCampaignTemplateProps = {
  selectedId:  string | null;
  onSelect:    (id: string) => void;
  templates:   ApiTemplate[];
  loading:     boolean;
};

export function SelectCampaignTemplate({ selectedId, onSelect, templates, loading }: SelectCampaignTemplateProps) {
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }, [templates, search]);

  if (loading) {
    return (
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Select a Template</h2>
        <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Licensed formats with pre-cleared structure for commercial use.</p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-video w-full rounded-xl border border-black/[0.08] animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Select a Template</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Licensed formats with pre-cleared structure for commercial use.</p>

      {templates.length > 6 && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates…"
          className="mt-6 w-full max-w-sm rounded-lg border border-black/[0.09] bg-white px-3 py-2 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
        />
      )}

      {list.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: "rgba(15,10,30,0.45)" }}>No templates found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t, i) => {
            const g = TEMPLATE_GRADIENTS[i % TEMPLATE_GRADIENTS.length];
            const on = selectedId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect(t.id)}
                className={[
                  "group relative aspect-video w-full overflow-hidden rounded-xl border text-start transition-[border-color,box-shadow] duration-[180ms]",
                  on
                    ? "border-[#7C3AED] shadow-[0_0_0_3px_rgba(124,58,237,0.2)]"
                    : "border-black/[0.08] hover:border-black/[0.18]",
                ].join(" ")}
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                />
                <span className="absolute start-2 top-2 rounded bg-black/45 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                  Sample
                </span>
                {on && (
                  <span className="absolute end-3 top-3 flex size-8 items-center justify-center rounded-full bg-[#7C3AED] text-sm text-white shadow-lg">
                    ✓
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/90 to-transparent p-4 pt-14">
                  <span className="font-display text-xs font-bold uppercase tracking-wide text-white sm:text-sm">{t.name}</span>
                  {t.duration && (
                    <span className="rounded-md bg-black/50 px-2 py-0.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                      {t.duration}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-sm" style={{ color: "rgba(15,10,30,0.45)" }}>Templates are watermarked for preview. Final masters are delivered with license metadata.</p>
    </div>
  );
}
