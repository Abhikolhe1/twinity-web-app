"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Lock, Shield, Sparkles } from "lucide-react";

import { useCreditsOptional } from "@/contexts/CreditsContext";
import type {
  CreditBalance,
  RegenerationAttempt,
} from "@/lib/credits";
import {
  REGENERATION_CREDIT_COST,
} from "@/lib/credits";
import type { RequestStatus } from "@/lib/request-statuses";

import { CreditBalancePill, RegenerationCreditGate } from "./RegenerationCreditGate";
import { RegenerationHistory }                       from "./RegenerationHistory";
import { RegenerationPromptInput }                   from "./RegenerationPromptInput";
import { RegenerationVoiceUpload }                   from "./RegenerationVoiceUpload";

/* ── Allowed statuses for regeneration ───────────────────────────────────── */
const ALLOWED_STATUSES: RequestStatus[] = ["DELIVERED", "APPROVED", "PREVIEW_REVIEW"];

/* ── Props ───────────────────────────────────────────────────────────────── */
export type RegenerationStudioProps = {
  requestId:           string;
  requestType:         "GREETING" | "AD_IMAGE";
  requestStatus:       RequestStatus;
  creditBalance:       CreditBalance | null;
  previousAttempts?:   RegenerationAttempt[];
  onRegenerationSubmitted?: (attempt: RegenerationAttempt) => void;
  onPurchaseCredits?:  () => void;
};

/* ── Toast component ─────────────────────────────────────────────────────── */
function Toast({
  type,
  message,
  sub,
}: {
  type:     "success" | "error";
  message:  string;
  sub?:     string;
}) {
  const isSuccess = type === "success";
  return (
    <div style={{
      position:   "fixed",
      top:        24,
      insetInlineEnd: 24,
      zIndex:     9999,
      display:    "flex",
      alignItems: "flex-start",
      gap:        12,
      background: "#FFFFFF",
      border:     "1px solid rgba(0,0,0,0.10)",
      borderRadius: 12,
      padding:    "14px 18px",
      boxShadow:  isSuccess
        ? "0 0 24px rgba(34,197,94,0.10), 0 8px 32px rgba(0,0,0,0.12)"
        : "0 0 24px rgba(239,68,68,0.10), 0 8px 32px rgba(0,0,0,0.12)",
      animation:  "funnelStepIn 200ms ease both",
      maxWidth:   360,
    }}>
      {isSuccess
        ? <CheckCircle2 size={20} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
        : <AlertTriangle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
      }
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F0A1E" }}>{message}</p>
        {sub && (
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(15,10,30,0.50)" }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ── Degraded state (creditBalance is null) ──────────────────────────────── */
function DegradedState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div style={{
      background:   "#FFFFFF",
      border:       "1px solid rgba(0,0,0,0.08)",
      borderRadius: 16,
      padding:      "24px 20px",
      textAlign:    "center",
    }}>
      <AlertTriangle size={28} color="#606060" style={{ margin: "0 auto 10px" }} />
      <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(15,10,30,0.50)", margin: 0 }}>
        Credit information unavailable — refresh to try again.
      </p>
      <button
        type="button"
        onClick={onRefresh}
        style={{
          marginTop:    12,
          display:      "inline-flex",
          alignItems:   "center",
          height:       36,
          paddingInline: 16,
          borderRadius: 8,
          border:       "1px solid rgba(0,0,0,0.12)",
          background:   "transparent",
          color:        "rgba(15,10,30,0.45)",
          fontSize:     13,
          fontWeight:   500,
          cursor:       "pointer",
        }}
      >
        Refresh
      </button>
    </div>
  );
}

/* ── Submit button ───────────────────────────────────────────────────────── */
type SubmitState = "idle-valid" | "idle-invalid" | "submitting" | "cooldown" | "no-credits";

function SubmitButton({
  state,
  cooldownSeconds,
  onClick,
}: {
  state:           SubmitState;
  cooldownSeconds: number;
  onClick:         () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const base: React.CSSProperties = {
    display:        "inline-flex",
    alignItems:     "center",
    gap:            8,
    padding:        "12px 24px",
    borderRadius:   10,
    fontSize:       14,
    fontWeight:     600,
    border:         "none",
    cursor:         "pointer",
    transition:     "box-shadow 180ms, opacity 150ms",
    whiteSpace:     "nowrap",
  };

  if (state === "idle-valid") {
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...base,
          background: "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)",
          color:      "#FFFFFF",
          boxShadow:  hovered
            ? "0 0 24px rgba(139,92,246,0.25), 0 1px 3px rgba(0,0,0,0.40)"
            : "0 1px 3px rgba(0,0,0,0.40), 0 0 0 1px rgba(139,92,246,0.40)",
        }}
      >
        <Sparkles size={14} />
        Apply Changes · {REGENERATION_CREDIT_COST} Credit
      </button>
    );
  }

  if (state === "idle-invalid") {
    return (
      <button
        type="button"
        disabled
        title="Add a prompt or voice reference to continue"
        style={{
          ...base,
          background: "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)",
          color:      "#FFFFFF",
          opacity:    0.5,
          cursor:     "not-allowed",
          boxShadow:  "none",
        }}
      >
        <Sparkles size={14} />
        Apply Changes · {REGENERATION_CREDIT_COST} Credit
      </button>
    );
  }

  if (state === "submitting") {
    return (
      <button type="button" disabled style={{ ...base, background: "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)", color: "#FFFFFF", opacity: 0.7, cursor: "not-allowed" }}>
        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
        Submitting…
      </button>
    );
  }

  if (state === "cooldown") {
    return (
      <button type="button" disabled style={{ ...base, background: "#F5F5F5", border: "1px solid rgba(0,0,0,0.10)", color: "rgba(15,10,30,0.35)", cursor: "not-allowed" }}>
        <Clock size={14} />
        Wait {cooldownSeconds}s
      </button>
    );
  }

  /* no-credits */
  return (
    <button type="button" disabled style={{ ...base, background: "#F5F5F5", border: "1px solid rgba(0,0,0,0.10)", color: "rgba(15,10,30,0.35)", cursor: "not-allowed" }}>
      <Lock size={14} />
      No Credits
    </button>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function RegenerationStudio({
  requestId,
  requestType,
  requestStatus,
  creditBalance: initialBalance,
  previousAttempts = [],
  onRegenerationSubmitted,
  onPurchaseCredits,
}: RegenerationStudioProps) {
  /* Visibility guard — only GREETING/AD_IMAGE + allowed statuses */
  if ((requestType !== "GREETING" && requestType !== "AD_IMAGE") || !ALLOWED_STATUSES.includes(requestStatus)) {
    return null;
  }

  return (
    <RegenerationStudioInner
      requestId={requestId}
      isImageMode={requestType === "AD_IMAGE"}
      initialBalance={initialBalance}
      previousAttempts={previousAttempts}
      onRegenerationSubmitted={onRegenerationSubmitted}
      onPurchaseCredits={onPurchaseCredits}
    />
  );
}

/* ── Inner component (separated so guards run before hooks) ──────────────── */
function RegenerationStudioInner({
  requestId,
  isImageMode,
  initialBalance,
  previousAttempts,
  onRegenerationSubmitted,
  onPurchaseCredits,
}: {
  requestId:               string;
  isImageMode:             boolean;
  initialBalance:          CreditBalance | null;
  previousAttempts:        RegenerationAttempt[];
  onRegenerationSubmitted?: (attempt: RegenerationAttempt) => void;
  onPurchaseCredits?:      () => void;
}) {
  /* Context — optional (gracefully degrade if outside provider) */
  const creditsCtx = useCreditsOptional();

  /*
   * Local balance state — only used when context is absent.
   * When context is present, always read from creditsCtx.balance
   * (which handles optimistic updates via deduct/reconcile).
   */
  const [localBalanceState, setLocalBalanceState] = useState<CreditBalance | null>(
    creditsCtx ? null : initialBalance,
  );

  /* Effective balance: context wins, falls back to local state */
  const localBalance: CreditBalance | null = creditsCtx?.balance ?? localBalanceState;

  /* Deduct/reconcile helpers that work whether context is present or not */
  function applyDeduct(amount: number) {
    creditsCtx?.deduct(amount);
    if (!creditsCtx) {
      setLocalBalanceState((b) =>
        b ? { ...b, available: Math.max(0, b.available - amount), used: b.used + amount } : b,
      );
    }
  }

  function applyReconcile(balance: CreditBalance) {
    creditsCtx?.reconcile(balance);
    if (!creditsCtx) setLocalBalanceState(balance);
  }

  /* Form state */
  const [prompt,          setPrompt]          = useState("");
  const [voiceFile,       setVoiceFile]        = useState<File | null>(null);
  const [isSubmitting,    setIsSubmitting]     = useState(false);
  const [submitError,     setSubmitError]      = useState<string | null>(null);
  const [history,         setHistory]          = useState<RegenerationAttempt[]>(previousAttempts);
  const [toast,           setToast]            = useState<{ type: "success" | "error"; message: string; sub?: string } | null>(null);
  const [lastSubmittedAt, setLastSubmittedAt]  = useState<Date | null>(null);
  const [cooldownSeconds, setCooldownSeconds]  = useState(0);

  const COOLDOWN_MS = 60_000;

  /* Cooldown ticker — runs on an interval, avoids Date.now() in render */
  useEffect(() => {
    if (!lastSubmittedAt) {
      const id = setTimeout(() => setCooldownSeconds(0), 0);
      return () => clearTimeout(id);
    }
    function tick() {
      const elapsed   = Date.now() - lastSubmittedAt!.getTime();
      const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      setCooldownSeconds(Math.max(0, remaining));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastSubmittedAt]);

  /* Auto-dismiss toast after 4 seconds */
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (toast) {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 4000);
    }
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, [toast]);

  if (!localBalance) {
    return <DegradedState onRefresh={() => window.location.reload()} />;
  }

  const available = localBalance.available;
  /* cooldownSeconds is updated every 1s by the interval — avoids Date.now() in render */
  const isCooldownActive = cooldownSeconds > 0;
  const hasInput         = prompt.trim().length > 0 || voiceFile !== null;
  const hasCredits       = available >= REGENERATION_CREDIT_COST;

  /* Determine submit button state */
  const submitState: SubmitState =
    isSubmitting                  ? "submitting"   :
    !hasCredits                   ? "no-credits"   :
    isCooldownActive              ? "cooldown"      :
    !hasInput                     ? "idle-invalid"  :
    "idle-valid";

  /* ── Mock voice upload (returns storage key) ───────────────────────────── */
  async function uploadVoiceFile(file: File): Promise<string> {
    /*
     * TODO: Replace with Supabase signed upload URL flow:
     *   1. GET /api/requests/{requestId}/upload-url → { signedUrl, storageKey }
     *   2. PUT signedUrl with file body
     *   3. Return storageKey (never the raw S3 URL)
     * The key is passed in the POST body — never stored in DOM.
     */
    await new Promise((resolve) => setTimeout(resolve, 800)); // simulate upload
    return `voice/${requestId}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
  }

  /* ── Submission flow ───────────────────────────────────────────────────── */
  async function handleSubmit() {
    /* 1. Validate */
    if (!hasInput) return;
    if (!hasCredits) return;
    if (isCooldownActive) return;
    /* Narrow localBalance — should never be null here (DegradedState shows instead) */
    if (!localBalance) return;

    setIsSubmitting(true);
    setSubmitError(null);

    /* Capture current balance as non-null for rollback */
    const prevBalance: CreditBalance = { ...localBalance };

    const optimisticBalance: CreditBalance = {
      available: Math.max(0, prevBalance.available - REGENERATION_CREDIT_COST),
      used:      prevBalance.used + REGENERATION_CREDIT_COST,
      total:     prevBalance.total,
      resetsAt:  prevBalance.resetsAt,
    };
    applyDeduct(REGENERATION_CREDIT_COST);

    try {
      /* 2. Upload voice file if present */
      let voiceReferenceKey: string | undefined;
      if (voiceFile) {
        voiceReferenceKey = await uploadVoiceFile(voiceFile);
      }

      /* 3. POST to API */
      const response = await fetch(`/api/requests/${requestId}/regenerate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          requestId,
          prompt:           prompt.trim(),
          voiceReferenceKey,
          creditsCost:      REGENERATION_CREDIT_COST,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as Record<string, unknown>;

        /* 402 insufficient_credits — rollback */
        if (response.status === 402 || body.code === "insufficient_credits") {
          applyReconcile(prevBalance);
          setSubmitError("You don't have enough credits. Please purchase more to continue.");
          return;
        }

        /* Other error — rollback */
        applyReconcile(prevBalance);
        throw new Error((body.error as string | undefined) ?? "Submission failed.");
      }

      const data = await response.json() as { attempt: RegenerationAttempt; creditsRemaining?: number };
      const newAttempt = data.attempt;

      /* 4. Reconcile with server-confirmed balance */
      if (typeof data.creditsRemaining === "number") {
        const reconciled: CreditBalance = {
          ...optimisticBalance,
          available: data.creditsRemaining,
        };
        applyReconcile(reconciled);
      }

      /* 5. Update state — add attempt at top, clear form, start cooldown */
      setHistory((h) => [newAttempt, ...h]);
      setPrompt("");
      setVoiceFile(null);
      setLastSubmittedAt(new Date());
      onRegenerationSubmitted?.(newAttempt);

      setToast({
        type:    "success",
        message: "Regeneration submitted",
        sub:     "Your new version is being prepared.",
      });

    } catch (err) {
      /* Network failure — rollback, do NOT keep deducted credits */
      applyReconcile(prevBalance);
      setSubmitError(
        err instanceof Error
          ? `${err.message} Your credits were not used.`
          : "Something went wrong. Your credits were not used. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Toast notification */}
      {toast && <Toast type={toast.type} message={toast.message} sub={toast.sub} />}

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Section container — entrance animation matching Studio Home reveal() */}
      <div
        style={{
          background:   "#FFFFFF",
          border:       "1px solid rgba(0,0,0,0.08)",
          borderRadius: 16,
          padding:      24,
          animation:    "fadeUp 250ms cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* ── Section header ───────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            {/* Sparkles icon circle */}
            <div style={{
              width:          28,
              height:         28,
              borderRadius:   9999,
              background:     "rgba(124,58,237,0.12)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
              marginTop:      1,
            }}>
              <Sparkles size={14} color="#7C3AED" />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0F0A1E", margin: 0, lineHeight: 1.3 }}>
                {isImageMode ? "Regenerate Image" : "Regenerate Greeting"}
              </p>
              <p style={{ fontSize: 12, color: "rgba(15,10,30,0.50)", marginTop: 3 }}>
                {isImageMode
                  ? "Request a new version — each attempt uses 1 credit."
                  : `Request a new version — each attempt uses ${REGENERATION_CREDIT_COST} credit.`}
              </p>
            </div>
          </div>

          {/* Balance pill — header shortcut */}
          <CreditBalancePill
            available={available}
            onClick={onPurchaseCredits}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "16px 0" }} />

        {/* ── Credit gate ──────────────────────────────────────────────── */}
        <RegenerationCreditGate
          creditBalance={localBalance}
          costPerAttempt={REGENERATION_CREDIT_COST}
          onPurchaseCredits={onPurchaseCredits}
        />

        {/* ── Form — overlaid with lock when no credits ─────────────────── */}
        <div style={{ position: "relative", marginTop: 16 }}>
          {/* Prompt input */}
          <RegenerationPromptInput
            value={prompt}
            onChange={setPrompt}
            disabled={!hasCredits || isSubmitting}
            placeholder={isImageMode
              ? "Describe what to change in the image…"
              : undefined}
            suggestions={isImageMode ? [
              "Adjust the lighting and mood",
              "Change the background setting",
              "Make it more vibrant and bold",
              "More minimal and clean composition",
            ] : undefined}
          />

          {/* Voice upload — hidden for AD_IMAGE */}
          {!isImageMode && (
            <div style={{ marginTop: 12 }}>
              <RegenerationVoiceUpload
                selectedFile={voiceFile}
                onFileSelected={setVoiceFile}
                onFileRemoved={() => setVoiceFile(null)}
                disabled={!hasCredits || isSubmitting}
              />
            </div>
          )}

          {/* Lock overlay when no credits */}
          {!hasCredits && (
            <div style={{
              position:         "absolute",
              inset:            0,
              background:       "rgba(255,255,255,0.85)",
              backdropFilter:   "blur(4px)",
              borderRadius:     10,
              display:          "flex",
              flexDirection:    "column",
              alignItems:       "center",
              justifyContent:   "center",
              gap:              8,
              textAlign:        "center",
              padding:          24,
            }}>
              <Lock size={32} color="#606060" />
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0F0A1E", margin: 0 }}>
                No credits remaining
              </p>
              <p style={{ fontSize: 13, color: "rgba(15,10,30,0.50)", margin: "4px 0 0" }}>
                Purchase credits to regenerate your greeting.
              </p>
              {onPurchaseCredits && (
                <button
                  type="button"
                  onClick={onPurchaseCredits}
                  style={{
                    marginTop:    8,
                    display:      "inline-flex",
                    alignItems:   "center",
                    gap:          6,
                    height:       40,
                    paddingInline: 20,
                    borderRadius: 10,
                    background:   "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)",
                    color:        "#FFFFFF",
                    fontWeight:   600,
                    fontSize:     13,
                    border:       "none",
                    cursor:       "pointer",
                    boxShadow:    "0 1px 3px rgba(0,0,0,0.40)",
                  }}
                >
                  <Lock size={13} />
                  Buy Credits
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Submit row ────────────────────────────────────────────────── */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Cooldown notice */}
          {isCooldownActive && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={12} color="#F59E0B" />
              <span style={{ fontSize: 12, color: "#F59E0B" }}>
                Please wait {cooldownSeconds}s before requesting another version.
              </span>
            </div>
          )}

          {/* Submit button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SubmitButton
              state={submitState}
              cooldownSeconds={cooldownSeconds}
              onClick={handleSubmit}
            />
          </div>

          {/* Inline error */}
          {submitError && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <AlertTriangle size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: "#EF4444", lineHeight: 1.5 }}>{submitError}</span>
            </div>
          )}

          {/* Task 7.4: Governance copy — always visible, not dismissible [BRD 8.2] */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <Shield size={11} color="#606060" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11, color: "#606060", lineHeight: 1.5 }}>
              Each version is governed and subject to celebrity approval.
              Credits are non-refundable once the request is submitted.
            </span>
          </div>
        </div>

        {/* ── Regeneration history ──────────────────────────────────────── */}
        {history.length > 0 && (
          <div style={{ marginTop: 24, borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 20 }}>
            <RegenerationHistory
              attempts={history}
              onSelectAttempt={(attempt) => {
                /* TODO: open preview modal or scroll to media preview */
                void attempt;
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
