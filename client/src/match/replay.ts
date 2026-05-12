// PHASE 18.3 — match replay buffer. Records periodic MatchState snapshots during play so
// the player can review past moments (load-snapshot-as-save) or rewind a match for analysis.
// Piggybacks on saveLoad's serializeMatch/deserializeMatch JSON pipeline so every snapshot
// is a fully-loadable save.
//
// Storage: in-memory circular buffer. Bounded to RING_CAPACITY (50) snapshots * snapshot
// interval (60 ticks ≈ 12 sec @ speed=1x) = roughly the last 10 minutes of play. Memory cost
// at ~200KB per snapshot × 50 = ~10MB worst-case for late-game matches. Acceptable for v1;
// IndexedDB-backed persistence is a polish pass.
//
// Wire: useMatchSim calls `recordReplaySnapshot(state, rngSeed)` once every
// REPLAY_SNAPSHOT_INTERVAL_TICKS. PlayPage's UI surfaces a "View replay buffer" panel that
// lists snapshot ticks + lets the player rewind to any of them (uses deserializeMatch to
// reinstall the snapshot as the live state).

import { type MatchState } from './MatchSim'
import { serializeMatch, deserializeMatch } from './saveLoad'

// Snapshot every 60 sim ticks. At 5Hz (speed=1x) that's once every 12 sec; at 4× speed it's
// every 3 sec. The cadence stays roughly constant in real-time because the sim ticks faster
// at higher speeds.
export const REPLAY_SNAPSHOT_INTERVAL_TICKS = 60

// Max entries held in memory. 50 × 12 sec ≈ 10 min replay window @ speed=1x.
export const REPLAY_RING_CAPACITY = 50

export interface ReplaySnapshotEntry {
  readonly index: number
  readonly atTick: number
  readonly capturedAtMs: number
  // Serialized payload — matches saveLoad's wire format so deserializeMatch loads it directly.
  readonly serialized: string
}

class ReplayRingBuffer {
  private readonly entries: ReplaySnapshotEntry[] = []
  private nextIndex = 0

  push(state: MatchState, rngSeed: number): ReplaySnapshotEntry {
    const entry: ReplaySnapshotEntry = {
      index: this.nextIndex++,
      atTick: state.currentTick,
      capturedAtMs: Date.now(),
      serialized: serializeMatch(state, rngSeed),
    }
    this.entries.push(entry)
    if (this.entries.length > REPLAY_RING_CAPACITY) this.entries.shift()
    return entry
  }

  list(): ReadonlyArray<ReplaySnapshotEntry> {
    return this.entries
  }

  get(index: number): ReplaySnapshotEntry | null {
    return this.entries.find((e) => e.index === index) ?? null
  }

  getLatest(): ReplaySnapshotEntry | null {
    return this.entries.length === 0 ? null : this.entries[this.entries.length - 1]!
  }

  clear(): void {
    this.entries.length = 0
    this.nextIndex = 0
  }

  size(): number {
    return this.entries.length
  }
}

// One global buffer per session. New matches don't clear it automatically — the host calls
// `clearReplayBuffer()` on new-match boundary if they want a fresh slate.
const singletonBuffer = new ReplayRingBuffer()

export function recordReplaySnapshot(
  state: MatchState,
  rngSeed: number,
): ReplaySnapshotEntry | null {
  // Only capture on the interval boundary so callers can call this every tick without filtering.
  if (state.currentTick % REPLAY_SNAPSHOT_INTERVAL_TICKS !== 0) return null
  return singletonBuffer.push(state, rngSeed)
}

// recordReplaySnapshotForced was a force-on-event capture helper. Retired 2026-05-12 alongside
// the rest of the mid-match replay UI per user "no replay until the game is over". If
// post-match review ever ships, force-capture at match-end events is the right entry point —
// resurrect this helper there.

export function listReplaySnapshots(): ReadonlyArray<ReplaySnapshotEntry> {
  return singletonBuffer.list()
}

export function loadReplaySnapshot(index: number): MatchState | null {
  const entry = singletonBuffer.get(index)
  if (!entry) return null
  return deserializeMatch(entry.serialized)
}

export function loadLatestReplaySnapshot(): MatchState | null {
  const entry = singletonBuffer.getLatest()
  if (!entry) return null
  return deserializeMatch(entry.serialized)
}

export function clearReplayBuffer(): void {
  singletonBuffer.clear()
}

export function replayBufferSize(): number {
  return singletonBuffer.size()
}
