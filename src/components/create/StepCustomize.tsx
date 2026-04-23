'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { WizardState, AspectRatio, Celebrity, Template, Duration, Industry, ElevenLabsTTSModel, ElevenLabsSTSModel } from '@/lib/types'
import { ASPECT_RATIOS, INDUSTRY_LABELS } from '@/lib/data'
import { useProductTypes } from '@/lib/use-product-types'
import { useLanguage } from '@/lib/context'
import { TextArea } from '@/components/ui/Input'
import {
  Sparkles, ChevronDown, Wand2, Camera, Upload, X,
  RefreshCw, CheckCheck, Search, ImageIcon, SendHorizontal, Clock,
  FileText, CheckCircle2, Loader2, Mic, Gauge, Volume2, ArrowLeft,
  Play, Pause, RotateCcw,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import VideoPreview from './VideoPreview'
import CelebrityCard from '@/components/ui/CelebrityCard'
import { jobApi, celebrityApi, templateApi, settingsApi, mapApiCeleb, mapApiTemplate } from '@/lib/api'

const INDUSTRIES: Industry[] = ['all', 'entertainment', 'sports', 'music', 'business', 'social-media', 'tv-film']

const ORDER_REF_KEY = 'twinity_order_ref'


interface ChatMessage {
  role: 'user' | 'model'
  text: string
  imageUrl?: string
}

interface VoiceHistoryEntry {
  url: string
  durationSecs?: number
  take: number
  model: string
  speed: number
  voiceChange: boolean
}

const VOICE_MODEL_DISPLAY: Record<string, string> = {
  eleven_v3:                  'Twinity Pro',
  eleven_multilingual_v2:     'Twinity Global'
}

interface Props {
  state: WizardState
  onChange: (updates: Partial<WizardState>) => void
}

export default function StepCustomize({ state, onChange }: Props) {
  const { lang, tr } = useLanguage()
  const { productTypes } = useProductTypes()

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

  // ── Blocked words ──────────────────────────────────────
  const [blockedWords,       setBlockedWords]       = useState<string[]>([])
  const [offensiveModalOpen, setOffensiveModalOpen] = useState(false)
  const [offensiveFound,     setOffensiveFound]     = useState<string[]>([])

  // ── Gemini image generation ────────────────────────────
  const [imageGenOpen,      setImageGenOpen]      = useState(false)
  const [chatHistory,       setChatHistory]       = useState<ChatMessage[]>([])
  const [chatInput,         setChatInput]         = useState('')
  const [imageGenLoading,   setImageGenLoading]   = useState(false)
  const [imageGenError,     setImageGenError]     = useState<string | null>(null)

  // ── Voice settings ─────────────────────────────────────
  const [voiceAudioUploading, setVoiceAudioUploading] = useState(false)

  // ── Voice preview history (step 1 before video generation) ──
  const [voiceHistory,        setVoiceHistory]        = useState<VoiceHistoryEntry[]>([])
  const [selectedVoiceIdx,    setSelectedVoiceIdx]    = useState<number>(-1)
  const [voicePreviewLoading, setVoicePreviewLoading] = useState(false)
  const [voicePreviewError,   setVoicePreviewError]   = useState<string | null>(null)

  // ── Mic recorder ───────────────────────────────────────
  const [isRecording,         setIsRecording]         = useState(false)
  const [recordingDuration,   setRecordingDuration]   = useState(0)
  const [recordingError,      setRecordingError]       = useState<string | null>(null)
  const mediaRecorderRef      = useRef<MediaRecorder | null>(null)
  const audioChunksRef        = useRef<Blob[]>([])
  const recordingTimerRef     = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Source audio: local data URL before upload, S3 URL after preview ──
  const [sourceAudioDataUrl,  setSourceAudioDataUrl]  = useState<string | null>(null)

  // ── Source audio playback ───────────────────────────────
  const [sourceAudioPlaying, setSourceAudioPlaying] = useState(false)
  const sourceAudioRef       = useRef<HTMLAudioElement | null>(null)

  const stopSourceAudio = useCallback(() => {
    sourceAudioRef.current?.pause()
    if (sourceAudioRef.current) sourceAudioRef.current.currentTime = 0
    sourceAudioRef.current = null
    setSourceAudioPlaying(false)
  }, [])

  const handleToggleSourceAudio = useCallback(() => {
    const url = sourceAudioDataUrl ?? state.voiceChangeSourceUrl
    if (!url) return
    if (sourceAudioPlaying) {
      stopSourceAudio()
    } else {
      const audio = new Audio(url)
      audio.onended = () => setSourceAudioPlaying(false)
      sourceAudioRef.current = audio
      audio.play().catch(() => setSourceAudioPlaying(false))
      setSourceAudioPlaying(true)
    }
  }, [sourceAudioDataUrl, state.voiceChangeSourceUrl, sourceAudioPlaying, stopSourceAudio])

  // ── Two-screen flow ────────────────────────────────────
  const [showFinalizeScreen, setShowFinalizeScreen] = useState(false)

  // ── Prop image upload state ────────────────────────────
  // Tracks base64 previews of images currently uploading to S3
  const [uploadingProps,    setUploadingProps]    = useState<string[]>([])

  // ── Load blocked words on mount ───────────────────────
  useEffect(() => {
    settingsApi.getBlockedWords()
      .then(res => setBlockedWords(res.data ?? []))
      .catch(() => null)
  }, [])

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

  // ── Active script ──────────────────────────────────────
  const resolvedScript  = state.customScript
  const scriptWordCount = resolvedScript.trim() ? resolvedScript.trim().split(/\s+/).length : 0
  const scriptOverLimit = scriptWordCount > 40

  // ── File uploads ───────────────────────────────────────
  const handlePropImages = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''

    // Read each file as base64 data URL, show preview immediately, then upload to S3
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = async () => {
        const dataUrl = reader.result as string
        // Add to uploading previews (shown as loading in the strip)
        setUploadingProps(prev => [...prev, dataUrl])
        try {
          const res = await jobApi.uploadAsset(dataUrl)
          // Replace the uploading preview with the real S3 URL in wizard state
          onChange({ propImages: [...(state.propImages ?? []), res.url] })
        } catch {
          // Upload failed — silently remove the preview (could add error toast here)
        } finally {
          setUploadingProps(prev => prev.filter(u => u !== dataUrl))
        }
      }
      reader.readAsDataURL(file)
    })
  }, [onChange, state.propImages])

  const removePropImage = useCallback((index: number) => {
    onChange({ propImages: (state.propImages ?? []).filter((_, i) => i !== index) })
  }, [onChange, state.propImages])

  // ── Mic recorder handlers ─────────────────────────────
  const handleStartRecording = useCallback(async () => {
    setRecordingError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => setSourceAudioDataUrl(reader.result as string)
        reader.readAsDataURL(blob)
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingDuration(0)
      recordingTimerRef.current = setInterval(() => setRecordingDuration(d => d + 1), 1000)
    } catch {
      setRecordingError(lang === 'ar' ? 'تعذّر الوصول إلى الميكروفون' : 'Microphone access denied')
    }
  }, [lang, onChange])

  const handleStopRecording = useCallback(() => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }, [])

  const handleVoiceAudioUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = () => {
      stopSourceAudio()
      setSourceAudioDataUrl(reader.result as string)
      onChange({ voiceChangeSourceUrl: null })
    }
    reader.readAsDataURL(file)
  }, [onChange])

  // ── Celebrity & template selection ────────────────────
  const selectCeleb = (celeb: Celebrity) => {
    onChange({ celebrity: celeb, template: null, templateVariables: {}, customScript: '', useCustomScript: false })
    setCelebModalOpen(false)
  }

  const selectTemplate = (tmpl: Template) => {
    const scriptText = lang === 'ar' ? tmpl.sampleScriptAr : tmpl.sampleScript
    onChange({ template: tmpl, templateVariables: {}, customScript: scriptText, useCustomScript: true })
    setTemplateModalOpen(false)
  }

  // ── Generate video ─────────────────────────────────────
  const handleGenerateVideo = async () => {
    if (!state.celebrity || !state.productType) return

    // Check for offensive words before submitting
    if (blockedWords.length > 0 && resolvedScript.trim()) {
      const lower = resolvedScript.toLowerCase()
      const found = blockedWords.filter(w => new RegExp(`\\b${w.toLowerCase()}\\b`).test(lower))
      if (found.length > 0) {
        setOffensiveFound(found)
        setOffensiveModalOpen(true)
        return
      }
    }

    if (pollRef.current) clearInterval(pollRef.current)

    setJobLoading(true)
    setJobError(null)
    setPreviewUrl(null)
    setGenerationKey(k => k + 1)

    try {
      const script  = resolvedScript.trim() || (state.voiceChangeEnabled ? 'Voice Change' : '')
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
        voiceModel:         state.voiceChangeEnabled ? undefined : (state.voiceModel !== 'eleven_v3' ? state.voiceModel : undefined),
        voiceSpeed:         state.voiceSpeed !== 1.0 ? state.voiceSpeed : undefined,
        voiceChangeEnabled: state.voiceChangeEnabled || undefined,
        voiceChangeSourceUrl: state.voiceChangeEnabled && state.voiceChangeSourceUrl ? state.voiceChangeSourceUrl : undefined,
        voiceAudioUrl:      selectedVoiceUrl ?? undefined,
        audioDuration:      selectedVoiceIdx >= 0 ? voiceHistory[selectedVoiceIdx]?.durationSecs : undefined,
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
    const script = state.customScript
    if (!script.trim()) return

    setImproving(true)
    setImproveError(null)
    try {
      const productType = productTypes.find(p => p.id === state.productType)
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

  // ── Voice preview (step 1) — accumulates takes in history ──
  const handlePreviewVoice = async () => {
    if (!state.celebrity || !state.productType) return
    if (state.voiceChangeEnabled && !sourceAudioDataUrl && !state.voiceChangeSourceUrl) return
    if (!state.voiceChangeEnabled && !state.customScript.trim()) return
    setVoicePreviewLoading(true)
    setVoicePreviewError(null)

    // Lazy upload: send audio to S3 on first preview, not on record/select
    let resolvedVoiceChangeUrl = state.voiceChangeSourceUrl
    if (state.voiceChangeEnabled && sourceAudioDataUrl && !resolvedVoiceChangeUrl) {
      try {
        const uploadRes = await jobApi.uploadAsset(sourceAudioDataUrl)
        resolvedVoiceChangeUrl = uploadRes.url
        onChange({ voiceChangeSourceUrl: uploadRes.url })
        setSourceAudioDataUrl(null)
      } catch (err) {
        setVoicePreviewError(lang === 'ar' ? 'فشل رفع الصوت' : 'Failed to upload audio')
        setVoicePreviewLoading(false)
        return
      }
    }

    const capturedModel       = state.voiceModel
    const capturedSpeed       = state.voiceSpeed
    const capturedVoiceChange = state.voiceChangeEnabled
    try {
      const res = await jobApi.previewVoice({
        celebrityId: state.celebrity.id,
        script: state.customScript,
        voiceModel: capturedModel,
        voiceSpeed: capturedSpeed !== 1.0 ? capturedSpeed : undefined,
        voiceChangeEnabled: capturedVoiceChange || undefined,
        voiceChangeSourceUrl: capturedVoiceChange && resolvedVoiceChangeUrl ? resolvedVoiceChangeUrl : undefined,
      })
      setVoiceHistory(prev => {
        const newEntry: VoiceHistoryEntry = {
          url: res.audioUrl,
          durationSecs: res.durationSecs,
          take: prev.length + 1,
          model: capturedModel,
          speed: capturedSpeed,
          voiceChange: capturedVoiceChange,
        }
        setSelectedVoiceIdx(prev.length)
        return [...prev, newEntry]
      })
    } catch (err) {
      setVoicePreviewError(err instanceof Error ? err.message : 'Failed to generate voice preview')
    } finally {
      setVoicePreviewLoading(false)
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
        productTypeSlug: state.productType ?? undefined,
        celebrityImageUrl: state.celebrity?.image ?? undefined,
        propImages: state.propImages?.length ? state.propImages : undefined,
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

  // ── Clean up polling + recording + source audio on unmount ──
  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    mediaRecorderRef.current?.stop()
    sourceAudioRef.current?.pause()
  }, [])

  const selectCls = 'w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm font-medium bg-white border border-brand-purple/15 text-content-primary focus:outline-none focus:border-brand-purple/50 focus:ring-2 focus:ring-brand-purple/10 transition-all cursor-pointer'

  const hasVoiceHistory  = voiceHistory.length > 0
  const selectedVoiceUrl = selectedVoiceIdx >= 0 ? (voiceHistory[selectedVoiceIdx]?.url ?? null) : null

  const isGreeting = state.productType === 'greeting'
  const hasJobRef  = (() => { try { return !!sessionStorage.getItem(ORDER_REF_KEY) } catch { return false } })()
  const productType  = productTypes.find(p => p.id === state.productType)
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

      {/* ── 1. Celebrity trigger (screen 1 only) ─────────── */}
      {!showFinalizeScreen && (<section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-content-primary">
          {lang === 'ar' ? 'اختر المشهور' : 'Select Celebrity'}
          <span className="ml-1 text-red-400">*</span>
        </h3>
        {state.celebrity ? (
          <div
            onClick={() => setCelebModalOpen(true)}
            className="group flex items-center gap-3 p-3 rounded-xl border border-brand-purple/30 bg-surface-subtle cursor-pointer hover:border-brand-purple/60 hover:bg-surface-elevated transition-all"
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
      </section>)}

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

      {/* ── Offensive Content Modal ───────────────────────── */}
      {offensiveModalOpen && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOffensiveModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-brand-purple/10 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-50 border border-red-100">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-content-primary">
                  {lang === 'ar' ? 'محتوى غير مناسب' : 'Inappropriate Content'}
                </h3>
                <p className="text-sm text-content-muted mt-0.5">
                  {lang === 'ar'
                    ? 'يحتوي النص على كلمات محظورة. يرجى مراجعة النص وإزالة الكلمات التالية:'
                    : 'Your script contains prohibited words. Please review and remove the following:'}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 flex flex-wrap gap-2">
              {offensiveFound.map(w => (
                <span key={w} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                  {w}
                </span>
              ))}
            </div>
            <div className="px-6 pb-5">
              <button
                type="button"
                onClick={() => setOffensiveModalOpen(false)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}
              >
                {lang === 'ar' ? 'حسناً، سأراجع النص' : 'OK, I\'ll revise my script'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* ── Voice Mode Selector + Content (screen 1 only) ── */}
      {state.celebrity && !showFinalizeScreen && (
        <section className="flex flex-col gap-4">

          {/* ── Mode switcher — two top-level cards ─────────── */}
          <div className="grid grid-cols-2 gap-2">
            {/* Write Script card */}
            <button
              type="button"
              onClick={() => onChange({
                voiceChangeEnabled: false,
                voiceChangeSourceUrl: null,
                voiceModel: 'eleven_v3',
              })}
              className={`relative flex flex-col items-start gap-2.5 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                !state.voiceChangeEnabled
                  ? 'border-brand-purple bg-gradient-to-br from-brand-purple/8 to-brand-purple/4'
                  : 'border-brand-purple/15 bg-white hover:border-brand-purple/35 hover:bg-surface-subtle'
              }`}
              style={!state.voiceChangeEnabled
                ? { boxShadow: '0 0 0 1px rgba(154,120,254,0.18), 0 4px 24px rgba(154,120,254,0.10)' }
                : undefined}
            >
              {!state.voiceChangeEnabled && (
                <span
                  className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}
                >
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </span>
              )}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                !state.voiceChangeEnabled ? 'bg-brand-purple/15' : 'bg-surface-subtle'
              }`}>
                <FileText className={`w-4 h-4 ${!state.voiceChangeEnabled ? 'text-brand-purple' : 'text-content-muted'}`} />
              </div>
              <div>
                <p className={`text-sm font-bold leading-tight ${!state.voiceChangeEnabled ? 'text-content-primary' : 'text-content-secondary'}`}>
                  {lang === 'ar' ? 'اكتب نصاً' : 'Write Script'}
                </p>
                <p className={`text-[11px] mt-0.5 leading-snug ${!state.voiceChangeEnabled ? 'text-brand-purple/70' : 'text-content-muted'}`}>
                  {lang === 'ar' ? 'نص → صوت المشهور' : 'AI voices your words'}
                </p>
              </div>
            </button>

            {/* Use My Voice card */}
            <button
              type="button"
              onClick={() => onChange({
                voiceChangeEnabled: true,
                voiceChangeSourceUrl: null,
                voiceModel: 'eleven_multilingual_sts_v2',
              })}
              className={`relative flex flex-col items-start gap-2.5 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                state.voiceChangeEnabled
                  ? 'border-brand-purple bg-gradient-to-br from-brand-purple/8 to-brand-purple/4'
                  : 'border-brand-purple/15 bg-white hover:border-brand-purple/35 hover:bg-surface-subtle'
              }`}
              style={state.voiceChangeEnabled
                ? { boxShadow: '0 0 0 1px rgba(154,120,254,0.18), 0 4px 24px rgba(154,120,254,0.10)' }
                : undefined}
            >
              {state.voiceChangeEnabled && (
                <span
                  className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}
                >
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </span>
              )}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                state.voiceChangeEnabled ? 'bg-brand-purple/15' : 'bg-surface-subtle'
              }`}>
                <Mic className={`w-4 h-4 ${state.voiceChangeEnabled ? 'text-brand-purple' : 'text-content-muted'}`} />
              </div>
              <div>
                <p className={`text-sm font-bold leading-tight ${state.voiceChangeEnabled ? 'text-content-primary' : 'text-content-secondary'}`}>
                  {lang === 'ar' ? 'استخدم صوتك' : 'Use My Voice'}
                </p>
                <p className={`text-[11px] mt-0.5 leading-snug ${state.voiceChangeEnabled ? 'text-brand-purple/70' : 'text-content-muted'}`}>
                  {lang === 'ar' ? 'سجّل → صوت المشهور' : 'Record → celebrity voice'}
                </p>
              </div>
            </button>
          </div>

          {/* ── TTS panel ────────────────────────────────────── */}
          {!state.voiceChangeEnabled && (
            <div className="flex flex-col gap-3 rounded-2xl border border-brand-purple/12 bg-white p-4">
              {/* Script header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <label className="text-sm font-semibold text-content-primary shrink-0">
                    {lang === 'ar' ? 'نص الفيديو' : 'Video Script'}
                    <span className="ml-1 text-red-400">*</span>
                  </label>
                  {state.template ? (
                    <div className="flex items-center gap-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => setTemplateModalOpen(true)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-purple/8 border border-brand-purple/20 text-brand-purple hover:bg-brand-purple/15 transition-all max-w-[140px]"
                      >
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="text-[11px] font-medium truncate">
                          {lang === 'ar' ? state.template.nameAr : state.template.name}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange({ template: null, customScript: '', useCustomScript: false })}
                        className="p-0.5 rounded text-content-muted hover:text-red-500 transition-colors shrink-0"
                        title={lang === 'ar' ? 'إزالة القالب' : 'Remove template'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTemplateModalOpen(true)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-brand-purple/25 text-content-muted hover:border-brand-purple/50 hover:text-brand-purple hover:bg-brand-purple/5 transition-all"
                    >
                      <FileText className="w-3 h-3" />
                      <span className="text-[11px] font-medium">{lang === 'ar' ? 'من قالب' : 'From template'}</span>
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  disabled={improving || !state.customScript.trim()}
                  onClick={handleImproveScript}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-brand-purple/30 text-brand-purple hover:bg-brand-purple/8 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${improving ? 'animate-spin' : ''}`} />
                  {improving
                    ? (lang === 'ar' ? 'جارٍ التحسين...' : 'Improving...')
                    : (lang === 'ar' ? 'تحسين بالذكاء الاصطناعي' : 'Improve with AI')}
                </button>
              </div>

              <TextArea
                value={state.customScript}
                onChange={e => onChange({ customScript: e.target.value, useCustomScript: true })}
                placeholder={state.template
                  ? (lang === 'ar' ? 'تم تعبئة نص القالب — عدّل كما تشاء...' : 'Template script loaded — edit as needed...')
                  : tr.create.scriptPlaceholder}
                rows={5}
              />

              <p className={`text-xs text-right ${scriptOverLimit ? 'text-red-500 font-medium' : 'text-content-muted'}`}>
                {scriptWordCount} / 40 {lang === 'ar' ? 'كلمة' : 'words'}
                {scriptOverLimit && (lang === 'ar' ? ' — الحد الأقصى 40 كلمة' : ' — max 40 words')}
              </p>

              {improveError && <p className="text-xs text-red-500">{improveError}</p>}

              {/* TTS model */}
              <div className="flex flex-col gap-2 pt-1 border-t border-brand-purple/8">
                <div className="flex flex-col gap-1.5">
                  {([
                    {
                      id:   'eleven_v3',
                      name: lang === 'ar' ? 'Twinity Pro' : 'Twinity Pro',
                      tag:  lang === 'ar' ? 'موصى به' : 'Recommended',
                      desc: lang === 'ar' ? 'متعدد اللغات · أعلى جودة' : 'Multi-language · Highest quality',
                    },
                    {
                      id:   'eleven_multilingual_v2',
                      name: lang === 'ar' ? 'Twinity Global' : 'Twinity Global',
                      tag:  null,
                      desc: lang === 'ar' ? 'متعدد اللغات · أسرع' : 'Multi-language · Faster',
                    },
                  ] as const).map(opt => {
                    const active = state.voiceModel === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChange({ voiceModel: opt.id as ElevenLabsTTSModel })}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                          active
                            ? 'border-brand-purple/50 bg-brand-purple/6'
                            : 'border-brand-purple/12 bg-surface-subtle/60 hover:border-brand-purple/30 hover:bg-surface-subtle'
                        }`}
                        style={active ? { boxShadow: '0 0 0 1px rgba(154,120,254,0.15)' } : undefined}
                      >
                        {/* radio dot */}
                        <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${active ? 'border-brand-purple' : 'border-brand-purple/30'}`}>
                          {active && <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }} />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-sm font-semibold ${active ? 'text-content-primary' : 'text-content-secondary'}`}>
                              {opt.name}
                            </span>
                            {opt.tag && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}>
                                {opt.tag}
                              </span>
                            )}
                          </span>
                          <span className="block text-xs text-content-muted mt-0.5">{opt.desc}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Voice Change panel ──────────────────────────── */}
          {state.voiceChangeEnabled && (
            <div className="flex flex-col gap-3 rounded-2xl border border-brand-purple/12 bg-white p-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-content-primary">
                  {lang === 'ar' ? 'المصدر الصوتي' : 'Source Audio'}
                  <span className="ml-1 text-red-400">*</span>
                </label>
                <span className="text-[10px] font-medium text-content-muted px-2 py-0.5 rounded-full bg-surface-subtle border border-brand-purple/10">
                  {lang === 'ar' ? 'Speech-to-Speech' : 'Speech-to-Speech'}
                </span>
              </div>

              {/* Audio ready */}
              {(sourceAudioDataUrl || state.voiceChangeSourceUrl) ? (
                <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <Mic className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="flex-1 text-sm font-semibold text-emerald-700">
                      {lang === 'ar' ? 'الصوت جاهز' : 'Audio ready'}
                    </p>
                    <button
                      type="button"
                      onClick={() => { stopSourceAudio(); setSourceAudioDataUrl(null); onChange({ voiceChangeSourceUrl: null }) }}
                      className="text-emerald-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleToggleSourceAudio}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      {sourceAudioPlaying
                        ? <><Pause className="w-3.5 h-3.5" />{lang === 'ar' ? 'إيقاف مؤقت' : 'Pause'}</>
                        : <><Play  className="w-3.5 h-3.5" />{lang === 'ar' ? 'معاينة' : 'Preview'}</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => { stopSourceAudio(); setSourceAudioDataUrl(null); onChange({ voiceChangeSourceUrl: null }) }}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {lang === 'ar' ? 'تسجيل مجدداً' : 'Record Again'}
                    </button>
                  </div>
                </div>
              ) : isRecording ? (
                /* Recording in progress */
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-red-200 bg-red-50">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <p className="flex-1 text-sm font-semibold text-red-700 tabular-nums">
                    {lang === 'ar' ? 'جارٍ التسجيل ' : 'Recording '}
                    {String(Math.floor(recordingDuration / 60)).padStart(2, '0')}:{String(recordingDuration % 60).padStart(2, '0')}
                  </p>
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    {lang === 'ar' ? 'إيقاف' : 'Stop'}
                  </button>
                </div>
              ) : (
                /* Upload / Record choice */
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="group flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-brand-purple/20 cursor-pointer hover:border-brand-purple/50 hover:bg-surface-subtle transition-all text-center">
                    <div className="w-9 h-9 rounded-xl bg-surface-subtle group-hover:bg-brand-purple/10 flex items-center justify-center transition-colors">
                      <Upload className="w-4.5 h-4.5 text-content-muted group-hover:text-brand-purple transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-content-secondary group-hover:text-content-primary transition-colors">
                        {lang === 'ar' ? 'رفع ملف' : 'Upload File'}
                      </p>
                      <p className="text-[10px] text-content-muted mt-0.5">MP3, WAV, M4A</p>
                    </div>
                    <input type="file" accept="audio/*" className="hidden" onChange={handleVoiceAudioUpload} />
                  </label>

                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-brand-purple/20 hover:border-brand-purple/50 hover:bg-surface-subtle transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-purple/8 group-hover:bg-brand-purple/15 flex items-center justify-center transition-colors">
                      <Mic className="w-4.5 h-4.5 text-brand-purple" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-content-secondary group-hover:text-content-primary transition-colors">
                        {lang === 'ar' ? 'تسجيل مباشر' : 'Record Live'}
                      </p>
                      <p className="text-[10px] text-content-muted mt-0.5">
                        {lang === 'ar' ? 'من الميكروفون' : 'Microphone'}
                      </p>
                    </div>
                  </button>

                  {recordingError && (
                    <p className="col-span-2 text-xs text-red-500 text-center">{recordingError}</p>
                  )}
                </div>
              )}

              {/* STS model */}
              <div className="flex flex-col gap-2 pt-1 border-t border-brand-purple/8">
                <div className="flex flex-col gap-1.5">
                  {([
                    {
                      id: 'eleven_multilingual_sts_v2',
                      name: 'Twinity Swap Pro',
                      tag: lang === 'ar' ? 'موصى به' : 'Recommended',
                      desc: lang === 'ar' ? 'متعدد اللغات — جودة عالية' : 'Multi-language · High quality',
                    },
                    {
                      id: 'eleven_english_sts_v2',
                      name: 'Twinity Swap',
                      tag: null,
                      desc: lang === 'ar' ? 'إنجليزي فقط — أسرع' : 'English only · Faster',
                    },
                  ] as const).map(opt => {
                    const active = state.voiceModel === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChange({ voiceModel: opt.id as ElevenLabsTTSModel })}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                          active
                            ? 'border-brand-purple/50 bg-brand-purple/6'
                            : 'border-brand-purple/12 bg-surface-subtle/60 hover:border-brand-purple/30 hover:bg-surface-subtle'
                        }`}
                        style={active ? { boxShadow: '0 0 0 1px rgba(154,120,254,0.15)' } : undefined}
                      >
                        {/* Radio dot */}
                        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          active ? 'border-brand-purple' : 'border-content-muted/40'
                        }`}>
                          {active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-purple block" />
                          )}
                        </span>
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-semibold ${active ? 'text-content-primary' : 'text-content-secondary'}`}>
                              {opt.name}
                            </span>
                            {opt.tag && (
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                                style={active
                                  ? { background: 'linear-gradient(135deg,#9a78fe,#422266)', color: '#fff' }
                                  : { background: 'rgba(154,120,254,0.1)', color: '#9a78fe' }}
                              >
                                {opt.tag}
                              </span>
                            )}
                          </div>
                          <p className={`text-[10px] mt-0.5 ${active ? 'text-brand-purple/70' : 'text-content-muted'}`}>
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Voice Speed — shared by both modes ───────────── */}
          <div className="flex flex-col gap-3 rounded-2xl border border-brand-purple/12 bg-white p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-content-primary flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-brand-purple" />
                {lang === 'ar' ? 'سرعة الصوت' : 'Voice Speed'}
              </label>
              <span
                className="text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(154,120,254,0.1)', color: '#9a78fe' }}
              >
                {state.voiceSpeed.toFixed(2)}×
              </span>
            </div>
            <input
              type="range"
              min={0.70}
              max={1.20}
              step={0.10}
              value={state.voiceSpeed}
              onChange={e => onChange({ voiceSpeed: parseFloat(e.target.value) })}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-brand-purple"
              style={{ background: `linear-gradient(to right, #9a78fe ${((state.voiceSpeed - 0.70) / 0.50) * 100}%, #ede5ff ${((state.voiceSpeed - 0.70) / 0.50) * 100}%)` }}
            />
            <div className="flex justify-between text-[10px] text-content-muted/70">
              <span>{lang === 'ar' ? 'أبطأ' : 'Slower'}</span>
              <span>{lang === 'ar' ? 'أسرع' : 'Faster'}</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Screen 1 buttons: Preview Voice + Proceed ───── */}
      {state.celebrity && !showFinalizeScreen && (
        <div className="flex flex-col gap-3">
          {scriptOverLimit && (
            <p className="text-xs text-red-500 text-center">
              {lang === 'ar'
                ? 'يرجى تقليل النص إلى 40 كلمة أو أقل قبل التوليد'
                : 'Please shorten your script to 40 words or fewer before generating'}
            </p>
          )}
          {voicePreviewError && (
            <p className="text-sm text-red-500 text-center px-1">{voicePreviewError}</p>
          )}
          <Button
            fullWidth size="lg" variant="secondary"
            icon={<Mic className="w-4 h-4" />}
            loading={voicePreviewLoading}
            disabled={
              !state.celebrity || !state.productType || voicePreviewLoading ||
              (state.voiceChangeEnabled ? (!sourceAudioDataUrl && !state.voiceChangeSourceUrl) : (scriptOverLimit || !state.customScript.trim()))
            }
            onClick={handlePreviewVoice}
          >
            {voicePreviewLoading
              ? (lang === 'ar' ? 'جارٍ توليد الصوت...' : 'Generating Voice...')
              : hasVoiceHistory
                ? (lang === 'ar' ? 'توليد نسخة جديدة' : 'Generate New Take')
                : (lang === 'ar' ? 'معاينة الصوت' : 'Preview Voice')}
          </Button>
          {!hasVoiceHistory && !state.voiceChangeEnabled && (
            <p className="text-xs text-content-muted text-center">
              {lang === 'ar'
                ? 'استمع إلى الصوت في القائمة الجانبية أولاً'
                : 'Listen to the voice on the right first'}
            </p>
          )}
          {!hasVoiceHistory && state.voiceChangeEnabled && (sourceAudioDataUrl || state.voiceChangeSourceUrl) && (
            <p className="text-xs text-content-muted text-center">
              {lang === 'ar'
                ? 'اضغط "معاينة الصوت" للاستماع إلى الصوت المحوّل'
                : 'Click "Preview Voice" to hear the converted celebrity voice'}
            </p>
          )}
          {hasVoiceHistory && (
            <Button
              fullWidth size="lg"
              icon={<Sparkles className="w-4 h-4" />}
              disabled={selectedVoiceIdx < 0}
              onClick={() => setShowFinalizeScreen(true)}
            >
              {lang === 'ar' ? 'المتابعة للتوليد ←' : 'Proceed to Generate →'}
            </Button>
          )}
        </div>
      )}

      {/* ── Screen 2: Back + selected audio + celebrity + AR + Generate ─ */}
      {showFinalizeScreen && state.celebrity && (
        <div className="flex flex-col gap-5">

          {/* Back button */}
          <button
            type="button"
            onClick={() => setShowFinalizeScreen(false)}
            className="flex items-center gap-1.5 text-sm font-medium text-content-muted hover:text-brand-purple transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'ar' ? 'العودة إلى إعدادات الصوت' : 'Back to Voice Settings'}
          </button>

          {/* Selected audio */}
          {selectedVoiceUrl && (() => {
            const entry = voiceHistory[selectedVoiceIdx]
            return (
              <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-content-primary flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-brand-purple" />
                    {lang === 'ar' ? 'الصوت المختار' : 'Selected Voice'}
                  </h3>
                  <span className="text-xs text-content-muted">
                    {lang === 'ar' ? `نسخة ${entry?.take}` : `Take ${entry?.take}`}
                    {entry && <span className="ml-1.5 text-content-muted">· {VOICE_MODEL_DISPLAY[entry.model] ?? entry.model} · ×{entry.speed.toFixed(2)}</span>}
                  </span>
                </div>
                <audio
                  controls
                  controlsList="nodownload noplaybackrate"
                  src={selectedVoiceUrl}
                  className="w-full"
                  style={{ height: '40px' }}
                />
              </section>
            )
          })()}

          {/* Celebrity summary (read-only) */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-content-primary">
              {lang === 'ar' ? 'المشهور' : 'Celebrity'}
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-brand-purple/20 bg-surface-subtle">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-brand-purple/15"
                style={{ background: state.celebrity.avatarColor }}>
                <img src={state.celebrity.image} alt={state.celebrity.name} className="w-full h-full object-cover object-top" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-content-primary truncate">
                  {lang === 'ar' ? state.celebrity.nameAr : state.celebrity.name}
                </p>
                <p className="text-xs text-content-muted">
                  {lang === 'ar' ? state.customScript.slice(0, 50) : state.customScript.slice(0, 50)}
                  {state.customScript.length > 50 ? '…' : ''}
                </p>
              </div>
            </div>
          </section>

          {/* Aspect Ratio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-content-primary">
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

          {/* Scene Settings */}
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
              <ChevronDown className={`w-4 h-4 text-content-muted transition-transform ${sceneOpen ? 'rotate-180' : ''}`} />
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

                {/* AI Image Generator */}
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
                    <div className="rounded-xl border border-brand-purple/15 overflow-hidden flex flex-col">
                      {/* Reference images strip */}
                      <div className="px-3 pt-3 pb-2 border-b border-brand-purple/8 bg-surface-subtle/40">
                        <p className="text-[10px] font-semibold text-content-muted uppercase tracking-widest mb-2">
                          {lang === 'ar' ? 'صور مرجعية' : 'Reference Images'}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {state.celebrity && (
                            <div className="flex flex-col items-center gap-1">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-brand-purple/30 shrink-0"
                                style={{ background: state.celebrity.avatarColor }}>
                                <img src={state.celebrity.image} alt={state.celebrity.name}
                                  className="w-full h-full object-cover object-top" />
                                <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                                  <span className="text-[8px] font-bold text-white bg-brand-purple/70 px-1 rounded leading-tight">
                                    {lang === 'ar' ? 'المشهور' : 'Celeb'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          {(state.propImages ?? []).map((url, i) => (
                            <div key={i} className="relative w-12 h-12 rounded-xl overflow-hidden border border-brand-purple/15 group shrink-0">
                              <img src={url} alt={`prop-${i}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removePropImage(i)}
                                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                          {uploadingProps.map((dataUrl, i) => (
                            <div key={`uploading-${i}`} className="relative w-12 h-12 rounded-xl overflow-hidden border border-brand-purple/15 shrink-0">
                              <img src={dataUrl} alt="uploading" className="w-full h-full object-cover opacity-50" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
                              </div>
                            </div>
                          ))}
                          {state.backgroundImageUrl && (
                            <div className="flex flex-col items-center gap-1">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-brand-purple/60 group shrink-0">
                                <img src={state.backgroundImageUrl} alt="bg" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => onChange({ backgroundImageUrl: null })}
                                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                                <div className="absolute inset-0 flex items-end justify-center pb-0.5 pointer-events-none">
                                  <span className="text-[8px] font-bold text-white bg-brand-purple/70 px-1 rounded leading-tight">
                                    {lang === 'ar' ? 'فيديو' : 'Video'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          <label className="w-12 h-12 rounded-xl border-2 border-dashed border-brand-purple/25 flex flex-col items-center justify-center cursor-pointer hover:border-brand-purple/50 hover:bg-surface-subtle transition-colors shrink-0 gap-0.5">
                            <Upload className="w-3.5 h-3.5 text-content-muted" />
                            <span className="text-[8px] text-content-muted leading-tight text-center">
                              {lang === 'ar' ? 'أضف' : 'Add'}
                            </span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handlePropImages} />
                          </label>
                        </div>
                        <p className="text-[10px] text-content-muted mt-1.5">
                          {lang === 'ar'
                            ? 'أضف صور المنتج أو الدعامة كمراجع للتوليد'
                            : 'Add product / item images as references for generation'}
                        </p>
                      </div>

                      {/* Chat messages */}
                      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 max-h-72 bg-surface-subtle/30"
                        style={{ minHeight: '160px' }}>
                        {chatHistory.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-6">
                            <ImageIcon className="w-7 h-7 text-content-muted/60" />
                            <p className="text-xs text-content-muted">
                              {lang === 'ar'
                                ? 'صف المشهد أو الصورة التي تريد توليدها'
                                : 'Describe the scene you want — celebrity and product will be included'}
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
                                    {state.backgroundImageUrl === msg.imageUrl && (
                                      <div className="absolute top-2 left-2">
                                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg text-white"
                                          style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}>
                                          <CheckCheck className="w-3 h-3" />
                                          {lang === 'ar' ? 'محدد للفيديو' : 'Selected'}
                                        </span>
                                      </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        type="button"
                                        onClick={() => onChange({ backgroundImageUrl: msg.imageUrl! })}
                                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg text-white transition-opacity hover:opacity-90"
                                        style={{ background: 'linear-gradient(135deg,#9a78fe,#422266)' }}
                                      >
                                        <CheckCheck className="w-3 h-3" />
                                        {lang === 'ar' ? 'استخدم للفيديو' : 'Use for video'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onChange({ propImages: [...(state.propImages ?? []), msg.imageUrl!] })}
                                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg text-white transition-opacity hover:opacity-90 bg-black/50"
                                      >
                                        <Upload className="w-3 h-3" />
                                        {lang === 'ar' ? 'كمرجع' : 'As reference'}
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

                      {imageGenError && (
                        <div className="px-3 py-2 text-xs text-red-500 bg-red-50 border-t border-red-100">
                          {imageGenError}
                        </div>
                      )}

                      <div className="border-t border-brand-purple/10 p-2 flex gap-2 bg-white">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendImagePrompt() } }}
                          disabled={imageGenLoading}
                          placeholder={lang === 'ar'
                            ? 'صف المشهد... (مثال: استوديو احترافي بإضاءة دافئة)'
                            : 'Describe the scene... (e.g. professional studio, warm lighting)'}
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
              </div>
            )}
          </div>

          {/* Generate Video */}
          {jobError && <p className="text-sm text-red-500 text-center px-1">{jobError}</p>}
          {hasJobRef && !jobLoading && (
            <p className="text-xs text-emerald-600 text-center flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'تم إرسال الطلب — يمكنك المتابعة' : 'Job submitted — you can proceed'}
            </p>
          )}
          <Button
            fullWidth size="lg"
            icon={<Sparkles className="w-4 h-4" />}
            loading={jobLoading}
            disabled={
              !state.celebrity || !state.productType || jobLoading ||
              (!state.voiceChangeEnabled && (scriptOverLimit || !state.customScript.trim()))
            }
            onClick={handleGenerateVideo}
          >
            {jobLoading
              ? (lang === 'ar' ? 'جارٍ التوليد...' : 'Generating...')
              : (lang === 'ar' ? 'توليد الفيديو' : 'Generate Video')}
          </Button>
        </div>
      )}

      </div>{/* end left column */}

      {/* ── Right column: Voice / Video Preview (sticky) ── */}
      <div className="sticky top-28">
        <div className="rounded-2xl border border-brand-purple/20 overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #FAF7FF, #F3EEFF)' }}>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-brand-purple/10">
            <div className="flex items-center gap-2">
              {!showFinalizeScreen
                ? <Volume2 className="w-3.5 h-3.5 text-brand-purple" />
                : <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />}
              <span className="text-sm font-semibold text-content-primary">
                {!showFinalizeScreen
                  ? (lang === 'ar' ? 'سجل الأصوات' : 'Voice History')
                  : (lang === 'ar' ? 'معاينة' : 'Preview')}
              </span>
              {!showFinalizeScreen && hasVoiceHistory && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple">
                  {voiceHistory.length}
                </span>
              )}
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
            {!showFinalizeScreen ? (
              /* Voice takes history — screen 1 */
              <div className="flex flex-col gap-2">
                {!hasVoiceHistory ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                    <div className="w-10 h-10 rounded-xl bg-brand-purple/8 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-brand-purple/50" />
                    </div>
                    <p className="text-sm text-content-muted">
                      {lang === 'ar'
                        ? 'اضغط على "معاينة الصوت" لتوليد أول نسخة'
                        : 'Click "Preview Voice" to generate your first take'}
                    </p>
                  </div>
                ) : (
                <><div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-content-muted uppercase tracking-wide">
                    {lang === 'ar' ? `${voiceHistory.length} نسخ` : `${voiceHistory.length} Take${voiceHistory.length > 1 ? 's' : ''}`}
                  </p>
                  <p className="text-[10px] text-content-muted">
                    {lang === 'ar' ? 'اختر الأفضل' : 'Select the best one'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-0.5">
                  {[...voiceHistory].reverse().map((entry, reversedIdx) => {
                    const actualIdx = voiceHistory.length - 1 - reversedIdx
                    const isSelected = selectedVoiceIdx === actualIdx
                    const isLatest   = actualIdx === voiceHistory.length - 1
                    const modelLabel = VOICE_MODEL_DISPLAY[entry.model] ?? entry.model
                    return (
                      <div
                        key={actualIdx}
                        className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-brand-purple/50 bg-brand-purple/5 shadow-sm'
                            : 'border-brand-purple/12 bg-white hover:border-brand-purple/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-purple shrink-0" />}
                            <span className="text-xs font-bold text-content-primary">
                              {lang === 'ar' ? `نسخة ${entry.take}` : `Take ${entry.take}`}
                            </span>
                            {isLatest && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple shrink-0">
                                {lang === 'ar' ? 'أحدث' : 'Latest'}
                              </span>
                            )}
                          </div>
                          {isSelected ? (
                            <span className="text-[10px] font-bold text-brand-purple px-2 py-0.5 rounded-full bg-brand-purple/10 shrink-0">
                              {lang === 'ar' ? 'محدد' : 'Selected'}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedVoiceIdx(actualIdx)}
                              className="text-[11px] font-semibold text-brand-purple hover:text-brand-dark transition-colors shrink-0 px-2 py-0.5 rounded-lg hover:bg-brand-purple/8"
                            >
                              {lang === 'ar' ? 'اختيار' : 'Select'}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-content-muted">
                          <span>{modelLabel}</span>
                          <span>·</span>
                          <span>×{entry.speed.toFixed(2)}</span>
                          {entry.voiceChange && (
                            <>
                              <span>·</span>
                              <span>{lang === 'ar' ? 'تبديل الصوت' : 'Voice Swap'}</span>
                            </>
                          )}
                        </div>
                        <audio controls controlsList="nodownload noplaybackrate" src={entry.url} className="w-full" style={{ height: '36px' }} />
                      </div>
                    )
                  })}
                </div>
                {voicePreviewLoading && (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs text-brand-purple">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {lang === 'ar' ? 'جارٍ توليد نسخة جديدة...' : 'Generating new take...'}
                  </div>
                )}
                </>)}
              </div>
            ) : (
              /* Video preview — screen 2 (after clicking Proceed to Generate) */
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
            )}
          </div>
        </div>
      </div>

      </div>{/* end grid */}
    </div>
  )
}
