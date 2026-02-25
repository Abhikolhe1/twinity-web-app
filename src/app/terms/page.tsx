'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/lib/context'

const sections = [
  {
    title: 'Acceptance of Terms',
    titleAr: 'قبول الشروط',
    body: 'By accessing or using Twinity, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the platform. These terms apply to all users, including visitors and registered customers.',
    bodyAr: 'باستخدامك منصة Twinity أو الوصول إليها، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق، يرجى عدم استخدام المنصة. تنطبق هذه الشروط على جميع المستخدمين، بما فيهم الزوار والعملاء المسجلين.',
  },
  {
    title: 'Services',
    titleAr: 'الخدمات',
    body: 'Twinity provides AI-powered celebrity video generation services. All deliverables are subject to availability of the selected celebrity and review by our production team. Estimated delivery times are indicative and not guaranteed.',
    bodyAr: 'تقدّم Twinity خدمات إنتاج مقاطع فيديو للمشاهير مدعومة بالذكاء الاصطناعي. تخضع جميع المخرجات لتوافر المشهور المختار ومراجعة فريق الإنتاج. أوقات التسليم المقدّرة استرشادية وغير مضمونة.',
  },
  {
    title: 'Payment & Pricing',
    titleAr: 'الدفع والأسعار',
    body: 'Pricing is confirmed through a sales call before any payment is processed. All prices are in USD unless otherwise stated. Twinity reserves the right to revise pricing at any time with reasonable notice.',
    bodyAr: 'يتم تأكيد الأسعار من خلال مكالمة مبيعات قبل معالجة أي دفعة. جميع الأسعار بالدولار الأمريكي ما لم يُذكر خلاف ذلك. تحتفظ Twinity بالحق في مراجعة الأسعار في أي وقت مع إشعار مناسب.',
  },
  {
    title: 'Intellectual Property',
    titleAr: 'الملكية الفكرية',
    body: 'Upon full payment, the client receives a non-exclusive licence to use the delivered video content for the agreed purposes. Twinity retains the right to use the content as a portfolio sample unless otherwise agreed in writing.',
    bodyAr: 'عند اكتمال الدفع، يحصل العميل على ترخيص غير حصري لاستخدام محتوى الفيديو المُسلَّم للأغراض المتفق عليها. تحتفظ Twinity بالحق في استخدام المحتوى كنموذج في محفظة أعمالها، ما لم يُتفق على خلاف ذلك كتابيًا.',
  },
  {
    title: 'Prohibited Use',
    titleAr: 'الاستخدامات المحظورة',
    body: 'You may not use Twinity for illegal, defamatory, or misleading content. Misuse of celebrity likeness, including any use that violates applicable laws or the celebrity\'s consent, will result in immediate termination of the order without refund.',
    bodyAr: 'لا يجوز استخدام Twinity لإنشاء محتوى غير قانوني أو تشهيري أو مضلل. إساءة استخدام شبه المشاهير، بما في ذلك أي استخدام ينتهك القوانين المعمول بها أو موافقة المشهور، ستؤدي إلى الإلغاء الفوري للطلب دون استرداد.',
  },
  {
    title: 'Limitation of Liability',
    titleAr: 'تحديد المسؤولية',
    body: 'Twinity shall not be liable for indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the specific order in question.',
    bodyAr: 'لن تكون Twinity مسؤولة عن الأضرار غير المباشرة أو العرضية أو التبعية الناجمة عن استخدام خدماتنا. لن تتجاوز مسؤوليتنا الإجمالية المبلغ المدفوع للطلب المحدد موضع النزاع.',
  },
  {
    title: 'Governing Law',
    titleAr: 'القانون الحاكم',
    body: 'These Terms are governed by the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.',
    bodyAr: 'تخضع هذه الشروط لقوانين الإمارات العربية المتحدة. تخضع أي نزاعات للاختصاص القضائي الحصري لمحاكم دبي، الإمارات العربية المتحدة.',
  },
]

export default function TermsPage() {
  const { lang } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-content-primary">
              {lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </h1>
            <p className="mt-3 text-content-muted text-sm">
              {lang === 'ar' ? 'آخر تحديث: يناير 2025' : 'Last updated: January 2025'}
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {sections.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-brand-purple/10 p-6">
                <h2 className="text-lg font-bold text-content-primary mb-3">
                  {lang === 'ar' ? s.titleAr : s.title}
                </h2>
                <p className="text-sm text-content-secondary leading-relaxed">
                  {lang === 'ar' ? s.bodyAr : s.body}
                </p>
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
