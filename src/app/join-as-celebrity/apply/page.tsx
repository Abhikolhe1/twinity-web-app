'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, ChevronDown, Loader2, Mail, RefreshCw, Upload } from 'lucide-react'
import { authApi, celebrityOnboardingApi } from '@/lib/api'

const INDUSTRIES = [
  'entertainment',
  'sports',
  'business',
  'music',
  'media',
  'fashion',
  'comedy',
  'food',
  'gaming',
  'fitness',
]

export default function CelebrityApplicationPage() {
  const router = useRouter()
  const licenseFileRef = useRef<HTMLInputElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    nationality: '',
    industry: INDUSTRIES[0],
    languages: [] as string[],
    bio: '',
    commercialLicenseNumber: '',
    commercialLicenseDocumentUrl: '',
  })
  const [masters, setMasters] = useState({ nationalities: [] as string[], languages: [] as string[] })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [mastersLoading, setMastersLoading] = useState(true)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpResent, setOtpResent] = useState(false)

  useEffect(() => {
    let cancelled = false
    celebrityOnboardingApi.getMasters()
      .then((res) => {
        if (cancelled) return
        setMasters({
          nationalities: Array.isArray(res.data.nationalities) ? res.data.nationalities : [],
          languages: Array.isArray(res.data.languages) ? res.data.languages : [],
        })
      })
      .catch(() => {
        if (cancelled) return
        setMasters({ nationalities: [], languages: [] })
      })
      .finally(() => {
        if (!cancelled) setMastersLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setLanguageMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function setField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function sanitizePhone(value: string) {
    return value.replace(/\D/g, '')
  }

  function isRestrictedCommercialMarket(nationality: string) {
    const normalized = nationality.trim().toLowerCase()
    return normalized === 'saudi arabia'
      || normalized === 'saudi'
      || normalized === 'uae'
      || normalized === 'united arab emirates'
  }

  function toggleLanguage(language: string) {
    setForm((current) => {
      const exists = current.languages.includes(language)
      return {
        ...current,
        languages: exists
          ? current.languages.filter((item) => item !== language)
          : [...current.languages, language],
      }
    })
  }

  async function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Could not read the selected license file.'))
      reader.readAsDataURL(file)
    })
  }

  async function handleLicenseFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setField('commercialLicenseDocumentUrl', dataUrl)
    } catch (err: any) {
      setError(err.message || 'Could not read the selected license file.')
    } finally {
      if (licenseFileRef.current) licenseFileRef.current.value = ''
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    setOtpResent(false)
    try {
      await authApi.sendOtp(form.email, 'email_verification')
      setStep('otp')
    } catch (err: any) {
      setError(err.message || 'Could not send verification code.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setOtpResent(false)
    try {
      await celebrityOnboardingApi.submit({
        name: form.name,
        email: form.email,
        otpCode: otp,
        phone: form.phone || undefined,
        region: form.region || undefined,
        nationality: form.nationality,
        industry: form.industry,
        languages: form.languages,
        bio: form.bio || undefined,
        commercialLicenseNumber: form.commercialLicenseNumber || undefined,
        commercialLicenseDocumentUrl: form.commercialLicenseDocumentUrl || undefined,
      })
      setSuccess('Application submitted successfully. Redirecting you back to the celebrity portal overview...')
      window.setTimeout(() => {
        router.push('/join-as-celebrity')
      }, 1800)
    } catch (err: any) {
      setError(err.message || 'Could not submit your application.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setError('')
    setSuccess('')
    setOtpResent(false)
    try {
      await authApi.sendOtp(form.email, 'email_verification')
      setOtp('')
      setOtpResent(true)
    } catch (err: any) {
      setError(err.message || 'Could not resend verification code.')
    } finally {
      setResending(false)
    }
  }

  const requiresCommercialLicense = isRestrictedCommercialMarket(form.nationality)

  return (
    <div className="min-h-screen bg-white px-4 py-12 text-[#0F0A1E] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1040px]">
        {step === 'form' ? (
          <>
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">Short Application</p>
              <h1 className="mt-3 text-[clamp(30px,4vw,46px)] font-bold tracking-[-0.04em]">Apply for celebrity portal access.</h1>
              <p className="mt-3 max-w-[620px] text-sm leading-7 text-[rgba(15,10,30,0.58)]">
                Start with the basics. We will review your request first, then ask you to complete the rest of your profile after approval and first login.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <section className="rounded-[28px] border border-[rgba(0,0,0,0.08)] bg-white p-6 shadow-[0_20px_56px_rgba(15,10,30,0.06)] sm:p-7">
                {error && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Field label="Full name">
                    <input value={form.name} onChange={(e) => setField('name', e.target.value)} className={inputCls} required />
                  </Field>
                  <Field label="Email">
                    <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} className={inputCls} required />
                  </Field>
                  <Field label="Phone number">
                    <input value={form.phone} onChange={(e) => setField('phone', sanitizePhone(e.target.value))} inputMode="numeric" className={inputCls} />
                  </Field>
                  <Field label="Region">
                    <input value={form.region} onChange={(e) => setField('region', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Nationality">
                    <select
                      value={form.nationality}
                      onChange={(e) => setField('nationality', e.target.value)}
                      className={inputCls}
                      disabled={mastersLoading}
                      required
                    >
                      <option value="">{mastersLoading ? 'Loading nationalities...' : 'Select nationality'}</option>
                      {masters.nationalities.map((nationality) => (
                        <option key={nationality} value={nationality}>
                          {nationality}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Industry">
                    <select value={form.industry} onChange={(e) => setField('industry', e.target.value)} className={inputCls} required>
                      {INDUSTRIES.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      If you are from <strong>UAE</strong> or <strong>Saudi Arabia</strong>, a license number or uploaded license is required for
                      commercial ads and campaigns. Without one, your profile can still be approved for <strong>greeting</strong> requests only.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4">
                  <Field label="Languages">
                    <div ref={languageMenuRef} className="relative">
                      <button
                        type="button"
                        onClick={() => !mastersLoading && setLanguageMenuOpen((current) => !current)}
                        className={`${inputCls} flex min-h-[50px] items-center justify-between gap-3 text-left ${mastersLoading ? 'opacity-60' : ''}`}
                        disabled={mastersLoading}
                      >
                        <span className={form.languages.length ? 'text-[#0F0A1E]' : 'text-[rgba(15,10,30,0.45)]'}>
                          {form.languages.length ? form.languages.join(', ') : mastersLoading ? 'Loading languages...' : 'Select languages'}
                        </span>
                        <ChevronDown size={16} className={`shrink-0 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {languageMenuOpen && (
                        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-64 overflow-auto rounded-2xl border border-[rgba(0,0,0,0.1)] bg-white p-2 shadow-[0_16px_40px_rgba(15,10,30,0.10)]">
                          {masters.languages.map((language) => {
                            const selected = form.languages.includes(language)
                            return (
                              <button
                                key={language}
                                type="button"
                                onClick={() => toggleLanguage(language)}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-all ${
                                  selected ? 'bg-[rgba(124,58,237,0.08)] text-[#7C3AED]' : 'text-[#0F0A1E] hover:bg-[rgba(124,58,237,0.05)]'
                                }`}
                              >
                                <span>{language}</span>
                                {selected && <Check size={15} />}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </Field>
                  <Field label="Short introduction">
                    <textarea
                      value={form.bio}
                      onChange={(e) => setField('bio', e.target.value)}
                      rows={5}
                      className={textareaCls}
                      placeholder="Tell us a little about yourself and the kind of presence you want to manage through the portal."
                    />
                  </Field>
                  {requiresCommercialLicense && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="License number">
                        <input
                          value={form.commercialLicenseNumber}
                          onChange={(e) => setField('commercialLicenseNumber', e.target.value)}
                          className={inputCls}
                          placeholder="Enter the Saudi/UAE license number"
                        />
                      </Field>
                      <Field label="Upload license">
                        <input
                          ref={licenseFileRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleLicenseFileChange}
                        />
                        <button
                          type="button"
                          onClick={() => licenseFileRef.current?.click()}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(0,0,0,0.1)] bg-white px-4 py-3 text-sm font-medium text-[rgba(15,10,30,0.72)]"
                        >
                          <Upload size={16} />
                          {form.commercialLicenseDocumentUrl ? 'Replace uploaded license' : 'Upload license image or PDF'}
                        </button>
                        {form.commercialLicenseDocumentUrl && (
                          <p className="mt-1.5 text-xs text-emerald-700">License file attached and ready to submit.</p>
                        )}
                      </Field>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}
                  >
                    {loading ? 'Sending code...' : 'Submit'}
                  </button>
                </div>
              </section>

              <section className="rounded-[28px] border border-[rgba(0,0,0,0.08)] bg-[#FAF8FF] p-6 shadow-[0_16px_40px_rgba(15,10,30,0.04)] sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">How It Works</p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">A guided path into the portal.</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <InfoRow
                    title="1. Initial review"
                    body="We review your submitted basics first to confirm fit and open the onboarding path."
                  />
                  <InfoRow
                    title="2. Profile completion"
                    body="After approval, we share credentials so you can log in and complete your full celebrity profile."
                  />
                  <InfoRow
                    title="3. Final activation"
                    body="Superadmin reviews the completed profile and activates your portal access once everything is ready."
                  />
                </div>
              </section>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/join-as-celebrity"
                  className="rounded-xl border border-[rgba(0,0,0,0.1)] px-5 py-3 text-sm font-medium text-[rgba(15,10,30,0.62)]"
                >
                  Back to overview
                </Link>
              </div>
            </form>
          </>
        ) : (
          <div className="mx-auto max-w-[540px] rounded-[28px] border border-[rgba(0,0,0,0.08)] bg-white p-6 shadow-[0_20px_56px_rgba(15,10,30,0.06)] sm:p-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(124,58,237,0.10)]">
                <Mail size={22} className="text-[#7C3AED]" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">Email Verification</p>
              <h1 className="mt-3 text-2xl font-bold tracking-[-0.03em]">Check your email.</h1>
              <p className="mt-2 text-sm leading-7 text-[rgba(15,10,30,0.58)]">
                We sent a 6-digit code to <strong className="text-[#0F0A1E]">{form.email}</strong>. Enter it below to finish your celebrity application.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}
              {otpResent && !success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  A new verification code has been sent to your email.
                </div>
              )}

              <Field label="Verification code">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={`${inputCls} text-center text-xl font-bold tracking-[0.28em]`}
                  placeholder="000000"
                  required
                />
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form')
                    setOtp('')
                    setError('')
                  }}
                  className="rounded-xl border border-[rgba(0,0,0,0.1)] px-5 py-3 text-sm font-medium text-[rgba(15,10,30,0.62)]"
                >
                  Back to form
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}
                >
                  {loading ? 'Submitting...' : 'Verify & submit'}
                </button>
              </div>
            </form>

            <div className="mt-5 flex items-center justify-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#7C3AED] disabled:opacity-60"
              >
                {resending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Resend code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(124,58,237,0.12)] bg-white px-4 py-4">
      <p className="text-sm font-semibold text-[#0F0A1E]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[rgba(15,10,30,0.58)]">{body}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[rgba(15,10,30,0.62)]">{label}</span>
      {children}
    </label>
  )
}

const inputCls = 'w-full rounded-2xl border border-[rgba(0,0,0,0.1)] bg-white px-4 py-3 text-sm text-[#0F0A1E] outline-none transition-all focus:border-[rgba(124,58,237,0.35)]'
const textareaCls = `${inputCls} resize-none`
