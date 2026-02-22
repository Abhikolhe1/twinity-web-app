'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Celebrity } from '@/lib/types'
import { useLanguage } from '@/lib/context'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  RotateCcw,
} from 'lucide-react'
import Button from '@/components/ui/Button'

interface VideoPreviewProps {
  celebrity: Celebrity | null
  templateName: string
  productType: string
  duration: string           // e.g. "30s"
  onDownload: () => void
  downloadClicked: boolean
  lang: string
}

// Convert duration string to seconds for the mock player
function durationToSeconds(d: string): number {
  if (d === '2min') return 120
  return parseInt(d) || 30
}

// Format seconds → mm:ss
function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoPreview({
  celebrity,
  templateName,
  productType,
  duration,
  onDownload,
  downloadClicked,
  lang,
}: VideoPreviewProps) {
  const totalSeconds = durationToSeconds(duration || '30s')

  // States
  const [phase, setPhase] = useState<'processing' | 'ready'>('processing')
  const [processingPct, setProcessingPct] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [ended, setEnded] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playerRef = useRef<HTMLDivElement>(null)

  // ── Phase 1: Processing animation ──────────────────────────────
  useEffect(() => {
    let pct = 0
    const id = setInterval(() => {
      pct += Math.random() * 18 + 4
      if (pct >= 100) {
        pct = 100
        setProcessingPct(100)
        clearInterval(id)
        setTimeout(() => setPhase('ready'), 400)
      } else {
        setProcessingPct(Math.round(pct))
      }
    }, 180)
    return () => clearInterval(id)
  }, [])

  // ── Phase 2: Playback timer ─────────────────────────────────────
  const tick = useCallback(() => {
    setCurrentTime(prev => {
      if (prev >= totalSeconds) {
        setPlaying(false)
        setEnded(true)
        return totalSeconds
      }
      return prev + 0.25
    })
  }, [totalSeconds])

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(tick, 250)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, tick])

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    if (playing) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 2800)
    }
  }, [playing])

  useEffect(() => { resetControlsTimer() }, [playing, resetControlsTimer])

  const togglePlay = () => {
    if (ended) {
      setCurrentTime(0)
      setEnded(false)
      setPlaying(true)
    } else {
      setPlaying(p => !p)
    }
    resetControlsTimer()
  }

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newTime = ratio * totalSeconds
    setCurrentTime(newTime)
    setEnded(false)
    resetControlsTimer()
  }

  const progressPct = (currentTime / totalSeconds) * 100

  // ── Processing phase ────────────────────────────────────────────
  if (phase === 'processing') {
    return (
      <div
        className="w-full aspect-video rounded-2xl flex flex-col items-center justify-center gap-5 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #EDE5FF 0%, #D4C5FF 100%)` }}
      >
        {/* Animated gradient shimmer */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(154,120,254,0.18) ${processingPct}%, transparent ${processingPct + 8}%)`,
            transition: 'background 0.2s',
          }}
        />
        {/* Spinning ring */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 animate-spin" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" stroke="rgba(154,120,254,0.15)" strokeWidth="4" fill="none" />
              <circle
                cx="32" cy="32" r="28"
                stroke="url(#pg)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28 * processingPct / 100} ${2 * Math.PI * 28}`}
                strokeDashoffset={2 * Math.PI * 28 * 0.25}
              />
              <defs>
                <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9a78fe" />
                  <stop offset="100%" stopColor="#422266" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-brand-purple">
              {processingPct}%
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-content-primary">
              {lang === 'ar' ? 'جارٍ توليد المعاينة...' : 'Generating preview...'}
            </p>
            <p className="text-xs text-content-muted mt-1">
              {lang === 'ar' ? 'يستغرق هذا لحظات قليلة' : 'This takes just a moment'}
            </p>
          </div>
        </div>

        {/* Processing steps */}
        <div className="relative z-10 flex gap-3">
          {[
            lang === 'ar' ? 'تحليل النص' : 'Analyzing script',
            lang === 'ar' ? 'توليد الصوت' : 'Generating voice',
            lang === 'ar' ? 'دمج الفيديو' : 'Rendering video',
          ].map((step, i) => {
            const done = processingPct > (i + 1) * 30
            return (
              <span
                key={step}
                className={`text-xs px-2 py-1 rounded-lg border transition-all duration-500 ${
                  done
                    ? 'bg-brand-purple/15 text-brand-purple border-brand-purple/30'
                    : 'bg-white/50 text-content-muted border-brand-purple/10'
                }`}
              >
                {done ? '✓ ' : ''}{step}
              </span>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Video player phase ──────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Player */}
      <div
        ref={playerRef}
        className="w-full aspect-video rounded-2xl relative overflow-hidden cursor-pointer select-none group"
        style={{ background: celebrity?.avatarColor ?? 'linear-gradient(135deg,#9a78fe,#422266)' }}
        onClick={togglePlay}
        onMouseMove={resetControlsTimer}
      >
        {/* Background scene — simulated video content */}
        <div className="absolute inset-0">
          {/* Radial gradient spotlight */}
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 40%, rgba(255,255,255,0.12) 0%, transparent 70%)' }}
          />
          {/* Subtle scan-line overlay for film feel */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 4px)',
            }}
          />
          {/* Animated particles when playing */}
          {playing && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  style={{
                    left: `${15 + i * 14}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    animation: `float ${2 + i * 0.4}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Celebrity avatar — centre stage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
          {celebrity?.image ? (
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
              <img
                src={celebrity.image}
                alt={lang === 'ar' ? celebrity.nameAr : celebrity.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white font-bold text-3xl sm:text-4xl border-4 border-white/25 shadow-2xl"
              style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}
            >
              {celebrity?.initials ?? 'TW'}
            </div>
          )}
          {celebrity && (
            <div className="text-center">
              <p className="text-white font-bold text-base sm:text-lg drop-shadow">
                {lang === 'ar' ? celebrity.nameAr : celebrity.name}
              </p>
              <p className="text-white/70 text-xs mt-0.5">{templateName}</p>
            </div>
          )}
        </div>

        {/* PREVIEW watermark */}
        <div className="absolute top-3 right-3 z-20">
          <span className="text-[10px] font-bold tracking-widest text-white/60 bg-black/30 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
            PREVIEW
          </span>
        </div>

        {/* Big play/pause overlay — appears on click or when paused/ended */}
        {(!playing || ended) && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            >
              {ended
                ? <RotateCcw className="w-7 h-7 text-white" />
                : <Play className="w-7 h-7 text-white ml-1" />}
            </div>
          </div>
        )}

        {/* Controls overlay — bottom bar */}
        <div
          className="absolute bottom-0 inset-x-0 z-30 transition-all duration-300"
          style={{
            opacity: showControls ? 1 : 0,
            transform: showControls ? 'translateY(0)' : 'translateY(4px)',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
            paddingBottom: '12px',
            paddingTop: '40px',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div
            className="mx-3 mb-2 h-1 bg-white/25 rounded-full cursor-pointer relative group/bar"
            onClick={seekTo}
          >
            {/* Buffered (fake) */}
            <div
              className="absolute inset-y-0 left-0 bg-white/20 rounded-full"
              style={{ width: `${Math.min(100, progressPct + 15)}%` }}
            />
            {/* Played */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#9a78fe,#c4a8ff)' }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"
              style={{ left: `${progressPct}%` }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3 px-4">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-white/80 transition-colors"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Mute */}
            <button
              onClick={() => setMuted(m => !m)}
              className="text-white hover:text-white/80 transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Time */}
            <span className="text-white/80 text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(totalSeconds)}
            </span>

            <div className="flex-1" />

            {/* Product type tag */}
            <span className="text-white/60 text-xs hidden sm:inline">{productType}</span>

            {/* Fullscreen hint */}
            <button className="text-white/60 hover:text-white transition-colors">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Below-player: info + download */}
      <div className="flex flex-col gap-3">
        {/* Video meta */}
        <div className="flex items-center justify-between text-xs text-content-muted px-1">
          <span>
            {celebrity ? (lang === 'ar' ? celebrity.nameAr : celebrity.name) : 'Twinity'} · {templateName}
          </span>
          <span className="bg-surface-subtle border border-brand-purple/15 px-2 py-0.5 rounded-full text-brand-purple font-medium">
            {duration || '30s'}
          </span>
        </div>

        {/* Download button — always visible but morphs after click */}
        <Button
          fullWidth
          size="lg"
          variant={downloadClicked ? 'secondary' : 'primary'}
          icon={<Download className="w-5 h-5" />}
          onClick={onDownload}
        >
          {downloadClicked
            ? (lang === 'ar' ? '✓ جارٍ التنزيل...' : '✓ Downloading...')
            : (lang === 'ar' ? 'تنزيل الفيديو' : 'Download Video')}
        </Button>

        {!downloadClicked && (
          <p className="text-xs text-center text-content-muted">
            {lang === 'ar'
              ? 'صيغة MP4 · دقة 1080p · علامة مائية خلال الفترة التجريبية'
              : 'MP4 format · 1080p · Watermarked during trial period'}
          </p>
        )}
      </div>
    </div>
  )
}
