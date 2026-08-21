/**
 * Sound playback with file-first, Web Audio fallback.
 * Condition workspaces and the global library share this so missing
 * /public/sounds/*.mp3 files still produce a looping ambient texture.
 */

export interface SoundHandle {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (volume01: number) => void;
  destroy: () => void;
}

type NoiseKind =
  | 'white'
  | 'brown'
  | 'rain'
  | 'ocean'
  | 'river'
  | 'wind'
  | 'forest'
  | 'birds'
  | 'fireplace'
  | 'ambient'
  | 'bowl';

function kindForSoundId(soundId: string): NoiseKind {
  switch (soundId) {
    case 'white-noise':
      return 'white';
    case 'brown-noise':
      return 'brown';
    case 'rain':
      return 'rain';
    case 'ocean':
      return 'ocean';
    case 'river':
      return 'river';
    case 'wind':
      return 'wind';
    case 'forest':
      return 'forest';
    case 'birds':
      return 'birds';
    case 'fireplace':
      return 'fireplace';
    case 'singing-bowl':
      return 'bowl';
    default:
      return 'ambient';
  }
}

function fillNoise(data: Float32Array, kind: NoiseKind): void {
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (kind === 'white' || kind === 'birds') {
      data[i] = white * 0.35;
    } else if (kind === 'brown' || kind === 'fireplace') {
      last = (last + 0.02 * white) / 1.02;
      data[i] = Math.max(-1, Math.min(1, last * 3.5));
    } else if (kind === 'rain' || kind === 'river') {
      last = 0.95 * last + 0.05 * white;
      data[i] = last * 0.9;
    } else if (kind === 'ocean') {
      last = 0.98 * last + 0.02 * white;
      const swell = Math.sin(i / 2400) * 0.35 + 0.65;
      data[i] = last * swell;
    } else if (kind === 'wind' || kind === 'forest') {
      last = 0.97 * last + 0.03 * white;
      data[i] = last * 0.7;
    } else {
      last = 0.96 * last + 0.04 * white;
      data[i] = last * 0.45;
    }
  }
}

function createFallbackGraph(
  ctx: AudioContext,
  soundId: string,
  volume01: number
): { gain: GainNode; stop: () => void } {
  const kind = kindForSoundId(soundId);
  const gain = ctx.createGain();
  gain.gain.value = volume01;
  gain.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  if (kind === 'ocean' || kind === 'brown' || kind === 'fireplace') {
    filter.type = 'lowpass';
    filter.frequency.value = kind === 'fireplace' ? 900 : 480;
  } else if (kind === 'rain' || kind === 'white') {
    filter.type = 'highpass';
    filter.frequency.value = kind === 'white' ? 200 : 800;
  } else if (kind === 'wind' || kind === 'forest') {
    filter.type = 'bandpass';
    filter.frequency.value = 420;
    filter.Q.value = 0.6;
  } else if (kind === 'river') {
    filter.type = 'highpass';
    filter.frequency.value = 400;
  } else {
    filter.type = 'lowpass';
    filter.frequency.value = 700;
  }
  filter.connect(gain);

  const seconds = 2.5;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  fillNoise(buffer.getChannelData(0), kind);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(filter);
  source.start();

  const oscillators: OscillatorNode[] = [];
  if (kind === 'ambient' || kind === 'bowl') {
    const freqs = kind === 'bowl' ? [220, 330, 440] : [196, 247, 294];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      oscGain.gain.value = 0.04 + i * 0.01;
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      oscillators.push(osc);
    });
  }

  if (kind === 'birds') {
    const chirp = ctx.createOscillator();
    const chirpGain = ctx.createGain();
    chirp.type = 'sine';
    chirp.frequency.value = 1800;
    chirpGain.gain.value = 0.02;
    chirp.connect(chirpGain);
    chirpGain.connect(gain);
    chirp.start();
    oscillators.push(chirp);
  }

  return {
    gain,
    stop: () => {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
      source.disconnect();
      oscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          /* already stopped */
        }
        osc.disconnect();
      });
      filter.disconnect();
      gain.disconnect();
    },
  };
}

export function createSoundHandle(src: string, soundId: string, loop: boolean): SoundHandle {
  let volume01 = 0.7;
  let usingFallback = false;
  let audio: HTMLAudioElement | null = new Audio(src);
  audio.loop = loop;
  audio.preload = 'none';
  audio.volume = volume01;

  let ctx: AudioContext | null = null;
  let fallbackStop: (() => void) | null = null;
  let fallbackGain: GainNode | null = null;
  let playing = false;
  let destroyed = false;

  const startFallback = async () => {
    usingFallback = true;
    if (audio) {
      audio.pause();
      audio.src = '';
      audio = null;
    }
    if (!ctx) {
      ctx = new AudioContext();
    }
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    if (fallbackStop) {
      fallbackStop();
      fallbackStop = null;
    }
    const graph = createFallbackGraph(ctx, soundId, volume01);
    fallbackGain = graph.gain;
    fallbackStop = graph.stop;
  };

  audio.addEventListener('error', () => {
    if (!destroyed) usingFallback = true;
  });

  return {
    play: async () => {
      if (destroyed) return;
      playing = true;
      if (usingFallback || !audio) {
        await startFallback();
        return;
      }
      try {
        audio.volume = volume01;
        await audio.play();
      } catch {
        await startFallback();
      }
    },
    pause: () => {
      playing = false;
      if (audio && !usingFallback) {
        audio.pause();
      } else if (ctx && ctx.state === 'running') {
        void ctx.suspend();
      }
    },
    stop: () => {
      playing = false;
      if (audio && !usingFallback) {
        audio.pause();
        audio.currentTime = 0;
      } else if (fallbackStop) {
        fallbackStop();
        fallbackStop = null;
        fallbackGain = null;
        if (ctx && ctx.state === 'running') {
          void ctx.suspend();
        }
      }
    },
    setVolume: (v: number) => {
      volume01 = Math.max(0, Math.min(1, v));
      if (audio && !usingFallback) audio.volume = volume01;
      if (fallbackGain) fallbackGain.gain.value = volume01;
    },
    destroy: () => {
      destroyed = true;
      playing = false;
      if (audio) {
        audio.pause();
        audio.src = '';
        audio = null;
      }
      if (fallbackStop) {
        fallbackStop();
        fallbackStop = null;
      }
      if (ctx) {
        void ctx.close();
        ctx = null;
      }
      void playing;
    },
  };
}
