import { useState, useEffect } from 'react';
import { Plus, CheckSquare, Square, Trash2, ListFilter } from 'lucide-react';
import { Button } from './Button';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface PriorityTask {
  id: string;
  title: string;
  priority: PriorityLevel;
  completed: boolean;
}

interface TaskPrioritizationProps {
  conditionId: string;
  onComplete?: () => void;
  className?: string;
}

const STORAGE_KEY_PREFIX = 'task_prioritization_';

export function TaskPrioritization({ conditionId, onComplete, className = '' }: TaskPrioritizationProps) {
  const [taskText, setTaskText] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [tasks, setTasks] = useState<PriorityTask[]>([]);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${conditionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setTasks(parsed);
      }
    } catch {
      /* ignore */
    }
  }, [conditionId]);

  const saveTasks = (newTasks: PriorityTask[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${conditionId}`, JSON.stringify(newTasks));
    } catch {
      /* ignore */
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    const newTask: PriorityTask = {
      id: `p-task-${Date.now()}`,
      title: taskText.trim(),
      priority,
      completed: false,
    };

    const updated = [newTask, ...tasks];
    saveTasks(updated);
    setTaskText('');
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);

    if (updated.length > 0 && updated.every((t) => t.completed) && onComplete) {
      onComplete();
    }
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className={`p-6 rounded-2xl bg-surface/80 border border-surface-border/80 backdrop-blur-xl shadow-glass space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-accent-lavender/20 text-accent-lavender">
            <ListFilter className="w-4 h-4" />
          </span>
          <h4 className="font-display text-lg font-semibold text-text-primary">Task Prioritization</h4>
        </div>
        {tasks.length > 0 && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-lavender/15 text-accent-lavender border border-accent-lavender/30">
            {completedCount}/{tasks.length} Completed
          </span>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddTask} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Enter a task to prioritize..."
            className="flex-1 h-11 px-4 rounded-xl bg-bg-primary/60 border border-surface-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-lavender focus:ring-2 focus:ring-accent-lavender/20"
          />

          <div className="flex items-center gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="h-11 px-3 rounded-xl bg-bg-primary/60 border border-surface-border text-text-primary text-sm font-medium focus:outline-none focus:border-accent-lavender"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <Button type="submit" size="md" variant="primary" disabled={!taskText.trim()}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      </form>

      {/* Task List */}
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                task.completed
                  ? 'bg-surface-hover/20 border-surface-border/40 text-text-muted line-through'
                  : 'bg-surface-hover/40 border-surface-border text-text-primary'
              }`}
            >
              <button onClick={() => toggleTask(task.id)} className="flex items-center gap-3 text-left flex-1 min-w-0">
                {task.completed ? (
                  <CheckSquare className="w-5 h-5 text-accent-green flex-shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-text-muted flex-shrink-0" />
                )}
                <span className="text-sm font-medium truncate">{task.title}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(task.priority)}`}>
                  {task.priority}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-text-muted hover:text-red-400 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted text-center py-4">No tasks added yet. Add tasks above to prioritize your day.</p>
      )}
    </div>
  );
}
