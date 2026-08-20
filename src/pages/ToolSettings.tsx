import { useState } from 'react';
import {
  Settings,
  Volume2,
  Bell,
  Clock,
  Palette,
  Shield,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  Save,
  Sliders,
  Wind,
  Activity,
  MoonIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lavender/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary border border-surface-border',
        checked ? 'bg-gradient-to-r from-accent-lavender to-purple-500 border-transparent' : 'bg-surface-hover/60',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}

interface SettingSection {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const sections: SettingSection[] = [
  { id: 'general', icon: Sliders, title: 'General', description: 'Defaults, duration, and behaviour' },
  { id: 'audio', icon: Volume2, title: 'Audio & Sound', description: 'Default sounds, volume, and playback' },
  { id: 'notifications', icon: Bell, title: 'Notifications', description: 'Reminders, check-ins, and quiet hours' },
  { id: 'appearance', icon: Palette, title: 'Appearance', description: 'Theme, motion, and visual density' },
  { id: 'privacy', icon: Shield, title: 'Privacy & Safety', description: 'Data handling, AI, and emergency options' },
];

const defaultTab = 'general';

export default function ToolSettings() {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyReview, setWeeklyReview] = useState(false);
  const [storageEncrypted, setStorageEncrypted] = useState(true);

  const [defaultVolume, setDefaultVolume] = useState('70');
  const [defaultDuration, setDefaultDuration] = useState('5');
  const [theme, setTheme] = useState('dark');
  const [defaultBreathing, setDefaultBreathing] = useState('4-7-8');
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent-lavender/25 to-accent-cyan/25 border border-surface-border flex items-center justify-center flex-shrink-0">
            <Settings className="w-6 h-6 text-accent-lavender" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary leading-tight">
              Tool Settings
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Customise your experience to match how you want to use the tools
            </p>
          </div>
        </div>
        <Button variant="primary" size="sm">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
        <aside className="lg:sticky lg:top-20 self-start">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeTab === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={[
                        'w-full group relative flex items-center gap-3 min-h-[48px] px-3 py-2.5 rounded-xl text-left transition-all focus:outline-none focus:ring-2 focus:ring-accent-lavender/40',
                        isActive
                          ? 'text-accent-lavender bg-accent-lavender/10'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/60',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex-shrink-0 transition-colors',
                          isActive ? 'text-accent-lavender' : 'text-text-muted group-hover:text-text-secondary',
                        ].join(' ')}
                      >
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold leading-tight">
                          {section.title}
                        </span>
                        <span className={[
                          'block text-[11px] leading-tight mt-0.5 truncate',
                          isActive ? 'text-accent-lavender/80' : 'text-text-muted',
                        ].join(' ')}>
                          {section.description}
                        </span>
                      </span>
                      <ChevronRight className={[
                        'w-4 h-4 flex-shrink-0 transition-all',
                        isActive ? 'text-accent-lavender opacity-100' : 'text-text-muted opacity-0 group-hover:opacity-100',
                      ].join(' ')} />
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-lavender/25 to-purple-500/15 border border-accent-lavender/25 flex items-center justify-center">
                    <Sliders className="w-5 h-5 text-accent-lavender" />
                  </div>
                  <div>
                    <CardTitle className="text-base">General Settings</CardTitle>
                    <CardDescription>Default behaviour and preferences for all tools</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Select
                    label="Default session duration"
                    value={defaultDuration}
                    onChange={(v) => setDefaultDuration(v)}
                    options={[
                      { value: '3', label: '3 minutes (Quick)' },
                      { value: '5', label: '5 minutes' },
                      { value: '10', label: '10 minutes' },
                      { value: '15', label: '15 minutes (Long)' },
                    ]}
                  />
                  <Select
                    label="Default breathing pattern"
                    value={defaultBreathing}
                    onChange={(v) => setDefaultBreathing(v)}
                    options={[
                      { value: '4-7-8', label: '4-7-8 (Calm)' },
                      { value: 'box', label: 'Box Breathing (Focus)' },
                      { value: 'equal', label: 'Equal Breathing (Balance)' },
                      { value: 'coherent', label: 'Coherent 5.5 (HRV)' },
                    ]}
                  />
                  <Input
                    label="Default reminder time (daily check-in)"
                    type="time"
                    defaultValue="09:00"
                  />
                </div>
                <div className="h-px bg-surface-border -mx-6" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Auto-advance steps</p>
                      <p className="text-xs text-text-muted mt-0.5">Move to next step automatically after duration</p>
                    </div>
                    <Toggle checked={autoAdvance} onChange={setAutoAdvance} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">AI analysis enabled</p>
                      <p className="text-xs text-text-muted mt-0.5">Allow pattern recognition and personalised suggestions</p>
                    </div>
                    <Toggle checked={aiEnabled} onChange={setAiEnabled} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'audio' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan/25 to-sky-500/15 border border-accent-cyan/25 flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-accent-cyan" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Audio &amp; Sound</CardTitle>
                    <CardDescription>Default sounds, volume levels, and playback options</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Input
                    label="Default volume"
                    type="number"
                    min="0"
                    max="100"
                    value={defaultVolume}
                    onChange={(e) => setDefaultVolume(e.target.value)}
                    rightIcon={<span className="text-xs font-medium text-text-muted pr-1">{defaultVolume}%</span>}
                  />
                  <Select
                    label="Default ambient sound"
                    placeholder="Select a sound"
                    options={[
                      { value: 'none', label: 'No sound' },
                      { value: 'rain', label: 'Rain' },
                      { value: 'ocean', label: 'Ocean waves' },
                      { value: 'forest', label: 'Forest ambience' },
                      { value: 'white-noise', label: 'White noise' },
                      { value: 'brown-noise', label: 'Brown noise' },
                      { value: 'piano', label: 'Soft piano' },
                    ]}
                  />
                </div>
                <div className="h-px bg-surface-border -mx-6" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Sound enabled by default</p>
                      <p className="text-xs text-text-muted mt-0.5">Sound plays automatically when opening calm tools</p>
                    </div>
                    <Toggle checked={soundEnabled} onChange={setSoundEnabled} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Fade audio transitions</p>
                      <p className="text-xs text-text-muted mt-0.5">Smooth 2-second crossfade when changing sounds</p>
                    </div>
                    <Toggle checked={true} onChange={() => {}} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-amber/25 to-orange-500/15 border border-accent-amber/25 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-accent-amber" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Notifications</CardTitle>
                    <CardDescription>Check-in reminders, daily prompts, and review nudges</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Enable notifications</p>
                    <p className="text-xs text-text-muted mt-0.5">Turn off to silence all reminders and prompts</p>
                  </div>
                  <Toggle checked={notificationsEnabled} onChange={setNotificationsEnabled} />
                </div>
                <div className="h-px bg-surface-border -mx-6" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Daily mood check-in</p>
                      <p className="text-xs text-text-muted mt-0.5">Gentle reminder to log your mood once per day</p>
                    </div>
                    <Toggle checked={dailyReminder} onChange={setDailyReminder} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Weekly review prompt</p>
                      <p className="text-xs text-text-muted mt-0.5">Sunday evening summary with progress & insights</p>
                    </div>
                    <Toggle checked={weeklyReview} onChange={setWeeklyReview} />
                  </div>
                </div>
                <div className="h-px bg-surface-border -mx-6" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Quiet hours</p>
                      <p className="text-xs text-text-muted mt-0.5">No notifications during this window</p>
                    </div>
                    <Toggle checked={true} onChange={() => {}} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Start"
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                    />
                    <Input
                      label="End"
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-lavender/25 to-accent-cyan/15 border border-surface-border flex items-center justify-center">
                    <Palette className="w-5 h-5 text-accent-lavender" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Appearance</CardTitle>
                    <CardDescription>Theme, motion, and visual density preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isActive = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={[
                            'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-accent-lavender/40',
                            isActive
                              ? 'border-accent-lavender/40 bg-accent-lavender/10 text-accent-lavender'
                              : 'border-surface-border bg-surface/40 text-text-secondary hover:bg-surface-hover/60 hover:text-text-primary',
                          ].join(' ')}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-semibold">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="h-px bg-surface-border -mx-6" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Reduced motion</p>
                      <p className="text-xs text-text-muted mt-0.5">Minimise animations and transitions</p>
                    </div>
                    <Toggle checked={reducedMotion} onChange={setReducedMotion} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">High contrast text</p>
                      <p className="text-xs text-text-muted mt-0.5">Increase text contrast for better readability</p>
                    </div>
                    <Toggle checked={false} onChange={() => {}} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green/25 to-emerald-500/15 border border-accent-green/25 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-accent-green" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Privacy &amp; Safety</CardTitle>
                    <CardDescription>Data handling, AI permissions, and emergency safety options</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Local storage encryption</p>
                      <p className="text-xs text-text-muted mt-0.5">All stored data is encrypted on your device</p>
                    </div>
                    <Toggle checked={storageEncrypted} onChange={setStorageEncrypted} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">AI processing consent</p>
                      <p className="text-xs text-text-muted mt-0.5">Allow on-device AI analysis of your entries</p>
                    </div>
                    <Toggle checked={aiEnabled} onChange={setAiEnabled} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Safety pattern detection</p>
                      <p className="text-xs text-text-muted mt-0.5">Proactive alerts for concerning patterns</p>
                    </div>
                    <Toggle checked={true} onChange={() => {}} />
                  </div>
                </div>
                <div className="h-px bg-surface-border -mx-6" />
                <div className="rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-4 space-y-3">
                  <p className="text-sm font-semibold text-text-primary">Safety options</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button variant="secondary" size="sm" className="justify-start">
                      <Shield className="w-4 h-4" />
                      Crisis Resources
                    </Button>
                    <Button variant="secondary" size="sm" className="justify-start">
                      <Activity className="w-4 h-4" />
                      Safety Plan Builder
                    </Button>
                  </div>
                </div>
                <div className="h-px bg-surface-border -mx-6" />
                <div className="rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-4 space-y-3">
                  <p className="text-sm font-semibold text-text-primary">Data management</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button variant="secondary" size="sm" className="justify-start">
                      <Wind className="w-4 h-4" />
                      Export all data
                    </Button>
                    <Button variant="danger" size="sm" className="justify-start">
                      Delete all my data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
