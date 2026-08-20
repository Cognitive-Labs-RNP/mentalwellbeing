type Status = 'improving' | 'unchanged' | 'worsening' | 'default'

interface ProgressBarProps {
  value: number
  label?: string
  showPercentage?: boolean
  status?: Status
  className?: string
}

const statusColors: Record<Status, string> = {
  improving:
    'bg-gradient-to-r from-accent-green/80 to-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.35)]',
  unchanged:
    'bg-gradient-to-r from-accent-amber/80 to-orange-400 shadow-[0_0_16px_rgba(251,191,36,0.3)]',
  worsening:
    'bg-gradient-to-r from-accent-rose/80 to-red-400 shadow-[0_0_16px_rgba(248,113,113,0.35)]',
  default:
    'bg-gradient-to-r from-accent-lavender to-purple-400 shadow-[0_0_16px_rgba(167,139,250,0.35)]',
}

export function ProgressBar({
  value,
  label,
  showPercentage = false,
  status = 'default',
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-text-secondary">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold tabular-nums text-text-primary">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full h-3 bg-surface-hover/60 rounded-full overflow-hidden backdrop-blur-sm border border-surface-border/50"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${statusColors[status]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
