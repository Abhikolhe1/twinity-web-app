"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import type { ApiCelebrity } from "@/lib/api";
import type {
  LicenseChannel,
  LicenseDuration,
  LicenseExclusivity,
  LicenseScope,
  LicenseSla,
  LicenseTerritory,
} from "@/lib/studio/campaign-funnel-data";
import { estimateCampaignSubtotal, withVat } from "@/lib/studio/campaign-funnel-data";

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
  campaignTypeId: null;
  celebrity: ApiCelebrity | null;
  scope: LicenseScope;
  onScopeChange: (s: LicenseScope) => void;
};

function pill(active: boolean, onClick: () => void, children: ReactNode, className = "") {
  return (
    <button
      key={String(children)}
      type="button"
      onClick={onClick}
      className={[
        "rounded-lg border px-3 py-2 text-xs font-semibold transition-[border-color,background-color,color] duration-[180ms]",
        active ? "border-[#7C3AED] bg-[rgba(124,58,237,0.12)]" : "border-black/[0.08] bg-white hover:border-black/[0.14]",
        className,
      ].join(" ")}
      style={active ? { color: "#7C3AED" } : { color: "rgba(15,10,30,0.50)" }}
    >
      {children}
    </button>
  );
}

function normalizeText(value: string) {
  const normalized = value.toLowerCase().replace(/\s+/g, " ").trim();
  switch (normalized) {
    case "saudi arabian":
    case "ksa":
    case "kingdom of saudi arabia":
      return "saudi arabia";
    case "mena region":
      return "mena";
    case "global worldwide":
    case "worldwide":
      return "global";
    default:
      return normalized;
  }
}

function territoryLevel(value: string): number | null {
  switch (normalizeText(value)) {
    case "saudi arabia":
      return 1;
    case "gcc":
      return 2;
    case "mena":
      return 3;
    case "global":
      return 4;
    default:
      return null;
  }
}

function territoryFallsWithin(rule: string, selected: string) {
  const ruleLevel = territoryLevel(rule);
  const selectedLevel = territoryLevel(selected);

  if (ruleLevel !== null && selectedLevel !== null) {
    return ruleLevel >= selectedLevel;
  }

  return normalizeText(rule) === normalizeText(selected);
}

export function LicenseScope({ celebrity, scope, onScopeChange }: LicenseScopeProps) {
  const priceMin = celebrity?.price_range?.["video-ad"]?.min ?? 0;
  const subtotal = estimateCampaignSubtotal(null, priceMin, scope);
  const priced = useMemo(() => withVat(subtotal), [subtotal]);

  const geoAvailability = celebrity?.geographic_availability ?? null;
  const allowedRegions = Array.isArray(geoAvailability?.allowedRegions) ? geoAvailability.allowedRegions.filter(Boolean) : [];
  const restrictedRegions = Array.isArray(geoAvailability?.restrictedRegions) ? geoAvailability.restrictedRegions.filter(Boolean) : [];
  const restrictedTerritory = restrictedRegions.find((region) => territoryFallsWithin(region, scope.territory));
  const territoryAllowed = allowedRegions.length === 0 || allowedRegions.some((region) => territoryFallsWithin(region, scope.territory));

  const toggleChannel = (channel: LicenseChannel) => {
    const hasChannel = scope.channels.includes(channel);
    const nextChannels = hasChannel
      ? scope.channels.filter((item) => item !== channel)
      : [...scope.channels, channel];
    if (nextChannels.length === 0) return;
    onScopeChange({ ...scope, channels: nextChannels });
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>
        License Scope
      </h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>
        Define usage rights - this drives compliance, routing, and pricing.
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-8">
          <section className="rounded-xl border border-black/[0.08] bg-white p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.45)" }}>
              Channels / platforms
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {CHANNELS.map((channel) => pill(scope.channels.includes(channel), () => toggleChannel(channel), channel))}
            </div>
          </section>

          <section className="rounded-xl border border-black/[0.08] bg-white p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.45)" }}>
              Duration
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {DURATIONS.map((duration) => pill(scope.duration === duration, () => onScopeChange({ ...scope, duration }), duration))}
            </div>
          </section>

          <section className="rounded-xl border border-black/[0.08] bg-white p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.45)" }}>
              Territory
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {TERRITORIES.map((territory) => pill(scope.territory === territory, () => onScopeChange({ ...scope, territory }), territory))}
            </div>
            {(restrictedTerritory || allowedRegions.length > 0) && (
              <div
                className="mt-4 rounded-lg border px-3 py-3 text-xs"
                style={{
                  borderColor: restrictedTerritory
                    ? "rgba(239,68,68,0.25)"
                    : territoryAllowed
                      ? "rgba(124,58,237,0.18)"
                      : "rgba(245,158,11,0.30)",
                  background: restrictedTerritory
                    ? "rgba(239,68,68,0.06)"
                    : territoryAllowed
                      ? "rgba(124,58,237,0.05)"
                      : "rgba(245,158,11,0.08)",
                  color: restrictedTerritory
                    ? "#B91C1C"
                    : territoryAllowed
                      ? "rgba(15,10,30,0.62)"
                      : "#B45309",
                }}
              >
                {restrictedTerritory ? (
                  <p>
                    {celebrity?.name} is restricted for <span className="font-semibold">{restrictedTerritory}</span>. Choose another territory or another celebrity before submitting.
                  </p>
                ) : !territoryAllowed ? (
                  <p>
                    {celebrity?.name} is not approved for <span className="font-semibold">{scope.territory}</span>. Allowed regions: {allowedRegions.join(", ")}.
                  </p>
                ) : (
                  <p>
                    Approved regions for {celebrity?.name}: <span className="font-semibold">{allowedRegions.join(", ")}</span>.
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-black/[0.08] bg-white p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.45)" }}>
              Exclusivity
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {EXCLUSIVITY.map((option) => pill(scope.exclusivity === option.id, () => onScopeChange({ ...scope, exclusivity: option.id }), option.label))}
            </div>
          </section>

          <section className="rounded-xl border border-black/[0.08] bg-white p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.45)" }}>
              Urgency / SLA
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {SLA.map((option) => pill(scope.sla === option.id, () => onScopeChange({ ...scope, sla: option.id }), option.label))}
            </div>
          </section>
        </div>

        <div className="w-full shrink-0 lg:sticky lg:top-4 lg:w-[300px]">
          <div className="rounded-xl border border-black/[0.09] bg-white p-5 ring-1 ring-[#7C3AED]/10">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
              Live estimate
            </h3>
            <p className="mt-1 text-[11px]" style={{ color: "rgba(15,10,30,0.40)" }}>
              Excludes optional production add-ons.
            </p>
            <dl className="mt-4 space-y-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>
              <div className="flex justify-between gap-2">
                <dt>Subtotal</dt>
                <dd style={{ color: "#0F0A1E" }}>SAR {priced.subtotal.toLocaleString("en-SA")}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>VAT (15%)</dt>
                <dd style={{ color: "#0F0A1E" }}>
                  SAR {priced.vat.toLocaleString("en-SA", { minimumFractionDigits: 2 })}
                </dd>
              </div>
            </dl>
            <div className="my-4 h-px bg-black/[0.08]" />
            <p className="text-xs uppercase tracking-wide" style={{ color: "rgba(15,10,30,0.45)" }}>
              Total due
            </p>
            <p className="mt-1 font-display text-2xl font-bold" style={{ color: "#0F0A1E" }}>
              SAR {priced.total.toLocaleString("en-SA", { minimumFractionDigits: 2 })}
            </p>
            <ul className="mt-4 space-y-1.5 text-[11px]" style={{ color: "rgba(15,10,30,0.45)" }}>
              {celebrity ? <li>- {celebrity.name}</li> : null}
              <li>- {scope.channels.join(", ")}</li>
              <li>- {scope.duration} / {scope.territory}</li>
              {celebrity?.prohibited_industries?.length ? (
                <li>- Restricted industries: {celebrity.prohibited_industries.join(", ")}</li>
              ) : null}
              {celebrity?.competitor_brands?.length ? (
                <li>- Competitor restrictions: {celebrity.competitor_brands.join(", ")}</li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
