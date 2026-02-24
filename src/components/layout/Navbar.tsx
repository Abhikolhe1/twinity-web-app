'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/context'
import { Globe, PlusCircle, LogIn } from 'lucide-react'

export default function Navbar() {
  const { lang, toggleLang, tr } = useLanguage()
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-b border-brand-purple/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo/icon.svg" alt="Twinity Icon" className="h-10 sm:hidden" />
            <img src="/logo/logo.svg" alt="Twinity" className="h-24 hidden sm:block" />
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/celebrities" label={tr.nav.celebrities} active={isActive('/celebrities')} />
            <NavLink href="/dashboard"  label={tr.nav.dashboard}   active={isActive('/dashboard')} />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-content-secondary hover:text-brand-purple hover:bg-surface-subtle transition-all"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Sign In */}
            <Link
              href="/register"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-content-secondary hover:text-brand-purple hover:bg-surface-subtle transition-all"
            >
              <LogIn className="w-4 h-4" />
              {tr.nav.signIn}
            </Link>

            {/* Create CTA */}
            <Link
              href="/create"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-button transition-all hover:shadow-purple-lg hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #9a78fe, #422266)' }}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{tr.nav.createVideo}</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-surface-subtle text-brand-purple'
          : 'text-content-secondary hover:text-brand-purple hover:bg-surface-subtle'
      }`}
    >
      {label}
    </Link>
  )
}
