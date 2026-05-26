"use client";

import { useMemo, useState } from "react";
import type { ApiCelebrity } from "@/lib/api";

export type SelectCampaignCelebrityProps = {
  selectedId:   string | null;
  onSelect:     (id: string) => void;
  celebrities:  ApiCelebrity[];
  loading:      boolean;
};

export function SelectCampaignCelebrity({ selectedId, onSelect, celebrities, loading }: SelectCampaignCelebrityProps) {
  const [search, setSearch] = useState("");

  const industries = useMemo(() => {
    const set = new Set(celebrities.map((c) => c.industry).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [celebrities]);

  const [filter, setFilter] = useState("All");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = filter === "All" ? celebrities : celebrities.filter((c) => c.industry === filter);
    if (q) out = out.filter((c) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
    return out;
  }, [celebrities, filter, search]);

  if (loading) {
    return (
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Select Talent</h2>
        <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Commercial bookings require manager approval and governed usage.</p>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center rounded-xl border border-black/[0.08] bg-white p-5 animate-pulse">
              <div className="size-24 rounded-full bg-gray-200" />
              <div className="mt-4 h-4 w-24 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-16 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Select Talent</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Commercial bookings require manager approval and governed usage.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {industries.map((ind) => (
          <button
            key={ind}
            type="button"
            onClick={() => setFilter(ind)}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-[border-color,background-color,color] duration-[180ms]",
              filter === ind
                ? "border border-[#7C3AED] bg-[rgba(124,58,237,0.15)]"
                : "border border-black/[0.08] bg-white hover:border-black/[0.14]",
            ].join(" ")}
            style={filter === ind ? { color: "#7C3AED" } : { color: "rgba(15,10,30,0.50)" }}
          >
            {ind}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="ml-auto w-36 rounded-lg border border-black/[0.09] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
        />
      </div>

      <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-50 px-4 py-3 text-xs text-amber-700">
        Commercial approval required — talent availability and category restrictions apply before production.
      </p>

      {list.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: "rgba(15,10,30,0.45)" }}>No talent found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const on = selectedId === c.id;
            const priceMin = c.price_range?.["video-ad"]?.min;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={[
                  "flex flex-col items-center rounded-xl border bg-white p-5 text-center transition-[border-color,box-shadow] duration-[180ms]",
                  on ? "border-[#7C3AED] shadow-[0_0_0_3px_rgba(124,58,237,0.2)]" : "border-black/[0.08] hover:border-black/[0.14]",
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
                        "size-24 rounded-full ring-2 ring-offset-2 ring-offset-white flex items-center justify-center text-white text-xl font-bold",
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
                <span className="mt-2 rounded-md bg-black/[0.06] px-2 py-0.5 text-[11px] ring-1 ring-black/[0.08]" style={{ color: "rgba(15,10,30,0.50)" }}>
                  {c.industry}
                </span>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="size-2 rounded-full bg-[#16A34A]" aria-hidden />
                  <span className="text-xs" style={{ color: "rgba(15,10,30,0.50)" }}>Available</span>
                </div>
                {priceMin !== undefined && (
                  <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.55)" }}>
                    From SAR {priceMin.toLocaleString("en-SA")}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
