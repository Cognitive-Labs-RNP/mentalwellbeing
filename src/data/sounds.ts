import type { Sound, SoundCategory } from '../types';

/**
 * Complete sound library.
 * Components should import from here rather than hardcoding sound metadata.
 * The `file` paths reference static assets under /public/sounds/.
 * The `recommendedFor` array lists conditionIds that benefit from this sound.
 */
export const SOUNDS: Sound[] = [
  {
    id: 'rain',
    name: 'Gentle Rain',
    category: 'nature',
    file: '/sounds/rain.mp3',
    description: 'Soft rainfall — calming, masks distractions, ideal for winding down.',
    loopable: true,
    recommendedFor: ['anxiety', 'burnout', 'ptsd', 'depressive-symptoms', 'cognitive-overload'],
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    category: 'nature',
    file: '/sounds/ocean.mp3',
    description: 'Rhythmic ocean surf — naturally paced to slow breathing and calm the nervous system.',
    loopable: true,
    recommendedFor: ['anxiety', 'ptsd', 'anger-irritation', 'substance-related'],
  },
  {
    id: 'forest',
    name: 'Forest Ambience',
    category: 'nature',
    file: '/sounds/forest.mp3',
    description: 'Dense woodland soundscape with birdsong and rustling leaves.',
    loopable: true,
    recommendedFor: ['burnout', 'anxiety', 'anger-irritation', 'depressive-symptoms'],
  },
  {
    id: 'river',
    name: 'River Stream',
    category: 'nature',
    file: '/sounds/river.mp3',
    description: 'Flowing stream over rocks — gentle, continuous, grounding.',
    loopable: true,
    recommendedFor: ['ocd', 'cognitive-overload', 'ptsd'],
  },
  {
    id: 'wind',
    name: 'Gentle Wind',
    category: 'nature',
    file: '/sounds/wind.mp3',
    description: 'Soft breeze through trees — airy and spacious.',
    loopable: true,
    recommendedFor: ['anger-irritation', 'burnout'],
  },
  {
    id: 'fireplace',
    name: 'Crackling Fireplace',
    category: 'nature',
    file: '/sounds/fireplace.mp3',
    description: 'Warm, crackling fire — cosy and soothing for cold or low-energy moments.',
    loopable: true,
    recommendedFor: ['ptsd', 'depressive-symptoms', 'social-detachment'],
  },
  {
    id: 'birds',
    name: 'Morning Birdsong',
    category: 'nature',
    file: '/sounds/birds.mp3',
    description: 'Uplifting birdsong — gentle activation, mood-lifting, connected to nature.',
    loopable: true,
    recommendedFor: ['depressive-symptoms', 'social-detachment', 'self-esteem'],
  },
  {
    id: 'brown-noise',
    name: 'Brown Noise',
    category: 'noise',
    file: '/sounds/brown-noise.mp3',
    description: 'Deeper, warmer than white noise — reduces hyperarousal, supports sustained focus.',
    loopable: true,
    recommendedFor: ['adhd', 'anxiety', 'ocd', 'cognitive-overload'],
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    category: 'noise',
    file: '/sounds/white-noise.mp3',
    description: 'Flat spectrum noise — masks environmental distractions, aids focus and sleep.',
    loopable: true,
    recommendedFor: ['adhd', 'cognitive-overload'],
  },
  {
    id: 'ambient',
    name: 'Ambient Meditation',
    category: 'ambient',
    file: '/sounds/ambient.mp3',
    description: 'Spacious, atmospheric pads — ideal backdrop for meditation and reflection.',
    loopable: true,
    recommendedFor: [
      'ocd',
      'burnout',
      'depressive-symptoms',
      'social-detachment',
      'substance-related',
    ],
  },
  {
    id: 'singing-bowl',
    name: 'Singing Bowl',
    category: 'ambient',
    file: '/sounds/singing-bowl.mp3',
    description: 'Tibetan singing bowl tones — grounding, centering, deeply calming.',
    loopable: true,
    recommendedFor: ['ptsd', 'self-esteem', 'depressive-symptoms', 'social-detachment'],
  },
];

/** All unique sound categories present in the library. */
export const SOUND_CATEGORIES: SoundCategory[] = [
  'nature',
  'noise',
  'ambient',
];

/** Look up a single sound by its id. Returns undefined if not found. */
export function getSoundById(id: string): Sound | undefined {
  return SOUNDS.find((s) => s.id === id);
}

/** Get all sounds recommended for a given conditionId. */
export function getSoundsForCondition(conditionId: string): Sound[] {
  return SOUNDS.filter((s) => s.recommendedFor.includes(conditionId));
}

/** Get all sounds in a given category. */
export function getSoundsByCategory(category: SoundCategory): Sound[] {
  return SOUNDS.filter((s) => s.category === category);
}

/** Resolve an array of sound IDs (from a condition JSON) to Sound objects. */
export function resolveSoundIds(ids: string[]): Sound[] {
  return ids.flatMap((id) => {
    const sound = getSoundById(id);
    return sound ? [sound] : [];
  });
}
