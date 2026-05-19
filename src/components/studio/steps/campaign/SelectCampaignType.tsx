"use client";

import type { CampaignTypeId } from "@/lib/studio/campaign-funnel-data";
import { CAMPAIGN_TYPES } from "@/lib/studio/campaign-funnel-data";

export type SelectCampaignTypeProps = {
  selected: CampaignTypeId | null;
  onSelect: (id: CampaignTypeId) => void;
};

export function SelectCampaignType({ selected, onSelect }: SelectCampaignTypeProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Campaign Type</h2>
      <p className="mt-2 text-sm text-white/50">Choose the commercial objective that best matches your brief.</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAMPAIGN_TYPES.map((c) => {
          const on = selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={[
                "flex flex-col rounded-xl border bg-[#1F1F1F] p-5 text-start transition-[border-color,box-shadow] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                on
                  ? "border-[#7C3AED] shadow-[0_0_0_3px_rgba(124,58,237,0.2),0_0_28px_rgba(124,58,237,0.08)]"
                  : "border-white/[0.08] hover:border-white/[0.14]",
              ].join(" ")}
            >
              <span className="text-2xl" aria-hidden>
                {c.icon}
              </span>
              <span className="mt-3 font-display text-base font-semibold text-white">{c.title}</span>
              <span className="mt-2 flex-1 text-sm leading-relaxed text-white/50">{c.description}</span>
              <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#C4B5FD]">
                From SAR {c.fromSar.toLocaleString("en-SA")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
