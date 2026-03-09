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
  Loader2, Camera, Pencil, X, Check, Clock, KeyRound, Eye, EyeOff,
} from 'lucide-react'
import Link from 'next/link'

// Google icon (inline SVG — no extra dependency)
function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function ProfilePage() {
  const { lang } = useLanguage()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Profile edit
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState<string | null>(null)

  // Set-password flow
  const [showSetPwd, setShowSetPwd] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState(false)

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
      const res = await authApi.updateProfile({ name: editName.trim(), avatarUrl: editAvatar ?? undefined })
      setUser(res.user)
      setUserInfo({ name: res.user.name, email: res.user.email })
      setEditing(false)
    } catch {
      setSaveError(lang === 'ar' ? 'فشل الحفظ. حاول مرة أخرى.' : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSetPassword() {
    setPwdError('')
    if (newPassword.length < 8) {
      setPwdError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.' : 'Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.')
      return
    }
    setPwdSaving(true)
    try {
      await authApi.setPassword(newPassword)
      setPwdSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      // Update local user state so the badge flips to email
      setUser(prev => prev ? { ...prev, authProvider: 'email' } : prev)
    } catch (err: any) {
      setPwdError(err.message || (lang === 'ar' ? 'فشل. حاول مرة أخرى.' : 'Failed. Please try again.'))
    } finally {
      setPwdSaving(false)
    }
  }

  function handleLogout() {
    clearToken()
    router.push('/login')
  }

  const initials = (user?.name ?? 'ME')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const avatarSrc = editing ? editAvatar : (user?.avatarUrl ?? null)
  const isGoogle = user?.authProvider === 'google'
  const hasBothMethods = isGoogle && user?.hasEmailPassword

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
            {/* Cover banner */}
            <div className="h-44 w-full relative overflow-hidden pt-16"
              style={{ background: 'linear-gradient(135deg, #9a78fe 0%, #6B3FA0 50%, #422266 100%)' }}>
              <div className="absolute inset-0 opacity-[0.12] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Profile header */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-8">

                {/* Avatar */}
                <div className="relative -mt-14 shrink-0 self-start">
                  <div className="relative w-28 h-28 rounded-2xl ring-4 ring-white shadow-xl">
                    <div
                      className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-bold text-white"
                      style={avatarSrc ? undefined : { background: 'linear-gradient(135deg, #9a78fe, #422266)' }}
                    >
                      {avatarSrc
                        ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                        : initials}
                    </div>

                    {editing && (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="absolute inset-0 rounded-2xl z-10 flex items-center justify-center bg-black/55 transition-opacity hover:bg-black/65"
                      >
                        <Camera className="w-6 h-6 text-white drop-shadow" />
                      </button>
                    )}

                    {!editing && user?.status === 'active' && (
                      <span className="absolute bottom-1 right-1 z-10 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                </div>

                {/* Name + actions */}
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

                    {/* Auth provider pill(s) */}
                    {!editing && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {isGoogle && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600">
                            <GoogleIcon size={12} /> Google SSO
                          </span>
                        )}
                        {(!isGoogle || hasBothMethods) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-purple/8 border border-brand-purple/20 text-brand-purple">
                            <Mail className="w-3 h-3" /> {lang === 'ar' ? 'بريد + كلمة مرور' : 'Email & Password'}
                          </span>
                        )}
                      </div>
                    )}

                    {saveError && <p className="text-xs text-red-500 mt-1">{saveError}</p>}
                  </div>

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

              {/* Two-column grid */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 pb-16">

                {/* Left column */}
                <div className="flex flex-col gap-5">

                  {/* Account Status badges */}
                  <div className="bg-white rounded-2xl border border-brand-purple/12 shadow-card p-6">
                    <h2 className="text-sm font-bold text-content-primary mb-4">
                      {lang === 'ar' ? 'حالة الحساب' : 'Account Status'}
                    </h2>
                    <div className="flex flex-wrap gap-3">

                      {/* Email verified */}
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

                      {/* Account active */}
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                        user?.status === 'active' ? 'bg-emerald-50 border-emerald-100' : 'bg-surface-subtle border-brand-purple/10'
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

                      {/* Sign-in method */}
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                        hasBothMethods ? 'bg-brand-purple/6 border-brand-purple/12' :
                        isGoogle ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100'
                      }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          hasBothMethods ? 'bg-brand-purple/10' :
                          isGoogle ? 'bg-white border border-gray-200' : 'bg-blue-100'
                        }`}>
                          {hasBothMethods
                            ? <KeyRound className="w-4 h-4 text-brand-purple" />
                            : isGoogle ? <GoogleIcon size={16} /> : <KeyRound className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div>
                          <p className="text-xs text-content-muted font-medium">{lang === 'ar' ? 'طريقة تسجيل الدخول' : 'Sign-in Method'}</p>
                          <p className={`text-sm font-semibold ${
                            hasBothMethods ? 'text-brand-purple' :
                            isGoogle ? 'text-gray-700' : 'text-blue-700'
                          }`}>
                            {hasBothMethods
                              ? (lang === 'ar' ? 'Google + بريد إلكتروني' : 'Google + Email')
                              : isGoogle ? 'Google SSO'
                              : (lang === 'ar' ? 'بريد + كلمة مرور' : 'Email & Password')}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Account Information */}
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
                        {
                          icon: <KeyRound className="w-4 h-4 text-brand-purple" />,
                          label: lang === 'ar' ? 'طريقة تسجيل الدخول' : 'Sign-in Method',
                          value: hasBothMethods
                            ? (lang === 'ar' ? 'Google + بريد إلكتروني وكلمة مرور' : 'Google + Email & Password')
                            : isGoogle ? 'Google SSO'
                            : (lang === 'ar' ? 'بريد إلكتروني وكلمة مرور' : 'Email & Password'),
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

                  {/* Set Password card — only for Google-only users who haven't set a password yet */}
                  {isGoogle && !user?.hasEmailPassword && (
                    <div className="bg-white rounded-2xl border border-brand-purple/12 shadow-card overflow-hidden">
                      <button
                        onClick={() => { setShowSetPwd(v => !v); setPwdError(''); setPwdSuccess(false) }}
                        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-surface-subtle transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-brand-purple/8 border border-brand-purple/12 flex items-center justify-center shrink-0">
                          <KeyRound className="w-5 h-5 text-brand-purple" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-content-primary">
                            {lang === 'ar' ? 'إضافة كلمة مرور للبريد الإلكتروني' : 'Add Email & Password Sign-in'}
                          </p>
                          <p className="text-xs text-content-muted mt-0.5">
                            {lang === 'ar'
                              ? 'أضف كلمة مرور حتى تتمكن من تسجيل الدخول بالبريد الإلكتروني أيضاً'
                              : 'Set a password so you can also sign in with your email'}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-content-muted transition-transform shrink-0 ${showSetPwd ? 'rotate-90' : ''}`} />
                      </button>

                      {showSetPwd && (
                        <div className="px-6 pb-6 border-t border-brand-purple/8">
                          {pwdSuccess ? (
                            <div className="flex items-start gap-3 mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-emerald-700">
                                  {lang === 'ar' ? 'تم تعيين كلمة المرور بنجاح!' : 'Password set successfully!'}
                                </p>
                                <p className="text-xs text-emerald-600 mt-0.5">
                                  {lang === 'ar'
                                    ? 'يمكنك الآن تسجيل الدخول باستخدام بريدك الإلكتروني وكلمة المرور.'
                                    : 'You can now sign in with your email and password.'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4 mt-5">
                              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                                <p className="text-xs text-amber-700 leading-relaxed">
                                  {lang === 'ar'
                                    ? 'بعد تعيين كلمة مرور، يمكنك تسجيل الدخول باستخدام Google أو البريد الإلكتروني وكلمة المرور.'
                                    : 'After setting a password, you can sign in with either Google or your email and password.'}
                                </p>
                              </div>

                              {/* New password */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-content-secondary">
                                  {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                                </label>
                                <div className="relative">
                                  <input
                                    type={showPwd ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white border border-brand-purple/20 rounded-xl px-4 pr-10 py-2.5 text-sm text-content-primary placeholder-content-placeholder focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_3px_rgba(154,120,254,0.12)] transition-all"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPwd(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-brand-purple transition-colors"
                                  >
                                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              {/* Confirm password */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-content-secondary">
                                  {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                                </label>
                                <input
                                  type={showPwd ? 'text' : 'password'}
                                  value={confirmPassword}
                                  onChange={e => setConfirmPassword(e.target.value)}
                                  placeholder="••••••••"
                                  className="w-full bg-white border border-brand-purple/20 rounded-xl px-4 py-2.5 text-sm text-content-primary placeholder-content-placeholder focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_3px_rgba(154,120,254,0.12)] transition-all"
                                />
                              </div>

                              {pwdError && (
                                <p className="text-xs text-red-500">{pwdError}</p>
                              )}

                              <button
                                onClick={handleSetPassword}
                                disabled={pwdSaving || !newPassword || !confirmPassword}
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #9a78fe, #422266)' }}
                              >
                                {pwdSaving
                                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {lang === 'ar' ? 'جار الحفظ...' : 'Saving...'}</>
                                  : <><KeyRound className="w-4 h-4" /> {lang === 'ar' ? 'تعيين كلمة المرور' : 'Set Password'}</>
                                }
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

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
