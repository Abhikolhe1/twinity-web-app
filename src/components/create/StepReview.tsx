'use client'

import { WizardState } from '@/lib/types'
import { CHANNELS, DURATIONS, INDUSTRY_LABELS } from '@/lib/data'
import { useProductTypes } from '@/lib/use-product-types'
import { useLanguage } from '@/lib/context'
import Badge from '@/components/ui/Badge'
import { Info, Sparkles, PencilLine, FileText, Mic, Gauge } from 'lucide-react'

const TTS_MODEL_LABELS: Record<string, { en: string; ar: string }> = {
  'eleven_v3':                  { en: 'Twinity Pro',      ar: 'Twinity Pro' },
  'eleven_multilingual_v2':     { en: 'Twinity Global',   ar: 'Twinity Global' },
  'eleven_multilingual_sts_v2': { en: 'Twinity Swap Pro', ar: 'Twinity Swap Pro' },
  'eleven_english_sts_v2':      { en: 'Twinity Swap',     ar: 'Twinity Swap' },
}

interface Props {
  state: WizardState
}

function calcPrice(state: WizardState) {
  if (!state.celebrity || !state.productType) return { min: 0, max: 0, base: 0, complexity: 0, channels: 0, total: 0 }
  const range = state.celebrity.priceRange[state.productType]
  const base = Math.round((range.min + range.max) / 2)
  const complexity = state.duration === '60s' ? Math.round(base * 0.15) : 0
  const channelsFee = state.channels.length > 2 ? Math.round(base * 0.1) : 0
  return { min: range.min, max: range.max, base, complexity, channels: channelsFee, total: base + complexity + channelsFee }
}

export default function StepReview({ state }: Props) {
  const { lang, tr } = useLanguage()
  const { productTypes } = useProductTypes()
  const price = calcPrice(state)
  const productType = productTypes.find(p => p.id === state.productType)
  const durationLabel = DURATIONS.find(d => d.id === state.duration)?.[lang === 'ar' ? 'ar' : 'en']

  const channelLabels = state.channels.map(cId => {
    const ch = CHANNELS.find(c => c.id === cId)
    return ch ? `${ch.icon} ${lang === 'ar' ? ch.ar : ch.en}` : cId
  })

  const displayScript = state.customScript || (lang === 'ar' ? state.template?.sampleScriptAr : state.template?.sampleScript)

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.review}</h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.create.reviewSub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-brand-purple/14 shadow-card">
          <h3 className="font-bold text-content-primary text-lg">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h3>

          {/* Celebrity */}
          {state.celebrity && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-brand-purple/12">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: state.celebrity.avatarColor }}
              >
                {state.celebrity.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-content-primary">
                  {lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name}
                </p>
                <p className="text-xs text-content-muted">
                  {INDUSTRY_LABELS[state.celebrity.industry]?.[lang]}
                </p>
              </div>
              <div className="ms-auto">
                <Badge variant="green" dot>{lang === 'ar' ? 'موثّق' : 'Verified'}</Badge>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <SummaryItem label={lang === 'ar' ? 'نوع الفيديو' : 'Video Type'} value={(lang === 'ar' ? productType?.nameAr : productType?.name) ?? '—'} />
            <SummaryItem label={lang === 'ar' ? 'القالب' : 'Template'} value={(lang === 'ar' ? state.template?.nameAr : state.template?.name) ?? '—'} />
            <SummaryItem label={lang === 'ar' ? 'المدة' : 'Duration'} value={durationLabel ?? '—'} />
            <SummaryItem label={lang === 'ar' ? 'نسبة العرض' : 'Aspect Ratio'} value={state.aspectRatio ?? '—'} />
            <SummaryItem label={lang === 'ar' ? 'الدقة' : 'Resolution'} value={state.resolution ?? '—'} />
            <SummaryItem label={lang === 'ar' ? 'لغة الفيديو' : 'Language'} value={state.language === 'ar' ? 'العربية' : 'English'} />
          </div>

          {/* Voice settings summary */}
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-subtle border border-brand-purple/12">
            <div className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-brand-purple" />
              <p className="text-xs font-bold text-content-muted uppercase tracking-wide">
                {lang === 'ar' ? 'إعدادات الصوت' : 'Voice Settings'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs text-content-muted">
                  {state.voiceChangeEnabled
                    ? (lang === 'ar' ? 'وضع' : 'Mode')
                    : (lang === 'ar' ? 'النموذج' : 'Model')}
                </p>
                <p className="text-sm font-medium text-content-primary">
                  {state.voiceChangeEnabled
                    ? (lang === 'ar' ? 'تغيير الصوت' : 'Voice Change')
                    : (TTS_MODEL_LABELS[state.voiceModel]?.[lang] ?? state.voiceModel)}
                </p>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs text-content-muted flex items-center gap-1">
                  <Gauge className="w-3 h-3" />
                  {lang === 'ar' ? 'السرعة' : 'Speed'}
                </p>
                <p className="text-sm font-medium text-content-primary">{state.voiceSpeed.toFixed(2)}×</p>
              </div>
            </div>
            {state.voiceChangeEnabled && (
              <p className="text-xs text-content-muted">
                {state.voiceChangeSourceUrl
                  ? (lang === 'ar' ? 'تم رفع الصوت المصدر' : 'Source audio uploaded')
                  : (lang === 'ar' ? 'لم يتم رفع الصوت المصدر بعد' : 'No source audio uploaded yet')}
              </p>
            )}
          </div>

          {channelLabels.length > 0 && (
            <div>
              <p className="text-xs text-content-muted font-medium mb-2">{lang === 'ar' ? 'قنوات التوزيع' : 'Distribution Channels'}</p>
              <div className="flex flex-wrap gap-1.5">
                {channelLabels.map((ch, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-lg bg-surface-subtle border border-brand-purple/12 text-content-secondary">{ch}</span>
                ))}
              </div>
            </div>
          )}

          {displayScript && (
            <div className="p-4 rounded-xl bg-surface-subtle border border-brand-purple/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-purple" />
                  <p className="text-xs font-bold text-content-muted uppercase tracking-wide">
                    {lang === 'ar' ? 'النص' : 'Script'}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white border border-brand-purple/14 text-content-muted">
                  {state.template
                    ? <><Sparkles className="w-2.5 h-2.5" />{lang === 'ar' ? 'قالب' : 'Template'}</>
                    : <><PencilLine className="w-2.5 h-2.5" />{lang === 'ar' ? 'مخصص' : 'Custom'}</>
                  }
                </span>
              </div>
              <p className={`text-xs leading-relaxed line-clamp-4 ${
                state.useCustomScript
                  ? 'text-content-secondary border-l-2 border-brand-purple/40 pl-2.5'
                  : 'text-content-secondary italic'
              }`}>
                {displayScript}
              </p>
            </div>
          )}
        </div>

        {/* Price Estimate */}
        <div
          className="flex flex-col gap-4 p-6 rounded-2xl border border-brand-purple/25"
          style={{ background: 'linear-gradient(145deg, #FAF7FF, #F3EEFF)' }}
        >
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-content-primary text-lg">{tr.create.priceEstimate}</h3>
            <div className="flex items-center gap-1 text-xs text-content-muted">
              <Info className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'تقدير مبدئي' : 'Estimate'}
            </div>
          </div>

          {/* Range */}
          <div
            className="p-4 rounded-xl text-center border border-brand-purple/20"
            style={{ background: 'linear-gradient(135deg, rgba(154,120,254,0.10), rgba(66,34,102,0.06))' }}
          >
            <p className="text-xs text-content-muted mb-1">{tr.create.priceRange}</p>
            <p className="text-3xl font-bold text-content-primary">
              ${price.min.toLocaleString()}
              <span className="text-lg text-content-muted font-normal mx-1">–</span>
              ${price.max.toLocaleString()}
            </p>
            <p className="text-xs text-brand-mid mt-1">USD</p>
          </div>

          {/* Breakdown */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-content-muted uppercase tracking-wider">{tr.create.breakdown}</p>
            <PriceLine label={tr.create.basePrice} value={price.base} />
            {price.complexity > 0 && <PriceLine label={tr.create.complexityFee} value={price.complexity} />}
            {price.channels > 0 && <PriceLine label={tr.create.channelFee} value={price.channels} />}
            <div className="h-px bg-brand-purple/12 my-1" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-content-primary">{tr.create.totalEstimate}</span>
              <span className="text-xl font-bold text-brand-purple">~${price.total.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-xs text-content-muted leading-relaxed border-t border-brand-purple/12 pt-3">
            {tr.create.priceNote}
          </p>
        </div>
      </div>

    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-content-muted">{label}</p>
      <p className="text-sm font-medium text-content-primary">{value}</p>
    </div>
  )
}

function PriceLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-content-secondary">{label}</span>
      <span className="text-content-primary font-medium">${value.toLocaleString()}</span>
    </div>
  )
}
