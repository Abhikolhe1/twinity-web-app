'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WizardState } from '@/lib/types'
import { useLanguage } from '@/lib/context'
import { Input, TextArea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Phone, Calendar, ChevronLeft, AlertCircle } from 'lucide-react'
import { jobApi, authApi, getUserInfo } from '@/lib/api'

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
  const [error, setError] = useState('')
  const [userInfo, setUserInfo2] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const cached = getUserInfo()
    if (cached) {
      setUserInfo2(cached)
    } else {
      authApi.getMe()
        .then(res => setUserInfo2({ name: res.user.name, email: res.user.email }))
        .catch(() => null)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let referenceId: string | null = null
      try { referenceId = sessionStorage.getItem(ORDER_REF_KEY) } catch {}

      if (!referenceId) {
        setError(lang === 'ar'
          ? 'لم يتم العثور على طلبك. يرجى العودة وتوليد المعاينة أولاً.'
          : 'No video order found. Please go back and generate a preview first.')
        setLoading(false)
        return
      }

      if (userInfo) {
        await jobApi.bookCall(referenceId, {
          name:  userInfo.name,
          email: userInfo.email,
          phone: phone || undefined,
          notes: `Preferred time: ${preferredTime}. ${message}`.trim(),
        })
      }

      router.push('/create/success')
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.bookCall}</h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.create.bookCallSub}</p>
      </div>

      <div className="max-w-lg mx-auto w-full">
        {error && (
          <div className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}
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
