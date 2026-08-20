import { useId } from 'react'

interface MoodSliderProps {
  value: number
  onChange: (value: number) => void
  label?: string
  min?: number
  max?: number
}

const emojis = ['😞', '😔', '😕', '😐', '🙂', '😊', '😌', '😄', '🤗', '🌟']

export function MoodSlider({
  value,
  onChange,
  label = 'How do you feel?',
  min = 1,
  max = 10,
}: MoodSliderProps) {
  const inputId = useId()
  const clamped = Math.min(max, Math.max(min, value))
  const emojiIdx = Math.min(emojis.length - 1, Math.max(0, clamped - min))
  const percentage = ((clamped - min) / (max - min)) * 100

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-3">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
        <div className="flex items-center gap-2.5">
          <span
            className="text-3xl select-none transition-transform duration-200"
            aria-hidden="true"
            style={{ transform: `scale(${1 + (clamped - 1) * 0.02})` }}
          >
            {emojis[emojiIdx]}
          </span>
          <span
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-accent-lavender/25 to-accent-cyan/25 border border-surface-border text-lg font-bold tabular-nums text-text-primary backdrop-blur-sm"
            aria-live="polite"
          >
            {clamped}
          </span>
        </div>
      </div>

      <div className="relative h-14 flex items-center">
        <div className="absolute inset-x-0 h-4 top-1/2 -translate-y-1/2 rounded-full bg-surface-hover/70 border border-surface-border/60 overflow-hidden backdrop-blur-sm">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-rose via-accent-lavender to-accent-green transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
            aria-hidden="true"
          />
        </div>
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={1}
          value={clamped}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clamped}
          aria-label={label}
          className="relative w-full h-14 appearance-none bg-transparent cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:h-9 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(167,139,250,0.25),0_4px_12px_rgba(0,0,0,0.25)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent-lavender/70 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95 [&::-moz-range-thumb]:w-9 [&::-moz-range-thumb]:h-9 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent-lavender/70 [&::-moz-range-thumb]:shadow-[0_0_0_4px_rgba(167,139,250,0.25),0_4px_12px_rgba(0,0,0,0.25)]"
        />
      </div>

      <div className="flex justify-between mt-2 text-xs text-text-muted select-none" aria-hidden="true">
        <span>{min}</span>
        <span>{Math.floor((min + max) / 2)}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
