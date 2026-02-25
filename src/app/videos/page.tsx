'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/lib/context'
import { MOCK_ORDERS } from '@/lib/data'
import { ArrowLeft, Film } from 'lucide-react'
import VideoCard from '@/components/dashboard/VideoCard'

const FILTERS = [
  { id: 'all',         en: 'All',         ar: 'الكل' },
  { id: 'pending',     en: 'Pending',     ar: 'في الانتظار' },
  { id: 'in-progress', en: 'In Progress', ar: 'قيد التنفيذ' },
  { id: 'review',      en: 'In Review',   ar: 'قيد المراجعة' },
  { id: 'delivered',   en: 'Ready',       ar: 'جاهز' },
]

function VideosContent() {
  const { lang, tr } = useLanguage()
  const labels = tr.dashboard.statusLabels as Record<string, string>
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get('f') ?? 'all'
  const [filter, setFilter] = useState(initialFilter)

  const filtered = filter === 'all'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter(o => o.status === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">

      {/* Back + Header */}
      <div>
        <Link href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-brand-purple transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-content-primary">
              {lang === 'ar' ? 'جميع الفيديوهات' : 'All Videos'}
            </h1>
            <p className="text-sm text-content-muted mt-1">
              {MOCK_ORDERS.length} {lang === 'ar' ? 'فيديو إجمالاً' : 'total videos'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-purple/8 border border-brand-purple/15 flex items-center justify-center">
            <Film className="w-5 h-5 text-brand-purple" />
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => {
          const count = f.id === 'all'
            ? MOCK_ORDERS.length
            : MOCK_ORDERS.filter(o => o.status === f.id).length
          const isActive = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-purple text-white shadow-sm'
                  : 'bg-white border border-brand-purple/15 text-content-secondary hover:border-brand-purple/35 hover:text-brand-purple'
              }`}
            >
              {lang === 'ar' ? f.ar : f.en}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-surface-subtle text-content-muted'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-white border border-brand-purple/10">
          <Film className="w-8 h-8 text-content-muted mx-auto mb-3" />
          <p className="font-semibold text-content-primary">
            {lang === 'ar' ? 'لا توجد نتائج' : 'No videos found'}
          </p>
          <p className="text-sm text-content-muted mt-1">
            {lang === 'ar' ? 'جرّب فلتراً مختلفاً' : 'Try a different filter'}
          </p>
        </div>
      )}

      {/* Video grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(order => (
            <VideoCard key={order.id} order={order} labels={labels} />
          ))}
        </div>
      )}

    </div>
  )
}

export default function VideosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 opacity-12"
          style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', top: '5%', right: '-5%' }} />
      </div>

      <main className="flex-1 pt-24 pb-16 relative z-10">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center text-content-muted text-sm">
            Loading…
          </div>
        }>
          <VideosContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
