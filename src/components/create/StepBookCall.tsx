'use client'

import { useState } from 'react'
import { WizardState } from '@/lib/types'
import { useLanguage } from '@/lib/context'
import { Input, TextArea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import VideoPreview from './VideoPreview'
import { ChevronLeft, Phone, Calendar, CheckCircle2, PlusCircle } from 'lucide-react'
import { PRODUCT_TYPES } from '@/lib/data'
import Link from 'next/link'

interface Props {
  state: WizardState
  onBack: () => void
  onReset: () => void
}

export default function StepBookCall({ state, onBack, onReset }: Props) {
  const { lang, tr } = useLanguage()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [preferredTime, setPreferredTime] = useState('morning')
  const [message, setMessage] = useState('')
  const [downloadClicked, setDownloadClicked] = useState(false)
  const orderRef = `TWN-${Date.now().toString().slice(-6)}`

  const productType = PRODUCT_TYPES.find(p => p.id === state.productType)
  const productName = lang === 'ar' ? productType?.nameAr : productType?.name
  const templateName = lang === 'ar' ? state.template?.nameAr : state.template?.name

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  /* ── Success screen ─────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 py-4 animate-fade-in">

        {/* ── Header ── */}
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-purple-sm"
            style={{ background: 'linear-gradient(135deg, rgba(154,120,254,0.18), rgba(66,34,102,0.10))' }}
          >
            <CheckCircle2 className="w-7 h-7 text-brand-purple" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.requestSent}</h2>
          <p className="mt-2 text-content-muted text-sm leading-relaxed max-w-md mx-auto">
            {tr.create.requestSentSub}
          </p>
        </div>

        {/* ── Order reference pill ── */}
        <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-white border border-brand-purple/18 shadow-card w-fit mx-auto">
          <span className="text-xs text-content-muted">{tr.create.orderRef}</span>
          <span className="text-sm font-bold text-brand-purple font-mono">{orderRef}</span>
        </div>

        {/* ── Video Preview (the main focus) ── */}
        <div className="rounded-2xl border border-brand-purple/20 overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #FAF7FF, #F3EEFF)' }}>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-brand-purple/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
              <span className="text-sm font-semibold text-content-primary">
                {lang === 'ar' ? 'معاينة الفيديو' : 'Video Preview'}
              </span>
            </div>
            {state.celebrity && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md overflow-hidden border border-brand-purple/20">
                  <img
                    src={state.celebrity.image}
                    alt={lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-content-muted">
                  {lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name}
                </span>
              </div>
            )}
          </div>
          <div className="p-4">
            <VideoPreview
              celebrity={state.celebrity}
              templateName={templateName ?? 'Custom Video'}
              productType={productName ?? 'Avatar Studio'}
              duration={state.duration ?? '30s'}
              onDownload={() => setDownloadClicked(true)}
              downloadClicked={downloadClicked}
              lang={lang}
            />
          </div>
        </div>

        {/* ── Bottom actions ── */}
        <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1">
            <Button variant="secondary" fullWidth>
              {lang === 'ar' ? 'لوحة التحكم' : 'My Dashboard'}
            </Button>
          </Link>
          <Button
            variant="ghost"
            fullWidth
            className="flex-1"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={onReset}
          >
            {tr.create.newVideo}
          </Button>
        </div>
      </div>
    )
  }

  /* ── Book Call form ─────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.bookCall}</h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.create.bookCallSub}</p>
      </div>

      <div className="max-w-lg mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="p-5 rounded-2xl bg-white border border-brand-purple/14 shadow-card flex flex-col gap-4">
            <h3 className="font-semibold text-content-primary">{tr.create.yourDetails}</h3>

            <Input
              label={tr.create.phone}
              type="tel"
              placeholder="+971 50 000 0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              icon={<Phone className="w-4 h-4" />}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-content-primary flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-content-muted" />
                {tr.create.preferredTime}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'morning',   label: tr.create.morning   },
                  { id: 'afternoon', label: tr.create.afternoon },
                  { id: 'evening',   label: tr.create.evening   },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPreferredTime(t.id)}
                    className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                      preferredTime === t.id
                        ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/40'
                        : 'bg-surface-subtle text-content-secondary border-brand-purple/12 hover:border-brand-purple/30'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <TextArea
              label={tr.create.message}
              placeholder={lang === 'ar' ? 'أي معلومات إضافية...' : 'Any additional info...'}
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Price reminder */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-subtle border border-brand-purple/18">
            <span className="text-sm text-content-secondary">
              {lang === 'ar' ? 'التكلفة التقديرية' : 'Estimated Cost'}
            </span>
            <span className="text-lg font-bold text-content-primary">
              {state.celebrity && state.productType
                ? `$${state.celebrity.priceRange[state.productType].min.toLocaleString()} – $${state.celebrity.priceRange[state.productType].max.toLocaleString()}`
                : '—'}
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onBack}
              icon={<ChevronLeft className="w-4 h-4" />}
              type="button"
            >
              {tr.create.back}
            </Button>
            <Button size="lg" fullWidth type="submit" loading={loading} icon={<Phone className="w-4 h-4" />}>
              {tr.create.submitRequest}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
