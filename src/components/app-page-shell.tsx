import type { ReactNode } from "react";
import Link from "next/link";

import Logo from "@/components/ui/Logo";

export type AppPageShellProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function AppPageShell({ title, description, children }: AppPageShellProps) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center border-b border-[var(--color-border)] bg-[var(--color-bg)] px-6">
        <Link href="/" className="inline-flex items-center py-2" aria-label="Twinity home">
          <Logo height={32} />
        </Link>
      </header>
      <div className="flex flex-1 flex-col px-6 py-12">
        <main className="mx-auto w-full max-w-2xl">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text)]">{title}</h1>
          {description ? <p className="mt-2 text-[var(--color-text-secondary)]">{description}</p> : null}
          {children}
        </main>
      </div>
    </div>
  );
}
