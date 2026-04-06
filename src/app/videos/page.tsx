'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/lib/context'
import { jobApi, type ApiVideoJob } from '@/lib/api'
import { ArrowLeft, Film } from 'lucide-react'
import VideoCard from '@/components/dashboard/VideoCard'

const FILTERS = [
  { id: 'all',         en: 'All',         ar: 'الكل' },
  { id: 'pending',     en: 'Pending',     ar: 'في الانتظار' },
  { id: 'in-progress', en: 'In Progress', ar: 'قيد التنفيذ' },
  { id: 'review',      en: 'In Review',   ar: 'قيد المراجعة' },
  { id: 'delivered',   en: 'Ready',       ar: 'جاهز' },
  { id: 'cancelled',   en: 'Cancelled',   ar: 'ملغي' },
  { id: 'failed',      en: 'Failed',      ar: 'فشل' },
]

const PAGE_SIZE = 12

function VideosContent() {
  const { lang, tr } = useLanguage()
  const labels = tr.dashboard.statusLabels as Record<string, string>
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get('f') ?? 'all'

  const [filter, setFilter]       = useState(initialFilter)
  const [jobs, setJobs]           = useState<ApiVideoJob[]>([])
  const [stats, setStats]         = useState<Record<string, number>>({ all: 0, pending: 0, 'in-progress': 0, review: 0, delivered: 0, cancelled: 0, failed: 0 })
  const [page, setPage]           = useState(1)
  const [hasMore, setHasMore]     = useState(false)
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // ── Fetch stats ─────────────────────────────────────────
  const fetchStats = useCallback(() => {
    jobApi.myStats()
      .then(res => setStats(res.data || {}))
      .catch(() => null)
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  // ── Fetch first page whenever filter changes ────────────
  useEffect(() => {
    setLoading(true)
    setJobs([])
    setPage(1)
    setHasMore(false)
    const status = filter !== 'all' ? filter : undefined
    jobApi.myJobs(status, 1, PAGE_SIZE)
      .then(res => {
        setJobs(res.data || [])
        setHasMore(res.hasMore ?? false)
        setPage(2)
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [filter])

  // ── Load next page ──────────────────────────────────────
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const status = filter !== 'all' ? filter : undefined
    jobApi.myJobs(status, page, PAGE_SIZE)
      .then(res => {
        setJobs(prev => [...prev, ...(res.data || [])])
        setHasMore(res.hasMore ?? false)
        setPage(p => p + 1)
      })
      .catch(() => null)
      .finally(() => setLoadingMore(false))
  }, [loadingMore, hasMore, filter, page])

  // ── IntersectionObserver on sentinel ───────────────────
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '200px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])


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
              {stats.all ?? 0} {lang === 'ar' ? 'فيديو إجمالاً' : 'total videos'}
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
          const isActive = filter === f.id
          const count = stats[f.id] ?? 0
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

      {/* Initial loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-brand-purple/10 overflow-hidden animate-pulse">
              <div className="w-full bg-surface-subtle" style={{ aspectRatio: '16/9' }} />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-3 bg-surface-subtle rounded w-3/4" />
                <div className="h-2.5 bg-surface-subtle rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && jobs.length === 0 && (
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
      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {jobs.map(order => (
            <VideoCard key={order._id} order={order} labels={labels} />
          ))}

          {/* Skeleton cards while loading more */}
          {loadingMore && Array.from({ length: 4 }).map((_, i) => (
            <div key={`sk-${i}`} className="rounded-2xl bg-white border border-brand-purple/10 overflow-hidden animate-pulse">
              <div className="w-full bg-surface-subtle" style={{ aspectRatio: '16/9' }} />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-3 bg-surface-subtle rounded w-3/4" />
                <div className="h-2.5 bg-surface-subtle rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sentinel for IntersectionObserver */}
      <div ref={sentinelRef} className="h-4" />

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
