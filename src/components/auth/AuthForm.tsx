'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/context'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { authApi, setToken, setUserInfo } from '@/lib/api'
import { Eye, EyeOff, Mail, Lock, User, Globe, AlertCircle } from 'lucide-react'

interface AuthFormProps {
  mode: 'signin' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { lang, toggleLang, tr } = useLanguage()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', agree: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'signup' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      let res
      if (mode === 'signup') {
        res = await authApi.register({ name: form.name, email: form.email, password: form.password })
      } else {
        res = await authApi.login({ email: form.email, password: form.password })
      }
      setToken(res.token)
      setUserInfo({ name: res.user.name, email: res.user.email })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left – Brand Panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #9a78fe 0%, #6B3FA0 50%, #422266 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10 text-center max-w-md">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25 shadow-lg">
              <img src="/logo/icon-white.png" alt="Twinity" className="w-12 h-12 object-contain" />
            </div>
          </div>

          <img src="/logo/logo-white.png" alt="Twinity" className="h-10 mx-auto mb-6 object-contain" />

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            {lang === 'ar'
              ? 'أنشئ مقاطع فيديو استثنائية بقوة المشاهير'
              : 'Create extraordinary videos powered by celebrities'}
          </h2>
          <p className="text-white/75 text-base leading-relaxed">
            {lang === 'ar'
              ? 'اختر من بين أكثر من 150 مشهوراً موثقاً وأنشئ محتوى مذهلاً.'
              : 'Choose from 150+ verified celebrities and create stunning content for your campaigns.'}
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { val: '150+', label: lang === 'ar' ? 'مشهور' : 'Celebrities' },
              { val: '10K+', label: lang === 'ar' ? 'فيديو' : 'Videos Made' },
              { val: '500+', label: lang === 'ar' ? 'علامة تجارية' : 'Brands' },
            ].map(s => (
              <div key={s.val} className="p-3 rounded-2xl bg-white/12 border border-white/20 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{s.val}</p>
                <p className="text-xs text-white/70 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              lang === 'ar' ? '🌟 مشاهير موثقون' : '🌟 Verified Celebrities',
              lang === 'ar' ? '⚡ تسليم سريع'    : '⚡ Fast Delivery',
              lang === 'ar' ? '🌍 عربي + إنجليزي' : '🌍 AR + EN Support',
            ].map(f => (
              <span key={f} className="text-xs px-3 py-1.5 rounded-full bg-white/12 border border-white/20 text-white/80">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right – Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-surface-page relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-8 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', transform: 'translate(30%, -30%)' }} />

        {/* Language toggle */}
        <div className="absolute top-6 right-6">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-content-secondary hover:text-brand-purple hover:bg-surface-subtle border border-brand-purple/12 transition-all bg-white"
          >
            <Globe className="w-4 h-4" />
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo – mobile only */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <img src="/logo/icon.svg" alt="Twinity" className="w-10 h-10" />
              <img src="/logo/logo.svg" alt="Twinity" className="h-7" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">
              {mode === 'signup' ? tr.auth.signUp : tr.auth.signIn}
            </h1>
            <p className="mt-2 text-content-muted text-sm">{tr.auth.welcomeSub}</p>
          </div>

          {/* Google SSO — sign in only */}
          {mode === 'signin' && (
            <>
              <div className="mb-6">
                <p className="text-xs text-content-muted text-center mb-3">{tr.auth.orContinueWith}</p>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-brand-purple/18 text-sm text-content-secondary hover:bg-surface-subtle hover:text-content-primary hover:border-brand-purple/30 transition-all shadow-card">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {lang === 'ar' ? 'المتابعة مع Google' : 'Continue with Google'}
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-brand-purple/12" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-surface-page text-xs text-content-muted">
                    {lang === 'ar' ? 'أو بالبريد الإلكتروني' : 'Or with email'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <Input
                label={tr.auth.fullName}
                placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Your full name'}
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
                icon={<User className="w-4 h-4" />}
              />
            )}

            <Input
              label={tr.auth.email}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
              icon={<Mail className="w-4 h-4" />}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-primary">{tr.auth.password}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  className="w-full bg-white border border-brand-purple/20 rounded-xl pl-10 pr-10 py-3 text-content-primary placeholder-content-placeholder text-sm focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_3px_rgba(154,120,254,0.12)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-brand-purple transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <Input
                  label={tr.auth.confirmPassword}
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                  icon={<Lock className="w-4 h-4" />}
                />
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agree}
                    onChange={e => setForm(p => ({ ...p, agree: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 accent-brand-purple"
                    required
                  />
                  <span className="text-xs text-content-muted leading-relaxed">
                    {tr.auth.bySigningUp}{' '}
                    <Link href="/terms" className="text-brand-purple hover:underline">{tr.auth.terms}</Link>
                    {' '}&amp;{' '}
                    <Link href="/privacy" className="text-brand-purple hover:underline">{tr.auth.privacy}</Link>
                  </span>
                </label>
              </>
            )}

            {mode === 'signin' && (
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs text-brand-purple hover:underline">{tr.auth.forgotPassword}</Link>
              </div>
            )}

            <Button size="lg" fullWidth loading={loading} type="submit" className="mt-1">
              {mode === 'signup' ? tr.auth.signUpCta : tr.auth.signInCta}
            </Button>
          </form>

          <p className="text-center mt-5 text-sm text-content-muted">
            {mode === 'signup' ? tr.auth.haveAccount : tr.auth.noAccount}{' '}
            <Link
              href={mode === 'signup' ? '/login' : '/register'}
              className="text-brand-purple font-semibold hover:underline"
            >
              {mode === 'signup' ? tr.auth.signIn : tr.auth.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
