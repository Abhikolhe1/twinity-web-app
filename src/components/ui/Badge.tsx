interface BadgeProps {
  children: React.ReactNode
  variant?: 'purple' | 'green' | 'yellow' | 'red' | 'blue' | 'gray'
  size?: 'sm' | 'md'
  dot?: boolean
}

export default function Badge({
  children,
  variant = 'purple',
  size = 'sm',
  dot = false,
}: BadgeProps) {
  const variants = {
    purple: 'bg-brand-purple/10 text-brand-purple border-brand-purple/25',
    green:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red:    'bg-red-50 text-red-600 border-red-200',
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    gray:   'bg-surface-subtle text-content-muted border-brand-purple/10',
  }

  const dotColors = {
    purple: 'bg-brand-purple',
    green:  'bg-emerald-500',
    yellow: 'bg-amber-500',
    red:    'bg-red-500',
    blue:   'bg-blue-500',
    gray:   'bg-content-muted',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${variants[variant]} ${sizes[size]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}
