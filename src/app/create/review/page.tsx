'use client'

import { useWizard } from '@/lib/wizard-context'
import StepReview from '@/components/create/StepReview'

export default function ReviewPage() {
  const { state } = useWizard()
  return <StepReview state={state} />
}
