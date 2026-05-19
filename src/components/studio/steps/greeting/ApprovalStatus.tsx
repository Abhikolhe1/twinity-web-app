"use client";

import { useState } from "react";

import type { GreetingOccasionId } from "@/lib/studio/greeting-funnel-data";
import { GREETING_TOTAL_SAR } from "@/lib/studio/greeting-funnel-data";

import { GreetingOrderSummaryCard } from "./PreviewGreetingSample";

export type ApprovalStatusProps = {
  occasionId: GreetingOccasionId | null;
  templateId: string | null;
  celebrityId: string | null;
};

export function ApprovalStatus({ occasionId, templateId, celebrityId }: ApprovalStatusProps) {
  const [emailOn, setEmailOn] = useState(true);
  const [smsOn, setSmsOn] = useState(false);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Request in Progress</h2>
      <p className="mt-2 text-sm text-white/50">We&apos;ll notify you at each stage</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[0.6] space-y-0">
          <ul className="relative space-y-0 ps-1">
            {[
              { state: "done" as const, title: "Request Received", sub: "Today, 10:30 AM" },
              { state: "done" as const, title: "Payment Confirmed", sub: `SAR ${GREETING_TOTAL_SAR.toFixed(2)} — Order #TWN-2024-000123` },
              { state: "done" as const, title: "Content Policy Check", sub: "Passed automatically" },
              { state: "active" as const, title: "Celebrity Review", sub: "Waiting for celebrity response" },
              { state: "pending" as const, title: "Content Generation", sub: "Pending approval" },
              { state: "pending" as const, title: "Ready for Delivery", sub: "Pending" },
            ].map((row, i, arr) => (
              <li key={row.title} className="relative flex gap-4 pb-8 last:pb-0">
                {i < arr.length - 1 ? (
                  <div className="absolute start-[11px] top-6 h-[calc(100%-0.5rem)] w-px bg-white/[0.08]" aria-hidden />
                ) : null}
                <div className="relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1F1F1F] ring-1 ring-white/[0.1]">
                  {row.state === "done" ? (
                    <span className="text-xs text-[#22C55E]">✓</span>
                  ) : row.state === "active" ? (
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400/60" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-amber-400" />
                    </span>
                  ) : (
                    <span className="size-2 rounded-full bg-white/15" />
                  )}
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="font-display text-sm font-semibold text-white">{row.title}</p>
                  <p className="mt-0.5 text-sm text-white/45">{row.sub}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-white/40">Expected delivery: 1–2 business days after celebrity approval</p>
          <button
            type="button"
            className="mt-6 rounded-lg border border-white/[0.12] bg-transparent px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors duration-[180ms] hover:border-white/[0.2] hover:text-white"
          >
            View My Orders →
          </button>
        </div>
        <div className="w-full min-w-0 lg:max-w-md lg:flex-[0.4]">
          <GreetingOrderSummaryCard occasionId={occasionId} templateId={templateId} celebrityId={celebrityId} />
          <div className="mt-4 rounded-xl bg-[#1F1F1F] p-5 ring-1 ring-white/[0.06]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-white/45">Status</span>
              <span className="rounded-md bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-500/25">
                🔄 In Review
              </span>
            </div>
            <p className="mt-6 text-xs font-medium text-white/45">Get notified by:</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setEmailOn((v) => !v)}
                className={[
                  "flex-1 rounded-lg border py-2 text-xs font-semibold transition-[border-color,background-color] duration-[180ms]",
                  emailOn ? "border-[#7C3AED] bg-[rgba(124,58,237,0.12)] text-white" : "border-white/[0.08] text-white/45",
                ].join(" ")}
              >
                📧 Email
              </button>
              <button
                type="button"
                onClick={() => setSmsOn((v) => !v)}
                className={[
                  "flex-1 rounded-lg border py-2 text-xs font-semibold transition-[border-color,background-color] duration-[180ms]",
                  smsOn ? "border-[#7C3AED] bg-[rgba(124,58,237,0.12)] text-white" : "border-white/[0.08] text-white/45",
                ].join(" ")}
              >
                📱 SMS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
