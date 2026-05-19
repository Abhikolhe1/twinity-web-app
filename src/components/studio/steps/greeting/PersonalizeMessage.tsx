"use client";

import { useState } from "react";

export type PersonalizeMessageProps = {
  recipientName: string;
  message: string;
  fromName: string;
  language: "ar" | "en" | "both";
  special: string;
  onRecipientNameChange: (v: string) => void;
  onMessageChange: (v: string) => void;
  onFromNameChange: (v: string) => void;
  onLanguageChange: (v: "ar" | "en" | "both") => void;
  onSpecialChange: (v: string) => void;
  onSubmit: () => void;
};

const MAX_MSG = 300;

export function PersonalizeMessage({
  recipientName,
  message,
  fromName,
  language,
  special,
  onRecipientNameChange,
  onMessageChange,
  onFromNameChange,
  onLanguageChange,
  onSpecialChange,
  onSubmit,
}: PersonalizeMessageProps) {
  const canSubmit = recipientName.trim().length > 0 && message.trim().length > 0;

  return (
    <div className="mx-auto max-w-[560px]">
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Personalize Your Greeting</h2>
      <p className="mt-2 text-sm text-white/50">Tell us what you&apos;d like the celebrity to say</p>
      <form
        className="mt-8 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit();
        }}
      >
        <label className="block">
          <span className="text-sm font-medium text-white/80">Recipient&apos;s Name *</span>
          <input
            value={recipientName}
            onChange={(e) => onRecipientNameChange(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/[0.1] bg-[#1F1F1F] px-3 py-2.5 text-sm text-white outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
            placeholder="e.g. Ahmed, Sarah"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-white/80">Your Message / Key Points *</span>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value.slice(0, MAX_MSG))}
            rows={4}
            className="mt-2 w-full resize-none rounded-lg border border-white/[0.1] bg-[#1F1F1F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
            placeholder="What should the celebrity say? Key wishes, inside jokes, special moments to mention..."
            required
          />
          <p className="mt-1 text-end text-xs text-white/35">
            {message.length} / {MAX_MSG}
          </p>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-white/80">From (optional)</span>
          <input
            value={fromName}
            onChange={(e) => onFromNameChange(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/[0.1] bg-[#1F1F1F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
            placeholder="Who is this greeting from?"
          />
        </label>
        <div>
          <span className="text-sm font-medium text-white/80">Language</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                { id: "ar" as const, label: "العربية" },
                { id: "en" as const, label: "English" },
                { id: "both" as const, label: "Both" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onLanguageChange(opt.id)}
                className={[
                  "rounded-lg border px-4 py-2 text-sm font-semibold transition-[border-color,background-color] duration-[180ms]",
                  language === opt.id
                    ? "border-[#7C3AED] bg-[rgba(124,58,237,0.15)] text-white"
                    : "border-white/[0.1] bg-[#1F1F1F] text-white/55 hover:border-white/[0.16]",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-white/80">Special Instructions (optional)</span>
          <textarea
            value={special}
            onChange={(e) => onSpecialChange(e.target.value)}
            rows={2}
            className="mt-2 w-full resize-none rounded-lg border border-white/[0.1] bg-[#1F1F1F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
            placeholder="Any celebrity restrictions, style preferences, or additional context"
          />
        </label>
        <div>
          <span className="text-sm font-medium text-white/80">Reference File (optional)</span>
          <div className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.12] bg-[#141414] px-4 py-10 text-center transition-colors duration-[180ms] hover:border-amber-500/30">
            <span className="text-2xl" aria-hidden>
              ⬆
            </span>
            <p className="mt-2 text-sm text-white/60">Upload a photo, voice note, or reference (Max 20MB)</p>
            <p className="mt-1 text-xs text-white/35">Accepted: JPG, PNG, MP3, MP4</p>
          </div>
        </div>
        <div className="h-px bg-white/[0.08]" />
        <p className="flex gap-2 text-xs text-white/40">
          <span aria-hidden>⚠️</span>
          <span>
            Your message will be reviewed against our content policy and celebrity restrictions before generation begins.
          </span>
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white transition-opacity duration-[180ms] hover:bg-[#6D28D9] disabled:pointer-events-none disabled:opacity-40"
        >
          Submit & Confirm Request →
        </button>
      </form>
    </div>
  );
}
