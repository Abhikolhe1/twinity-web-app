"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { ApprovalStatus } from "@/components/studio/steps/greeting/ApprovalStatus";
import { ChooseOccasion } from "@/components/studio/steps/greeting/ChooseOccasion";
import { GreetingDelivery } from "@/components/studio/steps/greeting/GreetingDelivery";
import { LoginAndPay } from "@/components/studio/steps/greeting/LoginAndPay";
import { PersonalizeMessage } from "@/components/studio/steps/greeting/PersonalizeMessage";
import { PreviewGreetingSample } from "@/components/studio/steps/greeting/PreviewGreetingSample";
import { SelectGreetingCelebrity } from "@/components/studio/steps/greeting/SelectGreetingCelebrity";
import { SelectGreetingTemplate } from "@/components/studio/steps/greeting/SelectGreetingTemplate";
import type { GreetingOccasionId } from "@/lib/studio/greeting-funnel-data";
import {
  GREETING_BASE_SAR,
  GREETING_TOTAL_SAR,
  getGreetingCelebrity,
  getGreetingOccasion,
  getGreetingTemplate,
} from "@/lib/studio/greeting-funnel-data";

const LOCK_TOOLTIP = "Complete payment to unlock";

/* Horizon button classes + shared styles */
const horizonPrimaryBtn =
  "inline-flex h-[44px] items-center justify-center rounded-xl px-5 text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px";
const horizonPrimaryStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
  boxShadow:  "0 8px 24px rgba(124,58,237,0.30)",
  border:     "none",
};

const horizonSecondaryBtn =
  "inline-flex h-[44px] items-center justify-center rounded-xl px-5 text-[13px] font-semibold transition-all duration-200";
const horizonSecondaryStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border:     "1px solid rgba(255,255,255,0.10)",
  color:      "rgba(255,255,255,0.65)",
};

const SIDEBAR: { id: number; label: string; emoji: string; afterDivider?: boolean }[] = [
  { id: 1, label: "Choose Occasion", emoji: "🎉" },
  { id: 2, label: "Select Template", emoji: "🎬" },
  { id: 3, label: "Select Celebrity", emoji: "⭐" },
  { id: 4, label: "Preview Sample", emoji: "👁" },
  { id: 5, label: "Login & Pay", emoji: "🔒", afterDivider: true },
  { id: 6, label: "Personalize Message", emoji: "🔒" },
  { id: 7, label: "Approval", emoji: "🔒" },
  { id: 8, label: "Delivery", emoji: "🔒" },
];

export type GreetingFunnelWorkspaceProps = {
  onClose: () => void;
  /** Increment when the studio modal opens to reset draft state */
  sessionId: number;
};

export function GreetingFunnelWorkspace({ onClose, sessionId }: GreetingFunnelWorkspaceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [occasionId, setOccasionId] = useState<GreetingOccasionId | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [celebrityId, setCelebrityId] = useState<string | null>(null);
  const [gateEntered, setGateEntered] = useState(false);
  const [mockLoggedIn, setMockLoggedIn] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  const [recipientName, setRecipientName] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [fromName, setFromName] = useState("");
  const [language, setLanguage] = useState<"ar" | "en" | "both">("en");
  const [special, setSpecial] = useState("");

  useEffect(() => {
    setCurrentStep(1);
    setOccasionId(null);
    setTemplateId(null);
    setCelebrityId(null);
    setGateEntered(false);
    setMockLoggedIn(false);
    setHasPaid(false);
    setRecipientName("");
    setMessageBody("");
    setFromName("");
    setLanguage("en");
    setSpecial("");
  }, [sessionId]);

  const selectionsComplete = Boolean(occasionId && templateId && celebrityId);

  const step5Unlocked = gateEntered || currentStep >= 5;
  const postPaymentUnlocked = hasPaid;

  const isSidebarStepLocked = (stepId: number) => {
    if (stepId <= 4) return false;
    if (stepId === 5) return !step5Unlocked;
    return !postPaymentUnlocked;
  };

  const handleSidebarStep = (stepId: number) => {
    if (isSidebarStepLocked(stepId)) return;
    setCurrentStep(stepId);
  };

  const occ = getGreetingOccasion(occasionId);
  const tpl = getGreetingTemplate(templateId);
  const cel = getGreetingCelebrity(celebrityId);

  const canNextEarly = useMemo(() => {
    if (currentStep === 1) return occasionId !== null;
    if (currentStep === 2) return templateId !== null;
    if (currentStep === 3) return celebrityId !== null;
    return true;
  }, [currentStep, occasionId, templateId, celebrityId]);

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

  const openGateToLogin = () => {
    setGateEntered(true);
    setCurrentStep(5);
  };

  const handlePay = () => {
    setHasPaid(true);
    setCurrentStep(6);
  };

  const summaryParts = useMemo(() => {
    const o = occ ? `${occ.icon} ${occ.label}` : null;
    const t = tpl?.name ?? null;
    const c = cel?.name ?? null;
    const p = `SAR ${GREETING_BASE_SAR}`;
    return { o, t, c, p };
  }, [occ, tpl, cel]);

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
            aria-label="Greeting funnel steps"
            style={{ background: "rgba(10,8,18,0.60)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
          >
            <ul className="flex flex-col gap-0.5 px-2">
              {SIDEBAR.map((s) => {
                const locked = isSidebarStepLocked(s.id);
                const active = !locked && s.id === currentStep;
                const done   = !locked && s.id < currentStep;

                const rowContent = (
                  <>
                    {/* Step number / icon box */}
                    <span
                      className="flex shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-all duration-200"
                      style={{
                        width:      28,
                        height:     28,
                        background: done
                          ? "linear-gradient(135deg, #7C3AED, #5B21B6)"
                          : active
                            ? "rgba(124,58,237,0.15)"
                            : "rgba(255,255,255,0.04)",
                        border: done
                          ? "none"
                          : active
                            ? "2px solid #7C3AED"
                            : "1px solid rgba(255,255,255,0.08)",
                        color: done
                          ? "#FFFFFF"
                          : active
                            ? "#C4B5FD"
                            : "rgba(255,255,255,0.20)",
                        boxShadow: done ? "0 4px 12px rgba(124,58,237,0.35)" : "none",
                      }}
                    >
                      {done ? "✓" : s.id}
                    </span>
                    <span
                      className="min-w-0 flex-1 truncate text-[13px]"
                      style={{
                        fontWeight: active ? 600 : 400,
                        color: locked
                          ? "rgba(255,255,255,0.18)"
                          : active
                            ? "rgba(255,255,255,0.90)"
                            : done
                              ? "rgba(255,255,255,0.50)"
                              : "rgba(255,255,255,0.30)",
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
                      <div
                        className="my-2 px-3 text-[10px] font-bold uppercase"
                        style={{ color: "rgba(255,255,255,0.15)", letterSpacing: "0.14em" }}
                      >
                        After Payment
                      </div>
                    )}
                    {locked ? (
                      <div
                        title={LOCK_TOOLTIP}
                        className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2"
                      >
                        {rowContent}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSidebarStep(s.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start transition-all duration-200"
                        style={{
                          background: active
                            ? "linear-gradient(135deg, rgba(124,58,237,0.20) 0%, rgba(139,92,246,0.08) 100%)"
                            : "transparent",
                          border: active
                            ? "1px solid rgba(124,58,237,0.18)"
                            : "1px solid transparent",
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
            {/* Mobile step indicator — hidden on md+ (sidebar takes over) */}
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
                {currentStep === 1 ? <ChooseOccasion selected={occasionId} onSelect={setOccasionId} /> : null}
                {currentStep === 2 ? (
                  <SelectGreetingTemplate occasion={occasionId} selectedId={templateId} onSelect={setTemplateId} />
                ) : null}
                {currentStep === 3 ? <SelectGreetingCelebrity selectedId={celebrityId} onSelect={setCelebrityId} /> : null}
                {currentStep === 4 ? (
                  <PreviewGreetingSample
                    occasionId={occasionId}
                    templateId={templateId}
                    celebrityId={celebrityId}
                    onGenerateClick={openGateToLogin}
                  />
                ) : null}
                {currentStep === 5 ? (
                  <LoginAndPay
                    occasionId={occasionId}
                    templateId={templateId}
                    celebrityId={celebrityId}
                    mockLoggedIn={mockLoggedIn}
                    onMockLogin={() => setMockLoggedIn(true)}
                    onPay={handlePay}
                  />
                ) : null}
                {currentStep === 6 ? (
                  <PersonalizeMessage
                    recipientName={recipientName}
                    message={messageBody}
                    fromName={fromName}
                    language={language}
                    special={special}
                    onRecipientNameChange={setRecipientName}
                    onMessageChange={setMessageBody}
                    onFromNameChange={setFromName}
                    onLanguageChange={setLanguage}
                    onSpecialChange={setSpecial}
                    onSubmit={handleFinalSubmit}
                  />
                ) : null}
                {currentStep === 7 ? (
                  <ApprovalStatus occasionId={occasionId} templateId={templateId} celebrityId={celebrityId} />
                ) : null}
                {currentStep === 8 ? (
                  <GreetingDelivery
                    occasionId={occasionId}
                    templateId={templateId}
                    celebrityId={celebrityId}
                    recipientName={recipientName}
                  />
                ) : null}
              </div>
            </div>

            <div
              className="flex shrink-0 items-center gap-3 px-4 py-3 md:h-16 md:justify-between md:py-0 md:px-6"
              style={{
                background:     "rgba(10,8,18,0.90)",
                backdropFilter: "blur(16px)",
                borderTop:      "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Summary — desktop only */}
              <p className="hidden md:block min-w-0 flex-1 truncate text-sm text-[var(--color-text-secondary)]" title={`${summaryParts.o ?? "…"} · ${summaryParts.t ?? "…"} · ${summaryParts.c ?? "…"} · ${summaryParts.p}`}>
                <span className={occasionId ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>🎂 {summaryParts.o ?? "Occasion"}</span>
                <span className="text-[var(--color-text-muted)]"> · </span>
                <span className={templateId ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>🎬 {summaryParts.t ?? "Template"}</span>
                <span className="text-[var(--color-text-muted)]"> · </span>
                <span className={celebrityId ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>⭐ {summaryParts.c ?? "Celebrity"}</span>
                <span className="text-[var(--color-text-muted)]"> · </span>
                <span className="text-[var(--color-text)]">{summaryParts.p}</span>
              </p>
              {/* Buttons — full-width on mobile, auto-width on desktop */}
              <div className="flex w-full items-center gap-2 md:w-auto md:shrink-0">
                {currentStep >= 7 ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-12 flex-1 md:h-[44px] md:flex-none md:px-5 items-center justify-center rounded-xl text-[13px] font-semibold transition-all duration-200"
                    style={horizonSecondaryStyle}
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
                      style={horizonSecondaryStyle}
                    >
                      <span className="md:hidden">←</span>
                      <span className="hidden md:inline">← Back</span>
                    </button>
                    {currentStep === 4 ? (
                      <button
                        type="button"
                        onClick={openGateToLogin}
                        disabled={!selectionsComplete}
                        className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40"
                        style={horizonPrimaryStyle}
                      >
                        Generate This Greeting 🔒
                      </button>
                    ) : null}
                    {currentStep === 5 ? (
                      <button
                        type="button"
                        onClick={handlePay}
                        disabled={!mockLoggedIn}
                        title={!mockLoggedIn ? "Sign in first" : undefined}
                        className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40"
                        style={horizonPrimaryStyle}
                      >
                        Pay – SAR {GREETING_TOTAL_SAR.toLocaleString("en-SA", { minimumFractionDigits: 2 })}
                      </button>
                    ) : null}
                    {currentStep === 6 ? (
                      <button
                        type="button"
                        onClick={() => { if (recipientName.trim() && messageBody.trim()) setCurrentStep(7); }}
                        disabled={!recipientName.trim() || !messageBody.trim()}
                        className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40"
                        style={horizonPrimaryStyle}
                      >
                        Submit Request →
                      </button>
                    ) : null}
                    {currentStep <= 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canNextEarly}
                        className="flex h-12 flex-1 md:h-[44px] md:flex-none items-center justify-center rounded-xl px-4 text-[15px] md:text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-40"
                        style={horizonPrimaryStyle}
                      >
                        Next →
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
  );
}

export type GreetingFunnelProps = {
  open: boolean;
  onClose: () => void;
};

export function GreetingFunnel({ open, onClose }: GreetingFunnelProps) {
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
      aria-labelledby="greeting-funnel-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] transition-[var(--transition)]"
        aria-label="Close greeting studio"
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
          <h2 id="greeting-funnel-title" className="font-display text-[15px] font-bold text-white">
            Twinity Studio — Greeting
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
        <GreetingFunnelWorkspace key={sessionId} sessionId={sessionId} onClose={onClose} />
      </div>
    </div>
  );
}
