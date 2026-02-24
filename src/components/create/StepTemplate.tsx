'use client'

import { useState, useMemo } from 'react'
import { Template, WizardState } from '@/lib/types'
import { TEMPLATES } from '@/lib/data'
import { useLanguage } from '@/lib/context'
import { CheckCircle2, Clock, FileText } from 'lucide-react'

interface Props {
  state: WizardState
  onSelect: (template: Template) => void
}

export default function StepTemplate({ state, onSelect }: Props) {
  const { lang, tr } = useLanguage()
  const [activeFilter, setActiveFilter] = useState<string>('all')

  // Templates compatible with selected product type
  const compatible = useMemo(
    () => (!state.productType ? TEMPLATES : TEMPLATES.filter(t => t.productTypes.includes(state.productType!))),
    [state.productType]
  )

  // Unique purpose labels for filter pills
  const filterLabels = useMemo(() => {
    const seen = new Set<string>()
    const labels: { key: string; en: string; ar: string }[] = [
      { key: 'all', en: 'All', ar: 'الكل' },
    ]
    compatible.forEach(t => {
      if (!seen.has(t.purpose)) {
        seen.add(t.purpose)
        labels.push({ key: t.purpose, en: t.purpose, ar: t.purposeAr })
      }
    })
    return labels
  }, [compatible])

  // Apply filter
  const visible = useMemo(
    () => activeFilter === 'all' ? compatible : compatible.filter(t => t.purpose === activeFilter),
    [compatible, activeFilter]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">
          {lang === 'ar' ? 'اختر قالب الرسالة' : 'Choose Prompt Template'}
        </h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.create.selectTemplateSub}</p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {filterLabels.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              activeFilter === f.key
                ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                : 'bg-white text-content-secondary border-brand-purple/15 hover:border-brand-purple/40 hover:text-brand-purple'
            }`}
          >
            {lang === 'ar' ? f.ar : f.en}
          </button>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="text-center text-content-muted py-10">
          {lang === 'ar' ? 'لا توجد قوالب متاحة' : 'No templates available for this filter.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(template => {
            const isSelected = state.template?.id === template.id
            const name   = lang === 'ar' ? template.nameAr        : template.name
            const desc   = lang === 'ar' ? template.descriptionAr : template.description
            const script = lang === 'ar' ? template.sampleScriptAr : template.sampleScript
            const purposeLabel = lang === 'ar' ? template.purposeAr : template.purpose

            return (
              <div
                key={template.id}
                onClick={() => onSelect(template)}
                className={`relative rounded-2xl border p-5 cursor-pointer transition-all duration-300 flex flex-col gap-3 group ${
                  isSelected
                    ? 'border-brand-purple bg-surface-subtle'
                    : 'border-brand-purple/12 bg-white hover:border-brand-purple/40 hover:shadow-card-hover'
                }`}
                style={isSelected ? { boxShadow: '0 0 0 2px rgba(154,120,254,0.3), 0 4px 24px rgba(154,120,254,0.12)' } : undefined}
              >
                {/* Selected tick */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-5 h-5 text-brand-purple" fill="rgba(154,120,254,0.15)" />
                  </div>
                )}

                {/* Icon + name */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: isSelected ? 'rgba(154,120,254,0.12)' : 'rgba(154,120,254,0.06)' }}
                  >
                    <FileText className="w-4 h-4 text-brand-mid" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="font-bold text-content-primary text-sm leading-tight">{name}</h4>
                    <p className="text-content-muted text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>

                {/* Script preview */}
                <div className="p-3 rounded-xl bg-surface-subtle border border-brand-purple/10 flex-1">
                  <p className="text-xs text-content-muted font-medium mb-1">
                    {lang === 'ar' ? 'نموذج النص' : 'Sample Script'}
                  </p>
                  <p className="text-xs text-content-secondary italic leading-relaxed line-clamp-3">
                    &ldquo;{script}&rdquo;
                  </p>
                </div>

                {/* Footer: purpose label + duration */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-purple/8 text-brand-purple border border-brand-purple/15">
                    {purposeLabel}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-content-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{template.duration}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
