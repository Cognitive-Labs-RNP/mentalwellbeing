import { LucideIcon, Inbox } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  ctaLabel?: string
  onCta?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  ctaLabel,
  onCta,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-8 px-4 ${className}`}
    >
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-2xl bg-surface-hover/50 border border-surface-border/60 backdrop-blur-sm">
        <Icon
          className="w-8 h-8 text-text-muted/80"
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>
      <h4 className="font-display text-base font-semibold text-text-secondary mb-1.5">
        {title}
      </h4>
      {description && (
        <p className="text-sm text-text-muted/90 leading-relaxed max-w-sm mb-5">
          {description}
        </p>
      )}
      {ctaLabel && onCta && (
        <Button size="sm" variant="secondary" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
