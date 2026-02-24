'use client'

import { WizardState, Tone, Channel, Duration } from '@/lib/types'
import { TONES, CHANNELS, DURATIONS } from '@/lib/data'
import { useLanguage } from '@/lib/context'
import { TextArea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ToggleLeft, ToggleRight } from 'lucide-react'

interface Props {
  state: WizardState
  onChange: (updates: Partial<WizardState>) => void
  onNext: () => void
  onBack: () => void
}

export default function StepCustomize({ state, onChange, onNext, onBack }: Props) {
  const { lang, tr } = useLanguage()

  const templateScript = state.template
    ? lang === 'ar' ? state.template.sampleScriptAr : state.template.sampleScript
    : ''

  const toggleChannel = (channelId: string) => {
    const channels = state.channels.includes(channelId as Channel)
      ? state.channels.filter(c => c !== channelId)
      : [...state.channels, channelId as Channel]
    onChange({ channels })
  }

  const canProceed = state.tone && state.duration && state.channels.length > 0

  const chip = (active: boolean) =>
    `px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
      active
        ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/40 shadow-purple-sm'
        : 'bg-white text-content-secondary border-brand-purple/15 hover:border-brand-purple/35 hover:text-brand-purple'
    }`

  return (
    <div className="flex flex-col gap-7">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-primary">{tr.create.customize}</h2>
        <p className="mt-2 text-content-muted text-sm sm:text-base">{tr.create.customizeSub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left */}
        <div className="flex flex-col gap-5">
          {/* Script */}
          <div className="flex flex-col gap-3">
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
                rows={6}
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
          </div>

          {/* Tone */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-content-primary">{tr.create.tone}</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map(tone => (
                <button key={tone.id} onClick={() => onChange({ tone: tone.id as Tone })} className={chip(state.tone === tone.id)}>
                  {lang === 'ar' ? tone.ar : tone.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-5">
          {/* Duration */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-content-primary">{tr.create.duration}</label>
            <div className="grid grid-cols-5 gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d.id}
                  onClick={() => onChange({ duration: d.id as Duration })}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    state.duration === d.id
                      ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/40'
                      : 'bg-white text-content-muted border-brand-purple/15 hover:border-brand-purple/35 hover:text-brand-purple'
                  }`}
                >
                  {d.id}
                </button>
              ))}
            </div>
            {state.duration && (
              <p className="text-xs text-content-muted">
                {DURATIONS.find(d => d.id === state.duration)?.[lang === 'ar' ? 'ar' : 'en']}
              </p>
            )}
          </div>

          {/* Channels */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-content-primary">{tr.create.channels}</label>
              <span className="text-xs text-content-muted">{tr.create.channelsHint}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CHANNELS.map(ch => {
                const isSelected = state.channels.includes(ch.id as Channel)
                return (
                  <button
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/35'
                        : 'bg-white text-content-muted border-brand-purple/12 hover:border-brand-purple/30 hover:text-brand-purple'
                    }`}
                  >
                    <span>{ch.icon}</span>
                    <span className="text-xs">{lang === 'ar' ? ch.ar : ch.en}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Language */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-content-primary">{tr.create.language}</label>
            <div className="flex gap-2">
              {(['en', 'ar'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => onChange({ language: l })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    state.language === l
                      ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/40'
                      : 'bg-white text-content-muted border-brand-purple/15 hover:border-brand-purple/35 hover:text-brand-purple'
                  }`}
                >
                  {l === 'en' ? '🇺🇸 English' : '🇸🇦 العربية'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
