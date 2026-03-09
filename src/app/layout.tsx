import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/lib/context'
import GoogleProvider from '@/components/providers/GoogleProvider'

export const metadata: Metadata = {
  title: 'Twinity — Celebrity Video Platform',
  description:
    'Create hyper-realistic celebrity video content for ads, announcements, and personal occasions.',
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
