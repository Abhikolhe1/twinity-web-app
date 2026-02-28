'use client'

import { useState, useMemo, useEffect } from 'react'
import { useDebounce } from '@/lib/hooks'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CelebrityCard from '@/components/ui/CelebrityCard'
import { useLanguage } from '@/lib/context'
import { INDUSTRY_LABELS } from '@/lib/data'
import { Industry, Celebrity } from '@/lib/types'
import { celebrityApi, mapApiCeleb } from '@/lib/api'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Link from 'next/link'

const INDUSTRIES: Industry[] = ['all', 'entertainment', 'sports', 'music', 'business', 'social-media', 'tv-film']

export default function CelebritiesPage() {
  const { lang, tr } = useLanguage()
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState<Industry>('all')
  const [selected, setSelected] = useState<Celebrity | null>(null)
  const [celebrities, setCelebrities] = useState<Celebrity[]>([])
  const [loading, setLoading] = useState(true)

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    const params: { industry?: string; search?: string } = {}
    if (industry && industry !== 'all') params.industry = industry
    if (debouncedSearch) params.search = debouncedSearch
    setLoading(true)
    celebrityApi.list(params)
      .then(res => setCelebrities((res.data || []).map(mapApiCeleb)))
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [industry, debouncedSearch])

  const filtered = useMemo(() => {
    return celebrities.filter(c => c.verified)
  }, [celebrities])

  const countFor = (ind: Industry) =>
    ind === 'all' ? celebrities.length : celebrities.filter(c => c.industry === ind).length

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[500px] h-[500px] opacity-15"
          style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', top: '-10%', right: '-5%' }} />
        <div className="orb w-72 h-72 opacity-8"
          style={{ background: 'radial-gradient(circle, #422266, transparent)', bottom: '10%', left: '-5%', animationDelay: '5s' }} />
      </div>

      <main className="flex-1 pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-content-primary">{tr.celebrities.title}</h1>
            <p className="mt-3 text-content-muted text-base max-w-xl mx-auto">{tr.celebrities.subtitle}</p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
              <input
                type="text"
                placeholder={tr.celebrities.search}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-brand-purple/20 rounded-xl pl-11 pr-10 py-3 text-content-primary placeholder-content-placeholder text-sm focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_3px_rgba(154,120,254,0.12)] transition-all shadow-card"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-brand-purple">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-brand-purple/20 text-sm text-content-secondary hover:text-brand-purple hover:border-brand-purple/40 transition-all shadow-card">
              <SlidersHorizontal className="w-4 h-4" />
              {lang === 'ar' ? 'فلتر' : 'Filter'}
            </button>
          </div>

          {/* Industry Tabs */}
          <div className="flex gap-2 flex-wrap mb-8">
            {INDUSTRIES.map(ind => {
              const label = INDUSTRY_LABELS[ind]?.[lang] ?? ind
              const count = countFor(ind)
              return (
                <button
                  key={ind}
                  onClick={() => setIndustry(ind)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border flex items-center gap-1.5 ${
                    industry === ind
                      ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/35 shadow-purple-sm'
                      : 'bg-white text-content-secondary border-brand-purple/12 hover:border-brand-purple/30 hover:text-brand-purple'
                  }`}
                >
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    industry === ind ? 'bg-brand-purple/20 text-brand-purple' : 'bg-surface-subtle text-content-muted'
                  }`}>
                    {loading ? '—' : count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-content-muted">
              {loading ? '—' : filtered.length} {lang === 'ar' ? 'مشهور' : 'celebrities'}
              {search && ` ${lang === 'ar' ? 'لـ' : 'for'} "${search}"`}
            </p>
            {selected && (
              <Link href="/create">
                <Button size="sm">
                  {lang === 'ar' ? 'إنشاء فيديو مع' : 'Create with'}{' '}
                  {lang === 'ar' ? selected.nameAr : selected.name}
                </Button>
              </Link>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-20 text-sm text-content-muted">
              {lang === 'ar' ? 'جار التحميل...' : 'Loading...'}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(c => (
                <CelebrityCard
                  key={c.id}
                  celebrity={c}
                  selected={selected?.id === c.id}
                  onSelect={cel => setSelected(prev => prev?.id === cel.id ? null : cel)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-content-secondary">{tr.celebrities.noResults}</h3>
              <button onClick={() => { setSearch(''); setIndustry('all') }} className="mt-4 text-sm text-brand-purple hover:underline">
                {lang === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Selection CTA */}
      {selected && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-auto z-50 animate-slide-up">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-purple border border-brand-purple/20">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: selected.avatarColor }}
            >
              {selected.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-content-primary">
                {lang === 'ar' ? selected.nameAr : selected.name}
              </p>
              <p className="text-xs text-content-muted">
                {lang === 'ar' ? 'تم الاختيار · ابدأ الإنشاء' : 'Selected · Start creating'}
              </p>
            </div>
            <Link href="/create">
              <Button size="sm">{lang === 'ar' ? 'إنشاء فيديو' : 'Create Video'}</Button>
            </Link>
            <button onClick={() => setSelected(null)} className="text-content-muted hover:text-brand-purple transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
