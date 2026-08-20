import { Link } from 'react-router-dom';
import {
  Sparkles,
  BrainCircuit,
  BarChart3,
  Activity,
  Wind,
  Smile,
  Play,
  Heart,
  FileSearch,
  Zap,
  Compass,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const disorders = [
  { id: 'anxiety', name: 'Anxiety', color: 'from-accent-cyan/25 to-sky-500/10', border: 'border-accent-cyan/25', text: 'text-accent-cyan' },
  { id: 'depression', name: 'Depression', color: 'from-accent-lavender/25 to-purple-500/10', border: 'border-accent-lavender/25', text: 'text-accent-lavender' },
  { id: 'burnout', name: 'Burnout', color: 'from-accent-amber/25 to-orange-500/10', border: 'border-accent-amber/25', text: 'text-accent-amber' },
  { id: 'adhd', name: 'ADHD', color: 'from-accent-cyan/25 to-emerald-500/10', border: 'border-accent-cyan/25', text: 'text-accent-cyan' },
  { id: 'ocd', name: 'OCD', color: 'from-accent-lavender/25 to-rose-500/10', border: 'border-accent-lavender/25', text: 'text-accent-lavender' },
  { id: 'ptsd', name: 'PTSD', color: 'from-accent-rose/25 to-purple-500/10', border: 'border-accent-rose/25', text: 'text-accent-rose' },
  { id: 'cognitive-overload', name: 'Cognitive Overload', color: 'from-accent-amber/25 to-amber-500/10', border: 'border-accent-amber/25', text: 'text-accent-amber' },
  { id: 'anger-issues', name: 'Anger & Irritation', color: 'from-accent-rose/25 to-red-500/10', border: 'border-accent-rose/25', text: 'text-accent-rose' },
  { id: 'social-detachment', name: 'Social Detachment', color: 'from-accent-cyan/25 to-teal-500/10', border: 'border-accent-cyan/25', text: 'text-accent-cyan' },
  { id: 'social-anxiety', name: 'Social Anxiety', color: 'from-accent-lavender/25 to-indigo-500/10', border: 'border-accent-lavender/25', text: 'text-accent-lavender' },
  { id: 'self-esteem', name: 'Self-Esteem', color: 'from-accent-green/25 to-emerald-500/10', border: 'border-accent-green/25', text: 'text-accent-green' },
  { id: 'substance-related', name: 'Substance-Related', color: 'from-accent-amber/25 to-rose-500/10', border: 'border-accent-amber/25', text: 'text-accent-amber' },
];

const features = [
  {
    icon: BarChart3,
    title: 'Understand your patterns',
    description: 'Track moods and triggers over time with gentle, private insights powered by evidence-based analysis.',
    gradient: 'from-accent-lavender/25 to-purple-500/15',
    border: 'border-accent-lavender/25',
    iconColor: 'text-accent-lavender',
  },
  {
    icon: BrainCircuit,
    title: 'Condition-specific support',
    description: 'Tools, sounds and guides tailored to 12 common mental health conditions and challenges.',
    gradient: 'from-accent-cyan/25 to-sky-500/15',
    border: 'border-accent-cyan/25',
    iconColor: 'text-accent-cyan',
  },
  {
    icon: Activity,
    title: 'Track your progress',
    description: 'Celebrate small wins with visual summaries, weekly check-ins, and clear momentum indicators.',
    gradient: 'from-accent-green/25 to-emerald-500/15',
    border: 'border-accent-green/25',
    iconColor: 'text-accent-green',
  },
  {
    icon: Compass,
    title: 'Evidence-based tools',
    description: 'CBT, DBT, grounding, breathwork, and more — curated from trusted clinical frameworks.',
    gradient: 'from-accent-amber/25 to-orange-500/15',
    border: 'border-accent-amber/25',
    iconColor: 'text-accent-amber',
  },
];

const quickActions = [
  {
    to: '/analysis/input',
    icon: FileSearch,
    title: 'New Analysis',
    subtitle: 'Check how you\'re feeling right now',
    gradient: 'from-accent-lavender/25 to-purple-500/15',
    border: 'border-accent-lavender/25',
    iconColor: 'text-accent-lavender',
  },
  {
    to: '/tools/calm',
    icon: Wind,
    title: 'Calm Tools',
    subtitle: 'Breathing, grounding & sounds',
    gradient: 'from-accent-cyan/25 to-sky-500/15',
    border: 'border-accent-cyan/25',
    iconColor: 'text-accent-cyan',
  },
  {
    to: '/tools/mood-check',
    icon: Smile,
    title: 'Mood Check',
    subtitle: 'Quick 30-second mood log',
    gradient: 'from-accent-green/25 to-emerald-500/15',
    border: 'border-accent-green/25',
    iconColor: 'text-accent-green',
  },
];

export default function Home() {
  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="relative overflow-hidden border-accent-lavender/15">
        <div className="absolute inset-0 bg-gradient-radial opacity-40 pointer-events-none" />
        <CardContent className="relative p-8 md:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="relative flex-1 w-full aspect-square max-w-[320px] rounded-3xl bg-gradient-to-br from-accent-lavender/15 via-accent-cyan/10 to-transparent border border-surface-border/60 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-radial opacity-60" />
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-accent-lavender/30 to-accent-cyan/30 border border-surface-border flex items-center justify-center shadow-glow animate-float">
                <Sparkles className="w-14 h-14 text-accent-lavender" strokeWidth={1.8} />
              </div>
              <div className="absolute top-8 left-8 w-10 h-10 rounded-2xl bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                <Heart className="w-5 h-5 text-accent-cyan" />
              </div>
              <div className="absolute bottom-10 right-10 w-12 h-12 rounded-2xl bg-accent-green/15 border border-accent-green/30 flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
                <Smile className="w-6 h-6 text-accent-green" />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left space-y-5">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-lavender/10 border border-accent-lavender/20 text-xs font-semibold text-accent-lavender">
                  <Zap className="w-3.5 h-3.5" />
                  Your wellbeing companion
                </span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary leading-tight">
                  How are you feeling today?
                </h1>
                <p className="text-base text-text-secondary leading-relaxed max-w-md lg:mx-0 mx-auto">
                  Start a quick wellbeing check-in to understand your current state and get personalised, evidence-based support.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link to="/analysis/input">
                  <Button variant="primary" size="lg">
                    <Sparkles className="w-5 h-5" />
                    Start Analysis
                  </Button>
                </Link>
                <Link to="/tools">
                  <Button variant="secondary" size="lg">
                    <Wind className="w-5 h-5" />
                    Browse Tools
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Quick Actions
            </h2>
            <p className="text-sm text-text-secondary">Jump back in with one tap</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to} className="group block">
                <Card className="h-full hover:border-accent-lavender/30 transition-all duration-300">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} border ${action.border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon className={`w-5.5 h-5.5 ${action.iconColor}`} />
                      </div>
                      <Play className="w-4 h-4 text-text-muted group-hover:text-accent-lavender transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display text-base font-semibold text-text-primary">
                        {action.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {action.subtitle}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              What can we support you with?
            </h2>
            <p className="text-sm text-text-secondary">Choose a challenge to explore condition-specific tools</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {disorders.map((disorder) => (
            <Link
              key={disorder.id}
              to={`/${disorder.id}/tools`}
              className="group"
            >
              <Card className="h-full hover:border-accent-lavender/30 transition-all duration-300">
                <CardContent className="p-4">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${disorder.color} border ${disorder.border} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <Heart className={`w-4.5 h-4.5 ${disorder.text}`} />
                  </div>
                  <h3 className="font-semibold text-sm text-text-primary leading-snug">
                    {disorder.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Everything you need, nothing you don't
            </h2>
            <p className="text-sm text-text-secondary">Built with care, guided by clinical best practice</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="group hover:border-accent-lavender/20 transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} border ${feature.border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-base font-semibold text-text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
