'use client'

import { useWizard } from '@/lib/wizard-context'
import StepCelebrity from '@/components/create/StepCelebrity'
import { Celebrity } from '@/lib/types'

export default function CelebrityPage() {
  const { state, update } = useWizard()
  return (
    <StepCelebrity
      state={state}
      onSelect={(celebrity: Celebrity) => update({ celebrity })}
    />
  )
}
