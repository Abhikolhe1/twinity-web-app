"use client";

import { useState } from "react";

import type { ApiCelebrity, ApiTemplate } from "@/lib/api";
import type { LicenseScope } from "@/lib/studio/campaign-funnel-data";
import { estimateCampaignSubtotal, withVat } from "@/lib/studio/campaign-funnel-data";

import { CampaignDraftSummaryCard } from "./PreviewCampaign";

export type PayAndConfirmProps = {
  template:    ApiTemplate | null;
  celebrity:   ApiCelebrity | null;
  scope:       LicenseScope;
  onAuthorize: () => void;
};

export function PayAndConfirm({ template, celebrity, scope, onAuthorize }: PayAndConfirmProps) {
  const [method, setMethod] = useState<"visa" | "apple" | "mada">("visa");
  const sub    = estimateCampaignSubtotal(null, celebrity?.price_range?.["video-ad"]?.min ?? 0, scope);
  const priced = withVat(sub);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Pay & Confirm</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Authorize payment to open production, brief intake, and compliance queue.</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="rounded-xl border border-black/[0.08] bg-white p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.45)" }}>Payment summary</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between" style={{ color: "rgba(15,10,30,0.55)" }}>
                <dt>License & talent bundle</dt>
                <dd>SAR {priced.subtotal.toLocaleString("en-SA")}</dd>
              </div>
              <div className="flex justify-between" style={{ color: "rgba(15,10,30,0.55)" }}>
                <dt>VAT (15%)</dt>
                <dd>SAR {priced.vat.toLocaleString("en-SA", { minimumFractionDigits: 2 })}</dd>
              </div>
              <div className="my-3 h-px bg-black/[0.08]" />
              <div className="flex justify-between font-display text-lg font-semibold" style={{ color: "#0F0A1E" }}>
                <dt>Due now</dt>
                <dd>SAR {priced.total.toLocaleString("en-SA", { minimumFractionDigits: 2 })}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs" style={{ color: "rgba(15,10,30,0.45)" }}>
              Payment is required before production work begins. Capture follows Twinity escrow policy (mock).
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.45)" }}>Payment method</h3>
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
                      ? "border-[#7C3AED] bg-[rgba(124,58,237,0.12)]"
                      : "border-black/[0.08] bg-white hover:border-black/[0.14]",
                  ].join(" ")}
                  style={method === m.id ? { color: "#7C3AED" } : { color: "rgba(15,10,30,0.60)" }}
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
          <CampaignDraftSummaryCard template={template} celebrity={celebrity} />
          <div className="mt-4 rounded-xl border border-black/[0.08] bg-white p-4 text-xs" style={{ color: "rgba(15,10,30,0.50)" }}>
            <p className="font-semibold" style={{ color: "rgba(15,10,30,0.60)" }}>Scope snapshot</p>
            <ul className="mt-2 space-y-1">
              <li>Channels: {scope.channels.join(", ")}</li>
              <li>
                {scope.duration} · {scope.territory}
              </li>
              <li>
                Exclusivity: {scope.exclusivity} · SLA: {scope.sla}
              </li>
            </ul>
            {template && (
              <p className="mt-3 text-[11px]" style={{ color: "rgba(15,10,30,0.40)" }}>
                {template.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
