'use client'

import { useWizard } from '@/lib/wizard-context'
import StepCustomize from '@/components/create/StepCustomize'

export default function CustomizePage() {
  const { state, update } = useWizard()
  return <StepCustomize state={state} onChange={update} />
}
