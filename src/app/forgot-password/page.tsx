'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/context'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const { lang } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-page px-4 relative overflow-hidden">

      {/* Background orb */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', transform: 'translate(20%, -20%)' }} />

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="flex justify-center">
          <img src="/logo/logo.svg" alt="Twinity" className="h-32" />
        </div>

        <div className="bg-white rounded-3xl border border-brand-purple/12 shadow-card p-8">

          {!sent ? (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-content-primary">
                  {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </h1>
                <p className="mt-2 text-sm text-content-muted">
                  {lang === 'ar'
                    ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.'
                    : "Enter your email and we'll send you a reset link."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                  label={lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  icon={<Mail className="w-4 h-4" />}
                />
                <Button size="lg" fullWidth type="submit" loading={loading}>
                  {lang === 'ar' ? 'إرسال رابط الإعادة' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-content-primary">
                {lang === 'ar' ? 'تم الإرسال!' : 'Email Sent!'}
              </h2>
              <p className="text-sm text-content-muted mt-2">
                {lang === 'ar'
                  ? `أرسلنا رابط إعادة تعيين كلمة المرور إلى ${email}`
                  : `We sent a password reset link to ${email}`}
              </p>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-brand-purple/8 flex justify-center">
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm text-content-muted hover:text-brand-purple transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
