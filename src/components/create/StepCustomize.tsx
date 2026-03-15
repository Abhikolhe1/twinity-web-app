'use client'

import { useState } from 'react'
import { WizardState, Duration, AspectRatio, Resolution } from '@/lib/types'
import { DURATIONS, ASPECT_RATIOS, RESOLUTIONS, PRODUCT_TYPES } from '@/lib/data'
import { useLanguage } from '@/lib/context'
import { TextArea } from '@/components/ui/Input'
import { ToggleLeft, ToggleRight, Sparkles, ChevronDown } from 'lucide-react'
import VideoPreview from './VideoPreview'
import Button from '@/components/ui/Button'

interface Props {
  state: WizardState
  onChange: (updates: Partial<WizardState>) => void
}

export default function StepCustomize({ state, onChange }: Props) {
  const { lang, tr } = useLanguage()
  const [generationKey, setGenerationKey] = useState(0)

  const templateScript = state.template
    ? lang === 'ar' ? state.template.sampleScriptAr : state.template.sampleScript
    : ''

  const selectCls = 'w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm font-medium bg-white border border-brand-purple/15 text-content-primary focus:outline-none focus:border-brand-purple/50 focus:ring-2 focus:ring-brand-purple/10 transition-all cursor-pointer'

  const productType = PRODUCT_TYPES.find(p => p.id === state.productType)
  const productName = lang === 'ar' ? productType?.nameAr : productType?.name
  const templateName = lang === 'ar' ? state.template?.nameAr : state.template?.name

  let videoUrl = '/video/MohammedAbdu.mp4'
  if (state.celebrity?.name === 'Nasser Al Qasabi') {
    videoUrl = '/video/NasserAlQasabi.mp4'
  }
  if (state.celebrity?.name === 'Mohamed Salah') {
    videoUrl = '/video/MohamedSalah.mp4'
  }
  if (state.celebrity?.name === 'Mohamed Salah') {
    videoUrl = '/video/MohamedSalah.mp4'
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.customize}</h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.create.customizeSub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">

        {/* ── Left column: all options + Generate ── */}
        <div className="flex flex-col gap-5">

          {/* Script */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-content-primary">{tr.create.script}</label>
              <button
                onClick={() =>
                  onChange({ useCustomScript: !state.useCustomScript, customScript: state.useCustomScript ? '' : templateScript })
                }
                className="flex items-center gap-1.5 text-xs text-content-muted hover:text-brand-purple transition-colors"
              >
                {state.useCustomScript
                  ? <ToggleRight className="w-4 h-4 text-brand-purple" />
                  : <ToggleLeft className="w-4 h-4" />}
                {tr.create.useCustomScript}
              </button>
            </div>

            {state.useCustomScript ? (
              <TextArea
                value={state.customScript}
                onChange={e => onChange({ customScript: e.target.value })}
                placeholder={tr.create.scriptPlaceholder}
                rows={5}
              />
            ) : (
              <div className="p-4 rounded-xl bg-surface-subtle border border-brand-purple/15">
                <p className="text-xs text-content-muted mb-2">
                  {lang === 'ar' ? 'نص القالب (انقر للتعديل)' : 'Template script (click to customize)'}
                </p>
                <p className="text-sm text-content-secondary italic leading-relaxed">
                  &ldquo;{templateScript}&rdquo;
                </p>
                <button
                  onClick={() => onChange({ useCustomScript: true, customScript: templateScript })}
                  className="mt-3 text-xs text-brand-purple hover:underline"
                >
                  {lang === 'ar' ? 'تعديل النص' : 'Edit this script'}
                </button>
              </div>
            )}
          </div>

          {/* Duration / Aspect Ratio / Resolution / Language — 2×2 grid of dropdowns */}
          <div className="grid grid-cols-2 gap-4">

            {/* Duration */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-content-muted">{tr.create.duration}</label>
              <div className="relative">
                <select
                  value={state.duration ?? ''}
                  onChange={e => onChange({ duration: e.target.value as Duration })}
                  className={selectCls}
                >
                  <option value="" disabled>{lang === 'ar' ? 'اختر' : 'Select'}</option>
                  {DURATIONS.map(d => (
                    <option key={d.id} value={d.id}>{d.id} — {lang === 'ar' ? d.ar : d.en}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-content-muted">
                {lang === 'ar' ? 'نسبة العرض' : 'Aspect Ratio'}
              </label>
              <div className="relative">
                <select
                  value={state.aspectRatio ?? ''}
                  onChange={e => onChange({ aspectRatio: e.target.value as AspectRatio })}
                  className={selectCls}
                >
                  <option value="" disabled>{lang === 'ar' ? 'اختر' : 'Select'}</option>
                  {ASPECT_RATIOS.map(ar => (
                    <option key={ar.id} value={ar.id}>{ar.label} — {lang === 'ar' ? ar.hintAr : ar.hint}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
              </div>
            </div>

            {/* Resolution */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-content-muted">
                {lang === 'ar' ? 'الدقة' : 'Resolution'}
              </label>
              <div className="relative">
                <select
                  value={state.resolution ?? ''}
                  onChange={e => onChange({ resolution: e.target.value as Resolution })}
                  className={selectCls}
                >
                  <option value="" disabled>{lang === 'ar' ? 'اختر' : 'Select'}</option>
                  {RESOLUTIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label} — {lang === 'ar' ? r.hintAr : r.hint}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
              </div>
            </div>

            {/* Video Language */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-content-muted">{tr.create.language}</label>
              <div className="relative">
                <select
                  value={state.language}
                  onChange={e => onChange({ language: e.target.value as 'en' | 'ar' })}
                  className={selectCls}
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="ar">🇸🇦 العربية</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
              </div>
            </div>

          </div>

          {/* Generate button */}
          <Button
            fullWidth
            size="lg"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => setGenerationKey(k => k + 1)}
          >
            {lang === 'ar' ? 'توليد المعاينة' : 'Generate Preview'}
          </Button>

        </div>

        {/* ── Right column: Video Preview (sticky) ── */}
        <div className="sticky top-28">
          <div className="rounded-2xl border border-brand-purple/20 overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #FAF7FF, #F3EEFF)' }}>
            <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-brand-purple/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
                <span className="text-sm font-semibold text-content-primary">
                  {lang === 'ar' ? 'معاينة' : 'Preview'}
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
                key={generationKey}
                celebrity={state.celebrity}
                templateName={templateName ?? 'Custom Video'}
                productType={productName ?? 'Avatar Studio'}
                duration={state.duration ?? '30s'}
                lang={lang}
                videoUrl={videoUrl}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
