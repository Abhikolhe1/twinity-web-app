export default function StudioRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased">{children}</div>;
}
