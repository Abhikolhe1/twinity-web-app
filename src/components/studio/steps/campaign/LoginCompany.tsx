"use client";

import { useState } from "react";

export type LoginCompanyProps = {
  onMockLogin: () => void;
};

export function LoginCompany({ onMockLogin }: LoginCompanyProps) {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Login / Company</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Register your organization to create a governed campaign request.</p>
      <p className="mt-4 rounded-lg border border-black/[0.08] bg-white px-4 py-3 text-xs" style={{ color: "rgba(15,10,30,0.50)" }}>
        Business verification may be required before campaign approval.
      </p>
      <div className="mt-6 inline-flex rounded-lg bg-white p-1 ring-1 ring-black/[0.08]">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={[
            "rounded-md px-4 py-2 text-sm font-semibold transition-[background-color,color] duration-[180ms]",
            tab === "login" ? "bg-[#7C3AED] text-white" : "hover:text-[rgba(15,10,30,0.75)]",
          ].join(" ")}
          style={tab !== "login" ? { color: "rgba(15,10,30,0.50)" } : undefined}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={[
            "rounded-md px-4 py-2 text-sm font-semibold transition-[background-color,color] duration-[180ms]",
            tab === "register" ? "bg-[#7C3AED] text-white" : "hover:text-[rgba(15,10,30,0.75)]",
          ].join(" ")}
          style={tab !== "register" ? { color: "rgba(15,10,30,0.50)" } : undefined}
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
            <span className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.55)" }}>Business email</span>
            <input
              className="mt-1.5 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
              placeholder="brand@company.sa"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.55)" }}>Password</span>
            <input
              type="password"
              className="mt-1.5 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
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
              <span className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.55)" }}>{label}</span>
              <input
                className="mt-1.5 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
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
