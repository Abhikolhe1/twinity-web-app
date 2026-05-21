"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ApiCelebrity, ApiTemplate, ApiVideoJob } from "@/lib/api";
import { jobApi } from "@/lib/api";
import { GreetingOrderSummaryCard } from "./PreviewGreetingSample";

type TimelineRow = { title: string; sub: string; state: "done" | "active" | "pending" };

const STATUS_ORDER = ["pending", "in-progress", "review", "delivered"];

function buildTimeline(job: ApiVideoJob | null, submittedAt: string): TimelineRow[] {
  if (!job) {
    return [
      { title: "Request Received", sub: submittedAt, state: "active" },
      { title: "Being Processed", sub: "Waiting to start", state: "pending" },
      { title: "Ready for Review", sub: "Pending generation", state: "pending" },
      { title: "Delivered", sub: "Pending", state: "pending" },
    ];
  }

  const { status } = job;
  const rank = STATUS_ORDER.indexOf(status);
  const atLeast = (s: string) => rank >= STATUS_ORDER.indexOf(s);

  return [
    {
      title: "Request Received",
      sub: new Date(job.created_at).toLocaleString("en-SA", { dateStyle: "medium", timeStyle: "short" }),
      state: "done",
    },
    {
      title: "Being Processed",
      sub: atLeast("in-progress") ? "AI generation in progress" : "Waiting to start",
      state: atLeast("review") ? "done" : atLeast("in-progress") ? "active" : "pending",
    },
    {
      title: "Ready for Review",
      sub: atLeast("review") ? "Content ready for delivery" : "Pending generation",
      state: status === "delivered" ? "done" : atLeast("review") ? "active" : "pending",
    },
    {
      title: "Delivered",
      sub: status === "delivered" ? "Your greeting is ready!" : "Pending",
      state: status === "delivered" ? "done" : "pending",
    },
  ];
}

function statusBadge(status: string | undefined) {
  switch (status) {
    case "pending":     return { label: "Queued",      cls: "text-amber-200 bg-amber-500/15 ring-amber-500/25" };
    case "in-progress": return { label: "Processing",  cls: "text-blue-200 bg-blue-500/15 ring-blue-500/25" };
    case "review":      return { label: "In Review",   cls: "text-amber-200 bg-amber-500/15 ring-amber-500/25" };
    case "delivered":   return { label: "Delivered!",  cls: "text-green-200 bg-green-500/15 ring-green-500/25" };
    case "failed":      return { label: "Failed",      cls: "text-red-300 bg-red-500/15 ring-red-500/25" };
    default:            return { label: "Submitted",   cls: "text-white/60 bg-white/[0.08] ring-white/10" };
  }
}

export type ApprovalStatusProps = {
  referenceId: string | null;
  occasion: string | null;
  celebrity: ApiCelebrity | null;
  template: ApiTemplate | null;
  onDelivered: () => void;
};

export function ApprovalStatus({
  referenceId,
  occasion,
  celebrity,
  template,
  onDelivered,
}: ApprovalStatusProps) {
  const [job, setJob]               = useState<ApiVideoJob | null>(null);
  const [pollingErr, setPollingErr] = useState("");
  const [submittedAt]               = useState(() =>
    new Date().toLocaleString("en-SA", { dateStyle: "medium", timeStyle: "short" }),
  );
  const onDeliveredRef = useRef(onDelivered);
  onDeliveredRef.current = onDelivered;

  useEffect(() => {
    if (!referenceId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await jobApi.getJob(referenceId);
        if (cancelled) return;
        setJob(res.data);
        setPollingErr("");
        if (res.data.status === "delivered") {
          setTimeout(() => { if (!cancelled) onDeliveredRef.current(); }, 1500);
        }
      } catch {
        if (!cancelled) setPollingErr("Could not fetch status. Retrying…");
      }
    };

    poll();
    const interval = setInterval(poll, 10_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [referenceId]);

  const timeline = buildTimeline(job, submittedAt);
  const badge    = statusBadge(job?.status);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Request in Progress</h2>
      <p className="mt-2 text-sm text-white/50">
        {referenceId ? `Order ${referenceId}` : "We'll notify you at each stage"}
      </p>
      {pollingErr && <p className="mt-2 text-xs text-amber-400">{pollingErr}</p>}

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[0.6]">
          <ul className="relative space-y-0 ps-1">
            {timeline.map((row, i, arr) => (
              <li key={row.title} className="relative flex gap-4 pb-8 last:pb-0">
                {i < arr.length - 1 && (
                  <div
                    className="absolute start-[11px] top-6 h-[calc(100%-0.5rem)] w-px bg-white/[0.08]"
                    aria-hidden
                  />
                )}
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
          <p className="mt-4 text-sm text-white/40">Expected delivery: 1–2 business days</p>
          {!job && (
            <div className="mt-3 flex items-center gap-2 text-sm text-white/40">
              <Loader2 size={14} className="animate-spin" />
              <span>Checking status…</span>
            </div>
          )}
        </div>

        <div className="w-full min-w-0 lg:max-w-md lg:flex-[0.4]">
          <GreetingOrderSummaryCard occasion={occasion} celebrity={celebrity} template={template} />
          <div className="mt-4 rounded-xl bg-[#1F1F1F] p-5 ring-1 ring-white/[0.06]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-white/45">Status</span>
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ring-1 ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
            {job?.error_message && (
              <p className="mt-3 text-xs text-red-400">{job.error_message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
