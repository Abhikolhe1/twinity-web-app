'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react'

import { authApi } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [loading, setLoading]   = useState(false)
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState('')
  const [sent, setSent]         = useState(false)

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
      style={{ background: '#080808' }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-0 h-[480px] w-[640px] -translate-x-1/2"
        style={{
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
          filter:     'blur(40px)',
        }}
      />

      <div className="relative w-full max-w-[400px]">
        <div className="mb-10 flex justify-center">
          <Image
            src="/images/Logo white@4x.png"
            alt="Twinity"
            width={3396}
            height={1327}
            style={{ height: 28, width: 'auto', objectFit: 'contain' }}
            priority
          />
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: '#0D0D0D',
            border:     '1px solid rgba(255,255,255,0.07)',
            boxShadow:  '0 24px 64px rgba(0,0,0,0.60)',
          }}
        >
          {sent ? (
            <div className="flex flex-col items-center text-center">
              <CheckCircle size={40} style={{ color: '#22C55E', marginBottom: 16 }} />
              <h1 className="mb-2 text-[22px] font-bold text-white" style={{ letterSpacing: '-0.03em' }}>
                Check your email
              </h1>
              <p className="mb-6 text-[14px]" style={{ color: 'rgba(255,255,255,0.40)', lineHeight: 1.6 }}>
                We sent a password reset link to <strong className="text-white">{email}</strong>
              </p>
              <Link
                href="/login"
                className="text-[13px] font-medium transition-colors duration-150"
                style={{ color: 'rgba(167,139,250,0.85)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#C4B5FD' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(167,139,250,0.85)' }}
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1
                className="mb-1 text-[26px] font-bold text-white"
                style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
              >
                Reset password
              </h1>
              <p className="mb-8 text-[14px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
                Enter your email and we&apos;ll send a reset link
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <div
                    className="rounded-lg px-4 py-3 text-[13px]"
                    style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}
                  >
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="h-10 w-full rounded-lg bg-transparent px-3.5 text-[14px] text-white placeholder:text-[rgba(255,255,255,0.22)] focus:outline-none transition-all duration-150"
                    style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.03)' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(124,58,237,0.55)'
                      e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(124,58,237,0.10)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
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
                    boxShadow:  '0 1px 3px rgba(0,0,0,0.40), 0 0 0 1px rgba(124,58,237,0.50)',
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

              <p className="mt-6 text-center text-[13px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 font-medium transition-colors duration-150"
                  style={{ color: 'rgba(255,255,255,0.40)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.70)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.40)' }}
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
