import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/lib/context'
import GoogleProvider from '@/components/providers/GoogleProvider'

export const metadata: Metadata = {
  title: {
    default: 'Twinity — Celebrity Video Platform',
    template: '%s · Twinity',
  },
  description:
    'Create hyper-realistic celebrity video content for ads, announcements, and personal occasions.',
  icons: {
    icon: [
      { url: '/logo/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo/icon-white.png',
    shortcut: '/logo/icon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <GoogleProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </GoogleProvider>
      </body>
    </html>
  )
}
