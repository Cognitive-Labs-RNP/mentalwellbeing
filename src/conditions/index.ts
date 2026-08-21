import type { ConditionConfig, ConditionId } from '@/types';
import anxietyConfig from '@/conditions/anxiety.json';
import adhdConfig from '@/conditions/adhd.json';
import ocdConfig from '@/conditions/ocd.json';
import depressiveConfig from '@/conditions/depressive-symptoms.json';
import ptsdConfig from '@/conditions/ptsd.json';
import cognitiveConfig from '@/conditions/cognitive-overload.json';
import burnoutConfig from '@/conditions/burnout.json';
import angerConfig from '@/conditions/anger-irritation.json';
import socialConfig from '@/conditions/social-detachment.json';
import selfEsteemConfig from '@/conditions/self-esteem.json';
import substanceConfig from '@/conditions/substance-related.json';
import generalConfig from '@/conditions/general-wellbeing.json';

const CONDITION_CONFIGS: Record<string, ConditionConfig> = {
  anxiety: anxietyConfig as unknown as ConditionConfig,
  adhd: adhdConfig as unknown as ConditionConfig,
  ocd: ocdConfig as unknown as ConditionConfig,
  'depressive-symptoms': depressiveConfig as unknown as ConditionConfig,
  ptsd: ptsdConfig as unknown as ConditionConfig,
  'cognitive-overload': cognitiveConfig as unknown as ConditionConfig,
  burnout: burnoutConfig as unknown as ConditionConfig,
  'anger-irritation': angerConfig as unknown as ConditionConfig,
  'social-detachment': socialConfig as unknown as ConditionConfig,
  'self-esteem': selfEsteemConfig as unknown as ConditionConfig,
  'substance-related': substanceConfig as unknown as ConditionConfig,
  'general-wellbeing': generalConfig as unknown as ConditionConfig,
};

/**
 * Get the hardcoded condition configuration for a supported condition ID.
 * Falls back to general-wellbeing if ID is unrecognized.
 */
export function getConditionConfig(conditionId: string): ConditionConfig {
  const normalized = conditionId.toLowerCase();
  return CONDITION_CONFIGS[normalized] ?? CONDITION_CONFIGS['general-wellbeing'];
}

/**
 * List all supported condition configs.
 */
export function getAllConditionConfigs(): ConditionConfig[] {
  return Object.values(CONDITION_CONFIGS);
}
