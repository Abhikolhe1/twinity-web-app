"use client";

import { useState } from "react";
import type { ApiCelebrity, ApiTemplate } from "@/lib/api";
import { GreetingOrderSummaryCard } from "./PreviewGreetingSample";

export type GreetingPayAndConfirmProps = {
  occasion:    string | null;
  celebrity:   ApiCelebrity | null;
  template:    ApiTemplate | null;
  onConfirm:   () => void;
  isSubmitting: boolean;
  error:       string;
  isAlreadyPaid?: boolean;
};

export function GreetingPayAndConfirm({
  occasion,
  celebrity,
  template,
  onConfirm,
  isSubmitting,
  error,
  isAlreadyPaid = false,
}: GreetingPayAndConfirmProps) {
  const [method, setMethod] = useState<"visa" | "apple" | "mada">("visa");

  const priceMin = celebrity?.price_range?.greeting?.min;
  const priceLabel = priceMin
    ? `From SAR ${priceMin.toLocaleString("en-SA")}`
    : "Contact for pricing";

  const METHODS = [
    { id: "visa"  as const, label: "Visa / Mastercard" },
    { id: "apple" as const, label: "Apple Pay" },
    { id: "mada"  as const, label: "Mada" },
  ] as const;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>
        {isAlreadyPaid ? "Review & Resubmit" : "Pay & Confirm"}
      </h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>
        {isAlreadyPaid
          ? "Payment was already confirmed for this request. Please review and resubmit."
          : "Authorize payment to proceed to your personalized greeting request."}
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-6">
          {/* Payment summary */}
          <div className="rounded-xl border border-black/[0.08] bg-white p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.45)" }}>
              {isAlreadyPaid ? "Original payment summary" : "Payment summary"}
            </h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between" style={{ color: "rgba(15,10,30,0.55)" }}>
                <dt>Greeting — {occasion ?? "Custom occasion"}</dt>
                <dd>{priceLabel}</dd>
              </div>
              <div className="flex justify-between" style={{ color: "rgba(15,10,30,0.55)" }}>
                <dt>Celebrity</dt>
                <dd>{celebrity?.name ?? "—"}</dd>
              </div>
              {template && (
                <div className="flex justify-between" style={{ color: "rgba(15,10,30,0.55)" }}>
                  <dt>Template</dt>
                  <dd>{template.name}</dd>
                </div>
              )}
              <div className="my-3 h-px bg-black/[0.08]" />
              <div className="flex justify-between text-xs" style={{ color: "rgba(15,10,30,0.40)" }}>
                <dt>VAT (15%)</dt>
                <dd>Included</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs" style={{ color: "rgba(15,10,30,0.40)" }}>
              {isAlreadyPaid
                ? "Your original payment is held in escrow and will be applied to this resubmission."
                : "Final price confirmed after request review. Payment is held in escrow until delivery."}
            </p>
          </div>

          {/* Payment method */}
          {!isAlreadyPaid && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(15,10,30,0.45)" }}>
                Payment method
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {METHODS.map((m) => (
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
          )}

          {isAlreadyPaid && (
            <div className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-700 ring-1 ring-green-500/20">
              <p className="font-semibold">Payment Confirmed</p>
              <p className="mt-0.5 opacity-80">You will not be charged again for this resubmission.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 ring-1 ring-red-500/20">
              {error}
            </p>
          )}

          {/* Confirm button */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting
              ? "Submitting request…"
              : isAlreadyPaid
                ? "Confirm & Resubmit Request"
                : "Confirm & Submit Request"}
          </button>
        </div>

        {/* Order summary card */}
        <div className="w-full min-w-0 lg:max-w-md lg:flex-[0.4]">
          <GreetingOrderSummaryCard occasion={occasion} celebrity={celebrity} template={template} />
        </div>
      </div>
    </div>
  );
}
