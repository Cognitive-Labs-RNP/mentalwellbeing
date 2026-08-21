import type { Sound, SoundCategory, ConditionId } from '../types';

export const SOUND_CATEGORIES: SoundCategory[] = ['nature', 'noise', 'ambient'];

export const SOUNDS: Sound[] = [
  {
    id: 'ocean',
    name: 'Ocean Waves',
    category: 'nature',
    file: '/sounds/ocean.mp3',
    description: 'Rhythmic, gentle waves rolling onto a peaceful shoreline for calm & relaxation.',
    loopable: true,
    recommendedFor: ['anxiety', 'ocd', 'ptsd', 'burnout', 'anger-irritation', 'self-esteem', 'substance-related'],
  },
  {
    id: 'rain',
    name: 'Soft Rainfall',
    category: 'nature',
    file: '/sounds/rain.mp3',
    description: 'Steady, gentle rainfall creating a soothing background curtain of sound.',
    loopable: true,
    recommendedFor: ['anxiety', 'ocd', 'depressive-symptoms', 'ptsd', 'cognitive-overload', 'burnout', 'anger-irritation', 'social-detachment', 'substance-related'],
  },
  {
    id: 'brown-noise',
    name: 'Deep Brown Noise',
    category: 'noise',
    file: '/sounds/brown-noise.mp3',
    description: 'Deeper, lower-frequency noise ideal for masking ambient distractions and enhancing focus.',
    loopable: true,
    recommendedFor: ['adhd', 'cognitive-overload'],
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    category: 'noise',
    file: '/sounds/white-noise.mp3',
    description: 'Consistent neutral frequency sound ideal for quiet concentration and isolation.',
    loopable: true,
    recommendedFor: ['adhd', 'cognitive-overload'],
  },
  {
    id: 'ambient',
    name: 'Calm Ambient Pads',
    category: 'ambient',
    file: '/sounds/ambient.mp3',
    description: 'Soft synth pads and tranquil resonance for quiet meditation and settling thoughts.',
    loopable: true,
    recommendedFor: ['anxiety', 'ocd', 'depressive-symptoms', 'anger-irritation', 'social-detachment', 'self-esteem', 'substance-related'],
  },
  {
    id: 'forest',
    name: 'Forest Canopy',
    category: 'nature',
    file: '/sounds/forest.mp3',
    description: 'Gentle rustling leaves and distant woodland atmosphere.',
    loopable: true,
    recommendedFor: ['depressive-symptoms', 'ptsd', 'burnout', 'social-detachment', 'self-esteem'],
  },
  {
    id: 'river',
    name: 'Flowing River',
    category: 'nature',
    file: '/sounds/river.mp3',
    description: 'Clean mountain stream water flowing continuously over polished stones.',
    loopable: true,
    recommendedFor: ['anxiety', 'ptsd', 'burnout'],
  },
  {
    id: 'birds',
    name: 'Morning Birds',
    category: 'nature',
    file: '/sounds/birds.mp3',
    description: 'Light morning bird song creating an uplifting natural setting.',
    loopable: true,
    recommendedFor: ['depressive-symptoms', 'social-detachment'],
  },
  {
    id: 'fireplace',
    name: 'Cozy Fireplace',
    category: 'nature',
    file: '/sounds/fireplace.mp3',
    description: 'Warm crackling wood fire ambiance for comfort and warmth.',
    loopable: true,
    recommendedFor: ['depressive-symptoms', 'self-esteem'],
  },
  {
    id: 'singing-bowl',
    name: 'Singing Bowl Resonator',
    category: 'ambient',
    file: '/sounds/singing-bowl.mp3',
    description: 'Resonant Tibetan singing bowl vibrations for centering and grounding.',
    loopable: true,
    recommendedFor: ['ocd', 'ptsd', 'cognitive-overload'],
  },
  {
    id: 'wind',
    name: 'Gentle Breeze',
    category: 'nature',
    file: '/sounds/wind.mp3',
    description: 'Soft mountain breeze whispering through distant pines.',
    loopable: true,
    recommendedFor: ['anxiety', 'burnout'],
  },
];

export function getSoundsForCondition(conditionId: string): Sound[] {
  const normalizedId = conditionId.toLowerCase() as ConditionId;
  return SOUNDS.filter((sound) => sound.recommendedFor.includes(normalizedId));
}

export function getSoundById(soundId: string): Sound | undefined {
  return SOUNDS.find((sound) => sound.id === soundId);
}
