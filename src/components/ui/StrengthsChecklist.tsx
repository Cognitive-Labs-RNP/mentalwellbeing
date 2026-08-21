import { useState, useEffect } from 'react';
import { Award, Plus, CheckSquare, Square } from 'lucide-react';
import { Button } from './Button';

interface StrengthsChecklistProps {
  conditionId: string;
  onComplete?: () => void;
  className?: string;
}

const DEFAULT_STRENGTHS = [
  'Resilience & Persistence',
  'Empathy & Compassion',
  'Creativity & Curiosity',
  'Problem-Solving Skills',
  'Courage & Honesty',
  'Kindness to Others',
  'Sense of Humor',
  'Patience & Adaptability',
];

const STORAGE_KEY = 'strengths_checklist_data';

export function StrengthsChecklist({ conditionId, onComplete, className = '' }: StrengthsChecklistProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customStrengths, setCustomStrengths] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.selected && Array.isArray(parsed.selected)) setSelected(parsed.selected);
        if (parsed.custom && Array.isArray(parsed.custom)) setCustomStrengths(parsed.custom);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const saveState = (newSelected: string[], newCustom: string[]) => {
    setSelected(newSelected);
    setCustomStrengths(newCustom);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ selected: newSelected, custom: newCustom }));
    } catch {
      /* ignore */
    }
  };

  const toggleStrength = (item: string) => {
    const nextSelected = selected.includes(item)
      ? selected.filter((s) => s !== item)
      : [...selected, item];

    saveState(nextSelected, customStrengths);
    if (nextSelected.length >= 3 && onComplete) {
      onComplete();
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const newItem = customInput.trim();
    if (!customStrengths.includes(newItem)) {
      const nextCustom = [...customStrengths, newItem];
      const nextSelected = [...selected, newItem];
      saveState(nextSelected, nextCustom);
    }
    setCustomInput('');
  };

  const allList = [...DEFAULT_STRENGTHS, ...customStrengths];

  return (
    <div className={`p-6 rounded-2xl bg-surface/80 border border-surface-border/80 backdrop-blur-xl shadow-glass space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-accent-lavender/20 text-accent-lavender">
            <Award className="w-4 h-4" />
          </span>
          <h4 className="font-display text-lg font-semibold text-text-primary">Strengths Checklist</h4>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-lavender/15 text-accent-lavender border border-accent-lavender/30">
          {selected.length} Selected
        </span>
      </div>

      <p className="text-xs text-text-secondary">
        Select strengths that reflect your character, or add your own custom positive qualities.
      </p>

      {/* Grid of Strengths */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {allList.map((strength) => {
          const isChecked = selected.includes(strength);
          return (
            <button
              key={strength}
              onClick={() => toggleStrength(strength)}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                isChecked
                  ? 'bg-accent-lavender/20 border-accent-lavender/40 text-text-primary font-medium'
                  : 'bg-surface-hover/40 border-surface-border/70 text-text-secondary hover:bg-surface-hover/70'
              }`}
            >
              {isChecked ? (
                <CheckSquare className="w-4 h-4 text-accent-lavender flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-text-muted flex-shrink-0" />
              )}
              <span className="text-sm">{strength}</span>
            </button>
          );
        })}
      </div>

      {/* Add Custom Form */}
      <form onSubmit={handleAddCustom} className="flex gap-2 pt-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Add a custom strength or positive quality..."
          className="flex-1 h-10 px-4 rounded-xl bg-bg-primary/60 border border-surface-border text-text-primary placeholder:text-text-muted text-xs focus:outline-none focus:border-accent-lavender"
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!customInput.trim()}>
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </form>
    </div>
  );
}
