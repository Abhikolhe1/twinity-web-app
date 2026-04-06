/**
 * Twinity API Client
 * Connects the customer-facing app to twinity-api (Node.js backend).
 * Falls back gracefully to mock data when the API is unavailable (dev mode).
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// ── Token management ───────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('twinity_token')
}
export function setToken(t: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('twinity_token', t)
  // Cookie lets middleware guard routes server-side (no localStorage on Edge)
  document.cookie = 'twinity_auth=1; path=/; SameSite=Lax; Max-Age=604800'
}
export function clearToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('twinity_token')
  document.cookie = 'twinity_auth=; path=/; SameSite=Lax; Max-Age=0'
}

// ── Base fetch ─────────────────────────────────────────────
async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  })
  if (res.status === 429) throw new Error('Too many attempts. Please wait a moment and try again.')
  const data = await res.json()
  if (res.status === 401 && getToken()) {
    // Token invalid or account blocked — force logout immediately
    clearToken()
    if (typeof window !== 'undefined')
    throw new Error(data.message || 'Session expired')
  }
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data as T
}

// ── Types ──────────────────────────────────────────────────
export interface ApiUser {
  id: string; name: string; email: string; status: string; isEmailVerified: boolean; avatarUrl?: string
  authProvider: 'email' | 'google'
  hasEmailPassword: boolean
  accountType: 'individual' | 'influencer' | 'agency'
}
export interface ApiCelebrity {
  _id: string; name: string; nameAr: string; slug: string; industry: string
  nationality: string; nationalityAr: string; languages: string[]; tags: string[]; tagsAr: string[]
  initials: string; avatarColor: string; thumbnailUrl?: string; isActive: boolean; isFeatured: boolean
  priceRange: { greeting: {min:number;max:number}; 'avatar-studio': {min:number;max:number}; 'full-body': {min:number;max:number} }
  totalOrders: number
}
export interface ApiVideoJob {
  _id: string; referenceId: string; status: string; productType: string; purpose: string
  script: string; estimatedPrice: number; currency: string; downloadEnabled: boolean
  previewUrl?: string; watermarkedUrl?: string; finalVideoUrl?: string
  errorMessage?: string
  celebrityId: { name: string; nameAr: string; initials: string; avatarColor: string }
  createdAt: string
}

// ── Auth ───────────────────────────────────────────────────
export const authApi = {
  register: (body: { name: string; email: string; password: string; phone?: string; company?: string; accountType?: string }) =>
    api<{ success: boolean; token: string; user: ApiUser }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    api<{ success: boolean; token: string; user: ApiUser }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  googleAuth: (accessToken: string) =>
    api<{ success: boolean; token: string; user: ApiUser }>('/auth/google', { method: 'POST', body: JSON.stringify({ accessToken }) }),

  getMe: () =>
    api<{ success: boolean; user: ApiUser }>('/auth/me'),

  updateProfile: (body: { name?: string; avatarUrl?: string }) =>
    api<{ success: boolean; user: ApiUser }>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  forgotPassword: (email: string) =>
    api<{ success: boolean; message: string; resetUrl?: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    api<{ success: boolean; message: string }>(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify({ password }) }),

  setPassword: (password: string) =>
    api<{ success: boolean; message: string }>('/auth/set-password', { method: 'POST', body: JSON.stringify({ password }) }),
}

// ── Celebrities ────────────────────────────────────────────
export const celebrityApi = {
  list: (params?: { industry?: string; search?: string; featured?: boolean }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return api<{ success: boolean; data: ApiCelebrity[]; total: number }>(`/celebrities${qs ? '?' + qs : ''}`)
  },

  get: (slug: string) =>
    api<{ success: boolean; data: ApiCelebrity }>(`/celebrities/${slug}`),
}

// ── Video Jobs ─────────────────────────────────────────────
export const jobApi = {
  create: (body: {
    celebrityId: string; productType: string; purpose: string; script: string
    templateId?: string; tone?: string; duration?: string; aspectRatio?: string; resolution?: string; channels?: string[]
    propImages?: string[]; sceneNotes?: string; backgroundImageUrl?: string
  }) => api<{ success: boolean; data: ApiVideoJob }>('/jobs', { method: 'POST', body: JSON.stringify(body) }),

  myJobs: (status?: string, page = 1, limit = 12) => {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.set('status', status)
    params.set('page', String(page))
    params.set('limit', String(limit))
    return api<{ success: boolean; data: ApiVideoJob[]; total: number; page: number; pages: number; hasMore: boolean }>(`/jobs/my?${params}`)
  },

  myStats: () =>
    api<{ success: boolean; data: Record<string, number> }>('/jobs/my/stats'),

  cancelJob: (referenceId: string) =>
    api<{ success: boolean; data: ApiVideoJob }>(`/jobs/my/${referenceId}/cancel`, { method: 'POST' }),

  getJob: (referenceId: string) =>
    api<{ success: boolean; data: ApiVideoJob }>(`/jobs/my/${referenceId}`),

  bookCall: (referenceId: string, body: { name: string; email: string; phone?: string; company?: string; notes?: string }) =>
    api<{ success: boolean; message: string }>(`/jobs/my/${referenceId}/book-call`, { method: 'POST', body: JSON.stringify(body) }),

  improveScript: (body: { script: string; celebrityName: string; productType: string; purpose?: string }) =>
    api<{ success: boolean; improvedScript: string }>('/jobs/improve-script', { method: 'POST', body: JSON.stringify(body) }),

  scenePrompts: (body: { celebrityName: string; productType: string; purpose?: string; script?: string }) =>
    api<{ success: boolean; suggestions: string[] }>('/jobs/scene-prompts', { method: 'POST', body: JSON.stringify(body) }),

  generateImage: (body: { prompt: string; chatHistory?: Array<{ role: 'user' | 'model'; text: string; imageUrl?: string }> }) =>
    api<{ success: boolean; imageUrl: string; revisedPrompt?: string }>('/jobs/generate-image', { method: 'POST', body: JSON.stringify(body) }),
}

// ── Templates ──────────────────────────────────────────────
export interface ApiTemplate {
  _id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  purpose: string
  purposeAr: string
  sampleScript: string
  sampleScriptAr: string
  productTypes: string[]
  duration: string
}

export const templateApi = {
  list: (productType?: string) => {
    const qs = productType ? `?productType=${encodeURIComponent(productType)}` : ''
    return api<{ success: boolean; data: ApiTemplate[]; total: number }>(`/templates${qs}`)
  },
}

// ── Leads (contact form) ───────────────────────────────────
export const leadApi = {
  contactForm: (body: { name: string; email: string; company?: string; message: string; productType?: string; purpose?: string }) =>
    api<{ success: boolean; message: string }>('/leads/contact', { method: 'POST', body: JSON.stringify(body) }),
}

// ── Helpers ────────────────────────────────────────────────
import type { Celebrity, Template, ProductTypeId, Duration } from './types'

export function mapApiCeleb(c: ApiCelebrity): Celebrity {
  return {
    id:            c._id,
    name:          c.name,
    nameAr:        c.nameAr,
    industry:      c.industry as Celebrity['industry'],
    verified:      c.isActive,
    nationality:   c.nationality,
    nationalityAr: c.nationalityAr,
    languages:     c.languages,
    tags:          c.tags,
    tagsAr:        c.tagsAr,
    avatarColor:   c.avatarColor,
    initials:      c.initials,
    image:         c.thumbnailUrl || '',
    priceRange:    c.priceRange,
  }
}

export function mapApiTemplate(t: ApiTemplate): Template {
  return {
    id:             t._id,
    name:           t.name,
    nameAr:         t.nameAr,
    description:    t.description,
    descriptionAr:  t.descriptionAr,
    purpose:        t.purpose,
    purposeAr:      t.purposeAr,
    sampleScript:   t.sampleScript,
    sampleScriptAr: t.sampleScriptAr,
    productTypes:   t.productTypes as ProductTypeId[],
    duration:       (t.duration || '30s') as Duration,
    tags:           [],
  }
}

export function getUserInfo(): { name: string; email: string; company?: string } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('twinity_user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function setUserInfo(user: { name: string; email: string; company?: string }): void {
  if (typeof window !== 'undefined') localStorage.setItem('twinity_user', JSON.stringify(user))
}

export function clearUserInfo(): void {
  if (typeof window !== 'undefined') localStorage.removeItem('twinity_user')
}
