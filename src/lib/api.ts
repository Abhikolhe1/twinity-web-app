/**
 * Twinity API Client
 * Connects the customer-facing app to twinity-api (Node.js backend).
 * Falls back gracefully to mock data when the API is unavailable (dev mode).
 */
import type { MockRequest } from '@/lib/studio/mock-requests'
import type { RequestStatus } from '@/lib/request-statuses'
import {
  buildImageAdResumeDraft,
  buildGreetingResumeDraft,
  buildCampaignResumeDraft,
  formatValidationReason,
} from '@/lib/request-recovery'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
export const ADMIN_PORTAL_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001'

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
  phone?: string
  company?: string
}
export interface ApiCelebrity {
  id: string; name: string; name_ar: string; slug: string; industry: string
  nationality: string; nationality_ar: string; languages: string[]; tags: string[]; tags_ar: string[]
  initials: string; avatar_color: string; thumbnail_url?: string; is_active: boolean; is_featured: boolean
  allowed_content_categories?: string[]
  prohibited_industries?: string[]
  competitor_brands?: string[]
  geographic_availability?: {
    mode?: string
    allowedRegions?: string[]
    restrictedRegions?: string[]
  } | null
  price_range: { greeting: {min:number;max:number}; 'video-ad': {min:number;max:number} }
  total_orders: number
}
export interface ApiRefundSummary {
  id: string
  status: string
  reason: string
  requested_amount?: number | null
  approved_amount?: number | null
  currency?: string
  admin_note?: string | null
  requested_at: string
  decision_at?: string | null
  processed_at?: string | null
}
export interface ApiVideoJob {
  id: string; reference_id: string; status: string; product_type: string; purpose: string
  template_id?: string
  script: string; processed_script?: string; estimated_price: number; currency: string; download_enabled: boolean
  preview_url?: string; watermarked_url?: string; final_video_url?: string
  error_message?: string; celebrity_id?: string; aspect_ratio?: string; channels?: string[]; duration?: string; scene_notes?: string
  approval_path?: string
  submission_context?: Record<string, unknown>
  validation_result?: Record<string, unknown>
  celebrity?: { name: string; name_ar: string; initials: string; avatar_color: string; thumbnail_url?: string }
  created_at: string
  status_history?: { status: string; timestamp: string; note?: string }[]
  client_preview_approved_at?: string | null
  refund_requests?: ApiRefundSummary[]
}

function hasMediaUrls(job: Pick<ApiVideoJob, 'preview_url' | 'watermarked_url' | 'final_video_url'>): boolean {
  return Boolean(job.preview_url || job.watermarked_url || job.final_video_url)
}

function isValidationFailure(job: Pick<ApiVideoJob, 'error_message' | 'validation_result'>): boolean {
  const blockedWords = Array.isArray((job.validation_result as Record<string, unknown> | undefined)?.blockedWords)
    ? ((job.validation_result as Record<string, unknown>).blockedWords as unknown[])
    : []
  if (blockedWords.length > 0) return true

  const error = String(job.error_message || '').toLowerCase()
  if (!error) return false
  return (
    error.includes('validation')
    || error.includes('prohibited')
    || error.includes('restricted content')
    || error.includes('blocked')
  )
}

export interface SubmissionValidationIssue {
  field: string
  code: string
  message: string
}

export interface SubmissionValidationResult {
  valid: boolean
  errors: SubmissionValidationIssue[]
  warnings: string[]
  approvalPath: 'fast_track' | 'full_review'
  businessVerificationRequired: boolean
  businessVerificationPassed: boolean
  slaHours: number
  pricingSnapshot: {
    subtotal: number
    vat: number
    total: number
    currency: string
  }
  normalized: {
    productType: 'greeting' | 'video-ad' | 'image-ad'
    purpose: string
    script: string
    channels: string[]
    templateId?: string
    duration?: string
    territory?: string
    exclusivity?: boolean
    aspectRatio?: string
  }
}

// ── Auth ───────────────────────────────────────────────────
export const authApi = {
  register: (body: { name: string; email: string; password: string; phone?: string; company?: string; accountType?: string }) =>
    api<{ success: boolean; token: string; user: ApiUser }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    api<{ success: boolean; token: string; user: ApiUser }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  googleAuth: (accessToken: string, accountType?: string) =>
    api<{ success: boolean; token: string; user: ApiUser }>('/auth/google', { method: 'POST', body: JSON.stringify({ accessToken, accountType }) }),

  getMe: () =>
    api<{ success: boolean; user: ApiUser }>('/auth/me'),

  updateProfile: (body: { name?: string; avatar_url?: string; phone?: string; company?: string; accountType?: string }) =>
    api<{ success: boolean; user: ApiUser }>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  forgotPassword: (email: string) =>
    api<{ success: boolean; message: string; resetUrl?: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    api<{ success: boolean; message: string }>(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify({ password }) }),

  setPassword: (password: string) =>
    api<{ success: boolean; message: string }>('/auth/set-password', { method: 'POST', body: JSON.stringify({ password }) }),

  sendOtp: (email: string, type: string) =>
    api<{ success: boolean; message: string }>('/otp/send', { method: 'POST', body: JSON.stringify({ email, type }) }),

  verifyOtp: (email: string, code: string, type: string) =>
    api<{ success: boolean; message: string }>('/otp/verify', { method: 'POST', body: JSON.stringify({ email, code, type }) }),
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
  validateSubmission: (body: {
    celebrityId: string
    productType: string
    purpose: string
    script: string
    templateId?: string
    channels?: string[]
    duration?: string
    territory?: string
    exclusivity?: boolean | string
    estimatedPrice?: number
    aspectRatio?: string
    briefObjective?: string
    briefAudience?: string
    resumeReferenceId?: string | null
  }) => api<{ success: boolean; data: SubmissionValidationResult }>('/jobs/validate-submission', { method: 'POST', body: JSON.stringify(body) }),

  create: (body: {
    celebrityId: string; productType: string; purpose: string; script: string
    templateId?: string; tone?: string; duration?: string; aspectRatio?: string; resolution?: string; channels?: string[]
    territory?: string; exclusivity?: boolean | string; estimatedPrice?: number
    briefObjective?: string; briefAudience?: string
    propImages?: string[]; sceneNotes?: string; backgroundImageUrl?: string
    voiceModel?: string; voiceSpeed?: number
    voiceChangeEnabled?: boolean; voiceChangeSourceUrl?: string
    voiceAudioUrl?: string
    audioDuration?: number
    resumeReferenceId?: string | null
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

  requestRefund: (referenceId: string, reason: string) =>
    api<{ success: boolean; data: ApiRefundSummary; message: string }>(`/jobs/my/${referenceId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

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

  // TWIN-50: Preview & Revision
  approvePreview: (referenceId: string) =>
    api<{ success: boolean; message: string }>(`/jobs/my/${referenceId}/approve-preview`, { method: 'POST' }),

  requestRevision: (referenceId: string, reason: string) =>
    api<{
      success: boolean; message: string
      classification?: 'minor' | 'material'
      revision?: ApiRevision
      attemptNumber?: number
      limitReached?: boolean
    }>(`/jobs/my/${referenceId}/request-revision`, { method: 'POST', body: JSON.stringify({ reason }) }),

  escalateToSupport: (referenceId: string, reason?: string) =>
    api<{ success: boolean; message: string }>(`/jobs/my/${referenceId}/escalate-to-support`, { method: 'POST', body: JSON.stringify({ reason }) }),

  getRevisions: (referenceId: string) =>
    api<{
      success: boolean
      data: ApiRevision[]
      meta: { revisionCount: number; revisionLimit: number; revisionsRemaining: number; isEscalatedToSupport: boolean }
    }>(`/jobs/my/${referenceId}/revisions`),
}

export interface ApiRevision {
  id: string
  video_job_id: string
  attempt_number: number
  type: 'minor' | 'material' | 'escalation'
  reason: string
  classification?: 'minor' | 'material' | 'escalation'
  classification_note?: string
  status: 'pending' | 'approved' | 'rejected' | 'escalated'
  submitted_by_user_id: string
  provider_job_id?: string
  escalation_note?: string
  created_at: string
  updated_at: string
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

export const celebrityOnboardingApi = {
  submit: (body: {
    name: string
    email: string
    otpCode: string
    phone?: string
    region?: string
    nationality: string
    industry: string
    languages?: string[]
    bio?: string
  }) => api<{ success: boolean; message: string }>('/celebrity-onboarding', { method: 'POST', body: JSON.stringify(body) }),
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
  retry: (referenceId: string, body: {
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
      `/image-ads/${referenceId}/retry`,
      { method: 'POST', body: JSON.stringify(body) },
    ),
}

// ── Job → UI request mapper ────────────────────────────────
function apiStatusToUIStatus(
  status: string,
  job?: Pick<ApiVideoJob, 'preview_url' | 'watermarked_url' | 'final_video_url' | 'error_message' | 'validation_result'>,
): RequestStatus {
  switch (status) {
    case 'pending':     return 'PENDING_VALIDATION'
    case 'in-progress': return 'PROVIDER_PROCESSING'
    case 'review':      return job && !hasMediaUrls(job) ? 'PROVIDER_PROCESSING' : 'PREVIEW_REVIEW'
    case 'delivered':   return 'DELIVERED'
    case 'failed':      return job && isValidationFailure(job) ? 'VALIDATION_FAILED' : 'PROCESSING_FAILED'
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
  const isImageAd = job.product_type === 'image_ad' || job.product_type === 'image-ad'
  const isGreeting = job.product_type === 'greeting'
  const isCampaign = job.product_type === 'video-ad' || job.product_type === 'custom'

  let resumeDraft = null
  if (isImageAd) {
    resumeDraft = buildImageAdResumeDraft(job as any)
  } else if (isGreeting) {
    resumeDraft = buildGreetingResumeDraft(job as any)
  } else if (isCampaign) {
    resumeDraft = buildCampaignResumeDraft(job as any)
  }

  return {
    requestId: job.reference_id,
    orderId:   job.reference_id,
    status:    apiStatusToUIStatus(job.status, job),
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
    licenseScope: (isImageAd || isCampaign) && resumeDraft ? {
      channels: (resumeDraft as any).channels ?? [],
      territory: (resumeDraft as any).territory ?? 'To be confirmed',
      duration: (resumeDraft as any).duration ?? 'To be confirmed',
      exclusivity: (resumeDraft as any).exclusivity ? 'Exclusive' : 'Non-exclusive',
      deliverableType: isImageAd ? 'Licensed image asset' : 'Licensed commercial video',
    } : undefined,
    adImageBrief: isImageAd && resumeDraft ? {
      prompt: (resumeDraft as any).prompt,
      style: 'Image Ad',
      aspectRatio: (resumeDraft as any).aspectRatio,
      usageDeclaration: (resumeDraft as any).channels?.length > 0 ? (resumeDraft as any).channels.join(', ') : 'Usage channels to be confirmed',
    } : undefined,
    previewUrl:        job.watermarked_url ?? job.preview_url,
    finalUrl:          job.final_video_url ?? job.watermarked_url ?? job.preview_url,
    isPreviewApproved: Boolean(job.client_preview_approved_at),
    createdAt:         job.created_at,
    mediaType:         isImageAd ? 'image' : 'video',
    validationReason: formatValidationReason(job.error_message),
    resumeDraft:      resumeDraft ?? undefined,
    refund: job.refund_requests?.[0]
      ? {
          id: job.refund_requests[0].id,
          status: job.refund_requests[0].status,
          reason: job.refund_requests[0].reason,
          requestedAt: job.refund_requests[0].requested_at,
          requestedAmount: job.refund_requests[0].requested_amount,
          approvedAmount: job.refund_requests[0].approved_amount,
          currency: job.refund_requests[0].currency,
          adminNote: job.refund_requests[0].admin_note,
        }
      : undefined,
  }
}
