export type HintId = string

export type HintSeverity = 'tip' | 'warning' | 'urgent'

export type HintCategory =
  | 'firstSteps'
  | 'economy'
  | 'population'
  | 'military'
  | 'deception'
  | 'tech'
  | 'diplomacy'
  | 'meta'

export interface HintTrigger {
  readonly minPopulationStarvingTicks?: number
  readonly minOutOfFuelTicks?: number
  readonly minDissidentRatio?: number
  readonly minControlledPlanets?: number
  readonly maxControlledPlanets?: number
  readonly hasEverBuilt?: boolean
  readonly hasEverLaunchedShip?: boolean
  readonly hasEverConscripted?: boolean
  readonly enemyShipsInbound?: number
  readonly minResearchedTechs?: number
  readonly maxResearchedTechs?: number
  readonly currentTickAtLeast?: number
}

export interface HintDef {
  readonly id: HintId
  readonly severity: HintSeverity
  readonly category: HintCategory
  readonly emoji: string
  readonly text: string
  readonly trigger: HintTrigger
  readonly oneShot: boolean
  readonly cooldownTicks: number
}

export const HINTS: ReadonlyArray<HintDef> = [
  {
    id: 'first-build',
    severity: 'tip',
    category: 'firstSteps',
    emoji: '🌱',
    text: 'Place a Farm. Citizens get hungry.',
    trigger: { hasEverBuilt: false, currentTickAtLeast: 30 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'first-research',
    severity: 'tip',
    category: 'tech',
    emoji: '🔬',
    text: 'A Lab unlocks the tech tree. Knowledge is power. Forbidden knowledge is more power.',
    trigger: {
      hasEverBuilt: true,
      minResearchedTechs: 0,
      maxResearchedTechs: 0,
      currentTickAtLeast: 80,
    },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'food-running-low',
    severity: 'warning',
    category: 'economy',
    emoji: '🍞',
    text: 'Food stocks low. Citizens get loud when hungry.',
    trigger: { minPopulationStarvingTicks: 10 },
    oneShot: false,
    cooldownTicks: 240,
  },
  {
    id: 'population-starving',
    severity: 'urgent',
    category: 'population',
    emoji: '⚠️',
    text: 'Citizens starving. Loyalty cratering. Build farms or lose them.',
    trigger: { minPopulationStarvingTicks: 60 },
    oneShot: false,
    cooldownTicks: 120,
  },
  {
    id: 'no-launch-pad',
    severity: 'tip',
    category: 'firstSteps',
    emoji: '🚀',
    text: 'Build a Launch Pad to send your first colony ship.',
    trigger: { hasEverLaunchedShip: false, minResearchedTechs: 2, currentTickAtLeast: 200 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'fuel-empty',
    severity: 'warning',
    category: 'economy',
    emoji: '⛽',
    text: 'Fuel tanks empty. Pads idle without it.',
    trigger: { minOutOfFuelTicks: 30 },
    oneShot: false,
    cooldownTicks: 180,
  },
  {
    id: 'first-launch-cue',
    severity: 'tip',
    category: 'firstSteps',
    emoji: '🛰️',
    text: 'Send a Scout first. Find out who else is out there before you knock on their door.',
    trigger: { hasEverLaunchedShip: false, hasEverBuilt: true, minResearchedTechs: 3 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'incoming-hostile',
    severity: 'urgent',
    category: 'military',
    emoji: '🚨',
    text: 'Inbound ship from another civ. Mines. Counter-ships. Pick one.',
    trigger: { enemyShipsInbound: 1 },
    oneShot: false,
    cooldownTicks: 60,
  },
  {
    id: 'multiple-incoming',
    severity: 'urgent',
    category: 'military',
    emoji: '☢️',
    text: 'Multiple inbound. They are coordinating.',
    trigger: { enemyShipsInbound: 3 },
    oneShot: false,
    cooldownTicks: 90,
  },
  {
    id: 'dissident-rising',
    severity: 'warning',
    category: 'deception',
    emoji: '🎭',
    text: 'Dissidents rising. Propaganda buildings or campaigns. Or conscription. Your call.',
    trigger: { minDissidentRatio: 0.25 },
    oneShot: false,
    cooldownTicks: 180,
  },
  {
    id: 'dissident-critical',
    severity: 'urgent',
    category: 'deception',
    emoji: '🔥',
    text: 'Dissident majority. Performance crashing. Your propaganda is losing the narrative.',
    trigger: { minDissidentRatio: 0.5 },
    oneShot: false,
    cooldownTicks: 120,
  },
  {
    id: 'first-conscription',
    severity: 'tip',
    category: 'deception',
    emoji: '🎟️',
    text: 'Conscription works. The penalty does not. Save it for when volunteers run dry.',
    trigger: { hasEverConscripted: true },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'tech-tier-2',
    severity: 'tip',
    category: 'tech',
    emoji: '🧪',
    text: 'Tier-2 tech opens up. Suppressed research is now visible to you.',
    trigger: { minResearchedTechs: 8 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'tech-tier-forbidden',
    severity: 'tip',
    category: 'tech',
    emoji: '🪞',
    text: 'Forbidden tech is gated by conquest. Defeat civs. Capture planets. Reverse-engineer ancient tech.',
    trigger: { minResearchedTechs: 14 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'apex-eligible',
    severity: 'tip',
    category: 'meta',
    emoji: '🏆',
    text: 'Ten planets controlled. Apex techs are eligible now. Singularity for the clean way out. Reality Editing for the other one.',
    trigger: { minControlledPlanets: 10 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'first-volunteer-tier',
    severity: 'tip',
    category: 'deception',
    emoji: '🕊️',
    text: 'Tier-4 citizens unlocked. They will eagerly volunteer for one-way trips. Their propaganda elevated them too well.',
    trigger: { minControlledPlanets: 4, minResearchedTechs: 10 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'galaxy-quiet',
    severity: 'tip',
    category: 'diplomacy',
    emoji: '🌌',
    text: 'No threats incoming. Eerie. Or they have not noticed you yet.',
    trigger: { hasEverBuilt: true, currentTickAtLeast: 600, enemyShipsInbound: 0 },
    oneShot: false,
    cooldownTicks: 600,
  },
  {
    id: 'first-pad-built',
    severity: 'tip',
    category: 'firstSteps',
    emoji: '🚀',
    text: 'Pad built. Click READY → ARM → LAUNCH. Or queue waypoints for auto-fire.',
    trigger: { hasEverBuilt: true, hasEverLaunchedShip: false, minResearchedTechs: 4 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'late-game-tense',
    severity: 'warning',
    category: 'meta',
    emoji: '⏳',
    text: 'Late game. Other civs at apex too. Your move.',
    trigger: { currentTickAtLeast: 6000 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'final-colony-ship-eligible',
    severity: 'tip',
    category: 'tech',
    emoji: '☢️',
    text: 'Antimatter unlocked. The Final Colony Ship is buildable. The propaganda is now baroque.',
    trigger: { minResearchedTechs: 22 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'sole-survivor-close',
    severity: 'tip',
    category: 'meta',
    emoji: '👑',
    text: 'Most civs eliminated. Last-civ-standing victory in reach.',
    trigger: { minControlledPlanets: 30 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'lost-planet',
    severity: 'urgent',
    category: 'military',
    emoji: '💀',
    text: 'Planet lost. Refugees fled to nearest friendly. They will boost loyalty there.',
    trigger: { hasEverLaunchedShip: true, maxControlledPlanets: 1 },
    oneShot: false,
    cooldownTicks: 300,
  },
  {
    id: 'no-help-warning',
    severity: 'tip',
    category: 'firstSteps',
    emoji: '📜',
    text: 'No help, learn or die. These hints are the only nudge you get.',
    trigger: { currentTickAtLeast: 1 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'theme-rolled',
    severity: 'tip',
    category: 'meta',
    emoji: '🎲',
    text: 'You did not pick this government. Citizens never do. Embrace the role.',
    trigger: { currentTickAtLeast: 5 },
    oneShot: true,
    cooldownTicks: 0,
  },
  {
    id: 'apex-victory-near',
    severity: 'tip',
    category: 'tech',
    emoji: '✶',
    text: 'One tech away from apex victory. Push hard. Or stall the others.',
    trigger: { minResearchedTechs: 25, minControlledPlanets: 10 },
    oneShot: true,
    cooldownTicks: 0,
  },
]

const HINT_INDEX: ReadonlyMap<HintId, HintDef> = new Map(HINTS.map((h) => [h.id, h]))

export function getHintDef(id: HintId): HintDef | null {
  return HINT_INDEX.get(id) ?? null
}

export interface HintGameSignals {
  readonly currentTick: number
  readonly hasEverBuilt: boolean
  readonly hasEverLaunchedShip: boolean
  readonly hasEverConscripted: boolean
  readonly populationStarvingTicks: number
  readonly outOfFuelTicks: number
  readonly dissidentRatio: number
  readonly controlledPlanetCount: number
  readonly enemyShipsInbound: number
  readonly researchedTechCount: number
}

export function isHintEligible(hint: HintDef, signals: HintGameSignals): boolean {
  const t = hint.trigger
  if (t.currentTickAtLeast !== undefined && signals.currentTick < t.currentTickAtLeast) return false
  if (t.hasEverBuilt !== undefined && signals.hasEverBuilt !== t.hasEverBuilt) return false
  if (t.hasEverLaunchedShip !== undefined && signals.hasEverLaunchedShip !== t.hasEverLaunchedShip)
    return false
  if (t.hasEverConscripted !== undefined && signals.hasEverConscripted !== t.hasEverConscripted)
    return false
  if (
    t.minPopulationStarvingTicks !== undefined &&
    signals.populationStarvingTicks < t.minPopulationStarvingTicks
  )
    return false
  if (t.minOutOfFuelTicks !== undefined && signals.outOfFuelTicks < t.minOutOfFuelTicks)
    return false
  if (t.minDissidentRatio !== undefined && signals.dissidentRatio < t.minDissidentRatio)
    return false
  if (
    t.minControlledPlanets !== undefined &&
    signals.controlledPlanetCount < t.minControlledPlanets
  )
    return false
  if (
    t.maxControlledPlanets !== undefined &&
    signals.controlledPlanetCount > t.maxControlledPlanets
  )
    return false
  if (t.enemyShipsInbound !== undefined && signals.enemyShipsInbound < t.enemyShipsInbound)
    return false
  if (t.minResearchedTechs !== undefined && signals.researchedTechCount < t.minResearchedTechs)
    return false
  if (t.maxResearchedTechs !== undefined && signals.researchedTechCount > t.maxResearchedTechs)
    return false
  return true
}

export interface HintHistory {
  readonly seenHintIds: Set<HintId>
  readonly lastShownAtTick: Map<HintId, number>
}

export function newHintHistory(): HintHistory {
  return { seenHintIds: new Set(), lastShownAtTick: new Map() }
}

export function shouldFireHint(
  hint: HintDef,
  history: HintHistory,
  signals: HintGameSignals,
): boolean {
  if (!isHintEligible(hint, signals)) return false
  if (hint.oneShot && history.seenHintIds.has(hint.id)) return false
  const last = history.lastShownAtTick.get(hint.id)
  if (last !== undefined && signals.currentTick - last < hint.cooldownTicks) return false
  return true
}

export function recordHintFired(history: HintHistory, hintId: HintId, atTick: number): void {
  history.seenHintIds.add(hintId)
  history.lastShownAtTick.set(hintId, atTick)
}

export function checkAllHints(
  history: HintHistory,
  signals: HintGameSignals,
): ReadonlyArray<HintDef> {
  return HINTS.filter((h) => shouldFireHint(h, history, signals))
}
