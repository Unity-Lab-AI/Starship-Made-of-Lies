// PHASE 17.L.A.7+A.8 — saved-blueprint localStorage shape + helpers extracted from
// ShipBuilderPanel so the LaunchManifestModal (and any future blueprint-aware surface) can
// read/write the player's saved-blueprint library. The blueprint format extends per A.8 to
// carry an optional per-blueprint crew + cargo manifest preset so re-launching a saved
// blueprint pre-fills the LaunchManifestModal sliders with the player's last choice.

import type { ColonyShipVariantId } from '@smol/shared'

export const BLUEPRINTS_STORAGE_KEY = 'smol.ship-blueprints.v1'

export interface SavedBlueprint {
  readonly id: string
  readonly name: string
  readonly pieces: ReadonlyArray<string>
  readonly savedAt: number
  // PHASE 17.L.A.5 — player-pickable base variant override. When set, replaces the
  // inferBaseVariantFromStats heuristic at print time so the blueprint resolves to the
  // explicit catalog variant (suicideShip / canIntercept / render color / emoji flow
  // through unchanged). When omitted, fallback to the heuristic — preserves backwards
  // compatibility for blueprints saved before this field existed.
  readonly baseVariantOverride?: ColonyShipVariantId
  // PHASE 17.L.A.8 — per-blueprint crew/cargo manifest preset. Written by the
  // LaunchManifestModal "Save Preset" button. Pre-fills the modal sliders when the same
  // blueprint is launched again. Cargo stored as JSON-safe tuple-array because Map doesn't
  // serialize directly.
  readonly crewPreset?: Readonly<Record<1 | 2 | 3 | 4 | 5, number>>
  readonly cargoPreset?: ReadonlyArray<readonly [string, number]>
}

export function loadBlueprints(): ReadonlyArray<SavedBlueprint> {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(BLUEPRINTS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (b): b is SavedBlueprint =>
        typeof b === 'object' &&
        b !== null &&
        typeof (b as SavedBlueprint).id === 'string' &&
        typeof (b as SavedBlueprint).name === 'string' &&
        Array.isArray((b as SavedBlueprint).pieces),
    )
  } catch {
    return []
  }
}

export function persistBlueprints(list: ReadonlyArray<SavedBlueprint>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(BLUEPRINTS_STORAGE_KEY, JSON.stringify(list))
  } catch {
    // ignore — quota or sandbox
  }
}

// PHASE 17.L.A.8 — write a crew+cargo preset back to the named blueprint. Used by the
// LaunchManifestModal "Save Preset" button. No-op when the blueprint id doesn't exist.
export function saveBlueprintPreset(
  blueprintId: string,
  crewPreset: Readonly<Record<1 | 2 | 3 | 4 | 5, number>>,
  cargoPreset: ReadonlyArray<readonly [string, number]>,
): boolean {
  const list = loadBlueprints()
  let touched = false
  const next = list.map<SavedBlueprint>((bp) => {
    if (bp.id !== blueprintId) return bp
    touched = true
    return { ...bp, crewPreset, cargoPreset }
  })
  if (!touched) return false
  persistBlueprints(next)
  return true
}

export function findBlueprint(id: string): SavedBlueprint | null {
  for (const bp of loadBlueprints()) if (bp.id === id) return bp
  return null
}
