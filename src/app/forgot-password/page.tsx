'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react'

import { authApi } from '@/lib/api'
import Logo from '@/components/ui/Logo'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: '#FFFFFF' }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-0 h-[480px] w-[640px] -translate-x-1/2"
        style={{
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)',
          filter:     'blur(40px)',
        }}
      />

      <div className="relative w-full max-w-[400px]">
        <div className="mb-10 flex justify-center">
          <Logo dark height={28} />
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: '#FFFFFF',
            border:     '1px solid rgba(0,0,0,0.08)',
            boxShadow:  '0 8px 40px rgba(0,0,0,0.08)',
          }}
        >
          {sent ? (
            <div className="flex flex-col items-center text-center">
              <CheckCircle size={40} style={{ color: '#22C55E', marginBottom: 16 }} />
              <h1 className="mb-2 text-[22px] font-bold" style={{ color: '#0F0A1E', letterSpacing: '-0.03em' }}>
                Check your email
              </h1>
              <p className="mb-6 text-[14px]" style={{ color: 'rgba(15,10,30,0.45)', lineHeight: 1.6 }}>
                We sent a password reset link to{' '}
                <strong style={{ color: '#0F0A1E' }}>{email}</strong>
              </p>
              <Link
                href="/login"
                className="text-[13px] font-medium transition-colors duration-150"
                style={{ color: '#7C3AED' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#5B21B6' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#7C3AED' }}
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1
                className="mb-1 text-[26px] font-bold"
                style={{ color: '#0F0A1E', letterSpacing: '-0.03em', lineHeight: 1.1 }}
              >
                Reset password
              </h1>
              <p className="mb-8 text-[14px]" style={{ color: 'rgba(15,10,30,0.42)' }}>
                Enter your email and we&apos;ll send a reset link
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <div
                    className="rounded-lg px-4 py-3 text-[13px]"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#DC2626' }}
                  >
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium" style={{ color: 'rgba(15,10,30,0.55)' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="h-10 w-full rounded-lg px-3.5 text-[14px] placeholder:text-[rgba(15,10,30,0.28)] focus:outline-none transition-all duration-150"
                    style={{ border: '1px solid rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.03)', color: '#0F0A1E' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(124,58,237,0.55)'
                      e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(124,58,237,0.10)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)'
                      e.currentTarget.style.boxShadow   = 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-semibold text-white transition-opacity duration-150 disabled:opacity-60"
                  style={{
                    background: '#7C3AED',
                    boxShadow:  '0 1px 3px rgba(124,58,237,0.30), 0 0 0 1px rgba(124,58,237,0.50)',
                  }}
                  onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight size={14} aria-hidden />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-[13px]">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 font-medium transition-colors duration-150"
                  style={{ color: 'rgba(15,10,30,0.42)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#7C3AED' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(15,10,30,0.42)' }}
                >
                  <ArrowLeft size={13} aria-hidden />
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
