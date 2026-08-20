import { useState } from 'react'
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Brain,
  Activity,
  Circle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Tag } from './Tag'

export interface TimelineEntry {
  id: string
  date: string | Date
  moodChange?: number
  conditionResult?: {
    conditionName: string
    similarityPercent: number
    conditionId: string
  }
  activities?: Array<{
    id: string
    title: string
    type: string
    completed?: boolean
  }>
}

interface TimelineProps {
  entries: TimelineEntry[]
  className?: string
}

function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function NodeIcon({ entry }: { entry: TimelineEntry }) {
  if (entry.conditionResult) {
    return (
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-accent-lavender/35 to-purple-500/25 border border-accent-lavender/40 shadow-glow">
        <Brain className="w-5.5 h-5.5 text-accent-lavender" strokeWidth={2} />
      </div>
    )
  }
  if (entry.moodChange && entry.moodChange !== 0) {
    const improving = entry.moodChange > 0
    return (
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm ${
          improving
            ? 'bg-gradient-to-br from-accent-green/35 to-emerald-500/25 border-accent-green/40 text-accent-green'
            : 'bg-gradient-to-br from-accent-rose/35 to-pink-500/25 border-accent-rose/40 text-accent-rose'
        }`}
      >
        {improving ? (
          <TrendingUp className="w-5.5 h-5.5" strokeWidth={2.2} />
        ) : (
          <TrendingDown className="w-5.5 h-5.5" strokeWidth={2.2} />
        )}
      </div>
    )
  }
  if (entry.activities && entry.activities.length > 0) {
    return (
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-accent-cyan/35 to-sky-500/25 border border-accent-cyan/40">
        <Activity className="w-5.5 h-5.5 text-accent-cyan" strokeWidth={2} />
      </div>
    )
  }
  return (
    <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-surface-hover/60 border border-surface-border text-text-muted">
      <Sparkles className="w-5 h-5" />
    </div>
  )
}

export function Timeline({ entries, className = '' }: TimelineProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(entries.slice(0, 3).map((e) => e.id))
  )

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (entries.length === 0) {
    return (
      <div className="py-12 text-center text-text-muted text-sm">
        No entries yet.
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-5.5 top-2 bottom-2 w-px bg-gradient-to-b from-accent-lavender/30 via-surface-border to-transparent" aria-hidden="true" />

      <ol className="space-y-4">
        {entries.map((entry) => {
          const isOpen = expanded.has(entry.id)
          return (
            <li key={entry.id} className="relative pl-16">
              <div className="absolute left-0 top-0 z-10">
                <NodeIcon entry={entry} />
              </div>

              <div
                className="bg-surface/75 backdrop-blur-xl border border-surface-border rounded-2xl shadow-glass overflow-hidden transition-all duration-300 hover:border-accent-lavender/30"
              >
                <button
                  onClick={() => toggle(entry.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-5 flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lavender/50 rounded-2xl"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        {formatDate(entry.date)}
                      </span>
                      {entry.moodChange && entry.moodChange !== 0 && (
                        <Tag
                          size="sm"
                          variant={entry.moodChange > 0 ? 'green' : 'rose'}
                        >
                          {entry.moodChange > 0 ? '+' : ''}
                          {entry.moodChange} mood
                        </Tag>
                      )}
                      {entry.conditionResult && (
                        <Tag size="sm" variant="lavender">
                          Pattern match
                        </Tag>
                      )}
                      {entry.activities && entry.activities.length > 0 && (
                        <Tag size="sm" variant="cyan">
                          {entry.activities.filter((a) => a.completed).length}/
                          {entry.activities.length} activities
                        </Tag>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {entry.conditionResult
                        ? `${entry.conditionResult.conditionName} pattern detected`
                        : entry.moodChange
                        ? entry.moodChange > 0
                          ? 'Improved wellbeing'
                          : 'Notable dip in mood'
                        : entry.activities && entry.activities.length > 0
                        ? `${entry.activities.length} ${
                            entry.activities.length === 1
                              ? 'activity'
                              : 'activities'
                          } logged`
                        : 'Check-in recorded'}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover/60 transition-all flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-0 border-t border-surface-border/60 animate-fade-in">
                    <div className="pt-4 space-y-4">
                      {entry.conditionResult && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-accent-lavender/10 to-purple-500/5 border border-accent-lavender/25">
                          <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                            <span className="text-sm font-semibold text-text-primary">
                              {entry.conditionResult.conditionName}
                            </span>
                            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
                              {entry.conditionResult.conditionId}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-surface-hover/60 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-accent-lavender to-accent-cyan transition-all duration-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      entry.conditionResult.similarityPercent
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-bold tabular-nums text-accent-lavender">
                              {Math.round(
                                entry.conditionResult.similarityPercent
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      )}

                      {entry.activities && entry.activities.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Activities
                          </p>
                          <ul className="space-y-2">
                            {entry.activities.map((a) => (
                              <li
                                key={a.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/35 border border-surface-border/60"
                              >
                                {a.completed ? (
                                  <CheckCircle2 className="w-6 h-6 text-accent-green flex-shrink-0" />
                                ) : (
                                  <Circle className="w-6 h-6 text-text-muted/60 flex-shrink-0" />
                                )}
                                <span
                                  className={`text-sm flex-1 ${
                                    a.completed
                                      ? 'text-text-muted line-through'
                                      : 'text-text-primary'
                                  }`}
                                >
                                  {a.title}
                                </span>
                                <Tag
                                  size="sm"
                                  variant="default"
                                  className="flex-shrink-0"
                                >
                                  {a.type}
                                </Tag>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
