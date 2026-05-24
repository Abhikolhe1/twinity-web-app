"use client";

export type PreviewSampleProps = {
  templateName: string;
  celebrityName: string;
  durationLabel: string;
};

export function PreviewSample({ templateName, celebrityName, durationLabel }: PreviewSampleProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Preview Sample</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.45)" }}>Watermarked demo — your final video will not have this</p>

      <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl border border-black/[0.08] bg-white">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#2d1b69] via-[#1a1035] to-[#0a0a0a]"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] select-none text-4xl font-black uppercase tracking-widest text-white/10 sm:text-6xl"
          aria-hidden
        >
          SAMPLE
        </span>
        <button
          type="button"
          className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-[background-color,transform] duration-[180ms] hover:scale-105 hover:bg-white/20"
          aria-label="Play sample"
        >
          <span className="ms-1 text-2xl">▶</span>
        </button>
      </div>

      <p className="mt-4 text-center text-sm font-medium" style={{ color: "rgba(15,10,30,0.55)" }}>
        {templateName} · {celebrityName} · {durationLabel}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs" style={{ color: "rgba(15,10,30,0.45)" }}>
        <span>Duration: {durationLabel}</span>
        <span>Platform: Multi</span>
        <span>Format: MP4</span>
        <span>Usage: Preview only</span>
      </div>

      <div className="mt-8 rounded-xl border border-black/[0.08] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#7C3AED" }}>Sample notice</p>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(15,10,30,0.45)" }}>
          This is a watermarked sample only. To generate your own ad without watermark, complete payment and brief
          submission.
        </p>
      </div>
    </div>
  );
}
