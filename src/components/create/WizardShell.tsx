'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { WizardProvider } from '@/lib/wizard-context'
import { useLanguage } from '@/lib/context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StepIndicator from '@/components/create/StepIndicator'
import StickyStepBar from '@/components/create/StickyStepBar'

const STEP_SLUGS = ['product-type', 'celebrity', 'template', 'customize', 'review', 'book-call']

function stepFromPathname(pathname: string): number {
  const segment = pathname.split('/').pop() ?? ''
  const idx = STEP_SLUGS.indexOf(segment)
  return idx >= 0 ? idx + 1 : 0
}

function Shell({ children }: { children: React.ReactNode }) {
  const { tr } = useLanguage()
  const pathname = usePathname()
  const currentStep = stepFromPathname(pathname)
  const isSuccess = pathname.endsWith('/success')

  const steps = [
    { id: 1, label: tr.create.step1 },
    { id: 2, label: tr.create.step2 },
    { id: 3, label: tr.create.step3 },
    { id: 4, label: tr.create.step4 },
    { id: 5, label: tr.create.step5 },
    { id: 6, label: tr.create.step6 },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />

      {/* Decorative orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[600px] h-[600px] opacity-20"
          style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', top: '-15%', right: '-10%' }} />
        <div className="orb w-80 h-80 opacity-10"
          style={{ background: 'radial-gradient(circle, #422266, transparent)', bottom: '5%', left: '-5%', animationDelay: '4s' }} />
      </div>

      <main className="flex-1 pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          {!isSuccess && (
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-content-primary">{tr.create.title}</h1>
            </div>
          )}

          {!isSuccess && currentStep > 0 && (
            <div className="mb-10">
              <StepIndicator steps={steps} currentStep={currentStep} />
            </div>
          )}

          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>

      {!isSuccess && currentStep > 0 && <StickyStepBar />}

      <Footer />
    </div>
  )
}

export default function WizardShell({ children }: { children: React.ReactNode }) {
  return (
    <WizardProvider>
      <Shell>{children}</Shell>
    </WizardProvider>
  )
}
