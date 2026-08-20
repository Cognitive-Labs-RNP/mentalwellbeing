import { ShieldCheck, Send, X, TrendingUp, Tag } from 'lucide-react'
import { Button } from './Button'
import { Tag as TagChip } from './Tag'

export interface StructuredSummary {
  mood?: number
  stress?: number
  energy?: number
  contextTags?: string[]
  sanitisedDescription: string
}

interface PrivacyReviewPanelProps {
  structuredSummary: StructuredSummary
  onConfirm: () => void
  onCancel: () => void
  className?: string
}

function ScoreRow({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'lavender' | 'rose' | 'amber' | 'cyan' | 'green'
}) {
  const toneMap: Record<string, string> = {
    lavender: 'from-accent-lavender/30 to-purple-500/20 text-accent-lavender',
    rose: 'from-accent-rose/30 to-pink-500/20 text-accent-rose',
    amber: 'from-accent-amber/30 to-orange-500/20 text-accent-amber',
    cyan: 'from-accent-cyan/30 to-sky-500/20 text-accent-cyan',
    green: 'from-accent-green/30 to-emerald-500/20 text-accent-green',
  }
  const clamped = Math.min(10, Math.max(1, value))
  return (
    <div className="flex items-center justify-between p-3.5 bg-surface-hover/40 rounded-xl border border-surface-border/60 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${toneMap[tone]}`}
        >
          <TrendingUp className="w-4.5 h-4.5" />
        </div>
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-24 h-2 bg-surface/80 rounded-full overflow-hidden border border-surface-border/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-lavender to-accent-cyan transition-all duration-500"
            style={{ width: `${(clamped / 10) * 100}%` }}
          />
        </div>
        <span
          className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold tabular-nums text-lg bg-gradient-to-br ${toneMap[tone]} border border-surface-border/60`}
        >
          {clamped}
        </span>
      </div>
    </div>
  )
}

export function PrivacyReviewPanel({
  structuredSummary,
  onConfirm,
  onCancel,
  className = '',
}: PrivacyReviewPanelProps) {
  const tags = structuredSummary.contextTags?.filter(Boolean) ?? []

  return (
    <div
      className={`bg-surface/80 backdrop-blur-xl border border-surface-border rounded-2xl shadow-glass overflow-hidden ${className}`}
    >
      <div className="px-6 py-5 bg-gradient-to-r from-accent-lavender/15 to-accent-cyan/10 border-b border-surface-border/70">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-accent-lavender/35 to-purple-500/25 border border-accent-lavender/30 flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-accent-lavender" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-semibold text-text-primary mb-1">
              What will be sent
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Only the data below will be shared. Nothing identifying or
              personal is included.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {(structuredSummary.mood ||
          structuredSummary.stress ||
          structuredSummary.energy) && (
          <div className="space-y-3">
            {structuredSummary.mood !== undefined && (
              <ScoreRow
                label="Mood"
                value={structuredSummary.mood}
                tone="lavender"
              />
            )}
            {structuredSummary.stress !== undefined && (
              <ScoreRow
                label="Stress"
                value={structuredSummary.stress}
                tone="rose"
              />
            )}
            {structuredSummary.energy !== undefined && (
              <ScoreRow
                label="Energy"
                value={structuredSummary.energy}
                tone="cyan"
              />
            )}
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4.5 h-4.5 text-text-muted" />
              <span className="text-sm font-semibold text-text-secondary">
                Context tags
              </span>
            </div>
            <div className="flex flex-wrap gap-2 p-4 bg-surface-hover/35 rounded-xl border border-surface-border/60 backdrop-blur-sm">
              {tags.map((t) => (
                <TagChip key={t} size="md" variant="lavender">
                  {t}
                </TagChip>
              ))}
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="sanitised-desc"
            className="block text-sm font-semibold text-text-secondary mb-2"
          >
            Sanitised description
          </label>
          <textarea
            id="sanitised-desc"
            readOnly
            value={structuredSummary.sanitisedDescription}
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-bg-primary/60 border border-surface-border/70 text-text-primary/90 text-sm leading-relaxed resize-none cursor-default select-all focus:outline-none focus:border-accent-lavender/40"
          />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-surface-border/70 bg-surface-hover/30 backdrop-blur-sm flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" size="md" onClick={onCancel}>
          <X className="w-4.5 h-4.5" />
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onConfirm}
          className="min-w-[160px]"
        >
          <Send className="w-4.5 h-4.5" />
          Confirm & send
        </Button>
      </div>
    </div>
  )
}
