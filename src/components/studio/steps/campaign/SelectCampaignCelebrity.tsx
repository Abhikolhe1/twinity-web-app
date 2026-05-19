"use client";

import { useMemo, useState } from "react";

import type { CampaignCelebrityFilter } from "@/lib/studio/campaign-funnel-data";
import { CAMPAIGN_CELEBRITIES } from "@/lib/studio/campaign-funnel-data";

const FILTERS: CampaignCelebrityFilter[] = ["All", "Music", "Entertainment", "Sports", "TV", "Business"];

export type SelectCampaignCelebrityProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function SelectCampaignCelebrity({ selectedId, onSelect }: SelectCampaignCelebrityProps) {
  const [filter, setFilter] = useState<CampaignCelebrityFilter>("All");
  const list = useMemo(() => {
    if (filter === "All") return CAMPAIGN_CELEBRITIES;
    return CAMPAIGN_CELEBRITIES.filter((c) => c.filter === filter);
  }, [filter]);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Select Talent</h2>
      <p className="mt-2 text-sm text-white/50">Commercial bookings require manager approval and governed usage.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-[border-color,background-color,color] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
              filter === f
                ? "border border-[#7C3AED] bg-[rgba(124,58,237,0.15)] text-white"
                : "border border-white/[0.08] bg-[#1F1F1F] text-white/50 hover:text-white/70",
            ].join(" ")}
          >
            {f}
          </button>
        ))}
      </div>
      <p className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-100/80">
        Commercial approval required — talent availability and category restrictions apply before production.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const on = selectedId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={[
                "flex flex-col items-center rounded-xl border bg-[#1F1F1F] p-5 text-center transition-[border-color,box-shadow] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                on ? "border-[#7C3AED] shadow-[0_0_0_3px_rgba(124,58,237,0.2)]" : "border-white/[0.08] hover:border-white/[0.12]",
              ].join(" ")}
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.imageUrl}
                  alt=""
                  className={[
                    "size-24 rounded-full object-cover ring-2 ring-offset-2 ring-offset-[#1F1F1F] transition-[box-shadow] duration-[180ms]",
                    on ? "ring-[#7C3AED]" : "ring-transparent",
                  ].join(" ")}
                />
                {on ? (
                  <span className="absolute -end-1 -top-1 flex size-7 items-center justify-center rounded-full bg-[#7C3AED] text-xs font-bold text-white shadow-md">
                    ✓
                  </span>
                ) : null}
              </div>
              <p className="mt-4 font-display text-base font-semibold text-white">{c.name}</p>
              <span className="mt-2 rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/50 ring-1 ring-white/[0.08]">
                {c.categoryTag}
              </span>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="size-2 rounded-full bg-[#22C55E]" aria-hidden />
                <span className="text-xs text-white/50">Available</span>
              </div>
              <p className="mt-2 text-sm text-white/60">From SAR {c.priceFromSar.toLocaleString("en-SA")}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
