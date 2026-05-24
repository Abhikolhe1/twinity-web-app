"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ApiCelebrity } from "@/lib/api";

export type SelectGreetingCelebrityProps = {
  celebrities: ApiCelebrity[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function SelectGreetingCelebrity({ celebrities, loading, selectedId, onSelect }: SelectGreetingCelebrityProps) {
  const [filter, setFilter] = useState("All");

  const industries = useMemo(() => {
    const set = new Set(celebrities.map((c) => c.industry).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [celebrities]);

  const list = useMemo(() => {
    if (filter === "All") return celebrities;
    return celebrities.filter((c) => c.industry === filter);
  }, [celebrities, filter]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 size={28} className="animate-spin" style={{ color: "rgba(15,10,30,0.40)" }} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Choose Your Celebrity</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Pick who delivers the greeting</p>
      {industries.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {industries.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={[
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-[border-color,background-color,color] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                filter === f
                  ? "border border-[#7C3AED] bg-[rgba(124,58,237,0.15)] text-[#7C3AED]"
                  : "border border-black/[0.08] bg-white hover:text-black/70",
              ].join(" ")}
              style={filter !== f ? { color: "rgba(15,10,30,0.50)" } : undefined}
            >
              {f}
            </button>
          ))}
        </div>
      )}
      {list.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: "rgba(15,10,30,0.40)" }}>No celebrities available yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const on = selectedId === c.id;
            const priceMin = c.price_range?.greeting?.min;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={[
                  "flex flex-col items-center rounded-xl border bg-white p-5 text-center transition-[border-color,box-shadow] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                  on
                    ? "border-[#7C3AED] shadow-[0_0_0_3px_rgba(124,58,237,0.2)]"
                    : "border-black/[0.08] hover:border-black/[0.12]",
                ].join(" ")}
              >
                <div className="relative">
                  {c.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.thumbnail_url}
                      alt=""
                      className={[
                        "size-24 rounded-full object-cover ring-2 ring-offset-2 ring-offset-white transition-[box-shadow] duration-[180ms]",
                        on ? "ring-[#7C3AED]" : "ring-transparent",
                      ].join(" ")}
                    />
                  ) : (
                    <div
                      className={[
                        "flex size-24 items-center justify-center rounded-full text-2xl font-bold text-white ring-2 ring-offset-2 ring-offset-white transition-[box-shadow] duration-[180ms]",
                        on ? "ring-[#7C3AED]" : "ring-transparent",
                      ].join(" ")}
                      style={{ background: c.avatar_color || "#7C3AED" }}
                    >
                      {c.initials}
                    </div>
                  )}
                  {on && (
                    <span className="absolute -end-1 -top-1 flex size-7 items-center justify-center rounded-full bg-[#7C3AED] text-xs font-bold text-white shadow-md">
                      ✓
                    </span>
                  )}
                </div>
                <p className="mt-4 font-display text-base font-semibold" style={{ color: "#0F0A1E" }}>{c.name}</p>
                {c.industry && (
                  <span className="mt-2 rounded-md bg-black/[0.05] px-2 py-0.5 text-[11px] ring-1 ring-black/[0.08]" style={{ color: "rgba(15,10,30,0.50)" }}>
                    {c.industry}
                  </span>
                )}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="size-2 rounded-full bg-[#16A34A]" aria-hidden />
                  <span className="text-xs" style={{ color: "rgba(15,10,30,0.50)" }}>Available</span>
                </div>
                <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.60)" }}>
                  {priceMin ? `From SAR ${priceMin.toLocaleString("en-SA")}` : "Contact for pricing"}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
