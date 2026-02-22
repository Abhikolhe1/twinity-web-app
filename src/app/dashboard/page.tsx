'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/lib/context'
import { MOCK_ORDERS } from '@/lib/data'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { Film, Download, DollarSign, PlusCircle, ArrowUpRight, Clock } from 'lucide-react'

function getStatusBadge(status: string, statusLabels: Record<string, string>) {
  const label = statusLabels[status] ?? status
  switch (status) {
    case 'delivered':   return <Badge variant="green"  dot>{label}</Badge>
    case 'in-progress': return <Badge variant="purple" dot>{label}</Badge>
    case 'review':      return <Badge variant="yellow" dot>{label}</Badge>
    default:            return <Badge variant="gray"   dot>{label}</Badge>
  }
}

export default function DashboardPage() {
  const { lang, tr } = useLanguage()
  const statusLabels = tr.dashboard.statusLabels as Record<string, string>

  const stats = [
    { label: tr.dashboard.totalOrders,  value: '3',      Icon: Film,       color: 'text-brand-purple', bg: 'bg-brand-purple/8',  border: 'border-brand-purple/15' },
    { label: tr.dashboard.activeOrders, value: '2',      Icon: Clock,      color: 'text-amber-600',   bg: 'bg-amber-50',        border: 'border-amber-100'       },
    { label: tr.dashboard.downloads,    value: '1',      Icon: Download,   color: 'text-emerald-600', bg: 'bg-emerald-50',      border: 'border-emerald-100'     },
    { label: tr.dashboard.totalSpent,   value: '$20.0K', Icon: DollarSign, color: 'text-blue-600',    bg: 'bg-blue-50',         border: 'border-blue-100'        },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 opacity-12"
          style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', top: '5%', right: '-5%' }} />
      </div>

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-content-muted text-sm">{tr.dashboard.welcome}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-content-primary mt-0.5">{tr.dashboard.title}</h1>
            </div>
            <Link href="/create">
              <Button icon={<PlusCircle className="w-4 h-4" />}>{tr.dashboard.createNew}</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(s => (
              <div
                key={s.label}
                className={`p-5 rounded-2xl bg-white border shadow-card flex items-center gap-4 ${s.border}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                  <s.Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-content-primary">{s.value}</p>
                  <p className="text-xs text-content-muted mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl bg-white border border-brand-purple/12 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-purple/8">
              <h2 className="font-bold text-content-primary">{tr.dashboard.recentOrders}</h2>
              <button className="text-xs text-brand-purple hover:underline flex items-center gap-1">
                {tr.common.viewAll}
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-purple/6">
                    {[
                      tr.dashboard.orderID,
                      tr.dashboard.celebrity,
                      tr.dashboard.type,
                      tr.dashboard.purpose,
                      tr.dashboard.status,
                      tr.dashboard.price,
                      tr.dashboard.date,
                      tr.dashboard.action,
                    ].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-bold text-content-muted uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-purple/5">
                  {MOCK_ORDERS.map(order => (
                    <tr key={order.id} className="hover:bg-surface-page transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-brand-purple font-semibold">{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-content-primary font-medium">{order.celebrity}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-content-secondary">{order.productType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-content-secondary">{order.purpose}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status, statusLabels)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-content-primary">${order.estimatedPrice.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-content-muted">{order.createdAt}</span>
                      </td>
                      <td className="px-6 py-4">
                        {order.status === 'delivered' ? (
                          <button className="flex items-center gap-1.5 text-xs font-semibold text-brand-purple hover:underline">
                            <Download className="w-3.5 h-3.5" />
                            {tr.dashboard.download}
                          </button>
                        ) : (
                          <button className="text-xs text-content-muted hover:text-brand-purple transition-colors">
                            {tr.dashboard.viewDetails}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-brand-purple/8">
              {MOCK_ORDERS.map(order => (
                <div key={order.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-brand-purple font-semibold">{order.id}</span>
                    {getStatusBadge(order.status, statusLabels)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-content-primary">{order.celebrity}</p>
                    <p className="text-xs text-content-muted">{order.productType} · {order.purpose}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-content-primary">${order.estimatedPrice.toLocaleString()}</span>
                    {order.status === 'delivered' ? (
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-brand-purple">
                        <Download className="w-3.5 h-3.5" />
                        {tr.dashboard.download}
                      </button>
                    ) : (
                      <span className="text-xs text-content-muted">{order.createdAt}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/create">
              <div
                className="p-5 rounded-2xl border border-brand-purple/20 hover:border-brand-purple/40 hover:shadow-purple transition-all cursor-pointer group"
                style={{ background: 'linear-gradient(145deg, #FAF7FF, #F3EEFF)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-purple-sm"
                    style={{ background: 'linear-gradient(135deg, #9a78fe, #422266)' }}>
                    <PlusCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-content-primary">{tr.dashboard.createNew}</p>
                    <p className="text-xs text-content-muted mt-0.5">{lang === 'ar' ? 'ابدأ مشروعاً جديداً' : 'Start a new project'}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-brand-purple/50 group-hover:text-brand-purple ms-auto transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/celebrities">
              <div className="p-5 rounded-2xl border border-brand-purple/12 bg-white hover:border-brand-purple/30 hover:shadow-card-hover transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <p className="font-semibold text-content-primary">{tr.nav.celebrities}</p>
                    <p className="text-xs text-content-muted mt-0.5">{lang === 'ar' ? 'تصفح 150+ مشهور' : 'Browse 150+ celebrities'}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-content-muted group-hover:text-brand-purple ms-auto transition-colors" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
