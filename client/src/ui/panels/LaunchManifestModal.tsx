// PHASE 17.L.A.7+A.8 — Q3 PHASE 17 LOCKED closure. Launch-time manifest modal that lets the
// player drag-allocate crew (per citizen tier) + cargo (per resource type) before firing the
// actual launch. Default "Fill Optimally" preset = one-click launch when defaults are fine;
// adjusting any slider is purely additive. When the pad was printed from a saved blueprint,
// the modal loads that blueprint's saved preset (if any) and shows a "💾 Save Preset" button
// that writes the current allocation back to the blueprint for next time.
//
// User verbatim (LAW #0): "what crew and supplies and the loading of ammunition" — the
// crew/supplies/ammo loading is what this modal exists to surface. Crew side already had
// tier-aware auto-load (PHASE 17.L.A.6); this is the player-controlled override + missing
// cargo side.

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  type CitizenTier,
  type FlightKind,
  type LaunchPad,
  type PlanetId,
  type PlanetInventory,
  type PlanetPopulation,
  type ResourceId,
  RESOURCES,
  SHIP_MINING,
  getColonyShipDef,
  stockOf,
} from '@smol/shared'
import {
  type SavedBlueprint,
  findBlueprint,
  saveBlueprintPreset,
} from '../../storage/blueprintStorage'
import './LaunchManifestModal.css'

export interface LaunchManifestSubmission {
  readonly citizensByTier: Record<CitizenTier, number>
  readonly cargoByResource: Map<ResourceId, number>
  // PHASE 17.L.A.11 — Q5 LOCKED. Mining flight mode picked via the Mining Mode section
  // (visible only when the loaded variant is SHIP_MINING). For non-mining variants this is
  // always 'oneway'. For shuttle-multi mode assignedTargets carries the planet rotation.
  readonly flightKind: FlightKind
  readonly assignedTargets: ReadonlyArray<PlanetId>
}

// PHASE 17.L.A.11 — optional planet-list prop. When present, the Mining Mode section's
// shuttle-multi sub-picker renders a multi-select for the player to pick rotation planets.
// Each entry = { id, label } so the modal stays decoupled from the full Planet type.
export interface ManifestTargetPlanet {
  readonly id: PlanetId
  readonly label: string
  readonly isCurrentTarget: boolean
}

export interface LaunchManifestModalProps {
  readonly open: boolean
  readonly pad: LaunchPad | null
  readonly population: PlanetPopulation | null
  readonly inventory: PlanetInventory | null
  readonly targetPlanetLabel: string
  readonly onCancel: () => void
  // PHASE 17.L.A.7 — onConfirm runs the action sequence: load manifest into pad, then fire
  // launchShipFromPad. PlayPage owns both calls so refusal feedback can route back to toast.
  readonly onConfirm: (submission: LaunchManifestSubmission) => void
  // PHASE 17.L.A.11 — list of candidate planets for shuttle-multi rotation. PlayPage supplies
  // the player's reachable planets. Empty / omitted = Mining Mode section hides the multi
  // sub-picker (player can still pick oneway / shuttle-single).
  readonly miningRotationCandidates?: ReadonlyArray<ManifestTargetPlanet>
}

const ALL_TIERS: ReadonlyArray<CitizenTier> = [1, 2, 3, 4, 5]
const TIER_LABEL: Record<CitizenTier, string> = {
  1: 'Worker',
  2: 'Skilled',
  3: 'Privileged',
  4: 'Elite',
  5: 'Pinnacle',
}
const TIER_EMOJI: Record<CitizenTier, string> = {
  1: '🧑‍🏭',
  2: '🧑‍🔧',
  3: '🧑‍💼',
  4: '🧑‍✈️',
  5: '🧑‍🚀',
}

// PHASE 17.L.A.7 — "Fill Optimally" preset allocator. Suicide ships pull tier 5 then tier 4
// to satisfy the suicide-mix gate (padCitizenMixSatisfiesShip). Non-suicide ships fill from
// tier 1 up — cheap workers volunteer for colony bootstrap. Cap-bound at min(available,
// remaining capacity). Returns a fresh per-tier record.
function computeOptimalCrew(
  population: PlanetPopulation,
  citizenCapacity: number,
  isSuicideShip: boolean,
): Record<CitizenTier, number> {
  const result: Record<CitizenTier, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let remaining = citizenCapacity
  const order: ReadonlyArray<CitizenTier> = isSuicideShip ? [5, 4] : [1, 2, 3, 4, 5]
  for (const tier of order) {
    if (remaining <= 0) break
    const avail = population.tierCounts[tier]
    const take = Math.min(remaining, avail)
    if (take <= 0) continue
    result[tier] = take
    remaining -= take
  }
  return result
}

// PHASE 17.L.A.7 — "Fill Optimally" cargo allocator. Picks the top-4 most-stocked non-fuel
// non-ammunition resources on the planet and proportionally fills the cargo hold so it
// arrives with a useful colonization payload (raw materials weighted highest, then refined).
// Skips fuel + ammunition (those are pad-managed) and exotic_alloys / antimatter / fusion fuel
// (those are reactor-fuel territory). Returns a fresh Map.
function computeOptimalCargo(
  inventory: PlanetInventory,
  cargoCapacity: number,
): Map<ResourceId, number> {
  const SKIP = new Set<string>(['fuel', 'ammunition', 'antimatter', 'fusionFuel'])
  type Entry = { resource: ResourceId; stock: number }
  const candidates: Array<Entry> = []
  for (const def of RESOURCES) {
    if (SKIP.has(String(def.id))) continue
    const stock = stockOf(inventory, def.id)
    if (stock > 0) candidates.push({ resource: def.id, stock })
  }
  candidates.sort((a, b) => b.stock - a.stock)
  const picks = candidates.slice(0, 4)
  const result = new Map<ResourceId, number>()
  if (picks.length === 0 || cargoCapacity <= 0) return result
  // Even share at first; clamp each to its actual stock and redistribute leftovers below.
  const evenShare = Math.floor(cargoCapacity / picks.length)
  let remaining = cargoCapacity
  for (const pick of picks) {
    const take = Math.min(evenShare, pick.stock)
    if (take > 0) {
      result.set(pick.resource, take)
      remaining -= take
    }
  }
  // Distribute leftover to the top resource until cap or stock is exhausted.
  for (const pick of picks) {
    if (remaining <= 0) break
    const current = result.get(pick.resource) ?? 0
    const headroom = pick.stock - current
    if (headroom <= 0) continue
    const extra = Math.min(remaining, headroom)
    result.set(pick.resource, current + extra)
    remaining -= extra
  }
  return result
}

function sumValues(rec: Record<CitizenTier, number>): number {
  return rec[1] + rec[2] + rec[3] + rec[4] + rec[5]
}

function sumMapValues(m: ReadonlyMap<ResourceId, number>): number {
  let total = 0
  for (const v of m.values()) total += v
  return total
}

export function LaunchManifestModal({
  open,
  pad,
  population,
  inventory,
  targetPlanetLabel,
  onCancel,
  onConfirm,
  miningRotationCandidates,
}: LaunchManifestModalProps) {
  const sourceBlueprintId = pad?.loadedCustomBuild?.sourceBlueprintId
  const sourceBlueprint = useMemo<SavedBlueprint | null>(() => {
    if (!sourceBlueprintId) return null
    return findBlueprint(sourceBlueprintId)
  }, [sourceBlueprintId])

  // Derive effective capacity from custom build (if any) else catalog def. Hooks must always
  // run unconditionally — early return below handles closed/empty state without skipping any.
  const effectiveStats = useMemo(() => {
    if (!pad?.loadedShipVariantId) return null
    if (pad.loadedCustomBuild) {
      return {
        citizenCapacity: pad.loadedCustomBuild.stats.citizenCapacity,
        cargoCapacity: pad.loadedCustomBuild.stats.cargoCapacity,
      }
    }
    const def = getColonyShipDef(pad.loadedShipVariantId)
    return {
      citizenCapacity: def.payload.citizenCapacity,
      cargoCapacity: def.payload.cargoCapacity,
    }
  }, [pad])

  const isSuicideShip = useMemo(() => {
    if (!pad?.loadedShipVariantId) return false
    return getColonyShipDef(pad.loadedShipVariantId).suicideShip
  }, [pad])

  const shipDisplayName = useMemo(() => {
    if (!pad?.loadedShipVariantId) return ''
    if (pad.loadedCustomBuild) return pad.loadedCustomBuild.displayName
    return getColonyShipDef(pad.loadedShipVariantId).name
  }, [pad])

  const [crew, setCrew] = useState<Record<CitizenTier, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  const [cargo, setCargo] = useState<Map<ResourceId, number>>(new Map())
  const [savedHint, setSavedHint] = useState<string>('')
  const lastInitKeyRef = useRef<string>('')
  // PHASE 17.L.A.11 — Q5 LOCKED. Mining mode picker state. Only meaningful when the loaded
  // variant is SHIP_MINING; for other variants we always submit 'oneway'. Multi-target set
  // tracks which planet ids the player ticked for shuttle-multi rotation.
  const [miningMode, setMiningMode] = useState<FlightKind>('oneway')
  const [multiSelectedPlanets, setMultiSelectedPlanets] = useState<Set<PlanetId>>(new Set())

  // PHASE 17.L.A.11 — is the loaded variant a mining ship? Only mining variants surface the
  // mode picker; other variants always launch oneway. SHIP_MINING is the canonical mining
  // colony-ship variant per colony-ship.ts.
  const isMiningVariant = useMemo(() => {
    if (!pad?.loadedShipVariantId) return false
    return pad.loadedShipVariantId === SHIP_MINING
  }, [pad])

  // PHASE 17.L.A.7 — initial fill on open. Priority: (1) saved blueprint preset → (2) pad's
  // current load (from auto-loader) → (3) "Fill Optimally". Re-init when modal transitions
  // from closed → open OR when the pad/blueprint identity changes (different pad opened).
  useEffect(() => {
    if (!open || !pad || !population || !inventory || !effectiveStats) return
    const key = `${String(pad.id)}|${pad.loadedShipVariantId ?? ''}|${sourceBlueprintId ?? ''}`
    if (lastInitKeyRef.current === key) return
    lastInitKeyRef.current = key

    let nextCrew: Record<CitizenTier, number> | null = null
    let nextCargo: Map<ResourceId, number> | null = null

    if (sourceBlueprint?.crewPreset) {
      nextCrew = { ...sourceBlueprint.crewPreset }
    }
    if (sourceBlueprint?.cargoPreset) {
      nextCargo = new Map(sourceBlueprint.cargoPreset.map(([r, n]) => [r as ResourceId, n]))
    }

    // Fallback to pad's auto-loaded state for whichever side the blueprint didn't preset.
    if (!nextCrew) {
      const padLoaded = pad.citizensLoadedByTier
      const hasAutoLoaded = ALL_TIERS.some((t) => padLoaded[t] > 0)
      nextCrew = hasAutoLoaded
        ? { ...padLoaded }
        : computeOptimalCrew(population, effectiveStats.citizenCapacity, isSuicideShip)
    }
    if (!nextCargo) {
      if (pad.cargoLoaded.size > 0) {
        nextCargo = new Map(pad.cargoLoaded)
      } else {
        nextCargo = computeOptimalCargo(inventory, effectiveStats.cargoCapacity)
      }
    }
    setCrew(nextCrew)
    setCargo(nextCargo)
  }, [
    open,
    pad,
    population,
    inventory,
    effectiveStats,
    isSuicideShip,
    sourceBlueprint,
    sourceBlueprintId,
  ])

  // Reset the init guard when the modal closes so re-opening triggers a fresh init.
  useEffect(() => {
    if (!open) lastInitKeyRef.current = ''
  }, [open])

  // Auto-clear the "Saved" hint after 2.5s.
  useEffect(() => {
    if (!savedHint) return
    const handle = window.setTimeout(() => setSavedHint(''), 2500)
    return () => window.clearTimeout(handle)
  }, [savedHint])

  // PHASE 17.L.A.7 — cargo row candidate list. Must be computed BEFORE the early-return below
  // so the hook order stays stable across renders (react-hooks/rules-of-hooks). When the modal
  // is closed `inventory` is null, in which case we return an empty array via the optional
  // chain on stockOf — same shape, no fall-through.
  const cargoCandidates = useMemo(() => {
    if (!inventory) return []
    const SKIP = new Set<string>(['fuel', 'ammunition'])
    return RESOURCES.filter((r) => !SKIP.has(String(r.id))).filter(
      (r) => stockOf(inventory, r.id) > 0 || (cargo.get(r.id) ?? 0) > 0,
    )
  }, [inventory, cargo])

  if (!open || !pad || !population || !inventory || !effectiveStats) return null

  const crewTotal = sumValues(crew)
  const cargoTotal = sumMapValues(cargo)
  const crewCap = effectiveStats.citizenCapacity
  const cargoCap = effectiveStats.cargoCapacity

  // PHASE 17.L.A.7 — per-tier slider max = min(citizens available in this tier + already-
  // allocated to this tier in the modal, remaining capacity + this tier's current). Capacity
  // math: when this tier is bumped up, OTHER tiers contribute to the cap. We compute the cap
  // as (citizenCapacity - sum-of-other-tiers).
  const crewSliderMax = (tier: CitizenTier): number => {
    const availPlusOnSlider = population.tierCounts[tier] + crew[tier]
    const otherTiers = ALL_TIERS.filter((t) => t !== tier).reduce((s, t) => s + crew[t], 0)
    const capacityBound = Math.max(0, crewCap - otherTiers)
    return Math.min(availPlusOnSlider, capacityBound)
  }

  const cargoSliderMax = (resource: ResourceId): number => {
    const onSlider = cargo.get(resource) ?? 0
    const availPlusOnSlider = stockOf(inventory, resource) + onSlider
    const otherCargo = cargoTotal - onSlider
    const capacityBound = Math.max(0, cargoCap - otherCargo)
    return Math.min(availPlusOnSlider, capacityBound)
  }

  const updateCrew = (tier: CitizenTier, next: number): void => {
    setCrew((prev) => ({ ...prev, [tier]: Math.max(0, Math.floor(next)) }))
  }

  const updateCargo = (resource: ResourceId, next: number): void => {
    setCargo((prev) => {
      const out = new Map(prev)
      const n = Math.max(0, Math.floor(next))
      if (n === 0) out.delete(resource)
      else out.set(resource, n)
      return out
    })
  }

  const handleFillOptimally = (): void => {
    setCrew(computeOptimalCrew(population, crewCap, isSuicideShip))
    setCargo(computeOptimalCargo(inventory, cargoCap))
  }

  const handleClearAll = (): void => {
    setCrew({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    setCargo(new Map())
  }

  const handleSavePreset = (): void => {
    if (!sourceBlueprintId) return
    const cargoTuples: ReadonlyArray<readonly [string, number]> = [...cargo.entries()].map(
      ([resource, amount]) => [String(resource), amount] as const,
    )
    const ok = saveBlueprintPreset(sourceBlueprintId, crew, cargoTuples)
    setSavedHint(ok ? 'Preset saved to blueprint.' : 'Could not save — blueprint not found.')
  }

  const handleConfirm = (): void => {
    // PHASE 17.L.A.11 — emit flightKind + assignedTargets. For non-mining variants we force
    // oneway. For mining + shuttle-multi we materialize the selected planet ids; falls back
    // to single-target loop when the player picked shuttle-multi but didn't tick any planets.
    let submittedKind: FlightKind = 'oneway'
    let submittedTargets: ReadonlyArray<PlanetId> = []
    if (isMiningVariant) {
      submittedKind = miningMode
      if (miningMode === 'shuttle-multi') {
        const ticked = [...multiSelectedPlanets]
        submittedTargets = ticked.length > 0 ? ticked : []
        // If player picked multi but ticked nothing, downgrade to shuttle-single so the launch
        // still does something useful with the chosen current target.
        if (ticked.length === 0) submittedKind = 'shuttle-single'
      }
    }
    onConfirm({
      citizensByTier: { ...crew },
      cargoByResource: new Map(cargo),
      flightKind: submittedKind,
      assignedTargets: submittedTargets,
    })
  }

  // Decorate the suicide-ship gate. If suicide AND any tier-1/2/3 is non-zero, warn the
  // player — the launch will be refused by padCitizenMixSatisfiesShip downstream.
  const suicideGateViolated = isSuicideShip && (crew[1] > 0 || crew[2] > 0 || crew[3] > 0)

  return (
    <div
      className="launch-manifest-modal__backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-manifest-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="launch-manifest-modal">
        <header className="launch-manifest-modal__header">
          <h2 id="launch-manifest-title" className="launch-manifest-modal__title">
            📋 Launch Manifest: {shipDisplayName || 'Ship'}
          </h2>
          <button
            type="button"
            className="launch-manifest-modal__close"
            onClick={onCancel}
            aria-label="Cancel launch"
            title="Cancel and close (Esc)"
          >
            ✕
          </button>
        </header>

        <div className="launch-manifest-modal__context">
          <div>
            <strong>Target:</strong> {targetPlanetLabel}
          </div>
          {sourceBlueprint && (
            <div>
              <strong>From blueprint:</strong> {sourceBlueprint.name}
            </div>
          )}
          {isSuicideShip && (
            <div className="launch-manifest-modal__suicide-warning">
              ⚠ Suicide ship — only Tier 4 (Elite) and Tier 5 (Pinnacle) citizens will board
              willingly. Lower tiers refuse and the launch will be denied.
            </div>
          )}
        </div>

        <section className="launch-manifest-modal__section">
          <div className="launch-manifest-modal__section-head">
            <h3>Crew Manifest</h3>
            <span
              className={
                crewTotal > crewCap
                  ? 'launch-manifest-modal__capacity launch-manifest-modal__capacity--over'
                  : 'launch-manifest-modal__capacity'
              }
            >
              {crewTotal} / {crewCap} citizens
            </span>
          </div>
          <ul className="launch-manifest-modal__crew-rows">
            {ALL_TIERS.map((tier) => {
              const max = crewSliderMax(tier)
              const value = crew[tier]
              const avail = population.tierCounts[tier]
              const disabled = max === 0
              return (
                <li key={tier} className="launch-manifest-modal__crew-row">
                  <span className="launch-manifest-modal__crew-label">
                    {TIER_EMOJI[tier]} Tier {tier} ({TIER_LABEL[tier]})
                  </span>
                  <span className="launch-manifest-modal__crew-avail">available: {avail}</span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(1, max)}
                    step={1}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => updateCrew(tier, Number(e.target.value))}
                    className="launch-manifest-modal__slider"
                    aria-label={`Tier ${tier} citizens`}
                  />
                  <input
                    type="number"
                    min={0}
                    max={Math.max(1, max)}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => updateCrew(tier, Number(e.target.value))}
                    className="launch-manifest-modal__number"
                    aria-label={`Tier ${tier} citizen count`}
                  />
                </li>
              )
            })}
          </ul>
        </section>

        <section className="launch-manifest-modal__section">
          <div className="launch-manifest-modal__section-head">
            <h3>Cargo Manifest</h3>
            <span
              className={
                cargoTotal > cargoCap
                  ? 'launch-manifest-modal__capacity launch-manifest-modal__capacity--over'
                  : 'launch-manifest-modal__capacity'
              }
            >
              {cargoTotal} / {cargoCap} cargo
            </span>
          </div>
          {cargoCandidates.length === 0 ? (
            <p className="launch-manifest-modal__cargo-empty">
              No stocked resources to load. Build up your planet inventory first.
            </p>
          ) : (
            <ul className="launch-manifest-modal__cargo-rows">
              {cargoCandidates.map((def) => {
                const value = cargo.get(def.id) ?? 0
                const max = cargoSliderMax(def.id)
                const stock = stockOf(inventory, def.id)
                const disabled = max === 0 && value === 0
                return (
                  <li key={String(def.id)} className="launch-manifest-modal__cargo-row">
                    <span className="launch-manifest-modal__cargo-label">
                      {def.emoji} {def.name}
                    </span>
                    <span className="launch-manifest-modal__cargo-avail">stock: {stock}</span>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(1, max)}
                      step={1}
                      value={value}
                      disabled={disabled}
                      onChange={(e) => updateCargo(def.id, Number(e.target.value))}
                      className="launch-manifest-modal__slider"
                      aria-label={`${def.name} cargo`}
                    />
                    <input
                      type="number"
                      min={0}
                      max={Math.max(1, max)}
                      value={value}
                      disabled={disabled}
                      onChange={(e) => updateCargo(def.id, Number(e.target.value))}
                      className="launch-manifest-modal__number"
                      aria-label={`${def.name} cargo amount`}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* PHASE 17.L.A.11 — Q5 LOCKED. Mining Mode picker. Only renders when the loaded
            variant is SHIP_MINING — other variants always launch oneway. Three radio options
            with descriptive subtitles; shuttle-multi sub-picker (checkbox list of rotation
            planets) only renders when shuttle-multi is selected AND candidates are supplied. */}
        {isMiningVariant && (
          <section className="launch-manifest-modal__section">
            <div className="launch-manifest-modal__section-head">
              <h3>⛏️ Mining Mode</h3>
              <span className="launch-manifest-modal__capacity">
                {miningMode === 'oneway'
                  ? 'one-way drop'
                  : miningMode === 'shuttle-single'
                    ? 'auto-recall loop'
                    : `multi-planet rotation (${multiSelectedPlanets.size} picked)`}
              </span>
            </div>
            <ul className="launch-manifest-modal__mining-modes">
              <li
                className={
                  miningMode === 'oneway'
                    ? 'launch-manifest-modal__mining-mode launch-manifest-modal__mining-mode--selected'
                    : 'launch-manifest-modal__mining-mode'
                }
              >
                <label>
                  <input
                    type="radio"
                    name="mining-mode"
                    value="oneway"
                    checked={miningMode === 'oneway'}
                    onChange={() => setMiningMode('oneway')}
                  />
                  <strong>📦 One-Way Drop</strong>
                  <span className="launch-manifest-modal__mining-mode-desc">
                    Fire-and-forget. Ship reaches the target and stays there. Recover cargo later
                    with a separate retrieval flight.
                  </span>
                </label>
              </li>
              <li
                className={
                  miningMode === 'shuttle-single'
                    ? 'launch-manifest-modal__mining-mode launch-manifest-modal__mining-mode--selected'
                    : 'launch-manifest-modal__mining-mode'
                }
              >
                <label>
                  <input
                    type="radio"
                    name="mining-mode"
                    value="shuttle-single"
                    checked={miningMode === 'shuttle-single'}
                    onChange={() => setMiningMode('shuttle-single')}
                  />
                  <strong>🔁 Single-Target Loop</strong>
                  <span className="launch-manifest-modal__mining-mode-desc">
                    Auto-recall. Ship cycles between the target and home indefinitely, delivering
                    cargo each return.
                  </span>
                </label>
              </li>
              <li
                className={
                  miningMode === 'shuttle-multi'
                    ? 'launch-manifest-modal__mining-mode launch-manifest-modal__mining-mode--selected'
                    : 'launch-manifest-modal__mining-mode'
                }
              >
                <label>
                  <input
                    type="radio"
                    name="mining-mode"
                    value="shuttle-multi"
                    checked={miningMode === 'shuttle-multi'}
                    onChange={() => setMiningMode('shuttle-multi')}
                  />
                  <strong>🌐 Multi-Planet Rotation</strong>
                  <span className="launch-manifest-modal__mining-mode-desc">
                    Cycles through multiple planets round-robin. Tick the targets below; the ship
                    visits each in order, then loops.
                  </span>
                </label>
              </li>
            </ul>
            {miningMode === 'shuttle-multi' &&
              miningRotationCandidates &&
              miningRotationCandidates.length > 0 && (
                <ul className="launch-manifest-modal__multi-picker">
                  {miningRotationCandidates.map((cand) => {
                    const checked = multiSelectedPlanets.has(cand.id)
                    return (
                      <li key={String(cand.id)} className="launch-manifest-modal__multi-row">
                        <label>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setMultiSelectedPlanets((prev) => {
                                const next = new Set(prev)
                                if (e.target.checked) next.add(cand.id)
                                else next.delete(cand.id)
                                return next
                              })
                            }}
                          />
                          <span>
                            {cand.label}
                            {cand.isCurrentTarget ? ' (current target)' : ''}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            {miningMode === 'shuttle-multi' && multiSelectedPlanets.size === 0 && (
              <p className="launch-manifest-modal__multi-hint">
                Tick at least 2 planets above to enable multi-planet rotation. With none selected
                the launch will downgrade to single-target loop on the current target.
              </p>
            )}
          </section>
        )}

        {suicideGateViolated && (
          <p className="launch-manifest-modal__gate-warning">
            ⚠ Suicide-ship gate violated — lower-tier citizens are aboard. The launch will be
            refused. Remove all Tier 1 / 2 / 3 citizens or invest in propaganda buildings to elevate
            more Tier 4-5 volunteers.
          </p>
        )}

        {savedHint && (
          <p className="launch-manifest-modal__saved-hint" role="status">
            ✓ {savedHint}
          </p>
        )}

        <footer className="launch-manifest-modal__footer">
          <button
            type="button"
            className="launch-manifest-modal__btn launch-manifest-modal__btn--ghost"
            onClick={handleClearAll}
            title="Reset all sliders to zero"
          >
            ↺ Clear All
          </button>
          <button
            type="button"
            className="launch-manifest-modal__btn launch-manifest-modal__btn--ghost"
            onClick={handleFillOptimally}
            title="Auto-allocate crew + cargo for a quick launch"
          >
            🪄 Fill Optimally
          </button>
          {sourceBlueprintId && (
            <button
              type="button"
              className="launch-manifest-modal__btn launch-manifest-modal__btn--save"
              onClick={handleSavePreset}
              title="Save the current crew + cargo allocation back to this blueprint for next time"
            >
              💾 Save Preset
            </button>
          )}
          <div className="launch-manifest-modal__footer-spacer" />
          <button
            type="button"
            className="launch-manifest-modal__btn launch-manifest-modal__btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="launch-manifest-modal__btn launch-manifest-modal__btn--primary"
            onClick={handleConfirm}
            disabled={suicideGateViolated}
            title={
              suicideGateViolated
                ? 'Suicide-ship mix invalid — see warning above'
                : 'Apply manifest and fire launch'
            }
          >
            🚀 Confirm Launch
          </button>
        </footer>
      </div>
    </div>
  )
}
