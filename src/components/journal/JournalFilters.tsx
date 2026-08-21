import { Calendar, Filter } from 'lucide-react';
import type { DateFilterOption, TypeFilterOption } from '../../types/journal';

interface JournalFiltersProps {
  dateFilter: DateFilterOption;
  typeFilter: TypeFilterOption;
  onDateFilterChange: (val: DateFilterOption) => void;
  onTypeFilterChange: (val: TypeFilterOption) => void;
}

const DATE_OPTIONS: { label: string; value: DateFilterOption }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

const TYPE_OPTIONS: { label: string; value: TypeFilterOption }[] = [
  { label: 'All Activities', value: 'all' },
  { label: 'Analysis', value: 'analysis' },
  { label: 'Condition Workspace', value: 'condition' },
  { label: 'Global Tools', value: 'tools' },
  { label: 'Feedback', value: 'feedback' },
];

export function JournalFilters({
  dateFilter,
  typeFilter,
  onDateFilterChange,
  onTypeFilterChange,
}: JournalFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface/70 border border-surface-border backdrop-blur-md">
      {/* Date Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted mr-1">
          <Calendar className="w-3.5 h-3.5 text-accent-lavender" />
          Time Range:
        </span>
        {DATE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onDateFilterChange(opt.value)}
            className={[
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
              dateFilter === opt.value
                ? 'bg-accent-lavender/20 border-accent-lavender text-accent-lavender font-semibold shadow-glow'
                : 'bg-surface-hover/40 border-surface-border text-text-secondary hover:text-text-primary hover:bg-surface-hover',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted mr-1">
          <Filter className="w-3.5 h-3.5 text-accent-cyan" />
          Category:
        </span>
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onTypeFilterChange(opt.value)}
            className={[
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
              typeFilter === opt.value
                ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-semibold shadow-glow'
                : 'bg-surface-hover/40 border-surface-border text-text-secondary hover:text-text-primary hover:bg-surface-hover',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
