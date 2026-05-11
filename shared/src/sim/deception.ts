import { type BuildingDefId, type ResourceId } from '../types/index'
import {
  BLDG_CATHEDRAL,
  BLDG_CORP_PROMOTIONS,
  BLDG_REEDUCATION,
  BLDG_SCHOOL,
  BLDG_TV_STATION,
  BLDG_UNIVERSITY,
} from './building'
import {
  type FactionSplit,
  applyConscriptionPenalty,
  applyPropagandaTick,
  dissidentRatio,
} from './faction'
import { type CitizenTier, type PlanetPopulation } from './population'
import { RESOURCE_PROPAGANDA_MATERIALS } from './resources'
import { type Theme } from './themes'

export const PROPAGANDA_POWER_PER_BUILDING: ReadonlyMap<BuildingDefId, number> = new Map([
  [BLDG_TV_STATION, 0.02],
  [BLDG_SCHOOL, 0.01],
  [BLDG_UNIVERSITY, 0.02],
  [BLDG_CATHEDRAL, 0.05],
  [BLDG_REEDUCATION, 0.04],
  [BLDG_CORP_PROMOTIONS, 0.03],
])

export const MAX_PROPAGANDA_POWER_PER_TICK = 0.5

export function propagandaPowerFromBuildings(
  buildingCounts: ReadonlyMap<BuildingDefId, number>,
): number {
  let power = 0
  for (const [defId, count] of buildingCounts) {
    const per = PROPAGANDA_POWER_PER_BUILDING.get(defId)
    if (per !== undefined) power += per * count
  }
  return power
}

export function totalPropagandaPower(
  buildingPower: number,
  techMultiplier: number,
  themeMultiplier: number,
  campaignBonus: number,
): number {
  const total = buildingPower * techMultiplier * themeMultiplier + campaignBonus
  return Math.min(MAX_PROPAGANDA_POWER_PER_TICK, Math.max(0, total))
}

export type CampaignArchetype =
  | 'newWorldHope'
  | 'pioneerDrive'
  | 'unityRally'
  | 'enemyAtTheGates'
  | 'sacrificeForTomorrow'

export interface CampaignCost {
  readonly resource: ResourceId
  readonly amount: number
}

export interface CampaignDef {
  readonly archetype: CampaignArchetype
  readonly name: string
  readonly emoji: string
  readonly costs: ReadonlyArray<CampaignCost>
  readonly durationTicks: number
  readonly propagandaPowerBonus: number
  readonly volunteerPoolBonus: number
  readonly conscriptionDiscount: number
  readonly description: string
}

export const CAMPAIGNS: ReadonlyArray<CampaignDef> = [
  {
    archetype: 'newWorldHope',
    name: 'New World Hope',
    emoji: '🌅',
    costs: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 50 }],
    durationTicks: 30,
    propagandaPowerBonus: 0.15,
    volunteerPoolBonus: 0,
    conscriptionDiscount: 0,
    description: 'Sells the dream of a fresh frontier. Skeptics flip 15% faster while active.',
  },
  {
    archetype: 'pioneerDrive',
    name: 'Pioneer Drive',
    emoji: '🚀',
    costs: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 80 }],
    durationTicks: 45,
    propagandaPowerBonus: 0.2,
    volunteerPoolBonus: 0.3,
    conscriptionDiscount: 0,
    description: 'Glory-of-volunteering. Bigger volunteer pool + propaganda bonus.',
  },
  {
    archetype: 'unityRally',
    name: 'Unity Rally',
    emoji: '🤝',
    costs: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 60 }],
    durationTicks: 25,
    propagandaPowerBonus: 0.25,
    volunteerPoolBonus: 0,
    conscriptionDiscount: 0,
    description: 'Short, intense compliance push. Strongest propaganda boost.',
  },
  {
    archetype: 'enemyAtTheGates',
    name: 'Enemy at the Gates',
    emoji: '⚠️',
    costs: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 70 }],
    durationTicks: 40,
    propagandaPowerBonus: 0.1,
    volunteerPoolBonus: 0.1,
    conscriptionDiscount: 0.3,
    description: 'External-threat narrative. Cheaper conscription + modest propaganda.',
  },
  {
    archetype: 'sacrificeForTomorrow',
    name: 'Sacrifice For Tomorrow',
    emoji: '🕯️',
    costs: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 100 }],
    durationTicks: 50,
    propagandaPowerBonus: 0.1,
    volunteerPoolBonus: 0.5,
    conscriptionDiscount: 0,
    description: 'Heroic-martyr campaign. Massive volunteer-pool boost for one-way trips.',
  },
]

const CAMPAIGN_INDEX: ReadonlyMap<CampaignArchetype, CampaignDef> = new Map(
  CAMPAIGNS.map((c) => [c.archetype, c]),
)

export function getCampaignDef(archetype: CampaignArchetype): CampaignDef {
  const def = CAMPAIGN_INDEX.get(archetype)
  if (!def) throw new Error(`Unknown campaign archetype: ${archetype}`)
  return def
}

export interface ActiveCampaign {
  readonly archetype: CampaignArchetype
  readonly startedAtTick: number
  ticksRemaining: number
}

export function newActiveCampaign(archetype: CampaignArchetype, atTick: number): ActiveCampaign {
  const def = getCampaignDef(archetype)
  return { archetype, startedAtTick: atTick, ticksRemaining: def.durationTicks }
}

export function tickActiveCampaign(c: ActiveCampaign): boolean {
  if (c.ticksRemaining > 0) c.ticksRemaining -= 1
  return c.ticksRemaining <= 0
}

export function isCampaignActive(c: ActiveCampaign): boolean {
  return c.ticksRemaining > 0
}

export interface CampaignAggregateBonus {
  readonly propagandaPower: number
  readonly volunteerPool: number
  readonly conscriptionDiscount: number
}

export function aggregateActiveCampaignBonus(
  campaigns: ReadonlyArray<ActiveCampaign>,
): CampaignAggregateBonus {
  let propagandaPower = 0
  let volunteerPool = 0
  let conscriptionDiscount = 0
  for (const ac of campaigns) {
    if (!isCampaignActive(ac)) continue
    const def = getCampaignDef(ac.archetype)
    propagandaPower += def.propagandaPowerBonus
    volunteerPool += def.volunteerPoolBonus
    if (def.conscriptionDiscount > conscriptionDiscount) {
      conscriptionDiscount = def.conscriptionDiscount
    }
  }
  return { propagandaPower, volunteerPool, conscriptionDiscount }
}

export type MatchDifficulty = 'tutorial' | 'normal' | 'brutal'

export interface DifficultyConfig {
  readonly propagandaCostMultiplier: number
  readonly conscriptionCostMultiplier: number
  readonly dissidentEmergenceMultiplier: number
}

export const DIFFICULTY_CONFIGS: Readonly<Record<MatchDifficulty, DifficultyConfig>> = {
  tutorial: {
    propagandaCostMultiplier: 0.7,
    conscriptionCostMultiplier: 1.5,
    dissidentEmergenceMultiplier: 0.5,
  },
  normal: {
    propagandaCostMultiplier: 1.0,
    conscriptionCostMultiplier: 1.0,
    dissidentEmergenceMultiplier: 1.0,
  },
  brutal: {
    propagandaCostMultiplier: 1.3,
    conscriptionCostMultiplier: 0.5,
    dissidentEmergenceMultiplier: 1.5,
  },
}

export interface ConscriptionRequest {
  readonly fromTier: CitizenTier
  readonly count: number
}

export interface ConscriptionResult {
  readonly conscriptedCount: number
  readonly factionPenaltyApplied: number
  readonly skepticSurge: number
  readonly dissidentSurge: number
}

export function applyDirectConscription(
  pop: PlanetPopulation,
  request: ConscriptionRequest,
  difficulty: MatchDifficulty = 'normal',
  campaignDiscount = 0,
): ConscriptionResult {
  if (request.count < 0) throw new Error(`applyDirectConscription: count must be non-negative`)
  const available = pop.tierCounts[request.fromTier] ?? 0
  const conscripted = Math.min(available, request.count)
  if (conscripted === 0) {
    return { conscriptedCount: 0, factionPenaltyApplied: 0, skepticSurge: 0, dissidentSurge: 0 }
  }
  pop.tierCounts[request.fromTier] = available - conscripted
  const config = DIFFICULTY_CONFIGS[difficulty]
  const penaltyMultiplier = Math.max(0, 1 - campaignDiscount) * config.dissidentEmergenceMultiplier
  const factionPenaltyAmount = Math.round(conscripted * penaltyMultiplier)
  applyConscriptionPenalty(pop.faction, factionPenaltyAmount)
  return {
    conscriptedCount: conscripted,
    factionPenaltyApplied: factionPenaltyAmount,
    skepticSurge: Math.round(factionPenaltyAmount * 0.5),
    dissidentSurge: Math.round(factionPenaltyAmount * 0.3),
  }
}

export interface FactionTickInputs {
  readonly buildingCounts: ReadonlyMap<BuildingDefId, number>
  readonly activeCampaigns: ReadonlyArray<ActiveCampaign>
  readonly techPropagandaMultiplier: number
  readonly themePropagandaMultiplier: number
}

export function applyDeceptionFactionTick(
  faction: FactionSplit,
  inputs: FactionTickInputs,
): number {
  const buildingPower = propagandaPowerFromBuildings(inputs.buildingCounts)
  const campaignBonus = aggregateActiveCampaignBonus(inputs.activeCampaigns).propagandaPower
  const totalPower = totalPropagandaPower(
    buildingPower,
    inputs.techPropagandaMultiplier,
    inputs.themePropagandaMultiplier,
    campaignBonus,
  )
  applyPropagandaTick(faction, totalPower)
  return totalPower
}

export interface DegradationMultipliers {
  readonly production: number
  readonly colonyShipBuildTime: number
  readonly research: number
  readonly campaignEffectiveness: number
}

export function deceptionPenalties(
  faction: FactionSplit,
  difficulty: MatchDifficulty = 'normal',
): DegradationMultipliers {
  const dissRatio = dissidentRatio(faction)
  const difficultyAmplifier = DIFFICULTY_CONFIGS[difficulty].dissidentEmergenceMultiplier
  const effective = Math.min(1, dissRatio * difficultyAmplifier)
  return {
    production: Math.max(0.3, 1 - effective * 1.5),
    colonyShipBuildTime: 1 + effective * 1.0,
    research: Math.max(0.4, 1 - effective * 1.2),
    campaignEffectiveness: Math.max(0.4, 1 - effective * 0.5),
  }
}

export interface DeceptionLedger {
  volunteersRecruited: number
  citizensConscripted: number
  colonyShipsLaunched: number
  enemyCivilizationsDestroyed: number
  citizensSentOnOneWayTrips: number
}

export function newDeceptionLedger(): DeceptionLedger {
  return {
    volunteersRecruited: 0,
    citizensConscripted: 0,
    colonyShipsLaunched: 0,
    enemyCivilizationsDestroyed: 0,
    citizensSentOnOneWayTrips: 0,
  }
}

export function recordVolunteers(ledger: DeceptionLedger, count: number): void {
  ledger.volunteersRecruited += count
}

export function recordConscription(ledger: DeceptionLedger, count: number): void {
  ledger.citizensConscripted += count
}

export function recordColonyShipLaunch(ledger: DeceptionLedger, citizensAboard: number): void {
  ledger.colonyShipsLaunched += 1
  ledger.citizensSentOnOneWayTrips += citizensAboard
}

export function recordEnemyCivDestroyed(ledger: DeceptionLedger): void {
  ledger.enemyCivilizationsDestroyed += 1
}

export type DeceptionMetric =
  | 'volunteersRecruited'
  | 'citizensConscripted'
  | 'colonyShipsLaunched'
  | 'enemyCivilizationsDestroyed'
  | 'citizensSentOnOneWayTrips'

const TRUTH_LABELS: Readonly<Record<DeceptionMetric, string>> = {
  volunteersRecruited: 'Citizens Tricked Into Volunteering',
  citizensConscripted: 'Citizens Forced At Gunpoint',
  colonyShipsLaunched: 'Suicide Ships Launched',
  enemyCivilizationsDestroyed: 'Civilizations Genocided',
  citizensSentOnOneWayTrips: 'Citizens Sent To Die',
}

export function frameMetric(
  metric: DeceptionMetric,
  theme: Theme,
  count: number,
  truthToggle: boolean,
): string {
  const formatted = count.toLocaleString()
  if (truthToggle) {
    return `${TRUTH_LABELS[metric]}: ${formatted}`
  }
  return `${innocentLabel(metric, theme)}: ${formatted}`
}

function innocentLabel(metric: DeceptionMetric, theme: Theme): string {
  switch (metric) {
    case 'volunteersRecruited':
      return `${theme.propaganda.volunteerEpithet}s Recruited`
    case 'citizensConscripted':
      return 'Citizens Reassigned'
    case 'colonyShipsLaunched':
      return `${theme.propaganda.newWorldFraming} Departures`
    case 'enemyCivilizationsDestroyed':
      return `${theme.propaganda.enemyEpithet}s Pacified`
    case 'citizensSentOnOneWayTrips':
      return `${theme.propaganda.volunteerEpithet}s Sent`
  }
}

const BUREAUCRACY_DECAY_PHRASES: Readonly<
  Record<string, readonly [string, string, string, string]>
> = {
  cultist: ['weak faith detected', 'unbelievers stir', 'heretics spread', 'the prophecy fails'],
  warmonger: ['ranks grumble', 'mutiny suspected', 'desertions reported', 'open rebellion'],
  trader: [
    'Q4 underperformance',
    'missed targets',
    'stakeholder unrest',
    'hostile takeover incoming',
  ],
  builder: ['production slipping', 'quotas missed', 'the workers slack', 'sabotage reported'],
  isolationist: [
    'outsider influence felt',
    'culture eroding',
    'foreign ideas spreading',
    'invasion of values',
  ],
  subversive: ['the truth leaks', 'doubts circulate', 'the message corrupts', 'the lie unravels'],
  opportunist: [
    'engagement dropping',
    'the algorithm wavers',
    'losing the narrative',
    'cancellation imminent',
  ],
  expansionist: [
    'settlers wavering',
    'frontier morale low',
    'colonies grumbling',
    'colonial revolt',
  ],
}

const FALLBACK_DECAY_PHRASES: readonly [string, string, string, string] = [
  'quiet rumblings',
  'visible unrest',
  'open dissent',
  'system collapse',
]

export function bureaucracyDecayLabel(theme: Theme, dissRatioValue: number): string {
  const phrases = BUREAUCRACY_DECAY_PHRASES[theme.aiPersonalityArchetype] ?? FALLBACK_DECAY_PHRASES
  const clamped = Math.max(0, Math.min(1, dissRatioValue))
  const idx = Math.min(3, Math.floor(clamped * 4))
  switch (idx) {
    case 0:
      return phrases[0]
    case 1:
      return phrases[1]
    case 2:
      return phrases[2]
    default:
      return phrases[3]
  }
}
