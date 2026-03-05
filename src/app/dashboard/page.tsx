'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import { useLanguage } from '@/lib/context'
import { jobApi, type ApiVideoJob } from '@/lib/api'
import { PlusCircle, Clock, Download, ArrowRight, Film } from 'lucide-react'
import VideoCard from '@/components/dashboard/VideoCard'

export default function DashboardPage() {
  const { lang, tr } = useLanguage()
  const router = useRouter()
  const labels = tr.dashboard.statusLabels as Record<string, string>
  const [jobs, setJobs] = useState<ApiVideoJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobApi.myJobs()
      .then(res => setJobs(res.data || []))
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  const pendingOrders = jobs.filter(o => o.status !== 'delivered')
  const downloads = jobs.filter(o => o.status === 'delivered')
  const recent = [...jobs]

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 opacity-12"
          style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', top: '5%', right: '-5%' }} />
      </div>

      <main className="flex-1 pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-content-muted text-sm">{tr.dashboard.welcome}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-content-primary mt-0.5">
                {lang === 'ar' ? 'مقاطعي' : 'My Videos'}
              </h1>
            </div>
            <Link href="/create">
              <Button icon={<PlusCircle className="w-4 h-4" />}>{tr.dashboard.createNew}</Button>
            </Link>
          </div>

          {/* Nav cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/videos">
              <div className="group p-5 rounded-2xl bg-white border border-brand-purple/15 hover:border-brand-purple/35 hover:shadow-card-hover transition-all cursor-pointer flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-purple/8 border border-brand-purple/15 flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5 text-brand-purple" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-content-primary">{tr.dashboard.allVideos}</p>
                  <p className="text-xs text-content-muted mt-0.5">
                    {loading ? '—' : jobs.length} {lang === 'ar' ? 'فيديو إجمالاً' : 'total videos'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-brand-purple transition-colors shrink-0" />
              </div>
            </Link>

            <Link href="/videos?f=pending">
              <div className="group p-5 rounded-2xl bg-white border border-brand-purple/15 hover:border-brand-purple/35 hover:shadow-card-hover transition-all cursor-pointer flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-content-primary">{tr.dashboard.pendingOrders}</p>
                  <p className="text-xs text-content-muted mt-0.5">
                    {loading ? '—' : pendingOrders.length} {lang === 'ar' ? 'طلب نشط' : 'active orders'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-brand-purple transition-colors shrink-0" />
              </div>
            </Link>

            <Link href="/videos?f=delivered">
              <div className="group p-5 rounded-2xl bg-white border border-brand-purple/15 hover:border-brand-purple/35 hover:shadow-card-hover transition-all cursor-pointer flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-content-primary">{tr.dashboard.readyDownload}</p>
                  <p className="text-xs text-content-muted mt-0.5">
                    {loading ? '—' : downloads.length} {lang === 'ar' ? 'فيديو جاهز' : 'videos ready'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-brand-purple transition-colors shrink-0" />
              </div>
            </Link>
          </div>

          {/* Recent activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-content-primary">{tr.dashboard.recentOrders}</h2>
            </div>

            {loading ? (
              <div className="text-center py-14 text-sm text-content-muted">
                {lang === 'ar' ? 'جار التحميل...' : 'Loading...'}
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-14 rounded-2xl bg-white border border-brand-purple/10">
                <Film className="w-8 h-8 text-content-muted mx-auto mb-3" />
                <p className="text-sm text-content-muted">{tr.dashboard.noOrders}</p>
                <Link href="/create" className="inline-block mt-4">
                  <Button size="sm" variant="secondary">{tr.dashboard.startCreating}</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {recent.map(order => (
                  <VideoCard key={order._id} order={order} labels={labels} />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
