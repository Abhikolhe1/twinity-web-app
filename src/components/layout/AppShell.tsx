"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { useEffect, useState, type ReactNode } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/pricing", label: "Pricing" },
] as const;

export type AppShellProps = { children: ReactNode };

export function AppShell({ children }: AppShellProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-full flex-col bg-[#080808]">
      {/* Grain texture — fixed, pointer-events none, z above everything */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1000]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          opacity: 0.022,
          mixBlendMode: "overlay",
        }}
      />

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 flex h-[60px] items-center px-5 transition-all duration-[280ms] ease-out sm:px-12",
          scrolled
            ? "border-b border-[rgba(255,255,255,0.05)] bg-[rgba(8,8,8,0.90)] backdrop-blur-[20px]"
            : "border-b border-transparent bg-[rgba(8,8,8,0.60)] backdrop-blur-[8px]",
        ].join(" ")}
      >
        <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="Twinity home" className="flex shrink-0 items-center">
            <Logo height={26} />
          </Link>

          {/* Center nav links */}
          <nav className="hidden items-center gap-10 md:flex" aria-label="Primary navigation">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[14px] font-normal tracking-[0.01em] text-[rgba(255,255,255,0.45)] transition-colors duration-200 hover:text-[rgba(255,255,255,0.85)]"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA — shadcn Button with brand override */}
          <Button
            asChild
            variant="default"
            className="hidden h-auto bg-[#7C3AED] px-5 py-2 text-[13px] font-semibold tracking-[0.02em] text-white shadow-none transition-all duration-200 hover:bg-[#6D28D9] hover:shadow-[0_0_24px_rgba(139,92,246,0.35)] sm:inline-flex"
          >
            <Link href="/get-started">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1A1A1A] bg-[#080808] px-5 py-8 sm:px-12">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between">
          <p className="text-[13px] text-[#3D3D3D]">© 2026 Twinity</p>
          <ul className="flex items-center gap-6 text-[13px] text-[#3D3D3D]">
            <li>
              <Link href="/privacy" className="transition-colors duration-150 hover:text-[#606060]">
                Privacy
              </Link>
            </li>
            <li aria-hidden>·</li>
            <li>
              <Link href="/terms" className="transition-colors duration-150 hover:text-[#606060]">
                Terms
              </Link>
            </li>
            <li aria-hidden>·</li>
            <li>
              <Link href="/contact" className="transition-colors duration-150 hover:text-[#606060]">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
