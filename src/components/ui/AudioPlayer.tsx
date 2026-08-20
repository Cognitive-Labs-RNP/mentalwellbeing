import { useState, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  Music2,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Button } from './Button'

interface AudioPlayerProps {
  trackName?: string
  onComplete?: () => void
  defaultDuration?: 5 | 10 | 20 | 'custom'
  className?: string
}

const durations: Array<{ label: string; value: 5 | 10 | 20 | 'custom' }> = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '20 min', value: 20 },
  { label: 'Custom', value: 'custom' },
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function AudioPlayer({
  trackName = 'Guided Relaxation',
  onComplete,
  defaultDuration = 10,
  className = '',
}: AudioPlayerProps) {
  const [durationChoice, setDurationChoice] = useState<5 | 10 | 20 | 'custom'>(
    defaultDuration
  )
  const [customMinutes, setCustomMinutes] = useState<number>(15)
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [completed, setCompleted] = useState(false)

  const totalSeconds =
    durationChoice === 'custom'
      ? Math.max(1, customMinutes) * 60
      : durationChoice * 60

  const remaining = Math.max(0, totalSeconds - elapsed)
  const progress = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0

  const handleTick = useCallback(() => {
    setElapsed((prev) => {
      if (prev + 1 >= totalSeconds) {
        setIsPlaying(false)
        setCompleted(true)
        return totalSeconds
      }
      return prev + 1
    })
  }, [totalSeconds])

  useEffect(() => {
    if (!isPlaying) return
    const id = window.setInterval(handleTick, 1000)
    return () => window.clearInterval(id)
  }, [isPlaying, handleTick])

  useEffect(() => {
    if (elapsed >= totalSeconds && !completed && totalSeconds > 0) {
      setCompleted(true)
      onComplete?.()
    }
  }, [elapsed, totalSeconds, completed, onComplete])

  const togglePlay = () => {
    if (completed) {
      setElapsed(0)
      setCompleted(false)
    }
    setIsPlaying((p) => !p)
  }

  const reset = () => {
    setIsPlaying(false)
    setElapsed(0)
    setCompleted(false)
  }

  return (
    <div
      className={`bg-surface/80 backdrop-blur-xl border border-surface-border rounded-2xl p-6 shadow-glass ${className}`}
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-accent-lavender/30 to-accent-cyan/25 border border-surface-border/60 backdrop-blur-sm flex-shrink-0">
          <Music2 className="w-7 h-7 text-accent-lavender" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">
            Audio Session
          </p>
          <h3 className="font-display text-xl font-semibold text-text-primary truncate">
            {trackName}
          </h3>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-1.5">
          <span className="tabular-nums font-medium text-text-primary">
            {formatTime(elapsed)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-text-muted">
            <Clock className="w-4 h-4" />
            <span className="tabular-nums">{formatTime(totalSeconds)}</span>
          </span>
        </div>
        <div
          className="w-full h-3 bg-surface-hover/60 rounded-full overflow-hidden border border-surface-border/60 backdrop-blur-sm"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Session progress"
        >
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              completed
                ? 'bg-gradient-to-r from-accent-green to-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.4)]'
                : 'bg-gradient-to-r from-accent-lavender to-accent-cyan shadow-[0_0_16px_rgba(167,139,250,0.35)]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {durations.map((d) => (
          <button
            key={d.label}
            onClick={() => {
              setDurationChoice(d.value)
              reset()
            }}
            aria-pressed={durationChoice === d.value}
            className={`h-11 px-4 rounded-xl text-sm font-medium transition-all duration-200 min-w-[88px] ${
              durationChoice === d.value
                ? 'bg-gradient-to-r from-accent-lavender/30 to-accent-cyan/25 text-text-primary border border-accent-lavender/40 shadow-glow'
                : 'bg-surface-hover/40 text-text-secondary border border-surface-border/70 hover:bg-surface-hover/70 hover:text-text-primary'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {durationChoice === 'custom' && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-surface-hover/40 rounded-xl border border-surface-border/60 backdrop-blur-sm">
          <label
            htmlFor="custom-duration"
            className="text-sm font-medium text-text-secondary flex-shrink-0"
          >
            Minutes:
          </label>
          <input
            id="custom-duration"
            type="number"
            min={1}
            max={120}
            value={customMinutes}
            onChange={(e) => {
              setCustomMinutes(Number(e.target.value))
              reset()
            }}
            className="h-11 w-28 px-3 rounded-xl bg-bg-primary/60 border border-surface-border/70 text-text-primary font-semibold tabular-nums focus:outline-none focus:border-accent-lavender/60 focus:ring-2 focus:ring-accent-lavender/25"
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={totalSeconds === 0}
          className={`w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-200 disabled:opacity-50 ${
            completed
              ? 'bg-gradient-to-br from-accent-green/35 to-emerald-500/25 text-accent-green border border-accent-green/40 shadow-[0_0_24px_rgba(74,222,128,0.3)]'
              : isPlaying
              ? 'bg-gradient-to-br from-accent-lavender/40 to-accent-cyan/30 text-white border border-accent-lavender/50 shadow-[0_0_28px_rgba(167,139,250,0.4)]'
              : 'bg-gradient-to-br from-accent-lavender to-purple-500 text-white shadow-glow hover:scale-105 active:scale-95'
          }`}
        >
          {completed ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : isPlaying ? (
            <Pause className="w-8 h-8" fill="currentColor" />
          ) : (
            <Play className="w-8 h-8 ml-1" fill="currentColor" />
          )}
        </button>

        <div className="flex-1 min-w-[180px] flex items-center justify-end gap-3">
          <Button size="sm" variant="ghost" onClick={reset}>
            Reset
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setCompleted(true)
              setIsPlaying(false)
              setElapsed(totalSeconds)
              onComplete?.()
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete
          </Button>
        </div>
      </div>
    </div>
  )
}
