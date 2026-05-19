"use client";

import { useMemo, useState } from "react";

import type { GreetingOccasionId, GreetingTemplateFilter } from "@/lib/studio/greeting-funnel-data";
import { GREETING_TEMPLATES } from "@/lib/studio/greeting-funnel-data";

const FILTERS: GreetingTemplateFilter[] = ["All", "Classic", "Fun & Energetic", "Emotional", "Elegant"];

function templatesForOccasion(occasion: GreetingOccasionId | null, filter: GreetingTemplateFilter) {
  const list =
    filter === "All" ? [...GREETING_TEMPLATES] : GREETING_TEMPLATES.filter((t) => t.filter === filter);
  if (occasion === "ramadan_eid") {
    const i = list.findIndex((t) => t.id === "gt5");
    if (i > 0) {
      const [ramadan] = list.splice(i, 1);
      list.unshift(ramadan);
    }
  }
  return list;
}

export type SelectGreetingTemplateProps = {
  occasion: GreetingOccasionId | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function SelectGreetingTemplate({ occasion, selectedId, onSelect }: SelectGreetingTemplateProps) {
  const [filter, setFilter] = useState<GreetingTemplateFilter>("All");
  const list = useMemo(() => templatesForOccasion(occasion, filter), [occasion, filter]);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Select a Template</h2>
      <p className="mt-2 text-sm text-white/50">How should the celebrity deliver the greeting?</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-[border-color,background-color,color] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
              filter === f
                ? "border border-[#7C3AED] bg-[rgba(124,58,237,0.15)] text-white"
                : "border border-white/[0.08] bg-[#1F1F1F] text-white/50 hover:border-amber-500/30 hover:text-white/80",
            ].join(" ")}
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
                  : "border-white/[0.08] hover:border-white/[0.25]",
              ].join(" ")}
            >
              <div
                className="absolute inset-0 bg-gradient-to-br"
                style={{ backgroundImage: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
              />
              <span className="absolute start-2 top-2 rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                Sample
              </span>
              {on ? (
                <span className="absolute end-3 top-3 flex size-8 items-center justify-center rounded-full bg-[#7C3AED] text-sm text-white shadow-lg">
                  ✓
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/85 to-transparent p-4 pt-14">
                <span className="font-display text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
                  {t.name}
                </span>
                <span className="rounded-md bg-black/45 px-2 py-0.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                  {t.durationLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-6 flex items-start gap-2 text-sm text-white/45">
        <span aria-hidden>ℹ️</span>
        <span>All templates are pre-approved and watermarked for preview only.</span>
      </p>
    </div>
  );
}
