"use client";

import { useRef, useState } from "react";
import type { ApiCelebrity, ApiTemplate } from "@/lib/api";

export type GreetingOrderSummaryCardProps = {
  occasion: string | null;
  celebrity: ApiCelebrity | null;
  template: ApiTemplate | null;
};

export function GreetingOrderSummaryCard({ occasion, celebrity, template }: GreetingOrderSummaryCardProps) {
  const priceMin = celebrity?.price_range?.greeting?.min;
  const priceLabel = priceMin
    ? `From SAR ${priceMin.toLocaleString("en-SA")}`
    : "Contact for pricing";

  return (
    <div className="rounded-xl bg-white p-6" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.06)" }}>
      <h3 className="font-display text-sm font-semibold" style={{ color: "#0F0A1E" }}>Request Summary</h3>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt style={{ color: "rgba(15,10,30,0.45)" }}>Occasion</dt>
          <dd className="text-end" style={{ color: "#0F0A1E" }}>
            {occasion ?? <span style={{ color: "rgba(15,10,30,0.30)" }}>—</span>}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt style={{ color: "rgba(15,10,30,0.45)" }}>Template</dt>
          <dd className="text-end font-medium" style={{ color: "#0F0A1E" }}>
            {template?.name ?? <span style={{ color: "rgba(15,10,30,0.30)" }}>—</span>}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt style={{ color: "rgba(15,10,30,0.45)" }}>Celebrity</dt>
          <dd className="text-end" style={{ color: "#0F0A1E" }}>
            {celebrity ? (
              <span className="inline-flex items-center gap-2">
                {celebrity.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={celebrity.thumbnail_url}
                    alt=""
                    className="size-7 rounded-full object-cover ring-1 ring-black/10"
                  />
                ) : (
                  <span
                    className="flex size-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: celebrity.avatar_color || "#7C3AED" }}
                  >
                    {celebrity.initials}
                  </span>
                )}
                <span className="font-medium">{celebrity.name}</span>
              </span>
            ) : (
              <span style={{ color: "rgba(15,10,30,0.30)" }}>—</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt style={{ color: "rgba(15,10,30,0.45)" }}>Format</dt>
          <dd style={{ color: "#0F0A1E" }}>Video MP4</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt style={{ color: "rgba(15,10,30,0.45)" }}>Delivery</dt>
          <dd style={{ color: "#0F0A1E" }}>1–2 Business Days</dd>
        </div>
      </dl>
      <div className="my-5 h-px bg-black/[0.08]" />
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "rgba(15,10,30,0.45)" }}>Indicative Price</p>
      <p className="mt-1 font-display text-[28px] font-bold leading-none" style={{ color: "#0F0A1E" }}>{priceLabel}</p>
      <p className="mt-2 text-xs" style={{ color: "rgba(15,10,30,0.40)" }}>Final price confirmed after order review</p>
    </div>
  );
}

export type PreviewGreetingSampleProps = {
  occasion: string | null;
  celebrity: ApiCelebrity | null;
  template: ApiTemplate | null;
};

export function PreviewGreetingSample({
  occasion,
  celebrity,
  template,
}: PreviewGreetingSampleProps) {
  const duration = template?.duration ?? "—";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play();
      setPlaying(true);
    } else {
      vid.pause();
      setPlaying(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Preview Sample</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Watermarked demo — your final video won&apos;t have this</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[0.6]">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-black/[0.08]">
            <video
              ref={videoRef}
              src="/video/sample-video.mp4"
              className="absolute inset-0 h-full w-full"
              loop
              playsInline
              onEnded={() => setPlaying(false)}
            />
            <div className="pointer-events-none absolute inset-0 flex rotate-[-18deg] items-center justify-center select-none">
              <span className="text-[clamp(2.5rem,8vw,5rem)] font-black uppercase tracking-widest text-white/[0.18]">
                Sample
              </span>
            </div>
            {!playing && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-white/95 text-[#1a0a14] shadow-xl ring-4 ring-black/20 transition-transform duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                aria-label="Play sample preview"
              >
                <span className="ms-1 text-2xl">▶</span>
              </button>
            )}
            {playing && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity duration-200 hover:opacity-100"
                aria-label="Pause sample preview"
              >
                <span className="text-2xl">⏸</span>
              </button>
            )}
          </div>
          <p className="mt-4 text-center text-sm" style={{ color: "rgba(15,10,30,0.60)" }}>
            {celebrity?.name ?? "—"} · {template?.name ?? "—"} · {duration}
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
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs ring-1"
                style={{ color: "rgba(15,10,30,0.55)", boxShadow: "0 0 0 1px rgba(0,0,0,0.06)" }}
              >
                <span aria-hidden>{p.icon}</span>
                {p.label}
              </span>
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-[0.4] lg:max-w-md lg:self-stretch">
          <GreetingOrderSummaryCard occasion={occasion} celebrity={celebrity} template={template} />
        </div>
      </div>
    </div>
  );
}
