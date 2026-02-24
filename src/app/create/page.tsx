'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StepIndicator from '@/components/create/StepIndicator'
import StepProductType from '@/components/create/StepProductType'
import StepCelebrity from '@/components/create/StepCelebrity'
import StepTemplate from '@/components/create/StepTemplate'
import StepCustomize from '@/components/create/StepCustomize'
import StepReview from '@/components/create/StepReview'
import StepBookCall from '@/components/create/StepBookCall'
import StickyStepBar from '@/components/create/StickyStepBar'
import { WizardState, Celebrity, ProductTypeId, Template } from '@/lib/types'
import { useLanguage } from '@/lib/context'

const INITIAL_STATE: WizardState = {
  productType: 'greeting',
  celebrity: null,
  template: null,
  purpose: '',
  customScript: '',
  tone: null,
  duration: null,
  channels: [],
  language: 'en',
  useCustomScript: false,
}

export default function CreatePage() {
  const { lang, tr } = useLanguage()
  const [step, setStep] = useState(1)
  const [state, setState] = useState<WizardState>(INITIAL_STATE)

  const steps = [
    { id: 1, label: tr.create.step1 },
    { id: 2, label: tr.create.step2 },
    { id: 3, label: tr.create.step3 },
    { id: 4, label: tr.create.step4 },
    { id: 5, label: tr.create.step5 },
    { id: 6, label: tr.create.step6 },
  ]

  const update = (updates: Partial<WizardState>) => setState(prev => ({ ...prev, ...updates }))
  const reset = () => { setState(INITIAL_STATE); setStep(1) }

  const canProceed =
    step === 1 ? !!state.productType :
    step === 2 ? !!state.celebrity :
    step === 3 ? !!state.template :
    true // steps 4 & 5 always allow continue

  const handleNext = () => {
    if (step < 6) setStep(s => s + 1)
  }
  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar />

      {/* Subtle decorative orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[600px] h-[600px] opacity-20"
          style={{ background: 'radial-gradient(circle, #9a78fe, transparent)', top: '-15%', right: '-10%' }} />
        <div className="orb w-80 h-80 opacity-10"
          style={{ background: 'radial-gradient(circle, #422266, transparent)', bottom: '5%', left: '-5%', animationDelay: '4s' }} />
      </div>

      <main className="flex-1 pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-content-primary">{tr.create.title}</h1>
          </div>

          {/* Step Indicator */}
          {step <= 6 && (
            <div className="mb-10">
              <StepIndicator steps={steps} currentStep={step} />
            </div>
          )}

          {/* Step Content */}
          <div className="animate-fade-in">
            {step === 1 && <StepProductType state={state} onSelect={(id: ProductTypeId) => update({ productType: id })} onNext={handleNext} />}
            {step === 2 && <StepCelebrity state={state} onSelect={(celebrity: Celebrity) => update({ celebrity })} onNext={handleNext} onBack={handleBack} />}
            {step === 3 && <StepTemplate state={state} onSelect={(template: Template) => update({ template })} onNext={handleNext} onBack={handleBack} />}
            {step === 4 && <StepCustomize state={state} onChange={update} onNext={handleNext} onBack={handleBack} />}
            {step === 5 && <StepReview state={state} onNext={handleNext} onBack={handleBack} />}
            {step === 6 && <StepBookCall state={state} onBack={handleBack} onReset={reset} />}
          </div>
        </div>
      </main>

      <StickyStepBar
        step={step}
        state={state}
        lang={lang}
        canProceed={canProceed}
        onNext={handleNext}
        onBack={handleBack}
      />

      <Footer />
    </div>
  )
}
