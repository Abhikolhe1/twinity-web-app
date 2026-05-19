"use client";

import Logo from "@/components/ui/Logo";
import type { GreetingOccasionId } from "@/lib/studio/greeting-funnel-data";
import { getGreetingCelebrity, getGreetingOccasion, getGreetingTemplate } from "@/lib/studio/greeting-funnel-data";

export type GreetingDeliveryProps = {
  occasionId: GreetingOccasionId | null;
  templateId: string | null;
  celebrityId: string | null;
  recipientName: string;
};

export function GreetingDelivery({ occasionId, templateId, celebrityId, recipientName }: GreetingDeliveryProps) {
  const occ = getGreetingOccasion(occasionId);
  const tpl = getGreetingTemplate(templateId);
  const cel = getGreetingCelebrity(celebrityId);
  const duration = tpl?.durationLabel ?? "0:20";
  const displayRecipient = recipientName.trim() || "—";

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Your Greeting is Ready! 🎉</h2>
      <p className="mt-2 text-sm text-white/50">Approved and delivered successfully</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[0.6]">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/35 via-rose-500/25 to-[#1a0a14] ring-1 ring-white/[0.08]">
            <button
              type="button"
              className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-white/95 text-[#1a0a14] shadow-xl ring-4 ring-black/20 transition-transform duration-[180ms] hover:scale-105"
              aria-label="Play delivered greeting"
            >
              <span className="ms-1 text-2xl">▶</span>
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-white/60">
            {cel?.name ?? "—"} · {occ?.label ?? "—"} · {duration}
          </p>
          <button
            type="button"
            className="mt-6 w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]"
          >
            ⬇ Download Video
          </button>
          <p className="mt-3 text-center text-xs text-white/35">For personal use only as per your license</p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-lg border border-white/[0.12] bg-[#1F1F1F] py-2.5 text-sm font-semibold text-white/80 hover:border-white/[0.2]"
            >
              📱 WhatsApp
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg border border-white/[0.12] bg-[#1F1F1F] py-2.5 text-sm font-semibold text-white/80 hover:border-white/[0.2]"
            >
              📤 Share Link
            </button>
          </div>
        </div>
        <div className="w-full min-w-0 lg:max-w-md lg:flex-[0.4]">
          <div className="rounded-xl bg-[#1F1F1F] p-6 ring-1 ring-white/[0.06]">
            <h3 className="font-display text-sm font-semibold text-white">License Details</h3>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-white/45">License ID</dt>
                <dd className="text-end text-white">TWN-GRT-000789</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/45">Type</dt>
                <dd className="text-end text-white">Personal Greeting</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/45">Recipient</dt>
                <dd className="text-end text-white">{displayRecipient}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/45">Occasion</dt>
                <dd className="text-end text-white">{occ ? `${occ.icon} ${occ.label}` : "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/45">Usage</dt>
                <dd className="text-end text-white">Personal sharing only</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/45">Expires</dt>
                <dd className="text-end text-white">30 days from delivery</dd>
              </div>
            </dl>
            <button
              type="button"
              className="mt-6 w-full rounded-lg border border-white/[0.12] py-2.5 text-sm font-semibold text-white/80 hover:bg-white/[0.04]"
            >
              📄 Download License Certificate
            </button>
            <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider text-white/35">
              Compliant. Licensed. Delivered.
            </p>
            <div className="mt-4 flex flex-col items-center gap-1">
              <Logo height={22} />
              <span className="text-[10px] text-white/30">Governed celebrity experiences</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
