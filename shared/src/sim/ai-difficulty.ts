import {
  AI_DECISION_INTERVAL_MULTIPLIER,
  AI_DECISION_INTERVAL_MULTIPLIER_BRUTAL,
} from './balance-constants'

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

// PHASE 17.B.4 — decision intervals scaled by the saga multiplier so non-brutal AI think
// 2.5× slower across a 10-24h match. Brutal stays unmultiplied (×1.0) — its identity is
// "instant decisions"; diluting it would make Brutal stop being brutal.
const SAGA = (raw: number): number => Math.max(1, Math.round(raw * AI_DECISION_INTERVAL_MULTIPLIER))
const SAGA_BRUTAL = (raw: number): number =>
  Math.max(1, Math.round(raw * AI_DECISION_INTERVAL_MULTIPLIER_BRUTAL))

// PHASE 17.L.H — lethality balance pass. Per user verbatim 2026-05-10 + the
// match-length-10-to-24-hour-saga memory: "Easy AI must never win in 3 minutes. Brutal AI =
// lethal." The pre-17.H values still let Easy AI win shorter matches because the suboptimal
// probability + research/build penalties + lethal multiplier didn't go far enough. This pass
// stretches the difficulty curve wider in both directions so each tier feels distinct in a
// 10+ hour playtest.
export const AI_DIFFICULTY_CONFIGS: Readonly<Record<AIDifficultyLevel, AIDifficultyConfig>> = {
  easy: {
    level: 'easy',
    name: 'Easy',
    emoji: '🌱',
    description: 'harmless sparring partner — slow, sloppy, half-lethal',
    // Slower decisions (SAGA(12) × 1.2 widened → ~36 ticks/decision at default)
    decisionIntervalTicks: SAGA(15),
    // Smaller resource cushion so Easy stalls more in mid-game
    resourceCushionMultiplier: 0.5,
    // Worse targeting + half-lethal payloads
    targetingAccuracyBonus: -0.3,
    themeBiasLethalMultiplier: 0.5,
    fogOfWarPenetration: 0,
    // Strongly slowed research + build so Easy can't race the apex tech path
    researchSpeedBonus: -0.4,
    buildSpeedBonus: -0.3,
    campaignDiscount: 0,
    // High suboptimal probability so Easy frequently picks wrong moves
    suboptimalChoiceProbability: 0.6,
  },
  medium: {
    level: 'medium',
    name: 'Medium',
    emoji: '⚖️',
    description: 'balanced — a real opponent at marathon length',
    decisionIntervalTicks: SAGA(8),
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
    description: 'faster decisions, optimized targeting, lethal at endgame',
    decisionIntervalTicks: SAGA(4),
    resourceCushionMultiplier: 1.4,
    targetingAccuracyBonus: 0.2,
    themeBiasLethalMultiplier: 1.4,
    fogOfWarPenetration: 0,
    researchSpeedBonus: 0.3,
    buildSpeedBonus: 0.2,
    campaignDiscount: 0.2,
    suboptimalChoiceProbability: 0.05,
  },
  brutal: {
    level: 'brutal',
    name: 'Brutal',
    emoji: '💀',
    description:
      'instant decisions, perfect targeting, lethal payloads, fog-piercing — e.g., Brutal Surveillance always knows your plans',
    decisionIntervalTicks: SAGA_BRUTAL(1),
    // 2× the resource ceiling — Brutal stockpiles for sustained barrages
    resourceCushionMultiplier: 2.0,
    targetingAccuracyBonus: 0.45,
    // Lethal multiplier from 1.8 → 2.2 so every Brutal payload bites
    themeBiasLethalMultiplier: 2.2,
    fogOfWarPenetration: 1,
    // Research + build bonuses pushed +0.45/+0.35 → +0.6/+0.5
    researchSpeedBonus: 0.6,
    buildSpeedBonus: 0.5,
    campaignDiscount: 0.5,
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
