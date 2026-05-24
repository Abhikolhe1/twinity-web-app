"use client";

import { useMemo, useState } from "react";

import type { FunnelCelebrity } from "@/lib/studio/studio-funnel-data";
import { FUNNEL_CELEBRITIES } from "@/lib/studio/studio-funnel-data";

const FILTERS = ["All", "Sports", "Music", "Entertainment", "Business", "TV"] as const;

export type SelectCelebrityProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function SelectCelebrity({ selectedId, onSelect }: SelectCelebrityProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const list = useMemo(() => {
    if (filter === "All") return FUNNEL_CELEBRITIES;
    return FUNNEL_CELEBRITIES.filter((c) => c.filter === filter);
  }, [filter]);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Select Celebrity</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.45)" }}>Choose who represents your brand</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-[background-color,border-color,color] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
              filter === f
                ? "border border-[#7C3AED] bg-[rgba(124,58,237,0.15)]"
                : "border border-black/[0.08] bg-white",
            ].join(" ")}
            style={{ color: filter === f ? "#0F0A1E" : "rgba(15,10,30,0.45)" }}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const on = selectedId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={[
                "flex flex-col overflow-hidden rounded-xl border bg-white text-start transition-[border-color,box-shadow] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                on ? "border-[#7C3AED] shadow-[0_0_0_3px_rgba(124,58,237,0.2)]" : "border-black/[0.08] hover:border-black/[0.12]",
              ].join(" ")}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[rgba(0,0,0,0.04)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
                {on ? (
                  <span className="absolute inset-0 ring-2 ring-inset ring-[#7C3AED]" aria-hidden />
                ) : null}
              </div>
              <div className="p-4">
                <p className="font-display text-base font-semibold" style={{ color: "#0F0A1E" }}>{c.name}</p>
                <span className="mt-2 inline-block rounded-md bg-[rgba(0,0,0,0.06)] px-2 py-0.5 text-[11px] ring-1 ring-black/[0.08]" style={{ color: "rgba(15,10,30,0.45)" }}>
                  {c.category}
                </span>
                <div className="mt-3 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#16A34A]" aria-hidden />
                  <span className="text-xs" style={{ color: "rgba(15,10,30,0.45)" }}>Available</span>
                </div>
                <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.55)" }}>From SAR {c.priceFromSar.toLocaleString("en-SA")}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
