"use client";

import type { FunnelServiceId } from "@/lib/studio/studio-funnel-data";
import { serviceLabel } from "@/lib/studio/studio-funnel-data";
import { getFunnelCelebrityById, getFunnelTemplateById } from "@/lib/studio/studio-funnel-data";

export type BottomBarProps = {
  currentStep: number;
  service: FunnelServiceId | null;
  templateId: string | null;
  celebrityId: string | null;
  onBack: () => void;
  onNext: () => void;
  onStartGeneration: () => void;
  canNext: boolean;
};

export function BottomBar({
  currentStep,
  service,
  templateId,
  celebrityId,
  onBack,
  onNext,
  onStartGeneration,
  canNext,
}: BottomBarProps) {
  const tpl  = getFunnelTemplateById(templateId);
  const cel  = getFunnelCelebrityById(celebrityId);
  const parts = [service ? serviceLabel(service) : null, tpl?.name ?? null, cel?.name ?? null].filter(Boolean);
  const summary = parts.length ? parts.join(" · ") : "Select options to continue";
  const isLast  = currentStep === 5;

  return (
    <div
      className="flex h-16 shrink-0 items-center justify-between gap-4 px-4 md:px-6"
      style={{
        minHeight:      "64px",
        background:     "rgba(255,255,255,0.97)",
        backdropFilter: "blur(16px)",
        borderTop:      "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {/* Summary */}
      <p
        className="min-w-0 truncate text-[13px]"
        style={{ color: "rgba(15,10,30,0.35)" }}
        title={summary}
      >
        {summary}
      </p>

      <div className="flex shrink-0 items-center gap-3">
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          disabled={currentStep <= 1}
          className="inline-flex h-[40px] items-center justify-center rounded-xl px-4 text-[13px] font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-30"
          style={{
            background: "rgba(0,0,0,0.04)",
            border:     "1px solid rgba(0,0,0,0.10)",
            color:      "rgba(15,10,30,0.55)",
          }}
        >
          ← Back
        </button>

        {/* Next / Start */}
        {isLast ? (
          <button
            type="button"
            onClick={onStartGeneration}
            className="inline-flex h-[40px] items-center justify-center rounded-xl px-5 text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-px"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
              boxShadow:  "0 8px 24px rgba(124,58,237,0.30)",
              border:     "none",
            }}
          >
            Start Generation 🔒
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className="inline-flex h-[40px] items-center justify-center rounded-xl px-5 text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
              boxShadow:  "0 8px 24px rgba(124,58,237,0.30)",
              border:     "none",
            }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
