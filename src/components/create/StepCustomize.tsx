'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { WizardState, AspectRatio, Celebrity, Template, Duration, Industry } from '@/lib/types'
import { ASPECT_RATIOS, PRODUCT_TYPES, INDUSTRY_LABELS } from '@/lib/data'
import { useLanguage } from '@/lib/context'
import { TextArea } from '@/components/ui/Input'
import {
  ToggleLeft, ToggleRight, Sparkles, ChevronDown, Wand2, Camera, Upload, X,
  RefreshCw, CheckCheck, Search, ImageIcon, SendHorizontal, Clock,
  FileText, CheckCircle2, Loader2,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import VideoPreview from './VideoPreview'
import CelebrityCard from '@/components/ui/CelebrityCard'
import { jobApi, celebrityApi, templateApi, mapApiCeleb, mapApiTemplate } from '@/lib/api'

const INDUSTRIES: Industry[] = ['all', 'entertainment', 'sports', 'music', 'business', 'social-media', 'tv-film']

const ORDER_REF_KEY = 'twinity_order_ref'

// ── Extract {{variable}} names from a string ───────────────
function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) ?? []
  const names = matches.map(m => m.slice(2, -2))
  return [...new Set(names)]
}

// ── Replace variables in a script ──────────────────────────
function applyVariables(script: string, vars: Record<string, string>): string {
  return script.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? `{{${name}}}`)
}

// ── Highlight variables in a script (JSX) ──────────────────
function ScriptWithHighlights({ script, vars }: { script: string; vars: Record<string, string> }) {
  const parts = script.split(/(\{\{\w+\}\})/g)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\{\{(\w+)\}\}$/)
        if (match) {
          const name = match[1]
          const value = vars[name]
          return (
            <span
              key={i}
              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-semibold mx-0.5"
              style={{
                background: value ? 'rgba(154,120,254,0.15)' : 'rgba(251,191,36,0.15)',
                color: value ? '#6b21a8' : '#92400e',
                border: `1px solid ${value ? 'rgba(154,120,254,0.3)' : 'rgba(251,191,36,0.4)'}`,
              }}
            >
              {value || part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

interface ChatMessage {
  role: 'user' | 'model'
  text: string
  imageUrl?: string
}

interface Props {
  state: WizardState
  onChange: (updates: Partial<WizardState>) => void
}

export default function StepCustomize({ state, onChange }: Props) {
  const { lang, tr } = useLanguage()

  // ── Job generation ──────────────────────────────────────
  const [jobLoading,    setJobLoading]    = useState(false)
  const [jobError,      setJobError]      = useState<string | null>(null)
  const [previewUrl,    setPreviewUrl]    = useState<string | null>(null)
  const [generationKey, setGenerationKey] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Script AI ──────────────────────────────────────────
  const [improving,    setImproving]    = useState(false)
  const [improveError, setImproveError] = useState<string | null>(null)

  // ── Scene Settings ─────────────────────────────────────
  const [sceneOpen, setSceneOpen] = useState(false)

  // ── Celebrity selector ─────────────────────────────────
  const [celebSearch,     setCelebSearch]     = useState('')
  const [industryFilter,  setIndustryFilter]  = useState<Industry>('all')
  const [celebs,          setCelebs]          = useState<Celebrity[]>([])
  const [celebLoading,    setCelebLoading]    = useState(false)

  // ── Template selector ──────────────────────────────────
  const [templates,        setTemplates]        = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templateSearch,   setTemplateSearch]   = useState('')

  // ── Modal open state ───────────────────────────────────
  const [celebModalOpen,    setCelebModalOpen]    = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)

  // ── Gemini image generation ────────────────────────────
  const [imageGenOpen,    setImageGenOpen]    = useState(false)
  const [chatHistory,     setChatHistory]     = useState<ChatMessage[]>([])
  const [chatInput,       setChatInput]       = useState('')
  const [imageGenLoading, setImageGenLoading] = useState(false)
  const [imageGenError,   setImageGenError]   = useState<string | null>(null)

  // ── Load celebrities on mount ──────────────────────────
  useEffect(() => {
    setCelebLoading(true)
    celebrityApi.list()
      .then(res => setCelebs(res.data.map(mapApiCeleb)))
      .catch(() => null)
      .finally(() => setCelebLoading(false))
  }, [])

  // ── Load templates when productType or celebrity changes
  useEffect(() => {
    if (!state.productType) return
    setTemplatesLoading(true)
    templateApi.list(state.productType)
      .then(res => setTemplates(res.data.map(mapApiTemplate)))
      .catch(() => null)
      .finally(() => setTemplatesLoading(false))
  }, [state.productType])

  // ── Filtered celebrities ───────────────────────────────
  const filteredCelebs = useMemo(() => {
    let list = celebs
    if (industryFilter !== 'all') list = list.filter(c => c.industry === industryFilter)
    if (celebSearch.trim()) {
      const q = celebSearch.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.nameAr.includes(q) ||
        c.nationality.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q),
      )
    }
    return list
  }, [celebs, celebSearch, industryFilter])

  // ── Filtered templates ────────────────────────────────
  const filteredTemplates = useMemo(() => {
    if (!templateSearch.trim()) return templates
    const q = templateSearch.toLowerCase()
    return templates.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.nameAr.includes(q) ||
      t.purpose.toLowerCase().includes(q) ||
      t.sampleScript.toLowerCase().includes(q),
    )
  }, [templates, templateSearch])

  // ── Active script & variables ──────────────────────────
  const templateScript = state.template
    ? lang === 'ar' ? state.template.sampleScriptAr : state.template.sampleScript
    : ''

  const templateVariables   = useMemo(() => extractVariables(templateScript), [templateScript])
  const varsState            = state.templateVariables ?? {}
  const resolvedScript       = state.useCustomScript
    ? state.customScript
    : applyVariables(templateScript, varsState)

  const scriptWordCount = resolvedScript.trim() ? resolvedScript.trim().split(/\s+/).length : 0
  const scriptOverLimit = scriptWordCount > 40

  // ── File uploads ───────────────────────────────────────
  const handleBgImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange({ backgroundImageUrl: reader.result as string })
    reader.readAsDataURL(file)
  }, [onChange])

  const handlePropImages = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const readers = files.map(file => new Promise<string>(resolve => {
      const r = new FileReader()
      r.onload = () => resolve(r.result as string)
      r.readAsDataURL(file)
    }))
    Promise.all(readers).then(urls => {
      onChange({ propImages: [...(state.propImages ?? []), ...urls] })
    })
    e.target.value = ''
  }, [onChange, state.propImages])

  const removePropImage = useCallback((index: number) => {
    onChange({ propImages: (state.propImages ?? []).filter((_, i) => i !== index) })
  }, [onChange, state.propImages])

  // ── Celebrity & template selection ────────────────────
  const selectCeleb = (celeb: Celebrity) => {
    onChange({ celebrity: celeb, template: null, templateVariables: {}, customScript: '', useCustomScript: false })
    setCelebModalOpen(false)
  }

  const selectTemplate = (tmpl: Template) => {
    onChange({ template: tmpl, templateVariables: {}, customScript: '', useCustomScript: false })
    setTemplateModalOpen(false)
  }

  // ── Generate video ─────────────────────────────────────
  const handleGenerateVideo = async () => {
    if (!state.celebrity || !state.productType) return
    if (pollRef.current) clearInterval(pollRef.current)

    setJobLoading(true)
    setJobError(null)
    setPreviewUrl(null)
    setGenerationKey(k => k + 1)

    try {
      const script  = resolvedScript
      const purpose = state.template
        ? (lang === 'ar' ? state.template.purposeAr : state.template.purpose)
        : 'Custom Video'

      const res = await jobApi.create({
        celebrityId:        state.celebrity.id,
        productType:        state.productType,
        purpose,
        script,
        templateId:         state.template?.id,
        aspectRatio:        state.aspectRatio ?? undefined,
        channels:           state.channels,
        propImages:         state.propImages?.length ? state.propImages : undefined,
        sceneNotes:         state.sceneNotes || undefined,
        backgroundImageUrl: state.backgroundImageUrl ?? undefined,
      })

      const ref = res.data.referenceId
      try { sessionStorage.setItem(ORDER_REF_KEY, ref) } catch {}

      if (res.data.previewUrl) {
        setPreviewUrl(res.data.previewUrl)
        setJobLoading(false)
        return
      }

      // Poll every 30s until previewUrl appears or job fails
      pollRef.current = setInterval(async () => {
        try {
          const jobRes = await jobApi.getJob(ref)
          const job = jobRes.data
          if (job.previewUrl) {
            setPreviewUrl(job.previewUrl)
            setJobLoading(false)
            if (pollRef.current) clearInterval(pollRef.current)
          } else if (job.status === 'failed' || job.status === 'cancelled') {
            setJobError(job.errorMessage ?? (lang === 'ar' ? 'فشل في توليد الفيديو' : 'Video generation failed'))
            setJobLoading(false)
            if (pollRef.current) clearInterval(pollRef.current)
          }
        } catch { /* ignore transient errors */ }
      }, 30_000)
    } catch (err) {
      setJobError(err instanceof Error ? err.message : 'Failed to submit order')
      setJobLoading(false)
    }
  }

  // ── Improve script with AI ─────────────────────────────
  const handleImproveScript = async () => {
    if (!state.celebrity || !state.productType) return
    const script = state.useCustomScript ? state.customScript : templateScript
    if (!script.trim()) return

    setImproving(true)
    setImproveError(null)
    try {
      const productType = PRODUCT_TYPES.find(p => p.id === state.productType)
      const res = await jobApi.improveScript({
        script,
        celebrityName: lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name,
        productType: productType?.name ?? state.productType ?? '',
        purpose: state.template ? (lang === 'ar' ? state.template.purposeAr : state.template.purpose) : undefined,
      })
      onChange({ customScript: res.improvedScript, useCustomScript: true })
    } catch (err) {
      setImproveError(err instanceof Error ? err.message : 'Failed to improve script')
    } finally {
      setImproving(false)
    }
  }

  // ── Gemini chat send ───────────────────────────────────
  const handleSendImagePrompt = async () => {
    const prompt = chatInput.trim()
    if (!prompt || imageGenLoading) return

    const userMsg: ChatMessage = { role: 'user', text: prompt }
    const newHistory = [...chatHistory, userMsg]
    setChatHistory(newHistory)
    setChatInput('')
    setImageGenLoading(true)
    setImageGenError(null)

    try {
      const res = await jobApi.generateImage({
        prompt,
        chatHistory: chatHistory.map(m => ({ role: m.role, text: m.text, imageUrl: m.imageUrl })),
      })
      const modelMsg: ChatMessage = { role: 'model', text: res.revisedPrompt ?? '', imageUrl: res.imageUrl }
      setChatHistory(prev => [...prev, modelMsg])
    } catch (err) {
      setImageGenError(err instanceof Error ? err.message : 'Image generation failed')
      setChatHistory(prev => prev.slice(0, -1)) // remove the user message on error
    } finally {
      setImageGenLoading(false)
    }
  }

  // ── Clean up polling on unmount ────────────────────────
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  const selectCls = 'w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm font-medium bg-white border border-brand-purple/15 text-content-primary focus:outline-none focus:border-brand-purple/50 focus:ring-2 focus:ring-brand-purple/10 transition-all cursor-pointer'

  const isGreeting = state.productType === 'greeting'
  const hasJobRef  = (() => { try { return !!sessionStorage.getItem(ORDER_REF_KEY) } catch { return false } })()
  const productType  = PRODUCT_TYPES.find(p => p.id === state.productType)
  const productName  = lang === 'ar' ? productType?.nameAr : productType?.name
  const templateName = lang === 'ar' ? state.template?.nameAr : state.template?.name

  return (
    <div className="flex flex-col gap-7 pb-28">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.customize}</h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.create.customizeSub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="flex flex-col gap-7">

      {/* ── 1 + 2. Celebrity & Template trigger cards 50/50 ── */}
      <div className="grid grid-cols-2 gap-4 items-stretch">

      {/* ── Celebrity trigger ─────────────────────── */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-content-primary">
          {lang === 'ar' ? 'اختر المشهور' : 'Select Celebrity'}
          <span className="ml-1 text-red-400">*</span>
        </h3>
        {state.celebrity ? (
          <div
            onClick={() => setCelebModalOpen(true)}
            className="group flex items-center gap-3 p-3 rounded-xl border border-brand-purple/30 bg-surface-subtle cursor-pointer hover:border-brand-purple/60 hover:bg-surface-elevated transition-all h-full"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-brand-purple/20"
              style={{ background: state.celebrity.avatarColor }}>
              <img src={state.celebrity.image} alt={state.celebrity.name} className="w-full h-full object-cover object-top" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-content-primary truncate">
                {lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name}
              </p>
              <p className="text-xs text-content-muted truncate group-hover:text-brand-purple transition-colors">
                {lang === 'ar' ? 'انقر للتغيير' : 'Click to change'}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCelebModalOpen(true)}
            className="flex items-center gap-2 p-4 rounded-xl border-2 border-dashed border-brand-purple/25 bg-surface-subtle/50 hover:border-brand-purple/50 hover:bg-surface-subtle transition-all text-sm text-content-muted hover:text-brand-purple"
          >
            <Search className="w-4 h-4" />
            {lang === 'ar' ? 'اختر مشهوراً...' : 'Choose a celebrity...'}
          </button>
        )}
      </section>

      {/* ── Template trigger ──────────────────────── */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-content-primary">
          {lang === 'ar' ? 'اختر القالب' : 'Select Template'}
          <span className="ml-1 text-red-400">*</span>
        </h3>
        {!state.celebrity ? (
          <div className="flex items-center gap-2 p-4 rounded-xl border-2 border-dashed border-brand-purple/15 bg-surface-subtle/30 text-xs text-content-muted">
            <FileText className="w-4 h-4 opacity-40" />
            {lang === 'ar' ? 'اختر مشهوراً أولاً' : 'Select a celebrity first'}
          </div>
        ) : state.template ? (
          <div
            onClick={() => setTemplateModalOpen(true)}
            className="group p-3 rounded-xl border border-brand-purple/30 bg-surface-subtle flex items-center gap-3 cursor-pointer hover:border-brand-purple/60 hover:bg-surface-elevated transition-all h-full"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(154,120,254,0.12)' }}>
              <FileText className="w-3.5 h-3.5 text-brand-mid" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-content-primary truncate">
                {lang === 'ar' ? state.template.nameAr : state.template.name}
              </p>
              <p className="text-xs text-content-muted truncate group-hover:text-brand-purple transition-colors">
                {lang === 'ar' ? 'انقر للتغيير' : 'Click to change'}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setTemplateModalOpen(true)}
            className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-brand-purple/25 bg-surface-subtle/50 hover:border-brand-purple/50 hover:bg-surface-subtle transition-all text-sm text-content-muted hover:text-brand-purple"
          >
            <FileText className="w-4 h-4" />
            {lang === 'ar' ? 'اختر قالباً...' : 'Choose a template...'}
          </button>
        )}
      </section>

      </div>{/* end 50/50 grid */}

      {/* ── Celebrity Modal ───────────────────────────────── */}
      {celebModalOpen && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCelebModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-purple/10">
              <h3 className="font-bold text-content-primary">
                {lang === 'ar' ? 'اختر المشهور' : 'Select Celebrity'}
              </h3>
              <button onClick={() => setCelebModalOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-subtle transition-colors">
                <X className="w-4 h-4 text-content-muted" />
              </button>
            </div>
            {/* Search + filters */}
            <div className="px-5 py-3 border-b border-brand-purple/8 flex flex-col gap-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
                <input
                  type="text"
                  value={celebSearch}
                  onChange={e => setCelebSearch(e.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث عن مشهور...' : 'Search celebrities...'}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-surface-subtle border border-brand-purple/15 text-content-primary placeholder-content-muted focus:outline-none focus:border-brand-purple/50 transition-all"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {INDUSTRIES.map(ind => {
                  const label = INDUSTRY_LABELS[ind]?.[lang] ?? ind
                  return (
                    <button
                      key={ind}
                      onClick={() => setIndustryFilter(ind)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                        industryFilter === ind
                          ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/35'
                          : 'bg-white text-content-muted border-brand-purple/12 hover:border-brand-purple/30 hover:text-brand-purple'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {celebLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
                </div>
              ) : filteredCelebs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {filteredCelebs.map(celeb => (
                    <CelebrityCard
                      key={celeb.id}
                      celebrity={celeb}
                      selected={state.celebrity?.id === celeb.id}
                      selectedProductType={state.productType}
                      onSelect={selectCeleb}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-sm text-content-muted">
                  {lang === 'ar' ? 'لا توجد نتائج' : 'No celebrities found'}
                </p>
              )}
            </div>
          </div>
        </div>
      , document.body)}

      {/* ── Template Modal ────────────────────────────────── */}
      {templateModalOpen && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setTemplateModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-purple/10">
              <h3 className="font-bold text-content-primary">
                {lang === 'ar' ? 'اختر القالب' : 'Select Template'}
              </h3>
              <button onClick={() => setTemplateModalOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-subtle transition-colors">
                <X className="w-4 h-4 text-content-muted" />
              </button>
            </div>
            {/* Search */}
            <div className="px-5 py-3 border-b border-brand-purple/8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
                <input
                  type="text"
                  value={templateSearch}
                  onChange={e => setTemplateSearch(e.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث عن قالب...' : 'Search templates...'}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-surface-subtle border border-brand-purple/15 text-content-primary placeholder-content-muted focus:outline-none focus:border-brand-purple/50 transition-all"
                />
              </div>
            </div>
            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {templatesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <p className="text-center py-12 text-sm text-content-muted">
                  {lang === 'ar' ? 'لا توجد قوالب متاحة' : 'No templates available'}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredTemplates.map(tmpl => {
                    const isSelected   = state.template?.id === tmpl.id
                    const name         = lang === 'ar' ? tmpl.nameAr         : tmpl.name
                    const desc         = lang === 'ar' ? tmpl.descriptionAr  : tmpl.description
                    const script       = lang === 'ar' ? tmpl.sampleScriptAr : tmpl.sampleScript
                    const purposeLabel = lang === 'ar' ? tmpl.purposeAr      : tmpl.purpose
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => selectTemplate(tmpl)}
                        className={`relative rounded-2xl border p-4 cursor-pointer transition-all duration-200 flex flex-col gap-3 ${
                          isSelected
                            ? 'border-brand-purple bg-surface-subtle'
                            : 'border-brand-purple/12 bg-white hover:border-brand-purple/40 hover:shadow-card-hover'
                        }`}
                        style={isSelected ? { boxShadow: '0 0 0 2px rgba(154,120,254,0.3), 0 4px 24px rgba(154,120,254,0.12)' } : undefined}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className="w-4 h-4 text-brand-purple" fill="rgba(154,120,254,0.15)" />
                          </div>
                        )}
                        <div className="flex items-start gap-2.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: isSelected ? 'rgba(154,120,254,0.12)' : 'rgba(154,120,254,0.06)' }}
                          >
                            <FileText className="w-3.5 h-3.5 text-brand-mid" />
                          </div>
                          <div className="flex-1 min-w-0 pr-5">
                            <h4 className="font-bold text-content-primary text-sm leading-tight">{name}</h4>
                            {desc && <p className="text-content-muted text-xs mt-0.5 leading-relaxed">{desc}</p>}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-subtle border border-brand-purple/10 flex-1">
                          <p className="text-xs text-content-muted font-medium mb-1">
                            {lang === 'ar' ? 'نموذج النص' : 'Sample Script'}
                          </p>
                          <p className="text-xs text-content-secondary italic leading-relaxed line-clamp-2">
                            &ldquo;{script}&rdquo;
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-purple/8 text-brand-purple border border-brand-purple/15">
                            {purposeLabel}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-content-muted">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{tmpl.duration}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      , document.body)}

      {/* ── 3. Script ─────────────────────────────────── */}
      {state.template && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onChange({
                useCustomScript: !state.useCustomScript,
                customScript: state.useCustomScript ? '' : resolvedScript,
              })}
              className="flex items-center gap-1.5 text-xs text-content-muted hover:text-brand-purple transition-colors"
            >
              {state.useCustomScript
                ? <ToggleRight className="w-4 h-4 text-brand-purple" />
                : <ToggleLeft className="w-4 h-4" />}
              {tr.create.useCustomScript}
            </button>
            <button
              type="button"
              disabled={improving || !(state.useCustomScript ? state.customScript : templateScript).trim()}
              onClick={handleImproveScript}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-brand-purple/30 text-brand-purple hover:bg-brand-purple/8 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Wand2 className={`w-3.5 h-3.5 ${improving ? 'animate-spin' : ''}`} />
              {improving
                ? (lang === 'ar' ? 'جارٍ التحسين...' : 'Improving...')
                : (lang === 'ar' ? 'تحسين بالذكاء الاصطناعي' : 'Improve with AI')}
            </button>
          </div>

          {state.useCustomScript ? (
            <TextArea
              value={state.customScript}
              onChange={e => onChange({ customScript: e.target.value })}
              placeholder={tr.create.scriptPlaceholder}
              rows={5}
            />
          ) : (
            <div className="p-4 rounded-xl bg-surface-subtle border border-brand-purple/15">
              <p className="text-xs text-content-muted mb-2">
                {lang === 'ar' ? 'نص القالب (للقراءة فقط)' : 'Template script (read-only)'}
              </p>
              <p className="text-sm text-content-secondary leading-relaxed">
                &ldquo;<ScriptWithHighlights script={templateScript} vars={varsState} />&rdquo;
              </p>
            </div>
          )}

          {/* Variable inputs */}
          {!state.useCustomScript && templateVariables.length > 0 && (
            <div className="flex flex-col gap-2 p-3 rounded-xl border border-brand-purple/12 bg-white">
              <p className="text-xs font-medium text-content-muted">
                {lang === 'ar' ? 'معاملات القالب' : 'Template variables'}
              </p>
              {templateVariables.map(varName => (
                <div key={varName} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-brand-purple min-w-[80px] shrink-0">
                    {`{{${varName}}}`}
                  </span>
                  <input
                    type="text"
                    value={varsState[varName] ?? ''}
                    onChange={e => onChange({ templateVariables: { ...varsState, [varName]: e.target.value } })}
                    placeholder={varName.replace(/_/g, ' ')}
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-sm border border-brand-purple/15 bg-white text-content-primary placeholder-content-muted focus:outline-none focus:border-brand-purple/50 transition-all"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Word count */}
          <p className={`text-xs text-right ${scriptOverLimit ? 'text-red-500 font-medium' : 'text-content-muted'}`}>
            {scriptWordCount} / 40 {lang === 'ar' ? 'كلمة' : 'words'}
            {scriptOverLimit && (lang === 'ar' ? ' — الحد الأقصى 40 كلمة' : ' — max 40 words')}
          </p>

          {improveError && <p className="text-xs text-red-500">{improveError}</p>}
        </section>
      )}

      {/* ── 4. Aspect Ratio ───────────────────────────── */}
      {state.celebrity && state.template && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-content-muted">
            {lang === 'ar' ? 'نسبة العرض' : 'Aspect Ratio'}
          </label>
          <div className="relative">
            <select
              value={state.aspectRatio ?? ''}
              onChange={e => onChange({ aspectRatio: e.target.value as AspectRatio })}
              className={selectCls}
            >
              <option value="" disabled>{lang === 'ar' ? 'اختر' : 'Select'}</option>
              {ASPECT_RATIOS.map(ar => (
                <option key={ar.id} value={ar.id}>{ar.label} ({lang === 'ar' ? ar.hintAr : ar.hint})</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
          </div>
        </div>
      )}

      {/* ── 5. Scene Settings ─────────────────────────── */}
      {state.celebrity && state.template && (
        <div className="rounded-xl border border-brand-purple/15 overflow-hidden">
          <button
            type="button"
            onClick={() => setSceneOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-surface-subtle hover:bg-surface-elevated cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-content-primary">
              <Camera className="w-4 h-4 text-brand-purple" />
              {lang === 'ar' ? 'إعدادات المشهد' : 'Scene Settings'}
              <span className="text-xs font-normal text-content-muted">
                {lang === 'ar' ? '(اختياري)' : '(optional)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isGreeting && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}
                >
                  {lang === 'ar' ? 'قريباً' : 'Coming Soon'}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-content-muted transition-transform ${sceneOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {sceneOpen && (
            <div className="flex flex-col gap-4 p-4 bg-white">

              {/* Scene description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-muted">
                  {lang === 'ar' ? 'وصف المشهد' : 'Scene Description'}
                </label>
                <textarea
                  value={state.sceneNotes}
                  onChange={e => onChange({ sceneNotes: e.target.value })}
                  rows={3}
                  placeholder={lang === 'ar'
                    ? 'صف البيئة، الإضاءة، الديكور، المزاج العام...'
                    : 'Describe the environment, lighting, setting, mood, wardrobe details...'}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-brand-purple/15 text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand-purple/50 focus:ring-2 focus:ring-brand-purple/10 transition-all resize-none"
                />
              </div>

              {/* Image Generation Window */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-content-muted">
                    {lang === 'ar' ? 'توليد الصورة بالذكاء الاصطناعي' : 'AI Image Generator'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setImageGenOpen(o => !o)}
                    className="text-xs font-semibold text-brand-purple hover:text-brand-dark flex items-center gap-1 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    {imageGenOpen
                      ? (lang === 'ar' ? 'إخفاء' : 'Hide')
                      : (lang === 'ar' ? 'توليد صورة' : 'Generate Image')}
                  </button>
                </div>

                {imageGenOpen && (
                  <div className="rounded-xl border border-brand-purple/15 overflow-hidden flex flex-col"
                    style={{ minHeight: '320px' }}>
                    {/* Chat messages */}
                    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 max-h-72 bg-surface-subtle/30">
                      {chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
                          <ImageIcon className="w-7 h-7 text-content-muted/60" />
                          <p className="text-xs text-content-muted">
                            {lang === 'ar'
                              ? 'صف الصورة التي تريد توليدها...'
                              : 'Describe the image you want to generate...'}
                          </p>
                        </div>
                      )}

                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role === 'user' ? (
                            <div
                              className="max-w-[80%] px-3 py-2 rounded-xl text-xs text-white"
                              style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}
                            >
                              {msg.text}
                            </div>
                          ) : (
                            <div className="max-w-[90%] flex flex-col gap-1.5">
                              {msg.imageUrl && (
                                <div className="relative group">
                                  <img
                                    src={msg.imageUrl}
                                    alt="Generated"
                                    className="rounded-xl border border-brand-purple/15 max-w-full"
                                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                                  />
                                  <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => onChange({ backgroundImageUrl: msg.imageUrl ?? null })}
                                      className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg text-white transition-opacity hover:opacity-90"
                                      style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}
                                    >
                                      <CheckCheck className="w-3 h-3" />
                                      {lang === 'ar' ? 'استخدم كخلفية' : 'Use as background'}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {msg.text && (
                                <p className="text-xs text-content-muted px-1">{msg.text}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {imageGenLoading && (
                        <div className="flex justify-start">
                          <div className="flex gap-1 px-3 py-2 rounded-xl bg-white border border-brand-purple/12">
                            {[0, 1, 2].map(i => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-purple/50"
                                style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Error */}
                    {imageGenError && (
                      <div className="px-3 py-2 text-xs text-red-500 bg-red-50 border-t border-red-100">
                        {imageGenError}
                      </div>
                    )}

                    {/* Input */}
                    <div className="border-t border-brand-purple/10 p-2 flex gap-2 bg-white">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendImagePrompt() } }}
                        disabled={imageGenLoading}
                        placeholder={lang === 'ar'
                          ? 'صف الصورة... (مثال: غرفة مضيئة بشمس الصباح)'
                          : 'Describe an image... (e.g. bright morning sunlit studio)'}
                        className="flex-1 px-3 py-2 rounded-xl text-xs border border-brand-purple/15 bg-white text-content-primary placeholder-content-muted focus:outline-none focus:border-brand-purple/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleSendImagePrompt}
                        disabled={!chatInput.trim() || imageGenLoading}
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity hover:opacity-85"
                        style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}
                      >
                        <SendHorizontal className="w-3.5 h-3.5 text-white" />
                      </button>
                      {chatHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={() => { setChatHistory([]); setImageGenError(null) }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-content-muted hover:bg-surface-subtle transition-colors border border-brand-purple/12"
                          title={lang === 'ar' ? 'مسح المحادثة' : 'Clear chat'}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <style jsx>{`
                      @keyframes bounce {
                        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                        40% { transform: translateY(-4px); opacity: 1; }
                      }
                    `}</style>
                  </div>
                )}
              </div>

              {/* Background image (below scene description per task 7) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-muted">
                  {lang === 'ar' ? 'صورة الخلفية' : 'Background Image'}
                </label>
                {state.backgroundImageUrl ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-brand-purple/15 group">
                    <img src={state.backgroundImageUrl} alt="background" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onChange({ backgroundImageUrl: null })}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-brand-purple/25 text-xs text-content-muted hover:border-brand-purple/50 hover:text-brand-purple cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 shrink-0" />
                    {lang === 'ar' ? 'انقر لرفع صورة خلفية' : 'Click to upload a background image'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleBgImage} />
                  </label>
                )}
              </div>

              {/* Prop / item reference images — hidden for greeting */}
              {!isGreeting && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-content-muted">
                    {lang === 'ar' ? 'صور العنصر / الدعامة المرجعية' : 'Item / Prop Reference Images'}
                  </label>

                  {(state.propImages?.length ?? 0) > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {(state.propImages ?? []).map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-brand-purple/15 group">
                          <img src={url} alt={`prop-${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePropImage(i)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-brand-purple/25 text-xs text-content-muted hover:border-brand-purple/50 hover:text-brand-purple cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 shrink-0" />
                    {lang === 'ar' ? 'انقر لإضافة صور مرجعية' : 'Click to add reference images'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePropImages} />
                  </label>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* ── Generate button ────────────────────────────── */}
      {state.celebrity && state.template && (
        <div className="flex flex-col gap-2">
          {jobError && (
            <p className="text-sm text-red-500 text-center px-1">{jobError}</p>
          )}
          {scriptOverLimit && (
            <p className="text-xs text-red-500 text-center">
              {lang === 'ar'
                ? 'يرجى تقليل النص إلى 40 كلمة أو أقل قبل التوليد'
                : 'Please shorten your script to 40 words or fewer before generating'}
            </p>
          )}
          {hasJobRef && !jobLoading && (
            <p className="text-xs text-emerald-600 text-center flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'تم إرسال الطلب — يمكنك المتابعة' : 'Job submitted — you can proceed'}
            </p>
          )}
          <Button
            fullWidth
            size="lg"
            icon={<Sparkles className="w-4 h-4" />}
            loading={jobLoading}
            disabled={!state.celebrity || !state.productType || jobLoading || scriptOverLimit}
            onClick={handleGenerateVideo}
          >
            {jobLoading
              ? (lang === 'ar' ? 'جارٍ التوليد...' : 'Generating...')
              : (lang === 'ar' ? 'توليد الفيديو' : 'Generate Video')}
          </Button>
        </div>
      )}

      </div>{/* end left column */}

      {/* ── Right column: Video Preview (sticky) ── */}
      <div className="sticky top-28">
        <div className="rounded-2xl border border-brand-purple/20 overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #FAF7FF, #F3EEFF)' }}>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-brand-purple/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
              <span className="text-sm font-semibold text-content-primary">
                {lang === 'ar' ? 'معاينة' : 'Preview'}
              </span>
            </div>
            {state.celebrity && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md overflow-hidden border border-brand-purple/20">
                  <img
                    src={state.celebrity.image}
                    alt={lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-content-muted truncate max-w-[100px]">
                  {lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name}
                </span>
              </div>
            )}
          </div>
          <div className="p-4">
            <VideoPreview
              key={generationKey}
              celebrity={state.celebrity}
              templateName={templateName ?? 'Custom Video'}
              productType={productName ?? 'Video'}
              duration={(state.template?.duration as Duration) ?? '30s'}
              lang={lang}
              videoUrl={previewUrl ?? undefined}
              loading={jobLoading}
            />
          </div>
        </div>
      </div>

      </div>{/* end grid */}
    </div>
  )
}
