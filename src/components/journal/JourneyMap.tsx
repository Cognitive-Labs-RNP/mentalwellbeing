import { useMemo } from 'react';
import {
  Compass,
  Search,
  CheckCircle2,
  Smile,
  Moon,
  Activity,
  Coffee,
  Heart,
  Music2,
  MessageSquare,
  ArrowDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Tag } from '../ui/Tag';
import type { JournalActivityEvent } from '../../types/journal';

interface JourneyMapProps {
  events: JournalActivityEvent[];
}

function getNodeIcon(type: JournalActivityEvent['type']) {
  switch (type) {
    case 'analysis':
      return { icon: Search, color: 'text-accent-lavender', borderColor: 'border-accent-lavender', bg: 'bg-accent-lavender/20' };
    case 'condition_activity':
      return { icon: CheckCircle2, color: 'text-accent-green', borderColor: 'border-accent-green', bg: 'bg-accent-green/20' };
    case 'mood':
      return { icon: Smile, color: 'text-accent-cyan', borderColor: 'border-accent-cyan', bg: 'bg-accent-cyan/20' };
    case 'sleep':
      return { icon: Moon, color: 'text-indigo-400', borderColor: 'border-indigo-500', bg: 'bg-indigo-500/20' };
    case 'lifestyle':
      return { icon: Activity, color: 'text-emerald-400', borderColor: 'border-emerald-500', bg: 'bg-emerald-500/20' };
    case 'caffeine':
      return { icon: Coffee, color: 'text-amber-400', borderColor: 'border-amber-500', bg: 'bg-amber-500/20' };
    case 'health':
      return { icon: Heart, color: 'text-rose-400', borderColor: 'border-rose-500', bg: 'bg-rose-500/20' };
    case 'sound':
      return { icon: Music2, color: 'text-purple-400', borderColor: 'border-purple-500', bg: 'bg-purple-500/20' };
    case 'feedback':
      return { icon: MessageSquare, color: 'text-accent-cyan', borderColor: 'border-accent-cyan', bg: 'bg-accent-cyan/20' };
    default:
      return { icon: Sparkles, color: 'text-text-primary', borderColor: 'border-surface-border', bg: 'bg-surface' };
  }
}

export function JourneyMap({ events }: JourneyMapProps) {
  // Sort events chronologically (oldest first for journey map flow)
  const journeyNodes = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [events]);

  if (journeyNodes.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-accent-lavender/30 bg-gradient-to-br from-surface/90 via-surface/70 to-bg-primary/90 shadow-glass">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-lavender/30 to-accent-cyan/20 border border-surface-border/60 flex items-center justify-center">
              <Compass className="w-5 h-5 text-accent-lavender" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-text-primary">
                Visual Journey Map
              </CardTitle>
              <CardDescription className="text-xs">
                Dynamic flow generated from actual stored database records.
              </CardDescription>
            </div>
          </div>

          <Tag variant="lavender" size="sm">
            {journeyNodes.length} Milestone{journeyNodes.length > 1 ? 's' : ''}
          </Tag>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* HORIZONTAL DESKTOP / SCROLLABLE STEPS */}
        <div className="hidden md:flex items-center gap-3 overflow-x-auto pb-4 pt-2 scrollbar-thin">
          {journeyNodes.map((node, idx) => {
            const config = getNodeIcon(node.type);
            const Icon = config.icon;

            return (
              <div key={node.id} className="flex items-center gap-3 flex-shrink-0">
                {/* Node Box */}
                <div
                  className={`w-52 p-4 rounded-2xl bg-surface/80 border transition-all duration-300 hover:scale-105 shadow-glass space-y-2 ${config.borderColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.bg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <span className="text-[10px] font-mono text-text-muted">
                      {new Date(node.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block">
                      {node.type.replace('_', ' ')}
                    </span>
                    <h4 className="font-display text-xs font-bold text-text-primary truncate">
                      {node.subtitle || node.title}
                    </h4>
                  </div>

                  {node.score !== undefined && (
                    <div className="text-[11px] font-mono font-semibold text-accent-cyan">
                      {node.type === 'analysis'
                        ? `Match: ${node.score}%`
                        : node.type === 'feedback'
                        ? `Outcome: ${node.score > 0 ? `+${node.score}` : node.score} pts`
                        : `Value: ${node.score}`}
                    </div>
                  )}
                </div>

                {/* Arrow Connector */}
                {idx < journeyNodes.length - 1 && (
                  <div className="flex items-center justify-center text-accent-lavender/60">
                    <ArrowRight className="w-5 h-5 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* VERTICAL MOBILE STEPPER */}
        <div className="md:hidden space-y-4 relative pl-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-accent-lavender/30">
          {journeyNodes.map((node, idx) => {
            const config = getNodeIcon(node.type);
            const Icon = config.icon;

            return (
              <div key={node.id} className="relative space-y-1">
                <div
                  className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center border text-xs ${config.bg} ${config.borderColor}`}
                >
                  <Icon className={`w-3 h-3 ${config.color}`} />
                </div>

                <div className="p-3 rounded-xl bg-surface/80 border border-surface-border space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-primary">
                      {node.subtitle || node.title}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {new Date(node.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {node.score !== undefined && (
                    <div className="text-[11px] text-accent-cyan font-mono">
                      {node.type === 'analysis' ? `Match: ${node.score}%` : `Score: ${node.score}`}
                    </div>
                  )}
                </div>

                {idx < journeyNodes.length - 1 && (
                  <div className="flex justify-start pl-2 pt-1 text-accent-lavender/50">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
