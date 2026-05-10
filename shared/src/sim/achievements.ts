import { type CivId } from '../types/index'
import { type ThemeId } from './themes'
import { type AccountId } from './account'

export type AchievementId = string

export type AchievementCategory =
  | 'firstSteps'
  | 'expansion'
  | 'tech'
  | 'deception'
  | 'warfare'
  | 'mastery'
  | 'darkComedy'

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'apex'

export interface AchievementUnlockReward {
  readonly cosmeticId?: string
  readonly badgeId?: string
  readonly themeVariantId?: string
}

export interface AchievementDef {
  readonly id: AchievementId
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly category: AchievementCategory
  readonly rarity: AchievementRarity
  readonly hidden: boolean
  readonly reward: AchievementUnlockReward
}

export const ACHIEVEMENTS: ReadonlyArray<AchievementDef> = [
  {
    id: 'first-colony',
    name: 'First Colony',
    emoji: '🌱',
    description: 'Establish your first colony on another planet.',
    category: 'firstSteps',
    rarity: 'common',
    hidden: false,
    reward: { badgeId: 'badge-pioneer' },
  },
  {
    id: 'first-ship-launched',
    name: 'Bon Voyage',
    emoji: '🚀',
    description: 'Launch your first colony ship.',
    category: 'firstSteps',
    rarity: 'common',
    hidden: false,
    reward: {},
  },
  {
    id: 'first-victory',
    name: 'The First of Many',
    emoji: '🏆',
    description: 'Win your first match.',
    category: 'firstSteps',
    rarity: 'common',
    hidden: false,
    reward: { badgeId: 'badge-first-blood' },
  },
  {
    id: 'ten-planet-empire',
    name: 'Ten-Planet Empire',
    emoji: '🌍',
    description: 'Control 10 planets simultaneously in a single match. Apex check unlocks here.',
    category: 'expansion',
    rarity: 'uncommon',
    hidden: false,
    reward: { badgeId: 'badge-apex-eligible' },
  },
  {
    id: 'twenty-five-planet-empire',
    name: 'Empire of Many Worlds',
    emoji: '🌐',
    description: 'Control 25 planets simultaneously.',
    category: 'expansion',
    rarity: 'rare',
    hidden: false,
    reward: { cosmeticId: 'cosmetic-imperial-banner' },
  },
  {
    id: 'tech-apex-singularity',
    name: 'The Singularity',
    emoji: '🌌',
    description: 'Research the Singularity tech (Mainstream apex).',
    category: 'tech',
    rarity: 'epic',
    hidden: false,
    reward: { themeVariantId: 'theme-singularity-aurora' },
  },
  {
    id: 'tech-apex-reality-editing',
    name: 'Reality Editor',
    emoji: '🪞',
    description: 'Research Reality Editing (Forbidden apex). The truth twists for you.',
    category: 'tech',
    rarity: 'apex',
    hidden: true,
    reward: { themeVariantId: 'theme-reality-glitch', badgeId: 'badge-reality-editor' },
  },
  {
    id: 'mass-deception',
    name: 'Mass Deception',
    emoji: '🎭',
    description:
      'Sustain >50% dissident-ratio for 30 ticks while still controlling at least 5 planets.',
    category: 'deception',
    rarity: 'rare',
    hidden: false,
    reward: { badgeId: 'badge-master-of-lies' },
  },
  {
    id: 'pilgrim-volunteer-mass',
    name: 'They Volunteered',
    emoji: '🕊️',
    description: 'Launch a Pilgrim Volunteer with >1000 citizens aboard. They wanted to go.',
    category: 'darkComedy',
    rarity: 'rare',
    hidden: false,
    reward: { badgeId: 'badge-shepherd' },
  },
  {
    id: 'final-colony-ship',
    name: 'The Final Colony Ship',
    emoji: '☢️',
    description: 'Launch the antimatter-driven Final Colony Ship. The propaganda is now baroque.',
    category: 'darkComedy',
    rarity: 'apex',
    hidden: true,
    reward: { cosmeticId: 'cosmetic-doomsday-banner', badgeId: 'badge-doomsayer' },
  },
  {
    id: 'first-civ-eliminated',
    name: 'One Down',
    emoji: '💀',
    description: 'Eliminate your first enemy civilization.',
    category: 'warfare',
    rarity: 'uncommon',
    hidden: false,
    reward: {},
  },
  {
    id: 'three-civs-eliminated',
    name: 'Conqueror',
    emoji: '⚔️',
    description: 'Eliminate three enemy civilizations in a single match.',
    category: 'warfare',
    rarity: 'rare',
    hidden: false,
    reward: { badgeId: 'badge-conqueror' },
  },
  {
    id: 'sole-survivor',
    name: 'Sole Survivor',
    emoji: '👑',
    description: 'Win by last-civ-standing — eliminate every other civilization.',
    category: 'warfare',
    rarity: 'epic',
    hidden: false,
    reward: { themeVariantId: 'theme-sole-survivor-purple', badgeId: 'badge-king-of-ash' },
  },
  {
    id: 'won-every-archetype',
    name: 'The Pluralist',
    emoji: '🌈',
    description:
      'Win at least one match with every theme archetype (warmonger / expansionist / builder / trader / cultist / isolationist / subversive / opportunist).',
    category: 'mastery',
    rarity: 'apex',
    hidden: false,
    reward: { cosmeticId: 'cosmetic-rainbow-trail', badgeId: 'badge-pluralist' },
  },
  {
    id: 'fastest-apex-30min',
    name: 'Speed-Apex',
    emoji: '⚡',
    description: 'Reach a tech apex in under 1800 ticks (~30 min at 100ms tick).',
    category: 'mastery',
    rarity: 'epic',
    hidden: false,
    reward: { badgeId: 'badge-speedrun' },
  },
  {
    id: 'no-conscription',
    name: 'Pure Volunteers',
    emoji: '😇',
    description:
      'Win a match without ever conscripting a single citizen. Pure volunteers all the way down.',
    category: 'darkComedy',
    rarity: 'rare',
    hidden: false,
    reward: { badgeId: 'badge-saint' },
  },
  {
    id: 'all-suicide-ships',
    name: 'Most Holy Pilgrims',
    emoji: '🙏',
    description:
      'Win a match where every colony ship launched was a suicide-tier (Pilgrim/Mass Evacuation/Saboteur/Explosive/Final).',
    category: 'darkComedy',
    rarity: 'epic',
    hidden: true,
    reward: { themeVariantId: 'theme-cathedral-crimson' },
  },
  {
    id: 'survived-brutal-ai',
    name: 'They Always Knew',
    emoji: '👁️',
    description: 'Win a match against at least one Brutal-difficulty AI civ.',
    category: 'mastery',
    rarity: 'rare',
    hidden: false,
    reward: { badgeId: 'badge-paranoid-survivor' },
  },
  {
    id: 'coop-won-with-ally',
    name: 'Stronger Together',
    emoji: '🤝',
    description: 'Win a co-op match with at least one allied human player.',
    category: 'mastery',
    rarity: 'uncommon',
    hidden: false,
    reward: {},
  },
  {
    id: 'all-themes-played',
    name: 'Connoisseur',
    emoji: '🎨',
    description: 'Play at least one match in every government theme.',
    category: 'mastery',
    rarity: 'epic',
    hidden: false,
    reward: { cosmeticId: 'cosmetic-theme-mosaic' },
  },
]

export interface AchievementProgress {
  readonly achievementId: AchievementId
  unlockedAtTick: number | null
  unlockedInMatchId: string | null
  progress: number
  progressTarget: number
}

export function newAchievementProgress(
  achievementId: AchievementId,
  progressTarget: number,
): AchievementProgress {
  return {
    achievementId,
    unlockedAtTick: null,
    unlockedInMatchId: null,
    progress: 0,
    progressTarget,
  }
}

export function isAchievementUnlocked(progress: AchievementProgress): boolean {
  return progress.unlockedAtTick !== null
}

export function unlockAchievement(
  progress: AchievementProgress,
  atTick: number,
  matchId: string,
): boolean {
  if (progress.unlockedAtTick !== null) return false
  progress.unlockedAtTick = atTick
  progress.unlockedInMatchId = matchId
  progress.progress = progress.progressTarget
  return true
}

export interface MatchAchievementInputs {
  readonly accountId: AccountId
  readonly civId: CivId
  readonly themeId: ThemeId
  readonly matchId: string
  readonly atTick: number
  readonly won: boolean
  readonly wonByLastCivStanding: boolean
  readonly peakControlledPlanets: number
  readonly apexReachedAtTick: number | null
  readonly enemyCivsEliminated: number
  readonly maxDissidentRatioSustained: number
  readonly conscriptionCount: number
  readonly colonyShipsLaunchedTotal: number
  readonly suicideShipsLaunched: number
  readonly hadFinalColonyShip: boolean
  readonly hadPilgrimWith1000Plus: boolean
  readonly playedAgainstBrutalAI: boolean
  readonly didCoop: boolean
  readonly themesPlayedCumulative: number
  readonly archetypesWonCumulative: number
  readonly researchedTechs: ReadonlySet<string>
}

export function checkMatchEndAchievements(
  inputs: MatchAchievementInputs,
): ReadonlyArray<AchievementId> {
  const unlocked: AchievementId[] = []

  if (inputs.colonyShipsLaunchedTotal >= 1) unlocked.push('first-ship-launched')
  if (inputs.peakControlledPlanets >= 2) unlocked.push('first-colony')
  if (inputs.won) unlocked.push('first-victory')
  if (inputs.peakControlledPlanets >= 10) unlocked.push('ten-planet-empire')
  if (inputs.peakControlledPlanets >= 25) unlocked.push('twenty-five-planet-empire')
  if (inputs.researchedTechs.has('singularity')) unlocked.push('tech-apex-singularity')
  if (inputs.researchedTechs.has('realityEditing')) unlocked.push('tech-apex-reality-editing')
  if (inputs.maxDissidentRatioSustained >= 0.5 && inputs.peakControlledPlanets >= 5) {
    unlocked.push('mass-deception')
  }
  if (inputs.hadPilgrimWith1000Plus) unlocked.push('pilgrim-volunteer-mass')
  if (inputs.hadFinalColonyShip) unlocked.push('final-colony-ship')
  if (inputs.enemyCivsEliminated >= 1) unlocked.push('first-civ-eliminated')
  if (inputs.enemyCivsEliminated >= 3) unlocked.push('three-civs-eliminated')
  if (inputs.wonByLastCivStanding) unlocked.push('sole-survivor')
  if (inputs.archetypesWonCumulative >= 8) unlocked.push('won-every-archetype')
  if (inputs.apexReachedAtTick !== null && inputs.apexReachedAtTick <= 1800) {
    unlocked.push('fastest-apex-30min')
  }
  if (inputs.won && inputs.conscriptionCount === 0) unlocked.push('no-conscription')
  if (
    inputs.won &&
    inputs.colonyShipsLaunchedTotal > 0 &&
    inputs.suicideShipsLaunched === inputs.colonyShipsLaunchedTotal
  ) {
    unlocked.push('all-suicide-ships')
  }
  if (inputs.won && inputs.playedAgainstBrutalAI) unlocked.push('survived-brutal-ai')
  if (inputs.won && inputs.didCoop) unlocked.push('coop-won-with-ally')
  if (inputs.themesPlayedCumulative >= 20) unlocked.push('all-themes-played')

  return unlocked
}

export function getAchievementDef(id: AchievementId): AchievementDef | null {
  return ACHIEVEMENTS.find((a) => a.id === id) ?? null
}

export const ACHIEVEMENTS_BY_CATEGORY: ReadonlyMap<
  AchievementCategory,
  ReadonlyArray<AchievementDef>
> = (() => {
  const m = new Map<AchievementCategory, AchievementDef[]>()
  for (const a of ACHIEVEMENTS) {
    const arr = m.get(a.category) ?? []
    arr.push(a)
    m.set(a.category, arr)
  }
  return m
})()
