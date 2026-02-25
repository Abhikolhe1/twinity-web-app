'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardState } from '@/lib/types'
import { useLanguage } from '@/lib/context'
import { Input, TextArea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Phone, Calendar, ChevronLeft } from 'lucide-react'
import { PRODUCT_TYPES } from '@/lib/data'

const ORDER_REF_KEY = 'twinity_order_ref'

interface Props {
  state: WizardState
}

export default function StepBookCall({ state }: Props) {
  const { lang, tr } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [preferredTime, setPreferredTime] = useState('morning')
  const [message, setMessage] = useState('')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    const orderRef = `TWN-${Date.now().toString().slice(-6)}`
    try { sessionStorage.setItem(ORDER_REF_KEY, orderRef) } catch {}
    router.push('/create/success')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.bookCall}</h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.create.bookCallSub}</p>
      </div>

      <div className="max-w-lg mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="p-5 rounded-2xl bg-white border border-brand-purple/14 shadow-card flex flex-col gap-4">
            <h3 className="font-semibold text-content-primary">{tr.create.yourDetails}</h3>

            <Input
              label={tr.create.phone}
              type="tel"
              placeholder="+971 50 000 0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              icon={<Phone className="w-4 h-4" />}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-content-primary flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-content-muted" />
                {tr.create.preferredTime}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'morning',   label: tr.create.morning   },
                  { id: 'afternoon', label: tr.create.afternoon },
                  { id: 'evening',   label: tr.create.evening   },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPreferredTime(t.id)}
                    className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                      preferredTime === t.id
                        ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/40'
                        : 'bg-surface-subtle text-content-secondary border-brand-purple/12 hover:border-brand-purple/30'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <TextArea
              label={tr.create.message}
              placeholder={lang === 'ar' ? 'أي معلومات إضافية...' : 'Any additional info...'}
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Price reminder */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-subtle border border-brand-purple/18">
            <span className="text-sm text-content-secondary">
              {lang === 'ar' ? 'التكلفة التقديرية' : 'Estimated Cost'}
            </span>
            <span className="text-lg font-bold text-content-primary">
              {state.celebrity && state.productType
                ? `$${state.celebrity.priceRange[state.productType].min.toLocaleString()} – $${state.celebrity.priceRange[state.productType].max.toLocaleString()}`
                : '—'}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/create/review')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-brand-purple/20 text-content-secondary hover:text-brand-purple hover:bg-surface-subtle transition-all shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              {lang === 'ar' ? 'رجوع' : 'Back'}
            </button>
            <Button size="lg" fullWidth type="submit" loading={loading} icon={<Phone className="w-4 h-4" />}>
              {tr.create.submitRequest}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
