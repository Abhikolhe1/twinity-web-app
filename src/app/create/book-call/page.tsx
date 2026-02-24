'use client'

import { useWizard } from '@/lib/wizard-context'
import StepBookCall from '@/components/create/StepBookCall'

export default function BookCallPage() {
  const { state } = useWizard()
  return <StepBookCall state={state} />
}
