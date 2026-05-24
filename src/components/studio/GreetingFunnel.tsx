"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, Lock } from "lucide-react";

import { ApprovalStatus } from "@/components/studio/steps/greeting/ApprovalStatus";
import { ChooseOccasion } from "@/components/studio/steps/greeting/ChooseOccasion";
import { GreetingDelivery } from "@/components/studio/steps/greeting/GreetingDelivery";
import { LoginAndPay } from "@/components/studio/steps/greeting/LoginAndPay";
import { PersonalizeMessage } from "@/components/studio/steps/greeting/PersonalizeMessage";
import { PreviewGreetingSample } from "@/components/studio/steps/greeting/PreviewGreetingSample";
import { SelectGreetingCelebrity } from "@/components/studio/steps/greeting/SelectGreetingCelebrity";
import { SelectGreetingTemplate } from "@/components/studio/steps/greeting/SelectGreetingTemplate";

import {
  type ApiCelebrity,
  type ApiTemplate,
  celebrityApi,
  jobApi,
  templateApi,
} from "@/lib/api";
import { useUser } from "@/contexts/UserContext";

const horizonPrimaryBtn =
  "inline-flex h-[44px] items-center justify-center gap-2 rounded-xl px-5 text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-px";
const horizonPrimaryStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
  boxShadow:  "0 8px 24px rgba(124,58,237,0.30)",
  border:     "none",
};

const horizonSecondaryStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.04)",
  border:     "1px solid rgba(0,0,0,0.10)",
  color:      "rgba(15,10,30,0.60)",
};

const ALL_STEPS: { id: number; label: string }[] = [
  { id: 1, label: "Choose Occasion" },
  { id: 2, label: "Select Template" },
  { id: 3, label: "Select Celebrity" },
  { id: 4, label: "Preview Sample" },
  { id: 5, label: "Login" },
  { id: 6, label: "Personalize" },
  { id: 7, label: "Approval" },
  { id: 8, label: "Delivery" },
];

export type GreetingFunnelWorkspaceProps = {
  onClose: () => void;
  sessionId: number;
};

export function GreetingFunnelWorkspace({ onClose, sessionId }: GreetingFunnelWorkspaceProps) {
  const { user, login } = useUser();

  const [currentStep, setCurrentStep]     = useState(1);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [templateId, setTemplateId]       = useState<string | null>(null);
  const [celebrityId, setCelebrityId]     = useState<string | null>(null);

  const [recipientName, setRecipientName] = useState("");
  const [messageBody, setMessageBody]     = useState("");
  const [fromName, setFromName]           = useState("");
  const [language, setLanguage]           = useState<"ar" | "en" | "both">("en");
  const [special, setSpecial]             = useState("");

  const [allTemplates, setAllTemplates]   = useState<ApiTemplate[]>([]);
  const [celebrities, setCelebrities]     = useState<ApiCelebrity[]>([]);
  const [loadingInit, setLoadingInit]     = useState(true);

  const [referenceId, setReferenceId]         = useState<string | null>(null);
  const [submitting, setSubmitting]           = useState(false);
  const [submitError, setSubmitError]         = useState("");
  const [showSubmitToast, setShowSubmitToast] = useState(false);

  useEffect(() => {
    setCurrentStep(1);
    setSelectedPurpose(null);
    setTemplateId(null);
    setCelebrityId(null);
    setRecipientName("");
    setMessageBody("");
    setFromName("");
    setLanguage("en");
    setSpecial("");
    setReferenceId(null);
    setSubmitError("");
    setShowSubmitToast(false);
    setAllTemplates([]);
    setLoadingInit(true);

    Promise.all([templateApi.list("greeting"), celebrityApi.list()])
      .then(([tplRes, celebsRes]) => {
        setAllTemplates(tplRes.data);
        setCelebrities(celebsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoadingInit(false));
  }, [sessionId]);

  // Unique ordered purposes from all greeting templates
  const occasions = useMemo(
    () => [...new Set(allTemplates.map((t) => t.purpose))],
    [allTemplates],
  );

  // Templates filtered by the selected purpose
  const templates = useMemo(
    () => (selectedPurpose ? allTemplates.filter((t) => t.purpose === selectedPurpose) : []),
    [allTemplates, selectedPurpose],
  );

  const selectedCelebrity = useMemo(
    () => celebrities.find((c) => c.id === celebrityId) ?? null,
    [celebrities, celebrityId],
  );
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templates, templateId],
  );

  const selectionsComplete = Boolean(selectedPurpose && templateId && celebrityId);

  const SIDEBAR = useMemo(
    () => ALL_STEPS.filter((s) => s.id !== 5 || !user),
    [user],
  );
  const SIDEBAR_IDS = SIDEBAR.map((s) => s.id);

  const isSidebarStepLocked = (stepId: number) => stepId > currentStep;

  const handleSidebarStep = (stepId: number) => {
    if (isSidebarStepLocked(stepId) || stepId === currentStep) return;
    setCurrentStep(stepId);
  };

  const canNextEarly = useMemo(() => {
    if (currentStep === 1) return selectedPurpose !== null;
    if (currentStep === 2) return templateId !== null;
    if (currentStep === 3) return celebrityId !== null;
    return true;
  }, [currentStep, selectedPurpose, templateId, celebrityId]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [currentStep]);

  const openGateToPersonalize = () => setCurrentStep(user ? 6 : 5);

  const handleFinalSubmit = async () => {
    if (!selectedCelebrity || !messageBody.trim()) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      let voiceAudioUrl: string | undefined;
      try {
        const voiceRes = await jobApi.previewVoice({
          celebrityId: selectedCelebrity.id,
          script:      messageBody,
        });
        voiceAudioUrl = voiceRes.audioUrl;
      } catch {
        // Proceed without audio (stub mode or no ElevenLabs key)
      }

      const res = await jobApi.create({
        celebrityId:  selectedCelebrity.id,
        productType:  "greeting",
        purpose:      selectedPurpose ?? "Custom",
        script:       messageBody,
        templateId:   selectedTemplate?.id,
        duration:     selectedTemplate?.duration,
        sceneNotes:   [
          recipientName ? `Recipient: ${recipientName}` : "",
          fromName      ? `From: ${fromName}` : "",
          special       ? `Notes: ${special}` : "",
        ].filter(Boolean).join(" | ") || undefined,
        voiceAudioUrl,
      });

      setReferenceId(res.data.reference_id);
      setShowSubmitToast(true);
      setCurrentStep(7);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    const idx = SIDEBAR_IDS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(SIDEBAR_IDS[idx - 1]);
  };
  const handleNext = () => {
    if (!canNextEarly) return;
    const idx = SIDEBAR_IDS.indexOf(currentStep);
    if (idx < SIDEBAR_IDS.length - 1) setCurrentStep(SIDEBAR_IDS[idx + 1]);
  };

  const greetingPriceMin = selectedCelebrity?.price_range?.greeting?.min;
  const priceLabel = greetingPriceMin
    ? `From SAR ${greetingPriceMin.toLocaleString("en-SA")}`
    : "Contact for pricing";

  const summaryParts = {
    o: selectedPurpose ?? null,
    t: selectedTemplate?.name ?? null,
    c: selectedCelebrity?.name ?? null,
    p: priceLabel,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {showSubmitToast && (
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
              {referenceId ? `Order ${referenceId}` : "Tracking your request…"}
            </p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <nav
        className="hidden md:flex w-[220px] shrink-0 flex-col py-4"
        aria-label="Greeting funnel steps"
        style={{ background: "#F8F7FF", borderRight: "1px solid rgba(0,0,0,0.08)" }}
      >
        <ul className="flex flex-col gap-0.5 px-2">
          {SIDEBAR.map((s) => {
            const locked = isSidebarStepLocked(s.id);
            const active = !locked && s.id === currentStep;
            const done   = !locked && s.id < currentStep;

            const rowContent = (
              <>
                <span
                  className="flex shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-all duration-200"
                  style={{
                    width:      28, height: 28,
                    background: done   ? "linear-gradient(135deg, #7C3AED, #5B21B6)"
                              : active ? "rgba(124,58,237,0.10)"
                              :          "rgba(0,0,0,0.05)",
                    border: done   ? "none"
                          : active ? "2px solid #7C3AED"
                          :          "1px solid rgba(0,0,0,0.10)",
                    color: done   ? "#FFFFFF"
                         : active ? "#7C3AED"
                         :          "rgba(15,10,30,0.25)",
                    boxShadow: done ? "0 4px 12px rgba(124,58,237,0.25)" : "none",
                  }}
                >
                  {done ? "✓" : s.id}
                </span>
                <span
                  className="min-w-0 flex-1 truncate text-[13px]"
                  style={{
                    fontWeight: active ? 600 : 400,
                    color: locked ? "rgba(15,10,30,0.20)"
                         : active ? "#0F0A1E"
                         : done   ? "rgba(15,10,30,0.45)"
                         :          "rgba(15,10,30,0.35)",
                  }}
                >
                  {s.label}
                </span>
              </>
            );

            return (
              <li key={s.id}>
                {locked ? (
                  <div className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2">{rowContent}</div>
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
            <span className="text-[13px] font-medium" style={{ color: "#0F0A1E" }}>Step {currentStep} of {SIDEBAR.length}</span>
            <span className="text-[12px]" style={{ color: "rgba(15,10,30,0.40)" }}>
              {SIDEBAR.find((s) => s.id === currentStep)?.label ?? ""}
            </span>
          </div>
          <div className="h-[2px] overflow-hidden rounded-full" style={{ background: "rgba(0,0,0,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.round((currentStep / SIDEBAR.length) * 100)}%`, background: "#7C3AED" }} />
          </div>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
          <div key={currentStep} className="funnel-step-animate">
            {currentStep === 1 && (
              <ChooseOccasion
                occasions={occasions}
                loading={loadingInit}
                selectedPurpose={selectedPurpose}
                onSelect={(p) => { setSelectedPurpose(p); setTemplateId(null); }}
              />
            )}
            {currentStep === 2 && (
              <SelectGreetingTemplate
                templates={templates}
                loading={loadingInit}
                selectedId={templateId}
                onSelect={setTemplateId}
              />
            )}
            {currentStep === 3 && (
              <SelectGreetingCelebrity
                celebrities={celebrities}
                loading={loadingInit}
                selectedId={celebrityId}
                onSelect={setCelebrityId}
              />
            )}
            {currentStep === 4 && (
              <PreviewGreetingSample
                occasion={selectedPurpose}
                celebrity={selectedCelebrity}
                template={selectedTemplate}
              />
            )}
            {currentStep === 5 && (
              <LoginAndPay
                isLoggedIn={!!user}
                user={user}
                occasion={selectedPurpose}
                celebrity={selectedCelebrity}
                template={selectedTemplate}
                onLoginSuccess={(token, u) => { login(token, u); setCurrentStep(6); }}
              />
            )}
            {currentStep === 6 && (
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
            )}
            {currentStep === 7 && (
              <ApprovalStatus
                referenceId={referenceId}
                occasion={selectedPurpose}
                celebrity={selectedCelebrity}
                template={selectedTemplate}
                onDelivered={() => setCurrentStep(8)}
              />
            )}
            {currentStep === 8 && (
              <GreetingDelivery
                referenceId={referenceId}
                occasion={selectedPurpose}
                celebrity={selectedCelebrity}
                template={selectedTemplate}
                recipientName={recipientName}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex shrink-0 flex-col gap-2 px-4 py-3 md:h-auto md:flex-row md:items-center md:justify-between md:px-6 md:py-3"
          style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(0,0,0,0.08)" }}
        >
          {submitError && (
            <p className="text-xs md:flex-1" style={{ color: "#DC2626" }}>{submitError}</p>
          )}
          {!submitError && (
            <p className="hidden md:block min-w-0 flex-1 truncate text-sm" style={{ color: "rgba(15,10,30,0.38)" }}>
              <span style={{ color: selectedPurpose ? "#0F0A1E" : undefined }}>🎂 {summaryParts.o ?? "Occasion"}</span>
              {" · "}
              <span style={{ color: templateId     ? "#0F0A1E" : undefined }}>🎬 {summaryParts.t ?? "Template"}</span>
              {" · "}
              <span style={{ color: celebrityId    ? "#0F0A1E" : undefined }}>⭐ {summaryParts.c ?? "Celebrity"}</span>
              {" · "}
              <span style={{ color: "#0F0A1E" }}>{summaryParts.p}</span>
            </p>
          )}

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

                {currentStep === 4 && (
                  <button
                    type="button"
                    onClick={openGateToPersonalize}
                    disabled={!selectionsComplete}
                    className={`${horizonPrimaryBtn} flex h-12 flex-1 md:h-[44px] md:flex-none disabled:pointer-events-none disabled:opacity-40`}
                    style={horizonPrimaryStyle}
                  >
                    {user ? (
                      "Personalize Greeting →"
                    ) : (
                      <><Lock size={14} aria-hidden />Login to Personalize</>
                    )}
                  </button>
                )}

                {currentStep === 5 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(6)}
                    disabled={!user}
                    className={`${horizonPrimaryBtn} flex h-12 flex-1 md:h-[44px] md:flex-none disabled:pointer-events-none disabled:opacity-40`}
                    style={horizonPrimaryStyle}
                  >
                    Continue to Personalize →
                  </button>
                )}

                {currentStep === 6 && (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={submitting || !recipientName.trim() || !messageBody.trim()}
                    className={`${horizonPrimaryBtn} flex h-12 flex-1 md:h-[44px] md:flex-none disabled:pointer-events-none disabled:opacity-40`}
                    style={horizonPrimaryStyle}
                  >
                    {submitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                    ) : (
                      "Submit Request →"
                    )}
                  </button>
                )}

                {currentStep <= 3 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canNextEarly}
                    className={`${horizonPrimaryBtn} flex h-12 flex-1 md:h-[44px] md:flex-none disabled:pointer-events-none disabled:opacity-40`}
                    style={horizonPrimaryStyle}
                  >
                    Next →
                  </button>
                )}
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
  useEffect(() => { if (open) setSessionId((s) => s + 1); }, [open]);
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
        style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.09)", boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}
      >
        <header
          className="flex h-14 shrink-0 items-center justify-between px-4 md:px-5"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.97)" }}
        >
          <h2 id="greeting-funnel-title" className="font-display text-[15px] font-bold" style={{ color: "#0F0A1E" }}>
            Twinity Studio — Personal Greeting
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
        <GreetingFunnelWorkspace key={sessionId} sessionId={sessionId} onClose={onClose} />
      </div>
    </div>
  );
}
