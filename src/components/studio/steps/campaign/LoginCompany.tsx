"use client";

import { useState } from "react";
import type { ApiUser } from "@/lib/api";
import { authApi, setToken } from "@/lib/api";

export type LoginCompanyProps = {
  currentUser: ApiUser | null;
  onLogin:     () => void;
};

export function LoginCompany({ currentUser, onLogin }: LoginCompanyProps) {
  const [tab,        setTab]        = useState<"login" | "register">("login");
  const [busy,       setBusy]       = useState(false);
  const [error,      setError]      = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd,   setLoginPwd]   = useState("");

  // Register form state
  const [regName,    setRegName]    = useState("");
  const [regEmail,   setRegEmail]   = useState("");
  const [regPhone,   setRegPhone]   = useState("");
  const [regPwd,     setRegPwd]     = useState("");

  if (currentUser) {
    return (
      <div className="mx-auto max-w-xl">
        <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Login / Company</h2>
        <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Register your organization to create a governed campaign request.</p>
        <div className="mt-6 rounded-xl border border-[#7C3AED]/20 bg-[rgba(124,58,237,0.05)] p-6 flex flex-col gap-4">
          <p className="text-sm font-semibold" style={{ color: "#0F0A1E" }}>
            Signed in as <span style={{ color: "#7C3AED" }}>{currentUser.name}</span>
          </p>
          <p className="text-xs" style={{ color: "rgba(15,10,30,0.50)" }}>{currentUser.email}</p>
          <button
            type="button"
            onClick={onLogin}
            className="w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]"
          >
            Continue with this account →
          </button>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await authApi.login({ email: loginEmail, password: loginPwd });
      setToken(res.token);
      localStorage.setItem("twinity_user", JSON.stringify(res.user));
      onLogin();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await authApi.register({ name: regName, email: regEmail, password: regPwd, phone: regPhone });
      setToken(res.token);
      localStorage.setItem("twinity_user", JSON.stringify(res.user));
      onLogin();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Login / Company</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Register your organization to create a governed campaign request.</p>
      <p className="mt-4 rounded-lg border border-black/[0.08] bg-white px-4 py-3 text-xs" style={{ color: "rgba(15,10,30,0.50)" }}>
        Business verification may be required before campaign approval.
      </p>

      <div className="mt-6 inline-flex rounded-lg bg-white p-1 ring-1 ring-black/[0.08]">
        {(["login", "register"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setError(""); }}
            className={[
              "rounded-md px-4 py-2 text-sm font-semibold transition-[background-color,color] duration-[180ms]",
              tab === t ? "bg-[#7C3AED] text-white" : "hover:text-[rgba(15,10,30,0.75)]",
            ].join(" ")}
            style={tab !== t ? { color: "rgba(15,10,30,0.50)" } : undefined}
          >
            {t === "login" ? "Login" : "Register company"}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 ring-1 ring-red-500/20">{error}</p>
      )}

      {tab === "login" ? (
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <label className="block">
            <span className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.55)" }}>Business email</span>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
              placeholder="brand@company.sa"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.55)" }}>Password</span>
            <input
              type="password"
              required
              value={loginPwd}
              onChange={(e) => setLoginPwd(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-60 disabled:pointer-events-none"
          >
            {busy ? "Signing in…" : "Sign in & continue"}
          </button>
        </form>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          {[
            { label: "Company / Full name",  value: regName,  setter: setRegName,  type: "text",     ph: "Twinity Demo LLC"  },
            { label: "Business email",        value: regEmail, setter: setRegEmail, type: "email",    ph: "brand@company.sa"  },
            { label: "Phone",                 value: regPhone, setter: setRegPhone, type: "tel",      ph: "+966 5X XXX XXXX"  },
            { label: "Password",              value: regPwd,   setter: setRegPwd,   type: "password", ph: ""                  },
          ].map(({ label, value, setter, type, ph }) => (
            <label key={label} className="block">
              <span className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.55)" }}>{label}</span>
              <input
                type={type}
                required={label !== "Phone"}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={ph}
                className="mt-1.5 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-60 disabled:pointer-events-none"
          >
            {busy ? "Creating account…" : "Create company account"}
          </button>
        </form>
      )}
    </div>
  );
}
