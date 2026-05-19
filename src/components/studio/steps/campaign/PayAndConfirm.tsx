"use client";

import { useState } from "react";

import type { CampaignTypeId, LicenseScope } from "@/lib/studio/campaign-funnel-data";
import {
  estimateCampaignSubtotal,
  getCampaignCelebrity,
  getCampaignTemplate,
  getCampaignType,
  withVat,
} from "@/lib/studio/campaign-funnel-data";

import { CampaignDraftSummaryCard } from "./PreviewCampaign";

export type PayAndConfirmProps = {
  campaignTypeId: CampaignTypeId | null;
  templateId: string | null;
  celebrityId: string | null;
  scope: LicenseScope;
  onAuthorize: () => void;
};

export function PayAndConfirm({ campaignTypeId, templateId, celebrityId, scope, onAuthorize }: PayAndConfirmProps) {
  const [method, setMethod] = useState<"visa" | "apple" | "mada">("visa");
  const cel = getCampaignCelebrity(celebrityId);
  const sub = estimateCampaignSubtotal(campaignTypeId, cel?.priceFromSar ?? 0, scope);
  const priced = withVat(sub);
  const ct = getCampaignType(campaignTypeId);
  const tpl = getCampaignTemplate(templateId);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Pay & Confirm</h2>
      <p className="mt-2 text-sm text-white/50">Authorize payment to open production, brief intake, and compliance queue.</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="rounded-xl border border-white/[0.08] bg-[#1F1F1F] p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Payment summary</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-white/55">
                <dt>License & talent bundle</dt>
                <dd>SAR {priced.subtotal.toLocaleString("en-SA")}</dd>
              </div>
              <div className="flex justify-between text-white/55">
                <dt>VAT (15%)</dt>
                <dd>SAR {priced.vat.toLocaleString("en-SA", { minimumFractionDigits: 2 })}</dd>
              </div>
              <div className="my-3 h-px bg-white/[0.08]" />
              <div className="flex justify-between font-display text-lg font-semibold text-white">
                <dt>Due now</dt>
                <dd>SAR {priced.total.toLocaleString("en-SA", { minimumFractionDigits: 2 })}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-white/40">
              Payment is required before production work begins. Capture follows Twinity escrow policy (mock).
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Payment method</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  { id: "visa" as const, label: "💳 Visa" },
                  { id: "apple" as const, label: "🍎 Apple Pay" },
                  { id: "mada" as const, label: "🏦 Mada" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={[
                    "flex-1 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-[border-color,background-color] duration-[180ms]",
                    method === m.id
                      ? "border-[#7C3AED] bg-[rgba(124,58,237,0.12)] text-white"
                      : "border-white/[0.08] bg-[#141414] text-white/60 hover:border-white/[0.14]",
                  ].join(" ")}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onAuthorize}
            className="w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]"
          >
            Authorize Payment — SAR {priced.total.toLocaleString("en-SA", { minimumFractionDigits: 2 })}
          </button>
        </div>
        <div className="w-full min-w-0 lg:max-w-sm">
          <CampaignDraftSummaryCard campaignTypeId={campaignTypeId} templateId={templateId} celebrityId={celebrityId} />
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-xs text-white/45">
            <p className="font-semibold text-white/60">Scope snapshot</p>
            <ul className="mt-2 space-y-1">
              <li>Channels: {scope.channels.join(", ")}</li>
              <li>
                {scope.duration} · {scope.territory}
              </li>
              <li>
                Exclusivity: {scope.exclusivity} · SLA: {scope.sla}
              </li>
            </ul>
            <p className="mt-3 text-[11px] text-white/35">
              {ct?.title} · {tpl?.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
