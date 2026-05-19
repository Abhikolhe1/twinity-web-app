"use client";

import { useState } from "react";

export type LoginCompanyProps = {
  onMockLogin: () => void;
};

export function LoginCompany({ onMockLogin }: LoginCompanyProps) {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">Login / Company</h2>
      <p className="mt-2 text-sm text-white/50">Register your organization to create a governed campaign request.</p>
      <p className="mt-4 rounded-lg border border-white/[0.08] bg-[#1F1F1F] px-4 py-3 text-xs text-white/45">
        Business verification may be required before campaign approval.
      </p>
      <div className="mt-6 inline-flex rounded-lg bg-[#111] p-1 ring-1 ring-white/[0.08]">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={[
            "rounded-md px-4 py-2 text-sm font-semibold transition-[background-color,color] duration-[180ms]",
            tab === "login" ? "bg-[#7C3AED] text-white" : "text-white/50 hover:text-white/75",
          ].join(" ")}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={[
            "rounded-md px-4 py-2 text-sm font-semibold transition-[background-color,color] duration-[180ms]",
            tab === "register" ? "bg-[#7C3AED] text-white" : "text-white/50 hover:text-white/75",
          ].join(" ")}
        >
          Register company
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
            <span className="text-xs font-medium text-white/50">Business email</span>
            <input
              className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-[#141414] px-3 py-2.5 text-sm text-white outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
              placeholder="brand@company.sa"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-white/50">Password</span>
            <input
              type="password"
              className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-[#141414] px-3 py-2.5 text-sm text-white outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
            />
          </label>
          <button type="submit" className="w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]">
            Sign in & continue
          </button>
        </form>
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onMockLogin();
          }}
        >
          {[
            ["Company name", "Twinity Demo LLC"],
            ["Business email", "brand@company.sa"],
            ["Phone", "+966 5X XXX XXXX"],
            ["Password", "••••••••"],
          ].map(([label, ph]) => (
            <label key={label} className="block">
              <span className="text-xs font-medium text-white/50">{label}</span>
              <input
                className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-[#141414] px-3 py-2.5 text-sm text-white outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
                placeholder={ph}
              />
            </label>
          ))}
          <button type="submit" className="w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]">
            Create company account
          </button>
        </form>
      )}
    </div>
  );
}
