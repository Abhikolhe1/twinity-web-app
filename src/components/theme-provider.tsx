"use client";

import type { ReactNode } from "react";

type ThemeProviderProps = {
  children: ReactNode;
};

/**
 * Pass-through wrapper kept for API compatibility.
 * The app is dark-only: the `dark` class is applied unconditionally
 * on <html> in layout.tsx, so next-themes is not needed.
 * This eliminates the React 19 "Encountered a script tag" warning
 * that next-themes injects via a <script> element.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}
