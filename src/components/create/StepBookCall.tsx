'use client'

import { useState } from 'react'
import { WizardState } from '@/lib/types'
import { useLanguage } from '@/lib/context'
import { Input, TextArea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ChevronLeft, Phone, Calendar, CheckCircle2, Download, PlusCircle, Sparkles } from 'lucide-react'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-8 text-center max-w-lg mx-auto py-8">
        {/* Success Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-purple"
          style={{ background: 'linear-gradient(135deg, rgba(154,120,254,0.15), rgba(66,34,102,0.1))' }}
        >
          <CheckCircle2 className="w-10 h-10 text-brand-purple" />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-content-primary">{tr.create.requestSent}</h2>
          <p className="mt-3 text-content-muted leading-relaxed">{tr.create.requestSentSub}</p>
        </div>

        {/* Order Reference */}
        <div className="w-full p-4 rounded-2xl bg-white border border-brand-purple/20 shadow-card">
          <p className="text-xs text-content-muted mb-1">{tr.create.orderRef}</p>
          <p className="text-xl font-bold text-brand-purple font-mono">{orderRef}</p>
        </div>

        {/* Download Section */}
        <div
          className="w-full p-5 rounded-2xl border border-brand-purple/25 flex flex-col gap-4"
          style={{ background: 'linear-gradient(145deg, #FAF7FF, #F3EEFF)' }}
        >
          <div className="flex items-center gap-2 text-brand-purple">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">{lang === 'ar' ? 'معاينة الفيديو' : 'Video Preview'}</span>
          </div>

          {/* Mock Video Player */}
          <div
            className="w-full aspect-video rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #EDE5FF, #D4C5FF)' }}
          >
            <div className="flex flex-col items-center gap-3 z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-purple"
                style={{ background: 'linear-gradient(135deg, #9a78fe, #422266)' }}
              >
                <div className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[18px] border-l-white ml-1" />
              </div>
              <p className="text-xs text-content-muted">
                {lang === 'ar' ? 'المعاينة متاحة بعد المكالمة' : 'Preview available after the call'}
              </p>
            </div>
            {state.celebrity && (
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center text-white"
                  style={{ background: state.celebrity.avatarColor }}
                >
                  {state.celebrity.initials}
                </div>
                <span className="text-xs text-content-secondary font-medium">
                  {lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-content-muted text-center">{tr.create.downloadReady}</p>

          <Button
            fullWidth
            variant={downloadClicked ? 'secondary' : 'primary'}
            icon={<Download className="w-4 h-4" />}
            onClick={() => setDownloadClicked(true)}
          >
            {downloadClicked ? (lang === 'ar' ? 'تم بدء التنزيل...' : 'Download started...') : tr.create.downloadBtn}
          </Button>
        </div>

        <div className="flex gap-3 w-full">
          <Link href="/dashboard" className="flex-1">
            <Button variant="secondary" fullWidth>{lang === 'ar' ? 'لوحة التحكم' : 'My Dashboard'}</Button>
          </Link>
          <Button variant="ghost" fullWidth className="flex-1" icon={<PlusCircle className="w-4 h-4" />} onClick={onReset}>
            {tr.create.newVideo}
          </Button>
        </div>
      </div>
    )
  }

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
                  { id: 'morning', label: tr.create.morning },
                  { id: 'afternoon', label: tr.create.afternoon },
                  { id: 'evening', label: tr.create.evening },
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
            <span className="text-sm text-content-secondary">{lang === 'ar' ? 'التكلفة التقديرية' : 'Estimated Cost'}</span>
            <span className="text-lg font-bold text-content-primary">
              {state.celebrity && state.productType
                ? `$${state.celebrity.priceRange[state.productType].min.toLocaleString()} – $${state.celebrity.priceRange[state.productType].max.toLocaleString()}`
                : '—'}
            </span>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onBack} icon={<ChevronLeft className="w-4 h-4" />} type="button">
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
