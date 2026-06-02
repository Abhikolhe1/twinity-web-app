"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { ApiCelebrity, ApiTemplate, ApiUser } from "@/lib/api";
import { authApi } from "@/lib/api";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { GreetingOrderSummaryCard } from "./PreviewGreetingSample";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export type LoginAndPayProps = {
  isLoggedIn: boolean;
  user: ApiUser | null;
  occasion: string | null;
  celebrity: ApiCelebrity | null;
  template: ApiTemplate | null;
  onLoginSuccess: (token: string, user: ApiUser) => void;
};

export function LoginAndPay({
  isLoggedIn,
  user,
  occasion,
  celebrity,
  template,
  onLoginSuccess,
}: LoginAndPayProps) {
  const [tab, setTab] = useState<"login" | "register">("login");

  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError]       = useState("");
  const [loginLoading, setLoginLoading]   = useState(false);

  const [regName, setRegName]           = useState("");
  const [regEmail, setRegEmail]         = useState("");
  const [regPassword, setRegPassword]   = useState("");
  const [regError, setRegError]         = useState("");
  const [regLoading, setRegLoading]     = useState(false);

  const handleGoogleSuccess = async (accessToken: string, accountType: string) => {
    const res = await authApi.googleAuth(accessToken, accountType);
    onLoginSuccess(res.token, res.user);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await authApi.login({ email: loginEmail, password: loginPassword });
      onLoginSuccess(res.token, res.user);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegLoading(true);
    try {
      const res = await authApi.register({ name: regName, email: regEmail, password: regPassword });
      onLoginSuccess(res.token, res.user);
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>
        {isLoggedIn ? "You're Signed In" : "Sign In to Continue"}
      </h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>
        {isLoggedIn
          ? "Click Continue in the footer to personalize your greeting"
          : "Create an account or log in to place your order"}
      </p>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 lg:max-w-xl">
          {isLoggedIn ? (
            <div className="rounded-xl border border-black/[0.08] bg-white p-6">
              <p className="text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>Signed in as</p>
              <p className="mt-1 font-semibold" style={{ color: "#0F0A1E" }}>{user?.name}</p>
              <p className="text-sm" style={{ color: "rgba(15,10,30,0.60)" }}>{user?.email}</p>
            </div>
          ) : (
            <>
              <div className="inline-flex rounded-lg bg-black/[0.04] p-1 ring-1 ring-black/[0.08]">
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className={[
                    "rounded-md px-4 py-2 text-sm font-semibold transition-[background-color,color] duration-[180ms]",
                    tab === "login" ? "bg-[#7C3AED] text-white" : "hover:text-black/80",
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
                    tab === "register" ? "bg-[#7C3AED] text-white" : "hover:text-black/80",
                  ].join(" ")}
                  style={tab !== "register" ? { color: "rgba(15,10,30,0.50)" } : undefined}
                >
                  Register
                </button>
              </div>

              {tab === "login" ? (
                <div className="mt-6 space-y-4">
                  <form className="space-y-4" onSubmit={handleLogin}>
                    {loginError && (
                      <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 ring-1 ring-red-500/20">
                        {loginError}
                      </p>
                    )}
                    <label className="block">
                      <span className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.50)" }}>Email</span>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-black/[0.1] bg-white px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
                        style={{ color: "#0F0A1E" }}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.50)" }}>Password</span>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-black/[0.1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
                        style={{ color: "#0F0A1E" }}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9] disabled:pointer-events-none disabled:opacity-60"
                    >
                      {loginLoading && <Loader2 size={16} className="animate-spin" />}
                      Login
                    </button>
                  </form>

                  {googleClientId && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1" style={{ background: "rgba(0,0,0,0.06)" }} />
                        <span className="text-[12px]" style={{ color: "rgba(15,10,30,0.35)" }}>or</span>
                        <div className="h-px flex-1" style={{ background: "rgba(0,0,0,0.06)" }} />
                      </div>
                      <GoogleSignInButton onSuccess={handleGoogleSuccess} />
                    </>
                  )}
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <form className="space-y-4" onSubmit={handleRegister}>
                    {regError && (
                      <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 ring-1 ring-red-500/20">
                        {regError}
                      </p>
                    )}
                    <label className="block">
                      <span className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.50)" }}>Full Name</span>
                      <input
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-black/[0.1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
                        style={{ color: "#0F0A1E" }}
                        placeholder="Ahmed Al-Rashid"
                        autoComplete="name"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.50)" }}>Email</span>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-black/[0.1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
                        style={{ color: "#0F0A1E" }}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium" style={{ color: "rgba(15,10,30,0.50)" }}>Password</span>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-black/[0.1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20"
                        style={{ color: "#0F0A1E" }}
                        placeholder="Choose a strong password"
                        autoComplete="new-password"
                        required
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9] disabled:pointer-events-none disabled:opacity-60"
                    >
                      {regLoading && <Loader2 size={16} className="animate-spin" />}
                      Create Account
                    </button>
                  </form>

                  {googleClientId && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1" style={{ background: "rgba(0,0,0,0.06)" }} />
                        <span className="text-[12px]" style={{ color: "rgba(15,10,30,0.35)" }}>or</span>
                        <div className="h-px flex-1" style={{ background: "rgba(0,0,0,0.06)" }} />
                      </div>
                      <GoogleSignInButton onSuccess={handleGoogleSuccess} label="Continue with Google" />
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div className="w-full min-w-0 lg:max-w-md lg:flex-[0.4]">
          <GreetingOrderSummaryCard occasion={occasion} celebrity={celebrity} template={template} />
        </div>
      </div>
    </div>
  );
}
