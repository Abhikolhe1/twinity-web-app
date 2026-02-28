'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, PlusCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useWizard } from '@/lib/wizard-context'
import { useLanguage } from '@/lib/context'

const ORDER_REF_KEY = 'twinity_order_ref'

export default function SuccessPage() {
  const router = useRouter()
  const { reset } = useWizard()
  const { lang, tr } = useLanguage()
  const [orderRef, setOrderRef] = useState('')

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(ORDER_REF_KEY)
      setOrderRef(stored ?? '')
    } catch {
      setOrderRef('')
    }
  }, [])

  const handleCreateAnother = () => {
    try { sessionStorage.removeItem(ORDER_REF_KEY) } catch {}
    reset()
    router.push('/create/product-type')
  }

  return (
    <div className="max-w-md mx-auto w-full flex flex-col items-center gap-6 py-8 animate-fade-in">

      {/* Icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center shadow-purple-sm"
        style={{ background: 'linear-gradient(135deg, rgba(154,120,254,0.18), rgba(66,34,102,0.10))' }}
      >
        <CheckCircle2 className="w-8 h-8 text-brand-purple" />
      </div>

      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.requestSent}</h2>
        <p className="mt-2 text-content-muted text-sm leading-relaxed max-w-sm mx-auto">
          {tr.create.requestSentSub}
        </p>
      </div>

      {/* Order reference pill */}
      {orderRef && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-brand-purple/18 shadow-card">
          <span className="text-xs text-content-muted">{tr.create.orderRef}</span>
          <span className="text-sm font-bold text-brand-purple font-mono">{orderRef}</span>
        </div>
      )}

      {/* Create Another Video */}
      <Button
        size="lg"
        icon={<PlusCircle className="w-4 h-4" />}
        onClick={handleCreateAnother}
      >
        {tr.create.newVideo}
      </Button>
    </div>
  )
}
