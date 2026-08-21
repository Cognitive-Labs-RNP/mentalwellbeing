import { useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Smile,
  Moon,
  Activity,
  Coffee,
  Heart,
  Music2,
  MessageSquare,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Tag } from '../ui/Tag';
import type { JournalActivityEvent } from '../../types/journal';

interface ActivitySummaryTimelineProps {
  events: JournalActivityEvent[];
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatDateHeader(isoString: string): string {
  try {
    const d = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today — ' + d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday — ' + d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return isoString;
  }
}

function getEventBadge(type: JournalActivityEvent['type']) {
  switch (type) {
    case 'analysis':
      return { icon: Search, color: 'text-accent-lavender', bg: 'bg-accent-lavender/15 border-accent-lavender/30', label: 'Analysis' };
    case 'condition_activity':
      return { icon: CheckCircle2, color: 'text-accent-green', bg: 'bg-accent-green/15 border-accent-green/30', label: 'Condition Workspace' };
    case 'mood':
      return { icon: Smile, color: 'text-accent-cyan', bg: 'bg-accent-cyan/15 border-accent-cyan/30', label: 'Mood Check' };
    case 'sleep':
      return { icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30', label: 'Sleep Tracker' };
    case 'lifestyle':
      return { icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', label: 'Lifestyle Tracker' };
    case 'caffeine':
      return { icon: Coffee, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', label: 'Cognitive Load' };
    case 'health':
      return { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30', label: 'General Health' };
    case 'sound':
      return { icon: Music2, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30', label: 'Sound Session' };
    case 'feedback':
      return { icon: MessageSquare, color: 'text-accent-cyan', bg: 'bg-accent-cyan/15 border-accent-cyan/30', label: 'Feedback' };
    default:
      return { icon: Clock, color: 'text-text-secondary', bg: 'bg-surface-hover border-surface-border', label: 'Activity' };
  }
}

export function ActivitySummaryTimeline({ events }: ActivitySummaryTimelineProps) {
  // Group events by date string
  const groupedEvents = useMemo(() => {
    const groups: { [dateStr: string]: JournalActivityEvent[] } = {};
    events.forEach((evt) => {
      const dateKey = new Date(evt.timestamp).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(evt);
    });
    return Object.entries(groups).map(([dateKey, items]) => ({
      dateHeader: formatDateHeader(items[0].timestamp),
      items,
    }));
  }, [events]);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {groupedEvents.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-4">
          {/* Date Group Sticky Header */}
          <div className="sticky top-16 z-10 py-2 bg-bg-primary/90 backdrop-blur-md border-b border-surface-border/60 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-text-primary flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-lavender animate-pulse" />
              {group.dateHeader}
            </h3>
            <span className="text-xs text-text-muted font-mono">
              {group.items.length} record{group.items.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Timeline Events Column */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-accent-lavender/40 before:via-surface-border before:to-transparent">
            {group.items.map((evt) => {
              const badge = getEventBadge(evt.type);
              const Icon = badge.icon;
              const timeStr = formatTime(evt.timestamp);

              return (
                <div key={evt.id} className="relative group animate-fade-in">
                  {/* Timeline Dot Icon */}
                  <div className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center border text-xs shadow-glow transition-transform group-hover:scale-110 ${badge.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${badge.color}`} />
                  </div>

                  {/* Card Body */}
                  <div className="p-4 rounded-2xl bg-surface/80 border border-surface-border hover:border-accent-lavender/30 transition-all shadow-glass space-y-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Tag variant="lavender" size="sm">
                          {badge.label}
                        </Tag>
                        <span className="text-xs font-mono text-text-muted">{timeStr}</span>
                      </div>

                      {evt.score !== undefined && (
                        <Tag
                          variant={evt.type === 'feedback' && evt.score > 0 ? 'green' : 'cyan'}
                          size="sm"
                        >
                          {evt.type === 'analysis'
                            ? `Match: ${evt.score}%`
                            : evt.type === 'feedback'
                            ? `Improvement: ${evt.score > 0 ? `+${evt.score}` : evt.score} pts`
                            : `Score: ${evt.score}`}
                        </Tag>
                      )}
                    </div>

                    {/* Main Title & Subtitle */}
                    <div>
                      <h4 className="font-display text-base font-semibold text-text-primary">
                        {evt.subtitle || evt.title}
                      </h4>
                    </div>

                    {/* Specific Event Type Renderers */}
                    {evt.type === 'analysis' && (
                      <div className="space-y-2 pt-1 border-t border-surface-border/60 text-xs">
                        <p className="text-text-secondary leading-relaxed">
                          → {(evt.details.message as string) || `Reported pattern matched symptoms associated with ${evt.details.conditionName} by ${evt.score}%.`}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-accent-amber/90 italic">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-accent-amber" />
                          <span>Informational pattern match based on reported symptoms, not a clinical diagnosis.</span>
                        </div>
                      </div>
                    )}

                    {evt.type === 'condition_activity' && (
                      <div className="space-y-1 pt-1 border-t border-surface-border/60 text-xs text-text-secondary">
                        <div className="flex items-center gap-2">
                          <span className="text-accent-green font-semibold">→ Activity:</span>
                          <span>{String(evt.details.activityName || '')}</span>
                        </div>
                        {Boolean(evt.details.durationText) && (
                          <div className="flex items-center gap-2">
                            <span className="text-accent-lavender font-semibold">→ Duration:</span>
                            <span>{String(evt.details.durationText)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-accent-cyan font-semibold">→ Status:</span>
                          <span className="text-accent-green font-medium">Completed ✓</span>
                        </div>
                      </div>
                    )}

                    {evt.type === 'sound' && (
                      <div className="space-y-1 pt-1 border-t border-surface-border/60 text-xs text-text-secondary">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 font-semibold">→ Track:</span>
                          <span>{String(evt.details.soundTitle || '')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-accent-lavender font-semibold">→ Duration:</span>
                          <span>{Number(evt.details.durationMinutes || 0)} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-accent-cyan font-semibold">→ Status:</span>
                          <span>{String(evt.details.statusText || 'Completed ✓')}</span>
                        </div>
                      </div>
                    )}

                    {evt.type === 'mood' && (
                      <div className="space-y-1 pt-1 border-t border-surface-border/60 text-xs text-text-secondary">
                        <div className="flex items-center gap-2">
                          <span className="text-accent-cyan font-semibold">→ Mood Score:</span>
                          <span className="font-bold text-text-primary">{Number(evt.details.intensity || 0)}/10</span>
                          {Boolean(evt.details.moodLabel) && (
                            <span className="px-2 py-0.5 rounded bg-surface-hover text-accent-cyan">
                              {String(evt.details.moodLabel)}
                            </span>
                          )}
                        </div>
                        {Boolean(evt.details.note) && (
                          <p className="text-text-muted italic">"{String(evt.details.note)}"</p>
                        )}
                      </div>
                    )}

                    {evt.type === 'feedback' && (
                      <div className="space-y-2 pt-1 border-t border-surface-border/60 text-xs text-text-secondary">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{String(evt.details.currentFeeling || '🙂')}</span>
                          <div>
                            <div className="font-semibold text-text-primary">
                              Before: {Number(evt.details.beforeIntensity || 0)}/10 → After: {Number(evt.details.afterIntensity || 0)}/10
                            </div>
                            <div className="text-accent-green font-medium">
                              Status: {String(evt.details.status || 'Improved')} (Improvement: {Number(evt.details.improvement || 0)} pts)
                            </div>
                          </div>
                        </div>
                        {Boolean(evt.details.comment) && (
                          <p className="text-text-muted italic bg-surface-hover/30 p-2 rounded-xl">
                            "{String(evt.details.comment)}"
                          </p>
                        )}
                      </div>
                    )}

                    {(evt.type === 'sleep' || evt.type === 'caffeine' || evt.type === 'lifestyle' || evt.type === 'health') && (
                      <div className="space-y-1 pt-1 border-t border-surface-border/60 text-xs text-text-secondary">
                        <p>→ {evt.subtitle}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
