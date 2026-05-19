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
import { SelectCampaignType } from "@/components/studio/steps/campaign/SelectCampaignType";
import { ValidationStatus } from "@/components/studio/steps/campaign/ValidationStatus";
import type { CampaignTypeId, LicenseScope as LicenseScopeType } from "@/lib/studio/campaign-funnel-data";
import {
  DEFAULT_LICENSE_SCOPE,
  estimateCampaignSubtotal,
  getCampaignCelebrity,
  getCampaignTemplate,
  getCampaignType,
  withVat,
} from "@/lib/studio/campaign-funnel-data";

/* Horizon button styles */
const hPrimaryBtn = "inline-flex h-[44px] items-center justify-center rounded-xl px-5 text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px";
const hPrimaryStyle: React.CSSProperties = { background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", boxShadow: "0 8px 24px rgba(124,58,237,0.30)", border: "none" };
const hSecondaryBtn = "inline-flex h-[44px] items-center justify-center rounded-xl px-5 text-[13px] font-semibold transition-all duration-200";
const hSecondaryStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.65)" };

const SIDEBAR: { id: number; label: string; emoji: string; afterDivider?: boolean }[] = [
  { id: 1, label: "Campaign Type", emoji: "📢" },
  { id: 2, label: "Template", emoji: "🎬" },
  { id: 3, label: "Celebrity", emoji: "⭐" },
  { id: 4, label: "Preview", emoji: "👁" },
  { id: 5, label: "Login / Company", emoji: "🔒", afterDivider: true },
  { id: 6, label: "License Scope", emoji: "🔒" },
  { id: 7, label: "Pay & Confirm", emoji: "🔒" },
  { id: 8, label: "Brief & Assets", emoji: "🔒" },
  { id: 9, label: "Validation", emoji: "🔒" },
  { id: 10, label: "Approval", emoji: "🔒" },
  { id: 11, label: "Delivery", emoji: "🔒" },
];

function lockTitle(stepId: number, gateEntered: boolean, mockLoggedIn: boolean, licenseStepDone: boolean, hasPaid: boolean) {
  if (stepId >= 5 && !gateEntered) return "Start campaign to unlock";
  if (stepId >= 6 && gateEntered && !mockLoggedIn) return "Sign in to continue";
  if (stepId >= 7 && mockLoggedIn && !licenseStepDone) return "Confirm license scope first";
  if (stepId >= 8 && !hasPaid) return "Complete payment to unlock";
  return "Complete payment to unlock";
}

export type CampaignFunnelWorkspaceProps = {
  onClose: () => void;
  sessionId: number;
};

export function CampaignFunnelWorkspace({ onClose, sessionId }: CampaignFunnelWorkspaceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignTypeId, setCampaignTypeId] = useState<CampaignTypeId | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [celebrityId, setCelebrityId] = useState<string | null>(null);
  const [gateEntered, setGateEntered] = useState(false);
  const [mockLoggedIn, setMockLoggedIn] = useState(false);
  const [licenseStepDone, setLicenseStepDone] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [scope, setScope] = useState<LicenseScopeType>(DEFAULT_LICENSE_SCOPE);

  const [briefObjective, setBriefObjective] = useState("");
  const [briefKeyMessage, setBriefKeyMessage] = useState("");
  const [briefCta, setBriefCta] = useState("");
  const [briefAudience, setBriefAudience] = useState("");
  const [briefProhibited, setBriefProhibited] = useState("");

  useEffect(() => {
    setCurrentStep(1);
    setCampaignTypeId(null);
    setTemplateId(null);
    setCelebrityId(null);
    setGateEntered(false);
    setMockLoggedIn(false);
    setLicenseStepDone(false);
    setHasPaid(false);
    setScope(DEFAULT_LICENSE_SCOPE);
    setBriefObjective("");
    setBriefKeyMessage("");
    setBriefCta("");
    setBriefAudience("");
    setBriefProhibited("");
  }, [sessionId]);

  const selectionsComplete = Boolean(campaignTypeId && templateId && celebrityId);

  const step5Unlocked = gateEntered || currentStep >= 5;
  const step6Unlocked = step5Unlocked && (mockLoggedIn || currentStep >= 6);
  const step7Unlocked = step6Unlocked && (licenseStepDone || currentStep >= 7);
  const postPayUnlocked = hasPaid || currentStep >= 8;

  const isSidebarStepLocked = (stepId: number) => {
    if (stepId <= 4) return false;
    if (stepId === 5) return !step5Unlocked;
    if (stepId === 6) return !step6Unlocked;
    if (stepId === 7) return !step7Unlocked;
    return !postPayUnlocked;
  };

  const handleSidebarStep = (stepId: number) => {
    if (isSidebarStepLocked(stepId)) return;
    setCurrentStep(stepId);
  };

  const ct = getCampaignType(campaignTypeId);
  const tpl = getCampaignTemplate(templateId);
  const cel = getCampaignCelebrity(celebrityId);

  const canNextEarly = useMemo(() => {
    if (currentStep === 1) return campaignTypeId !== null;
    if (currentStep === 2) return templateId !== null;
    if (currentStep === 3) return celebrityId !== null;
    return true;
  }, [currentStep, campaignTypeId, templateId, celebrityId]);

  const subtotal = estimateCampaignSubtotal(campaignTypeId, cel?.priceFromSar ?? 0, scope);
  const priced = useMemo(() => withVat(subtotal), [subtotal]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [currentStep]);

  const router = useRouter();
  const [showSubmitToast, setShowSubmitToast] = useState(false);

  const handleFinalSubmit = () => {
    setShowSubmitToast(true);
    const newId = `ord-${Date.now().toString(36)}`;
    setTimeout(() => {
      router.push(`/studio/requests/${newId}`);
    }, 1500);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleNext = () => {
    if (!canNextEarly) return;
    if (currentStep < 4) setCurrentStep((s) => s + 1);
  };

  const openGate = () => {
    setGateEntered(true);
    setCurrentStep(5);
  };

  const handleAuthorize = () => {
    setHasPaid(true);
    setCurrentStep(8);
  };

  const briefOk = briefObjective.trim() && briefKeyMessage.trim() && briefAudience.trim();

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {/* Submit success toast */}
      {showSubmitToast && (
        <div style={{
          position: "fixed", top: 24, insetInlineEnd: 24, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 12,
          background: "#161616", border: "1px solid #2A2A2A", borderRadius: 12,
          padding: "14px 18px", boxShadow: "0 0 24px rgba(34,197,94,0.12), 0 8px 32px rgba(0,0,0,0.6)",
        }}>
          <CheckCircle2 size={20} color="#22C55E" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#F0F0F0" }}>
              Request submitted successfully
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#A0A0A0", marginTop: 2 }}>
              Redirecting to your request…
            </p>
          </div>
        </div>
      )}
      <nav
        className="hidden md:flex w-[220px] shrink-0 flex-col py-4"
        aria-label="Campaign funnel steps"
        style={{ background: "rgba(10,8,18,0.60)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <ul className="flex flex-col gap-0.5 px-2">
          {SIDEBAR.map((s) => {
            const locked = isSidebarStepLocked(s.id);
            const active = !locked && s.id === currentStep;
            const done   = !locked && s.id < currentStep;
            const tip    = lockTitle(s.id, gateEntered, mockLoggedIn, licenseStepDone, hasPaid);

            const rowContent = (
              <>
                <span
                  className="flex shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-all duration-200"
                  style={{
                    width:      28,
                    height:     28,
                    background: done ? "linear-gradient(135deg, #7C3AED, #5B21B6)" : active ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
                    border:     done ? "none" : active ? "2px solid #7C3AED" : "1px solid rgba(255,255,255,0.08)",
                    color:      done ? "#FFFFFF" : active ? "#C4B5FD" : "rgba(255,255,255,0.20)",
                    boxShadow:  done ? "0 4px 12px rgba(124,58,237,0.35)" : "none",
                  }}
                >
                  {done ? "✓" : s.id}
                </span>
                <span
                  className="min-w-0 flex-1 truncate text-[13px]"
                  style={{
                    fontWeight: active ? 600 : 400,
                    color: locked ? "rgba(255,255,255,0.18)" : active ? "rgba(255,255,255,0.90)" : done ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.30)",
                  }}
                >
                  {s.label}
                </span>
                {locked && (
                  <span className="shrink-0 text-[10px]" style={{ color: "rgba(255,255,255,0.15)" }} aria-hidden>🔒</span>
                )}
              </>
            );

            return (
              <li key={s.id}>
                {s.afterDivider && (
                  <div className="my-2 px-3 text-[10px] font-bold uppercase" style={{ color: "rgba(255,255,255,0.15)", letterSpacing: "0.14em" }}>
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
                      background: active ? "linear-gradient(135deg, rgba(124,58,237,0.20) 0%, rgba(139,92,246,0.08) 100%)" : "transparent",
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col" style={{ background: "#0A0812" }}>
        {/* Mobile step indicator */}
        <div
          className="md:hidden shrink-0 px-4 pb-2.5 pt-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[13px] font-medium text-white">
              Step {currentStep} of {SIDEBAR.length}
            </span>
            <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              {SIDEBAR.find((s) => s.id === currentStep)?.label ?? ""}
            </span>
          </div>
          <div
            className="h-[2px] overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.round((currentStep / SIDEBAR.length) * 100)}%`,
                background: "#7C3AED",
              }}
            />
          </div>
        </div>

            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
          <div key={currentStep} className="funnel-step-animate">
            {currentStep === 1 ? <SelectCampaignType selected={campaignTypeId} onSelect={setCampaignTypeId} /> : null}
            {currentStep === 2 ? <SelectCampaignTemplate selectedId={templateId} onSelect={setTemplateId} /> : null}
            {currentStep === 3 ? <SelectCampaignCelebrity selectedId={celebrityId} onSelect={setCelebrityId} /> : null}
            {currentStep === 4 ? (
              <PreviewCampaign
                campaignTypeId={campaignTypeId}
                templateId={templateId}
                celebrityId={celebrityId}
                onStartCampaign={openGate}
              />
            ) : null}
            {currentStep === 5 ? <LoginCompany onMockLogin={() => setMockLoggedIn(true)} /> : null}
            {currentStep === 6 ? (
              <LicenseScope campaignTypeId={campaignTypeId} celebrityId={celebrityId} scope={scope} onScopeChange={setScope} />
            ) : null}
            {currentStep === 7 ? (
              <PayAndConfirm
                campaignTypeId={campaignTypeId}
                templateId={templateId}
                celebrityId={celebrityId}
                scope={scope}
                onAuthorize={handleAuthorize}
              />
            ) : null}
            {currentStep === 8 ? (
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
            ) : null}
            {currentStep === 9 ? <ValidationStatus /> : null}
            {currentStep === 10 ? (
              <CampaignApprovalStatus campaignTypeId={campaignTypeId} templateId={templateId} celebrityId={celebrityId} scope={scope} />
            ) : null}
            {currentStep === 11 ? (
              <DeliveryLicense campaignTypeId={campaignTypeId} templateId={templateId} celebrityId={celebrityId} scope={scope} />
            ) : null}
          </div>
        </div>

        <div
          className="flex shrink-0 items-center gap-3 px-4 py-3 md:h-16 md:justify-between md:py-0 md:px-6"
          style={{ background: "rgba(10,8,18,0.90)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Summary — desktop only */}
          <p
            className="hidden md:block min-w-0 flex-1 truncate text-sm text-[var(--color-text-secondary)]"
            title={`${ct?.title ?? "…"} · ${tpl?.name ?? "…"} · ${cel?.name ?? "…"} · SAR ${subtotal.toLocaleString("en-SA")}`}
          >
            <span className={campaignTypeId ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>📢 {ct?.title ?? "Campaign"}</span>
            <span className="text-[var(--color-text-muted)]"> · </span>
            <span className={templateId ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>🎬 {tpl?.name ?? "Template"}</span>
            <span className="text-[var(--color-text-muted)]"> · </span>
            <span className={celebrityId ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>⭐ {cel?.name ?? "Celebrity"}</span>
            <span className="text-[var(--color-text-muted)]"> · </span>
            <span className="text-[var(--color-text)]">SAR {subtotal.toLocaleString("en-SA")}+</span>
          </p>
          {/* Buttons — full-width on mobile */}
          <div className="flex w-full items-center gap-2 md:w-auto md:shrink-0">
            {currentStep === 11 ? (
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
                {currentStep === 4  && <button type="button" onClick={openGate} disabled={!selectionsComplete} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40" style={hPrimaryStyle}>Start Campaign</button>}
                {currentStep === 5  && <button type="button" onClick={() => mockLoggedIn && setCurrentStep(6)} disabled={!mockLoggedIn} title={!mockLoggedIn ? "Sign in first" : undefined} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40" style={hPrimaryStyle}>Continue →</button>}
                {currentStep === 6  && <button type="button" onClick={() => { setLicenseStepDone(true); setCurrentStep(7); }} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px" style={hPrimaryStyle}>Continue to Payment →</button>}
                {currentStep === 7  && <button type="button" onClick={handleAuthorize} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px" style={hPrimaryStyle}>Pay — SAR {priced.total.toLocaleString("en-SA", { minimumFractionDigits: 2 })}</button>}
                {currentStep === 8  && <button type="button" onClick={() => briefOk && setCurrentStep(9)} disabled={!briefOk} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40" style={hPrimaryStyle}>Submit Brief →</button>}
                {currentStep === 9  && <button type="button" onClick={() => setCurrentStep(10)} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px" style={hPrimaryStyle}>Continue to Approval →</button>}
                {currentStep === 10 && <button type="button" onClick={() => setCurrentStep(11)} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px" style={hPrimaryStyle}>Continue to Delivery →</button>}
                {currentStep <= 3   && <button type="button" onClick={handleNext} disabled={!canNextEarly} className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40" style={hPrimaryStyle}>Next →</button>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export type CampaignFunnelProps = {
  open: boolean;
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
        style={{ background: "#0A0812", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.70)" }}
      >
        <header
          className="flex h-14 shrink-0 items-center justify-between px-4 md:px-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,8,18,0.80)" }}
        >
          <h2 id="campaign-funnel-title" className="font-display text-[15px] font-bold text-white">
            Advertisement Campaign
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl text-xl transition-all duration-150 hover:bg-white/[0.06]"
            style={{ color: "rgba(255,255,255,0.50)" }}
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
