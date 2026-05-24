"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Logo from "@/components/ui/Logo";
import type { ApiCelebrity, ApiTemplate, ApiVideoJob } from "@/lib/api";
import { jobApi } from "@/lib/api";

export type GreetingDeliveryProps = {
  referenceId: string | null;
  occasion: string | null;
  celebrity: ApiCelebrity | null;
  template: ApiTemplate | null;
  recipientName: string;
};

export function GreetingDelivery({
  referenceId,
  occasion,
  celebrity,
  template,
  recipientName,
}: GreetingDeliveryProps) {
  const [job, setJob]               = useState<ApiVideoJob | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!referenceId) return;
    jobApi.getJob(referenceId).then((res) => setJob(res.data)).catch(() => {});
  }, [referenceId]);
  const duration = template?.duration ?? "—";
  const displayRecipient = recipientName.trim() || "—";
  const videoUrl = job?.watermarked_url ?? job?.final_video_url ?? job?.preview_url;

  const handleDownload = async () => {
    if (!referenceId) return;
    setDownloading(true);
    try {
      const blob = await jobApi.getDownloadBlob(referenceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${referenceId}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail — user sees no change
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Your Greeting is Ready!</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Approved and delivered successfully</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[0.6]">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/35 via-rose-500/25 to-[#1a0a14] ring-1 ring-black/[0.08]">
            {videoUrl ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={videoUrl} controls className="absolute inset-0 h-full w-full object-contain" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-black/10">
                  <Loader2 size={24} className="animate-spin" style={{ color: "rgba(15,10,30,0.50)" }} />
                </div>
              </div>
            )}
          </div>
          <p className="mt-4 text-center text-sm" style={{ color: "rgba(15,10,30,0.60)" }}>
            {celebrity?.name ?? "—"} · {occasion ?? "—"} · {duration}
          </p>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || !referenceId}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9] disabled:pointer-events-none disabled:opacity-50"
          >
            {downloading && <Loader2 size={16} className="animate-spin" />}
            {downloading ? "Preparing download…" : "Download Video"}
          </button>
          <p className="mt-3 text-center text-xs" style={{ color: "rgba(15,10,30,0.35)" }}>For personal use only as per your license</p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-lg border border-black/[0.12] bg-white py-2.5 text-sm font-semibold hover:border-black/[0.2]"
              style={{ color: "rgba(15,10,30,0.80)" }}
            >
              WhatsApp
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg border border-black/[0.12] bg-white py-2.5 text-sm font-semibold hover:border-black/[0.2]"
              style={{ color: "rgba(15,10,30,0.80)" }}
            >
              Share Link
            </button>
          </div>
        </div>

        <div className="w-full min-w-0 lg:max-w-md lg:flex-[0.4]">
          <div className="rounded-xl bg-white p-6" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.06)" }}>
            <h3 className="font-display text-sm font-semibold" style={{ color: "#0F0A1E" }}>License Details</h3>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt style={{ color: "rgba(15,10,30,0.45)" }}>License ID</dt>
                <dd className="text-end" style={{ color: "#0F0A1E" }}>{referenceId ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: "rgba(15,10,30,0.45)" }}>Type</dt>
                <dd className="text-end" style={{ color: "#0F0A1E" }}>Personal Greeting</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: "rgba(15,10,30,0.45)" }}>Recipient</dt>
                <dd className="text-end" style={{ color: "#0F0A1E" }}>{displayRecipient}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: "rgba(15,10,30,0.45)" }}>Occasion</dt>
                <dd className="text-end" style={{ color: "#0F0A1E" }}>{occasion ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: "rgba(15,10,30,0.45)" }}>Usage</dt>
                <dd className="text-end" style={{ color: "#0F0A1E" }}>Personal sharing only</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: "rgba(15,10,30,0.45)" }}>Expires</dt>
                <dd className="text-end" style={{ color: "#0F0A1E" }}>30 days from delivery</dd>
              </div>
            </dl>
            <button
              type="button"
              className="mt-6 w-full rounded-lg border border-black/[0.12] py-2.5 text-sm font-semibold hover:bg-black/[0.04]"
              style={{ color: "rgba(15,10,30,0.80)" }}
            >
              Download License Certificate
            </button>
            <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.35)" }}>
              Compliant. Licensed. Delivered.
            </p>
            <div className="mt-4 flex flex-col items-center gap-1">
              <Logo height={22} />
              <span className="text-[10px]" style={{ color: "rgba(15,10,30,0.30)" }}>Governed celebrity experiences</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
