'use client'

import { useMemo } from 'react'
import { Template, WizardState } from '@/lib/types'
import { TEMPLATES } from '@/lib/data'
import { useLanguage } from '@/lib/context'
import Button from '@/components/ui/Button'
import { CheckCircle2, Clock, FileText } from 'lucide-react'

interface Props {
  state: WizardState
  onSelect: (template: Template) => void
  onNext: () => void
  onBack: () => void
}

export default function StepTemplate({ state, onSelect, onNext, onBack }: Props) {
  const { lang, tr } = useLanguage()

  const filtered = useMemo(
    () => (!state.productType ? TEMPLATES : TEMPLATES.filter(t => t.productTypes.includes(state.productType!))),
    [state.productType]
  )

  const grouped = useMemo(() => {
    const map: Record<string, Template[]> = {}
    filtered.forEach(t => {
      const key = lang === 'ar' ? t.purposeAr : t.purpose
      if (!map[key]) map[key] = []
      map[key].push(t)
    })
    return map
  }, [filtered, lang])

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.selectTemplate}</h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.create.selectTemplateSub}</p>
      </div>

      <div className="flex flex-col gap-8">
        {Object.entries(grouped).map(([purpose, templates]) => (
          <div key={purpose}>
            <h3 className="text-xs font-bold text-content-muted uppercase tracking-widest mb-3 px-1">{purpose}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map(template => {
                const isSelected = state.template?.id === template.id
                const name   = lang === 'ar' ? template.nameAr   : template.name
                const desc   = lang === 'ar' ? template.descriptionAr : template.description
                const script = lang === 'ar' ? template.sampleScriptAr : template.sampleScript

                return (
                  <div
                    key={template.id}
                    onClick={() => onSelect(template)}
                    className={`relative rounded-2xl border p-5 cursor-pointer transition-all duration-300 flex flex-col gap-3 group ${
                      isSelected
                        ? 'border-brand-purple bg-surface-subtle shadow-purple'
                        : 'border-brand-purple/12 bg-white hover:border-brand-purple/40 hover:shadow-card-hover'
                    }`}
                    style={isSelected ? { boxShadow: '0 0 0 2px rgba(154,120,254,0.3), 0 4px 24px rgba(154,120,254,0.12)' } : undefined}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle2 className="w-5 h-5 text-brand-purple" fill="rgba(154,120,254,0.15)" />
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: isSelected ? 'rgba(154,120,254,0.12)' : 'rgba(154,120,254,0.06)' }}
                      >
                        <FileText className="w-4 h-4 text-brand-mid" />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className="font-bold text-content-primary text-sm">{name}</h4>
                        <p className="text-content-muted text-xs mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>

                    {/* Script Preview */}
                    <div className="p-3 rounded-xl bg-surface-subtle border border-brand-purple/10">
                      <p className="text-xs text-content-muted font-medium mb-1">
                        {lang === 'ar' ? 'نموذج النص' : 'Sample Script'}
                      </p>
                      <p className="text-xs text-content-secondary italic leading-relaxed line-clamp-3">
                        &ldquo;{script}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-content-muted">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{template.duration} · {template.tags.join(' · ')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
