// PHASE 17.L.A.13 — Q12 PHASE 17 LOCKED. Save / Load host-configurable. Two-function helper
// (serializeMatch + deserializeMatch) using a JSON replacer/reviver pair that tags Map + Set
// instances so the deserializer can restore them. The mulberry32 rng function can't serialize
// (it's a closure); we save the original seed and re-create rng on deserialize.
//
// V1 compromise: post-resume rng diverges from a continuous play session because we restart
// the rng from the original seed (no internal-state capture). Saved STATE is faithful; future
// rng calls from resume forward are deterministic from the same seed.

import { mulberry32 } from '@smol/shared'
import type { MatchState } from './MatchSim'

export const SAVE_VERSION = 1
export const SAVE_STORAGE_KEY = 'smol.savedmatch.v1'

interface TaggedMap {
  readonly __k: 'Map'
  readonly e: ReadonlyArray<[unknown, unknown]>
}

interface TaggedSet {
  readonly __k: 'Set'
  readonly v: ReadonlyArray<unknown>
}

function isTaggedMap(v: unknown): v is TaggedMap {
  return typeof v === 'object' && v !== null && (v as { __k?: string }).__k === 'Map'
}

function isTaggedSet(v: unknown): v is TaggedSet {
  return typeof v === 'object' && v !== null && (v as { __k?: string }).__k === 'Set'
}

// Strip the rng function from the state before stringifying — replaced on revive.
function serializeReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'function') return undefined
  if (value instanceof Map) {
    return { __k: 'Map', e: [...value.entries()] } satisfies TaggedMap
  }
  if (value instanceof Set) {
    return { __k: 'Set', v: [...value.values()] } satisfies TaggedSet
  }
  return value
}

function deserializeReviver(_key: string, value: unknown): unknown {
  if (isTaggedMap(value)) return new Map(value.e)
  if (isTaggedSet(value)) return new Set(value.v)
  return value
}

export interface SerializedSave {
  readonly version: number
  readonly savedAt: number
  readonly currentTick: number
  readonly rngSeed: number
  readonly state: string
}

// PHASE 17.L.A.13 — serialize a live MatchState to a JSON string for localStorage. The rng
// seed is stored separately so deserializeMatch can rebuild the closure on resume.
export function serializeMatch(state: MatchState, rngSeed: number): string {
  const payload: SerializedSave = {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    currentTick: state.currentTick,
    rngSeed,
    state: JSON.stringify(state, serializeReplacer),
  }
  return JSON.stringify(payload)
}

// PHASE 17.L.A.13 — deserialize a previously-saved match. Returns null on version mismatch
// or malformed input. Caller installs the returned state into stateRef and re-renders.
export function deserializeMatch(json: string): MatchState | null {
  try {
    const payload = JSON.parse(json) as SerializedSave
    if (!payload || typeof payload !== 'object' || payload.version !== SAVE_VERSION) return null
    const parsed = JSON.parse(payload.state, deserializeReviver) as MatchState & {
      rng?: unknown
    }
    // Rebuild rng closure from the saved seed. v1 compromise: doesn't capture mid-stream rng
    // state — calls after resume diverge from a continuous play.
    ;(parsed as { rng: () => number }).rng = mulberry32(payload.rngSeed ^ 0xa5a5a5)
    return parsed
  } catch {
    return null
  }
}

// PHASE 17.L.A.13 — localStorage convenience helpers.
export function saveMatchToStorage(state: MatchState, rngSeed: number): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(SAVE_STORAGE_KEY, serializeMatch(state, rngSeed))
    return true
  } catch {
    // Quota exceeded / sandbox / private-mode — caller surfaces a toast.
    return false
  }
}

export function loadMatchFromStorage(): MatchState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY)
    if (!raw) return null
    return deserializeMatch(raw)
  } catch {
    return null
  }
}

export function hasSavedMatch(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SAVE_STORAGE_KEY) !== null
}

export function clearSavedMatch(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(SAVE_STORAGE_KEY)
  } catch {
    // ignore
  }
}
