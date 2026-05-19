"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
} from "react";

import type { CreditBalance } from "@/lib/credits";

/* ── Context shape ───────────────────────────────────────────────────────── */
type CreditsContextValue = {
  balance:    CreditBalance;
  /** Optimistically deduct credits (call before API confirmation) */
  deduct:     (amount: number) => void;
  /** Reconcile with server-confirmed balance after API response */
  reconcile:  (serverBalance: CreditBalance) => void;
  /** Whether a reconciliation is in flight */
  isPending:  boolean;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

/* ── Provider ────────────────────────────────────────────────────────────── */
export function CreditsProvider({
  children,
  initialBalance,
}: {
  children:       React.ReactNode;
  initialBalance: CreditBalance;
}) {
  const [balance, setBalance] = useState<CreditBalance>(initialBalance);
  const [isPending, startTransition] = useTransition();

  const deduct = useCallback((amount: number) => {
    setBalance((prev) => ({
      ...prev,
      available: Math.max(0, prev.available - amount),
      used:      prev.used + amount,
    }));
  }, []);

  const reconcile = useCallback((serverBalance: CreditBalance) => {
    startTransition(() => {
      setBalance(serverBalance);
    });
  }, []);

  return (
    <CreditsContext.Provider value={{ balance, deduct, reconcile, isPending }}>
      {children}
    </CreditsContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────────────────────── */
export function useCredits(): CreditsContextValue {
  const ctx = useContext(CreditsContext);
  if (!ctx) {
    throw new Error("useCredits must be used inside <CreditsProvider>");
  }
  return ctx;
}

/**
 * Safe version — returns null when used outside provider context.
 * Useful for components that may render outside the studio layout.
 */
export function useCreditsOptional(): CreditsContextValue | null {
  return useContext(CreditsContext);
}
