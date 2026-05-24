"use client";

export type BriefAndAssetsProps = {
  objective: string;
  keyMessage: string;
  cta: string;
  audience: string;
  prohibited: string;
  onObjectiveChange: (v: string) => void;
  onKeyMessageChange: (v: string) => void;
  onCtaChange: (v: string) => void;
  onAudienceChange: (v: string) => void;
  onProhibitedChange: (v: string) => void;
  onSubmit: () => void;
};

export function BriefAndAssets({
  objective,
  keyMessage,
  cta,
  audience,
  prohibited,
  onObjectiveChange,
  onKeyMessageChange,
  onCtaChange,
  onAudienceChange,
  onProhibitedChange,
  onSubmit,
}: BriefAndAssetsProps) {
  const ok = objective.trim() && keyMessage.trim() && audience.trim();

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Brief & Assets</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Structured creative intake — feeds validation and celebrity-manager review.</p>
      <form
        className="mt-8 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) onSubmit();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Script (PDF/DOCX)", "Upload"],
            ["Campaign brief", "Upload"],
            ["Brand guidelines", "Upload"],
            ["Logo pack (SVG/PNG)", "Upload"],
            ["Reference images", "Upload"],
            ["Reference video", "Upload"],
          ].map(([label, action]) => (
            <div
              key={label}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-black/[0.12] bg-white px-3 py-8 text-center transition-colors duration-[180ms] hover:border-[#7C3AED]/35"
            >
              <span className="text-xs font-semibold" style={{ color: "rgba(15,10,30,0.65)" }}>{label}</span>
              <span className="mt-2 text-[11px] text-[#7C3AED]">{action}</span>
            </div>
          ))}
        </div>
        <label className="block">
          <span className="text-sm font-medium" style={{ color: "rgba(15,10,30,0.70)" }}>Campaign objective *</span>
          <textarea
            value={objective}
            onChange={(e) => onObjectiveChange(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
            placeholder="e.g. Drive qualified installs for v2 launch in KSA"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium" style={{ color: "rgba(15,10,30,0.70)" }}>Key message *</span>
          <textarea
            value={keyMessage}
            onChange={(e) => onKeyMessageChange(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium" style={{ color: "rgba(15,10,30,0.70)" }}>Primary CTA</span>
            <input
              value={cta}
              onChange={(e) => onCtaChange(e.target.value)}
              className="mt-2 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
              placeholder="Install · Shop · Sign up"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium" style={{ color: "rgba(15,10,30,0.70)" }}>Target audience *</span>
            <input
              value={audience}
              onChange={(e) => onAudienceChange(e.target.value)}
              className="mt-2 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
              placeholder="Women 25–40, Riyadh, AR-first"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium" style={{ color: "rgba(15,10,30,0.70)" }}>Prohibited mentions / competitor sensitivity</span>
          <textarea
            value={prohibited}
            onChange={(e) => onProhibitedChange(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
            placeholder="No competitor names, no alcohol adjacency, …"
          />
        </label>
        <button
          type="submit"
          disabled={!ok}
          className="w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9] disabled:pointer-events-none disabled:opacity-40"
        >
          Submit brief for validation →
        </button>
      </form>
    </div>
  );
}
