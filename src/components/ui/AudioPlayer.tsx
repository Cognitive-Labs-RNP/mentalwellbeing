import { useState, useEffect, useRef, useCallback, useId } from 'react'
import {
  Play,
  Pause,
  Music2,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react'
import { Button } from './Button'
import type { Sound } from '../../types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DurationOption = 5 | 10 | 20 | 'custom'

interface AudioPlayerProps {
  /** Pass a full Sound object from the sound library for rich metadata display */
  sound?: Sound
  /** Fallback display name when no Sound object is provided */
  trackName?: string
  onComplete?: () => void
  defaultDuration?: DurationOption
  /** Initial volume 0–100 */
  defaultVolume?: number
  /** Whether to loop the audio (overrides sound.loopable if provided) */
  loop?: boolean
  className?: string
}

const DURATION_OPTIONS: Array<{ label: string; value: DurationOption }> = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '20 min', value: 20 },
  { label: 'Custom', value: 'custom' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AudioPlayer({
  sound,
  trackName,
  onComplete,
  defaultDuration = 10,
  defaultVolume = 70,
  loop,
  className = '',
}: AudioPlayerProps) {
  const componentId = useId()

  // Derive display name: prefer sound.name, then trackName prop, then fallback
  const displayName = sound?.name ?? trackName ?? 'Sound Session'
  const audioSrc = sound?.file ?? null
  const shouldLoop = loop ?? sound?.loopable ?? true

  // Duration / timer state
  const [durationChoice, setDurationChoice] = useState<DurationOption>(defaultDuration)
  const [customMinutes, setCustomMinutes] = useState<number>(15)
  const [elapsed, setElapsed] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completed, setCompleted] = useState(false)

  // Volume state
  const [volume, setVolume] = useState(defaultVolume)
  const [muted, setMuted] = useState(false)

  // HTML Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const totalSeconds =
    durationChoice === 'custom'
      ? Math.max(1, customMinutes) * 60
      : durationChoice * 60

  const remaining = Math.max(0, totalSeconds - elapsed)
  const progress = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0

  // ---------------------------------------------------------------------------
  // Audio element management
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!audioSrc) return

    const audio = new Audio(audioSrc)
    audio.loop = shouldLoop
    audio.volume = muted ? 0 : volume / 100
    audio.preload = 'none'
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
    // Only re-create when the source changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc])

  // Sync loop flag
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = shouldLoop
  }, [shouldLoop])

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume / 100
    }
  }, [volume, muted])

  // Play / pause the real audio element
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => {
        // Audio may not be available (placeholder file); fail silently
      })
    } else {
      audio.pause()
    }
  }, [isPlaying])

  // ---------------------------------------------------------------------------
  // Timer tick
  // ---------------------------------------------------------------------------

  const handleTick = useCallback(() => {
    setElapsed((prev) => {
      if (prev + 1 >= totalSeconds) {
        setIsPlaying(false)
        setCompleted(true)
        onComplete?.()
        return totalSeconds
      }
      return prev + 1
    })
  }, [totalSeconds, onComplete])

  useEffect(() => {
    if (!isPlaying) return
    const id = window.setInterval(handleTick, 1000)
    return () => window.clearInterval(id)
  }, [isPlaying, handleTick])

  // ---------------------------------------------------------------------------
  // Controls
  // ---------------------------------------------------------------------------

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
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const markComplete = () => {
    setIsPlaying(false)
    setCompleted(true)
    setElapsed(totalSeconds)
    if (audioRef.current) {
      audioRef.current.pause()
    }
    onComplete?.()
  }

  const changeDuration = (val: DurationOption) => {
    setDurationChoice(val)
    reset()
  }

  const toggleMute = () => setMuted((m) => !m)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`bg-surface/80 backdrop-blur-xl border border-surface-border rounded-2xl p-6 shadow-glass ${className}`}
      role="region"
      aria-label={`Audio player: ${displayName}`}
    >
      {/* Track header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-accent-lavender/30 to-accent-cyan/25 border border-surface-border/60 backdrop-blur-sm flex-shrink-0">
          <Music2 className="w-7 h-7 text-accent-lavender" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-0.5">
            {sound?.category ? sound.category.charAt(0).toUpperCase() + sound.category.slice(1) : 'Audio Session'}
          </p>
          <h3 className="font-display text-xl font-semibold text-text-primary truncate">
            {displayName}
          </h3>
          {sound?.description && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
              {sound.description}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5 mb-5">
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span className="tabular-nums font-medium text-text-primary">
            {formatTime(elapsed)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-text-muted">
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums">{formatTime(remaining)}</span>
            <span className="text-xs">left</span>
          </span>
        </div>
        <div
          className="w-full h-3 bg-surface-hover/60 rounded-full overflow-hidden border border-surface-border/60"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Playback progress"
        >
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              completed
                ? 'bg-gradient-to-r from-accent-green to-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.4)]'
                : 'bg-gradient-to-r from-accent-lavender to-accent-cyan shadow-[0_0_12px_rgba(167,139,250,0.35)]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Duration selector */}
      <div
        className="flex items-center gap-2 mb-5 flex-wrap"
        role="group"
        aria-label="Select duration"
      >
        {DURATION_OPTIONS.map((d) => (
          <button
            key={d.label}
            onClick={() => changeDuration(d.value)}
            aria-pressed={durationChoice === d.value}
            className={`h-9 px-3 rounded-xl text-xs font-medium transition-all duration-200 ${
              durationChoice === d.value
                ? 'bg-gradient-to-r from-accent-lavender/30 to-accent-cyan/25 text-text-primary border border-accent-lavender/40 shadow-glow'
                : 'bg-surface-hover/40 text-text-secondary border border-surface-border/70 hover:bg-surface-hover/70 hover:text-text-primary'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Custom duration input */}
      {durationChoice === 'custom' && (
        <div className="mb-5 flex items-center gap-3 p-3 bg-surface-hover/40 rounded-xl border border-surface-border/60">
          <label
            htmlFor={`${componentId}-custom`}
            className="text-xs font-medium text-text-secondary flex-shrink-0"
          >
            Minutes:
          </label>
          <input
            id={`${componentId}-custom`}
            type="number"
            min={1}
            max={120}
            value={customMinutes}
            onChange={(e) => {
              setCustomMinutes(Number(e.target.value))
              reset()
            }}
            className="h-9 w-24 px-3 rounded-xl bg-bg-primary/60 border border-surface-border/70 text-text-primary font-semibold tabular-nums text-sm focus:outline-none focus:border-accent-lavender/60 focus:ring-2 focus:ring-accent-lavender/25"
          />
        </div>
      )}

      {/* Volume control */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={toggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
        >
          {muted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
        <input
          id={`${componentId}-volume`}
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : volume}
          onChange={(e) => {
            setVolume(Number(e.target.value))
            if (muted) setMuted(false)
          }}
          aria-label="Volume"
          className="flex-1 h-1.5 rounded-full appearance-none bg-surface-hover accent-accent-lavender cursor-pointer"
        />
        <span className="text-xs text-text-muted tabular-nums w-8 text-right">
          {muted ? 0 : volume}%
        </span>
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={togglePlay}
          aria-label={completed ? 'Restart' : isPlaying ? 'Pause' : 'Play'}
          className={`w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-200 ${
            completed
              ? 'bg-gradient-to-br from-accent-green/35 to-emerald-500/25 text-accent-green border border-accent-green/40 shadow-[0_0_24px_rgba(74,222,128,0.3)]'
              : isPlaying
              ? 'bg-gradient-to-br from-accent-lavender/40 to-accent-cyan/30 text-white border border-accent-lavender/50 shadow-[0_0_28px_rgba(167,139,250,0.4)]'
              : 'bg-gradient-to-br from-accent-lavender to-purple-500 text-white shadow-glow hover:scale-105 active:scale-95'
          }`}
        >
          {completed ? (
            <RotateCcw className="w-7 h-7" />
          ) : isPlaying ? (
            <Pause className="w-7 h-7" fill="currentColor" />
          ) : (
            <Play className="w-7 h-7 ml-1" fill="currentColor" />
          )}
        </button>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button size="sm" variant="ghost" onClick={reset}>
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          <Button size="sm" variant="primary" onClick={markComplete}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
