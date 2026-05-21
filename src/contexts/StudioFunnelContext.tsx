'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'
import { StudioTabbedFunnels } from '@/components/studio/StudioTabbedFunnels'
import type { StudioFunnelTab } from '@/components/studio/StudioTabbedFunnels'

type StudioFunnelContextValue = {
  openFunnel: (tab?: StudioFunnelTab) => void
  closeFunnel: () => void
}

const StudioFunnelContext = createContext<StudioFunnelContextValue | null>(null)

export function StudioFunnelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen]         = useState(false)
  const [tab, setTab]           = useState<StudioFunnelTab>('greeting')
  const [sessionId, setSessionId] = useState(0)

  const openFunnel = useCallback((t: StudioFunnelTab = 'greeting') => {
    setTab(t)
    setOpen(true)
    setSessionId((s) => s + 1)
  }, [])

  const closeFunnel = useCallback(() => setOpen(false), [])

  return (
    <StudioFunnelContext.Provider value={{ openFunnel, closeFunnel }}>
      <StudioTabbedFunnels open={open} onClose={closeFunnel} initialTab={tab} sessionId={sessionId} />
      {children}
    </StudioFunnelContext.Provider>
  )
}

export function useStudioFunnel(): StudioFunnelContextValue {
  const ctx = useContext(StudioFunnelContext)
  if (!ctx) throw new Error('useStudioFunnel must be used inside <StudioFunnelProvider>')
  return ctx
}
