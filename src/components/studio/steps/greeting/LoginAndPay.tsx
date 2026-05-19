"use client";

import { useState } from "react";

import type { GreetingOccasionId } from "@/lib/studio/greeting-funnel-data";
import { GREETING_BASE_SAR, GREETING_TOTAL_SAR } from "@/lib/studio/greeting-funnel-data";

import { GreetingOrderSummaryCard } from "./PreviewGreetingSample";

type PayMethod = "visa" | "apple" | "mada";

export type LoginAndPayProps = {
  occasionId: GreetingOccasionId | null;
  templateId: string | null;
  celebrityId: string | null;
  mockLoggedIn: boolean;
  onMockLogin: () => void;
  onPay: () => void;
};

export function LoginAndPay({ occasionId, templateId, celebrityId, mockLoggedIn, onMockLogin, onPay }: LoginAndPayProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [payMethod, setPayMethod] = useState<PayMethod>("visa");

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Login or Register to Continue</h2>
      <p className="mt-2 text-sm text-white/50">Secure payment required before generation</p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 lg:max-w-xl">
          {mockLoggedIn ? (
            <div className="rounded-xl border border-white/[0.08] bg-[#1F1F1F] p-6">
              <p className="text-sm text-white/50">Signed in</p>
              <p className="mt-1 font-medium text-white">studio@twinity.sa</p>
              <p className="mt-4 text-xs text-white/40">Mock session — you skipped the login form.</p>
            </div>
          ) : (
            <>
              <div className="inline-flex rounded-lg bg-[#111] p-1 ring-1 ring-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className={[
                    "rounded-md px-4 py-2 text-sm font-semibold transition-[background-color,color] duration-[180ms]",
                    tab === "login" ? "bg-[#7C3AED] text-white" : "text-white/50 hover:text-white/80",
                  ].join(" ")}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className={[
                    "rounded-md px-4 py-2 text-sm font-semibold transition-[background-color,color] duration-[180ms]",
                    tab === "register" ? "bg-[#7C3AED] text-white" : "text-white/50 hover:text-white/80",
                  ].join(" ")}
                >
                  Register
                </button>
              </div>
              {tab === "login" ? (
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    onMockLogin();
                  }}
                >
                  <label className="block">
                    <span className="text-xs font-medium text-white/50">Email or Phone</span>
                    <input
                      className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-[#141414] px-3 py-2.5 text-sm text-white outline-none ring-[#7C3AED]/0 transition-[border-color,box-shadow] duration-[180ms] focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-white/50">Password</span>
                    <input
                      type="password"
                      className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-[#141414] px-3 py-2.5 text-sm text-white outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
                      placeholder="••••••••"
                    />
                  </label>
                  <button type="button" className="text-xs text-[#C4B5FD] hover:underline">
                    Forgot password?
                  </button>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]"
                  >
                    Login
                  </button>
                  <p className="pt-2 text-center text-xs text-white/40">or continue with</p>
                  <div className="flex flex-wrap gap-2">
                    {["Google", "Apple", "📱 Phone OTP"].map((x) => (
                      <button
                        key={x}
                        type="button"
                        className="flex-1 rounded-lg border border-white/[0.1] bg-[#1F1F1F] py-2.5 text-xs font-semibold text-white/80 hover:border-white/[0.18]"
                      >
                        {x}
                      </button>
                    ))}
                  </div>
                </form>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                  {["Full Name", "Email", "Phone (Saudi +966)", "Password"].map((label) => (
                    <label key={label} className="block">
                      <span className="text-xs font-medium text-white/50">{label}</span>
                      <input className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-[#141414] px-3 py-2.5 text-sm text-white outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20" />
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={onMockLogin}
                    className="w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]"
                  >
                    Create Account
                  </button>
                </form>
              )}
            </>
          )}
        </div>
        <div className="w-full min-w-0 lg:max-w-md lg:flex-[0.4]">
          <GreetingOrderSummaryCard occasionId={occasionId} templateId={templateId} celebrityId={celebrityId} />
          <div className="mt-6 rounded-xl bg-[#1F1F1F] p-6 ring-1 ring-white/[0.06]">
            <p className="text-xs font-medium uppercase tracking-wide text-white/45">Payment Method</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  { id: "visa" as const, label: "💳 Visa" },
                  { id: "apple" as const, label: "🍎 Apple Pay" },
                  { id: "mada" as const, label: "🏦 Mada" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className={[
                    "flex-1 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-[border-color,background-color] duration-[180ms]",
                    payMethod === m.id
                      ? "border-[#7C3AED] bg-[rgba(124,58,237,0.12)] text-white"
                      : "border-white/[0.08] bg-[#141414] text-white/60 hover:border-white/[0.14]",
                  ].join(" ")}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!mockLoggedIn}
              onClick={onPay}
              className="mt-6 w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white transition-opacity duration-[180ms] hover:bg-[#6D28D9] disabled:pointer-events-none disabled:opacity-40"
              title={!mockLoggedIn ? "Sign in first (use Login)" : undefined}
            >
              Pay Securely – SAR {GREETING_TOTAL_SAR.toLocaleString("en-SA", { minimumFractionDigits: 2 })}
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-white/40">
              <span aria-hidden>🔒</span>
              Your payment is secure and encrypted
            </p>
            <p className="mt-4 text-center text-[10px] uppercase tracking-wider text-white/25">
              SAR {GREETING_BASE_SAR} + 15% VAT = SAR {GREETING_TOTAL_SAR.toFixed(2)}
            </p>
            <div className="mt-3 flex justify-center gap-4 text-lg opacity-50 grayscale">
              <span title="Visa">💳</span>
              <span title="Apple Pay">🍎</span>
              <span title="Mada">🏦</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
