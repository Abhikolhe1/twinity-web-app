"use client";

import type { GreetingOccasionId } from "@/lib/studio/greeting-funnel-data";
import { GREETING_BASE_SAR, getGreetingCelebrity, getGreetingOccasion, getGreetingTemplate } from "@/lib/studio/greeting-funnel-data";

export type GreetingOrderSummaryCardProps = {
  occasionId: GreetingOccasionId | null;
  templateId: string | null;
  celebrityId: string | null;
};

export function GreetingOrderSummaryCard({ occasionId, templateId, celebrityId }: GreetingOrderSummaryCardProps) {
  const occ = getGreetingOccasion(occasionId);
  const tpl = getGreetingTemplate(templateId);
  const cel = getGreetingCelebrity(celebrityId);

  return (
    <div className="rounded-xl bg-[#1F1F1F] p-6 ring-1 ring-white/[0.06]">
      <h3 className="font-display text-sm font-semibold text-white">Request Summary</h3>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">Occasion</dt>
          <dd className="text-end text-white">
            {occ ? (
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden>{occ.icon}</span>
                {occ.label}
              </span>
            ) : (
              <span className="text-white/30">—</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">Template</dt>
          <dd className="text-end font-medium text-white">{tpl?.name ?? <span className="text-white/30">—</span>}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">Celebrity</dt>
          <dd className="text-end text-white">
            {cel ? (
              <span className="inline-flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cel.imageUrl} alt="" className="size-7 rounded-full object-cover ring-1 ring-white/10" />
                <span className="font-medium">{cel.name}</span>
              </span>
            ) : (
              <span className="text-white/30">—</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">Format</dt>
          <dd className="text-white">Video MP4</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">Delivery</dt>
          <dd className="text-white">1–2 Business Days</dd>
        </div>
      </dl>
      <div className="my-5 h-px bg-white/[0.08]" />
      <p className="text-xs font-medium uppercase tracking-wide text-white/45">Indicative Price</p>
      <p className="mt-1 font-display text-[32px] font-bold leading-none text-white">SAR {GREETING_BASE_SAR}</p>
      <p className="mt-2 text-xs text-white/40">Final price confirmed after order review</p>
    </div>
  );
}

export type PreviewGreetingSampleProps = GreetingOrderSummaryCardProps & {
  onGenerateClick: () => void;
};

export function PreviewGreetingSample({ occasionId, templateId, celebrityId, onGenerateClick }: PreviewGreetingSampleProps) {
  const tpl = getGreetingTemplate(templateId);
  const cel = getGreetingCelebrity(celebrityId);
  const duration = tpl?.durationLabel ?? "0:20";

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Preview Sample</h2>
      <p className="mt-2 text-sm text-white/50">Watermarked demo — your final video won&apos;t have this</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[0.6]">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/40 via-rose-500/30 to-[#1a0a14] ring-1 ring-white/[0.08]">
            <div className="pointer-events-none absolute inset-0 flex rotate-[-18deg] items-center justify-center select-none">
              <span className="text-[clamp(2.5rem,8vw,5rem)] font-black uppercase tracking-widest text-white/[0.12]">
                Sample
              </span>
            </div>
            <button
              type="button"
              className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-white/95 text-[#1a0a14] shadow-xl ring-4 ring-black/20 transition-transform duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
              aria-label="Play sample preview"
            >
              <span className="ms-1 text-2xl">▶</span>
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-white/60">
            {cel?.name ?? "—"} · {tpl?.name ?? "—"} · {duration}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              { icon: "⏱", label: `${duration} duration` },
              { icon: "📱", label: "All Platforms" },
              { icon: "🎬", label: "Video MP4" },
              { icon: "👁", label: "Preview Only" },
            ].map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#1F1F1F] px-3 py-1.5 text-xs text-white/55 ring-1 ring-white/[0.06]"
              >
                <span aria-hidden>{p.icon}</span>
                {p.label}
              </span>
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-[0.4] lg:max-w-md lg:self-stretch">
          <GreetingOrderSummaryCard occasionId={occasionId} templateId={templateId} celebrityId={celebrityId} />
          <button
            type="button"
            onClick={onGenerateClick}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white transition-[background-color,filter] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-[#6D28D9]"
          >
            Generate This Greeting <span aria-hidden>🔒</span>
          </button>
          <p className="mt-4 flex items-start justify-center gap-2 text-xs text-white/40">
            <span aria-hidden>🔒</span>
            <span>Login and payment required to generate</span>
          </p>
        </div>
      </div>
    </div>
  );
}
