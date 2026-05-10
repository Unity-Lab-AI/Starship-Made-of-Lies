import { type BuildingCategory } from './building'
import { type CampaignArchetype } from './deception'
import { type ColonyShipCategory } from './colony-ship'
import { type TechCategory } from './tech'

export type PlaystyleArchetype = 'builder' | 'warmonger' | 'researcher' | 'trickster'

export type TargetSelectionMode = 'weakest' | 'closest' | 'richest' | 'random' | 'opportunistic'

export interface PlaystyleProfile {
  readonly archetype: PlaystyleArchetype
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly techCategoryPriority: Readonly<Record<TechCategory, number>>
  readonly buildingCategoryPriority: Readonly<Record<BuildingCategory, number>>
  readonly shipCategoryPriority: Readonly<Record<ColonyShipCategory, number>>
  readonly campaignPriority: Readonly<Record<CampaignArchetype, number>>
  readonly attackThresholdAggression: number
  readonly conscriptionTolerance: number
  readonly betrayalProbability: number
  readonly targetSelectionMode: TargetSelectionMode
  readonly suicideShipAffinity: number
  readonly economyFocus: number
}

export const PLAYSTYLE_PROFILES: Readonly<Record<PlaystyleArchetype, PlaystyleProfile>> = {
  builder: {
    archetype: 'builder',
    name: 'Builder',
    emoji: '🏗️',
    description: 'focuses on infrastructure, slow to attack, tech-late, hard to dislodge',
    techCategoryPriority: {
      industrial: 0.9,
      information: 0.5,
      spacefaring: 0.3,
      advanced: 0.6,
      farFuture: 0.4,
      control: 0.4,
      forbidden: 0.2,
    },
    buildingCategoryPriority: {
      food: 0.8,
      extraction: 0.9,
      industry: 0.95,
      research: 0.5,
      housing: 0.85,
      propaganda: 0.4,
      defense: 0.7,
      launch: 0.3,
      utility: 0.7,
    },
    shipCategoryPriority: {
      tier1Innocent: 0.6,
      tier2Discovery: 0.4,
      tier3Aggression: 0.2,
      tier4Eradication: 0.1,
      crossPeaceful: 0.7,
    },
    campaignPriority: {
      newWorldHope: 0.5,
      pioneerDrive: 0.4,
      unityRally: 0.6,
      enemyAtTheGates: 0.3,
      sacrificeForTomorrow: 0.2,
    },
    attackThresholdAggression: 0.2,
    conscriptionTolerance: 0.2,
    betrayalProbability: 0.05,
    targetSelectionMode: 'opportunistic',
    suicideShipAffinity: 0.15,
    economyFocus: 0.95,
  },
  warmonger: {
    archetype: 'warmonger',
    name: 'Warmonger',
    emoji: '⚔️',
    description: 'early aggression, missile spam, sacrifices economy for offense',
    techCategoryPriority: {
      industrial: 0.5,
      information: 0.3,
      spacefaring: 0.9,
      advanced: 0.6,
      farFuture: 0.5,
      control: 0.5,
      forbidden: 0.7,
    },
    buildingCategoryPriority: {
      food: 0.5,
      extraction: 0.6,
      industry: 0.7,
      research: 0.3,
      housing: 0.5,
      propaganda: 0.6,
      defense: 0.5,
      launch: 0.95,
      utility: 0.4,
    },
    shipCategoryPriority: {
      tier1Innocent: 0.3,
      tier2Discovery: 0.6,
      tier3Aggression: 0.95,
      tier4Eradication: 0.85,
      crossPeaceful: 0.1,
    },
    campaignPriority: {
      newWorldHope: 0.2,
      pioneerDrive: 0.7,
      unityRally: 0.5,
      enemyAtTheGates: 0.95,
      sacrificeForTomorrow: 0.9,
    },
    attackThresholdAggression: 0.85,
    conscriptionTolerance: 0.9,
    betrayalProbability: 0.4,
    targetSelectionMode: 'weakest',
    suicideShipAffinity: 0.85,
    economyFocus: 0.3,
  },
  researcher: {
    archetype: 'researcher',
    name: 'Researcher',
    emoji: '🔬',
    description: 'heavy lab investment, tries to skip to tech apex, vulnerable mid-game',
    techCategoryPriority: {
      industrial: 0.5,
      information: 0.95,
      spacefaring: 0.7,
      advanced: 0.95,
      farFuture: 0.95,
      control: 0.6,
      forbidden: 0.85,
    },
    buildingCategoryPriority: {
      food: 0.5,
      extraction: 0.5,
      industry: 0.6,
      research: 0.95,
      housing: 0.6,
      propaganda: 0.4,
      defense: 0.4,
      launch: 0.5,
      utility: 0.6,
    },
    shipCategoryPriority: {
      tier1Innocent: 0.85,
      tier2Discovery: 0.7,
      tier3Aggression: 0.4,
      tier4Eradication: 0.6,
      crossPeaceful: 0.5,
    },
    campaignPriority: {
      newWorldHope: 0.6,
      pioneerDrive: 0.5,
      unityRally: 0.7,
      enemyAtTheGates: 0.3,
      sacrificeForTomorrow: 0.4,
    },
    attackThresholdAggression: 0.4,
    conscriptionTolerance: 0.5,
    betrayalProbability: 0.2,
    targetSelectionMode: 'richest',
    suicideShipAffinity: 0.5,
    economyFocus: 0.7,
  },
  trickster: {
    archetype: 'trickster',
    name: 'Trickster',
    emoji: '🎭',
    description: 'heavy propaganda + unpredictable moves, allies + betrays in co-op mode',
    techCategoryPriority: {
      industrial: 0.4,
      information: 0.85,
      spacefaring: 0.6,
      advanced: 0.6,
      farFuture: 0.5,
      control: 0.95,
      forbidden: 0.9,
    },
    buildingCategoryPriority: {
      food: 0.5,
      extraction: 0.5,
      industry: 0.6,
      research: 0.7,
      housing: 0.5,
      propaganda: 0.95,
      defense: 0.4,
      launch: 0.6,
      utility: 0.5,
    },
    shipCategoryPriority: {
      tier1Innocent: 0.7,
      tier2Discovery: 0.85,
      tier3Aggression: 0.6,
      tier4Eradication: 0.5,
      crossPeaceful: 0.85,
    },
    campaignPriority: {
      newWorldHope: 0.7,
      pioneerDrive: 0.6,
      unityRally: 0.95,
      enemyAtTheGates: 0.6,
      sacrificeForTomorrow: 0.7,
    },
    attackThresholdAggression: 0.6,
    conscriptionTolerance: 0.7,
    betrayalProbability: 0.85,
    targetSelectionMode: 'random',
    suicideShipAffinity: 0.6,
    economyFocus: 0.5,
  },
}

export function getPlaystyleProfile(archetype: PlaystyleArchetype): PlaystyleProfile {
  return PLAYSTYLE_PROFILES[archetype]
}

export const PLAYSTYLE_ARCHETYPES: ReadonlyArray<PlaystyleArchetype> = [
  'builder',
  'warmonger',
  'researcher',
  'trickster',
]
