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
import { WizardState, Celebrity, ProductTypeId, Template } from '@/lib/types'
import { useLanguage } from '@/lib/context'

const INITIAL_STATE: WizardState = {
  productType: null,
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
  const { tr } = useLanguage()
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

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
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
            {step === 1 && <StepProductType state={state} onSelect={(id: ProductTypeId) => update({ productType: id })} onNext={() => setStep(2)} />}
            {step === 2 && <StepCelebrity state={state} onSelect={(celebrity: Celebrity) => update({ celebrity })} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <StepTemplate state={state} onSelect={(template: Template) => update({ template })} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
            {step === 4 && <StepCustomize state={state} onChange={update} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
            {step === 5 && <StepReview state={state} onNext={() => setStep(6)} onBack={() => setStep(4)} />}
            {step === 6 && <StepBookCall state={state} onBack={() => setStep(5)} onReset={reset} />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
