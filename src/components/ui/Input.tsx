import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export function Input({ label, error, hint, icon, className = '', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-content-primary">
          {label}
          {rest.required && <span className="text-brand-purple ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={`w-full bg-white border border-brand-purple/20 rounded-xl px-4 py-3 text-content-primary placeholder-content-placeholder text-sm transition-all duration-200 focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_3px_rgba(154,120,254,0.12)] ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''} ${className}`}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-content-muted">{hint}</p>}
    </div>
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function TextArea({ label, error, hint, className = '', ...rest }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-content-primary">
          {label}
          {rest.required && <span className="text-brand-purple ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full bg-white border border-brand-purple/20 rounded-xl px-4 py-3 text-content-primary placeholder-content-placeholder text-sm transition-all duration-200 focus:outline-none focus:border-brand-purple focus:shadow-[0_0_0_3px_rgba(154,120,254,0.12)] resize-none ${
          error ? 'border-red-400' : ''
        } ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-content-muted">{hint}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className = '', ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-content-primary">{label}</label>
      )}
      <select
        className={`w-full bg-white border border-brand-purple/20 rounded-xl px-4 py-3 text-content-primary text-sm transition-all duration-200 focus:outline-none focus:border-brand-purple appearance-none cursor-pointer ${className}`}
        {...rest}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
