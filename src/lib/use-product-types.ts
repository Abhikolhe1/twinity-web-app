import { useState, useEffect } from 'react'
import { productTypeApi } from './api'
import type { ProductType, ProductTypeId } from './types'

// ── Inline fallback (used only when the API is unreachable) ──
const STATIC_FALLBACK: ProductType[] = [
  {
    id: 'greeting',
    name: 'Celebrity Greetings',
    nameAr: 'تحيات المشاهير',
    description: 'Personal occasions',
    descriptionAr: 'المناسبات الشخصية',
    detail: 'Personalized celebrity messages for birthdays, weddings, graduations, and heartfelt appreciations.',
    detailAr: 'رسائل مشاهير شخصية لأعياد الميلاد والأعراس والتخرج وعبارات الامتنان.',
    icon: '🎉',
    priceFrom: 149,
    duration: 'Delivery in 1–2 business days',
    durationAr: 'التسليم في غضون 1–2 يوم عمل',
    useCases: ['Birthdays', 'Weddings', 'Graduations', 'Corporate Appreciation'],
    useCasesAr: ['أعياد الميلاد', 'الأعراس', 'حفلات التخرج', 'التقدير المؤسسي'],
  },
  {
    id: 'avatar-studio',
    name: 'Short Product Ads',
    nameAr: 'إعلانات المنتجات القصيرة',
    description: 'Short celebrity Ad',
    descriptionAr: 'الرأس والكتفين',
    detail: 'Hyper-realistic video avatars ideal for ads, product launches, and official announcements.',
    detailAr: 'أفاتارات فيديو فائقة الواقعية مثالية للإعلانات وإطلاق المنتجات والإعلانات الرسمية.',
    icon: '🎬',
    priceFrom: 299,
    duration: 'Delivery in 3–5 business days',
    durationAr: 'التسليم في غضون 3–5 أيام عمل',
    useCases: ['Brand Ads', 'Product Launches', 'Corporate Announcements', 'Social Media Posts'],
    useCasesAr: ['إعلانات العلامة التجارية', 'إطلاق المنتجات', 'الإعلانات الشركاتية', 'منشورات وسائل التواصل الاجتماعي'],
  },
  {
    id: 'full-body',
    name: 'Full-Body Digital Twin',
    nameAr: 'التوأم الرقمي للجسم الكامل',
    description: 'Full body celebrity Ad',
    descriptionAr: 'الجسم الكامل + التقاط الحركة',
    detail: 'Complete digital twin with natural body motion for large-scale campaigns and immersive experiences.',
    detailAr: 'توأم رقمي كامل مع حركة جسمية طبيعية للحملات الكبيرة والتجارب الغامرة.',
    icon: '🧬',
    priceFrom: 899,
    duration: 'Delivery in 7–14 business days',
    durationAr: 'التسليم في غضون 7–14 يوم عمل',
    useCases: ['TV Commercials', 'Event Displays', 'Campaign Videos', 'Immersive Brand Experiences'],
    useCasesAr: ['إعلانات تلفزيونية', 'عروض الفعاليات', 'مقاطع فيديو الحملات', 'تجارب العلامة التجارية الغامرة'],
  },
]

// Module-level cache — one fetch, shared across every hook instance
let _cache: ProductType[] | null = null
let _promise: Promise<void> | null = null
const _listeners = new Set<() => void>()

function mapApi(t: Awaited<ReturnType<typeof productTypeApi.list>>['data'][number]): ProductType {
  return {
    id:            t.slug as ProductTypeId,
    name:          t.name,
    nameAr:        t.nameAr,
    description:   t.description,
    descriptionAr: t.descriptionAr,
    detail:        t.detail,
    detailAr:      t.detailAr,
    icon:          t.icon,
    priceFrom:     t.priceFrom,
    duration:      t.duration,
    durationAr:    t.durationAr,
    useCases:      t.useCases,
    useCasesAr:    t.useCasesAr,
  }
}

function ensureFetch() {
  if (_cache || _promise) return
  _promise = productTypeApi.list()
    .then(res => {
      if (res.data?.length) _cache = res.data.map(mapApi)
    })
    .catch(() => {
      _cache = STATIC_FALLBACK
    })
    .finally(() => {
      _listeners.forEach(fn => fn())
    })
}

/**
 * Returns the active product types from the API.
 * One network request is made across the entire app lifetime; subsequent hook
 * instances read from the module-level cache instantly.
 *
 * @returns { productTypes, loading }
 */
export function useProductTypes(): { productTypes: ProductType[]; loading: boolean } {
  const [data,    setData]    = useState<ProductType[] | null>(_cache)
  const [loading, setLoading] = useState(_cache === null)

  useEffect(() => {
    if (_cache) {
      setData(_cache)
      setLoading(false)
      return
    }

    const refresh = () => {
      setData(_cache ?? STATIC_FALLBACK)
      setLoading(false)
    }

    _listeners.add(refresh)
    ensureFetch()

    return () => { _listeners.delete(refresh) }
  }, [])

  return { productTypes: data ?? [], loading }
}
