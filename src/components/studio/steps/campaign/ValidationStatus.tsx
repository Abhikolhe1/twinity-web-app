"use client";

type RowState = "passed" | "flagged" | "needs";

function Row({ label, state, note }: { label: string; state: RowState; note: string }) {
  const icon = state === "passed" ? "✅" : state === "flagged" ? "⚠️" : "❔";
  const color =
    state === "passed" ? "text-green-700" : state === "flagged" ? "text-amber-700" : "text-[rgba(15,10,30,0.45)]";
  return (
    <div className="flex gap-4 rounded-lg border border-black/[0.08] bg-white px-4 py-3">
      <span className="text-lg" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold" style={{ color: "#0F0A1E" }}>{label}</p>
        <p className={`mt-0.5 text-xs ${color}`}>{note}</p>
      </div>
    </div>
  );
}

export function ValidationStatus() {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Validation</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Automated checks before Twinity compliance and talent routing.</p>
      <div className="mt-8 max-w-2xl space-y-3">
        <Row label="Policy review" state="passed" note="No restricted categories detected in brief." />
        <Row label="Brand safety" state="passed" note="Claims language within allowed promotional band." />
        <Row label="Category restrictions" state="flagged" note="Talent category requires softening competitive references." />
        <Row label="Completeness" state="needs" note="Awaiting final logo vector pack (optional but recommended)." />
        <Row label="Celebrity restrictions" state="passed" note="No conflicting endorsements for selected territory." />
      </div>
      <p className="mt-8 max-w-2xl text-sm" style={{ color: "rgba(15,10,30,0.45)" }}>
        Flagged items do not block submission — they generate tasks for your account manager and may require brief edits
        before celebrity approval.
      </p>
    </div>
  );
}
