import {
  Activity,
  Wind,
  Leaf,
  Heart,
  Brain,
  Play,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react'
import { Button } from './Button'

export interface Activity {
  id: string
  title: string
  type: 'breathing' | 'meditation' | 'stretching' | 'journaling' | 'walk' | 'other'
  durationMinutes: number
  instructions?: string[]
}

interface ActivityCardProps {
  activity: Activity
  onStart?: (id: string) => void
  onComplete?: (id: string) => void
  completed?: boolean
  started?: boolean
  currentStep?: number
}

const typeConfig: Record<
  Activity['type'],
  { icon: typeof Wind; label: string; accent: string }
> = {
  breathing: {
    icon: Wind,
    label: 'Breathing',
    accent: 'from-accent-cyan/25 to-sky-500/20 text-accent-cyan',
  },
  meditation: {
    icon: Leaf,
    label: 'Meditation',
    accent: 'from-accent-green/25 to-emerald-500/20 text-accent-green',
  },
  stretching: {
    icon: Activity,
    label: 'Movement',
    accent: 'from-accent-amber/25 to-orange-500/20 text-accent-amber',
  },
  journaling: {
    icon: Heart,
    label: 'Journaling',
    accent: 'from-accent-rose/25 to-pink-500/20 text-accent-rose',
  },
  walk: {
    icon: Activity,
    label: 'Walk',
    accent: 'from-accent-lavender/25 to-indigo-500/20 text-accent-lavender',
  },
  other: {
    icon: Brain,
    label: 'Activity',
    accent: 'from-accent-warm/25 to-white/10 text-accent-warm',
  },
}

export function ActivityCard({
  activity,
  onStart,
  onComplete,
  completed = false,
  started = false,
  currentStep = 0,
}: ActivityCardProps) {
  const { icon: Icon, label, accent } = typeConfig[activity.type]
  const totalSteps = activity.instructions?.length ?? 0

  return (
    <div className="group relative bg-surface/80 backdrop-blur-xl border border-surface-border rounded-2xl p-5 shadow-glass hover:border-accent-lavender/30 hover:shadow-glow transition-all duration-300">
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${accent} border border-surface-border/60 backdrop-blur-sm flex-shrink-0`}
        >
          <Icon className="w-7 h-7" strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary bg-surface-hover/60 px-2.5 py-1 rounded-lg border border-surface-border/60">
              <Clock className="w-3.5 h-3.5" />
              {activity.durationMinutes} min
            </span>
          </div>

          <h3 className="font-display text-lg font-semibold text-text-primary mb-1 leading-tight">
            {activity.title}
          </h3>

          {activity.instructions && activity.instructions.length > 0 && (
            <div className="mt-3 space-y-2">
              {activity.instructions.map((step, idx) => {
                const isDone = completed || idx < currentStep
                const isCurrent = started && !completed && idx === currentStep
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-sm transition-opacity duration-200"
                  >
                    <button
                      onClick={() => onComplete?.(activity.id)}
                      aria-label={isDone ? 'Completed step' : 'Mark step complete'}
                      className="w-6 h-6 mt-0.5 flex-shrink-0 flex items-center justify-center rounded-full transition-all"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-6 h-6 text-accent-green" />
                      ) : isCurrent ? (
                        <Circle className="w-6 h-6 text-accent-lavender animate-pulse" />
                      ) : (
                        <Circle className="w-6 h-6 text-text-muted/60 group-hover:text-text-muted transition-colors" />
                      )}
                    </button>
                    <span
                      className={`leading-relaxed pt-0.5 ${
                        isDone
                          ? 'text-text-muted/80 line-through decoration-2'
                          : isCurrent
                          ? 'text-text-primary font-medium'
                          : 'text-text-secondary'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                )
              })}
              {totalSteps > 0 && (
                <div className="flex items-center gap-2 pt-1.5">
                  <div className="flex-1 h-1.5 bg-surface-hover/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-lavender to-accent-cyan transition-all duration-500"
                      style={{
                        width: completed
                          ? '100%'
                          : `${(currentStep / totalSteps) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-text-muted font-medium">
                    {completed ? totalSteps : currentStep}/{totalSteps}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        <button
          onClick={() => onComplete?.(activity.id)}
          aria-label="Mark complete"
          disabled={completed}
          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 ${
            completed
              ? 'bg-accent-green/15 text-accent-green border border-accent-green/30'
              : 'text-text-muted hover:bg-surface-hover/60 hover:text-accent-green border border-transparent hover:border-accent-green/30'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
        {!completed && (
          <Button
            size="sm"
            variant={started ? 'secondary' : 'primary'}
            onClick={() => onStart?.(activity.id)}
            className="min-w-[120px]"
          >
            <Play className="w-4 h-4" />
            {started ? 'Resume' : 'Start'}
          </Button>
        )}
      </div>
    </div>
  )
}
