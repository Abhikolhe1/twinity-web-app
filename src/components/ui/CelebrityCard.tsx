'use client'

import { Celebrity, ProductTypeId } from '@/lib/types'
import { CheckCircle2, Star } from 'lucide-react'
import { useLanguage } from '@/lib/context'
import { INDUSTRY_LABELS } from '@/lib/data'

interface CelebrityCardProps {
  celebrity: Celebrity
  selected?: boolean
  selectedProductType?: ProductTypeId | null
  onSelect?: (celebrity: Celebrity) => void
  compact?: boolean
}

export default function CelebrityCard({
  celebrity,
  selected = false,
  selectedProductType,
  onSelect,
  compact = false,
}: CelebrityCardProps) {
  const { lang, tr } = useLanguage()
  const name = lang === 'ar' ? celebrity.nameAr : celebrity.name
  const nationalityLabel = lang === 'ar' ? celebrity.nationalityAr : celebrity.nationality
  const industryLabel = INDUSTRY_LABELS[celebrity.industry]?.[lang] ?? celebrity.industry

  const priceKey = selectedProductType ?? 'greeting'
  const range = celebrity.priceRange[priceKey] ?? celebrity.priceRange.greeting

  return (
    <div
      onClick={() => onSelect?.(celebrity)}
      className={`relative rounded-2xl border transition-all duration-300 cursor-pointer group ${
        compact ? 'p-3' : 'p-4'
      } ${
        selected
          ? 'border-brand-purple bg-surface-subtle shadow-purple'
          : 'border-brand-purple/12 bg-white hover:border-brand-purple/40 hover:shadow-card-hover'
      }`}
      style={selected ? { boxShadow: '0 0 0 2px rgba(154,120,254,0.3), 0 4px 20px rgba(154,120,254,0.12)' } : undefined}
    >
      {/* Selected Checkmark */}
      {selected && (
        <div className="absolute top-3 right-3 z-10">
          <CheckCircle2 className="w-5 h-5 text-brand-purple" fill="rgba(154,120,254,0.15)" />
        </div>
      )}

      <div className={`flex ${compact ? 'gap-3' : 'flex-col gap-3'}`}>
        {/* Avatar */}
        {compact ? (
          <div
            className="shrink-0 w-12 h-12 rounded-xl overflow-hidden"
            style={{ background: celebrity.avatarColor }}
          >
            <img
              src={celebrity.image}
              alt={name}
              className="w-full h-full object-cover object-top"
            />
          </div>
        ) : (
          /* Full-bleed portrait — no border, fills card width */
          <div
            className="w-full rounded-xl overflow-hidden"
            style={{ aspectRatio: '4/5', background: celebrity.avatarColor }}
          >
            <img
              src={celebrity.image}
              alt={name}
              className="w-full h-full object-cover object-top"
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5 flex-wrap">
            <p className={`font-bold text-content-primary truncate ${compact ? 'text-sm' : 'text-base'}`}>
              {name}
            </p>
            {celebrity.verified && (
              <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" />
            )}
          </div>

          <p className={`text-content-muted mt-0.5 ${compact ? 'text-xs' : 'text-sm'}`}>
            {industryLabel}
            {!compact && ` · ${nationalityLabel}`}
          </p>

          {!compact && (
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-content-muted">{tr.celebrities.priceFrom}</p>
                <p className="text-sm font-bold text-brand-purple">
                  ${range.min.toLocaleString()}
                  <span className="font-normal text-content-muted text-xs"> – ${range.max.toLocaleString()}</span>
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onSelect?.(celebrity) }}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  selected
                    ? 'bg-brand-purple text-white'
                    : 'bg-surface-subtle text-brand-purple hover:bg-surface-elevated border border-brand-purple/25'
                }`}
              >
                {selected ? tr.celebrities.selected : tr.celebrities.selectBtn}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
