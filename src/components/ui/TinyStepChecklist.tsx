import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface TinyStepChecklistProps {
  conditionId: string;
  onComplete?: () => void;
  className?: string;
}

const DEFAULT_SUGGESTIONS: Record<string, string[]> = {
  'depressive-symptoms': [
    'Drink a full glass of cool water',
    'Open a window and take 3 outdoor breaths',
    'Wash your face with refreshing cool water',
    'Stretch gently in bed or your chair for 60 seconds',
    'Step outside for 2 minutes',
  ],
  'social-detachment': [
    'Send a short "thinking of you" message to a trusted friend',
    'Say a warm hello to someone nearby',
    'Spend 5 quiet minutes in a shared space',
    'Reply to one pending message without overthinking',
  ],
  'self-esteem': [
    'Complete one tiny 2-minute cleaning or organizing task',
    'Write down one thing you did well today',
    'Acknowledge one personal effort you made recently',
    'Say one genuine positive statement to yourself in the mirror',
  ],
  default: [
    'Drink a glass of water',
    'Take 3 slow deep breaths',
    'Step outside for 2 minutes',
    'Complete one tiny 2-minute task',
  ],
};

const STORAGE_KEY_PREFIX = 'tiny_step_';

export function TinyStepChecklist({ conditionId, onComplete, className = '' }: TinyStepChecklistProps) {
  const suggestions = DEFAULT_SUGGESTIONS[conditionId] ?? DEFAULT_SUGGESTIONS.default;

  const [selectedStep, setSelectedStep] = useState<string>('');
  const [customInput, setCustomInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${conditionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.step) setSelectedStep(parsed.step);
        if (parsed.completed !== undefined) setIsCompleted(parsed.completed);
      }
    } catch {
      /* ignore */
    }
  }, [conditionId]);

  const saveStepState = (step: string, completed: boolean) => {
    setSelectedStep(step);
    setIsCompleted(completed);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${conditionId}`, JSON.stringify({ step, completed }));
    } catch {
      /* ignore */
    }
  };

  const handleSelect = (stepText: string) => {
    saveStepState(stepText, false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    saveStepState(customInput.trim(), false);
    setCustomInput('');
  };

  const handleToggleComplete = () => {
    const nextState = !isCompleted;
    saveStepState(selectedStep, nextState);
    if (nextState && onComplete) {
      onComplete();
    }
  };

  const handleReset = () => {
    saveStepState('', false);
  };

  return (
    <div className={`p-6 rounded-2xl bg-surface/80 border border-surface-border/80 backdrop-blur-xl shadow-glass space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-accent-lavender/20 text-accent-lavender">
            <Sparkles className="w-4 h-4" />
          </span>
          <h4 className="font-display text-lg font-semibold text-text-primary">Single Tiny Action</h4>
        </div>
        {isCompleted && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-green/20 text-accent-green border border-accent-green/30">
            Action Completed!
          </span>
        )}
      </div>

      {!selectedStep ? (
        <div className="space-y-4">
          <p className="text-xs text-text-secondary">
            Choose ONE small achievable action to focus on right now. Small steps build momentum.
          </p>

          {/* List of predefined options */}
          <div className="space-y-2">
            {suggestions.map((item) => (
              <button
                key={item}
                onClick={() => handleSelect(item)}
                className="w-full p-3.5 rounded-xl bg-surface-hover/40 border border-surface-border/70 text-left text-sm text-text-primary hover:bg-surface-hover/70 hover:border-accent-lavender/40 transition-all flex items-center justify-between"
              >
                <span>{item}</span>
                <span className="text-xs font-semibold text-accent-lavender">Select →</span>
              </button>
            ))}
          </div>

          {/* Custom option */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2 pt-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Or enter your own tiny 2-minute action..."
              className="flex-1 h-10 px-4 rounded-xl bg-bg-primary/60 border border-surface-border text-text-primary placeholder:text-text-muted text-xs focus:outline-none focus:border-accent-lavender"
            />
            <Button type="submit" size="sm" variant="secondary" disabled={!customInput.trim()}>
              <Plus className="w-4 h-4" />
              Choose
            </Button>
          </form>
        </div>
      ) : (
        /* Selected step execution view */
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-bg-primary/50 border border-surface-border space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Your Chosen Action</p>
            <p className="font-display font-semibold text-base text-text-primary">{selectedStep}</p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              size="md"
              variant={isCompleted ? 'secondary' : 'primary'}
              onClick={handleToggleComplete}
              className={isCompleted ? 'text-accent-green' : ''}
            >
              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              {isCompleted ? 'Completed!' : 'Mark Action Complete'}
            </Button>

            <Button size="sm" variant="ghost" onClick={handleReset}>
              Choose Different Action
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
