'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/context'
import { Globe, User, LogOut } from 'lucide-react'
import { clearToken, getUserInfo } from '@/lib/api'

export default function Navbar() {
  const { lang, toggleLang, tr } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const isActive = (href: string) => pathname === href

  const [open, setOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const info = getUserInfo()
    if (info?.name) setUserName(info.name)
  }, [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleLogout() {
    clearToken()
    router.push('/login')
  }

  const initials = userName
    ? userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ME'

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
            <NavLink href="/dashboard"   label={tr.nav.dashboard}   active={isActive('/dashboard')} />
            <NavLink href="/videos"      label={tr.nav.videos}      active={pathname.startsWith('/videos')} />
            <NavLink href="/celebrities" label={tr.nav.celebrities} active={isActive('/celebrities')} />
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

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(v => !v)}
                title={userName || (lang === 'ar' ? 'حسابي' : 'My Account')}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-transparent hover:ring-brand-purple/40 transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #9a78fe, #422266)' }}
              >
                {initials}
              </button>

              {open && (
                <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl border border-brand-purple/12 overflow-hidden z-50"
                  style={{ boxShadow: '0 8px 32px rgba(154,120,254,0.18), 0 2px 8px rgba(0,0,0,0.08)' }}>

                  {/* User header — avatar + name */}
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-subtle transition-all group border-b border-brand-purple/8"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #9a78fe, #422266)' }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-content-primary truncate leading-tight">
                        {userName || (lang === 'ar' ? 'حسابي' : 'My Account')}
                      </p>
                      <p className="text-xs text-brand-purple mt-0.5 group-hover:underline">
                        {lang === 'ar' ? 'عرض الملف ←' : 'View profile →'}
                      </p>
                    </div>
                  </Link>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-content-secondary hover:text-brand-purple hover:bg-surface-subtle transition-all"
                    >
                      <User className="w-4 h-4" />
                      {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
                    </Link>
                  </div>

                  <div className="border-t border-brand-purple/8 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      {lang === 'ar' ? 'تسجيل الخروج' : 'Log out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
