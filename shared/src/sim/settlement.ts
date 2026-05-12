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

// PHASE 17.13.3 — initial radius (in hex-edges) of tiles automatically claimed by a freshly-
// founded settlement. The civic-center tile + every tile within this many edges (BFS over
// tile.neighbors[]) joins the new settlement, ceded from whatever settlement owned them before
// (typically the Capital). 3 rings = up to 1 + 6 + 12 + 18 = 37 tiles at full coverage, fewer
// at the planet edge or with neighbors already claimed by other founded settlements.
export const SETTLEMENT_INITIAL_RINGS = 3

// PHASE 17.13.3 — annex propaganda cost per tile. Per user verbatim 2026-05-10: "Player can
// manually expand territory via 'Annex' button on adjacent unclaimed tiles (costs propaganda
// materials)". Flat per-tile cost for v1; future polish could scale by ring distance or by
// the active settlement's existing territory size.
export const ANNEX_PROPAGANDA_COST = 25

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

// PHASE 17.13.10 — per-theme settlement naming patterns. Per user verbatim 2026-05-10:
// "Settlements auto-named per theme: Theocracy = 'Holy [Planet] Sanctuary' → 'Holy [Planet]
// Cathedral' / Corporate = 'Region [Planet]-A' → 'Region [Planet]-B' / Warlord =
// '[Khan-Name]-Hold' / etc. Player can rename any settlement."
//
// Each theme provides a capital-naming function + a region-naming function. Region functions
// take the planet id + a 1-based ordinal (1, 2, 3, ...) and return a flavored name. Capital
// functions just take the planet id. Themes not listed fall through to the safe Capital/Region
// defaults below — they still work, just without flavor. The keying is by themeId string so
// this module avoids a circular dep with themes.ts (which imports types from this file's peers).
//
// PHASE 17.13.10 also exposes `renameSettlement(settlement, newName)` for the player-rename
// surface — straight setter that other code paths can call from a useMatchSim mutator.

interface SettlementNamingRule {
  readonly capital: (planetIdString: string) => string
  readonly region: (planetIdString: string, ordinal: number) => string
}

function letterOrdinal(ord: number): string {
  // 1 → A, 2 → B, ..., 26 → Z, 27+ → AA, AB, ... (corporate / influencer themes).
  if (ord <= 26) return String.fromCharCode(64 + ord)
  const first = String.fromCharCode(64 + Math.floor((ord - 1) / 26))
  const second = String.fromCharCode(64 + ((ord - 1) % 26) + 1)
  return `${first}${second}`
}

const SETTLEMENT_NAMING_RULES: Readonly<Record<string, SettlementNamingRule>> = {
  theocracy: {
    capital: (p) => `Holy ${p} Sanctuary`,
    region: (p, n) => `Holy ${p} Cathedral-${n}`,
  },
  corporateDictatorship: {
    capital: (p) => `${p}-HQ`,
    region: (p, n) => `Region ${p}-${letterOrdinal(n)}`,
  },
  militaryJunta: {
    capital: (p) => `Sector ${p}-PRIME`,
    region: (p, n) => `Sector ${p}-${n}`,
  },
  surveillanceState: {
    capital: (p) => `Hub-0 ${p}`,
    region: (p, n) => `Block ${p}-${n}`,
  },
  climateRefugeeState: {
    capital: (p) => `Sanctuary ${p}`,
    region: (p, n) => `Camp ${p}-${n}`,
  },
  eugenicsUtopia: {
    capital: (p) => `Gene-Pool ${p} Prime`,
    region: (p, n) => `Strain ${p}-${n}`,
  },
  aiOverlord: {
    capital: (p) => `Node-0x00 ${p}`,
    region: (p, n) => `Node-0x${n.toString(16).toUpperCase().padStart(2, '0')} ${p}`,
  },
  anarchoCapitalist: {
    capital: (p) => `${p} Free Market`,
    region: (p, n) => `Auction ${p}-${n}`,
  },
  hereditaryMonarchy: {
    capital: (p) => `${p} Royal Court`,
    region: (p, n) => `Duchy of ${p}-${n}`,
  },
  ecologicalCult: {
    capital: (p) => `Sacred Grove of ${p}`,
    region: (p, n) => `Sapling ${p}-${n}`,
  },
  psychicHivemind: {
    capital: (p) => `Hive-Mind ${p}-Alpha`,
    region: (p, n) => `Hive-Mind ${p}-${n}`,
  },
  gameShowReality: {
    capital: (p) => `Studio ${p}-Live`,
    region: (p, n) => `Stage ${p}-${n}`,
  },
  cyberpunkMegacorp: {
    capital: (p) => `Tower ${p}-CEO`,
    region: (p, n) => `Sector ${p}-${n}`,
  },
  gerontocracy: {
    capital: (p) => `Elder Council ${p}`,
    region: (p, n) => `Council Wing ${p}-${n}`,
  },
  memeticCult: {
    capital: (p) => `Meme-Hub ${p}-Prime`,
    region: (p, n) => `Meme-Spread ${p}-${n}`,
  },
  warlordConfederacy: {
    capital: (p) => `Khan's Hold ${p}`,
    region: (p, n) => `${p}-Hold-${n}`,
  },
  pharaonicDynasty: {
    capital: (p) => `Pharaoh's Throne ${p}`,
    region: (p, n) => `Nome ${p}-${n}`,
  },
  bureaucraticHellscape: {
    capital: (p) => `Form 1A-${p}`,
    region: (p, n) => `Filing Dept ${p}-${n}`,
  },
  influencerRepublic: {
    capital: (p) => `@${p}-Verified`,
    region: (p, n) => `@${p}-Branch-${letterOrdinal(n)}`,
  },
}

// PHASE 17.13.10 — themed default naming. Falls back to safe Capital/Region pattern when the
// themeId isn't listed in SETTLEMENT_NAMING_RULES (covers legacy callers + future themes).
export function defaultSettlementName(
  status: SettlementStatus,
  ordinal: number,
  planetIdString: string,
  themeId?: string,
): string {
  const rule = themeId ? SETTLEMENT_NAMING_RULES[themeId] : undefined
  if (status === 'capital') {
    return rule ? rule.capital(planetIdString) : `Capital ${planetIdString}`
  }
  return rule ? rule.region(planetIdString, ordinal) : `Region ${planetIdString}-${ordinal}`
}

// PHASE 17.13.10 — player rename mutator. Trims whitespace + clamps to 60 chars to keep panel
// rows readable; empty fallback re-applies the themed default. Caller surfaces the result via
// the SettlementPicker rename UI in PlayPage.
export function renameSettlement(settlement: Settlement, newName: string, themeId?: string): void {
  const trimmed = newName.trim().slice(0, 60)
  if (trimmed.length > 0) {
    settlement.name = trimmed
    return
  }
  // Empty input → restore the themed default. Extract the ordinal from the existing settlement
  // id (`settlement-{planetIdString}-{ordinal}` for founded, `settlement-{planetIdString}-capital`
  // for capital). The capital case ignores the parsed-int (NaN) and the status check picks the
  // capital branch in defaultSettlementName.
  const idStr = String(settlement.id)
  const parts = idStr.split('-')
  const planetIdString = String(settlement.planetId)
  const ordinalToken = parts[parts.length - 1] ?? '0'
  const ordinal = Number.parseInt(ordinalToken, 10)
  settlement.name = defaultSettlementName(
    settlement.status,
    Number.isFinite(ordinal) ? ordinal : 0,
    planetIdString,
    themeId,
  )
}

// Construct the default Capital settlement covering every tile on the planet. Called by
// makePlanetState during match creation so every owned planet boots with one settlement
// from tick 0. PHASE 17.13.10 — optional themeId threads the owning civ's theme through to
// defaultSettlementName for flavored capitals (Theocracy "Holy {planet} Sanctuary" etc.).
export function newCapitalSettlement(
  planetIdValue: PlanetId,
  allTileIds: ReadonlyArray<TileId>,
  planetIdString: string,
  themeId?: string,
): Settlement {
  return {
    id: settlementId(`settlement-${planetIdString}-capital`),
    planetId: planetIdValue,
    name: defaultSettlementName('capital', 0, planetIdString, themeId),
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
  themeId?: string,
): Settlement {
  const idString = `settlement-${planetIdString}-${ordinal}`
  return {
    id: settlementId(idString),
    planetId: planetIdValue,
    name: defaultSettlementName('founded', ordinal, planetIdString, themeId),
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
