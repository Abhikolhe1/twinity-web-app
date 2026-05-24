"use client";

import { Loader2 } from "lucide-react";

const PURPOSE_ICONS: Record<string, string> = {
  "Birthday Wish":    "🎂",
  "Holiday Greeting": "🌙",
  "Congratulations":  "🏆",
  "Motivation":       "💪",
  "Wedding":          "💒",
  "Thank You":        "🙏",
  "Shoutout":         "📣",
  "Graduation":       "🎓",
  "Business Intro":   "🏢",
  "Product Launch":   "🚀",
};

function purposeIcon(purpose: string): string {
  return PURPOSE_ICONS[purpose] ?? "✨";
}

export type ChooseOccasionProps = {
  occasions: string[];
  loading: boolean;
  selectedPurpose: string | null;
  onSelect: (purpose: string) => void;
};

export function ChooseOccasion({ occasions, loading, selectedPurpose, onSelect }: ChooseOccasionProps) {
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 size={28} className="animate-spin" style={{ color: "rgba(15,10,30,0.40)" }} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>What&apos;s the occasion?</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Select the type of greeting you want to create</p>
      {occasions.length === 0 ? (
        <p className="mt-8 text-sm" style={{ color: "rgba(15,10,30,0.40)" }}>No occasions available yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map((purpose) => {
            const on = selectedPurpose === purpose;
            return (
              <button
                key={purpose}
                type="button"
                onClick={() => onSelect(purpose)}
                className={[
                  "flex flex-col items-center rounded-xl border bg-white px-5 py-8 text-center transition-[border-color,box-shadow] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                  on
                    ? "border-[#7C3AED] shadow-[0_0_0_3px_rgba(124,58,237,0.2)]"
                    : "border-black/[0.08] hover:border-black/[0.12]",
                ].join(" ")}
              >
                <span className="text-5xl leading-none" aria-hidden>
                  {purposeIcon(purpose)}
                </span>
                <span className="mt-4 font-display text-base font-semibold" style={{ color: "#0F0A1E" }}>{purpose}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
