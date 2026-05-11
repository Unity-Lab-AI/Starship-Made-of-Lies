import {
  type AIDifficultyLevel,
  type CivId,
  type MissionObjectiveConfig,
  type PlaystyleArchetype,
  type ThemeId,
  MATCH_LENGTH_TICKS_BLITZ,
  MATCH_LENGTH_TICKS_EPIC,
  MATCH_LENGTH_TICKS_STANDARD,
  THEMES,
  rollDistinctThemes,
} from '@smol/shared'

export type LobbyPhase = 'CONFIGURING' | 'STARTING' | 'IN_MATCH' | 'COMPLETE'

export type MatchLength = 'blitz' | 'standard' | 'epic' | 'open'

export type WinCondition = 'apex-tech' | 'last-civ-standing' | 'map-control' | 'score'

export type ConquestGateStrictness = 'loose' | 'standard' | 'strict' | 'multi-path'

export interface LobbyConfig {
  planetCount: number
  playerCount: number
  matchLength: MatchLength
  winConditions: ReadonlyArray<WinCondition>
  biomesAvailable: 'all' | 'tier0only' | 'tier0-1' | 'tier0-2'
  coopMode: boolean
  rollSeed: number
  conquestGateStrictness: ConquestGateStrictness
  missionObjectives: ReadonlyArray<MissionObjectiveConfig>
  tickCapOverride: number | null
}

export const DEFAULT_LOBBY_CONFIG: LobbyConfig = {
  planetCount: 100,
  playerCount: 8,
  matchLength: 'open',
  winConditions: ['apex-tech', 'last-civ-standing', 'map-control'],
  biomesAvailable: 'all',
  coopMode: false,
  rollSeed: 1234,
  conquestGateStrictness: 'standard',
  missionObjectives: [
    { id: 'highscore_target', target: 100000 },
    { id: 'last_civ_standing', target: 1 },
    { id: 'apex_tech', target: 1 },
  ],
  tickCapOverride: null,
}

export type SlotKind = 'human' | 'ai' | 'empty'

export interface MatchSlot {
  readonly slotIndex: number
  kind: SlotKind
  civId: CivId | null
  displayName: string
  themeId: ThemeId | null
  themeLocked: boolean
  themeRerolledOnce: boolean
  ready: boolean
  aiPlaystyle: PlaystyleArchetype | null
  aiDifficulty: AIDifficultyLevel | null
}

export const MAX_SLOTS = 12

export interface Lobby {
  config: LobbyConfig
  phase: LobbyPhase
  slots: MatchSlot[]
  hostCivId: CivId | null
  matchId: string | null
}

export function newLobby(matchId: string | null = null): Lobby {
  const slots: MatchSlot[] = []
  for (let i = 0; i < MAX_SLOTS; i++) {
    slots.push({
      slotIndex: i,
      kind: 'empty',
      civId: null,
      displayName: '',
      themeId: null,
      themeLocked: false,
      themeRerolledOnce: false,
      ready: false,
      aiPlaystyle: null,
      aiDifficulty: null,
    })
  }
  return {
    config: { ...DEFAULT_LOBBY_CONFIG },
    phase: 'CONFIGURING',
    slots,
    hostCivId: null,
    matchId,
  }
}

export function findEmptySlot(lobby: Lobby): MatchSlot | null {
  for (const slot of lobby.slots) {
    if (slot.kind === 'empty') return slot
  }
  return null
}

export function findSlotByCivId(lobby: Lobby, civId: CivId): MatchSlot | null {
  for (const slot of lobby.slots) {
    if (slot.civId === civId) return slot
  }
  return null
}

export function activeSlots(lobby: Lobby): ReadonlyArray<MatchSlot> {
  return lobby.slots.filter((s) => s.kind !== 'empty')
}

export function allSlotsReady(lobby: Lobby): boolean {
  const active = activeSlots(lobby)
  if (active.length < 2) return false
  return active.every((s) => s.ready)
}

export interface AddHumanInputs {
  readonly civId: CivId
  readonly displayName: string
  readonly preferredThemeId?: ThemeId
}

export function addHumanToLobby(lobby: Lobby, inputs: AddHumanInputs): MatchSlot | null {
  if (lobby.phase !== 'CONFIGURING') return null
  const slot = findEmptySlot(lobby)
  if (!slot) return null
  slot.kind = 'human'
  slot.civId = inputs.civId
  slot.displayName = inputs.displayName
  slot.ready = false
  if (lobby.hostCivId === null) lobby.hostCivId = inputs.civId
  return slot
}

export function nextPlayerNumberForLobby(lobby: Lobby): number {
  const used = new Set<number>()
  for (const slot of lobby.slots) {
    if (slot.kind === 'empty') continue
    const match = /^Player (\d+)$/.exec(slot.displayName)
    if (match && match[1]) used.add(Number(match[1]))
  }
  let n = 1
  while (used.has(n)) n++
  return n
}

export interface AddAnonymousHumanInputs {
  readonly civId: CivId
  readonly preferredThemeId?: ThemeId
}

export function addAnonymousHumanToLobby(
  lobby: Lobby,
  inputs: AddAnonymousHumanInputs,
): MatchSlot | null {
  const playerNumber = nextPlayerNumberForLobby(lobby)
  return addHumanToLobby(lobby, {
    civId: inputs.civId,
    displayName: `Player ${playerNumber}`,
    ...(inputs.preferredThemeId !== undefined && { preferredThemeId: inputs.preferredThemeId }),
  })
}

export interface OrphanCleanupInput {
  readonly lobby: Lobby
  readonly nowMs: number
  readonly lastHeartbeatByCivId: ReadonlyMap<CivId, number>
  readonly heartbeatTimeoutMs: number
}

export function cleanupOrphanedSlots(input: OrphanCleanupInput): ReadonlyArray<CivId> {
  const removed: CivId[] = []
  const cutoff = input.nowMs - input.heartbeatTimeoutMs
  for (const slot of input.lobby.slots) {
    if (slot.kind !== 'human') continue
    if (!slot.civId) continue
    const lastBeat = input.lastHeartbeatByCivId.get(slot.civId)
    if (lastBeat === undefined || lastBeat < cutoff) {
      removed.push(slot.civId)
    }
  }
  for (const civId of removed) {
    removeFromLobby(input.lobby, civId)
  }
  return removed
}

export interface AddAIInputs {
  readonly civId: CivId
  readonly playstyle: PlaystyleArchetype
  readonly difficulty: AIDifficultyLevel
  readonly displayName: string
}

export function addAIToLobby(lobby: Lobby, inputs: AddAIInputs): MatchSlot | null {
  if (lobby.phase !== 'CONFIGURING') return null
  const slot = findEmptySlot(lobby)
  if (!slot) return null
  slot.kind = 'ai'
  slot.civId = inputs.civId
  slot.displayName = inputs.displayName
  slot.aiPlaystyle = inputs.playstyle
  slot.aiDifficulty = inputs.difficulty
  slot.ready = true
  return slot
}

export function removeFromLobby(lobby: Lobby, civId: CivId): boolean {
  const slot = findSlotByCivId(lobby, civId)
  if (!slot) return false
  slot.kind = 'empty'
  slot.civId = null
  slot.displayName = ''
  slot.themeId = null
  slot.themeLocked = false
  slot.themeRerolledOnce = false
  slot.ready = false
  slot.aiPlaystyle = null
  slot.aiDifficulty = null
  if (lobby.hostCivId === civId) {
    const remainingHuman = lobby.slots.find((s) => s.kind === 'human')
    lobby.hostCivId = remainingHuman?.civId ?? null
  }
  return true
}

export function rollSlotThemes(lobby: Lobby, rng: () => number): void {
  const active = activeSlots(lobby)
  if (active.length === 0) return
  const themes = rollDistinctThemes(rng, Math.min(active.length, THEMES.length))
  active.forEach((slot, i) => {
    if (slot.themeLocked) return
    const themeId = themes[i]
    if (themeId) slot.themeId = themeId
  })
}

export function rerollSlotTheme(lobby: Lobby, civId: CivId, rng: () => number): boolean {
  const slot = findSlotByCivId(lobby, civId)
  if (!slot) return false
  if (slot.themeLocked || slot.themeRerolledOnce) return false
  if (lobby.phase !== 'CONFIGURING') return false
  const used = new Set<ThemeId>()
  for (const s of lobby.slots) {
    if (s.themeId && s.civId !== civId) used.add(s.themeId)
  }
  const candidates = THEMES.filter((t) => !used.has(t.id))
  if (candidates.length === 0) return false
  const idx = Math.floor(rng() * candidates.length)
  const picked = candidates[idx]
  if (!picked) return false
  slot.themeId = picked.id
  slot.themeRerolledOnce = true
  return true
}

export function lockSlotTheme(lobby: Lobby, civId: CivId): boolean {
  const slot = findSlotByCivId(lobby, civId)
  if (!slot || slot.themeId === null) return false
  slot.themeLocked = true
  return true
}

export function setSlotReady(lobby: Lobby, civId: CivId, ready: boolean): boolean {
  const slot = findSlotByCivId(lobby, civId)
  if (!slot) return false
  slot.ready = ready
  return true
}

export function transitionToStarting(lobby: Lobby): boolean {
  if (lobby.phase !== 'CONFIGURING') return false
  if (!allSlotsReady(lobby)) return false
  lobby.phase = 'STARTING'
  return true
}

export function transitionToInMatch(lobby: Lobby, matchId: string): void {
  lobby.phase = 'IN_MATCH'
  lobby.matchId = matchId
}

export function transitionToComplete(lobby: Lobby): void {
  lobby.phase = 'COMPLETE'
}

export function matchLengthInTicks(matchLength: MatchLength): number {
  // PHASE 17.B.4 — caps sourced from balance-constants per the locked 10-24h saga design.
  switch (matchLength) {
    case 'blitz':
      return MATCH_LENGTH_TICKS_BLITZ
    case 'standard':
      return MATCH_LENGTH_TICKS_STANDARD
    case 'epic':
      return MATCH_LENGTH_TICKS_EPIC
    case 'open':
      return Number.POSITIVE_INFINITY
  }
}

export function effectiveTickCap(config: LobbyConfig): number | null {
  if (config.tickCapOverride !== null) return config.tickCapOverride
  if (config.matchLength === 'open') return null
  return matchLengthInTicks(config.matchLength)
}
