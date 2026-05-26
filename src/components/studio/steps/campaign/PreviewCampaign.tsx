"use client";

import type { ApiCelebrity, ApiTemplate } from "@/lib/api";
import { DEFAULT_LICENSE_SCOPE, estimateCampaignSubtotal, withVat } from "@/lib/studio/campaign-funnel-data";

export type PreviewCampaignProps = {
  campaignTypeId: null;
  templateId:     string | null;
  celebrityId:    string | null;
  template:       ApiTemplate | null;
  celebrity:      ApiCelebrity | null;
  onStartCampaign: () => void;
};

export function CampaignDraftSummaryCard({
  template,
  celebrity,
}: {
  template:   ApiTemplate | null;
  celebrity:  ApiCelebrity | null;
}) {
  const priceMin = celebrity?.price_range?.["video-ad"]?.min ?? 0;
  const sub      = estimateCampaignSubtotal(null, priceMin, DEFAULT_LICENSE_SCOPE);
  const { total } = withVat(sub);

  return (
    <div className="rounded-xl bg-white p-6 ring-1 ring-black/[0.07]">
      <h3 className="font-display text-sm font-semibold" style={{ color: "#0F0A1E" }}>Draft Summary</h3>
      <p className="mt-1 text-xs" style={{ color: "rgba(15,10,30,0.40)" }}>Preview only — not a binding quote until license scope is confirmed.</p>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-[rgba(15,10,30,0.45)]">Template</dt>
          <dd className="text-end font-medium" style={{ color: "#0F0A1E" }}>{template?.name ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[rgba(15,10,30,0.45)]">Celebrity</dt>
          <dd className="text-end" style={{ color: "#0F0A1E" }}>
            {celebrity ? (
              <span className="inline-flex items-center gap-2">
                {celebrity.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={celebrity.thumbnail_url} alt="" className="size-7 rounded-full object-cover ring-1 ring-black/10" />
                ) : (
                  <span
                    className="size-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: celebrity.avatar_color || "#7C3AED" }}
                  >
                    {celebrity.initials}
                  </span>
                )}
                {celebrity.name}
              </span>
            ) : "—"}
          </dd>
        </div>
        {template?.duration && (
          <div className="flex justify-between gap-3">
            <dt className="text-[rgba(15,10,30,0.45)]">Duration</dt>
            <dd className="text-end" style={{ color: "#0F0A1E" }}>{template.duration}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-[rgba(15,10,30,0.45)]">Indicative channels</dt>
          <dd className="text-end text-xs" style={{ color: "rgba(15,10,30,0.65)" }}>{DEFAULT_LICENSE_SCOPE.channels.join(", ")}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[rgba(15,10,30,0.45)]">Indicative range</dt>
          <dd className="text-end text-sm font-semibold text-[#7C3AED]">
            SAR {sub.toLocaleString("en-SA")} – SAR {Math.round(sub * 1.15).toLocaleString("en-SA")}
          </dd>
        </div>
      </dl>
      <div className="my-5 h-px bg-black/[0.08]" />
      <p className="text-xs uppercase tracking-wide" style={{ color: "rgba(15,10,30,0.45)" }}>Estimated total (incl. VAT)</p>
      <p className="mt-1 font-display text-2xl font-bold" style={{ color: "#0F0A1E" }}>
        SAR {total.toLocaleString("en-SA", { maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}

export function PreviewCampaign({ template, celebrity, onStartCampaign }: PreviewCampaignProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Preview</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Watermarked sample — governed delivery follows license execution.</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[0.58]">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-black/[0.08]">
            <video
              src="/video/female-sample-video.mp4"
              controls
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3 select-none">
              <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                Sample
              </span>
            </div>
          </div>
          <p className="mt-4 text-center text-sm" style={{ color: "rgba(15,10,30,0.55)" }}>
            {celebrity?.name ?? "Talent"} · {template?.name ?? "Template"}{template?.duration ? ` · ${template.duration}` : ""}
          </p>
        </div>
        <div className="min-w-0 flex-[0.42] lg:max-w-md">
          <CampaignDraftSummaryCard template={template} celebrity={celebrity} />
          <button
            type="button"
            onClick={onStartCampaign}
            className="mt-4 w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white transition-[background-color] duration-[180ms] hover:bg-[#6D28D9]"
          >
            Start Campaign
          </button>
          <p className="mt-3 text-center text-xs" style={{ color: "rgba(15,10,30,0.38)" }}>Login / company verification follows.</p>
        </div>
      </div>
    </div>
  );
}
