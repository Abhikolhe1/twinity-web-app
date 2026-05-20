import type { Metadata, Viewport } from 'next'
import React from 'react'

import { ThemeProvider }   from '@/components/theme-provider'
import { UserProvider }    from '@/contexts/UserContext'
import { GoogleProvider }  from '@/components/providers/GoogleProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Twinity — Licensed Celebrity Identity',
  description:
    "Saudi Arabia's first governed platform to license celebrity identity for commercial video and voice — approved, watermarked, and delivered.",
  keywords: [
    'celebrity licensing',
    'Saudi Arabia',
    'video content',
    'voice licensing',
    'GCC',
    'celebrity identity',
    'licensed content',
  ],
  openGraph: {
    title: 'Twinity — Licensed. Controlled. Trusted.',
    description:
      'License celebrity identity for video and voice. Governed, approved, delivered.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr" className="h-full dark" suppressHydrationWarning>
      {/*
        Aeonik Pro is loaded via @font-face in globals.css from /public/fonts/.
        Arabic fonts (Noto Kufi Arabic) are loaded conditionally at the component
        level to avoid blocking renders for English-locale sessions.
      */}
      <body className="min-h-full" suppressHydrationWarning>
        <GoogleProvider>
          <UserProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </UserProvider>
        </GoogleProvider>
      </body>
    </html>
  )
}
