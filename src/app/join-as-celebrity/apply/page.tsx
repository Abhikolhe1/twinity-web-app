'use client'

import Link from 'next/link'
import { type ReactNode, useState } from 'react'
import { ADMIN_PORTAL_URL, celebrityOnboardingApi } from '@/lib/api'

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
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    nationality: '',
    industry: INDUSTRIES[0],
    languages: '',
    bio: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function setField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await celebrityOnboardingApi.submit({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        region: form.region || undefined,
        nationality: form.nationality,
        industry: form.industry,
        languages: form.languages.split(',').map((item) => item.trim()).filter(Boolean),
        bio: form.bio || undefined,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Could not submit your application.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white px-6 py-16 text-[#0F0A1E] md:px-10">
        <div className="mx-auto max-w-[700px] rounded-[32px] border border-[rgba(124,58,237,0.16)] bg-[#F8F7FF] p-10 text-center shadow-[0_24px_60px_rgba(124,58,237,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">Application Received</p>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em]">We’ve received your celebrity portal request.</h1>
          <p className="mt-4 text-sm leading-7 text-[rgba(15,10,30,0.58)]">
            Our super-admin team will review your application. Once approved, we’ll send your portal URL, email, and temporary password to the address you submitted.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/join-as-celebrity"
              className="rounded-xl border border-[rgba(0,0,0,0.1)] px-5 py-3 text-sm font-medium text-[rgba(15,10,30,0.62)]"
            >
              Back to overview
            </Link>
            <a
              href={`${ADMIN_PORTAL_URL}/celebrity-login`}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}
            >
              Go to portal sign in
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-14 text-[#0F0A1E] md:px-10">
      <div className="mx-auto max-w-[860px]">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">Short Application</p>
          <h1 className="mt-3 text-[clamp(30px,4vw,46px)] font-bold tracking-[-0.04em]">Apply for celebrity portal access.</h1>
          <p className="mt-3 max-w-[620px] text-sm leading-7 text-[rgba(15,10,30,0.58)]">
            Start with the basics. We’ll review your request first, then ask you to complete the rest of your profile after approval and first login.
          </p>
        </div>

        <form onSubmit={submit} className="rounded-[32px] border border-[rgba(0,0,0,0.08)] bg-white p-7 shadow-[0_20px_56px_rgba(15,10,30,0.06)]">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input value={form.name} onChange={(e) => setField('name', e.target.value)} className={inputCls} required />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} className={inputCls} required />
            </Field>
            <Field label="Phone number">
              <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Region">
              <input value={form.region} onChange={(e) => setField('region', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Nationality">
              <input value={form.nationality} onChange={(e) => setField('nationality', e.target.value)} className={inputCls} required />
            </Field>
            <Field label="Industry">
              <select value={form.industry} onChange={(e) => setField('industry', e.target.value)} className={inputCls} required>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-4 grid gap-4">
            <Field label="Languages">
              <input
                value={form.languages}
                onChange={(e) => setField('languages', e.target.value)}
                className={inputCls}
                placeholder="Arabic, English"
              />
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
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs leading-6 text-[rgba(15,10,30,0.42)]">
              Already approved? Use the celebrity portal sign-in and the forgot password option if you need to reset your credentials.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`${ADMIN_PORTAL_URL}/celebrity-login`}
                className="rounded-xl border border-[rgba(0,0,0,0.1)] px-5 py-3 text-sm font-medium text-[rgba(15,10,30,0.62)]"
              >
                Already registered? Sign in
              </a>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}
              >
                {loading ? 'Submitting...' : 'Submit application'}
              </button>
            </div>
          </div>
        </form>
      </div>
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
