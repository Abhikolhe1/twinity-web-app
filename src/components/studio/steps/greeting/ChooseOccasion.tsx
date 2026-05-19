"use client";

import type { GreetingOccasionId } from "@/lib/studio/greeting-funnel-data";
import { GREETING_OCCASIONS } from "@/lib/studio/greeting-funnel-data";

export type ChooseOccasionProps = {
  selected: GreetingOccasionId | null;
  onSelect: (id: GreetingOccasionId) => void;
};

export function ChooseOccasion({ selected, onSelect }: ChooseOccasionProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">What&apos;s the occasion?</h2>
      <p className="mt-2 text-sm text-white/50">Select the type of greeting you want to create</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GREETING_OCCASIONS.map((o) => {
          const on = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelect(o.id)}
              className={[
                "flex flex-col items-center rounded-xl border bg-[#1F1F1F] px-5 py-8 text-center transition-[border-color,box-shadow] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                on
                  ? "border-[#7C3AED] shadow-[0_0_0_3px_rgba(124,58,237,0.2),0_0_28px_rgba(251,146,60,0.08)]"
                  : "border-white/[0.08] hover:border-white/[0.12]",
              ].join(" ")}
            >
              <span className="text-5xl leading-none" aria-hidden>
                {o.icon}
              </span>
              <span className="mt-4 font-display text-base font-semibold text-white">{o.label}</span>
              <span className="mt-2 max-w-[16rem] text-sm text-white/50">{o.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
