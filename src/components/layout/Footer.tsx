'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/context'

export default function Footer() {
  const { lang } = useLanguage()

  return (
    <footer className="border-t border-brand-purple/10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo/icon.svg" alt="Twinity" className="w-6 h-6" />
            <span className="text-content-muted text-sm">
              © 2024 Twinity.{' '}
              {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-content-muted">
            <Link href="/privacy" className="hover:text-brand-purple transition-colors">
              {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy'}
            </Link>
            <Link href="/terms" className="hover:text-brand-purple transition-colors">
              {lang === 'ar' ? 'شروط الخدمة' : 'Terms'}
            </Link>
            <Link href="/contact" className="hover:text-brand-purple transition-colors">
              {lang === 'ar' ? 'تواصل معنا' : 'Contact'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
