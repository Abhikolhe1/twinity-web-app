'use client'

import { useState } from 'react'
import { ProductTypeId, WizardState } from '@/lib/types'
import { useLanguage } from '@/lib/context'
import { Check, X, PhoneCall } from 'lucide-react'
import { leadApi } from '@/lib/api'
import { useProductTypes } from '@/lib/use-product-types'

interface Props {
  state: WizardState
  onSelect: (id: ProductTypeId) => void
}

interface ContactForm {
  name: string
  email: string
  message: string
}

export default function StepProductType({ state, onSelect }: Props) {
  const { lang, tr } = useLanguage()
  const [contactOpen,    setContactOpen]    = useState(false)
  const [contactForm,    setContactForm]    = useState<ContactForm>({ name: '', email: '', message: '' })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [contactError,   setContactError]   = useState<string | null>(null)

  const { productTypes, loading: ptLoading } = useProductTypes()

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactLoading(true)
    setContactError(null)
    try {
      await leadApi.contactForm({ ...contactForm, productType: 'Full-Body Digital Twin', purpose: 'Sales Inquiry' })
      setContactSuccess(true)
    } catch (err) {
      setContactError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setContactLoading(false)
    }
  }

  const openContact = (e: React.MouseEvent) => {
    e.stopPropagation()
    setContactOpen(true)
    setContactSuccess(false)
    setContactError(null)
    setContactForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.selectProductType}</h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.create.selectProductTypeSub}</p>
      </div>

      {ptLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-2xl border border-brand-purple/12 bg-white p-6 flex flex-col gap-4 animate-pulse">
              <div className="w-14 h-14 rounded-2xl bg-surface-subtle" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-3/4 rounded-lg bg-surface-subtle" />
                <div className="h-3 w-1/2 rounded-lg bg-surface-subtle" />
                <div className="h-3 w-full rounded-lg bg-surface-subtle mt-1" />
                <div className="h-3 w-5/6 rounded-lg bg-surface-subtle" />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[0, 1, 2].map(j => <div key={j} className="h-6 w-16 rounded-lg bg-surface-subtle" />)}
              </div>
              <div className="pt-2 border-t border-brand-purple/8">
                <div className="h-8 w-1/2 rounded-lg bg-surface-subtle" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!ptLoading && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {productTypes.map(pt => {
          const isContactSales = pt.id === 'full-body'
          const isSelected     = state.productType === pt.id
          const name           = lang === 'ar' ? pt.nameAr        : pt.name
          const desc           = lang === 'ar' ? pt.descriptionAr : pt.description
          const detail         = lang === 'ar' ? pt.detailAr      : pt.detail
          const useCases       = lang === 'ar' ? pt.useCasesAr    : pt.useCases

          return (
            <div
              key={pt.id}
              onClick={() => !isContactSales && onSelect(pt.id)}
              className={`relative rounded-2xl border p-6 transition-all duration-300 flex flex-col gap-4 group ${
                isContactSales
                  ? 'border-brand-purple/20 bg-white hover:border-brand-purple/35 hover:shadow-card-hover cursor-default'
                  : isSelected
                    ? 'border-brand-purple bg-surface-subtle shadow-purple cursor-pointer'
                    : 'border-brand-purple/12 bg-white hover:border-brand-purple/40 hover:shadow-card-hover cursor-pointer'
              }`}
              style={isSelected ? { boxShadow: '0 0 0 2px rgba(154,120,254,0.3), 0 4px 24px rgba(154,120,254,0.12)' } : undefined}
            >
              {isSelected && !isContactSales && (
                <div className="absolute top-4 right-4">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all ${
                  isSelected ? 'shadow-purple-sm' : 'group-hover:scale-105'
                }`}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(154,120,254,0.18), rgba(66,34,102,0.12))'
                    : 'rgba(154,120,254,0.06)',
                }}
              >
                {pt.icon}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-content-primary text-lg leading-tight">{name}</h3>
                <p className="text-brand-mid text-sm font-medium mt-0.5">{desc}</p>
                <p className="text-content-muted text-sm mt-2 leading-relaxed">{detail}</p>
              </div>

              {/* Use Cases */}
              <div className="flex flex-wrap gap-1.5">
                {useCases.map(uc => (
                  <span key={uc} className="text-xs px-2 py-1 rounded-lg bg-surface-subtle text-content-secondary border border-brand-purple/12">
                    {uc}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-brand-purple/10">
                {isContactSales ? (
                  <button
                    onClick={openContact}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}
                  >
                    <PhoneCall className="w-4 h-4" />
                    {lang === 'ar' ? 'تواصل مع المبيعات' : 'Contact Sales'}
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-content-muted">{lang === 'ar' ? 'يبدأ من' : 'Starting from'}</p>
                      <p className="text-lg font-bold text-content-primary">
                        ${pt.priceFrom.toLocaleString()}
                        <span className="text-xs text-content-muted font-normal ml-1">
                          {lang === 'ar' ? '/ فيديو' : '/ video'}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      )}

      {/* Contact Sales Modal */}
      {contactOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,48,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setContactOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-brand-purple/15 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-purple/10">
              <div>
                <h3 className="text-lg font-bold text-content-primary">
                  {lang === 'ar' ? 'تواصل مع فريق المبيعات' : 'Contact Sales Team'}
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  {lang === 'ar' ? 'سيتواصل معك فريقنا خلال 24 ساعة' : "Our team will reach out within 24 hours"}
                </p>
              </div>
              <button onClick={() => setContactOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-subtle text-content-muted hover:text-content-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {contactSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <p className="font-semibold text-content-primary text-lg">
                    {lang === 'ar' ? 'تم إرسال طلبك!' : 'Request sent!'}
                  </p>
                  <p className="text-sm text-content-muted mt-1">
                    {lang === 'ar' ? 'سيتواصل معك فريقنا قريباً.' : "We'll be in touch soon."}
                  </p>
                  <button
                    onClick={() => setContactOpen(false)}
                    className="mt-5 px-6 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}
                  >
                    {lang === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-content-primary">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                    <input
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                      placeholder={lang === 'ar' ? 'اسمك الكامل' : 'Your name'}
                      className="w-full bg-white border border-brand-purple/20 rounded-xl px-3.5 py-2.5 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_3px_rgba(154,120,254,0.12)] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-content-primary">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input
                      required
                      type="email"
                      value={contactForm.email}
                      onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@company.com"
                      className="w-full bg-white border border-brand-purple/20 rounded-xl px-3.5 py-2.5 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_3px_rgba(154,120,254,0.12)] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-content-primary">{lang === 'ar' ? 'الرسالة' : 'Message'}</label>
                    <textarea
                      required
                      rows={3}
                      value={contactForm.message}
                      onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                      placeholder={lang === 'ar' ? 'أخبرنا عن مشروعك...' : 'Tell us about your project...'}
                      className="w-full bg-white border border-brand-purple/20 rounded-xl px-3.5 py-2.5 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_3px_rgba(154,120,254,0.12)] transition-all resize-none"
                    />
                  </div>
                  {contactError && <p className="text-sm text-red-500">{contactError}</p>}
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}
                  >
                    {contactLoading
                      ? (lang === 'ar' ? 'جارٍ الإرسال...' : 'Sending...')
                      : (lang === 'ar' ? 'إرسال الطلب' : 'Send Request')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
