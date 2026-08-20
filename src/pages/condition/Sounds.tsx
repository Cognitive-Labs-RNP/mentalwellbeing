import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Music2, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { AudioPlayer } from '@/components/ui/AudioPlayer'
import { Tag } from '@/components/ui/Tag'
import { getSoundsForCondition } from '@/data/sounds'
import type { ConditionId } from '@/types'

// Category gradient accents for visual variety
const GRADIENTS = [
  'from-accent-cyan/30 via-sky-500/20 to-accent-lavender/25',
  'from-accent-lavender/30 via-purple-500/20 to-accent-cyan/25',
  'from-accent-green/25 via-emerald-500/20 to-accent-cyan/20',
  'from-accent-amber/25 via-orange-400/15 to-accent-cyan/20',
]

export default function ConditionSounds() {
  const { conditionId } = useParams<{ conditionId: string }>()
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const conditionName = conditionId
    ? conditionId.charAt(0).toUpperCase() + conditionId.slice(1).replace(/-/g, ' ')
    : 'this condition'

  // Load only sounds whose recommendedFor includes this conditionId
  const sounds = useMemo(
    () => getSoundsForCondition(conditionId ?? ''),
    [conditionId]
  )

  const handleComplete = (soundId: string) => {
    setCompletedIds((prev) => new Set(prev).add(soundId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-accent-cyan/30 to-accent-lavender/25 border border-surface-border/60 flex-shrink-0">
                <Music2 className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <CardTitle className="text-2xl">Curated Sounds</CardTitle>
                <CardDescription className="text-base mt-1">
                  Soundscapes specifically recommended for {conditionName}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Tag variant="cyan" size="md">
                <Sparkles className="w-3.5 h-3.5" />
                Curated
              </Tag>
              <Tag variant="lavender" size="md">
                {sounds.length} soundscape{sounds.length !== 1 ? 's' : ''}
              </Tag>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sound grid */}
      {sounds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sounds.map((sound, idx) => {
            const gradient = GRADIENTS[idx % GRADIENTS.length]
            return (
              <div key={sound.id} className="relative">
                <div
                  className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${gradient} opacity-40 blur-xl pointer-events-none`}
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
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-surface-hover/60 border border-surface-border/60 mb-4">
            <Music2 className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-secondary text-sm mb-1">
            No curated sounds found for <strong className="text-text-primary">{conditionName}</strong>.
          </p>
          <p className="text-text-muted text-xs">
            Browse the full sound library to find something that works for you.
          </p>
        </div>
      )}

      {/* Link to full library */}
      <div className="flex justify-center pt-2">
        <Link
          to="/tools/sounds"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent-lavender hover:text-accent-cyan transition-colors"
        >
          Browse the full sound library
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
