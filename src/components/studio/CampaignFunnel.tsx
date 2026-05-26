"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { BriefAndAssets } from "@/components/studio/steps/campaign/BriefAndAssets";
import { CampaignApprovalStatus } from "@/components/studio/steps/campaign/ApprovalStatus";
import { DeliveryLicense } from "@/components/studio/steps/campaign/DeliveryLicense";
import { LicenseScope } from "@/components/studio/steps/campaign/LicenseScope";
import { LoginCompany } from "@/components/studio/steps/campaign/LoginCompany";
import { PayAndConfirm } from "@/components/studio/steps/campaign/PayAndConfirm";
import { PreviewCampaign } from "@/components/studio/steps/campaign/PreviewCampaign";
import { SelectCampaignCelebrity } from "@/components/studio/steps/campaign/SelectCampaignCelebrity";
import { SelectCampaignTemplate } from "@/components/studio/steps/campaign/SelectCampaignTemplate";
import { ValidationStatus } from "@/components/studio/steps/campaign/ValidationStatus";
import { useUser } from "@/contexts/UserContext";
import type { ApiCelebrity, ApiTemplate } from "@/lib/api";
import { celebrityApi, jobApi, templateApi } from "@/lib/api";
import type { LicenseScope as LicenseScopeType } from "@/lib/studio/campaign-funnel-data";
import {
  DEFAULT_LICENSE_SCOPE,
  estimateCampaignSubtotal,
  withVat,
} from "@/lib/studio/campaign-funnel-data";

const hPrimaryStyle: React.CSSProperties  = { background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", boxShadow: "0 8px 24px rgba(124,58,237,0.30)", border: "none" };
const hSecondaryStyle: React.CSSProperties = { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "rgba(15,10,30,0.60)" };

const SIDEBAR: { id: number; label: string; afterDivider?: boolean }[] = [
  { id: 1,  label: "Template"        },
  { id: 2,  label: "Celebrity"       },
  { id: 3,  label: "Preview"         },
  { id: 4,  label: "Login / Company", afterDivider: true },
  { id: 5,  label: "License Scope"   },
  { id: 6,  label: "Pay & Confirm"   },
  { id: 7,  label: "Brief & Assets"  },
  { id: 8,  label: "Validation"      },
  { id: 9,  label: "Approval"        },
  { id: 10, label: "Delivery"        },
];

function lockTitle(stepId: number, gateEntered: boolean, loggedIn: boolean, licenseStepDone: boolean, hasPaid: boolean) {
  if (stepId >= 4 && !gateEntered)   return "Start campaign to unlock";
  if (stepId >= 5 && !loggedIn)      return "Sign in to continue";
  if (stepId >= 6 && !licenseStepDone) return "Confirm license scope first";
  if (stepId >= 7 && !hasPaid)       return "Complete payment to unlock";
  return "Complete payment to unlock";
}

export type CampaignFunnelWorkspaceProps = {
  onClose:   () => void;
  sessionId: number;
};

export function CampaignFunnelWorkspace({ onClose, sessionId }: CampaignFunnelWorkspaceProps) {
  const { user } = useUser();
  const router   = useRouter();

  // ── API data ──────────────────────────────────────────────
  const [templates,         setTemplates]         = useState<ApiTemplate[]>([]);
  const [celebrities,       setCelebrities]       = useState<ApiCelebrity[]>([]);
  const [templatesLoading,  setTemplatesLoading]  = useState(true);
  const [celebsLoading,     setCelebsLoading]     = useState(true);

  useEffect(() => {
    templateApi.list("video-ad")
      .then((res) => setTemplates(res.data))
      .catch(() => {})
      .finally(() => setTemplatesLoading(false));
    celebrityApi.list()
      .then((res) => setCelebrities(res.data))
      .catch(() => {})
      .finally(() => setCelebsLoading(false));
  }, []);

  // ── Funnel state ──────────────────────────────────────────
  const [currentStep,     setCurrentStep]     = useState(1);
  const [templateId,      setTemplateId]      = useState<string | null>(null);
  const [celebrityId,     setCelebrityId]     = useState<string | null>(null);
  const [gateEntered,     setGateEntered]     = useState(false);
  const [loggedIn,        setLoggedIn]        = useState(false);
  const [licenseStepDone, setLicenseStepDone] = useState(false);
  const [hasPaid,         setHasPaid]         = useState(false);
  const [scope,           setScope]           = useState<LicenseScopeType>(DEFAULT_LICENSE_SCOPE);

  const [briefObjective,  setBriefObjective]  = useState("");
  const [briefKeyMessage, setBriefKeyMessage] = useState("");
  const [briefCta,        setBriefCta]        = useState("");
  const [briefAudience,   setBriefAudience]   = useState("");
  const [briefProhibited, setBriefProhibited] = useState("");

  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showToast,   setShowToast]   = useState(false);

  // Reset funnel when a new session starts
  useEffect(() => {
    setCurrentStep(1);
    setTemplateId(null);
    setCelebrityId(null);
    setGateEntered(false);
    setLoggedIn(false);
    setLicenseStepDone(false);
    setHasPaid(false);
    setScope(DEFAULT_LICENSE_SCOPE);
    setBriefObjective("");
    setBriefKeyMessage("");
    setBriefCta("");
    setBriefAudience("");
    setBriefProhibited("");
    setSubmitting(false);
    setSubmitError("");
    setShowToast(false);
  }, [sessionId]);

  // Sync login state from auth context
  useEffect(() => {
    if (user) setLoggedIn(true);
  }, [user]);

  // ── Derived data ──────────────────────────────────────────
  const tpl = useMemo(() => templates.find((t) => t.id === templateId) ?? null, [templates, templateId]);
  const cel = useMemo(() => celebrities.find((c) => c.id === celebrityId) ?? null, [celebrities, celebrityId]);

  const selectionsComplete = Boolean(templateId && celebrityId);

  const step4Unlocked  = gateEntered || currentStep >= 4;
  const step5Unlocked  = step4Unlocked && (loggedIn || currentStep >= 5);
  const step6Unlocked  = step5Unlocked && (licenseStepDone || currentStep >= 6);
  const postPayUnlocked = hasPaid || currentStep >= 7;

  const isSidebarStepLocked = (stepId: number) => {
    if (stepId <= 3)  return false;
    if (stepId === 4) return !step4Unlocked;
    if (stepId === 5) return !step5Unlocked;
    if (stepId === 6) return !step6Unlocked;
    return !postPayUnlocked;
  };

  const canNextEarly = useMemo(() => {
    if (currentStep === 1) return templateId !== null;
    if (currentStep === 2) return celebrityId !== null;
    return true;
  }, [currentStep, templateId, celebrityId]);

  const subtotal = estimateCampaignSubtotal(null, cel?.price_range?.["video-ad"]?.min ?? 0, scope);
  const priced   = useMemo(() => withVat(subtotal), [subtotal]);
  const briefOk  = briefObjective.trim() && briefKeyMessage.trim() && briefAudience.trim();

  // ── Navigation ────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [currentStep]);

  const handleSidebarStep = (stepId: number) => {
    if (isSidebarStepLocked(stepId)) return;
    setCurrentStep(stepId);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleNext = () => {
    if (!canNextEarly) return;
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const openGate = () => {
    setGateEntered(true);
    setCurrentStep(loggedIn ? 5 : 4);
  };

  const handleLogin = () => {
    setLoggedIn(true);
    setCurrentStep(5);
  };

  const handleAuthorize = () => {
    setHasPaid(true);
    setCurrentStep(7);
  };

  // ── Job submission ────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (!templateId || !celebrityId || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const script = [briefKeyMessage, briefCta].filter(Boolean).join(". ") || briefObjective;
      const res = await jobApi.create({
        celebrityId,
        productType: "video-ad",
        purpose:     briefObjective || tpl?.purpose || "Advertisement Campaign",
        script:      script || "Advertisement Campaign",
        templateId:  templateId,
        channels:    scope.channels,
      });
      setShowToast(true);
      setTimeout(() => {
        router.push(`/studio/requests/${res.data.reference_id}`);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      setSubmitError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {showToast && (
        <div style={{
          position: "fixed", top: 24, insetInlineEnd: 24, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 12,
          background: "#FFFFFF", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 12,
          padding: "14px 18px", boxShadow: "0 0 24px rgba(34,197,94,0.12), 0 8px 32px rgba(0,0,0,0.10)",
        }}>
          <CheckCircle2 size={20} color="#16A34A" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F0A1E" }}>
              Request submitted successfully
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(15,10,30,0.45)", marginTop: 2 }}>
              Redirecting to your request…
            </p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <nav
        className="hidden md:flex w-[220px] shrink-0 flex-col py-4"
        aria-label="Campaign funnel steps"
        style={{ background: "#F8F7FF", borderRight: "1px solid rgba(0,0,0,0.08)" }}
      >
        <ul className="flex flex-col gap-0.5 px-2">
          {SIDEBAR.map((s) => {
            const locked  = isSidebarStepLocked(s.id);
            const active  = !locked && s.id === currentStep;
            const done    = !locked && s.id < currentStep;
            const tip     = lockTitle(s.id, gateEntered, loggedIn, licenseStepDone, hasPaid);

            const rowContent = (
              <>
                <span
                  className="flex shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-all duration-200"
                  style={{
                    width:      28, height:     28,
                    background: done ? "linear-gradient(135deg, #7C3AED, #5B21B6)" : active ? "rgba(124,58,237,0.10)" : "rgba(0,0,0,0.05)",
                    border:     done ? "none" : active ? "2px solid #7C3AED" : "1px solid rgba(0,0,0,0.10)",
                    color:      done ? "#FFFFFF" : active ? "#7C3AED" : "rgba(15,10,30,0.25)",
                    boxShadow:  done ? "0 4px 12px rgba(124,58,237,0.35)" : "none",
                  }}
                >
                  {done ? "✓" : s.id}
                </span>
                <span
                  className="min-w-0 flex-1 truncate text-[13px]"
                  style={{
                    fontWeight: active ? 600 : 400,
                    color: locked ? "rgba(15,10,30,0.20)" : active ? "#0F0A1E" : done ? "rgba(15,10,30,0.45)" : "rgba(15,10,30,0.35)",
                  }}
                >
                  {s.label}
                </span>
                {locked && (
                  <span className="shrink-0 text-[10px]" style={{ color: "rgba(15,10,30,0.20)" }} aria-hidden>🔒</span>
                )}
              </>
            );

            return (
              <li key={s.id}>
                {s.afterDivider && (
                  <div className="my-2 px-3 text-[10px] font-bold uppercase" style={{ color: "rgba(15,10,30,0.20)", letterSpacing: "0.14em" }}>
                    After Payment
                  </div>
                )}
                {locked ? (
                  <div title={tip} className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2">{rowContent}</div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSidebarStep(s.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start transition-all duration-200"
                    style={{
                      background: active ? "rgba(124,58,237,0.07)" : "transparent",
                      border:     active ? "1px solid rgba(124,58,237,0.18)" : "1px solid transparent",
                    }}
                  >
                    {rowContent}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Main content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col" style={{ background: "#FFFFFF" }}>
        {/* Mobile step indicator */}
        <div className="md:hidden shrink-0 px-4 pb-2.5 pt-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[13px] font-medium" style={{ color: "#0F0A1E" }}>
              Step {currentStep} of {SIDEBAR.length}
            </span>
            <span className="text-[12px]" style={{ color: "rgba(15,10,30,0.40)" }}>
              {SIDEBAR.find((s) => s.id === currentStep)?.label ?? ""}
            </span>
          </div>
          <div className="h-[2px] overflow-hidden rounded-full" style={{ background: "rgba(0,0,0,0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.round((currentStep / SIDEBAR.length) * 100)}%`, background: "#7C3AED" }}
            />
          </div>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
          <div key={currentStep} className="funnel-step-animate">
            {currentStep === 1  && (
              <SelectCampaignTemplate
                selectedId={templateId}
                onSelect={setTemplateId}
                templates={templates}
                loading={templatesLoading}
              />
            )}
            {currentStep === 2  && (
              <SelectCampaignCelebrity
                selectedId={celebrityId}
                onSelect={setCelebrityId}
                celebrities={celebrities}
                loading={celebsLoading}
              />
            )}
            {currentStep === 3  && (
              <PreviewCampaign
                campaignTypeId={null}
                templateId={templateId}
                celebrityId={celebrityId}
                template={tpl}
                celebrity={cel}
                onStartCampaign={openGate}
              />
            )}
            {currentStep === 4  && (
              <LoginCompany currentUser={user} onLogin={handleLogin} />
            )}
            {currentStep === 5  && (
              <LicenseScope campaignTypeId={null} celebrity={cel} scope={scope} onScopeChange={setScope} />
            )}
            {currentStep === 6  && (
              <PayAndConfirm template={tpl} celebrity={cel} scope={scope} onAuthorize={handleAuthorize} />
            )}
            {currentStep === 7  && (
              <BriefAndAssets
                objective={briefObjective}
                keyMessage={briefKeyMessage}
                cta={briefCta}
                audience={briefAudience}
                prohibited={briefProhibited}
                onObjectiveChange={setBriefObjective}
                onKeyMessageChange={setBriefKeyMessage}
                onCtaChange={setBriefCta}
                onAudienceChange={setBriefAudience}
                onProhibitedChange={setBriefProhibited}
                onSubmit={handleFinalSubmit}
              />
            )}
            {currentStep === 8  && <ValidationStatus />}
            {currentStep === 9  && (
              <CampaignApprovalStatus template={tpl} celebrity={cel} scope={scope} />
            )}
            {currentStep === 10 && (
              <DeliveryLicense template={tpl} celebrity={cel} scope={scope} />
            )}
          </div>
          {submitError && (
            <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 ring-1 ring-red-500/20">
              {submitError}
            </p>
          )}
        </div>

        {/* Footer bar */}
        <div
          className="flex shrink-0 items-center gap-3 px-4 py-3 md:h-16 md:justify-between md:py-0 md:px-6"
          style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(0,0,0,0.08)" }}
        >
          <p
            className="hidden md:block min-w-0 flex-1 truncate text-sm text-[var(--color-text-secondary)]"
            title={`${tpl?.name ?? "…"} · ${cel?.name ?? "…"} · SAR ${subtotal.toLocaleString("en-SA")}`}
          >
            <span className={templateId ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>
              {tpl?.name ?? "Template"}
            </span>
            <span className="text-[var(--color-text-muted)]"> · </span>
            <span className={celebrityId ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>
              {cel?.name ?? "Celebrity"}
            </span>
            <span className="text-[var(--color-text-muted)]"> · </span>
            <span className="text-[var(--color-text)]">SAR {subtotal.toLocaleString("en-SA")}+</span>
          </p>
          <div className="flex w-full items-center gap-2 md:w-auto md:shrink-0">
            {currentStep === 10 ? (
              <button
                type="button"
                onClick={onClose}
                className="flex h-12 flex-1 md:h-[44px] md:flex-none md:px-5 items-center justify-center rounded-xl text-[13px] font-semibold transition-all duration-200"
                style={hSecondaryStyle}
              >
                Back to Home
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep <= 1}
                  className="flex h-12 w-12 shrink-0 md:h-[44px] md:w-auto md:px-5 items-center justify-center rounded-xl text-[13px] font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-30"
                  style={hSecondaryStyle}
                >
                  <span className="md:hidden">←</span>
                  <span className="hidden md:inline">← Back</span>
                </button>
                {currentStep === 3 && <button type="button" onClick={openGate} disabled={!selectionsComplete} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40" style={hPrimaryStyle}>Start Campaign</button>}
                {currentStep === 4 && <button type="button" onClick={() => loggedIn && setCurrentStep(5)} disabled={!loggedIn} title={!loggedIn ? "Sign in first" : undefined} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40" style={hPrimaryStyle}>Continue →</button>}
                {currentStep === 5 && <button type="button" onClick={() => { setLicenseStepDone(true); setCurrentStep(6); }} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px" style={hPrimaryStyle}>Continue to Payment →</button>}
                {currentStep === 6 && <button type="button" onClick={handleAuthorize} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px" style={hPrimaryStyle}>Pay — SAR {priced.total.toLocaleString("en-SA", { minimumFractionDigits: 2 })}</button>}
                {currentStep === 7 && <button type="button" onClick={handleFinalSubmit} disabled={!briefOk || submitting} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40" style={hPrimaryStyle}>{submitting ? "Submitting…" : "Submit Brief →"}</button>}
                {currentStep === 8 && <button type="button" onClick={() => setCurrentStep(9)} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px" style={hPrimaryStyle}>Continue to Approval →</button>}
                {currentStep === 9 && <button type="button" onClick={() => setCurrentStep(10)} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px" style={hPrimaryStyle}>Continue to Delivery →</button>}
                {currentStep <= 2 && <button type="button" onClick={handleNext} disabled={!canNextEarly} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40" style={hPrimaryStyle}>Next →</button>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export type CampaignFunnelProps = {
  open:    boolean;
  onClose: () => void;
};

export function CampaignFunnel({ open, onClose }: CampaignFunnelProps) {
  const [sessionId, setSessionId] = useState(0);
  useEffect(() => {
    if (open) setSessionId((s) => s + 1);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-stretch justify-center p-0 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-funnel-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] transition-[var(--transition)]"
        aria-label="Close campaign studio"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex h-full w-full max-h-[100dvh] max-w-[1400px] flex-col overflow-hidden rounded-none sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl"
        style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.09)", boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}
      >
        <header
          className="flex h-14 shrink-0 items-center justify-between px-4 md:px-5"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.97)" }}
        >
          <h2 id="campaign-funnel-title" className="font-display text-[15px] font-bold" style={{ color: "#0F0A1E" }}>
            Advertisement Campaign
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl text-xl transition-all duration-150 hover:bg-black/[0.05]"
            style={{ color: "rgba(15,10,30,0.40)" }}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <CampaignFunnelWorkspace key={sessionId} sessionId={sessionId} onClose={onClose} />
      </div>
    </div>
  );
}
