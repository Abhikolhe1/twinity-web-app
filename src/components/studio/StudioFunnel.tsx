"use client";

import { useEffect, useState } from "react";

import { BottomBar } from "@/components/studio/BottomBar";
import { SidebarNav } from "@/components/studio/SidebarNav";
import { ConfigureCampaign } from "@/components/studio/steps/ConfigureCampaign";
import { PreviewSample } from "@/components/studio/steps/PreviewSample";
import { SelectCelebrity } from "@/components/studio/steps/SelectCelebrity";
import { SelectService } from "@/components/studio/steps/SelectService";
import { SelectTemplate } from "@/components/studio/steps/SelectTemplate";
import type { FunnelServiceId } from "@/lib/studio/studio-funnel-data";
import { getFunnelCelebrityById, getFunnelTemplateById } from "@/lib/studio/studio-funnel-data";

export type StudioFunnelProps = {
  open: boolean;
  onClose: () => void;
  /** Pre-select service when opening from a homepage card */
  initialService?: FunnelServiceId | null;
};

export function StudioFunnel({ open, onClose, initialService = null }: StudioFunnelProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [service, setService] = useState<FunnelServiceId | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [celebrityId, setCelebrityId] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [duration, setDuration] = useState("1M");
  const [territory, setTerritory] = useState("Saudi Arabia");
  const [express, setExpress] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCurrentStep(1);
    setService(initialService ?? null);
    setTemplateId(null);
    setCelebrityId(null);
    setCampaignName("");
    setPlatforms([]);
    setDuration("1M");
    setTerritory("Saudi Arabia");
    setExpress(false);
  }, [open, initialService]);

  const tpl = getFunnelTemplateById(templateId);
  const cel = getFunnelCelebrityById(celebrityId);

  const canNext =
    currentStep === 1
      ? service !== null
      : currentStep === 2
        ? templateId !== null
        : currentStep === 3
          ? celebrityId !== null
          : currentStep === 4
            ? true
            : true;

  const handleNext = () => {
    if (!canNext) return;
    if (currentStep < 5) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleStartGeneration = () => {
    onClose();
  };

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const indicativePrice = 9999 + (express ? 500 : 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-stretch justify-center p-0 sm:p-4 md:p-6" role="dialog" aria-modal="true" aria-labelledby="studio-funnel-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] transition-[var(--transition)]"
        aria-label="Close studio"
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
          <h2 id="studio-funnel-title" className="font-display text-[15px] font-bold" style={{ color: "#0F0A1E" }}>
            Twinity Studio
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl text-xl transition-all duration-150 hover:bg-black/[0.05]"
            style={{ color: "rgba(15,10,30,0.38)" }}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <SidebarNav currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
            <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
              <div key={currentStep} className="funnel-step-animate">
                {currentStep === 1 ? (
                  <SelectService selected={service} onSelect={setService} />
                ) : null}
                {currentStep === 2 ? <SelectTemplate selectedId={templateId} onSelect={setTemplateId} /> : null}
                {currentStep === 3 ? <SelectCelebrity selectedId={celebrityId} onSelect={setCelebrityId} /> : null}
                {currentStep === 4 ? (
                  <PreviewSample
                    templateName={tpl?.name ?? "—"}
                    celebrityName={cel?.name ?? "—"}
                    durationLabel={tpl?.durationLabel ?? "0:30"}
                  />
                ) : null}
                {currentStep === 5 ? (
                  <ConfigureCampaign
                    campaignName={campaignName}
                    onCampaignNameChange={setCampaignName}
                    platforms={platforms}
                    onTogglePlatform={togglePlatform}
                    duration={duration}
                    onDurationChange={setDuration}
                    territory={territory}
                    onTerritoryChange={setTerritory}
                    express={express}
                    onExpressChange={setExpress}
                    celebrityName={cel?.name ?? "—"}
                    celebrityImageUrl={cel?.imageUrl ?? ""}
                    templateName={tpl?.name ?? "—"}
                    indicativePriceSar={indicativePrice}
                  />
                ) : null}
              </div>
            </div>

            <BottomBar
              currentStep={currentStep}
              service={service}
              templateId={templateId}
              celebrityId={celebrityId}
              onBack={handleBack}
              onNext={handleNext}
              onStartGeneration={handleStartGeneration}
              canNext={canNext}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
