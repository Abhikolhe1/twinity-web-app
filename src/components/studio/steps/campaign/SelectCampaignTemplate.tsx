"use client";

import { useMemo, useState } from "react";

import type { CampaignTemplateFilter } from "@/lib/studio/campaign-funnel-data";
import { CAMPAIGN_TEMPLATES } from "@/lib/studio/campaign-funnel-data";

const FILTERS: CampaignTemplateFilter[] = ["All", "Cinematic", "UGC", "Product", "Brand Story", "Social"];

export type SelectCampaignTemplateProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function SelectCampaignTemplate({ selectedId, onSelect }: SelectCampaignTemplateProps) {
  const [filter, setFilter] = useState<CampaignTemplateFilter>("All");
  const list = useMemo(() => {
    let out =
      filter === "All" ? [...CAMPAIGN_TEMPLATES] : CAMPAIGN_TEMPLATES.filter((t) => t.filter === filter);
    if (filter === "Cinematic") {
      out = CAMPAIGN_TEMPLATES.filter((t) => t.filter === "Brand Story" || t.filter === "Product");
    }
    return out.length ? out : CAMPAIGN_TEMPLATES;
  }, [filter]);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Select a Template</h2>
      <p className="mt-2 text-sm text-white/50">Licensed formats with pre-cleared structure for commercial use.</p>
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
                : "border border-white/[0.08] bg-[#1F1F1F] text-white/50 hover:border-white/[0.14] hover:text-white/75",
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
                  : "border-white/[0.08] hover:border-white/[0.22]",
              ].join(" ")}
            >
              <div className="absolute inset-0 bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${t.from}, ${t.to})` }} />
              <span className="absolute start-2 top-2 rounded bg-black/45 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                Sample
              </span>
              {on ? (
                <span className="absolute end-3 top-3 flex size-8 items-center justify-center rounded-full bg-[#7C3AED] text-sm text-white shadow-lg">
                  ✓
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/90 to-transparent p-4 pt-14">
                <span className="font-display text-xs font-bold uppercase tracking-wide text-white sm:text-sm">{t.name}</span>
                <span className="rounded-md bg-black/50 px-2 py-0.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                  {t.durationLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-white/40">Templates are watermarked for preview. Final masters are delivered with license metadata.</p>
    </div>
  );
}
