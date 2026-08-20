import type {
  ConditionId,
  SimilarityLevel,
  PatternMatch,
  StructuredSummary,
  ActivityFeedbackScores,
  ProgressSignal,
  MoodScore,
} from '../types';

const SUPPORTED_CONDITIONS: ConditionId[] = [
  'anxiety',
  'depression',
  'adhd',
  'ocd',
  'stress',
  'anger',
  'general-wellbeing',
];

const getSimilarityLevel = (percent: number): SimilarityLevel => {
  if (percent >= 80) return 'high';
  if (percent >= 65) return 'medium';
  return 'low';
};

const avgMoodScore = (scores: ActivityFeedbackScores): number => {
  return (scores.helpfulness + scores.easeOfUse + scores.wouldRepeat) / 3;
};

export const MockAIEngine = {
  analyze(summary: StructuredSummary): PatternMatch {
    const conditionId =
      SUPPORTED_CONDITIONS[Math.floor(Math.random() * SUPPORTED_CONDITIONS.length)];
    const similarityPercent = 50 + Math.floor(Math.random() * 46);
    return {
      conditionId,
      similarityPercent,
      similarityLevel: getSimilarityLevel(similarityPercent),
      timestamp: new Date().toISOString(),
    };
  },

  analyzeFeedback(
    before: { mood: MoodScore; stress: MoodScore; energy: MoodScore },
    after: { mood: MoodScore; stress: MoodScore; energy: MoodScore },
    scores: ActivityFeedbackScores
  ): ProgressSignal {
    const beforeAvg = (before.mood + (11 - before.stress) + before.energy) / 3;
    const afterAvg = (after.mood + (11 - after.stress) + after.energy) / 3;
    const feedbackAvg = avgMoodScore(scores);
    const combinedBefore = (beforeAvg + feedbackAvg) / 2;
    const delta = afterAvg - combinedBefore;
    if (delta >= 1) return 'improving';
    if (delta <= -1) return 'declining';
    return 'stable';
  },
};
