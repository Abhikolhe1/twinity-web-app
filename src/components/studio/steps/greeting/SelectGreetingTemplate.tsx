"use client";

import { Loader2 } from "lucide-react";
import type { ApiTemplate } from "@/lib/api";

const GRADIENT_PAIRS: [string, string][] = [
  ["#7C3AED", "#5B21B6"],
  ["#0EA5E9", "#0369A1"],
  ["#F59E0B", "#D97706"],
  ["#10B981", "#059669"],
  ["#EC4899", "#BE185D"],
  ["#8B5CF6", "#6D28D9"],
];

export type SelectGreetingTemplateProps = {
  templates: ApiTemplate[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function SelectGreetingTemplate({ templates, loading, selectedId, onSelect }: SelectGreetingTemplateProps) {
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Select a Template</h2>
      <p className="mt-2 text-sm text-white/50">How should the celebrity deliver the greeting?</p>
      {templates.length === 0 ? (
        <p className="mt-8 text-sm text-white/40">No templates available yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => {
            const on = selectedId === t.id;
            const [from, to] = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length];
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
                  className="absolute inset-0"
                  style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                />
                <span className="absolute start-2 top-2 rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                  Sample
                </span>
                {on && (
                  <span className="absolute end-3 top-3 flex size-8 items-center justify-center rounded-full bg-[#7C3AED] text-sm text-white shadow-lg">
                    ✓
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/85 to-transparent p-4 pt-14">
                  <span className="font-display text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
                    {t.name}
                  </span>
                  {t.duration && (
                    <span className="rounded-md bg-black/45 px-2 py-0.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                      {t.duration}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
      <p className="mt-6 flex items-start gap-2 text-sm text-white/45">
        <span aria-hidden>ℹ️</span>
        <span>All templates are pre-approved and watermarked for preview only.</span>
      </p>
    </div>
  );
}
