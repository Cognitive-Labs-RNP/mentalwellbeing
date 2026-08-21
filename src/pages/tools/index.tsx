import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Heart, Cpu, Activity, Moon, Scale, Music, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

const TOOLS_LIST = [
  {
    to: '/tools/mood-check',
    title: 'Mood Check',
    description: 'Track daily emotional states, intensity, and reflections.',
    icon: Heart,
    color: 'text-accent-rose',
    bg: 'bg-accent-rose/10 border-accent-rose/20',
  },
  {
    to: '/tools/cognitive-load',
    title: 'Cognitive Load + Caffeine',
    description: 'Monitor mental fatigue and weight-based stimulant guidance.',
    icon: Cpu,
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10 border-accent-cyan/20',
  },
  {
    to: '/tools/lifestyle',
    title: 'Lifestyle Tracker',
    description: 'Structure physical activity, hydration, screen time, and routines.',
    icon: Activity,
    color: 'text-accent-green',
    bg: 'bg-accent-green/10 border-accent-green/20',
  },
  {
    to: '/tools/sleep',
    title: 'Sleep Tracker',
    description: 'Calculate sleep duration, quality rating, and night awakenings.',
    icon: Moon,
    color: 'text-accent-lavender',
    bg: 'bg-accent-lavender/10 border-accent-lavender/20',
  },
  {
    to: '/tools/health',
    title: 'General Health Tracker',
    description: 'Record height, weight, BMI, and weight range guidelines.',
    icon: Scale,
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10 border-accent-cyan/20',
  },
  {
    to: '/tools/sounds',
    title: 'Sound Library',
    description: 'Complete global soundscapes with categories, volume & timer.',
    icon: Music,
    color: 'text-accent-lavender',
    bg: 'bg-accent-lavender/10 border-accent-lavender/20',
  },
  {
    to: '/tools/gratitude',
    title: 'Gratitude & Intention',
    description: '3-item daily positive reflections and daily grounding intentions.',
    icon: Sparkles,
    color: 'text-accent-amber',
    bg: 'bg-accent-amber/10 border-accent-amber/20',
  },
];

export default function Tools() {
  const location = useLocation();
  const isSubRoute = location.pathname !== '/tools' && location.pathname !== '/tools/';

  if (isSubRoute) {
    return <Outlet />;
  }

  return (
    <div className="space-y-8 animate-slide-up max-w-5xl mx-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent-green" />
          <span className="text-xs font-semibold text-accent-green uppercase tracking-wider">
            Evidence-Based Wellbeing Suite
          </span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary">
          Global Wellbeing Tools
        </h2>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-2xl">
          Deterministic tools and tracking utilities to support your daily mental health. All records persist to your private account for longitudinal tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TOOLS_LIST.map((tool) => {
          const Icon = tool.icon;
          return (
            <NavLink
              key={tool.to}
              to={tool.to}
              className="group p-6 rounded-2xl bg-surface/80 border border-surface-border backdrop-blur-sm hover:border-accent-lavender/40 hover:bg-surface-hover/80 transition-all duration-300 shadow-glass flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${tool.bg} border flex items-center justify-center ${tool.color}`}>
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-lavender group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-text-primary group-hover:text-accent-lavender transition-colors mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                Deterministic & Private
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
