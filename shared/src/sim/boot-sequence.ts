import { type AIPersonalityArchetype, type Theme } from './themes'
import { getThemePolish } from './theme-polish'

export interface BootCheck {
  readonly id: string
  readonly defaultLabel: string
  readonly weightTicks: number
  readonly isThemeReveal?: boolean
}

export const SMOL_BOOT_CHECKS: ReadonlyArray<BootCheck> = [
  { id: 'planetary-core', defaultLabel: 'Initializing planetary core', weightTicks: 2 },
  { id: 'biome-distribution', defaultLabel: 'Validating biome distribution', weightTicks: 2 },
  { id: 'galaxy-mesh', defaultLabel: 'Constructing galaxy mesh', weightTicks: 3 },
  { id: 'civ-roster', defaultLabel: 'Registering civilization roster', weightTicks: 1 },
  { id: 'theme-rolling', defaultLabel: 'Rolling government themes', weightTicks: 2 },
  {
    id: 'theme-reveal',
    defaultLabel: 'Theme assignment confirmed',
    weightTicks: 3,
    isThemeReveal: true,
  },
  {
    id: 'propaganda-systems',
    defaultLabel: 'Spinning up government propaganda systems',
    weightTicks: 3,
  },
  { id: 'citizen-models', defaultLabel: 'Loading citizen behavioral models', weightTicks: 2 },
  { id: 'tier-allocation', defaultLabel: 'Allocating citizen tier ratios', weightTicks: 2 },
  { id: 'faction-init', defaultLabel: 'Calibrating faction loyalty splits', weightTicks: 2 },
  { id: 'tech-tree', defaultLabel: 'Loading tech tree + conquest gates', weightTicks: 1 },
  { id: 'resource-manifest', defaultLabel: 'Indexing resource manifest', weightTicks: 1 },
  { id: 'building-catalog', defaultLabel: 'Indexing building catalog', weightTicks: 1 },
  {
    id: 'colony-ship-catalog',
    defaultLabel: 'Indexing colony ship variant catalog',
    weightTicks: 1,
  },
  { id: 'trajectory-math', defaultLabel: 'Establishing trajectory math', weightTicks: 2 },
  { id: 'pad-states', defaultLabel: 'Bringing launch pads + salvo coord online', weightTicks: 2 },
  { id: 'beacon-net', defaultLabel: 'Activating planetary beacon network', weightTicks: 1 },
  { id: 'signal-mesh', defaultLabel: 'Calibrating signal mesh', weightTicks: 1 },
  { id: 'fog-of-war', defaultLabel: 'Spinning up fog-of-war filters', weightTicks: 2 },
  { id: 'multiplayer-sockets', defaultLabel: 'Opening multiplayer sockets', weightTicks: 2 },
  { id: 'ai-civs', defaultLabel: 'Booting AI civilization processes', weightTicks: 3 },
  { id: 'indigenous-spawn', defaultLabel: 'Spawning indigenous civilizations', weightTicks: 2 },
  { id: 'audio-mixer', defaultLabel: 'Tuning per-theme audio mixer', weightTicks: 1 },
  { id: 'persistence', defaultLabel: 'Connecting persistence layer', weightTicks: 1 },
  { id: 'narrator-voice', defaultLabel: 'Briefing narrator voice', weightTicks: 1 },
  { id: 'all-systems-go', defaultLabel: 'All systems operational', weightTicks: 1 },
]

const PER_THEME_OVERRIDES: Readonly<
  Record<AIPersonalityArchetype, Partial<Record<string, string>>>
> = {
  cultist: {
    'planetary-core': 'Invoking sacred protocols',
    'propaganda-systems': 'Anointing the prophets of broadcast',
    'citizen-models': 'Reading the souls of the faithful',
    'tier-allocation': 'Sorting the elect from the unblessed',
    'faction-init': 'Naming the heretics',
    'pad-states': 'Consecrating the pilgrim launch sites',
    'narrator-voice': 'Awakening the voice of providence',
    'all-systems-go': 'The faithful are mobilized',
  },
  warmonger: {
    'planetary-core': 'Locking down the war room',
    'propaganda-systems': 'Recruitment posters distributed',
    'citizen-models': 'Drafting the conscript profile database',
    'tier-allocation': 'Sorting officers from cannon fodder',
    'faction-init': 'Identifying disloyal elements',
    'pad-states': 'Arming forward strike pads',
    'narrator-voice': 'Marshalling the war drums',
    'all-systems-go': 'Battle groups ready',
  },
  trader: {
    'planetary-core': 'Booting enterprise systems',
    'propaganda-systems': 'Brand engagement metrics online',
    'citizen-models': 'Customer-segmentation database loaded',
    'tier-allocation': 'KPI ladder synchronized',
    'faction-init': 'Stakeholder sentiment calibrated',
    'pad-states': 'Logistics hubs synchronized',
    'narrator-voice': 'Press release queue primed',
    'all-systems-go': 'All KPIs green',
  },
  builder: {
    'planetary-core': 'Five-year plan loaded',
    'propaganda-systems': 'Workers committee briefed',
    'citizen-models': 'Production-quota database loaded',
    'pad-states': 'Industrial pad cohorts assembled',
    'all-systems-go': 'Production targets locked',
  },
  isolationist: {
    'planetary-core': 'Sealing the borders',
    'propaganda-systems': 'Defending purity of vision',
    'citizen-models': 'Cataloguing the worthy citizens',
    'all-systems-go': 'The walls are high',
  },
  subversive: {
    'planetary-core': 'Surveillance grid online',
    'propaganda-systems': 'Memetic vector primed',
    'citizen-models': 'Behavioral telemetry hooked',
    'tier-allocation': 'Compliance scoring ready',
    'narrator-voice': 'Confidante AI listening',
    'all-systems-go': 'Surveillance fully operational',
  },
  opportunist: {
    'planetary-core': 'Engagement engine spun up',
    'propaganda-systems': 'Trending topics primed',
    'citizen-models': 'Audience preference cache warm',
    'tier-allocation': 'Influencer ladder loaded',
    'all-systems-go': 'Live in 3, 2, 1...',
  },
  expansionist: {
    'planetary-core': 'Survival protocols engaged',
    'propaganda-systems': 'Ark recruitment broadcast online',
    'citizen-models': 'Refugee manifest loaded',
    'all-systems-go': 'The arks are ready',
  },
}

export function getThemedBootLabel(check: BootCheck, theme: Theme): string {
  if (check.isThemeReveal) {
    const polish = getThemePolish(theme.id)
    return polish.bootRevealLine
  }
  const override = PER_THEME_OVERRIDES[theme.aiPersonalityArchetype]?.[check.id]
  return override ?? check.defaultLabel
}

export function getThemeRevealLine(theme: Theme): string {
  return getThemePolish(theme.id).bootRevealLine
}

export type BootCheckStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface BootCheckState {
  readonly check: BootCheck
  status: BootCheckStatus
  ticksRemaining: number
  errorMessage?: string
}

export interface BootSequence {
  states: BootCheckState[]
  currentIdx: number
  finished: boolean
}

export function newBootSequence(checks: ReadonlyArray<BootCheck> = SMOL_BOOT_CHECKS): BootSequence {
  return {
    states: checks.map((c) => ({
      check: c,
      status: 'pending',
      ticksRemaining: c.weightTicks,
    })),
    currentIdx: 0,
    finished: false,
  }
}

export interface BootTickResult {
  readonly justCompleted: BootCheckState | null
  readonly finished: boolean
}

export function tickBootSequence(seq: BootSequence): BootTickResult {
  if (seq.finished) return { justCompleted: null, finished: true }
  const state = seq.states[seq.currentIdx]
  if (!state) {
    seq.finished = true
    return { justCompleted: null, finished: true }
  }
  if (state.status === 'pending') {
    state.status = 'running'
  }
  if (state.ticksRemaining > 0) {
    state.ticksRemaining -= 1
  }
  if (state.ticksRemaining <= 0 && state.status === 'running') {
    state.status = 'completed'
    seq.currentIdx += 1
    if (seq.currentIdx >= seq.states.length) seq.finished = true
    return { justCompleted: state, finished: seq.finished }
  }
  return { justCompleted: null, finished: false }
}

export function bootProgress(seq: BootSequence): number {
  if (seq.states.length === 0) return 1
  const completed = seq.states.filter((s) => s.status === 'completed').length
  return completed / seq.states.length
}
