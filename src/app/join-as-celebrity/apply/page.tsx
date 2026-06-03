'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import { celebrityOnboardingApi } from '@/lib/api'

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
  const [error, setError] = useState('')

  function setField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function sanitizePhone(value: string) {
    return value.replace(/\D/g, '')
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
      router.push('/join-as-celebrity')
    } catch (err: any) {
      setError(err.message || 'Could not submit your application.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white px-4 py-12 text-[#0F0A1E] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1040px]">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">Short Application</p>
          <h1 className="mt-3 text-[clamp(30px,4vw,46px)] font-bold tracking-[-0.04em]">Apply for celebrity portal access.</h1>
          <p className="mt-3 max-w-[620px] text-sm leading-7 text-[rgba(15,10,30,0.58)]">
            Start with the basics. We will review your request first, then ask you to complete the rest of your profile after approval and first login.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
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
                <input value={form.nationality} onChange={(e) => setField('nationality', e.target.value)} className={inputCls} required />
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/join-as-celebrity"
              className="rounded-xl border border-[rgba(0,0,0,0.1)] px-5 py-3 text-sm font-medium text-[rgba(15,10,30,0.62)]"
            >
              Back to overview
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}
            >
              {loading ? 'Submitting...' : 'Submit application'}
            </button>
          </div>
        </form>
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
