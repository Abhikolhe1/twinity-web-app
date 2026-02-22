import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconEnd?: React.ReactNode
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconEnd,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'

  const variants: Record<Variant, string> = {
    primary:
      'text-white shadow-button hover:shadow-purple-lg hover:opacity-90 active:scale-95',
    secondary:
      'bg-surface-subtle text-brand-purple border border-brand-purple/25 hover:bg-surface-elevated hover:border-brand-purple/50 active:scale-95',
    ghost:
      'text-content-secondary hover:text-brand-purple hover:bg-surface-subtle active:scale-95',
    outline:
      'bg-transparent text-brand-purple border border-brand-purple/50 hover:bg-surface-subtle hover:border-brand-purple active:scale-95',
    danger:
      'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-95',
  }

  const sizes: Record<Size, string> = {
    sm: 'text-sm px-3.5 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3.5',
  }

  const primaryStyle =
    variant === 'primary'
      ? { background: 'linear-gradient(135deg, #9a78fe 0%, #422266 100%)' }
      : undefined

  return (
    <button
      style={primaryStyle}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : icon}
      {children}
      {!loading && iconEnd}
    </button>
  )
}
