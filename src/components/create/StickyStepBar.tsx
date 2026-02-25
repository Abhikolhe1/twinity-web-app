'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useWizard } from '@/lib/wizard-context'
import { useLanguage } from '@/lib/context'
import { PRODUCT_TYPES } from '@/lib/data'

const SLUGS = ['product-type', 'celebrity', 'template', 'customize', 'review', 'book-call']
const BASE = '/create'

function stepFromPathname(pathname: string): number {
  const segment = pathname.split('/').pop() ?? ''
  const idx = SLUGS.indexOf(segment)
  return idx >= 0 ? idx + 1 : 0
}

export default function StickyStepBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { state } = useWizard()
  const { lang } = useLanguage()

  const step = stepFromPathname(pathname)
  if (step === 0) return null

  const canProceed =
    step === 1 ? !!state.productType :
    step === 2 ? !!state.celebrity :
    step === 3 ? !!state.template :
    true

  const alwaysShow = step >= 4
  if (!alwaysShow && !canProceed) return null

  const prevSlug = step > 1 ? SLUGS[step - 2] : null
  const nextSlug = step < 6 ? SLUGS[step] : null

  const handleBack = () => { if (prevSlug) router.push(`${BASE}/${prevSlug}`) }
  const handleNext = () => { if (nextSlug) router.push(`${BASE}/${nextSlug}`) }

  // Step 6: no sticky bar — form has its own Submit button
  if (step === 6) return null

  // Summary avatar / label for steps 1–5
  const pt = PRODUCT_TYPES.find(p => p.id === state.productType)
  let avatar: React.ReactNode = null
  let label = ''
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
    label    = lang === 'ar' ? 'تخصيص الفيديو' : 'Customize your video'
    sublabel = state.celebrity ? (lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name) : ''
  } else if (step === 5) {
    avatar   = <span className="text-2xl">📝</span>
    label    = lang === 'ar' ? 'مراجعة الطلب' : 'Review your order'
    sublabel = lang === 'ar' ? 'تحقق من التفاصيل قبل المتابعة' : 'Check details before continuing'
  }

  const nextLabel =
    step === 5 ? (lang === 'ar' ? 'تواصل معنا'     : 'Get in Touch') :
    step === 4 ? (lang === 'ar' ? 'تابع للتنزيل'   : 'Proceed to Download') :
                 (lang === 'ar' ? 'التالي'           : 'Continue')

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
            onClick={handleBack}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-content-secondary hover:text-brand-purple hover:bg-surface-subtle border border-brand-purple/15 transition-all shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'رجوع' : 'Back'}</span>
          </button>
        )}

        {/* Continue */}
        <Button size="sm" disabled={!canProceed} onClick={handleNext} iconEnd={<ChevronRight className="w-4 h-4" />}>
          {nextLabel}
        </Button>
      </div>
    </div>
  )
}
