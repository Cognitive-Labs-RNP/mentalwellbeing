import { MapPin, Star, ArrowRight, MessageCircle } from 'lucide-react'
import { Button } from './Button'
import { Tag } from './Tag'

export interface Provider {
  id?: string
  name: string
  rating: number
  location: string
  cost?: string
  specialisations: string[]
  mode: 'in-person' | 'online' | 'hybrid'
}

interface ProviderCardProps {
  provider: Provider
  onView?: (provider: Provider) => void
  className?: string
}

const gradients = [
  'from-accent-lavender to-purple-500',
  'from-accent-cyan to-sky-500',
  'from-accent-green to-emerald-500',
  'from-accent-rose to-pink-500',
  'from-accent-amber to-orange-500',
]

export function ProviderCard({
  provider,
  onView,
  className = '',
}: ProviderCardProps) {
  const initials = provider.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const gradientIdx =
    provider.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    gradients.length

  const fullStars = Math.floor(provider.rating)
  const hasHalf = provider.rating - fullStars >= 0.5

  return (
    <div
      className={`group bg-surface/80 backdrop-blur-xl border border-surface-border rounded-2xl p-5 shadow-glass hover:border-accent-lavender/30 hover:shadow-glow transition-all duration-300 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[gradientIdx]} text-white font-display font-bold text-lg flex-shrink-0 shadow-lg`}
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-display text-lg font-semibold text-text-primary truncate">
              {provider.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0 bg-surface-hover/50 px-2.5 py-1 rounded-lg border border-surface-border/60">
              <Star className="w-4 h-4 text-accent-amber fill-accent-amber/90" />
              <span className="text-sm font-semibold tabular-nums text-text-primary">
                {provider.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-text-muted mb-1 flex-wrap" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < fullStars
                    ? 'text-accent-amber fill-accent-amber/90'
                    : i === fullStars && hasHalf
                    ? 'text-accent-amber fill-half'
                    : 'text-text-muted/30'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-sm text-text-secondary mb-3">
            <MapPin className="w-4 h-4 text-text-muted flex-shrink-0" />
            <span className="truncate">{provider.location}</span>
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {provider.specialisations.slice(0, 3).map((spec) => (
              <Tag key={spec} size="sm" variant="lavender">
                {spec}
              </Tag>
            ))}
            {provider.specialisations.length > 3 && (
              <Tag size="sm" variant="default">
                +{provider.specialisations.length - 3}
              </Tag>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-surface-border/60 mt-2">
        <div className="flex items-center gap-3 flex-wrap">
          {provider.cost && (
            <span className="text-sm font-medium text-text-primary">
              {provider.cost}
            </span>
          )}
          <Tag size="sm" variant="cyan">
            {provider.mode}
          </Tag>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Message"
            className="w-11 h-11 flex items-center justify-center rounded-xl text-text-muted hover:text-accent-cyan hover:bg-surface-hover/60 border border-transparent hover:border-accent-cyan/30 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onView?.(provider)}
          >
            View
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
