'use client'

import { ProductTypeId, WizardState } from '@/lib/types'
import { PRODUCT_TYPES } from '@/lib/data'
import { useLanguage } from '@/lib/context'
import { CheckCircle2, Clock } from 'lucide-react'

interface Props {
  state: WizardState
  onSelect: (id: ProductTypeId) => void
}

export default function StepProductType({ state, onSelect }: Props) {
  const { lang, tr } = useLanguage()

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.selectProductType}</h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.create.selectProductTypeSub}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRODUCT_TYPES.map(pt => {
          const isComingSoon = pt.id === 'avatar-studio' || pt.id === 'full-body'
          const isSelected   = state.productType === pt.id
          const name         = lang === 'ar' ? pt.nameAr        : pt.name
          const desc         = lang === 'ar' ? pt.descriptionAr : pt.description
          const detail       = lang === 'ar' ? pt.detailAr      : pt.detail
          const duration     = lang === 'ar' ? pt.durationAr    : pt.duration
          const useCases     = lang === 'ar' ? pt.useCasesAr    : pt.useCases

          return (
            <div
              key={pt.id}
              onClick={() => !isComingSoon && onSelect(pt.id)}
              className={`relative rounded-2xl border p-6 transition-all duration-300 flex flex-col gap-4 group ${
                isComingSoon
                  ? 'border-brand-purple/10 bg-white/60 cursor-not-allowed'
                  : isSelected
                    ? 'border-brand-purple bg-surface-subtle shadow-purple cursor-pointer'
                    : 'border-brand-purple/12 bg-white hover:border-brand-purple/40 hover:shadow-card-hover cursor-pointer'
              }`}
              style={isSelected && !isComingSoon ? { boxShadow: '0 0 0 2px rgba(154,120,254,0.3), 0 4px 24px rgba(154,120,254,0.12)' } : undefined}
            >
              {/* Coming Soon badge */}
              {isComingSoon && (
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    {lang === 'ar' ? 'قريباً' : 'Coming Soon'}
                  </span>
                </div>
              )}

              {isSelected && !isComingSoon && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-5 h-5 text-brand-purple" fill="rgba(154,120,254,0.15)" />
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all ${
                  isSelected ? 'shadow-purple-sm' : 'group-hover:scale-105'
                }`}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(154,120,254,0.18), rgba(66,34,102,0.12))'
                    : 'rgba(154,120,254,0.06)',
                }}
              >
                {pt.icon}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-content-primary text-lg leading-tight">{name}</h3>
                <p className="text-brand-mid text-sm font-medium mt-0.5">{desc}</p>
                <p className="text-content-muted text-sm mt-2 leading-relaxed">{detail}</p>
              </div>

              {/* Use Cases */}
              <div className="flex flex-wrap gap-1.5">
                {useCases.map(uc => (
                  <span key={uc} className="text-xs px-2 py-1 rounded-lg bg-surface-subtle text-content-secondary border border-brand-purple/12">
                    {uc}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-brand-purple/10">
                <div>
                  <p className="text-xs text-content-muted">{lang === 'ar' ? 'يبدأ من' : 'Starting from'}</p>
                  <p className="text-lg font-bold text-content-primary">
                    ${pt.priceFrom.toLocaleString()}
                    <span className="text-xs text-content-muted font-normal ml-1">
                      {lang === 'ar' ? '/ فيديو' : '/ video'}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-content-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{duration.split(' ').slice(0, 2).join(' ')}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
