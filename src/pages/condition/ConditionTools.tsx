import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { ActivityCard } from '@/components/ui/ActivityCard'
import { Tag } from '@/components/ui/Tag'
import { Wind, Leaf, Heart, Brain, Activity } from 'lucide-react'

const mockTools = [
  {
    id: 'tool-anx-breath',
    title: 'Breathing exercise',
    description: 'Visual and audio guide for paced breathing patterns including box breathing and 4-7-8 technique.',
    durationMinutes: 5,
    type: 'breathing' as const,
  },
  {
    id: 'tool-anx-ground',
    title: 'Grounding exercise',
    description: 'Interactive prompts and sensory exercises to anchor you in the present moment when feeling overwhelmed.',
    durationMinutes: 7,
    type: 'other' as const,
  },
  {
    id: 'tool-anx-body',
    title: 'Relaxation exercise',
    description: 'Step-by-step guided body scan to release physical tension commonly associated with stress.',
    durationMinutes: 10,
    type: 'meditation' as const,
  },
  {
    id: 'tool-anx-worry',
    title: 'Thought exercises',
    description: 'Structured template to capture worries, challenge negative thinking patterns, and track responses over time.',
    durationMinutes: 8,
    type: 'journaling' as const,
  },
  {
    id: 'tool-anx-audio',
    title: 'Calming audio',
    description: 'Collection of short, evidence-based guided audio sessions for rapid anxiety reduction in various situations.',
    durationMinutes: 12,
    type: 'other' as const,
  },
]

const toolIconMap: Record<string, typeof Wind> = {
  breathing: Wind,
  meditation: Leaf,
  journaling: Heart,
  stretching: Activity,
  walk: Activity,
  other: Brain,
}

export default function ConditionTools() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [startedIds, setStartedIds] = useState<Set<string>>(new Set())

  const handleStart = (id: string) => {
    setStartedIds((prev) => new Set(prev).add(id))
  }

  const handleComplete = (id: string) => {
    setCompletedIds((prev) => new Set(prev).add(id))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Condition-specific tools</CardTitle>
              <CardDescription className="text-base mt-2">
                Evidence-based therapeutic techniques crafted for this experience
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tag variant="lavender" size="md">
                {mockTools.length} tools available
              </Tag>
              <Tag variant="cyan" size="md">
                {completedIds.size} completed
              </Tag>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mockTools.map((tool, idx) => {
          const Icon = toolIconMap[tool.type] ?? Brain
          return (
            <div key={tool.id} className="relative">
              <ActivityCard
                activity={{
                  id: tool.id,
                  title: tool.title,
                  type: tool.type,
                  durationMinutes: tool.durationMinutes,
                }}
                onStart={handleStart}
                onComplete={handleComplete}
                completed={completedIds.has(tool.id)}
                started={startedIds.has(tool.id)}
              />
              <div className="mt-3 pl-20 pr-5 -mt-2">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
