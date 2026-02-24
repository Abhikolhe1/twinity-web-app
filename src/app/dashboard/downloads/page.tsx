'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/lib/context'
import { MOCK_ORDERS } from '@/lib/data'
import { ArrowLeft, Download, Play, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import VideoPreview from '@/components/create/VideoPreview'

export default function DownloadsPage() {
  const { lang, tr } = useLanguage()
  const orders = MOCK_ORDERS.filter(o => o.status === 'delivered')

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)', top: '5%', right: '-5%' }} />
      </div>

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {/* Back + Header */}
          <div>
            <Link href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-brand-purple transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              {lang === 'ar' ? 'لوحة التحكم' : 'My Videos'}
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-content-primary">{tr.dashboard.readyDownload}</h1>
                <p className="text-sm text-content-muted mt-1">
                  {orders.length} {lang === 'ar' ? 'فيديو جاهز' : 'videos ready'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Download className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Empty state */}
          {orders.length === 0 && (
            <div className="text-center py-16 rounded-2xl bg-white border border-brand-purple/10">
              <Download className="w-8 h-8 text-content-muted mx-auto mb-3" />
              <p className="font-semibold text-content-primary">{tr.dashboard.noDownloads}</p>
              <p className="text-sm text-content-muted mt-1">{tr.dashboard.noDownloadsSub}</p>
            </div>
          )}

          {/* 3-column video grid */}
          {orders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {orders.map(order => (
                <DownloadCard key={order.id} order={order} lang={lang} tr={tr} />
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}

function DownloadCard({
  order,
  lang,
  tr,
}: {
  order: typeof MOCK_ORDERS[0]
  lang: string
  tr: Record<string, any>
}) {
  const [downloaded, setDownloaded] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const db = tr.dashboard

  const handlePreviewToggle = () => {
    if (!previewOpen) setPreviewKey(k => k + 1)
    setPreviewOpen(v => !v)
  }

  return (
    <div className="rounded-2xl bg-white border border-emerald-200 overflow-hidden hover:shadow-card-hover transition-all group">

      {/* Thumbnail */}
      <div className="relative w-full" style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' }}>

        {/* Scanline texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.4) 3px,rgba(0,0,0,0.4) 4px)' }} />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(4px)' }}>
            <Play className="w-4 h-4 text-white ml-0.5" />
          </div>
        </div>

        {/* Celebrity initial — top left */}
        <div className="absolute top-2.5 left-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
            style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(4px)' }}>
            {order.celebrity.charAt(0)}
          </div>
        </div>

        {/* Delivered badge — top right */}
        <div className="absolute top-2.5 right-2.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
            style={{ background: 'rgba(16,185,129,0.75)', backdropFilter: 'blur(4px)' }}>
            <CheckCircle2 className="w-3 h-3" />
            {lang === 'ar' ? 'مُسلَّم' : 'Delivered'}
          </div>
        </div>

        {/* Duration — bottom right */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="text-[9px] font-bold tracking-widest uppercase text-white/70 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
            30s
          </span>
        </div>

        {/* File format — bottom left */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="text-[9px] font-bold text-white/60 bg-black/35 px-1.5 py-0.5 rounded backdrop-blur-sm">
            MP4 · 1080p
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="font-semibold text-content-primary truncate leading-tight">{order.celebrity}</p>
          <p className="text-xs text-content-muted truncate mt-0.5">{order.productType} · {order.purpose}</p>
        </div>

        <div className="flex items-center justify-between text-xs border-t border-brand-purple/8 pt-2">
          <span className="font-mono text-content-muted">{order.id}</span>
          <span className="font-bold text-emerald-600">${order.estimatedPrice.toLocaleString()}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setDownloaded(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              downloaded
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            {downloaded
              ? (lang === 'ar' ? '✓ جارٍ التنزيل' : '✓ Downloading')
              : db.downloadVideo}
          </button>

          <button
            onClick={handlePreviewToggle}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border border-brand-purple/18 text-content-secondary hover:text-brand-purple hover:border-brand-purple/35 transition-all shrink-0"
          >
            {previewOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {lang === 'ar' ? 'معاينة' : 'Preview'}
          </button>
        </div>

        {/* Expandable VideoPreview */}
        {previewOpen && (
          <div className="rounded-xl overflow-hidden border border-brand-purple/15 -mx-1">
            <VideoPreview
              key={previewKey}
              celebrity={null}
              templateName={order.purpose}
              productType={order.productType}
              duration="30s"
              lang={lang}
            />
          </div>
        )}
      </div>
    </div>
  )
}
