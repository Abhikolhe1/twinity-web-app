'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { WizardState } from './types'

const INITIAL_STATE: WizardState = {
  productType: 'greeting',
  celebrity: null,
  template: null,
  purpose: '',
  customScript: '',
  templateVariables: {},
  duration: null,
  aspectRatio: '16:9',
  resolution: null,
  channels: [],
  language: 'en',
  useCustomScript: false,
  voiceModel: 'eleven_v3',
  voiceSpeed: 1.0,
  voiceChangeEnabled: false,
  voiceChangeSourceUrl: null,
  backgroundImageUrl: null,
  propImages: [],
  sceneNotes: '',
}

const STORAGE_KEY = 'twinity_wizard'

interface WizardContextType {
  state: WizardState
  update: (updates: Partial<WizardState>) => void
  reset: () => void
}

const WizardContext = createContext<WizardContextType>({
  state: INITIAL_STATE,
  update: () => {},
  reset: () => {},
})

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WizardState>(INITIAL_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) setState(JSON.parse(stored))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state, hydrated])

  const update = (updates: Partial<WizardState>) =>
    setState(prev => ({ ...prev, ...updates }))

  const reset = () => {
    try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
    setState(INITIAL_STATE)
  }

  return (
    <WizardContext.Provider value={{ state, update, reset }}>
      {children}
    </WizardContext.Provider>
  )
}

export const useWizard = () => useContext(WizardContext)
