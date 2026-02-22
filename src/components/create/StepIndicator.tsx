'use client'

import { Check } from 'lucide-react'

interface Step {
  id: number
  label: string
}

export default function StepIndicator({ steps, currentStep }: { steps: Step[]; currentStep: number }) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center min-w-max mx-auto px-4">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isActive = step.id === currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-brand-purple text-white'
                      : isActive
                      ? 'step-active text-white ring-2 ring-brand-purple/25 ring-offset-2 ring-offset-surface-page'
                      : 'bg-surface-subtle text-content-muted border border-brand-purple/15'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" strokeWidth={2.5} /> : step.id}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive ? 'text-brand-purple' : isCompleted ? 'text-content-secondary' : 'text-content-placeholder'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`h-px w-12 sm:w-16 mx-2 mb-5 transition-all duration-500 ${
                    isCompleted ? 'bg-brand-purple/50' : 'bg-brand-purple/12'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
