'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { type ApiUser, clearToken, setToken } from '@/lib/api'

type UserContextValue = {
  user: ApiUser | null
  isLoading: boolean
  login: (token: string, user: ApiUser) => void
  logout: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]           = useState<ApiUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem('twinity_user')
    if (raw) {
      try { setUser(JSON.parse(raw) as ApiUser) } catch { /* ignore */ }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((token: string, apiUser: ApiUser) => {
    setToken(token)
    localStorage.setItem('twinity_user', JSON.stringify(apiUser))
    setUser(apiUser)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    localStorage.removeItem('twinity_user')
    setUser(null)
    window.location.href = '/login'
  }, [])

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be inside <UserProvider>')
  return ctx
}
