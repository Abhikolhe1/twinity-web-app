'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/lib/context'

const sections = [
  {
    title: 'Information We Collect',
    titleAr: 'المعلومات التي نجمعها',
    body: 'We collect information you provide directly, such as your name, email address, company name, and payment details when you create an account or place an order. We also collect usage data and technical information about how you interact with our platform.',
    bodyAr: 'نجمع المعلومات التي تقدمها مباشرةً، مثل اسمك وعنوان بريدك الإلكتروني واسم شركتك وتفاصيل الدفع عند إنشاء حساب أو تقديم طلب. كما نجمع بيانات الاستخدام والمعلومات التقنية حول كيفية تفاعلك مع منصتنا.',
  },
  {
    title: 'How We Use Your Information',
    titleAr: 'كيف نستخدم معلوماتك',
    body: 'We use your information to provide and improve our services, process transactions, communicate with you about orders and updates, and ensure platform security. We do not sell your personal data to third parties.',
    bodyAr: 'نستخدم معلوماتك لتقديم خدماتنا وتحسينها، ومعالجة المعاملات، والتواصل معك بشأن الطلبات والتحديثات، وضمان أمان المنصة. نحن لا نبيع بياناتك الشخصية لأطراف ثالثة.',
  },
  {
    title: 'Data Storage & Security',
    titleAr: 'تخزين البيانات وأمانها',
    body: 'Your data is stored on secure servers with industry-standard encryption. We implement technical and organisational measures to protect your information against unauthorised access, alteration, or disclosure.',
    bodyAr: 'يتم تخزين بياناتك على خوادم آمنة مع تشفير يتوافق مع معايير الصناعة. نطبّق تدابير تقنية وتنظيمية لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الإفصاح.',
  },
  {
    title: 'Cookies',
    titleAr: 'ملفات الارتباط (Cookies)',
    body: 'We use cookies to maintain your session, remember your preferences, and analyse platform usage. You can control cookie settings through your browser, though some features may not function correctly without them.',
    bodyAr: 'نستخدم ملفات الارتباط للحفاظ على جلستك وتذكّر تفضيلاتك وتحليل استخدام المنصة. يمكنك التحكم في إعدادات ملفات الارتباط من خلال متصفحك، وإن كانت بعض الميزات قد لا تعمل بشكل صحيح بدونها.',
  },
  {
    title: 'Your Rights',
    titleAr: 'حقوقك',
    body: 'You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at privacy@twinity.ai. We will respond within 30 days.',
    bodyAr: 'يحق لك الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها في أي وقت. لممارسة هذه الحقوق، تواصل معنا على privacy@twinity.ai. سنردّ خلال 30 يومًا.',
  },
  {
    title: 'Changes to This Policy',
    titleAr: 'التغييرات على هذه السياسة',
    body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our platform. Continued use of Twinity after changes constitutes acceptance.',
    bodyAr: 'قد نحدّث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة. استمرارك في استخدام Twinity بعد التغييرات يُعدّ قبولًا منك.',
  },
]

export default function PrivacyPage() {
  const { lang } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-content-primary">
              {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
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
