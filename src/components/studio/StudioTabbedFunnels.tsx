"use client";

import { useEffect, useState } from "react";
import { Building2, Film, Mic } from "lucide-react";

import { CampaignFunnelWorkspace }      from "@/components/studio/CampaignFunnel";
import { CustomCampaignFunnelWorkspace } from "@/components/studio/CustomCampaignFunnel";
import { GreetingFunnelWorkspace }      from "@/components/studio/GreetingFunnel";

export type StudioFunnelTab = "greeting" | "campaign" | "custom";

export type StudioTabbedFunnelsProps = {
  open: boolean;
  onClose: () => void;
  initialTab: StudioFunnelTab;
  sessionId: number;
};

const TABS: {
  id:          StudioFunnelTab;
  label:       string;
  mobileLabel: string;
  Icon:        React.ElementType;
  badge:       string;
  desc:        string;
  isNew?:      boolean;
}[] = [
  { id: "greeting", label: "Personal Greeting", mobileLabel: "Greeting", Icon: Mic,       badge: "B2C",        desc: "Personalised video message" },
  { id: "campaign", label: "Advertisement Campaign", mobileLabel: "Ad Campaign", Icon: Film, badge: "Licensed", desc: "Celebrity commercial" },
  { id: "custom",   label: "Custom Campaign",   mobileLabel: "Custom",   Icon: Building2, badge: "Enterprise", desc: "Full-scope brief"            },
];

export function StudioTabbedFunnels({ open, onClose, initialTab, sessionId }: StudioTabbedFunnelsProps) {
  const [tab, setTab] = useState<StudioFunnelTab>(initialTab);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-stretch justify-center p-0 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-tabbed-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] transition-opacity duration-200"
        aria-label="Close studio"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex h-full w-full max-h-[100dvh] max-w-[1400px] flex-col overflow-hidden rounded-none sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl"
        style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.09)", boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}
      >
        <header
          className="flex h-14 shrink-0 items-center justify-between gap-3 px-3 md:px-5"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)" }}
        >
          {/* Studio wordmark — desktop only */}
          <div className="hidden md:flex shrink-0 items-center gap-2">
            <div
              className="flex size-6 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", boxShadow: "0 2px 8px rgba(124,58,237,0.30)" }}
              aria-hidden
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>T</span>
            </div>
            <span className="text-[13px] font-semibold" style={{ color: "rgba(15,10,30,0.35)" }}>Studio</span>
            <span className="text-[18px]" style={{ color: "rgba(15,10,30,0.12)", lineHeight: 1, marginBottom: -1 }}>|</span>
          </div>

          {/* Tab switcher */}
          <div className="flex min-w-0 flex-1 items-center">
            <span id="studio-tabbed-title" className="sr-only">Twinity Studio</span>
            <div
              className="inline-flex rounded-xl p-1"
              style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              {TABS.map(({ id, label, mobileLabel, Icon, badge, desc, isNew }) => {
                const isActive = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className="flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 transition-all duration-200 sm:px-3 md:gap-2 md:px-3.5"
                    style={{
                      background: isActive
                        ? "rgba(124,58,237,0.08)"
                        : "transparent",
                      border:     isActive ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
                      color:      isActive ? "#7C3AED" : "rgba(15,10,30,0.45)",
                      boxShadow:  "none",
                      whiteSpace: "nowrap",
                    }}
                    title={desc}
                  >
                    <Icon
                      size={12}
                      aria-hidden
                      style={{ flexShrink: 0, color: isActive ? "#7C3AED" : "currentColor", transition: "color 200ms" }}
                    />
                    {/* Mobile label */}
                    <span className="text-[11px] font-semibold sm:hidden">{mobileLabel}</span>
                    {/* Desktop label */}
                    <span className="hidden text-[12px] font-semibold sm:inline md:text-[13px]">{label}</span>
                    {/* Type badge — active only, lg+ */}
                    {isActive && (
                      <span
                        className="hidden lg:inline-flex h-[18px] items-center rounded-full px-1.5 text-[9px] font-bold"
                        style={{
                          background:    isNew ? "linear-gradient(135deg, #8B5CF6, #3D1A6E)" : "rgba(124,58,237,0.10)",
                          color:         isNew ? "#FFFFFF" : "#7C3AED",
                          letterSpacing: "0.06em",
                          border:        isNew ? "none" : "1px solid rgba(124,58,237,0.22)",
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-150 hover:bg-black/[0.05]"
            style={{ color: "rgba(15,10,30,0.38)" }}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          {tab === "greeting" ? (
            <GreetingFunnelWorkspace  key={`g-${sessionId}`}  sessionId={sessionId} onClose={onClose} />
          ) : tab === "campaign" ? (
            <CampaignFunnelWorkspace  key={`c-${sessionId}`}  sessionId={sessionId} onClose={onClose} />
          ) : (
            <CustomCampaignFunnelWorkspace key={`cc-${sessionId}`} sessionId={sessionId} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
