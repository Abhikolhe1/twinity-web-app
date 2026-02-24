'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Badge from '@/components/ui/Badge'
import { useLanguage } from '@/lib/context'
import { MOCK_ORDERS } from '@/lib/data'
import { ArrowLeft, Clock, User, Film, DollarSign, CalendarDays } from 'lucide-react'

const STEPS = {
  en: ['Submitted', 'In Progress', 'In Review', 'Ready'],
  ar: ['مُرسَل', 'قيد التنفيذ', 'قيد المراجعة', 'جاهز'],
}

function stepIndex(status: string) {
  if (status === 'pending')     return 0
  if (status === 'in-progress') return 1
  if (status === 'review')      return 2
  return 0
}

function statusMessage(status: string, lang: string) {
  const msgs: Record<string, { en: string; ar: string }> = {
    pending:      { en: 'Your request has been received. Our team will review it shortly.', ar: 'تم استلام طلبك. سيراجعه فريقنا قريباً.' },
    'in-progress':{ en: 'Our team is actively working on your video.', ar: 'يعمل فريقنا على إنتاج مقطع الفيديو الخاص بك.' },
    review:       { en: "Your video is in final review. We'll reach out soon.", ar: 'الفيديو في مرحلة المراجعة النهائية. سنتواصل معك قريباً.' },
  }
  return msgs[status]?.[lang as 'en' | 'ar'] ?? ''
}

function statusBadge(status: string, labels: Record<string, string>) {
  const label = labels[status] ?? status
  switch (status) {
    case 'in-progress': return <Badge variant="purple" dot>{label}</Badge>
    case 'review':      return <Badge variant="yellow" dot>{label}</Badge>
    default:            return <Badge variant="gray"   dot>{label}</Badge>
  }
}

export default function PendingPage() {
  const { lang, tr } = useLanguage()
  const labels  = tr.dashboard.statusLabels as Record<string, string>
  const orders  = MOCK_ORDERS.filter(o => o.status !== 'delivered')
  const steps   = STEPS[lang as 'en' | 'ar'] ?? STEPS.en

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 opacity-10"
          style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', top: '5%', right: '-5%' }} />
      </div>

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Back + Header */}
          <div>
            <Link href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-brand-purple transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              {lang === 'ar' ? 'لوحة التحكم' : 'My Videos'}
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-content-primary">{tr.dashboard.pendingOrders}</h1>
                <p className="text-sm text-content-muted mt-1">
                  {orders.length} {lang === 'ar' ? 'طلب نشط' : 'active orders'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Empty state */}
          {orders.length === 0 && (
            <div className="text-center py-16 rounded-2xl bg-white border border-brand-purple/10">
              <Clock className="w-8 h-8 text-content-muted mx-auto mb-3" />
              <p className="font-semibold text-content-primary">{tr.dashboard.noPending}</p>
              <p className="text-sm text-content-muted mt-1">{tr.dashboard.noPendingSub}</p>
            </div>
          )}

          {/* Order cards */}
          {orders.map(order => {
            const active = stepIndex(order.status)
            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white border border-brand-purple/12 shadow-card overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-brand-purple/8">
                  <span className="font-mono text-sm font-bold text-brand-purple">{order.id}</span>
                  {statusBadge(order.status, labels)}
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col gap-5">

                  {/* Detail grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <DetailItem icon={<User className="w-3.5 h-3.5" />}
                      label={tr.dashboard.celebrity} value={order.celebrity} />
                    <DetailItem icon={<Film className="w-3.5 h-3.5" />}
                      label={tr.dashboard.type} value={order.productType} />
                    <DetailItem icon={<DollarSign className="w-3.5 h-3.5" />}
                      label={tr.dashboard.price} value={`$${order.estimatedPrice.toLocaleString()}`} />
                    <DetailItem icon={<CalendarDays className="w-3.5 h-3.5" />}
                      label={tr.dashboard.submittedOn} value={order.createdAt} />
                  </div>

                  {/* Progress tracker */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      {steps.map((label, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                            i < active  ? 'bg-brand-purple border-brand-purple text-white' :
                            i === active ? 'bg-white border-brand-purple text-brand-purple ring-2 ring-brand-purple/20' :
                                          'bg-white border-brand-purple/20 text-content-muted'
                          }`}>
                            {i < active ? '✓' : i + 1}
                          </div>
                          <span className={`text-[10px] text-center leading-tight hidden sm:block ${
                            i === active ? 'text-brand-purple font-semibold' : 'text-content-muted'
                          }`}>
                            {label}
                          </span>
                        </div>
                      ))}
                      {/* Connector lines */}
                    </div>
                    <div className="relative flex items-center px-3.5 -mt-5 mb-1 sm:-mt-8 sm:mb-2">
                      <div className="absolute inset-x-3.5 h-0.5 bg-brand-purple/12 top-3.5" />
                      <div
                        className="absolute h-0.5 bg-brand-purple top-3.5 transition-all duration-500"
                        style={{ left: '14px', width: `calc(${(active / (steps.length - 1)) * 100}% - 28px)` }}
                      />
                    </div>
                  </div>

                  {/* Status message */}
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-surface-subtle border border-brand-purple/10">
                    <Clock className="w-4 h-4 text-brand-purple mt-0.5 shrink-0" />
                    <p className="text-sm text-content-secondary leading-relaxed">
                      {statusMessage(order.status, lang)}
                    </p>
                  </div>

                </div>
              </div>
            )
          })}

        </div>
      </main>

      <Footer />
    </div>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-content-muted">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-semibold text-content-primary">{value}</p>
    </div>
  )
}
