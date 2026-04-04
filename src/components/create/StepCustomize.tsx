'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { WizardState, AspectRatio, Resolution } from '@/lib/types'
import { ASPECT_RATIOS, RESOLUTIONS, PRODUCT_TYPES } from '@/lib/data'
import { useLanguage } from '@/lib/context'
import { TextArea } from '@/components/ui/Input'
import { ToggleLeft, ToggleRight, Sparkles, ChevronDown, Wand2, Camera, Upload, X, MessageSquarePlus, RefreshCw, CheckCheck } from 'lucide-react'
import VideoPreview from './VideoPreview'
import Button from '@/components/ui/Button'
import { jobApi } from '@/lib/api'


const ORDER_REF_KEY = 'twinity_order_ref'

interface Props {
  state: WizardState
  onChange: (updates: Partial<WizardState>) => void
}

export default function StepCustomize({ state, onChange }: Props) {
  const { lang, tr } = useLanguage()

  // Bump this to re-mount VideoPreview fresh on each generation attempt
  const [generationKey, setGenerationKey] = useState(0)

  const [jobLoading,      setJobLoading]      = useState(false)
  const [previewUrl,      setPreviewUrl]      = useState<string | null>(null)
  const [jobError,        setJobError]        = useState<string | null>(null)
  const [improving,       setImproving]       = useState(false)
  const [improveError,    setImproveError]    = useState<string | null>(null)
  const [sceneOpen,         setSceneOpen]         = useState(false)
  const [promptModalOpen,   setPromptModalOpen]   = useState(false)
  const [sceneSuggestions,  setSceneSuggestions]  = useState<string[]>([])
  const [sceneGenLoading,   setSceneGenLoading]   = useState(false)
  const [sceneGenError,     setSceneGenError]     = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const templateScript = state.template
    ? lang === 'ar' ? state.template.sampleScriptAr : state.template.sampleScript
    : ''

  const activeScript    = state.useCustomScript ? state.customScript : templateScript
  const scriptWordCount = activeScript.trim() ? activeScript.trim().split(/\s+/).length : 0
  const scriptOverLimit = scriptWordCount > 25

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
    // Reset input so same file can be re-added if removed
    e.target.value = ''
  }, [onChange, state.propImages])

  const removePropImage = useCallback((index: number) => {
    onChange({ propImages: (state.propImages ?? []).filter((_, i) => i !== index) })
  }, [onChange, state.propImages])

  const openPromptModal = useCallback(async () => {
    setPromptModalOpen(true)
    if (sceneSuggestions.length > 0) return   // already loaded
    setSceneGenLoading(true)
    setSceneGenError(null)
    try {
      const productType = PRODUCT_TYPES.find(p => p.id === state.productType)
      const res = await jobApi.scenePrompts({
        celebrityName: state.celebrity ? (lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name) : 'Celebrity',
        productType:   productType?.name ?? state.productType ?? '',
        purpose:       state.template ? (lang === 'ar' ? state.template.purposeAr : state.template.purpose) : undefined,
        script:        state.useCustomScript ? state.customScript : templateScript,
      })
      setSceneSuggestions(res.suggestions)
    } catch (err) {
      setSceneGenError(err instanceof Error ? err.message : 'Failed to generate suggestions')
    } finally {
      setSceneGenLoading(false)
    }
  }, [sceneSuggestions.length, state, lang, templateScript])

  const regeneratePrompts = useCallback(async () => {
    setSceneGenLoading(true)
    setSceneGenError(null)
    setSceneSuggestions([])
    try {
      const productType = PRODUCT_TYPES.find(p => p.id === state.productType)
      const res = await jobApi.scenePrompts({
        celebrityName: state.celebrity ? (lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name) : 'Celebrity',
        productType:   productType?.name ?? state.productType ?? '',
        purpose:       state.template ? (lang === 'ar' ? state.template.purposeAr : state.template.purpose) : undefined,
        script:        state.useCustomScript ? state.customScript : templateScript,
      })
      setSceneSuggestions(res.suggestions)
    } catch (err) {
      setSceneGenError(err instanceof Error ? err.message : 'Failed to generate suggestions')
    } finally {
      setSceneGenLoading(false)
    }
  }, [state, lang, templateScript])

  // Clean up polling interval on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  const selectCls = 'w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm font-medium bg-white border border-brand-purple/15 text-content-primary focus:outline-none focus:border-brand-purple/50 focus:ring-2 focus:ring-brand-purple/10 transition-all cursor-pointer'

  const productType = PRODUCT_TYPES.find(p => p.id === state.productType)
  const productName = lang === 'ar' ? productType?.nameAr : productType?.name
  const templateName = lang === 'ar' ? state.template?.nameAr : state.template?.name

  const handleGeneratePreview = async () => {
    if (!state.celebrity || !state.productType) return

    // Cancel any existing poll
    if (pollRef.current) clearInterval(pollRef.current)

    setJobLoading(true)
    setPreviewUrl(null)
    setJobError(null)
    setGenerationKey(k => k + 1) // re-mount VideoPreview so it starts fresh

    try {
      const script = state.useCustomScript
        ? state.customScript
        : (lang === 'ar' ? state.template?.sampleScriptAr : state.template?.sampleScript) ?? ''

      const purpose = state.template
        ? (lang === 'ar' ? state.template.purposeAr : state.template.purpose)
        : 'Custom Video'

      const res = await jobApi.create({
        celebrityId:        state.celebrity.id,
        productType:        state.productType,
        purpose,
        script,
        templateId:         state.template?.id,
        duration:           state.duration           ?? undefined,
        aspectRatio:        state.aspectRatio        ?? undefined,
        resolution:         state.resolution         ?? undefined,
        channels:           state.channels,
        propImages:         state.propImages?.length ? state.propImages : undefined,
        sceneNotes:         state.sceneNotes         || undefined,
        backgroundImageUrl: state.backgroundImageUrl ?? undefined,
      })

      const ref = res.data.referenceId
      try { sessionStorage.setItem(ORDER_REF_KEY, ref) } catch {}

      // Dev stub may already have a previewUrl in the first response
      if (res.data.previewUrl) {
        setPreviewUrl(res.data.previewUrl)
        setJobLoading(false)
        return
      }

      // Poll every 30 s until previewUrl is set or job fails
      pollRef.current = setInterval(async () => {
        try {
          const jobRes = await jobApi.getJob(ref)
          const job = jobRes.data
          if (job.previewUrl) {
            setPreviewUrl(job.previewUrl)
            setJobLoading(false)
            if (pollRef.current) clearInterval(pollRef.current)
          } else if (job.status === 'failed' || job.status === 'cancelled') {
            setJobError(
              job.errorMessage
                ?? (lang === 'ar'
                  ? 'فشل في توليد الفيديو، يرجى المحاولة مرة أخرى.'
                  : 'Video generation failed. Please try again.')
            )
            setJobLoading(false)
            if (pollRef.current) clearInterval(pollRef.current)
          }
        } catch { /* ignore transient polling errors */ }
      }, 30000)
    } catch (err) {
      setJobError(err instanceof Error ? err.message : 'Failed to submit order')
      setJobLoading(false)
    }
  }

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

  return (
    <div className="flex flex-col gap-7">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.customize}</h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.create.customizeSub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">

        {/* ── Left column: all options + Generate ── */}
        <div className="flex flex-col gap-5">

          {/* Script */}
          <div className="flex flex-col gap-3">
            {/* Row 1: label + toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-content-primary">{tr.create.script}</label>
              <button
                onClick={() =>
                  onChange({ useCustomScript: !state.useCustomScript, customScript: state.useCustomScript ? '' : templateScript })
                }
                className="flex items-center gap-1.5 text-xs text-content-muted hover:text-brand-purple transition-colors"
              >
                {state.useCustomScript
                  ? <ToggleRight className="w-4 h-4 text-brand-purple" />
                  : <ToggleLeft className="w-4 h-4" />}
                {tr.create.useCustomScript}
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
                  {lang === 'ar' ? 'نص القالب (انقر للتعديل)' : 'Template script (click to customize)'}
                </p>
                <p className="text-sm text-content-secondary italic leading-relaxed">
                  &ldquo;{templateScript}&rdquo;
                </p>
                <button
                  onClick={() => onChange({ useCustomScript: true, customScript: templateScript })}
                  className="mt-3 text-xs text-brand-purple hover:underline"
                >
                  {lang === 'ar' ? 'تعديل النص' : 'Edit this script'}
                </button>
              </div>
            )}

            {/* Word count */}
            <p className={`text-xs text-right ${scriptOverLimit ? 'text-red-500 font-medium' : 'text-content-muted'}`}>
              {scriptWordCount} / 25 {lang === 'ar' ? 'كلمة' : 'words'}
              {scriptOverLimit && (lang === 'ar' ? ' — الحد الأقصى 25 كلمة' : ' — max 25 words')}
            </p>

            {/* Improve with AI — always visible */}
            <div className="flex items-center justify-between">
              {improveError && <p className="text-xs text-red-500">{improveError}</p>}
              <button
                type="button"
                disabled={improving || !(state.useCustomScript ? state.customScript : templateScript).trim()}
                onClick={handleImproveScript}
                className="ml-auto flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border border-brand-purple/30 text-brand-purple hover:bg-brand-purple/8 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Wand2 className={`w-4 h-4 ${improving ? 'animate-spin' : ''}`} />
                {improving
                  ? (lang === 'ar' ? 'جارٍ التحسين...' : 'Improving...')
                  : (lang === 'ar' ? 'تحسين بالذكاء الاصطناعي' : 'Improve with AI')}
              </button>
            </div>
          </div>

          {/* Aspect Ratio / Resolution — 2-column grid */}
          <div className="grid grid-cols-2 gap-3">

            {/* Aspect Ratio */}
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
                    <option key={ar.id} value={ar.id}>{ar.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
              </div>
            </div>

            {/* Resolution */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-content-muted">
                {lang === 'ar' ? 'الدقة' : 'Resolution'}
              </label>
              <div className="relative">
                <select
                  value={state.resolution ?? ''}
                  onChange={e => onChange({ resolution: e.target.value as Resolution })}
                  className={selectCls}
                >
                  <option value="" disabled>{lang === 'ar' ? 'اختر' : 'Select'}</option>
                  {RESOLUTIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
              </div>
            </div>

          </div>

          {/* Scene Settings */}
          <div className="rounded-xl border border-brand-purple/15 overflow-hidden">
            <button
              type="button"
              onClick={() => setSceneOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 bg-surface-subtle hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-content-primary">
                <Camera className="w-4 h-4 text-brand-purple" />
                {lang === 'ar' ? 'إعدادات المشهد' : 'Scene Settings'}
                <span className="text-xs font-normal text-content-muted">
                  {lang === 'ar' ? '(اختياري)' : '(optional)'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-content-muted transition-transform ${sceneOpen ? 'rotate-180' : ''}`} />
            </button>

            {sceneOpen && (
              <div className="flex flex-col gap-4 p-4 bg-white">

                {/* Background image */}
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

                {/* Prop / item reference images */}
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

                {/* Scene description */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-content-muted">
                      {lang === 'ar' ? 'وصف المشهد' : 'Scene Description'}
                    </label>
                    <button
                      type="button"
                      onClick={openPromptModal}
                      className="flex items-center gap-1 text-xs font-semibold text-brand-purple hover:text-brand-dark transition-colors"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      {lang === 'ar' ? 'اقتراحات بالذكاء الاصطناعي' : 'Get AI Prompts'}
                    </button>
                  </div>
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

              </div>
            )}
          </div>

          {/* Error */}
          {jobError && (
            <p className="text-sm text-red-500 text-center px-1">{jobError}</p>
          )}

          {scriptOverLimit && (
            <p className="text-xs text-red-500 text-center">
              {lang === 'ar'
                ? 'يرجى تقليل النص إلى 25 كلمة أو أقل قبل التوليد'
                : 'Please shorten your script to 25 words or fewer before generating'}
            </p>
          )}

          {/* Generate button */}
          <Button
            fullWidth
            size="lg"
            icon={<Sparkles className="w-4 h-4" />}
            loading={jobLoading}
            disabled={!state.celebrity || !state.productType || jobLoading || scriptOverLimit}
            onClick={handleGeneratePreview}
          >
            {jobLoading
              ? (lang === 'ar' ? 'جارٍ التوليد...' : 'Generating...')
              : (lang === 'ar' ? 'توليد المعاينة' : 'Generate Preview')}
          </Button>

        </div>

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
                  <span className="text-xs text-content-muted">
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
                productType={productName ?? 'Avatar Studio'}
                duration={state.duration ?? '30s'}
                lang={lang}
                videoUrl={previewUrl ?? undefined}
                loading={jobLoading}
              />
            </div>
          </div>
        </div>

      </div>

      {/* ── Scene Prompt Modal ── */}
      {promptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setPromptModalOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-purple/10"
              style={{ background: 'linear-gradient(135deg,#9a78fe18,#42226608)' }}>
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-brand-purple" />
                <span className="font-semibold text-content-primary">
                  {lang === 'ar' ? 'اقتراحات مشهد بالذكاء الاصطناعي' : 'AI Scene Prompt Ideas'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={regeneratePrompts}
                  disabled={sceneGenLoading}
                  className="flex items-center gap-1.5 text-xs font-medium text-brand-purple hover:text-brand-dark disabled:opacity-40 transition-colors px-2 py-1 rounded-lg hover:bg-brand-purple/8"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${sceneGenLoading ? 'animate-spin' : ''}`} />
                  {lang === 'ar' ? 'تجديد' : 'Regenerate'}
                </button>
                <button
                  type="button"
                  onClick={() => setPromptModalOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-content-muted hover:bg-surface-subtle hover:text-content-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">

              {sceneGenLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-brand-purple border-t-transparent animate-spin" />
                  <p className="text-sm text-content-muted">
                    {lang === 'ar' ? 'جارٍ توليد الاقتراحات...' : 'Generating scene ideas...'}
                  </p>
                </div>
              )}

              {sceneGenError && !sceneGenLoading && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {sceneGenError}
                </div>
              )}

              {!sceneGenLoading && sceneSuggestions.map((suggestion, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-brand-purple/15 bg-surface-subtle/60 p-4 flex flex-col gap-3 hover:border-brand-purple/30 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}>
                      {i + 1}
                    </span>
                    <p className="text-sm text-content-secondary leading-relaxed">{suggestion}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ sceneNotes: suggestion })
                      if (!sceneOpen) setSceneOpen(true)
                      setPromptModalOpen(false)
                    }}
                    className="self-end flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'استخدم هذا' : 'Use this'}
                  </button>
                </div>
              ))}

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
