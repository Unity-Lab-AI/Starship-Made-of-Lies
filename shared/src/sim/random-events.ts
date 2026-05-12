// PHASE 18.4 — galactic random events. Per user verbatim 2026-05-10 ("18.4 random events
// catalog ~30 events; pure additive data"). Each event has trigger conditions + duration +
// per-tick effects + theme-flavored description. Catalog ships ~30 events across 5 categories:
// natural (solar flare / plague / supernova), economic (trade caravan / cosmic phenomenon),
// social (refugee wave / cultural awakening), military (indigenous uprising / mercenary band),
// and discovery (ancient tech / relic / signal).
//
// Dispatcher tick checks a per-civ event budget driven by host-configurable intensity (off /
// low / medium / high) — higher intensity raises both the spawn probability AND the per-tick
// cap on active events. v1 ships the catalog + dispatcher + per-tick effects; banner UI in
// PlayPage + EventsLogPanel surface history live in client/.
//
// Pure-sim: no React, no DOM, no localStorage. Imports only types + ResourceId helpers from
// the rest of shared/.

import type { CivId, ResourceId } from '../types/index'
import {
  RESOURCE_AMMUNITION,
  RESOURCE_COMPONENTS,
  RESOURCE_ELECTRONICS,
  RESOURCE_FOOD,
  RESOURCE_FUEL,
  RESOURCE_INGOTS,
  RESOURCE_METALS,
  RESOURCE_PROPAGANDA_MATERIALS,
} from './resources'

// PHASE 18.4 — host-configurable random-event intensity. Off disables the system entirely.
// Low / medium / high scale spawn probability + per-civ active-event cap.
export type RandomEventIntensity = 'off' | 'low' | 'medium' | 'high'

export const RANDOM_EVENT_INTENSITY_CONFIG: Readonly<
  Record<
    RandomEventIntensity,
    {
      readonly probabilityPerTick: number
      readonly maxActivePerCiv: number
    }
  >
> = {
  off: { probabilityPerTick: 0, maxActivePerCiv: 0 },
  low: { probabilityPerTick: 0.001, maxActivePerCiv: 2 },
  medium: { probabilityPerTick: 0.003, maxActivePerCiv: 4 },
  high: { probabilityPerTick: 0.008, maxActivePerCiv: 6 },
}

export type RandomEventCategory = 'natural' | 'economic' | 'social' | 'military' | 'discovery'

export interface RandomEventDef {
  readonly id: string
  readonly category: RandomEventCategory
  readonly emoji: string
  readonly title: string
  readonly description: string
  // Duration in ticks. 0 = instant effect (no banner persistence; one-shot push to the log).
  readonly durationTicks: number
  // Optional per-tick resource deltas applied to the affected civ's home-planet inventory while
  // active. Positive = gain, negative = loss. Loss is clamped at 0 (won't push stocks negative).
  readonly resourceDeltaPerTick?: ReadonlyArray<{ resource: ResourceId; delta: number }>
  // Optional one-shot resource grants at activation time (separate from per-tick deltas).
  readonly oneShotGrant?: ReadonlyArray<{ resource: ResourceId; amount: number }>
  // Optional one-shot resource loss at activation time. Clamped at current stock.
  readonly oneShotLoss?: ReadonlyArray<{ resource: ResourceId; amount: number }>
  // Optional research-speed multiplier applied to the affected civ while active (1 = no change).
  readonly researchSpeedMultiplier?: number
  // Optional build-speed multiplier applied to the affected civ while active (1 = no change).
  readonly buildSpeedMultiplier?: number
  // Population delta applied at activation time. Negative = casualties; positive = refugees.
  readonly populationDelta?: number
  // Per-tick population delta while active. Used by plague-style events.
  readonly populationDeltaPerTick?: number
  // Targeting: 'self' = the rolling civ; 'other' = a randomly-chosen other civ; 'global' = all civs.
  readonly target: 'self' | 'other' | 'global'
}

// PHASE 18.4 — active event instance on a specific civ. Tracks remaining duration + the def id.
// MatchState holds Map<CivId, ActiveRandomEvent[]>.
export interface ActiveRandomEvent {
  readonly defId: string
  readonly civId: CivId
  readonly startedAtTick: number
  ticksRemaining: number
}

// PHASE 18.4 — the 30-event catalog. Categorized + sized for variety across a 10-24hr saga.
// Per-tick deltas are sized for a 200ms tick (5Hz) — across the full duration, totals come out
// to "noticeable but not match-ending" (a 500-tick plague at -1 pop/tick = -500 pop, ~half a
// starter city, recoverable). Tune via DURATION + DELTA pair if balance shifts.
export const RANDOM_EVENTS: ReadonlyArray<RandomEventDef> = [
  // --- Natural (8) ---
  {
    id: 'solar-flare',
    category: 'natural',
    emoji: '☀️',
    title: 'Solar Flare',
    description: 'Stellar radiation surges. Electronics production halts; communications degrade.',
    durationTicks: 250,
    resourceDeltaPerTick: [{ resource: RESOURCE_ELECTRONICS, delta: -1 }],
    target: 'self',
  },
  {
    id: 'plague-outbreak',
    category: 'natural',
    emoji: '🦠',
    title: 'Plague Outbreak',
    description: 'A novel pathogen spreads through your civilian population.',
    durationTicks: 500,
    populationDeltaPerTick: -1,
    target: 'self',
  },
  {
    id: 'meteor-shower',
    category: 'natural',
    emoji: '☄️',
    title: 'Meteor Shower',
    description: 'A dense meteoroid swarm bombards your homeworld surface.',
    durationTicks: 80,
    resourceDeltaPerTick: [
      { resource: RESOURCE_METALS, delta: 2 },
      { resource: RESOURCE_INGOTS, delta: 1 },
    ],
    populationDeltaPerTick: -0.2,
    target: 'self',
  },
  {
    id: 'supernova-distant',
    category: 'natural',
    emoji: '💥',
    title: 'Distant Supernova',
    description: 'A neighboring star detonates. Civilizations across the galaxy halt to observe.',
    durationTicks: 200,
    researchSpeedMultiplier: 1.2,
    target: 'global',
  },
  {
    id: 'volcanic-eruption',
    category: 'natural',
    emoji: '🌋',
    title: 'Volcanic Eruption',
    description: 'A continent-scale eruption blankets your skies in ash.',
    durationTicks: 300,
    resourceDeltaPerTick: [{ resource: RESOURCE_FOOD, delta: -2 }],
    buildSpeedMultiplier: 0.85,
    target: 'self',
  },
  {
    id: 'earthquake',
    category: 'natural',
    emoji: '🌍',
    title: 'Tectonic Shift',
    description: 'Continental plates buckle. Infrastructure damaged.',
    durationTicks: 120,
    oneShotLoss: [
      { resource: RESOURCE_COMPONENTS, amount: 50 },
      { resource: RESOURCE_INGOTS, amount: 100 },
    ],
    populationDelta: -25,
    target: 'self',
  },
  {
    id: 'solar-eclipse',
    category: 'natural',
    emoji: '🌑',
    title: 'Solar Eclipse',
    description: 'A long shadow falls across your homeworld. Solar power output drops.',
    durationTicks: 60,
    resourceDeltaPerTick: [{ resource: RESOURCE_FUEL, delta: -1 }],
    target: 'self',
  },
  {
    id: 'cosmic-radiation-spike',
    category: 'natural',
    emoji: '☢️',
    title: 'Cosmic Radiation Spike',
    description: 'Galactic background radiation jumps. Reactor shielding strained.',
    durationTicks: 180,
    resourceDeltaPerTick: [{ resource: RESOURCE_FUEL, delta: -1 }],
    populationDeltaPerTick: -0.3,
    target: 'self',
  },

  // --- Economic (6) ---
  {
    id: 'trade-windfall',
    category: 'economic',
    emoji: '💰',
    title: 'Trade Windfall',
    description: 'An off-grid merchant clan offers a one-time bulk swap.',
    durationTicks: 0,
    oneShotGrant: [
      { resource: RESOURCE_COMPONENTS, amount: 200 },
      { resource: RESOURCE_ELECTRONICS, amount: 50 },
    ],
    target: 'self',
  },
  {
    id: 'resource-boom',
    category: 'economic',
    emoji: '⛏️',
    title: 'Resource Boom',
    description: 'New ore veins discovered. Refinery yield doubles temporarily.',
    durationTicks: 400,
    resourceDeltaPerTick: [
      { resource: RESOURCE_METALS, delta: 3 },
      { resource: RESOURCE_INGOTS, delta: 2 },
    ],
    target: 'self',
  },
  {
    id: 'famine',
    category: 'economic',
    emoji: '🌾',
    title: 'Crop Failure',
    description: 'Blight sweeps your farms. Food stores hemorrhage.',
    durationTicks: 350,
    resourceDeltaPerTick: [{ resource: RESOURCE_FOOD, delta: -3 }],
    target: 'self',
  },
  {
    id: 'fuel-cartel',
    category: 'economic',
    emoji: '🛢️',
    title: 'Fuel Cartel Embargo',
    description: 'A trade syndicate cuts off fuel imports.',
    durationTicks: 250,
    resourceDeltaPerTick: [{ resource: RESOURCE_FUEL, delta: -2 }],
    target: 'self',
  },
  {
    id: 'cosmic-phenomenon',
    category: 'economic',
    emoji: '🌌',
    title: 'Cosmic Phenomenon',
    description: 'A galactic conjunction electrifies your scientists. Research surges.',
    durationTicks: 300,
    researchSpeedMultiplier: 1.3,
    target: 'global',
  },
  {
    id: 'industrial-strike',
    category: 'economic',
    emoji: '✊',
    title: 'Industrial Strike',
    description: 'Workers walk off the line. Factory output collapses.',
    durationTicks: 200,
    buildSpeedMultiplier: 0.6,
    target: 'self',
  },

  // --- Social (6) ---
  {
    id: 'refugee-wave',
    category: 'social',
    emoji: '🚸',
    title: 'Refugee Wave',
    description: 'Ships from another civilization arrive seeking sanctuary.',
    durationTicks: 0,
    populationDelta: 100,
    target: 'self',
  },
  {
    id: 'cultural-awakening',
    category: 'social',
    emoji: '🎭',
    title: 'Cultural Awakening',
    description: 'A wave of artistic fervor sweeps your population. Propaganda materials surge.',
    durationTicks: 300,
    resourceDeltaPerTick: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, delta: 2 }],
    target: 'self',
  },
  {
    id: 'religious-movement',
    category: 'social',
    emoji: '🛐',
    title: 'Religious Movement',
    description: 'A new sect rises. Population growth surges; research slows.',
    durationTicks: 400,
    populationDeltaPerTick: 0.4,
    researchSpeedMultiplier: 0.85,
    target: 'self',
  },
  {
    id: 'baby-boom',
    category: 'social',
    emoji: '👶',
    title: 'Baby Boom',
    description: 'Birth rates spike. Schools strained but future labor pool grows.',
    durationTicks: 500,
    populationDeltaPerTick: 0.6,
    target: 'self',
  },
  {
    id: 'dissident-leak',
    category: 'social',
    emoji: '📢',
    title: 'Dissident Information Leak',
    description:
      'Damning state secrets escape into public discourse. Propaganda credibility falls.',
    durationTicks: 250,
    resourceDeltaPerTick: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, delta: -2 }],
    target: 'self',
  },
  {
    id: 'mass-exodus',
    category: 'social',
    emoji: '🏃',
    title: 'Mass Exodus',
    description: 'A large faction emigrates to a rival civilization.',
    durationTicks: 0,
    populationDelta: -150,
    target: 'self',
  },

  // --- Military (5) ---
  {
    id: 'indigenous-uprising',
    category: 'military',
    emoji: '🪓',
    title: 'Indigenous Uprising',
    description: 'Local hostile factions launch a coordinated assault.',
    durationTicks: 200,
    oneShotLoss: [
      { resource: RESOURCE_AMMUNITION, amount: 500 },
      { resource: RESOURCE_PROPAGANDA_MATERIALS, amount: 75 },
    ],
    populationDelta: -50,
    target: 'self',
  },
  {
    id: 'mercenary-band',
    category: 'military',
    emoji: '⚔️',
    title: 'Mercenary Band Available',
    description: 'A roving warband offers their services. They take fuel and ammunition.',
    durationTicks: 0,
    oneShotGrant: [{ resource: RESOURCE_AMMUNITION, amount: 300 }],
    oneShotLoss: [{ resource: RESOURCE_FUEL, amount: 50 }],
    target: 'self',
  },
  {
    id: 'pirate-raid',
    category: 'military',
    emoji: '🏴‍☠️',
    title: 'Pirate Raid',
    description: 'Unmarked ships ambush your supply lines.',
    durationTicks: 80,
    oneShotLoss: [
      { resource: RESOURCE_COMPONENTS, amount: 100 },
      { resource: RESOURCE_ELECTRONICS, amount: 30 },
    ],
    target: 'self',
  },
  {
    id: 'weapons-cache-found',
    category: 'military',
    emoji: '💣',
    title: 'Weapons Cache Discovered',
    description: 'An old munitions stockpile is uncovered in the ruins.',
    durationTicks: 0,
    oneShotGrant: [{ resource: RESOURCE_AMMUNITION, amount: 800 }],
    target: 'self',
  },
  {
    id: 'border-incident',
    category: 'military',
    emoji: '🚨',
    title: 'Border Incident',
    description: 'A skirmish on your edge. Casualties + materiel loss.',
    durationTicks: 0,
    populationDelta: -30,
    oneShotLoss: [{ resource: RESOURCE_AMMUNITION, amount: 200 }],
    target: 'self',
  },

  // --- Discovery (5) ---
  {
    id: 'ancient-tech-discovery',
    category: 'discovery',
    emoji: '🗿',
    title: 'Ancient Tech Discovery',
    description: 'Archaeologists unearth pre-collapse technology. Research surges.',
    durationTicks: 400,
    researchSpeedMultiplier: 1.4,
    target: 'self',
  },
  {
    id: 'relic-uncovered',
    category: 'discovery',
    emoji: '🏺',
    title: 'Relic Uncovered',
    description:
      'A precursor relic emits unexplained signals. Propaganda surges from the spectacle.',
    durationTicks: 200,
    resourceDeltaPerTick: [{ resource: RESOURCE_PROPAGANDA_MATERIALS, delta: 3 }],
    target: 'self',
  },
  {
    id: 'signal-from-the-void',
    category: 'discovery',
    emoji: '📡',
    title: 'Signal from the Void',
    description: 'A coherent transmission of unknown origin captures global attention.',
    durationTicks: 500,
    researchSpeedMultiplier: 1.15,
    target: 'global',
  },
  {
    id: 'derelict-fleet',
    category: 'discovery',
    emoji: '🚀',
    title: 'Derelict Fleet Found',
    description: 'An abandoned mining fleet drifts into your space. Components salvaged.',
    durationTicks: 0,
    oneShotGrant: [
      { resource: RESOURCE_COMPONENTS, amount: 400 },
      { resource: RESOURCE_METALS, amount: 200 },
    ],
    target: 'self',
  },
  {
    id: 'breakthrough-laboratory',
    category: 'discovery',
    emoji: '🧪',
    title: 'Laboratory Breakthrough',
    description: 'Your scientists make a sudden leap.',
    durationTicks: 600,
    researchSpeedMultiplier: 1.25,
    target: 'self',
  },
]

// PHASE 18.4 — catalog lookup helper. Used by the tick handler + the banner UI.
const eventCatalogIndex = new Map<string, RandomEventDef>(RANDOM_EVENTS.map((e) => [e.id, e]))

export function getRandomEventDef(id: string): RandomEventDef | undefined {
  return eventCatalogIndex.get(id)
}

// PHASE 18.4 — tick inputs. The caller (MatchSim tickMatch) supplies:
// - currentTick: monotonically-increasing match tick.
// - intensity: host-configured intensity ('off' disables all spawning + ticking).
// - rng: deterministic match RNG.
// - civIds: every alive civ id eligible to receive events. The dispatcher iterates each civ +
//   rolls against the configured probability per tick.
// - currentByCiv: existing active events per civ (mutable). Tick decrements ticksRemaining
//   and prunes finished entries.
export interface RandomEventTickInputs {
  readonly currentTick: number
  readonly intensity: RandomEventIntensity
  readonly rng: () => number
  readonly civIds: ReadonlyArray<CivId>
  readonly currentByCiv: Map<CivId, ActiveRandomEvent[]>
}

export interface RandomEventTickResult {
  // Newly-spawned events on this tick. Caller uses these to apply oneShot deltas + push the
  // banner event to the match log.
  readonly newlySpawned: ReadonlyArray<ActiveRandomEvent>
  // Events that finished on this tick (ticksRemaining hit 0). Caller pushes a "concluded" log
  // event for these.
  readonly justFinished: ReadonlyArray<ActiveRandomEvent>
}

export function tickRandomEvents(inputs: RandomEventTickInputs): RandomEventTickResult {
  const newlySpawned: ActiveRandomEvent[] = []
  const justFinished: ActiveRandomEvent[] = []
  const intensityCfg = RANDOM_EVENT_INTENSITY_CONFIG[inputs.intensity]
  if (intensityCfg.probabilityPerTick === 0) {
    // 'off' — short-circuit. Still tick down any leftover active events from a prior intensity
    // setting so they finish naturally.
    for (const civId of inputs.civIds) {
      const active = inputs.currentByCiv.get(civId)
      if (!active || active.length === 0) continue
      for (const evt of active) evt.ticksRemaining -= 1
      const survivors = active.filter((evt) => {
        if (evt.ticksRemaining > 0) return true
        justFinished.push(evt)
        return false
      })
      if (survivors.length === 0) inputs.currentByCiv.delete(civId)
      else inputs.currentByCiv.set(civId, survivors)
    }
    return { newlySpawned, justFinished }
  }
  // Active-event maintenance — tick down everyone's existing events first.
  for (const civId of inputs.civIds) {
    const active = inputs.currentByCiv.get(civId)
    if (!active || active.length === 0) continue
    for (const evt of active) evt.ticksRemaining -= 1
    const survivors = active.filter((evt) => {
      if (evt.ticksRemaining > 0) return true
      justFinished.push(evt)
      return false
    })
    if (survivors.length === 0) inputs.currentByCiv.delete(civId)
    else inputs.currentByCiv.set(civId, survivors)
  }
  // Spawn roll — each civ rolls independently. Cap at intensity's maxActivePerCiv.
  for (const civId of inputs.civIds) {
    const active = inputs.currentByCiv.get(civId) ?? []
    if (active.length >= intensityCfg.maxActivePerCiv) continue
    if (inputs.rng() >= intensityCfg.probabilityPerTick) continue
    // Pick an event. Bias slightly toward 'self' targets vs 'global' so global events don't
    // dominate (global events fire on every civ when picked, multiplying their effective rate).
    const candidates = RANDOM_EVENTS.filter((e) => e.target === 'self' || e.target === 'global')
    if (candidates.length === 0) continue
    const def = candidates[Math.floor(inputs.rng() * candidates.length)]!
    // Dedupe: don't spawn an event the civ already has active.
    if (active.some((e) => e.defId === def.id)) continue
    const fresh: ActiveRandomEvent = {
      defId: def.id,
      civId,
      startedAtTick: inputs.currentTick,
      ticksRemaining: Math.max(1, def.durationTicks),
    }
    newlySpawned.push(fresh)
    inputs.currentByCiv.set(civId, [...active, fresh])
  }
  return { newlySpawned, justFinished }
}

// PHASE 18.4 — bannerable label helper. Renders the active event title + emoji + ticks-remaining
// for the top-of-screen banner. Returns null when the def is unknown (defensive).
export function formatActiveEventBanner(active: ActiveRandomEvent): string | null {
  const def = getRandomEventDef(active.defId)
  if (!def) return null
  if (def.durationTicks === 0) return `${def.emoji} ${def.title}`
  return `${def.emoji} ${def.title} (T-${active.ticksRemaining})`
}
