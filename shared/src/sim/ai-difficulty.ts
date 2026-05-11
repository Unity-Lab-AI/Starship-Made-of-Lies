export type AIDifficultyLevel = 'easy' | 'medium' | 'hard' | 'brutal'

export interface AIDifficultyConfig {
  readonly level: AIDifficultyLevel
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly decisionIntervalTicks: number
  readonly resourceCushionMultiplier: number
  readonly targetingAccuracyBonus: number
  readonly themeBiasLethalMultiplier: number
  readonly fogOfWarPenetration: number
  readonly researchSpeedBonus: number
  readonly buildSpeedBonus: number
  readonly campaignDiscount: number
  readonly suboptimalChoiceProbability: number
}

export const AI_DIFFICULTY_CONFIGS: Readonly<Record<AIDifficultyLevel, AIDifficultyConfig>> = {
  easy: {
    level: 'easy',
    name: 'Easy',
    emoji: '🌱',
    description: 'slower decisions, smaller resource cushion, suboptimal targeting',
    decisionIntervalTicks: 12,
    resourceCushionMultiplier: 0.7,
    targetingAccuracyBonus: -0.15,
    themeBiasLethalMultiplier: 0.8,
    fogOfWarPenetration: 0,
    researchSpeedBonus: -0.2,
    buildSpeedBonus: -0.15,
    campaignDiscount: 0,
    suboptimalChoiceProbability: 0.4,
  },
  medium: {
    level: 'medium',
    name: 'Medium',
    emoji: '⚖️',
    description: 'balanced',
    decisionIntervalTicks: 8,
    resourceCushionMultiplier: 1.0,
    targetingAccuracyBonus: 0,
    themeBiasLethalMultiplier: 1.0,
    fogOfWarPenetration: 0,
    researchSpeedBonus: 0,
    buildSpeedBonus: 0,
    campaignDiscount: 0,
    suboptimalChoiceProbability: 0.15,
  },
  hard: {
    level: 'hard',
    name: 'Hard',
    emoji: '🔥',
    description: 'faster decisions, optimized targeting',
    decisionIntervalTicks: 4,
    resourceCushionMultiplier: 1.25,
    targetingAccuracyBonus: 0.15,
    themeBiasLethalMultiplier: 1.3,
    fogOfWarPenetration: 0,
    researchSpeedBonus: 0.2,
    buildSpeedBonus: 0.15,
    campaignDiscount: 0.15,
    suboptimalChoiceProbability: 0.05,
  },
  brutal: {
    level: 'brutal',
    name: 'Brutal',
    emoji: '💀',
    description:
      'instant decisions, perfect targeting, theme-bias lethal — e.g., Brutal Surveillance always knows your plans',
    decisionIntervalTicks: 1,
    resourceCushionMultiplier: 1.6,
    targetingAccuracyBonus: 0.35,
    themeBiasLethalMultiplier: 1.8,
    fogOfWarPenetration: 1,
    researchSpeedBonus: 0.45,
    buildSpeedBonus: 0.35,
    campaignDiscount: 0.4,
    suboptimalChoiceProbability: 0,
  },
}

export function getAIDifficultyConfig(level: AIDifficultyLevel): AIDifficultyConfig {
  return AI_DIFFICULTY_CONFIGS[level]
}

export const AI_DIFFICULTY_LEVELS: ReadonlyArray<AIDifficultyLevel> = [
  'easy',
  'medium',
  'hard',
  'brutal',
]

export function shouldDecideThisTick(
  config: AIDifficultyConfig,
  currentTick: number,
  civDecisionOffset: number,
): boolean {
  if (config.decisionIntervalTicks <= 1) return true
  return (currentTick + civDecisionOffset) % config.decisionIntervalTicks === 0
}

export function rollSuboptimalChoice(config: AIDifficultyConfig, rng: () => number): boolean {
  if (config.suboptimalChoiceProbability <= 0) return false
  return rng() < config.suboptimalChoiceProbability
}
