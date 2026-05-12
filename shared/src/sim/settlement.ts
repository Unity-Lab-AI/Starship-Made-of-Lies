import { type PlanetId, type SettlementId, type TileId, settlementId } from '../types/index'

// PHASE 17.13.1 — settlement data model. A Settlement represents a region of a planet
// anchored on a civic-center tile, with claimed surrounding territory. Every planet ships
// with a default Capital settlement at match-start covering every tile; founding additional
// civic centers carves out new settlements with their own territory.
//
// Per user verbatim 2026-05-10 "multi-settlement per planet — players can have unlimited
// settlements per planet, each with its own population/inventory/workforce/buildings". V1
// ships the data model + the founding mechanic + the picker UI; per-settlement inventory /
// population / workforce bifurcation happens in 17.13.6's aggregate-vs-detail toggle once
// the data model is in place. Until then the planet-level aggregates remain the source of
// truth and the Capital settlement is the implicit container for all of it.

export type SettlementStatus = 'capital' | 'founded' | 'colonizing' | 'ruined'

export interface Settlement {
  readonly id: SettlementId
  readonly planetId: PlanetId
  // Human-readable name. Theme system can override via per-theme settlement-naming rules
  // (17.13.10) — defaults to 'Capital' / 'Region-{N}' until that polish pass lands.
  name: string
  // Tile hosting the civic-center building (or null for the default capital pre-civic-center
  // era — the implicit capital exists even without a placed building so the game has a
  // settlement to scope state under from match-start).
  civicCenterTileId: TileId | null
  // Tiles claimed by this settlement. Capital starts with every tile on the planet;
  // founded settlements start with the civic-center tile + its 3-ring radius (per 17.13.3).
  readonly controlledTileIds: Set<TileId>
  status: SettlementStatus
  // Tick when this settlement was founded. 0 for the default Capital.
  readonly foundedAtTick: number
}

// PHASE 17.13.10 — settlement naming. V1 uses simple capital-or-region naming; theme
// overrides (Theocracy = "Holy [Planet] Cathedral", Corporate = "Region [Planet]-A", etc.)
// wire in via the theme system when 17.13.10's polish pass ships. The default naming below
// is safe for every theme and matches the user's "Region-N" pattern from the TODO.
export function defaultSettlementName(
  status: SettlementStatus,
  ordinal: number,
  planetIdString: string,
): string {
  if (status === 'capital') return `Capital ${planetIdString}`
  return `Region ${planetIdString}-${ordinal}`
}

// Construct the default Capital settlement covering every tile on the planet. Called by
// makePlanetState during match creation so every owned planet boots with one settlement
// from tick 0.
export function newCapitalSettlement(
  planetIdValue: PlanetId,
  allTileIds: ReadonlyArray<TileId>,
  planetIdString: string,
): Settlement {
  return {
    id: settlementId(`settlement-${planetIdString}-capital`),
    planetId: planetIdValue,
    name: defaultSettlementName('capital', 0, planetIdString),
    civicCenterTileId: null,
    controlledTileIds: new Set(allTileIds),
    status: 'capital',
    foundedAtTick: 0,
  }
}

// Construct a founded settlement when the player places a civic-center building. Caller
// computes the initial controlled-tile set (the civic-center tile + a 3-ring radius of
// adjacent tiles, minus any already-controlled by other settlements — see 17.13.3).
export function newFoundedSettlement(
  planetIdValue: PlanetId,
  planetIdString: string,
  ordinal: number,
  civicCenterTileIdValue: TileId,
  claimedTileIds: ReadonlyArray<TileId>,
  foundedAtTick: number,
): Settlement {
  const idString = `settlement-${planetIdString}-${ordinal}`
  return {
    id: settlementId(idString),
    planetId: planetIdValue,
    name: defaultSettlementName('founded', ordinal, planetIdString),
    civicCenterTileId: civicCenterTileIdValue,
    controlledTileIds: new Set(claimedTileIds),
    status: 'founded',
    foundedAtTick,
  }
}

// PHASE 17.13.11 — founding limits via physics. A settlement requires at least 1 empty
// owned tile for the civic center + 3 empty owned tiles in its initial radius for production.
// Returns the structured eligibility result so the UI can surface specific failure modes.
// NO SOFTWARE CAP — the only gate is tile availability per the user verbatim "NO SOFTWARE
// CAP BELOW THE PHYSICAL TILE-AVAILABILITY GATE".
export interface FoundEligibility {
  readonly ok: boolean
  readonly reason?:
    | 'civicCenterTileNotEmpty'
    | 'notEnoughOpenGround'
    | 'tileNotOwnedByCiv'
    | 'tileAlreadyInOtherSettlement'
}

export function canFoundSettlementAt(inputs: {
  readonly civicCenterTileEmpty: boolean
  readonly civicCenterTileOwnedByCiv: boolean
  readonly civicCenterTileAlreadyClaimed: boolean
  readonly nearbyEmptyTileCount: number
}): FoundEligibility {
  if (!inputs.civicCenterTileOwnedByCiv) {
    return { ok: false, reason: 'tileNotOwnedByCiv' }
  }
  if (!inputs.civicCenterTileEmpty) {
    return { ok: false, reason: 'civicCenterTileNotEmpty' }
  }
  if (inputs.civicCenterTileAlreadyClaimed) {
    return { ok: false, reason: 'tileAlreadyInOtherSettlement' }
  }
  if (inputs.nearbyEmptyTileCount < 3) {
    return { ok: false, reason: 'notEnoughOpenGround' }
  }
  return { ok: true }
}
