import { Brain, AlertTriangle, ShieldAlert, Sparkles, Info } from 'lucide-react'

interface PatternResultCardProps {
  conditionId: string
  conditionName?: string
  similarityPercent: number
  className?: string
}

function getIcon(pct: number) {
  if (pct >= 80) return { icon: ShieldAlert, label: 'High match' }
  if (pct >= 60) return { icon: AlertTriangle, label: 'Notable match' }
  return { icon: Sparkles, label: 'Mild signal' }
}

function getAccent(pct: number) {
  if (pct >= 80)
    return {
      bg: 'from-accent-rose/30 to-pink-500/20',
      border: 'border-accent-rose/30',
      text: 'text-accent-rose',
      glow: 'shadow-[0_0_28px_rgba(248,113,113,0.22)]',
      bar: 'from-accent-rose to-pink-400',
    }
  if (pct >= 60)
    return {
      bg: 'from-accent-amber/30 to-orange-500/20',
      border: 'border-accent-amber/30',
      text: 'text-accent-amber',
      glow: 'shadow-[0_0_28px_rgba(251,191,36,0.22)]',
      bar: 'from-accent-amber to-orange-400',
    }
  return {
    bg: 'from-accent-lavender/30 to-indigo-500/20',
    border: 'border-accent-lavender/30',
    text: 'text-accent-lavender',
    glow: 'shadow-[0_0_28px_rgba(167,139,250,0.22)]',
    bar: 'from-accent-lavender to-purple-400',
  }
}

export function PatternResultCard({
  conditionId,
  conditionName,
  similarityPercent,
  className = '',
}: PatternResultCardProps) {
  const clamped = Math.min(100, Math.max(0, similarityPercent))
  const name = conditionName ?? conditionId
  const { icon: Icon } = getIcon(clamped)
  const accent = getAccent(clamped)

  return (
    <div
      className={`relative bg-surface/80 backdrop-blur-xl border ${accent.border} rounded-2xl p-6 shadow-glass ${accent.glow} ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div
          className={`w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br ${accent.bg} border border-surface-border/60 backdrop-blur-sm flex-shrink-0`}
        >
          <Brain className="w-8 h-8 text-text-primary/90 absolute opacity-20" />
          <Icon className={`w-8 h-8 ${accent.text} relative z-10`} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-gradient-to-r ${accent.bg} ${accent.text} border border-current/20`}
            >
              Pattern detected
            </span>
            <span className="text-xs text-text-muted font-mono uppercase tracking-wider opacity-80">
              {conditionId}
            </span>
          </div>

          <p className="text-base sm:text-lg text-text-primary leading-relaxed mb-3">
            <span className="font-semibold">{name}</span>-related pattern
            detected —{' '}
            <span className={`font-bold ${accent.text}`}>
              Pattern similarity: {Math.round(clamped)}%
            </span>
          </p>

          <div className="w-full h-2.5 bg-surface-hover/60 rounded-full overflow-hidden border border-surface-border/50 mb-4">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${accent.bar} transition-all duration-1000 ease-out`}
              style={{ width: `${clamped}%` }}
            />
          </div>

          <div className="flex items-start gap-2 p-3.5 bg-surface-hover/40 rounded-xl border border-surface-border/50 backdrop-blur-sm">
            <Info
              className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5"
              strokeWidth={1.8}
            />
            <p className="text-xs leading-relaxed text-text-muted">
              <strong className="text-text-secondary">
                This is not a clinical diagnosis.
              </strong>{' '}
              Pattern matching is informational only and based on aggregated,
              anonymised research data. Always consult a licensed mental health
              professional for evaluation, diagnosis, or treatment decisions.
            </p>
          </div>
        </div>

        <div
          className={`w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-3xl bg-gradient-to-br ${accent.bg} border ${accent.border} backdrop-blur-sm flex flex-col items-center justify-center ${accent.glow}`}
        >
          <span
            className={`text-3xl sm:text-4xl font-display font-black tabular-nums ${accent.text}`}
          >
            {Math.round(clamped)}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted mt-0.5">
            % match
          </span>
        </div>
      </div>
    </div>
  )
}
