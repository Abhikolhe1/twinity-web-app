'use client'

import { useState, useMemo } from 'react'
import { Celebrity, Industry, WizardState } from '@/lib/types'
import { CELEBRITIES, INDUSTRY_LABELS } from '@/lib/data'
import { useLanguage } from '@/lib/context'
import CelebrityCard from '@/components/ui/CelebrityCard'
import Button from '@/components/ui/Button'
import { Search, X } from 'lucide-react'

const INDUSTRIES: Industry[] = ['all', 'entertainment', 'sports', 'music', 'business', 'social-media', 'tv-film']

interface Props {
  state: WizardState
  onSelect: (celebrity: Celebrity) => void
  onNext: () => void
  onBack: () => void
}

export default function StepCelebrity({ state, onSelect, onNext, onBack }: Props) {
  const { lang, tr } = useLanguage()
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState<Industry>('all')

  const filtered = useMemo(() => {
    return CELEBRITIES.filter(c => {
      const name = lang === 'ar' ? c.nameAr : c.name
      const matchSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase())
      const matchIndustry = industry === 'all' || c.industry === industry
      return matchSearch && matchIndustry
    })
  }, [search, industry, lang])

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.celebrities.title}</h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.celebrities.subtitle}</p>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
          <input
            type="text"
            placeholder={tr.celebrities.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-brand-purple/20 rounded-xl pl-10 pr-10 py-3 text-content-primary placeholder-content-placeholder text-sm focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_3px_rgba(154,120,254,0.12)] transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-brand-purple">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Industry Filter */}
        <div className="flex gap-2 flex-wrap">
          {INDUSTRIES.map(ind => {
            const label = INDUSTRY_LABELS[ind]?.[lang] ?? ind
            return (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  industry === ind
                    ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/35'
                    : 'bg-white text-content-muted border-brand-purple/12 hover:border-brand-purple/30 hover:text-brand-purple'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Banner */}
      {state.celebrity && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-brand-purple/25">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: state.celebrity.avatarColor }}
          >
            {state.celebrity.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-content-primary">
              {lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name}
            </p>
            <p className="text-xs text-content-muted">
              {INDUSTRY_LABELS[state.celebrity.industry]?.[lang]}
            </p>
          </div>
          <span className="text-xs font-medium text-brand-purple bg-brand-purple/10 px-2 py-1 rounded-lg">
            {tr.celebrities.selected}
          </span>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(c => (
            <CelebrityCard
              key={c.id}
              celebrity={c}
              selected={state.celebrity?.id === c.id}
              selectedProductType={state.productType}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-content-muted">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">{tr.celebrities.noResults}</p>
        </div>
      )}

    </div>
  )
}
