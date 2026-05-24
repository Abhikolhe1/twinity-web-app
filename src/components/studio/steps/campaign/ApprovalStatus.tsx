"use client";

import type { CampaignTypeId, LicenseScope } from "@/lib/studio/campaign-funnel-data";
import { getCampaignCelebrity, getCampaignTemplate, getCampaignType } from "@/lib/studio/campaign-funnel-data";

import { CampaignDraftSummaryCard } from "./PreviewCampaign";

export type CampaignApprovalStatusProps = {
  campaignTypeId: CampaignTypeId | null;
  templateId: string | null;
  celebrityId: string | null;
  scope: LicenseScope;
};

export function CampaignApprovalStatus({ campaignTypeId, templateId, celebrityId, scope }: CampaignApprovalStatusProps) {
  const cel = getCampaignCelebrity(celebrityId);
  const tpl = getCampaignTemplate(templateId);
  const ct = getCampaignType(campaignTypeId);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Approval</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Audit-style status — from submission to talent desk.</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[0.62]">
          <ul className="relative space-y-0 border-s border-black/[0.08] ps-6">
            {[
              { ok: true, t: "Submitted", d: "Request TWN-B2B-2026-00421 locked for review" },
              { ok: true, t: "Under Twinity review", d: "Account tier: Enterprise pilot" },
              { ok: true, t: "Compliance review", d: "Category restriction note acknowledged" },
              { ok: true, t: "Sent to celebrity / manager", d: cel ? `Desk: ${cel.name}` : "Desk assigned" },
              { ok: false, t: "Awaiting approval", d: "Response SLA: priority (48h business)" },
              { ok: false, t: "Approved / edits requested", d: "Pending talent response" },
            ].map((row) => (
              <li key={row.t} className="relative pb-8 last:pb-2">
                <span
                  className={[
                    "absolute -start-[25px] top-1 flex size-3 rounded-full ring-4 ring-white",
                    row.ok ? "bg-[#16A34A]" : "bg-amber-400",
                  ].join(" ")}
                />
                <p className="font-display text-sm font-semibold" style={{ color: "#0F0A1E" }}>{row.t}</p>
                <p className="mt-1 text-xs" style={{ color: "rgba(15,10,30,0.50)" }}>{row.d}</p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-6 rounded-lg border border-black/[0.12] px-4 py-2.5 text-sm font-semibold hover:border-black/[0.20]"
            style={{ color: "rgba(15,10,30,0.65)" }}
          >
            Export audit trail (mock)
          </button>
        </div>
        <div className="w-full min-w-0 lg:max-w-sm lg:flex-[0.38]">
          <CampaignDraftSummaryCard campaignTypeId={campaignTypeId} templateId={templateId} celebrityId={celebrityId} />
          <div className="mt-4 rounded-xl border border-black/[0.08] bg-white p-4 text-xs" style={{ color: "rgba(15,10,30,0.50)" }}>
            <p className="font-semibold" style={{ color: "rgba(15,10,30,0.65)" }}>Active scope</p>
            <p className="mt-2">{scope.channels.join(" · ")}</p>
            <p>
              {scope.territory} · {scope.duration}
            </p>
            <p className="mt-2" style={{ color: "rgba(15,10,30,0.40)" }}>
              {ct?.title} · {tpl?.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
