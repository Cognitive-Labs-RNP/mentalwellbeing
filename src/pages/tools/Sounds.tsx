import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Music, Clock, History, Sparkles, Check, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { SOUNDS } from '@/data/sounds';
import { useAppStore } from '@/store';
import { saveCalmSessionRecord, fetchToolHistory, SavedToolRecord } from '@/services/toolService';
import type { SoundCategory } from '@/types';

const CATEGORY_TABS: { label: string; key: SoundCategory | 'all' }[] = [
  { label: 'All Soundscapes', key: 'all' },
  { label: 'Nature & Water', key: 'nature' },
  { label: 'Focus & Noise', key: 'noise' },
  { label: 'Ambient & Relax', key: 'ambient' },
];

const TIMER_PRESETS = [
  { label: '5 min', mins: 5 },
  { label: '10 min', mins: 10 },
  { label: '15 min', mins: 15 },
  { label: '30 min', mins: 30 },
  { label: 'Continuous', mins: 0 },
];

export default function ToolsSounds() {
  const session = useAppStore((s) => s.session);
  const recordCalmSessionStore = useAppStore((s) => s.recordCalmSession);

  const [activeCategory, setActiveCategory] = useState<SoundCategory | 'all'>('all');
  const [selectedSoundId, setSelectedSoundId] = useState<string>('ocean');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(0.7);
  const [timerMins, setTimerMins] = useState<number>(10);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<SavedToolRecord[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const sessionLoggedRef = useRef(false);

  const userId = session?.userId ?? 'demo-user-id';
  const selectedSound = SOUNDS.find((s) => s.id === selectedSoundId) ?? SOUNDS[0];

  useEffect(() => {
    fetchToolHistory(userId, 'calm_session').then(setHistory);
  }, [userId, saveSuccess]);

  // Handle Audio Instance
  useEffect(() => {
    const audio = new Audio(selectedSound.file);
    audio.loop = selectedSound.loopable;
    audio.volume = volume;
    audioRef.current = audio;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [selectedSoundId]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Timer Countdown Logic
  useEffect(() => {
    if (!isPlaying || timerMins === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleSessionComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timerMins]);

  const handleSelectTimer = (mins: number) => {
    setTimerMins(mins);
    setSecondsRemaining(mins * 60);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      startTimeRef.current = Date.now();
      sessionLoggedRef.current = false;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleStop = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    await handleSessionComplete(false);
  };

  const handleSessionComplete = async (completed: boolean) => {
    if (sessionLoggedRef.current) return;
    sessionLoggedRef.current = true;

    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const durationMinutes = Number((elapsedSeconds / 60).toFixed(1));

    // Store in Zustand
    recordCalmSessionStore({
      id: `sound-${Date.now()}`,
      soundId: selectedSound.id,
      startedAt: new Date(startTimeRef.current).toISOString(),
      durationMinutes,
      technique: completed ? 'Sound library completed' : 'Sound library stopped',
    });

    // Sync to Supabase
    await saveCalmSessionRecord(userId, selectedSound.id, selectedSound.name, durationMinutes, completed);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const filteredSounds = activeCategory === 'all'
    ? SOUNDS
    : SOUNDS.filter((s) => s.category === activeCategory);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
          <Music className="w-6 h-6 text-accent-lavender" strokeWidth={2} />
          Global Sound Library
        </h2>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          Calming ambient soundscapes for focus, relaxation, meditation, and sleep hygiene.
        </p>
      </div>

      {/* Active Audio Player Card */}
      <Card className="overflow-hidden border-accent-lavender/30 bg-gradient-to-br from-accent-lavender/10 via-surface/80 to-accent-cyan/10 shadow-glass">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag variant="lavender" size="sm" className="capitalize">
                  {selectedSound.category}
                </Tag>
                {isPlaying && (
                  <span className="flex items-center gap-1.5 text-xs text-accent-green font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-accent-green" />
                    Now Playing
                  </span>
                )}
              </div>
              <h3 className="font-display text-2xl font-bold text-text-primary">
                {selectedSound.name}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
                {selectedSound.description}
              </p>
            </div>

            {/* Play/Pause & Stop Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-lavender to-purple-600 text-white flex items-center justify-center shadow-glow hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 translate-x-0.5" />}
              </button>

              {isPlaying && (
                <button
                  type="button"
                  onClick={handleStop}
                  className="w-12 h-12 rounded-xl bg-surface-hover border border-surface-border text-text-secondary hover:text-accent-rose flex items-center justify-center transition-colors"
                  title="Stop session and save log"
                >
                  <Square className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Volume & Timer Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-surface-border/60">
            {/* Volume Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
                <span className="flex items-center gap-1.5">
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-accent-lavender" />}
                  Volume
                </span>
                <span className="tabular-nums">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-surface-border rounded-lg appearance-none cursor-pointer accent-accent-lavender"
              />
            </div>

            {/* Timer Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-accent-cyan" />
                  Session Duration Timer
                </span>
                {timerMins > 0 && isPlaying && (
                  <span className="font-mono text-accent-cyan font-bold tabular-nums">
                    {formatTimer(secondsRemaining)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {TIMER_PRESETS.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => handleSelectTimer(t.mins)}
                    className={[
                      'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border',
                      timerMins === t.mins
                        ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan'
                        : 'bg-surface-hover/40 border-surface-border text-text-secondary hover:text-text-primary',
                    ].join(' ')}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className={[
              'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
              activeCategory === tab.key
                ? 'bg-accent-lavender/20 border-accent-lavender text-accent-lavender'
                : 'bg-surface/60 border-surface-border text-text-secondary hover:bg-surface-hover',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sound Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredSounds.map((sound) => {
          const isSelected = sound.id === selectedSoundId;
          return (
            <div
              key={sound.id}
              onClick={() => {
                setSelectedSoundId(sound.id);
                sessionLoggedRef.current = false;
                startTimeRef.current = Date.now();
                setIsPlaying(true);
              }}
              className={[
                'p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative overflow-hidden group',
                isSelected
                  ? 'bg-accent-lavender/15 border-accent-lavender shadow-glow'
                  : 'bg-surface/80 border-surface-border hover:bg-surface-hover hover:border-accent-lavender/40',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <Tag variant={sound.category === 'nature' ? 'green' : sound.category === 'noise' ? 'amber' : 'lavender'} size="sm">
                  {sound.name}
                </Tag>
                <div className="w-8 h-8 rounded-xl bg-surface-hover border border-surface-border flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isSelected && isPlaying ? (
                    <Pause className="w-4 h-4 text-accent-lavender" />
                  ) : (
                    <Play className="w-4 h-4 text-text-secondary group-hover:text-accent-lavender translate-x-0.5" />
                  )}
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                {sound.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* History Log */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="w-4.5 h-4.5 text-accent-lavender" />
              <CardTitle className="text-base">Calm & Sound Session History</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((rec) => {
              const meta = rec.metadata as { sound_title?: string; completed?: boolean };
              return (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-surface-hover/30 border border-surface-border flex items-start justify-between gap-4 flex-wrap"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Tag variant="lavender" size="sm">
                        {meta.sound_title ?? 'Soundscape'}
                      </Tag>
                      <Tag variant={meta.completed ? 'green' : 'cyan'} size="sm">
                        {rec.value} mins ({meta.completed ? 'Completed' : 'Stopped'})
                      </Tag>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-text-muted">
                    {new Date(rec.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
