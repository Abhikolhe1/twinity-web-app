'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/context'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { authApi } from '@/lib/api'

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const { lang } = useLanguage()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError(lang === 'ar' ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.' : 'Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
      setTimeout(() => router.replace('/login'), 3000)
    } catch (err: any) {
      setError(err.message || (lang === 'ar' ? 'رابط غير صالح أو منتهي الصلاحية.' : 'Invalid or expired reset link.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-page px-4 relative overflow-hidden">

      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', transform: 'translate(20%, -20%)' }} />

      <div className="w-full max-w-md relative z-10">

        <div className="flex justify-center">
          <img src="/logo/logo.svg" alt="Twinity" className="h-32" />
        </div>

        <div className="bg-white rounded-3xl border border-brand-purple/12 shadow-card p-8">

          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-content-primary">
                {lang === 'ar' ? 'تمت إعادة التعيين!' : 'Password Reset!'}
              </h2>
              <p className="text-sm text-content-muted mt-2">
                {lang === 'ar'
                  ? 'تم تحديث كلمة مرورك. جارٍ تحويلك لتسجيل الدخول...'
                  : 'Your password has been updated. Redirecting you to sign in...'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-content-primary">
                  {lang === 'ar' ? 'تعيين كلمة مرور جديدة' : 'Set New Password'}
                </h1>
                <p className="mt-2 text-sm text-content-muted">
                  {lang === 'ar' ? 'اختر كلمة مرور قوية لحسابك.' : 'Choose a strong password for your account.'}
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-content-primary">
                    {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full bg-white border border-brand-purple/20 rounded-xl pl-10 pr-10 py-3 text-content-primary placeholder-content-placeholder text-sm focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_3px_rgba(154,120,254,0.12)] transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-brand-purple transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-content-primary">
                    {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      className="w-full bg-white border border-brand-purple/20 rounded-xl pl-10 pr-10 py-3 text-content-primary placeholder-content-placeholder text-sm focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_3px_rgba(154,120,254,0.12)] transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-brand-purple transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button size="lg" fullWidth type="submit" loading={loading}>
                  {lang === 'ar' ? 'تعيين كلمة المرور' : 'Reset Password'}
                </Button>
              </form>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-brand-purple/8 flex justify-center">
            <Link href="/login"
              className="flex items-center gap-1.5 text-sm text-content-muted hover:text-brand-purple transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
