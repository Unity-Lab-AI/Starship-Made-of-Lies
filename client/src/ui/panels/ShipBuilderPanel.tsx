import { useEffect, useMemo, useState } from 'react'
import {
  type ColonyShipBuild,
  type ColonyShipVariantId,
  type LaunchPad,
  type PlanetInventory,
  type ResolvedShipStats,
  type ShipPieceDef,
  type ShipPieceSlot,
  type TechId,
  SHIP_EXPLOSIVE,
  SHIP_HEAVY,
  SHIP_PIECES,
  SHIP_PROBE,
  SHIP_STANDARD,
  piecesBySlot,
  resolveShipBuild,
  stockOf,
  validateShipBuild,
} from '@smol/shared'
import './ship-builder-panel.css'

const SLOTS: ReadonlyArray<{ slot: ShipPieceSlot; label: string; required: boolean }> = [
  { slot: 'hull', label: 'Hull', required: true },
  { slot: 'propulsion', label: 'Propulsion', required: true },
  { slot: 'life_support', label: 'Life Support', required: true },
  { slot: 'landing_gear', label: 'Landing Gear', required: true },
  { slot: 'payload', label: 'Payload', required: false },
  { slot: 'sensors', label: 'Sensors', required: false },
  { slot: 'weapons', label: 'Weapons', required: false },
  { slot: 'comms', label: 'Communications', required: false },
]

const BLUEPRINTS_STORAGE_KEY = 'smol.ship-blueprints.v1'

interface SavedBlueprint {
  readonly id: string
  readonly name: string
  readonly pieces: ReadonlyArray<string>
  readonly savedAt: number
}

function loadBlueprints(): ReadonlyArray<SavedBlueprint> {
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

function persistBlueprints(list: ReadonlyArray<SavedBlueprint>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(BLUEPRINTS_STORAGE_KEY, JSON.stringify(list))
  } catch {
    // ignore — quota or sandbox
  }
}

interface ShipBuilderPanelProps {
  readonly inventory: PlanetInventory
  readonly researchedTechs: ReadonlySet<TechId>
  readonly activePlanetLabel: string
  readonly idlePads: ReadonlyArray<LaunchPad>
  readonly onPrintBlueprint: (
    padId: LaunchPad['id'],
    baseVariantId: ColonyShipVariantId,
    displayName: string,
    pieces: ReadonlyArray<string>,
    stats: ResolvedShipStats,
    totalCost: ReadonlyArray<{ resource: import('@smol/shared').ResourceId; amount: number }>,
  ) => boolean
}

function emptySelections(): Record<ShipPieceSlot, string | null> {
  return {
    hull: null,
    propulsion: null,
    life_support: null,
    landing_gear: null,
    payload: null,
    sensors: null,
    weapons: null,
    comms: null,
  }
}

// PHASE 17.J.10 — pick the closest-match catalog variant for a blueprint. Used as the BASE
// variant id stored on the pad/flight so downstream code (render layer, suicide-ship flag,
// can-intercept flag) has a stable reference. Blueprint stats override the per-tick numbers
// via flightDef() — this just resolves "what KIND of ship is this".
function inferBaseVariantFromStats(stats: ResolvedShipStats): ColonyShipVariantId {
  if (stats.explosiveYield > 0) return SHIP_EXPLOSIVE
  if (stats.citizenCapacity >= 800) return SHIP_HEAVY
  if (stats.citizenCapacity >= 50) return SHIP_STANDARD
  return SHIP_PROBE
}

export function ShipBuilderPanel({
  inventory,
  researchedTechs,
  activePlanetLabel,
  idlePads,
  onPrintBlueprint,
}: ShipBuilderPanelProps) {
  const [selections, setSelections] =
    useState<Record<ShipPieceSlot, string | null>>(emptySelections)
  const [blueprintName, setBlueprintName] = useState<string>('')
  const [saved, setSaved] = useState<ReadonlyArray<SavedBlueprint>>(() => loadBlueprints())
  const [statusMessage, setStatusMessage] = useState<string>('')

  const pickedIds = useMemo(
    () => Object.values(selections).filter((id): id is string => !!id),
    [selections],
  )

  const resolved = useMemo(() => {
    if (pickedIds.length === 0) return null
    const build: ColonyShipBuild = {
      buildId: 'preview',
      displayName: blueprintName || 'Untitled Build',
      pieces: pickedIds,
    }
    return resolveShipBuild(build, researchedTechs)
  }, [pickedIds, researchedTechs, blueprintName])

  const validation = useMemo(() => {
    if (pickedIds.length === 0)
      return {
        valid: false,
        errors: [
          'Select hull / propulsion / life support / landing gear at minimum.',
        ] as ReadonlyArray<string>,
      }
    const build: ColonyShipBuild = { buildId: 'preview', displayName: 'preview', pieces: pickedIds }
    return validateShipBuild(build)
  }, [pickedIds])

  useEffect(() => {
    if (statusMessage) {
      const handle = window.setTimeout(() => setStatusMessage(''), 2500)
      return () => window.clearTimeout(handle)
    }
    return undefined
  }, [statusMessage])

  const setSlotSelection = (slot: ShipPieceSlot, pieceId: string | null) => {
    setSelections((prev) => ({ ...prev, [slot]: pieceId }))
  }

  const handleSave = () => {
    const name = blueprintName.trim()
    if (!name) {
      setStatusMessage('Blueprint needs a name.')
      return
    }
    if (!validation.valid) {
      setStatusMessage(`Cannot save invalid build: ${validation.errors[0]}`)
      return
    }
    const id = `bp-${Date.now()}-${Math.floor(Math.random() * 9999)}`
    const next: SavedBlueprint = { id, name, pieces: pickedIds, savedAt: Date.now() }
    const updated = [next, ...saved.filter((b) => b.name !== name)]
    setSaved(updated)
    persistBlueprints(updated)
    setStatusMessage(`Saved blueprint "${name}".`)
  }

  const handleLoad = (bp: SavedBlueprint) => {
    const next = emptySelections()
    for (const pieceId of bp.pieces) {
      const piece = SHIP_PIECES.find((p) => p.id === pieceId)
      if (piece) next[piece.slot] = pieceId
    }
    setSelections(next)
    setBlueprintName(bp.name)
    setStatusMessage(`Loaded blueprint "${bp.name}".`)
  }

  const handleDelete = (bp: SavedBlueprint) => {
    const updated = saved.filter((b) => b.id !== bp.id)
    setSaved(updated)
    persistBlueprints(updated)
    setStatusMessage(`Deleted blueprint "${bp.name}".`)
  }

  const handleClear = () => {
    setSelections(emptySelections())
    setBlueprintName('')
    setStatusMessage('Cleared.')
  }

  return (
    <div className="ship-builder-panel">
      <p className="ship-builder-panel__hint">
        Assemble a custom ship by picking one part per slot. Hull / Propulsion / Life Support /
        Landing Gear are required. Cost + stats update live. Save as a named blueprint to reuse
        later.
      </p>

      <div className="ship-builder-panel__slots">
        {SLOTS.map(({ slot, label, required }) => {
          const options = piecesBySlot(slot)
          const selectedId = selections[slot]
          return (
            <SlotPicker
              key={slot}
              slot={slot}
              label={label}
              required={required}
              options={options}
              selectedId={selectedId}
              researchedTechs={researchedTechs}
              onSelect={(id) => setSlotSelection(slot, id)}
            />
          )
        })}
      </div>

      <div className="ship-builder-panel__summary">
        <h4 className="ship-builder-panel__summary-title">Resolved Build</h4>
        {resolved ? (
          <>
            <ul className="ship-builder-panel__stats">
              <li>👤 Citizens: {resolved.stats.citizenCapacity}</li>
              <li>📦 Cargo: {resolved.stats.cargoCapacity}</li>
              <li>⛽ Fuel req: {resolved.stats.fuelRequirement}</li>
              {resolved.stats.weaponPayload > 0 && (
                <li>🔫 Weapons: {resolved.stats.weaponPayload}</li>
              )}
              {resolved.stats.explosiveYield > 0 && (
                <li>💥 Explosive: {resolved.stats.explosiveYield}</li>
              )}
              <li>🛬 Landing gear: T{resolved.stats.landingGearTier}</li>
              <li>📡 Comms: T{resolved.stats.commsTier}</li>
              <li>🛰 Sensors: T{resolved.stats.sensorTier}</li>
              <li>🫁 Life support: T{resolved.stats.lifeSupportTier}</li>
              <li>⚖ Mass penalty: {(resolved.stats.massPenalty * 100).toFixed(0)}%</li>
              <li>🏃 Speed delta: {resolved.stats.speedDelta.toFixed(2)}</li>
              <li>🥷 Evasion delta: {resolved.stats.evasionDelta.toFixed(2)}</li>
            </ul>
            <h4 className="ship-builder-panel__summary-title">Total Cost</h4>
            <ul className="ship-builder-panel__costs">
              {aggregateCost(resolved.totalCost).map((entry) => {
                const have = stockOf(inventory, entry.resource)
                const enough = have >= entry.amount
                return (
                  <li
                    key={String(entry.resource)}
                    className={
                      enough ? 'ship-builder-panel__cost-ok' : 'ship-builder-panel__cost-short'
                    }
                  >
                    {String(entry.resource)}: {entry.amount} (have {have})
                  </li>
                )
              })}
            </ul>
            {resolved.missingTechs.length > 0 && (
              <p className="ship-builder-panel__warning">
                ⚠ Missing techs: {resolved.missingTechs.map(String).join(', ')}
              </p>
            )}
            {!validation.valid && (
              <ul className="ship-builder-panel__errors">
                {validation.errors.map((err, i) => (
                  <li key={i}>⚠ {err}</li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="ship-builder-panel__no-build">
            No parts selected yet. Pick a hull to start.
          </p>
        )}
      </div>

      <div className="ship-builder-panel__save">
        <input
          type="text"
          value={blueprintName}
          onChange={(e) => setBlueprintName(e.target.value)}
          placeholder="Blueprint name..."
          className="ship-builder-panel__name-input"
          aria-label="Blueprint name"
        />
        <button
          type="button"
          className="ship-builder-panel__save-btn"
          onClick={handleSave}
          disabled={!validation.valid || !blueprintName.trim()}
          title={validation.valid ? 'Save blueprint to localStorage' : 'Fix required slots first'}
        >
          💾 Save
        </button>
        <button
          type="button"
          className="ship-builder-panel__clear-btn"
          onClick={handleClear}
          title="Clear all selections"
        >
          ↺ Clear
        </button>
      </div>

      {statusMessage && (
        <p className="ship-builder-panel__status" role="status">
          {statusMessage}
        </p>
      )}

      <div className="ship-builder-panel__library">
        <h4 className="ship-builder-panel__library-title">Saved Blueprints ({saved.length})</h4>
        <p className="ship-builder-panel__library-context">
          Active planet: <strong>{activePlanetLabel}</strong> · {idlePads.length} idle pad
          {idlePads.length === 1 ? '' : 's'} ready to print
        </p>
        {saved.length === 0 ? (
          <p className="ship-builder-panel__library-empty">
            No saved blueprints yet. Build a ship and save it above.
          </p>
        ) : (
          <ul className="ship-builder-panel__library-list">
            {saved.map((bp) => {
              const bpBuild: ColonyShipBuild = {
                buildId: bp.id,
                displayName: bp.name,
                pieces: bp.pieces,
              }
              const bpResolved = resolveShipBuild(bpBuild, researchedTechs)
              const bpCost = aggregateCost(bpResolved.totalCost)
              const canAfford = bpCost.every((c) => stockOf(inventory, c.resource) >= c.amount)
              const hasMissingTech = bpResolved.missingTechs.length > 0
              const canPrint = idlePads.length > 0 && canAfford && !hasMissingTech
              const printTitle = !canPrint
                ? idlePads.length === 0
                  ? 'No idle pads on this planet — wait for a pad to reach IDLE or GONE state'
                  : hasMissingTech
                    ? `Missing techs: ${bpResolved.missingTechs.map(String).join(', ')}`
                    : 'Cannot afford — check Total Cost above'
                : `Print on first idle pad (${String(idlePads[0]!.id)})`
              return (
                <li key={bp.id} className="ship-builder-panel__library-row">
                  <span className="ship-builder-panel__library-name">{bp.name}</span>
                  <span className="ship-builder-panel__library-meta">{bp.pieces.length} parts</span>
                  <button
                    type="button"
                    className="ship-builder-panel__library-btn"
                    onClick={() => handleLoad(bp)}
                    title="Load this blueprint into the picker"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    className="ship-builder-panel__library-btn ship-builder-panel__library-btn--print"
                    onClick={() => {
                      const pad = idlePads[0]
                      if (!pad) {
                        setStatusMessage('No idle pads on this planet.')
                        return
                      }
                      const baseVariant = inferBaseVariantFromStats(bpResolved.stats)
                      const ok = onPrintBlueprint(
                        pad.id,
                        baseVariant,
                        bp.name,
                        bp.pieces,
                        bpResolved.stats,
                        bpCost,
                      )
                      setStatusMessage(
                        ok
                          ? `Printing "${bp.name}" on pad ${String(pad.id)}.`
                          : 'Print failed — pad busy or inventory short.',
                      )
                    }}
                    disabled={!canPrint}
                    title={printTitle}
                  >
                    🚀 Print
                  </button>
                  <button
                    type="button"
                    className="ship-builder-panel__library-btn ship-builder-panel__library-btn--danger"
                    onClick={() => handleDelete(bp)}
                    title="Delete this blueprint"
                  >
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function aggregateCost(
  costs: ReadonlyArray<{ resource: import('@smol/shared').ResourceId; amount: number }>,
): ReadonlyArray<{ resource: import('@smol/shared').ResourceId; amount: number }> {
  const map = new Map<import('@smol/shared').ResourceId, number>()
  for (const c of costs) map.set(c.resource, (map.get(c.resource) ?? 0) + c.amount)
  return [...map.entries()].map(([resource, amount]) => ({ resource, amount }))
}

interface SlotPickerProps {
  readonly slot: ShipPieceSlot
  readonly label: string
  readonly required: boolean
  readonly options: ReadonlyArray<ShipPieceDef>
  readonly selectedId: string | null
  readonly researchedTechs: ReadonlySet<TechId>
  readonly onSelect: (id: string | null) => void
}

function SlotPicker({
  label,
  required,
  options,
  selectedId,
  researchedTechs,
  onSelect,
}: SlotPickerProps) {
  return (
    <div
      className={`ship-builder-panel__slot ${selectedId ? 'ship-builder-panel__slot--filled' : ''} ${required ? 'ship-builder-panel__slot--required' : ''}`}
    >
      <div className="ship-builder-panel__slot-label">
        {label}
        {required && <span className="ship-builder-panel__required">*</span>}
      </div>
      <select
        value={selectedId ?? ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="ship-builder-panel__slot-select"
        aria-label={`Select ${label}`}
      >
        <option value="">— none —</option>
        {options.map((piece) => {
          const techLocked = piece.techWalls.some((t) => !researchedTechs.has(t))
          return (
            <option key={piece.id} value={piece.id} disabled={techLocked}>
              {piece.emoji} {piece.name} (T{piece.tier}){techLocked ? ' 🔒' : ''}
            </option>
          )
        })}
      </select>
      {selectedId &&
        (() => {
          const piece = options.find((p) => p.id === selectedId)
          if (!piece) return null
          return (
            <p className="ship-builder-panel__slot-desc" title={piece.description}>
              {piece.description}
            </p>
          )
        })()}
    </div>
  )
}
