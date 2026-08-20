import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { AudioPlayer } from '@/components/ui/AudioPlayer'
import { Tag } from '@/components/ui/Tag'
import { Music2, Sparkles } from 'lucide-react'

const recommendedSoundsMap: Record<string, string[]> = {
  anxiety: ['Ocean', 'Rain', 'Brown noise'],
  stress: ['Forest', 'White noise', 'Rain'],
  depression: ['Sunrise ambient', 'Birdsong', 'Soft piano'],
  adhd: ['Brown noise', 'Pink noise', 'Lo-fi beats'],
  ocd: ['Rain', 'Fireplace', 'Ambient hum'],
  anger: ['Ocean', 'Wind', 'Forest'],
  'general-wellbeing': ['Ambient sounds', 'Rain', 'Forest'],
}

export default function ConditionSounds() {
  const { conditionId } = useParams()
  const [completedTracks, setCompletedTracks] = useState<Set<string>>(new Set())

  const conditionName = conditionId
    ? conditionId.charAt(0).toUpperCase() + conditionId.slice(1).replace(/-/g, ' ')
    : 'this condition'

  const sounds = recommendedSoundsMap[conditionId ?? ''] ?? recommendedSoundsMap['general-wellbeing']

  const handleComplete = (trackName: string) => {
    setCompletedTracks((prev) => new Set(prev).add(trackName))
  }

  const gradients = [
    'from-accent-cyan/30 via-sky-500/20 to-accent-lavender/25',
    'from-accent-lavender/30 via-purple-500/20 to-accent-cyan/25',
    'from-accent-green/25 via-emerald-500/20 to-accent-cyan/20',
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-accent-cyan/30 to-accent-lavender/25 border border-surface-border/60 flex-shrink-0">
                <Music2 className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <CardTitle className="text-2xl">Curated sounds</CardTitle>
                <CardDescription className="text-base mt-2">
                  Ambient audio recommended for {conditionName}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag variant="cyan" size="md">
                <Sparkles className="w-3.5 h-3.5" />
                Curated
              </Tag>
              <Tag variant="lavender" size="md">
                {sounds.length} soundscapes
              </Tag>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sounds.map((soundName, idx) => {
          const gradient = gradients[idx % gradients.length]
          return (
            <div key={soundName} className="relative">
              <div
                className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${gradient} opacity-40 blur-xl pointer-events-none`}
              />
              <AudioPlayer
                trackName={soundName}
                onComplete={() => handleComplete(soundName)}
                defaultDuration={10}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
