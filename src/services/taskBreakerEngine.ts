import { supabase } from '@/lib/supabase';

export interface TaskStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskBreakerItem {
  id: string;
  taskTitle: string;
  conditionId: string;
  createdAt: string;
  steps: TaskStep[];
}

/**
 * Generates structured task steps for a user-provided task title.
 * Sends ONLY the non-PII task title to AI.
 */
export async function generateTaskBreakdown(
  taskTitle: string,
  conditionId = 'adhd'
): Promise<TaskStep[]> {
  const trimmed = taskTitle.trim();
  if (!trimmed) return [];

  try {
    // Attempt AI Edge function call with isolated, sanitized payload
    const { data, error } = await supabase.functions.invoke('task-breaker', {
      body: { task: trimmed, conditionId },
    });

    if (!error && data?.steps && Array.isArray(data.steps) && data.steps.length > 0) {
      return data.steps.map((stepText: string, idx: number) => ({
        id: `step-${Date.now()}-${idx}`,
        title: typeof stepText === 'string' ? stepText : String(stepText),
        completed: false,
      }));
    }
  } catch {
    // Fallback logic on network/Edge Function unavailability
  }

  // Smart non-AI rule-based fallback generator
  return fallbackTaskBreakdown(trimmed);
}

function fallbackTaskBreakdown(task: string): TaskStep[] {
  const lower = task.toLowerCase();

  if (lower.includes('presentation') || lower.includes('slide') || lower.includes('deck')) {
    return [
      { id: `step-${Date.now()}-1`, title: 'Define key message and outline 3 main topics', completed: false },
      { id: `step-${Date.now()}-2`, title: 'Gather relevant data, notes, and references', completed: false },
      { id: `step-${Date.now()}-3`, title: 'Draft slide deck outline and slide titles', completed: false },
      { id: `step-${Date.now()}-4`, title: 'Fill in content and key visual points', completed: false },
      { id: `step-${Date.now()}-5`, title: 'Rehearse delivery once from start to end', completed: false },
    ];
  }

  if (lower.includes('report') || lower.includes('essay') || lower.includes('write') || lower.includes('document')) {
    return [
      { id: `step-${Date.now()}-1`, title: 'Brainstorm main ideas and set target structure', completed: false },
      { id: `step-${Date.now()}-2`, title: 'Research and gather necessary background facts', completed: false },
      { id: `step-${Date.now()}-3`, title: 'Write rough initial draft without editing', completed: false },
      { id: `step-${Date.now()}-4`, title: 'Review and refine formatting and clarity', completed: false },
      { id: `step-${Date.now()}-5`, title: 'Final proofread and save/submit', completed: false },
    ];
  }

  if (lower.includes('clean') || lower.includes('room') || lower.includes('organize') || lower.includes('house')) {
    return [
      { id: `step-${Date.now()}-1`, title: 'Clear away obvious trash and discarded items', completed: false },
      { id: `step-${Date.now()}-2`, title: 'Return misplaced objects to their original rooms', completed: false },
      { id: `step-${Date.now()}-3`, title: 'Wipe down main surfaces and desks', completed: false },
      { id: `step-${Date.now()}-4`, title: 'Sweep or vacuum high-traffic floor areas', completed: false },
      { id: `step-${Date.now()}-5`, title: 'Enjoy clean environment and take a break', completed: false },
    ];
  }

  // Generic breakdown
  return [
    { id: `step-${Date.now()}-1`, title: `Clarify specific goal for "${task}"`, completed: false },
    { id: `step-${Date.now()}-2`, title: 'Gather tools or materials needed to start', completed: false },
    { id: `step-${Date.now()}-3`, title: 'Complete first 10-minute active chunk', completed: false },
    { id: `step-${Date.now()}-4`, title: 'Review progress and finish remaining details', completed: false },
    { id: `step-${Date.now()}-5`, title: 'Mark task as complete and celebrate step', completed: false },
  ];
}
