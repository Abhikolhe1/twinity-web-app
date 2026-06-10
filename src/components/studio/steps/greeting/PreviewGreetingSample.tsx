"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
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
  compositeImageUrl?: string;
  voiceAudioUrl?: string;
  voiceLoading?: boolean;
};

export function PreviewGreetingSample({
  occasion,
  celebrity,
  template,
  compositeImageUrl,
  voiceAudioUrl,
  voiceLoading,
}: PreviewGreetingSampleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - rect.left) / rect.width) * el.duration;
  };

  const fmt = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
  };

  const templateDuration = template?.duration ?? "—";

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Preview Your Greeting</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>
        Listen to the personalized voice preview before confirming
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[0.6]">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl ring-1 ring-black/[0.08]" style={{ background: "#000" }}>
            {(compositeImageUrl || template?.background_image_url || celebrity?.thumbnail_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(compositeImageUrl || template?.background_image_url || celebrity?.thumbnail_url)!}
                alt=""
                className="absolute inset-0 h-full w-full object-contain"
              />
            )}

            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />

            {voiceAudioUrl && (
              <audio
                ref={audioRef}
                src={voiceAudioUrl}
                onTimeUpdate={() => {
                  const el = audioRef.current;
                  if (el?.duration) setProgress(el.currentTime / el.duration);
                }}
                onLoadedMetadata={() => {
                  if (audioRef.current) setDuration(audioRef.current.duration);
                }}
                onEnded={() => {
                  setPlaying(false);
                  setProgress(0);
                }}
              />
            )}

            <div className="pointer-events-none absolute inset-0 flex rotate-[-18deg] items-center justify-center select-none">
              <span className="text-[clamp(2.5rem,8vw,5rem)] font-black uppercase tracking-widest text-white/[0.08]">
                Sample
              </span>
            </div>

            {voiceLoading ? (
              <div className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-white/95 shadow-xl ring-4 ring-black/20">
                <Loader2 size={24} className="animate-spin" style={{ color: "#7C3AED" }} />
              </div>
            ) : voiceAudioUrl ? (
              <>
                {!playing && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-white/95 text-[#1a0a14] shadow-xl ring-4 ring-black/20 transition-transform duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                    aria-label="Play voice preview"
                  >
                    <span className="ms-1 text-2xl">▶</span>
                  </button>
                )}
                {playing && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity duration-200 hover:opacity-100"
                    aria-label="Pause voice preview"
                  >
                    <span className="text-2xl">⏸</span>
                  </button>
                )}
              </>
            ) : (
              <div className="absolute inset-0 m-auto flex size-fit flex-col items-center gap-2">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/20">
                  <span className="text-2xl text-white/60">🔇</span>
                </div>
                <p className="px-4 text-center text-xs text-white/60">Audio unavailable — video will still be generated</p>
              </div>
            )}

            {voiceAudioUrl && !voiceLoading && (
              <div
                className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-8"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 100%)" }}
              >
                <div
                  className="relative h-1 w-full cursor-pointer overflow-hidden rounded-full"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                  onClick={handleSeek}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${progress * 100}%`, background: "#fff" }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-white/60">
                  <span>{fmt(progress * duration)}</span>
                  {duration > 0 && <span>{fmt(duration)}</span>}
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 text-center text-sm" style={{ color: "rgba(15,10,30,0.60)" }}>
            {celebrity?.name ?? "—"} · {template?.name ?? "—"} · {templateDuration}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              { icon: "⏱", label: `${templateDuration} duration` },
              { icon: "📱", label: "All Platforms" },
              { icon: "🎬", label: "Video MP4" },
              { icon: "✅", label: "Personalized" },
            ].map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs ring-1"
                style={{ color: "rgba(15,10,30,0.55)", boxShadow: "0 0 0 1px rgba(0,0,0,0.06)" }}
              >
                <span aria-hidden>{pill.icon}</span>
                {pill.label}
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
