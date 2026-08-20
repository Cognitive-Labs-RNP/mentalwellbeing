import { useState, useMemo } from 'react'
import { Music2, Filter } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { AudioPlayer } from '../../components/ui/AudioPlayer'
import { Tag } from '../../components/ui/Tag'
import { SOUNDS, SOUND_CATEGORIES } from '../../data/sounds'
import type { SoundCategory } from '../../types'

// ---------------------------------------------------------------------------
// Category display config
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<SoundCategory, string> = {
  nature: 'Nature',
  noise: 'Noise',
  ambient: 'Ambient',
}

const CATEGORY_DESCRIPTIONS: Record<SoundCategory, string> = {
  nature: 'Rain, ocean, forest, fire and other natural soundscapes',
  noise: 'Brown noise, white noise — great for focus and masking distractions',
  ambient: 'Meditation pads and singing bowls for stillness and reflection',
}

// Gradient accents per category for visual variety
const CATEGORY_GRADIENTS: Record<SoundCategory, string> = {
  nature: 'from-accent-green/30 via-emerald-500/20 to-accent-cyan/20',
  noise: 'from-accent-lavender/30 via-purple-500/20 to-accent-cyan/25',
  ambient: 'from-accent-cyan/30 via-sky-500/20 to-accent-lavender/25',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ToolsSounds() {
  const [activeCategory, setActiveCategory] = useState<SoundCategory | 'all'>('all')
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const filteredSounds = useMemo(
    () =>
      activeCategory === 'all'
        ? SOUNDS
        : SOUNDS.filter((s) => s.category === activeCategory),
    [activeCategory]
  )

  const handleComplete = (soundId: string) => {
    setCompletedIds((prev) => new Set(prev).add(soundId))
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-accent-cyan/30 to-accent-lavender/25 border border-surface-border/60 flex-shrink-0">
                <Music2 className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <CardTitle className="text-2xl">Sound Library</CardTitle>
                <CardDescription className="text-base mt-1">
                  Browse all {SOUNDS.length} available soundscapes — nature, noise, and ambient
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Tag variant="cyan" size="md">
                {filteredSounds.length} sounds
              </Tag>
              {completedIds.size > 0 && (
                <Tag variant="lavender" size="md">
                  {completedIds.size} played
                </Tag>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 text-text-muted mr-1">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-medium">Filter:</span>
        </div>
        <button
          onClick={() => setActiveCategory('all')}
          aria-pressed={activeCategory === 'all'}
          className={`h-9 px-4 rounded-xl text-xs font-medium transition-all duration-200 border ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-accent-lavender/30 to-accent-cyan/25 text-text-primary border-accent-lavender/40 shadow-glow'
              : 'bg-surface-hover/40 text-text-secondary border-surface-border/70 hover:bg-surface-hover/70 hover:text-text-primary'
          }`}
        >
          All ({SOUNDS.length})
        </button>
        {SOUND_CATEGORIES.map((cat) => {
          const count = SOUNDS.filter((s) => s.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={`h-9 px-4 rounded-xl text-xs font-medium transition-all duration-200 border ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-accent-lavender/30 to-accent-cyan/25 text-text-primary border-accent-lavender/40 shadow-glow'
                  : 'bg-surface-hover/40 text-text-secondary border-surface-border/70 hover:bg-surface-hover/70 hover:text-text-primary'
              }`}
            >
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          )
        })}
      </div>

      {/* Category description when filtered */}
      {activeCategory !== 'all' && (
        <p className="text-sm text-text-secondary -mt-2 ml-1">
          {CATEGORY_DESCRIPTIONS[activeCategory]}
        </p>
      )}

      {/* Sound grid — grouped by category when showing all */}
      {activeCategory === 'all' ? (
        <div className="space-y-8">
          {SOUND_CATEGORIES.map((cat) => {
            const categorySounds = SOUNDS.filter((s) => s.category === cat)
            if (categorySounds.length === 0) return null
            return (
              <section key={cat} aria-labelledby={`cat-${cat}`}>
                <div className="flex items-center gap-3 mb-4">
                  <h2
                    id={`cat-${cat}`}
                    className="font-display text-lg font-semibold text-text-primary"
                  >
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <span className="text-xs text-text-muted bg-surface-hover/60 border border-surface-border/60 px-2.5 py-0.5 rounded-full">
                    {categorySounds.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categorySounds.map((sound) => {
                    const gradient = CATEGORY_GRADIENTS[sound.category]
                    return (
                      <div key={sound.id} className="relative">
                        <div
                          className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${gradient} opacity-35 blur-xl pointer-events-none`}
                        />
                        <AudioPlayer
                          sound={sound}
                          onComplete={() => handleComplete(sound.id)}
                          defaultDuration={10}
                        />
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSounds.map((sound) => {
            const gradient = CATEGORY_GRADIENTS[sound.category]
            return (
              <div key={sound.id} className="relative">
                <div
                  className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${gradient} opacity-35 blur-xl pointer-events-none`}
                />
                <AudioPlayer
                  sound={sound}
                  onComplete={() => handleComplete(sound.id)}
                  defaultDuration={10}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
