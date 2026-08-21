import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { ActivityCard } from '@/components/ui/ActivityCard'
import { Button } from '@/components/ui/Button'
import { FeedbackForm } from '@/components/ui/FeedbackForm'

const mockImmediateActions = [
  {
    id: 'anx-breath-01',
    title: '4-7-8 Breathing Exercise',
    durationMinutes: 5,
    type: 'breathing' as const,
    instructions: [
      'Sit comfortably with your back straight',
      'Exhale completely through your mouth, making a whoosh sound',
      'Close your mouth and inhale quietly through your nose to a mental count of 4',
      'Hold your breath for a count of 7',
      'Exhale completely through your mouth, making a whoosh sound to a count of 8',
      'Repeat this cycle 4 times',
    ],
  },
  {
    id: 'anx-ground-01',
    title: '5-4-3-2-1 Grounding Technique',
    durationMinutes: 5,
    type: 'other' as const,
    instructions: [
      'Take a slow, deep breath',
      'Name 5 things you can see around you',
      'Name 4 things you can physically feel (your feet on floor, clothes on skin)',
      'Name 3 things you can hear right now',
      'Name 2 things you can smell',
      'Name 1 thing you can taste',
      'Take another deep breath and notice how you feel',
    ],
  },
  {
    id: 'anx-relax-01',
    title: 'Progressive Muscle Relaxation',
    durationMinutes: 10,
    type: 'other' as const,
    instructions: [
      'Find a comfortable position, lying down or sitting',
      'Take 3 slow, deep breaths to begin',
      'Starting with your toes: tense the muscles tightly for 5 seconds, then release for 10 seconds',
      'Move up to your feet, calves, thighs, abdomen, chest, hands, arms, shoulders, neck, and face',
      'For each group, tense for 5, release for 10',
      'After completing all groups, take 2 minutes to notice the feeling of relaxation throughout your body',
    ],
  },
  {
    id: 'anx-thought-01',
    title: 'Worry Thought Reframing',
    durationMinutes: 7,
    type: 'other' as const,
    instructions: [
      'Write down the specific worry thought that is on your mind',
      'Ask yourself: What is the evidence this thought is true?',
      'Ask yourself: What is the evidence this thought is NOT true?',
      'What is the worst that could happen? Could I handle that?',
      'What is a more balanced way to look at this situation?',
      'Write down one small action you can take right now if appropriate',
    ],
  },
]

import { useAppStore } from '@/store'
import { markConditionActivityComplete } from '@/services/conditionService'
import { saveJournalFeedback } from '@/services/journalService'
import type { FeedbackPayload } from '@/components/ui/FeedbackForm'

const safetyGuidance =
  'This condition is a common and treatable experience. If these feelings feel overwhelming, persistent, or are interfering with daily life, consider reaching out to a mental health professional or your primary care provider. If you ever feel like you cannot keep yourself safe, please contact your local crisis line or emergency services immediately. You are not alone in this.'

export default function ConditionImmediateSupport() {
  const { conditionId } = useParams()
  const session = useAppStore((s) => s.session)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [startedIds, setStartedIds] = useState<Set<string>>(new Set())
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const allCompleted = mockImmediateActions.every((a) => completedIds.has(a.id))

  const handleStart = (id: string) => {
    setStartedIds((prev) => new Set(prev).add(id))
  }

  const handleComplete = (id: string) => {
    setCompletedIds((prev) => new Set(prev).add(id))
    const activity = mockImmediateActions.find((a) => a.id === id)
    if (activity) {
      markConditionActivityComplete(
        session?.userId,
        conditionId ?? 'anxiety',
        activity.id,
        activity.title,
        activity.durationMinutes
      )
    }
  }

  const handleFeedbackSubmit = (data?: FeedbackPayload) => {
    setFeedbackSubmitted(true)
    if (session?.userId && data) {
      saveJournalFeedback(session.userId, {
        beforeIntensity: Math.round((data.moodBefore + (10 - data.stressBefore)) / 2),
        afterIntensity: Math.round((data.moodAfter + (10 - data.stressAfter)) / 2),
        currentFeeling: data.moodAfter >= 8 ? '😄' : data.moodAfter >= 6 ? '🙂' : data.moodAfter >= 4 ? '😐' : '😕',
        comment: data.note,
        relatedCondition: conditionId ?? 'anxiety',
        relatedActivity: 'Immediate Support Session',
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-2xl">Immediate Support</CardTitle>
              <CardDescription className="text-base mt-2">
                Right now, try these 4 steps
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-lavender/15 border border-accent-lavender/25">
              <CheckCircle2 className="w-4.5 h-4.5 text-accent-lavender" />
              <span className="text-sm font-medium text-accent-lavender">
                {completedIds.size}/{mockImmediateActions.length} completed
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {mockImmediateActions.map((activity, idx) => (
          <div key={activity.id} className="relative">
            <div className="absolute -left-2 top-6 w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-accent-lavender to-purple-500 text-white text-sm font-bold shadow-glow z-10 border-2 border-bg-primary">
              {idx + 1}
            </div>
            <div className="pl-6">
              <ActivityCard
                activity={activity}
                onStart={handleStart}
                onComplete={handleComplete}
                completed={completedIds.has(activity.id)}
                started={startedIds.has(activity.id)}
              />
            </div>
          </div>
        ))}
      </div>

      {allCompleted && !feedbackSubmitted && (
        <Card className="overflow-hidden border-accent-lavender/30 bg-gradient-to-br from-accent-lavender/10 via-surface/80 to-accent-cyan/10">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-accent-green/30 to-emerald-500/20 border border-accent-green/30">
                  <CheckCircle2 className="w-6 h-6 text-accent-green" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-text-primary">
                    Done? Record how these steps made you feel.
                  </h3>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                    Great job completing all 4 steps. Taking a moment to reflect helps us
                    personalize your experience over time.
                  </p>
                </div>
              </div>
              <Button
                size="md"
                variant="primary"
                onClick={() => setShowFeedback(true)}
                className="min-w-[180px] sm:ml-4"
              >
                Continue to Feedback
                <ArrowRight className="w-4.5 h-4.5" />
              </Button>
            </div>
          </CardContent>

          {showFeedback && (
            <div className="border-t border-surface-border/60 p-6 bg-bg-primary/30">
              <FeedbackForm
                onSubmit={handleFeedbackSubmit}
                onCancel={() => setShowFeedback(false)}
              />
            </div>
          )}
        </Card>
      )}

      {feedbackSubmitted && (
        <Card className="border-accent-green/30 bg-accent-green/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-accent-green/30 to-emerald-500/20 border border-accent-green/30">
                <CheckCircle2 className="w-6 h-6 text-accent-green" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  Thank you for sharing
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Your feedback has been saved. Remember to check in with yourself again soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-accent-amber/30 bg-gradient-to-br from-accent-amber/8 to-surface/80">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-accent-amber/15 border border-accent-amber/30">
              <AlertTriangle className="w-6 h-6 text-accent-amber" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-semibold text-text-primary mb-2">
                {conditionId ? `${conditionId.charAt(0).toUpperCase() + conditionId.slice(1)} safety guidance` : 'Safety guidance'}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {safetyGuidance}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
