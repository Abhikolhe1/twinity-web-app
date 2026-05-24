"use client";

import { useMemo, useState } from "react";

import { TEMPLATE_ITEMS } from "@/lib/studio/studio-funnel-data";

const FILTERS = ["All", "Cinematic", "UGC Style", "Product Promo", "Brand Story"] as const;

export type SelectTemplateProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function SelectTemplate({ selectedId, onSelect }: SelectTemplateProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const list = useMemo(() => {
    if (filter === "All") return TEMPLATE_ITEMS;
    return TEMPLATE_ITEMS.filter((t) => t.category === filter);
  }, [filter]);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Select Template</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.45)" }}>Choose how your campaign will look and feel</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-[background-color,border-color,color] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
              filter === f
                ? "border border-[#7C3AED] bg-[rgba(124,58,237,0.15)]"
                : "border border-black/[0.08] bg-white hover:border-black/[0.12]",
            ].join(" ")}
            style={{ color: filter === f ? "#0F0A1E" : "rgba(15,10,30,0.45)" }}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => {
          const on = selectedId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={[
                "group relative aspect-video w-full overflow-hidden rounded-xl border text-start transition-[border-color,box-shadow] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                on
                  ? "border-[#7C3AED] shadow-[0_0_0_3px_rgba(124,58,237,0.2)]"
                  : "border-black/[0.08] hover:border-black/[0.12]",
              ].join(" ")}
            >
              <div
                className="absolute inset-0 bg-gradient-to-br"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                }}
              />
              <span className="absolute start-2 top-2 rounded bg-black/45 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                Sample
              </span>
              {on ? (
                <span className="absolute end-3 top-3 flex size-8 items-center justify-center rounded-full bg-[#7C3AED] text-sm text-white shadow-lg">
                  ✓
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                <span className="font-display text-sm font-bold uppercase tracking-wide text-white">{t.name}</span>
                <span className="rounded-md bg-black/50 px-2 py-0.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                  {t.durationLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
