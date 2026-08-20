import { useState, useEffect, useCallback, useId } from 'react'
import { Play, Pause, RotateCcw, CheckCircle2, Clock, Timer } from 'lucide-react'
import { Button } from './Button'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TimerMode =
  | 'countdown'   // counts down from a chosen duration
  | 'stopwatch'   // counts up from zero

export interface ActivityTimerProps {
  /** Human-readable label shown above the timer */
  label?: string
  /** Default duration in minutes (used for countdown mode) */
  defaultDurationMinutes?: number
  /** Available duration options in minutes */
  durationOptions?: number[]
  mode?: TimerMode
  /** Called when the timer completes (countdown reaches zero) */
  onComplete?: (elapsedSeconds: number) => void
  /** Called on every tick with current elapsed seconds */
  onTick?: (elapsedSeconds: number) => void
  className?: string
  /** Hide the duration selector (useful when duration is fixed by the caller) */
  hideDurationSelector?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function buildDurationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityTimer({
  label = 'Activity Timer',
  defaultDurationMinutes = 5,
  durationOptions = [5, 10, 15, 20],
  mode = 'countdown',
  onComplete,
  onTick,
  className = '',
  hideDurationSelector = false,
}: ActivityTimerProps) {
  const id = useId()

  const [selectedMinutes, setSelectedMinutes] = useState(defaultDurationMinutes)
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const totalSeconds = selectedMinutes * 60
  const displaySeconds = mode === 'countdown'
    ? Math.max(0, totalSeconds - elapsed)
    : elapsed
  const progress = totalSeconds > 0 ? Math.min((elapsed / totalSeconds) * 100, 100) : 0

  // Circumference for the SVG ring
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const handleComplete = useCallback((elapsedSecs: number) => {
    setIsRunning(false)
    setIsComplete(true)
    onComplete?.(elapsedSecs)
  }, [onComplete])

  const tick = useCallback(() => {
    setElapsed((prev) => {
      const next = prev + 1
      onTick?.(next)
      if (mode === 'countdown' && next >= totalSeconds) {
        handleComplete(next)
        return totalSeconds
      }
      return next
    })
  }, [mode, totalSeconds, onTick, handleComplete])

  useEffect(() => {
    if (!isRunning || isComplete) return
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [isRunning, isComplete, tick])

  const toggle = () => {
    if (isComplete) {
      // restart
      setElapsed(0)
      setIsComplete(false)
      setIsRunning(true)
      return
    }
    setIsRunning((r) => !r)
  }

  const reset = () => {
    setIsRunning(false)
    setElapsed(0)
    setIsComplete(false)
  }

  const selectDuration = (minutes: number) => {
    reset()
    setSelectedMinutes(minutes)
  }

  const markComplete = () => {
    handleComplete(elapsed)
    setElapsed(totalSeconds)
  }

  return (
    <div
      className={`bg-surface/80 backdrop-blur-xl border border-surface-border rounded-2xl p-6 shadow-glass ${className}`}
      role="timer"
      aria-label={label}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-accent-lavender/30 to-accent-cyan/25 border border-surface-border/60">
          <Timer className="w-5 h-5 text-accent-lavender" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {mode === 'countdown' ? 'Countdown' : 'Stopwatch'}
          </p>
          <h3 className="font-display text-base font-semibold text-text-primary leading-tight">
            {label}
          </h3>
        </div>
      </div>

      {/* Ring + time display */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-36 h-36">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="6"
              className="stroke-surface-hover/60"
            />
            {/* Progress */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ease-linear ${
                isComplete
                  ? 'stroke-accent-green'
                  : 'stroke-accent-lavender'
              }`}
              style={{
                filter: isComplete
                  ? 'drop-shadow(0 0 6px rgba(74,222,128,0.5))'
                  : 'drop-shadow(0 0 6px rgba(167,139,250,0.45))',
              }}
            />
          </svg>
          {/* Centre readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isComplete ? (
              <CheckCircle2 className="w-8 h-8 text-accent-green" />
            ) : (
              <>
                <span
                  className="font-display text-2xl font-bold text-text-primary tabular-nums"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {formatTime(displaySeconds)}
                </span>
                {mode === 'countdown' && (
                  <span className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {buildDurationLabel(selectedMinutes)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Duration selector */}
      {!hideDurationSelector && mode === 'countdown' && (
        <div
          className="flex flex-wrap gap-2 justify-center mb-5"
          role="group"
          aria-labelledby={`${id}-dur-label`}
        >
          <span id={`${id}-dur-label`} className="sr-only">
            Select duration
          </span>
          {durationOptions.map((min) => (
            <button
              key={min}
              onClick={() => selectDuration(min)}
              aria-pressed={selectedMinutes === min}
              className={`h-9 px-4 rounded-xl text-xs font-medium transition-all duration-200 ${
                selectedMinutes === min
                  ? 'bg-gradient-to-r from-accent-lavender/30 to-accent-cyan/25 text-text-primary border border-accent-lavender/40 shadow-glow'
                  : 'bg-surface-hover/40 text-text-secondary border border-surface-border/70 hover:bg-surface-hover/70 hover:text-text-primary'
              }`}
            >
              {buildDurationLabel(min)}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        {/* Play / Pause / Restart */}
        <button
          onClick={toggle}
          aria-label={isComplete ? 'Restart timer' : isRunning ? 'Pause timer' : 'Start timer'}
          className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-200 ${
            isComplete
              ? 'bg-gradient-to-br from-accent-green/35 to-emerald-500/25 text-accent-green border border-accent-green/40 shadow-[0_0_20px_rgba(74,222,128,0.25)]'
              : isRunning
              ? 'bg-gradient-to-br from-accent-lavender/40 to-accent-cyan/30 text-white border border-accent-lavender/50 shadow-[0_0_24px_rgba(167,139,250,0.35)]'
              : 'bg-gradient-to-br from-accent-lavender to-purple-500 text-white shadow-glow hover:scale-105 active:scale-95'
          }`}
        >
          {isComplete ? (
            <RotateCcw className="w-6 h-6" />
          ) : isRunning ? (
            <Pause className="w-6 h-6" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={reset} aria-label="Reset timer">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          {!isComplete && (
            <Button size="sm" variant="primary" onClick={markComplete}>
              <CheckCircle2 className="w-4 h-4" />
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
