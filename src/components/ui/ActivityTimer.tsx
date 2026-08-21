import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { Button } from './Button';
import { getSoundById } from '@/data/sounds';

interface ActivityTimerProps {
  durationSeconds: number;
  title: string;
  instructions?: string[];
  recommendedSoundId?: string;
  isBreathing?: boolean;
  onComplete?: () => void;
  completed?: boolean;
  className?: string;
}

export function ActivityTimer({
  durationSeconds,
  title,
  instructions,
  recommendedSoundId,
  isBreathing = false,
  onComplete,
  completed = false,
  className = '',
}: ActivityTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(completed);

  // Breathing animation phase state (Inhale 4s, Hold 4s, Exhale 6s)
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [phaseSeconds, setPhaseSeconds] = useState(4);

  // Audio player state
  const soundObj = recommendedSoundId ? getSoundById(recommendedSoundId) : undefined;
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element if recommended sound exists
  useEffect(() => {
    if (!soundObj) return;
    const audio = new Audio(soundObj.file);
    audio.loop = true;
    audio.volume = isMuted ? 0 : 0.6;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [soundObj, isMuted]);

  // Audio play/pause effect
  useEffect(() => {
    if (!audioRef.current) return;
    if (isSoundPlaying && isActive) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isSoundPlaying, isActive]);

  // Timer countdown tick
  useEffect(() => {
    let interval: number | null = null;
    if (isActive && remaining > 0) {
      interval = window.setInterval(() => {
        setRemaining((prev) => prev - 1);
      }, 1000);
    } else if (remaining === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      if (audioRef.current) audioRef.current.pause();
      setIsSoundPlaying(false);
      onComplete?.();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, remaining, onComplete]);

  // Breathing cycle phase tick
  useEffect(() => {
    if (!isBreathing || !isActive) return;
    const interval = setInterval(() => {
      setPhaseSeconds((prev) => {
        if (prev <= 1) {
          if (breathingPhase === 'Inhale') {
            setBreathingPhase('Hold');
            return 4;
          } else if (breathingPhase === 'Hold') {
            setBreathingPhase('Exhale');
            return 6;
          } else {
            setBreathingPhase('Inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isBreathing, isActive, breathingPhase]);

  const handleStart = () => {
    if (isFinished) {
      setRemaining(durationSeconds);
      setIsFinished(false);
    }
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setRemaining(durationSeconds);
    setIsFinished(false);
    setBreathingPhase('Inhale');
    setPhaseSeconds(4);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSoundPlaying(false);
  };

  const handleMarkComplete = () => {
    setIsActive(false);
    setRemaining(0);
    setIsFinished(true);
    if (audioRef.current) audioRef.current.pause();
    setIsSoundPlaying(false);
    onComplete?.();
  };

  const toggleSound = () => {
    setIsSoundPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = durationSeconds > 0 ? ((durationSeconds - remaining) / durationSeconds) * 100 : 0;

  return (
    <div className={`p-6 rounded-2xl bg-surface/80 border border-surface-border/80 backdrop-blur-xl shadow-glass space-y-6 ${className}`}>
      {/* Title & Status */}
      <div className="flex items-center justify-between gap-4">
        <h4 className="font-display text-lg font-semibold text-text-primary flex items-center gap-2">
          {title}
          {isFinished && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-accent-green/20 text-accent-green font-medium border border-accent-green/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          )}
        </h4>

        {/* Optional Sound Controls */}
        {soundObj && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                isSoundPlaying
                  ? 'bg-accent-cyan/25 border-accent-cyan/40 text-accent-cyan shadow-glow'
                  : 'bg-surface-hover/50 border-surface-border text-text-muted hover:text-text-primary'
              }`}
              title={`Toggle ${soundObj.name}`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSoundPlaying ? 'animate-pulse' : ''}`} />
              <span>{soundObj.name}</span>
            </button>

            {isSoundPlaying && (
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-xl bg-surface-hover/60 text-text-muted hover:text-text-primary border border-surface-border"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Breathing Ring or Timer Display */}
      <div className="flex flex-col items-center justify-center py-4">
        {isBreathing ? (
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Animated breathing circle */}
            <div
              className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ${
                breathingPhase === 'Inhale'
                  ? 'scale-110 border-accent-cyan bg-accent-cyan/15 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                  : breathingPhase === 'Hold'
                  ? 'scale-105 border-accent-lavender bg-accent-lavender/15 shadow-[0_0_30px_rgba(167,139,250,0.3)]'
                  : 'scale-90 border-purple-400 bg-purple-500/10 shadow-none'
              }`}
            />
            <div className="relative text-center z-10 space-y-1">
              <span className="text-3xl font-bold font-display tabular-nums text-text-primary">
                {formatMMSS(remaining)}
              </span>
              <p className="text-sm font-semibold text-accent-lavender uppercase tracking-wider">
                {isActive ? breathingPhase : 'Ready'}
              </p>
              {isActive && (
                <p className="text-xs text-text-muted tabular-nums">{phaseSeconds}s</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="text-4xl md:text-5xl font-extrabold font-display tabular-nums tracking-tight text-text-primary">
              {formatMMSS(remaining)}
            </div>
            <p className="text-xs text-text-muted">
              {isActive ? 'Session in progress' : isFinished ? 'Session completed' : 'Ready to start'}
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-surface-hover/60 rounded-full overflow-hidden border border-surface-border/60">
        <div
          className={`h-full transition-all duration-500 ${
            isFinished
              ? 'bg-gradient-to-r from-accent-green to-emerald-400'
              : 'bg-gradient-to-r from-accent-lavender to-accent-cyan'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Instructions list if provided */}
      {instructions && instructions.length > 0 && (
        <div className="space-y-2 bg-bg-primary/40 p-4 rounded-xl border border-surface-border/60">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Instructions</p>
          <ul className="space-y-1.5 text-sm text-text-secondary">
            {instructions.map((inst, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-accent-lavender/15 text-accent-lavender text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{inst}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {!isActive ? (
            <Button size="md" variant="primary" onClick={handleStart}>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              {remaining < durationSeconds && !isFinished ? 'Resume' : 'Start'}
            </Button>
          ) : (
            <Button size="md" variant="secondary" onClick={handlePause}>
              <Pause className="w-4 h-4 fill-current" />
              Pause
            </Button>
          )}

          <Button size="md" variant="ghost" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {!isFinished && (
          <Button size="md" variant="ghost" className="text-accent-green hover:text-accent-green" onClick={handleMarkComplete}>
            <CheckCircle2 className="w-4 h-4" />
            Mark Complete
          </Button>
        )}
      </div>
    </div>
  );
}
