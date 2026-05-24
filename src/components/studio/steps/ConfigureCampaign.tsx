"use client";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "TV", "Multiple"] as const;

export type ConfigureCampaignProps = {
  campaignName: string;
  onCampaignNameChange: (v: string) => void;
  platforms: string[];
  onTogglePlatform: (p: string) => void;
  duration: string;
  onDurationChange: (v: string) => void;
  territory: string;
  onTerritoryChange: (v: string) => void;
  express: boolean;
  onExpressChange: (v: boolean) => void;
  celebrityName: string;
  celebrityImageUrl: string;
  templateName: string;
  indicativePriceSar: number;
};

const DURATION_LABEL: Record<string, string> = {
  "1M": "1 Month",
  "3M": "3 Months",
  "6M": "6 Months",
  "1 Year": "1 Year",
};

export function ConfigureCampaign({
  campaignName,
  onCampaignNameChange,
  platforms,
  onTogglePlatform,
  duration,
  onDurationChange,
  territory,
  onTerritoryChange,
  express,
  onExpressChange,
  celebrityName,
  celebrityImageUrl,
  templateName,
  indicativePriceSar,
}: ConfigureCampaignProps) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(280px,36%)] lg:items-start">
      <div className="min-w-0 space-y-8">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Configure Your Campaign</h2>
        </div>
        <section>
          <label htmlFor="cn" className="text-sm font-medium" style={{ color: "#0F0A1E" }}>
            Campaign name
          </label>
          <input
            id="cn"
            value={campaignName}
            onChange={(e) => onCampaignNameChange(e.target.value)}
            className="mt-2 w-full rounded-lg border border-black/[0.08] bg-white px-4 py-3 text-sm outline-none transition-[border-color] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] focus:border-[rgba(124,58,237,0.5)]"
            style={{ color: "#0F0A1E" }}
          />
        </section>
        <section>
          <h3 className="text-sm font-medium" style={{ color: "#0F0A1E" }}>Platform / channel</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const on = platforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onTogglePlatform(p)}
                  className={[
                    "rounded-lg px-3 py-2 text-xs font-semibold transition-[background-color,border-color] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                    on
                      ? "border border-[#7C3AED] bg-[rgba(124,58,237,0.15)]"
                      : "border border-black/[0.08] bg-white",
                  ].join(" ")}
                  style={{ color: on ? "#0F0A1E" : "rgba(15,10,30,0.45)" }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </section>
        <section>
          <h3 className="text-sm font-medium" style={{ color: "#0F0A1E" }}>License duration</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["1M", "3M", "6M", "1 Year"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onDurationChange(d)}
                className={[
                  "rounded-lg px-4 py-2.5 text-sm font-semibold transition-[border-color,background-color] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                  duration === d
                    ? "border border-[#7C3AED] bg-[rgba(124,58,237,0.15)]"
                    : "border border-black/[0.08] bg-white",
                ].join(" ")}
                style={{ color: duration === d ? "#0F0A1E" : "rgba(15,10,30,0.45)" }}
              >
                {d}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-sm font-medium" style={{ color: "#0F0A1E" }}>Territory</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["Saudi Arabia", "GCC", "MENA", "Global"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTerritoryChange(t)}
                className={[
                  "rounded-lg px-4 py-2.5 text-sm font-semibold transition-[border-color,background-color] duration-[180ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                  territory === t
                    ? "border border-[#7C3AED] bg-[rgba(124,58,237,0.15)]"
                    : "border border-black/[0.08] bg-white",
                ].join(" ")}
                style={{ color: territory === t ? "#0F0A1E" : "rgba(15,10,30,0.45)" }}
              >
                {t}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-sm font-medium" style={{ color: "#0F0A1E" }}>Urgency</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onExpressChange(false)}
              className={[
                "rounded-lg px-4 py-2.5 text-sm font-semibold transition-[border-color,background-color] duration-[180ms]",
                !express
                  ? "border border-[#7C3AED] bg-[rgba(124,58,237,0.15)]"
                  : "border border-black/[0.08] bg-white",
              ].join(" ")}
              style={{ color: !express ? "#0F0A1E" : "rgba(15,10,30,0.45)" }}
            >
              Standard (3–5 days)
            </button>
            <button
              type="button"
              onClick={() => onExpressChange(true)}
              className={[
                "rounded-lg px-4 py-2.5 text-sm font-semibold transition-[border-color,background-color] duration-[180ms]",
                express
                  ? "border border-[#7C3AED] bg-[rgba(124,58,237,0.15)]"
                  : "border border-black/[0.08] bg-white",
              ].join(" ")}
              style={{ color: express ? "#0F0A1E" : "rgba(15,10,30,0.45)" }}
            >
              Express (24hrs, + SAR 500)
            </button>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-4">
        <div className="rounded-xl border border-black/[0.08] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.38)" }}>Selected</p>
          <div className="mt-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={celebrityImageUrl}
              alt=""
              className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-black/[0.08]"
            />
            <span className="font-display text-base font-semibold" style={{ color: "#0F0A1E" }}>{celebrityName}</span>
          </div>
          <dl className="mt-6 space-y-3 border-t border-black/[0.08] pt-6 text-sm">
            <div className="flex justify-between gap-2">
              <dt style={{ color: "rgba(15,10,30,0.45)" }}>Template</dt>
              <dd className="text-end font-medium" style={{ color: "#0F0A1E" }}>{templateName}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt style={{ color: "rgba(15,10,30,0.45)" }}>Platforms</dt>
              <dd className="max-w-[55%] text-end text-xs" style={{ color: "rgba(15,10,30,0.55)" }}>
                {platforms.length ? platforms.join(", ") : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt style={{ color: "rgba(15,10,30,0.45)" }}>Duration</dt>
              <dd className="text-end" style={{ color: "#0F0A1E" }}>{DURATION_LABEL[duration] ?? duration}</dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-black/[0.08] pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.38)" }}>Indicative price</p>
            <p className="mt-1 font-display text-3xl font-bold" style={{ color: "#0F0A1E" }}>SAR {indicativePriceSar.toLocaleString("en-SA")}</p>
            <p className="mt-2 text-xs" style={{ color: "rgba(15,10,30,0.38)" }}>Final price confirmed after review</p>
          </div>
          <button
            type="button"
            disabled
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] py-3.5 text-sm font-semibold text-white opacity-90"
          >
            Start Generation <span aria-hidden>🔒</span>
          </button>
          <p className="mt-3 text-center text-xs" style={{ color: "rgba(15,10,30,0.38)" }}>Payment &amp; login required to proceed</p>
        </div>
      </aside>
    </div>
  );
}
