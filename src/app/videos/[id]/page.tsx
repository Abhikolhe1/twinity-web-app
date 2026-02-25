'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/lib/context'
import { MOCK_ORDERS } from '@/lib/data'
import { thumbnailGradient, statusBadge } from '@/components/dashboard/VideoCard'
import {
  ArrowLeft, Play, User, Tag, Calendar, DollarSign,
  Clock, CheckCircle2, Loader2, Eye, Package, Download,
  RotateCcw, MessageSquare,
} from 'lucide-react'

const STATUS_STEPS = [
  { id: 'pending',     en: 'Order Placed',    ar: 'تم تقديم الطلب' },
  { id: 'in-progress', en: 'In Production',   ar: 'قيد الإنتاج' },
  { id: 'review',      en: 'Under Review',    ar: 'قيد المراجعة' },
  { id: 'delivered',   en: 'Delivered',       ar: 'تم التسليم' },
]

function stepIndex(status: string) {
  return STATUS_STEPS.findIndex(s => s.id === status)
}

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { lang, tr } = useLanguage()
  const router = useRouter()
  const labels = tr.dashboard.statusLabels as Record<string, string>

  const order = MOCK_ORDERS.find(o => o.id === id)

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-page">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-content-primary mb-2">
              {lang === 'ar' ? 'الطلب غير موجود' : 'Order not found'}
            </p>
            <Link href="/videos" className="text-sm text-brand-purple hover:underline">
              {lang === 'ar' ? 'العودة إلى الفيديوهات' : 'Back to Videos'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const currentStep = stepIndex(order.status)

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 opacity-10"
          style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', top: '5%', right: '-5%' }} />
      </div>

      <main className="flex-1 pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Back */}
          <Link href="/videos"
            className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-brand-purple transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            {lang === 'ar' ? 'جميع الفيديوهات' : 'All Videos'}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

            {/* ── Left column ── */}
            <div className="flex flex-col gap-6">

              {/* Video thumbnail / preview */}
              <div className="rounded-3xl overflow-hidden border border-brand-purple/12 shadow-card relative"
                style={{ aspectRatio: '16/9', background: thumbnailGradient(order.status) }}>

                {/* Scan-line texture */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.4) 3px,rgba(0,0,0,0.4) 4px)' }} />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
                    <Play className="w-7 h-7 text-white ml-1" />
                  </button>
                </div>

                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  {statusBadge(order.status, labels)}
                </div>

                {/* Duration */}
                <div className="absolute bottom-4 right-4">
                  <span className="text-xs font-bold tracking-widest uppercase text-white/80 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                    30s
                  </span>
                </div>

                {/* Order ref */}
                <div className="absolute bottom-4 left-4">
                  <span className="text-xs font-mono text-white/70 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                    {order.id}
                  </span>
                </div>
              </div>

              {/* Order timeline */}
              <div className="bg-white rounded-2xl border border-brand-purple/12 p-6">
                <h3 className="text-sm font-bold text-content-primary mb-5">
                  {lang === 'ar' ? 'حالة الطلب' : 'Order Progress'}
                </h3>
                <div className="flex items-center gap-0">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentStep
                    const isLast = i === STATUS_STEPS.length - 1
                    return (
                      <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            done
                              ? 'bg-brand-purple border-brand-purple text-white'
                              : 'bg-white border-brand-purple/20 text-content-muted'
                          }`}>
                            {i < currentStep
                              ? <CheckCircle2 className="w-4 h-4" />
                              : i === currentStep
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <span className="text-[10px] font-bold">{i + 1}</span>
                            }
                          </div>
                          <span className={`text-[10px] font-medium text-center w-16 leading-tight ${
                            done ? 'text-brand-purple' : 'text-content-muted'
                          }`}>
                            {lang === 'ar' ? step.ar : step.en}
                          </span>
                        </div>
                        {!isLast && (
                          <div className={`flex-1 h-[2px] mb-4 mx-1 rounded transition-all ${
                            i < currentStep ? 'bg-brand-purple' : 'bg-brand-purple/15'
                          }`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-2xl border border-brand-purple/12 p-6">
                <h3 className="text-sm font-bold text-content-primary mb-4">
                  {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {order.status === 'delivered' && (
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-purple text-white hover:opacity-90 transition-all">
                      <Download className="w-4 h-4" />
                      {lang === 'ar' ? 'تحميل الفيديو' : 'Download Video'}
                    </button>
                  )}
                  <button 
                    onClick={() => router.push('/contact')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-brand-purple/20 text-content-secondary hover:border-brand-purple/40 hover:text-brand-purple transition-all">
                    <MessageSquare className="w-4 h-4" />
                    {lang === 'ar' ? 'تواصل مع الدعم' : 'Contact Support'}
                  </button>
                  <button
                    onClick={() => router.push('/create/product-type')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-brand-purple/20 text-content-secondary hover:border-brand-purple/40 hover:text-brand-purple transition-all">
                    <RotateCcw className="w-4 h-4" />
                    {lang === 'ar' ? 'طلب جديد' : 'New Order'}
                  </button>
                </div>
              </div>

            </div>

            {/* ── Right column — Order details ── */}
            <div className="flex flex-col gap-4">

              {/* Header */}
              <div className="bg-white rounded-2xl border border-brand-purple/12 p-6">
                <p className="text-xs font-mono text-content-muted mb-1">{order.id}</p>
                <h1 className="text-xl font-bold text-content-primary leading-tight">{order.celebrity}</h1>
                <p className="text-sm text-content-muted mt-0.5">{order.productType}</p>
                <div className="mt-3">{statusBadge(order.status, labels)}</div>
              </div>

              {/* Details list */}
              <div className="bg-white rounded-2xl border border-brand-purple/12 p-6">
                <h3 className="text-sm font-bold text-content-primary mb-4">
                  {lang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                </h3>
                <div className="flex flex-col gap-4">
                  {[
                    {
                      icon: <User className="w-4 h-4 text-brand-purple" />,
                      label: lang === 'ar' ? 'المشهور' : 'Celebrity',
                      value: order.celebrity,
                    },
                    {
                      icon: <Package className="w-4 h-4 text-brand-purple" />,
                      label: lang === 'ar' ? 'نوع المنتج' : 'Product Type',
                      value: order.productType,
                    },
                    {
                      icon: <Tag className="w-4 h-4 text-brand-purple" />,
                      label: lang === 'ar' ? 'الغرض' : 'Purpose',
                      value: order.purpose,
                    },
                    {
                      icon: <Calendar className="w-4 h-4 text-brand-purple" />,
                      label: lang === 'ar' ? 'تاريخ الطلب' : 'Order Date',
                      value: new Date(order.createdAt).toLocaleDateString(
                        lang === 'ar' ? 'ar-AE' : 'en-GB',
                        { day: 'numeric', month: 'long', year: 'numeric' }
                      ),
                    },
                    {
                      icon: <Clock className="w-4 h-4 text-brand-purple" />,
                      label: lang === 'ar' ? 'مدة الفيديو' : 'Duration',
                      value: '30s',
                    },
                    {
                      icon: <Eye className="w-4 h-4 text-brand-purple" />,
                      label: lang === 'ar' ? 'الحالة' : 'Status',
                      value: labels[order.status] ?? order.status,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-purple/8 border border-brand-purple/12 flex items-center justify-center shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs text-content-muted font-medium">{item.label}</p>
                        <p className="text-sm font-semibold text-content-primary mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="bg-white rounded-2xl border border-brand-purple/12 p-6">
                <h3 className="text-sm font-bold text-content-primary mb-3">
                  {lang === 'ar' ? 'الفاتورة' : 'Billing'}
                </h3>
                <div className="flex items-center justify-between py-2 border-b border-brand-purple/8">
                  <span className="text-sm text-content-muted">{lang === 'ar' ? 'تقدير الطلب' : 'Estimated price'}</span>
                  <span className="text-sm font-semibold text-content-primary">${order.estimatedPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-brand-purple" />
                    <span className="text-sm font-bold text-content-primary">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  </div>
                  <span className="text-lg font-bold text-brand-purple">
                    ${order.estimatedPrice.toLocaleString()} {order.currency}
                  </span>
                </div>
                <p className="text-[10px] text-content-muted mt-2 leading-relaxed">
                  {lang === 'ar'
                    ? '* السعر النهائي يُؤكد عبر مكالمة المبيعات قبل المعالجة.'
                    : '* Final price is confirmed via sales call before processing.'}
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
