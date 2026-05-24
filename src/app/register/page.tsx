'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

import { authApi } from '@/lib/api'
import { useUser } from '@/contexts/UserContext'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import Logo from '@/components/ui/Logo'

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

const INPUT_BASE: React.CSSProperties = {
  border:     '1px solid rgba(0,0,0,0.10)',
  background: 'rgba(0,0,0,0.03)',
}
const INPUT_FOCUS: React.CSSProperties = {
  borderColor: 'rgba(124,58,237,0.55)',
  boxShadow:   '0 0 0 3px rgba(124,58,237,0.10)',
}
const INPUT_BLUR: React.CSSProperties = {
  borderColor: 'rgba(0,0,0,0.10)',
  boxShadow:   'none',
}

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useUser()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [name, setName]                 = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [error, setError]               = useState('')

  async function handleGoogleSuccess(accessToken: string) {
    const res = await authApi.googleAuth(accessToken)
    login(res.token, res.user)
    router.push('/studio')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.register({ name, email, password })
      login(res.token, res.user)
      router.push('/studio')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: '#FFFFFF' }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-0 h-[480px] w-[640px] -translate-x-1/2"
        style={{
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)',
          filter:     'blur(40px)',
        }}
      />

      <div className="relative w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <Logo dark height={28} />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: '#FFFFFF',
            border:     '1px solid rgba(0,0,0,0.08)',
            boxShadow:  '0 8px 40px rgba(0,0,0,0.08)',
          }}
        >
          <h1
            className="mb-1 text-[26px] font-bold"
            style={{ color: '#0F0A1E', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Create account
          </h1>
          <p className="mb-8 text-[14px]" style={{ color: 'rgba(15,10,30,0.42)' }}>
            Start licensing celebrity identity on Twinity
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

            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: 'rgba(15,10,30,0.55)' }}>
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="h-10 w-full rounded-lg px-3.5 text-[14px] placeholder:text-[rgba(15,10,30,0.28)] focus:outline-none transition-all duration-150"
                style={{ ...INPUT_BASE, color: '#0F0A1E' }}
                onFocus={(e) => Object.assign(e.currentTarget.style, INPUT_FOCUS)}
                onBlur={(e) => Object.assign(e.currentTarget.style, INPUT_BLUR)}
              />
            </div>

            {/* Email */}
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
                style={{ ...INPUT_BASE, color: '#0F0A1E' }}
                onFocus={(e) => Object.assign(e.currentTarget.style, INPUT_FOCUS)}
                onBlur={(e) => Object.assign(e.currentTarget.style, INPUT_BLUR)}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: 'rgba(15,10,30,0.55)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="h-10 w-full rounded-lg pl-3.5 pr-10 text-[14px] placeholder:text-[rgba(15,10,30,0.28)] focus:outline-none transition-all duration-150"
                  style={{ ...INPUT_BASE, color: '#0F0A1E' }}
                  onFocus={(e) => Object.assign(e.currentTarget.style, INPUT_FOCUS)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, INPUT_BLUR)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(15,10,30,0.35)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
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
                  Create account
                  <ArrowRight size={14} aria-hidden />
                </>
              )}
            </button>
          </form>

          {/* Google sign-in */}
          {googleClientId && (
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: 'rgba(0,0,0,0.09)' }} />
                <span className="text-[12px]" style={{ color: 'rgba(15,10,30,0.35)' }}>or</span>
                <div className="h-px flex-1" style={{ background: 'rgba(0,0,0,0.09)' }} />
              </div>
              <GoogleSignInButton onSuccess={handleGoogleSuccess} label="Sign up with Google" />
            </div>
          )}

          <p className="mt-6 text-center text-[13px]" style={{ color: 'rgba(15,10,30,0.38)' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium transition-colors duration-150"
              style={{ color: '#7C3AED' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#5B21B6' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#7C3AED' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
