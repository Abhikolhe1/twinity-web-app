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
  id: string; name: string; email: string; status: string; is_email_verified: boolean; avatar_url?: string
  auth_provider: 'email' | 'google'
  has_email_password: boolean
  account_type: 'individual' | 'influencer' | 'agency'
}
export interface ApiCelebrity {
  id: string; name: string; name_ar: string; slug: string; industry: string
  nationality: string; nationality_ar: string; languages: string[]; tags: string[]; tags_ar: string[]
  initials: string; avatar_color: string; thumbnail_url?: string; is_active: boolean; is_featured: boolean
  price_range: { greeting: {min:number;max:number}; 'video-ad': {min:number;max:number} }
  total_orders: number
}
export interface ApiVideoJob {
  id: string; reference_id: string; status: string; product_type: string; purpose: string
  script: string; processed_script?: string; estimated_price: number; currency: string; download_enabled: boolean
  preview_url?: string; watermarked_url?: string; final_video_url?: string
  error_message?: string
  celebrity?: { name: string; name_ar: string; initials: string; avatar_color: string; thumbnail_url?: string }
  created_at: string
  status_history?: { status: string; timestamp: string; note?: string }[]
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

  updateProfile: (body: { name?: string; avatar_url?: string }) =>
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
    voiceModel?: string; voiceSpeed?: number
    voiceChangeEnabled?: boolean; voiceChangeSourceUrl?: string
    voiceAudioUrl?: string
    audioDuration?: number
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

  getDownloadBlob: async (referenceId: string): Promise<Blob> => {
    const token = getToken()
    const res = await fetch(`${BASE}/jobs/my/${referenceId}/download-url`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { message?: string }
      throw new Error(data.message || 'Download failed')
    }
    return res.blob()
  },

  bookCall: (referenceId: string, body: { name: string; email: string; phone?: string; company?: string; notes?: string }) =>
    api<{ success: boolean; message: string }>(`/jobs/my/${referenceId}/book-call`, { method: 'POST', body: JSON.stringify(body) }),

  previewVoice: (body: {
    celebrityId: string; script: string
    voiceModel?: string; voiceSpeed?: number
    voiceChangeEnabled?: boolean; voiceChangeSourceUrl?: string
  }) => api<{ success: boolean; audioUrl: string; durationSecs?: number }>('/jobs/preview-voice', { method: 'POST', body: JSON.stringify(body) }),

  improveScript: (body: { script: string; celebrityName: string; productType: string; purpose?: string }) =>
    api<{ success: boolean; improvedScript: string }>('/jobs/improve-script', { method: 'POST', body: JSON.stringify(body) }),

  scenePrompts: (body: { celebrityName: string; productType: string; purpose?: string; script?: string }) =>
    api<{ success: boolean; suggestions: string[] }>('/jobs/scene-prompts', { method: 'POST', body: JSON.stringify(body) }),

  generateImage: (body: {
    prompt: string
    productTypeSlug?: string
    celebrityImageUrl?: string
    propImages?: string[]
    chatHistory?: Array<{ role: 'user' | 'model'; text: string; imageUrl?: string }>
  }) => api<{ success: boolean; imageUrl: string; revisedPrompt?: string }>('/jobs/generate-image', { method: 'POST', body: JSON.stringify(body) }),

  uploadAsset: (dataUrl: string) =>
    api<{ success: boolean; url: string }>('/jobs/upload-asset', { method: 'POST', body: JSON.stringify({ dataUrl }) }),
}

// ── Templates ──────────────────────────────────────────────
export interface ApiTemplate {
  id: string
  name: string
  name_ar: string
  description: string
  description_ar: string
  purpose: string
  purpose_ar: string
  sample_script: string
  sample_script_ar: string
  product_types: string[]
  duration: string
}

export const templateApi = {
  list: (productType?: string) => {
    const qs = productType ? `?productType=${encodeURIComponent(productType)}` : ''
    return api<{ success: boolean; data: ApiTemplate[]; total: number }>(`/templates${qs}`)
  },
}

// ── Product Types (public) ─────────────────────────────────
export interface ApiProductType {
  id: string
  slug: string
  name: string
  name_ar: string
  description: string
  description_ar: string
  detail: string
  detail_ar: string
  icon: string
  price_from: number
  duration: string
  duration_ar: string
  use_cases: string[]
  use_cases_ar: string[]
  is_active: boolean
  order: number
}

export const productTypeApi = {
  list: () => api<{ success: boolean; data: ApiProductType[]; total: number }>('/product-types'),
}

// ── Settings (public) ──────────────────────────────────────
export const settingsApi = {
  getBlockedWords: () => api<{ success: boolean; data: string[] }>('/admin/settings/blocked-words'),
}

// ── Leads (contact form) ───────────────────────────────────
export const leadApi = {
  contactForm: (body: { name: string; email: string; company?: string; message: string; productType?: string; purpose?: string }) =>
    api<{ success: boolean; message: string }>('/leads/contact', { method: 'POST', body: JSON.stringify(body) }),
}

// ── Image Ad (Video Ad) ────────────────────────────────────
export const imageAdApi = {
  generate: (body: {
    celebrityId:    string
    prompt:         string
    style?:         string
    aspectRatio?:   string
    channels?:      string[]
    duration?:      string
    territory?:     string
    exclusivity?:   boolean
    estimatedPrice?: number
  }) =>
    api<{ success: boolean; referenceId: string; message: string }>(
      '/image-ads/generate',
      { method: 'POST', body: JSON.stringify(body) },
    ),
}

// ── Job → UI request mapper ────────────────────────────────
import type { MockRequest } from '@/lib/studio/mock-requests'
import type { RequestStatus } from '@/lib/request-statuses'

function apiStatusToUIStatus(status: string): RequestStatus {
  switch (status) {
    case 'pending':     return 'PENDING_VALIDATION'
    case 'in-progress': return 'PROVIDER_PROCESSING'
    case 'review':      return 'PREVIEW_REVIEW'
    case 'delivered':   return 'DELIVERED'
    case 'failed':      return 'VALIDATION_FAILED'
    case 'cancelled':   return 'CANCELLED'
    default:            return 'PENDING_VALIDATION'
  }
}

function apiProductTypeToUIType(productType: string): MockRequest['type'] {
  if (productType === 'greeting')                              return 'GREETING'
  if (productType === 'image_ad' || productType === 'image-ad') return 'AD_IMAGE'
  if (productType === 'custom')                                return 'CUSTOM_CAMPAIGN'
  return 'CAMPAIGN'
}

export function mapApiJobToRequest(job: ApiVideoJob): MockRequest {
  return {
    requestId: job.reference_id,
    orderId:   job.reference_id,
    status:    apiStatusToUIStatus(job.status),
    type:      apiProductTypeToUIType(job.product_type),
    celebrity: {
      name:      job.celebrity?.name ?? 'Celebrity',
      stageName: job.celebrity?.name ?? 'Celebrity',
      avatarUrl: job.celebrity?.thumbnail_url,
    },
    payment: {
      subtotal: job.estimated_price,
      vat:      Math.round(job.estimated_price * 0.15),
      total:    Math.round(job.estimated_price * 1.15),
      status:   'paid',
    },
    previewUrl: job.watermarked_url ?? job.preview_url,
    finalUrl:   job.final_video_url ?? job.watermarked_url ?? job.preview_url,
    createdAt:  job.created_at,
    mediaType:  'video',
  }
}
