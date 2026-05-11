import { type CivId, type PlanetId } from '../types/index'
import { type CitizenTier } from './population'

export type DeathCause =
  | 'starvation'
  | 'no_air'
  | 'no_water'
  | 'explosion'
  | 'combat'
  | 'colony_ship_volunteered'
  | 'crash_landing'
  | 'plague'

export const DEATH_CAUSES: ReadonlyArray<DeathCause> = [
  'starvation',
  'no_air',
  'no_water',
  'explosion',
  'combat',
  'colony_ship_volunteered',
  'crash_landing',
  'plague',
]

export interface DeathEvent {
  readonly tick: number
  readonly civId: CivId
  readonly planetId: PlanetId | null
  readonly cause: DeathCause
  readonly count: number
  readonly tier: CitizenTier | null
  readonly note: string | null
}

const DEATH_LOG_CAPACITY = 256

export interface DeathLedger {
  readonly civId: CivId
  events: DeathEvent[]
  totalsByCause: Record<DeathCause, number>
}

export function newDeathLedger(civId: CivId): DeathLedger {
  return {
    civId,
    events: [],
    totalsByCause: {
      starvation: 0,
      no_air: 0,
      no_water: 0,
      explosion: 0,
      combat: 0,
      colony_ship_volunteered: 0,
      crash_landing: 0,
      plague: 0,
    },
  }
}

export interface RecordDeathInputs {
  readonly tick: number
  readonly planetId: PlanetId | null
  readonly cause: DeathCause
  readonly count: number
  readonly tier: CitizenTier | null
  readonly note?: string
}

export function recordDeath(ledger: DeathLedger, inputs: RecordDeathInputs): DeathEvent {
  if (inputs.count < 0) {
    throw new Error(`recordDeath: count must be non-negative, got ${inputs.count}`)
  }
  const event: DeathEvent = {
    tick: inputs.tick,
    civId: ledger.civId,
    planetId: inputs.planetId,
    cause: inputs.cause,
    count: inputs.count,
    tier: inputs.tier,
    note: inputs.note ?? null,
  }
  ledger.events.push(event)
  ledger.totalsByCause[inputs.cause] += inputs.count
  while (ledger.events.length > DEATH_LOG_CAPACITY) ledger.events.shift()
  return event
}

export function deathsInWindow(
  ledger: DeathLedger,
  windowStartTick: number,
  windowEndTick: number,
): ReadonlyArray<DeathEvent> {
  return ledger.events.filter((e) => e.tick >= windowStartTick && e.tick <= windowEndTick)
}

export function deathsByCause(ledger: DeathLedger, cause: DeathCause): number {
  return ledger.totalsByCause[cause]
}

export function totalDeaths(ledger: DeathLedger): number {
  let sum = 0
  for (const cause of DEATH_CAUSES) sum += ledger.totalsByCause[cause]
  return sum
}

export function deathCauseLabel(cause: DeathCause): string {
  switch (cause) {
    case 'starvation':
      return 'Starvation'
    case 'no_air':
      return 'Lack of Air'
    case 'no_water':
      return 'Lack of Water'
    case 'explosion':
      return 'Explosion'
    case 'combat':
      return 'Combat'
    case 'colony_ship_volunteered':
      return 'Colony Ship Volunteer (One-Way)'
    case 'crash_landing':
      return 'Crash Landing'
    case 'plague':
      return 'Plague'
  }
}
