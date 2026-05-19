"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type {
  CampaignTypeId,
  LicenseChannel,
  LicenseDuration,
  LicenseExclusivity,
  LicenseScope,
  LicenseSla,
  LicenseTerritory,
} from "@/lib/studio/campaign-funnel-data";
import {
  estimateCampaignSubtotal,
  getCampaignCelebrity,
  getCampaignType,
  withVat,
} from "@/lib/studio/campaign-funnel-data";

const CHANNELS: LicenseChannel[] = ["Instagram", "TikTok", "YouTube", "Snapchat", "Website", "TV"];
const DURATIONS: LicenseDuration[] = ["1 week", "1 month", "3 months", "6 months", "1 year"];
const TERRITORIES: LicenseTerritory[] = ["Saudi Arabia", "GCC", "MENA", "Global"];
const EXCLUSIVITY: { id: LicenseExclusivity; label: string }[] = [
  { id: "none", label: "None" },
  { id: "category", label: "Category" },
  { id: "brand", label: "Brand" },
  { id: "territory", label: "Territory" },
];
const SLA: { id: LicenseSla; label: string }[] = [
  { id: "standard", label: "Standard" },
  { id: "priority", label: "Priority" },
  { id: "urgent", label: "Urgent" },
];

export type LicenseScopeProps = {
  campaignTypeId: CampaignTypeId | null;
  celebrityId: string | null;
  scope: LicenseScope;
  onScopeChange: (s: LicenseScope) => void;
};

function pill(
  active: boolean,
  onClick: () => void,
  children: ReactNode,
  className = "",
) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-lg border px-3 py-2 text-xs font-semibold transition-[border-color,background-color,color] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
        active ? "border-[#7C3AED] bg-[rgba(124,58,237,0.12)] text-white" : "border-white/[0.08] bg-[#141414] text-white/50 hover:border-white/[0.14]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function LicenseScope({ campaignTypeId, celebrityId, scope, onScopeChange }: LicenseScopeProps) {
  const cel = getCampaignCelebrity(celebrityId);
  const sub = estimateCampaignSubtotal(campaignTypeId, cel?.priceFromSar ?? 0, scope);
  const priced = useMemo(() => withVat(sub), [sub]);

  const toggleChannel = (ch: LicenseChannel) => {
    const has = scope.channels.includes(ch);
    const next = has ? scope.channels.filter((c) => c !== ch) : [...scope.channels, ch];
    if (next.length === 0) return;
    onScopeChange({ ...scope, channels: next });
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">License Scope</h2>
      <p className="mt-2 text-sm text-white/50">Define usage rights — this drives compliance, routing, and pricing.</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-8">
          <section className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Channels / platforms</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {CHANNELS.map((ch) => pill(scope.channels.includes(ch), () => toggleChannel(ch), ch))}
            </div>
          </section>
          <section className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Duration</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {DURATIONS.map((d) =>
                pill(scope.duration === d, () => onScopeChange({ ...scope, duration: d }), d),
              )}
            </div>
          </section>
          <section className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Territory</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {TERRITORIES.map((t) =>
                pill(scope.territory === t, () => onScopeChange({ ...scope, territory: t }), t),
              )}
            </div>
          </section>
          <section className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Exclusivity</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {EXCLUSIVITY.map((e) =>
                pill(scope.exclusivity === e.id, () => onScopeChange({ ...scope, exclusivity: e.id }), e.label),
              )}
            </div>
          </section>
          <section className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Urgency / SLA</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {SLA.map((s) => pill(scope.sla === s.id, () => onScopeChange({ ...scope, sla: s.id }), s.label))}
            </div>
          </section>
        </div>
        <div className="w-full shrink-0 lg:sticky lg:top-4 lg:w-[300px]">
          <div className="rounded-xl border border-white/[0.1] bg-[#0f0f0f] p-5 ring-1 ring-[#7C3AED]/10">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#C4B5FD]">Live estimate</h3>
            <p className="mt-1 text-[11px] text-white/35">Excludes optional production add-ons.</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2 text-white/50">
                <dt>Subtotal</dt>
                <dd className="text-white">SAR {priced.subtotal.toLocaleString("en-SA")}</dd>
              </div>
              <div className="flex justify-between gap-2 text-white/50">
                <dt>VAT (15%)</dt>
                <dd className="text-white">SAR {priced.vat.toLocaleString("en-SA", { minimumFractionDigits: 2 })}</dd>
              </div>
            </dl>
            <div className="my-4 h-px bg-white/[0.08]" />
            <p className="text-xs uppercase tracking-wide text-white/40">Total due</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">
              SAR {priced.total.toLocaleString("en-SA", { minimumFractionDigits: 2 })}
            </p>
            <ul className="mt-4 space-y-1.5 text-[11px] text-white/40">
              <li>• {getCampaignType(campaignTypeId)?.title ?? "Campaign"}</li>
              <li>• {scope.channels.join(", ")}</li>
              <li>
                • {scope.duration} · {scope.territory}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
