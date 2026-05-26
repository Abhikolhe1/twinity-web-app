"use client";

import Logo from "@/components/ui/Logo";
import type { ApiCelebrity, ApiTemplate } from "@/lib/api";
import type { LicenseScope } from "@/lib/studio/campaign-funnel-data";

export type DeliveryLicenseProps = {
  template:  ApiTemplate | null;
  celebrity: ApiCelebrity | null;
  scope:     LicenseScope;
};

export function DeliveryLicense({ template, celebrity, scope }: DeliveryLicenseProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Delivery</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Controlled master file with executed license metadata.</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[0.58]">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-black ring-1 ring-white/[0.1]">
            <button
              type="button"
              className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-xl transition-transform duration-[180ms] hover:scale-105"
              aria-label="Play final asset"
            >
              <span className="ms-1 text-2xl">▶</span>
            </button>
          </div>
          <p className="mt-4 text-center text-sm" style={{ color: "rgba(15,10,30,0.55)" }}>
            Final master · {celebrity?.name ?? "Talent"} · {template?.name ?? "Template"}
          </p>
          <button type="button" className="mt-6 w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]">
            Download approved video
          </button>
        </div>
        <div className="w-full min-w-0 lg:max-w-md lg:flex-[0.42]">
          <div className="rounded-xl border border-black/[0.09] bg-white p-6 ring-1 ring-[#7C3AED]/10">
            <h3 className="font-display text-sm font-semibold" style={{ color: "#0F0A1E" }}>License certificate</h3>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-[rgba(15,10,30,0.45)]">License ID</dt>
                <dd className="text-end font-mono text-xs" style={{ color: "#0F0A1E" }}>TWN-B2B-LIC-009821</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[rgba(15,10,30,0.45)]">Usage period</dt>
                <dd className="text-end" style={{ color: "#0F0A1E" }}>{scope.duration}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[rgba(15,10,30,0.45)]">Channels</dt>
                <dd className="max-w-[55%] text-end text-xs" style={{ color: "rgba(15,10,30,0.70)" }}>{scope.channels.join(", ")}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[rgba(15,10,30,0.45)]">Territory</dt>
                <dd className="text-end" style={{ color: "#0F0A1E" }}>{scope.territory}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[rgba(15,10,30,0.45)]">Exclusivity</dt>
                <dd className="text-end capitalize">{scope.exclusivity}</dd>
              </div>
              {template && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[rgba(15,10,30,0.45)]">Template</dt>
                  <dd className="text-end" style={{ color: "#0F0A1E" }}>{template.name}</dd>
                </div>
              )}
            </dl>
            <button
              type="button"
              className="mt-6 w-full rounded-lg border border-black/[0.12] py-2.5 text-sm font-semibold hover:bg-black/[0.04]" style={{ color: "rgba(15,10,30,0.80)" }}
            >
              Download License Certificate
            </button>
            <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.40)" }}>
              Compliant. Licensed. Delivered.
            </p>
            <div className="mt-3 flex justify-center">
              <Logo height={22} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
