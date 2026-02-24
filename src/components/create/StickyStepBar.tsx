'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { WizardState } from '@/lib/types'
import { PRODUCT_TYPES } from '@/lib/data'

interface Props {
  step: number
  state: WizardState
  lang: string
  canProceed: boolean
  onNext: () => void
  onBack: () => void
}

export default function StickyStepBar({ step, state, lang, canProceed, onNext, onBack }: Props) {
  // Step 6 (Book Call) has its own submit flow
  if (step === 6) return null

  // Only show the card once something is selected (steps 1–3),
  // or always for steps 4–5 which have no mandatory pick
  const alwaysShow = step >= 4
  if (!alwaysShow && !canProceed) return null

  // ── Selection summary ────────────────────────────────────────────
  const pt = PRODUCT_TYPES.find(p => p.id === state.productType)

  let avatar: React.ReactNode = null
  let label    = ''
  let sublabel = ''

  if (step === 1 && pt) {
    avatar   = <span className="text-2xl">{pt.icon}</span>
    label    = lang === 'ar' ? pt.nameAr        : pt.name
    sublabel = lang === 'ar' ? pt.descriptionAr : pt.description
  } else if (step === 2 && state.celebrity) {
    const c = state.celebrity
    avatar = (
      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0" style={{ background: c.avatarColor }}>
        <img src={c.image} alt={c.name} className="w-full h-full object-cover object-top" />
      </div>
    )
    label    = lang === 'ar' ? c.nameAr        : c.name
    sublabel = lang === 'ar' ? c.nationalityAr : c.nationality
  } else if (step === 3 && state.template) {
    avatar   = <span className="text-2xl">📋</span>
    label    = lang === 'ar' ? state.template.nameAr    : state.template.name
    sublabel = lang === 'ar' ? state.template.purposeAr : state.template.purpose
  } else if (step === 4) {
    avatar   = <span className="text-2xl">✏️</span>
    label    = lang === 'ar' ? 'تخصيص الفيديو'     : 'Customize your video'
    sublabel = state.celebrity ? (lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name) : ''
  } else if (step === 5) {
    avatar   = <span className="text-2xl">📝</span>
    label    = lang === 'ar' ? 'مراجعة الطلب'     : 'Review your order'
    sublabel = lang === 'ar' ? 'تحقق من التفاصيل قبل المتابعة' : 'Check details before continuing'
  }

  const nextLabel =
    step === 5
      ? (lang === 'ar' ? 'احجز مكالمة' : 'Book a Call')
      : (lang === 'ar' ? 'التالي'       : 'Continue')

  return (
    <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-auto z-50 animate-slide-up">
      <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-4 border border-brand-purple/20"
        style={{ boxShadow: '0 4px 32px rgba(154,120,254,0.18), 0 1px 8px rgba(0,0,0,0.06)' }}>

        {/* Avatar / icon */}
        <div className="w-10 h-10 rounded-xl bg-surface-subtle flex items-center justify-center shrink-0 overflow-hidden">
          {avatar}
        </div>

        {/* Label */}
        <div className="min-w-0 sm:min-w-[160px]">
          <p className="text-sm font-semibold text-content-primary truncate leading-tight">{label}</p>
          {sublabel && (
            <p className="text-xs text-content-muted truncate leading-tight mt-0.5">{sublabel}</p>
          )}
        </div>

        {/* Back */}
        {step > 1 && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-content-secondary hover:text-brand-purple hover:bg-surface-subtle border border-brand-purple/15 transition-all shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'رجوع' : 'Back'}</span>
          </button>
        )}

        {/* Continue */}
        <Button size="sm" disabled={!canProceed} onClick={onNext} iconEnd={<ChevronRight className="w-4 h-4" />}>
          {nextLabel}
        </Button>
      </div>
    </div>
  )
}
