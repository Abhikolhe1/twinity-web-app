"use client";

import type { CampaignTypeId } from "@/lib/studio/campaign-funnel-data";
import {
  estimateCampaignSubtotal,
  getCampaignCelebrity,
  getCampaignTemplate,
  getCampaignType,
  withVat,
} from "@/lib/studio/campaign-funnel-data";
import { DEFAULT_LICENSE_SCOPE } from "@/lib/studio/campaign-funnel-data";

export type PreviewCampaignProps = {
  campaignTypeId: CampaignTypeId | null;
  templateId: string | null;
  celebrityId: string | null;
  onStartCampaign: () => void;
};

export function CampaignDraftSummaryCard({
  campaignTypeId,
  templateId,
  celebrityId,
}: Pick<PreviewCampaignProps, "campaignTypeId" | "templateId" | "celebrityId">) {
  const ct = getCampaignType(campaignTypeId);
  const tpl = getCampaignTemplate(templateId);
  const cel = getCampaignCelebrity(celebrityId);
  const sub = estimateCampaignSubtotal(campaignTypeId, cel?.priceFromSar ?? 0, DEFAULT_LICENSE_SCOPE);
  const { total } = withVat(sub);

  return (
    <div className="rounded-xl bg-white p-6 ring-1 ring-black/[0.07]">
      <h3 className="font-display text-sm font-semibold" style={{ color: "#0F0A1E" }}>Draft Summary</h3>
      <p className="mt-1 text-xs" style={{ color: "rgba(15,10,30,0.40)" }}>Preview only — not a binding quote until license scope is confirmed.</p>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-[rgba(15,10,30,0.45)]">Campaign</dt>
          <dd className="max-w-[55%] text-end" style={{ color: "#0F0A1E" }}>{ct?.title ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[rgba(15,10,30,0.45)]">Template</dt>
          <dd className="text-end font-medium" style={{ color: "#0F0A1E" }}>{tpl?.name ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[rgba(15,10,30,0.45)]">Celebrity</dt>
          <dd className="text-end" style={{ color: "#0F0A1E" }}>
            {cel ? (
              <span className="inline-flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cel.imageUrl} alt="" className="size-7 rounded-full object-cover ring-1 ring-black/10" />
                {cel.name}
              </span>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[rgba(15,10,30,0.45)]">Indicative duration</dt>
          <dd className="text-end" style={{ color: "#0F0A1E" }}>{tpl?.durationLabel ?? "—"}</dd>
        </div>
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
      <p className="mt-1 font-display text-2xl font-bold" style={{ color: "#0F0A1E" }}>SAR {total.toLocaleString("en-SA", { maximumFractionDigits: 0 })}</p>
    </div>
  );
}

export function PreviewCampaign({ campaignTypeId, templateId, celebrityId, onStartCampaign }: PreviewCampaignProps) {
  const tpl = getCampaignTemplate(templateId);
  const cel = getCampaignCelebrity(celebrityId);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Preview</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Watermarked sample — governed delivery follows license execution.</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[0.58]">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 via-indigo-950 to-[#0a0a12] ring-1 ring-black/[0.08]">
            <div className="pointer-events-none absolute inset-0 flex rotate-[-14deg] items-center justify-center select-none">
              <span className="text-[clamp(2rem,7vw,4rem)] font-black uppercase tracking-widest text-white/[0.1]">
                Sample
              </span>
            </div>
            <button
              type="button"
              className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-xl ring-4 ring-black/30 transition-transform duration-[180ms] hover:scale-105"
              aria-label="Play preview"
            >
              <span className="ms-1 text-2xl">▶</span>
            </button>
          </div>
          <p className="mt-4 text-center text-sm" style={{ color: "rgba(15,10,30,0.55)" }}>
            {cel?.name ?? "Talent"} · {tpl?.name ?? "Template"} · {tpl?.durationLabel ?? "—"}
          </p>
        </div>
        <div className="min-w-0 flex-[0.42] lg:max-w-md">
          <CampaignDraftSummaryCard campaignTypeId={campaignTypeId} templateId={templateId} celebrityId={celebrityId} />
          <button
            type="button"
            onClick={onStartCampaign}
            className="mt-4 w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white transition-[background-color] duration-[180ms] hover:bg-[#6D28D9]"
          >
            Start Campaign
          </button>
          <p className="mt-3 text-center text-xs" style={{ color: "rgba(15,10,30,0.38)" }}>Login / company verification and payment authorization follow.</p>
        </div>
      </div>
    </div>
  );
}
