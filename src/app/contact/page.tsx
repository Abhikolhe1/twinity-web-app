'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/lib/context'
import { Input, TextArea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Mail, User, Building2, MessageSquare, CheckCircle2, Phone, Clock, Instagram, Twitter, Linkedin, Youtube, AlertCircle } from 'lucide-react'
import { leadApi } from '@/lib/api'

export default function ContactPage() {
  const { lang } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await leadApi.contactForm({ name: form.name, email: form.email, company: form.company, message: form.message })
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 opacity-10"
          style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', top: '5%', right: '-5%' }} />
      </div>

      <main className="flex-1 pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left — info */}
            <div className="pt-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-content-primary">
                {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </h1>
              <p className="mt-4 text-content-muted leading-relaxed">
                {lang === 'ar'
                  ? 'هل لديك سؤال أو تريد البدء في مشروع؟ فريقنا هنا للمساعدة. أرسل لنا رسالة وسنرد في أقرب وقت.'
                  : "Have a question or want to kick off a project? Our team is here to help. Send us a message and we'll get back to you shortly."}
              </p>

              {/* Contact details */}
              <div className="mt-8 flex flex-col gap-4">
                {[
                  {
                    icon: <Mail className="w-5 h-5 text-brand-purple" />,
                    label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email',
                    value: 'hello@twinity.ai',
                    href: 'mailto:hello@twinity.ai',
                  },
                  {
                    icon: <Phone className="w-5 h-5 text-brand-purple" />,
                    label: lang === 'ar' ? 'الهاتف / واتساب' : 'Phone / WhatsApp',
                    value: '+971 50 000 0000',
                    href: 'https://wa.me/971500000000',
                  },
                  {
                    icon: <Building2 className="w-5 h-5 text-brand-purple" />,
                    label: lang === 'ar' ? 'المكتب' : 'Office',
                    value: lang === 'ar' ? 'دبي، الإمارات العربية المتحدة' : 'Dubai, United Arab Emirates',
                    href: null,
                  },
                  {
                    icon: <Clock className="w-5 h-5 text-brand-purple" />,
                    label: lang === 'ar' ? 'ساعات العمل' : 'Working Hours',
                    value: lang === 'ar' ? 'الأحد – الخميس، 9 ص – 6 م (بتوقيت الخليج)' : 'Sun – Thu, 9 AM – 6 PM (GST)',
                    href: null,
                  },
                  {
                    icon: <MessageSquare className="w-5 h-5 text-brand-purple" />,
                    label: lang === 'ar' ? 'وقت الاستجابة' : 'Response Time',
                    value: lang === 'ar' ? 'خلال 24 ساعة' : 'Within 24 hours',
                    href: null,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-purple/8 border border-brand-purple/15 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-content-muted font-medium">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-semibold text-brand-purple hover:underline mt-0.5 block">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-content-primary mt-0.5">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="mt-8 border-t border-brand-purple/10" />

              {/* Social media */}
              <div className="mt-7">
                <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-4">
                  {lang === 'ar' ? 'تابعنا على' : 'Follow Us'}
                </p>
                <div className="flex gap-3">
                  {[
                    {
                      icon: <Instagram className="w-4 h-4" />,
                      label: 'Instagram',
                      href: 'https://instagram.com/twinity.ai',
                      color: 'hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600',
                    },
                    {
                      icon: <Twitter className="w-4 h-4" />,
                      label: 'X (Twitter)',
                      href: 'https://twitter.com/twinityai',
                      color: 'hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800',
                    },
                    {
                      icon: <Linkedin className="w-4 h-4" />,
                      label: 'LinkedIn',
                      href: 'https://linkedin.com/company/twinity',
                      color: 'hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700',
                    },
                    {
                      icon: <Youtube className="w-4 h-4" />,
                      label: 'YouTube',
                      href: 'https://youtube.com/@twinityai',
                      color: 'hover:bg-red-50 hover:border-red-200 hover:text-red-600',
                    },
                  ].map(s => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      className={`w-10 h-10 rounded-xl border border-brand-purple/15 bg-white flex items-center justify-center text-content-muted transition-all ${s.color}`}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

            </div>

            {/* Right — form */}
            <div className="bg-white rounded-3xl border border-brand-purple/12 shadow-card p-8">
              {!sent ? (
                <>
                  <h2 className="text-xl font-bold text-content-primary mb-6">
                    {lang === 'ar' ? 'أرسل رسالة' : 'Send a Message'}
                  </h2>
                  {error && (
                    <div className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label={lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                        placeholder={lang === 'ar' ? 'اسمك' : 'Your name'}
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        required
                        icon={<User className="w-4 h-4" />}
                      />
                      <Input
                        label={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        required
                        icon={<Mail className="w-4 h-4" />}
                      />
                    </div>
                    <Input
                      label={lang === 'ar' ? 'الشركة' : 'Company'}
                      placeholder={lang === 'ar' ? 'اسم شركتك (اختياري)' : 'Your company (optional)'}
                      value={form.company}
                      onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                      icon={<Building2 className="w-4 h-4" />}
                    />
                    <TextArea
                      label={lang === 'ar' ? 'الرسالة' : 'Message'}
                      placeholder={lang === 'ar' ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      required
                      rows={5}
                    />
                    <Button size="lg" fullWidth type="submit" loading={loading}>
                      {lang === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                    </Button>
                  </form>

                </>

              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold text-content-primary">
                    {lang === 'ar' ? 'شكرًا لك!' : 'Message Sent!'}
                  </h2>
                  <p className="text-sm text-content-muted mt-2 max-w-xs mx-auto">
                    {lang === 'ar'
                      ? 'استلمنا رسالتك وسنرد عليك خلال 24 ساعة.'
                      : "We've received your message and will get back to you within 24 hours."}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Full-width FAQ section */}
          <div className="mt-16 border-t border-brand-purple/10 pt-12">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">
                {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </h2>
              <p className="mt-2 text-content-muted text-sm">
                {lang === 'ar' ? 'إجابات سريعة على أكثر الأسئلة شيوعاً' : 'Quick answers to the most common questions'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  q: lang === 'ar' ? 'كم يستغرق تسليم الفيديو؟' : 'How long does delivery take?',
                  a: lang === 'ar' ? '3–7 أيام عمل حسب المشهور والتعقيد.' : '3–7 business days depending on the celebrity and complexity.',
                },
                {
                  q: lang === 'ar' ? 'هل تدعمون العربية والإنجليزية؟' : 'Do you support Arabic & English?',
                  a: lang === 'ar' ? 'نعم، نقدم المحتوى بكلتا اللغتين بشكل كامل.' : 'Yes, we deliver content fully in both Arabic and English.',
                },
                {
                  q: lang === 'ar' ? 'كيف يتم الدفع؟' : 'How does payment work?',
                  a: lang === 'ar' ? 'يتم تأكيد السعر عبر مكالمة مبيعات قبل أي معالجة للدفع.' : 'Pricing is confirmed via a sales call before any payment is processed.',
                },
                {
                  q: lang === 'ar' ? 'هل يمكنني اختيار أكثر من مشهور؟' : 'Can I choose more than one celebrity?',
                  a: lang === 'ar' ? 'نعم، يمكنك تقديم طلبات متعددة لمشاهير مختلفين.' : 'Yes, you can place multiple orders for different celebrities.',
                },
                {
                  q: lang === 'ar' ? 'هل المحتوى حصري لعلامتي التجارية؟' : 'Is the content exclusive to my brand?',
                  a: lang === 'ar' ? 'يحصل العملاء على ترخيص غير حصري للاستخدام التجاري ما لم يُتفق على خلاف ذلك.' : 'Clients receive a non-exclusive commercial licence unless otherwise agreed in writing.',
                },
                {
                  q: lang === 'ar' ? 'ماذا لو لم يُعجبني الفيديو النهائي؟' : "What if I'm not happy with the final video?",
                  a: lang === 'ar' ? 'نقدم جولة مراجعة واحدة مجانية لضمان رضاك عن النتيجة.' : "We offer one free revision round to ensure you're satisfied with the result.",
                },
              ].map((faq, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-brand-purple/10 shadow-sm">
                  <p className="text-sm font-bold text-content-primary leading-snug">{faq.q}</p>
                  <p className="text-xs text-content-muted mt-2 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
