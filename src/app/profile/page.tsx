'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/lib/context'
import { authApi, clearToken, setUserInfo, type ApiUser } from '@/lib/api'
import {
  Mail, Shield, CheckCircle2, LogOut,
  Film, PlusCircle, ChevronRight, LayoutDashboard,
  Loader2, Camera, Pencil, X, Check, Clock,
} from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { lang } = useLanguage()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState<string | null>(null)

  useEffect(() => {
    authApi.getMe()
      .then(res => {
        setUser(res.user)
        setEditName(res.user.name)
        setEditAvatar(res.user.avatarUrl ?? null)
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  function startEdit() {
    setEditName(user?.name ?? '')
    setEditAvatar(user?.avatarUrl ?? null)
    setSaveError('')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setSaveError('')
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setEditAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function saveProfile() {
    if (!editName.trim()) return
    setSaving(true)
    setSaveError('')
    try {
      const res = await authApi.updateProfile({
        name: editName.trim(),
        avatarUrl: editAvatar ?? undefined,
      })
      setUser(res.user)
      setUserInfo({ name: res.user.name, email: res.user.email })
      setEditing(false)
    } catch {
      setSaveError(lang === 'ar' ? 'فشل الحفظ. حاول مرة أخرى.' : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    clearToken()
    router.push('/login')
  }

  const initials = (user?.name ?? 'ME')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const avatarSrc = editing ? editAvatar : (user?.avatarUrl ?? null)

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[600px] h-[600px] opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', top: '-10%', right: '-15%' }} />
        <div className="orb w-80 h-80 opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #422266, transparent)', bottom: '10%', left: '-8%' }} />
      </div>

      <main className="flex-1 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 text-content-muted">
            <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
            <p className="text-sm">{lang === 'ar' ? 'جار التحميل...' : 'Loading...'}</p>
          </div>
        ) : (
          <>
            {/* ── Cover banner ── */}
            <div className="h-44 w-full relative overflow-hidden pt-16"
              style={{ background: 'linear-gradient(135deg, #9a78fe 0%, #6B3FA0 50%, #422266 100%)' }}>
              <div className="absolute inset-0 opacity-[0.12] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />
            </div>

            {/* ── Page content ── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* ── Profile header ── */}
              {/*
                Avatar uses -mt-14 on its OWN wrapper so only it overlaps the banner.
                Name + buttons are siblings with no negative margin — always in the white zone.
              */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-8">

                {/* Avatar — only element that overlaps the banner */}
                <div className="relative -mt-14 shrink-0 self-start">
                  {/* Outer ring + shadow via wrapper; inner div handles overflow-hidden for image */}
                  <div className="relative w-28 h-28 rounded-2xl ring-4 ring-white shadow-xl">
                    <div
                      className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-bold text-white"
                      style={avatarSrc ? undefined : { background: 'linear-gradient(135deg, #9a78fe, #422266)' }}
                    >
                      {avatarSrc
                        ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                        : initials}
                    </div>

                    {/* Camera overlay — z-10 ensures it sits above the initials/image */}
                    {editing && (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="absolute inset-0 rounded-2xl z-10 flex items-center justify-center bg-black/55 transition-opacity hover:bg-black/65"
                      >
                        <Camera className="w-6 h-6 text-white drop-shadow" />
                      </button>
                    )}

                    {/* Online dot */}
                    {!editing && user?.status === 'active' && (
                      <span className="absolute bottom-1 right-1 z-10 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
                    )}
                  </div>

                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                </div>

                {/* Name + email + buttons — no negative margin, sits cleanly below banner */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pt-3">
                  <div className="min-w-0">
                    {editing ? (
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="text-xl font-bold text-content-primary bg-white border border-brand-purple/30 rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-purple transition-colors w-full max-w-xs"
                        placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full name'}
                      />
                    ) : (
                      <h1 className="text-xl font-bold text-content-primary">{user?.name ?? '—'}</h1>
                    )}
                    <p className="text-sm text-content-muted mt-0.5">{user?.email ?? '—'}</p>
                    {saveError && <p className="text-xs text-red-500 mt-1">{saveError}</p>}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {editing ? (
                      <>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-brand-purple/20 text-content-secondary hover:bg-surface-subtle transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          onClick={saveProfile}
                          disabled={saving || !editName.trim()}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #9a78fe, #422266)' }}
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          {saving
                            ? (lang === 'ar' ? 'جار الحفظ...' : 'Saving...')
                            : (lang === 'ar' ? 'حفظ' : 'Save')}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={startEdit}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-brand-purple/20 text-content-secondary hover:text-brand-purple hover:border-brand-purple/40 hover:bg-white transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {lang === 'ar' ? 'تعديل الملف' : 'Edit Profile'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Two-column grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 pb-16">

                {/* Left column */}
                <div className="flex flex-col gap-5">

                  {/* Status badges */}
                  <div className="bg-white rounded-2xl border border-brand-purple/12 shadow-card p-6">
                    <h2 className="text-sm font-bold text-content-primary mb-4">
                      {lang === 'ar' ? 'حالة الحساب' : 'Account Status'}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {user?.isEmailVerified ? (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-purple/6 border border-brand-purple/12">
                          <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-brand-purple" />
                          </div>
                          <div>
                            <p className="text-xs text-content-muted font-medium">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                            <p className="text-sm font-semibold text-brand-purple">{lang === 'ar' ? 'مؤكد' : 'Verified'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-subtle border border-brand-purple/10">
                          <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-content-muted" />
                          </div>
                          <div>
                            <p className="text-xs text-content-muted font-medium">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                            <p className="text-sm font-semibold text-content-secondary">{lang === 'ar' ? 'غير مؤكد' : 'Unverified'}</p>
                          </div>
                        </div>
                      )}

                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                        user?.status === 'active'
                          ? 'bg-emerald-50 border-emerald-100'
                          : 'bg-surface-subtle border-brand-purple/10'
                      }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          user?.status === 'active' ? 'bg-emerald-100' : 'bg-surface-elevated'
                        }`}>
                          <Shield className={`w-4 h-4 ${user?.status === 'active' ? 'text-emerald-600' : 'text-content-muted'}`} />
                        </div>
                        <div>
                          <p className="text-xs text-content-muted font-medium">{lang === 'ar' ? 'الحساب' : 'Account'}</p>
                          <p className={`text-sm font-semibold ${user?.status === 'active' ? 'text-emerald-600' : 'text-content-secondary'}`}>
                            {user?.status === 'active'
                              ? (lang === 'ar' ? 'نشط' : 'Active')
                              : (lang === 'ar' ? 'غير نشط' : user?.status ?? 'Inactive')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account info rows */}
                  <div className="bg-white rounded-2xl border border-brand-purple/12 shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-brand-purple/8">
                      <h2 className="text-sm font-bold text-content-primary">
                        {lang === 'ar' ? 'معلومات الحساب' : 'Account Information'}
                      </h2>
                    </div>
                    <div className="divide-y divide-brand-purple/6">
                      {[
                        {
                          icon: <Mail className="w-4 h-4 text-brand-purple" />,
                          label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
                          value: user?.email ?? '—',
                        },
                        {
                          icon: <Shield className="w-4 h-4 text-brand-purple" />,
                          label: lang === 'ar' ? 'حالة الحساب' : 'Account Status',
                          value: user?.status === 'active'
                            ? (lang === 'ar' ? 'نشط' : 'Active')
                            : (lang === 'ar' ? 'غير نشط' : user?.status ?? '—'),
                        },
                        {
                          icon: <CheckCircle2 className="w-4 h-4 text-brand-purple" />,
                          label: lang === 'ar' ? 'التحقق من البريد' : 'Email Verified',
                          value: user?.isEmailVerified
                            ? (lang === 'ar' ? 'نعم' : 'Yes')
                            : (lang === 'ar' ? 'لا' : 'No'),
                        },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4">
                          <div className="w-9 h-9 rounded-xl bg-brand-purple/8 border border-brand-purple/10 flex items-center justify-center shrink-0">
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-content-muted font-medium">{item.label}</p>
                            <p className="text-sm font-semibold text-content-primary mt-0.5">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-5">

                  {/* Quick links */}
                  <div className="bg-white rounded-2xl border border-brand-purple/12 shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-brand-purple/8">
                      <h2 className="text-sm font-bold text-content-primary">
                        {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
                      </h2>
                    </div>
                    <div className="divide-y divide-brand-purple/6">
                      {[
                        {
                          href: '/dashboard',
                          icon: <LayoutDashboard className="w-4 h-4 text-brand-purple" />,
                          label: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard',
                          desc: lang === 'ar' ? 'نظرة عامة على طلباتك' : 'Overview of your orders',
                        },
                        {
                          href: '/videos',
                          icon: <Film className="w-4 h-4 text-brand-purple" />,
                          label: lang === 'ar' ? 'فيديوهاتي' : 'My Videos',
                          desc: lang === 'ar' ? 'جميع الفيديوهات المطلوبة' : 'All requested videos',
                        },
                        {
                          href: '/create/product-type',
                          icon: <PlusCircle className="w-4 h-4 text-brand-purple" />,
                          label: lang === 'ar' ? 'طلب جديد' : 'New Order',
                          desc: lang === 'ar' ? 'ابدأ طلب فيديو جديد' : 'Start a new video order',
                        },
                      ].map((item, i) => (
                        <Link key={i} href={item.href}
                          className="flex items-center gap-3 px-6 py-4 hover:bg-surface-subtle transition-colors group">
                          <div className="w-9 h-9 rounded-xl bg-brand-purple/8 border border-brand-purple/10 flex items-center justify-center shrink-0 group-hover:bg-brand-purple/15 transition-colors">
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-content-primary group-hover:text-brand-purple transition-colors">{item.label}</p>
                            <p className="text-xs text-content-muted mt-0.5">{item.desc}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-content-muted group-hover:text-brand-purple group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-red-200 bg-white text-red-500 text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    {lang === 'ar' ? 'تسجيل الخروج من الحساب' : 'Log out of account'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
