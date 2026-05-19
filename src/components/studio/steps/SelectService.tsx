"use client";

import type { FunnelServiceId } from "@/lib/studio/studio-funnel-data";

export type SelectServiceProps = {
  selected: FunnelServiceId | null;
  onSelect: (id: FunnelServiceId) => void;
};

export function SelectService({ selected, onSelect }: SelectServiceProps) {
  const cards: { id: FunnelServiceId; icon: string; title: string; desc: string }[] = [
    { id: "greeting", icon: "🎬", title: "Greeting Video", desc: "Personal video messages" },
    { id: "campaign", icon: "📢", title: "Ad Campaign", desc: "Licensed brand content" },
    { id: "custom", icon: "✨", title: "Custom Request", desc: "Tailored for your needs" },
  ];

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Select a Service</h2>
      <p className="mt-2 text-sm text-white/50">Choose what type of content you want to create</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => {
          const on = selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={[
                "flex flex-col rounded-xl border bg-[#1F1F1F] p-6 text-start transition-[border-color,box-shadow,background-color] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                on
                  ? "border-[#7C3AED] shadow-[0_0_0_3px_rgba(124,58,237,0.2),0_0_32px_rgba(124,58,237,0.12)]"
                  : "border-white/[0.08] hover:border-white/[0.12]",
              ].join(" ")}
            >
              <span className="text-3xl" aria-hidden>
                {c.icon}
              </span>
              <span className="mt-4 font-display text-lg font-semibold text-white">{c.title}</span>
              <span className="mt-2 text-sm text-white/50">{c.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
