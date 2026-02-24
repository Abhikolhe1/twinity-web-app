'use client'

import { useWizard } from '@/lib/wizard-context'
import StepTemplate from '@/components/create/StepTemplate'
import { Template } from '@/lib/types'

export default function TemplatePage() {
  const { state, update } = useWizard()
  return (
    <StepTemplate
      state={state}
      onSelect={(template: Template) => update({ template })}
    />
  )
}
