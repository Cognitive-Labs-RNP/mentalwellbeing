import { useState, useEffect } from 'react';
import { Sparkles, CheckSquare, Square, Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { generateTaskBreakdown, TaskStep, TaskBreakerItem } from '@/services/taskBreakerEngine';
import { useAppStore } from '@/store';
import { saveToolRecord } from '@/services/storage';

interface TaskBreakerProps {
  conditionId: string;
  onComplete?: () => void;
  className?: string;
}

const STORAGE_KEY_PREFIX = 'task_breaker_tasks_';

export function TaskBreaker({ conditionId, onComplete, className = '' }: TaskBreakerProps) {
  const session = useAppStore((s) => s.session);
  const [taskInput, setTaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskBreakerItem | null>(null);

  // Load existing saved task for this condition from localStorage / store
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${conditionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.steps)) {
          setActiveTask(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  }, [conditionId]);

  // Save task updates to localStorage & Supabase
  const persistTask = (task: TaskBreakerItem | null) => {
    setActiveTask(task);
    try {
      if (task) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${conditionId}`, JSON.stringify(task));
        if (session?.userId && !session.isDemo) {
          saveToolRecord(session.userId, 'task_breaker', task.steps.filter((s) => s.completed).length, 'steps', {
            conditionId,
            taskTitle: task.taskTitle,
            totalSteps: task.steps.length,
            completedSteps: task.steps.filter((s) => s.completed).length,
          });
        }
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${conditionId}`);
      }
    } catch {
      /* ignore */
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    setLoading(true);
    const steps = await generateTaskBreakdown(taskInput.trim(), conditionId);
    setLoading(false);

    const newTask: TaskBreakerItem = {
      id: `task-${Date.now()}`,
      taskTitle: taskInput.trim(),
      conditionId,
      createdAt: new Date().toISOString(),
      steps,
    };

    persistTask(newTask);
    setTaskInput('');
  };

  const toggleStep = (stepId: string) => {
    if (!activeTask) return;
    const updatedSteps = activeTask.steps.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    const updatedTask = { ...activeTask, steps: updatedSteps };
    persistTask(updatedTask);

    const allDone = updatedSteps.every((s) => s.completed);
    if (allDone && onComplete) {
      onComplete();
    }
  };

  const handleClearTask = () => {
    persistTask(null);
  };

  const completedCount = activeTask?.steps.filter((s) => s.completed).length ?? 0;
  const totalCount = activeTask?.steps.length ?? 0;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={`p-6 rounded-2xl bg-surface/80 border border-surface-border/80 backdrop-blur-xl shadow-glass space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-accent-lavender/20 text-accent-lavender">
              <Sparkles className="w-4 h-4" />
            </span>
            <h4 className="font-display text-lg font-semibold text-text-primary">AI Task Breaker</h4>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Turn overwhelming goals into small, clear action steps.
          </p>
        </div>

        {activeTask && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-lavender/15 text-accent-lavender border border-accent-lavender/30">
            {completedCount}/{totalCount} Done ({percent}%)
          </span>
        )}
      </div>

      {/* Task input form if no active task */}
      {!activeTask ? (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="task-breaker-input" className="text-xs font-medium text-text-secondary">
              What task feels overwhelming right now?
            </label>
            <input
              id="task-breaker-input"
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder='e.g. "Prepare my presentation" or "Clean my desk"'
              disabled={loading}
              className="w-full h-11 px-4 rounded-xl bg-bg-primary/60 border border-surface-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-lavender focus:ring-2 focus:ring-accent-lavender/20"
            />
          </div>

          <Button type="submit" size="md" variant="primary" disabled={loading || !taskInput.trim()} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Breaking down task...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Break Into Action Steps
              </>
            )}
          </Button>
        </form>
      ) : (
        /* Active Task View */
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-bg-primary/50 border border-surface-border flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Target Task</p>
              <h5 className="font-display font-semibold text-base text-text-primary mt-0.5">{activeTask.taskTitle}</h5>
            </div>
            <Button size="sm" variant="ghost" onClick={handleClearTask} className="text-text-muted hover:text-text-primary">
              <Trash2 className="w-4 h-4" />
              New Task
            </Button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-surface-hover/60 rounded-full overflow-hidden border border-surface-border/60">
            <div
              className="h-full bg-gradient-to-r from-accent-lavender to-accent-cyan transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Step list */}
          <div className="space-y-2">
            {activeTask.steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all duration-200 ${
                  step.completed
                    ? 'bg-accent-green/10 border-accent-green/30 text-text-muted line-through'
                    : 'bg-surface-hover/40 border-surface-border/70 text-text-primary hover:bg-surface-hover/70'
                }`}
              >
                {step.completed ? (
                  <CheckSquare className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm font-medium leading-relaxed">
                  <span className="font-bold mr-1">{idx + 1}.</span> {step.title}
                </span>
              </button>
            ))}
          </div>

          {completedCount === totalCount && (
            <div className="p-4 rounded-xl bg-accent-green/15 border border-accent-green/30 flex items-center gap-3 text-accent-green">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-semibold">Fantastic work! All steps for this task have been completed.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
