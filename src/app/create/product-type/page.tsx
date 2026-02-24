'use client'

import { useWizard } from '@/lib/wizard-context'
import StepProductType from '@/components/create/StepProductType'
import { ProductTypeId } from '@/lib/types'

export default function ProductTypePage() {
  const { state, update } = useWizard()
  return (
    <StepProductType
      state={state}
      onSelect={(id: ProductTypeId) => update({ productType: id })}
    />
  )
}
