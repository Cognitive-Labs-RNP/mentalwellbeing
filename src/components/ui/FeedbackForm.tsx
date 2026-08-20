import { useState } from 'react'
import { Send, MessageSquarePlus } from 'lucide-react'
import { MoodSlider } from './MoodSlider'
import { Button } from './Button'

export interface FeedbackPayload {
  moodBefore: number
  stressBefore: number
  energyBefore: number
  moodAfter: number
  stressAfter: number
  energyAfter: number
  note?: string
}

interface FeedbackFormProps {
  onSubmit: (data: FeedbackPayload) => void
  onCancel?: () => void
  className?: string
}

const emojis = ['😞', '😔', '😐', '🙂', '😊']

type EmojiKey = 'mood' | 'stress' | 'energy'
type Timing = 'before' | 'after'

export function FeedbackForm({
  onSubmit,
  onCancel,
  className = '',
}: FeedbackFormProps) {
  const [moodBefore, setMoodBefore] = useState(5)
  const [stressBefore, setStressBefore] = useState(5)
  const [energyBefore, setEnergyBefore] = useState(5)
  const [moodAfter, setMoodAfter] = useState(5)
  const [stressAfter, setStressAfter] = useState(5)
  const [energyAfter, setEnergyAfter] = useState(5)
  const [note, setNote] = useState('')
  const [quickEmoji, setQuickEmoji] = useState<number | null>(null)

  const handleSubmit = () => {
    onSubmit({
      moodBefore,
      stressBefore,
      energyBefore,
      moodAfter,
      stressAfter,
      energyAfter,
      note: note.trim() || undefined,
    })
  }

  const applyQuickEmoji = (idx: number) => {
    setQuickEmoji(idx)
    const mapped = Math.round(1 + (idx / (emojis.length - 1)) * 9)
    setMoodAfter(mapped)
    const energyMapped = Math.round(1 + (idx / (emojis.length - 1)) * 9)
    setEnergyAfter(energyMapped)
    const stressMapped = 10 - Math.round((idx / (emojis.length - 1)) * 9)
    setStressAfter(stressMapped)
  }

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <h4 className="font-display text-base font-semibold text-text-primary mb-1">
      {children}
    </h4>
  )

  const SliderGroup = ({
    timing,
  }: {
    timing: Timing
  }) => {
    const moodVal = timing === 'before' ? moodBefore : moodAfter
    const stressVal = timing === 'before' ? stressBefore : stressAfter
    const energyVal = timing === 'before' ? energyBefore : energyAfter
    const setMood = timing === 'before' ? setMoodBefore : setMoodAfter
    const setStress = timing === 'before' ? setStressBefore : setStressAfter
    const setEnergy = timing === 'before' ? setEnergyBefore : setEnergyAfter

    return (
      <div
        className={`p-5 rounded-2xl border backdrop-blur-sm ${
          timing === 'before'
            ? 'bg-surface-hover/35 border-surface-border/70'
            : 'bg-gradient-to-br from-accent-lavender/10 to-accent-cyan/10 border-accent-lavender/25'
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
              timing === 'before'
                ? 'bg-surface text-text-secondary border border-surface-border'
                : 'bg-gradient-to-br from-accent-lavender to-purple-500 text-white'
            }`}
          >
            {timing === 'before' ? '1' : '2'}
          </div>
          <SectionHeading>
            {timing === 'before' ? 'Before the activity' : 'After the activity'}
          </SectionHeading>
        </div>
        <div className="space-y-6">
          <MoodSlider
            label="Mood"
            value={moodVal}
            onChange={setMood}
          />
          <MoodSlider
            label="Stress (lower is better)"
            value={stressVal}
            onChange={setStress}
          />
          <MoodSlider
            label="Energy level"
            value={energyVal}
            onChange={setEnergy}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-5 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-accent-lavender/30 to-accent-cyan/20 border border-surface-border/60">
          <MessageSquarePlus className="w-6 h-6 text-accent-lavender" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-text-primary">
            Share your experience
          </h3>
          <p className="text-sm text-text-secondary">
            Your feedback helps us tailor activities for you.
          </p>
        </div>
      </div>

      <div>
        <SectionHeading>How are you feeling right now?</SectionHeading>
        <p className="text-sm text-text-secondary mb-3">
          Tap an emoji to set your "after" scores quickly.
        </p>
        <div
          className="grid grid-cols-5 gap-2 p-3 bg-surface-hover/35 rounded-2xl border border-surface-border/60 backdrop-blur-sm"
          role="radiogroup"
          aria-label="Quick feeling"
        >
          {emojis.map((e, idx) => (
            <button
              key={idx}
              role="radio"
              aria-checked={quickEmoji === idx}
              onClick={() => applyQuickEmoji(idx)}
              className={`h-14 flex flex-col items-center justify-center rounded-xl transition-all duration-200 ${
                quickEmoji === idx
                  ? 'bg-gradient-to-br from-accent-lavender/35 to-accent-cyan/25 border border-accent-lavender/50 scale-[1.04]'
                  : 'bg-surface/50 border border-transparent hover:bg-surface-hover/60 hover:border-surface-border'
              }`}
            >
              <span className="text-2xl leading-none">{e}</span>
            </button>
          ))}
        </div>
      </div>

      <SliderGroup timing="before" />
      <SliderGroup timing="after" />

      <div>
        <label
          htmlFor="feedback-note"
          className="block text-sm font-medium text-text-secondary mb-2"
        >
          Notes (optional)
        </label>
        <textarea
          id="feedback-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Anything you'd like to remember about this session? Thoughts, feelings, what worked..."
          className="w-full min-h-[110px] px-4 py-3 rounded-xl bg-bg-primary/50 border border-surface-border/70 text-text-primary placeholder:text-text-muted/80 text-sm leading-relaxed focus:outline-none focus:border-accent-lavender/60 focus:ring-2 focus:ring-accent-lavender/25 transition-colors resize-y"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 flex-wrap">
        {onCancel && (
          <Button variant="ghost" size="md" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          className="min-w-[140px]"
        >
          <Send className="w-4.5 h-4.5" />
          Submit feedback
        </Button>
      </div>
    </div>
  )
}
