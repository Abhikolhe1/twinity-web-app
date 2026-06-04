"use client";

import type { SubmissionValidationResult } from "@/lib/api";

type RowState = "passed" | "flagged" | "needs";

function Row({ label, state, note }: { label: string; state: RowState; note: string }) {
  const icon = state === "passed" ? "✓" : state === "flagged" ? "!" : "?";
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

export type ValidationStatusProps = {
  validation?: SubmissionValidationResult | null;
};

export function ValidationStatus({ validation }: ValidationStatusProps) {
  const hasBlockingErrors = Boolean(validation?.errors.length);
  const hasWarnings = Boolean(validation?.warnings.length);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Validation</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Automated checks before Twinity compliance and talent routing.</p>
      <div className="mt-8 max-w-2xl space-y-3">
        <Row
          label="Policy review"
          state="passed"
          note="The campaign brief has passed the current automated policy scan."
        />
        <Row
          label="Business profile"
          state={validation?.businessVerificationPassed === false ? "flagged" : "passed"}
          note={validation?.businessVerificationPassed === false
            ? "Business details are incomplete, so this request will route through manual review."
            : "Account details satisfy the current business verification gate."}
        />
        <Row
          label="Celebrity restrictions"
          state={hasBlockingErrors ? "flagged" : "passed"}
          note={hasBlockingErrors
            ? validation?.errors[0]?.message || "A restriction needs to be resolved before submission can continue."
            : "No conflicting celebrity territory or endorsement restrictions were detected."}
        />
        <Row
          label="Routing"
          state={hasWarnings ? "flagged" : "passed"}
          note={`Submission path: ${validation?.approvalPath === "fast_track" ? "Fast track" : "Full review"}${hasWarnings ? " with manual review notes." : "."}`}
        />
        <Row
          label="Completeness"
          state="needs"
          note="Supporting uploads remain optional in this flow, but richer assets still improve review quality."
        />
      </div>
      <p className="mt-8 max-w-2xl text-sm" style={{ color: "rgba(15,10,30,0.45)" }}>
        {hasBlockingErrors
          ? "Resolve the blocking validation issue above before creating the request."
          : "Flagged notes do not always block submission, but they can still route the request through manual review."}
      </p>
    </div>
  );
}
