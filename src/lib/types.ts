export type Language = 'en' | 'ar'
export type Direction = 'ltr' | 'rtl'

export type Industry =
  | 'all'
  | 'entertainment'
  | 'sports'
  | 'music'
  | 'business'
  | 'social-media'
  | 'tv-film'

export type ProductTypeId = 'avatar-studio' | 'full-body' | 'greeting'

export type Tone =
  | 'professional'
  | 'casual'
  | 'energetic'
  | 'warm'
  | 'inspirational'
  | 'humorous'

export type Channel =
  | 'social-media'
  | 'tv-ad'
  | 'website'
  | 'email'
  | 'event'
  | 'youtube'

export type Duration = '15s' | '30s' | '60s' | '90s' | '2min'

export interface Celebrity {
  id: string
  name: string
  nameAr: string
  industry: Exclude<Industry, 'all'>
  verified: boolean
  nationality: string
  nationalityAr: string
  languages: string[]
  tags: string[]
  tagsAr: string[]
  avatarColor: string // CSS gradient string
  initials: string
  priceRange: {
    'avatar-studio': { min: number; max: number }
    'full-body': { min: number; max: number }
    greeting: { min: number; max: number }
  }
}

export interface ProductType {
  id: ProductTypeId
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  detail: string
  detailAr: string
  icon: string
  priceFrom: number
  duration: string
  durationAr: string
  useCases: string[]
  useCasesAr: string[]
}

export interface Template {
  id: string
  purpose: string
  purposeAr: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  sampleScript: string
  sampleScriptAr: string
  productTypes: ProductTypeId[]
  duration: Duration
  tags: string[]
}

export interface WizardState {
  productType: ProductTypeId | null
  celebrity: Celebrity | null
  template: Template | null
  purpose: string
  customScript: string
  tone: Tone | null
  duration: Duration | null
  channels: Channel[]
  language: 'en' | 'ar'
  useCustomScript: boolean
}

export interface PriceBreakdown {
  base: number
  complexity: number
  urgency: number
  total: number
  currency: string
}

export interface Order {
  id: string
  status: 'pending' | 'in-progress' | 'review' | 'delivered'
  celebrity: string
  productType: string
  purpose: string
  createdAt: string
  estimatedPrice: number
  currency: string
}
