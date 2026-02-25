'use client'

import React from 'react'
import { Check } from 'lucide-react'

interface Step {
  id: number
  label: string
}

export default function StepIndicator({ steps, currentStep }: { steps: Step[]; currentStep: number }) {
  return (
    <div className="max-w-4xl mx-auto overflow-x-auto scrollbar-hide">
      <div className="flex items-start min-w-max sm:min-w-0 sm:w-full px-2 sm:px-0">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isActive    = step.id === currentStep
          const isLast      = index === steps.length - 1

          return (
            <React.Fragment key={step.id}>
              {/* Step node — fixed width so all connectors share space equally */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 w-14 sm:w-20">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-brand-purple text-white'
                      : isActive
                      ? 'step-active text-white ring-2 ring-brand-purple/25 ring-offset-2 ring-offset-surface-page'
                      : 'bg-white text-content-muted border-2 border-gray-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.5} /> : step.id}
                </div>
                <span
                  className={`text-[12px] sm:text-xs font-medium text-center whitespace-nowrap leading-tight transition-colors ${
                    isActive ? 'text-brand-purple' : isCompleted ? 'text-content-secondary' : 'text-content-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className="flex-1 h-[3px] mt-4 rounded transition-all duration-500 min-w-[24px] mx-2 sm:mx-0"
                  style={{ background: isCompleted ? '#9a78fe' : '#c8bde0' }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
