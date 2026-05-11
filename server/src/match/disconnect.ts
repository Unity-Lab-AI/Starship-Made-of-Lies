import {
  type AIDifficultyLevel,
  type CivId,
  type PlaystyleArchetype,
  aiBiasForTheme,
  getAIDifficultyConfig,
  getPlaystyleProfile,
} from '@smol/shared'
import { AIController } from '../ai/AIController'
import { type MatchState, getPerCiv } from './MatchState'

export interface AITakeoverInputs {
  readonly civId: CivId
  readonly playstyleArchetype: PlaystyleArchetype
  readonly difficulty: AIDifficultyLevel
  readonly decisionOffsetTicks: number
  readonly rngSeed: number
}

export const DEFAULT_DISCONNECT_PLAYSTYLE: PlaystyleArchetype = 'builder'
export const DEFAULT_DISCONNECT_DIFFICULTY: AIDifficultyLevel = 'medium'

export function buildAITakeoverController(
  state: MatchState,
  inputs: AITakeoverInputs,
): AIController | null {
  const perCiv = getPerCiv(state, inputs.civId)
  if (!perCiv) return null
  if (!perCiv.alive) return null
  perCiv.disconnected = true
  perCiv.takenOverByAI = true
  return new AIController({
    civId: inputs.civId,
    empire: perCiv.empire,
    theme: perCiv.theme,
    playstyleArchetype: inputs.playstyleArchetype,
    difficulty: inputs.difficulty,
    decisionOffsetTicks: inputs.decisionOffsetTicks,
    rngSeed: inputs.rngSeed,
  })
}

export function describeAITakeover(controller: AIController): string {
  const profile = getPlaystyleProfile(controller.playstyle.archetype)
  const difficulty = getAIDifficultyConfig(controller.difficultyConfig.level)
  const bias = aiBiasForTheme(controller.theme)
  return [
    `AI took over ${String(controller.civId)}`,
    `${profile.emoji} ${profile.name}`,
    `${difficulty.emoji} ${difficulty.name}`,
    `aggression=${bias.aggression.toFixed(2)}`,
  ].join(' | ')
}

export function returnHumanControl(state: MatchState, civId: CivId): boolean {
  const perCiv = getPerCiv(state, civId)
  if (!perCiv) return false
  perCiv.disconnected = false
  perCiv.takenOverByAI = false
  return true
}
