import { useMemo, useState } from 'react'
import {
  type ColonyShipVariantId,
  type LaunchPad,
  type PadTargetWaypoint,
  type PlanetId,
  type Theme,
  getColonyShipDef,
} from '@smol/shared'
import './command-pad-panel.css'

// PHASE 16.14 — multi-pad controller mode UI. UMS UnityPad has the "controller pad" concept:
// one pad on a planet is designated as the controller and gains mass-action commands
// (BUILDALL / ARMALL / LAUNCHALL / ABORTALL / COPYTGT) that broadcast to every slave pad
// on the same construct. This is the SMoL surface — a single panel that shows the controller
// pad + all slave pads on the same planet and exposes the mass-action buttons.
//
// Per super-review 2026-05-10: the previous SMoL state had `isController` as a single boolean
// on LaunchPad with NO mass-action UI. This panel closes that gap. v1 scope: first pad on the
// planet is treated as the controller (the actual `isController` flag is informational only
// for now; mass actions apply to ALL pads on the planet uniformly).

export interface CommandPadPanelProps {
  readonly planetId: PlanetId
  readonly theme: Theme
  readonly pads: ReadonlyArray<LaunchPad>
  readonly availableVariants: ReadonlyArray<ColonyShipVariantId>
  readonly onBuildAll: (variantId: ColonyShipVariantId) => void
  readonly onArmAll: () => void
  readonly onLaunchAll: () => void
  readonly onAbortAll: () => void
  readonly onCopyTargetFromController: () => void
  // PHASE 16.19: one-click salvo orchestrator — fires BUILDALL → wait → ARMALL → wait → LAUNCHALL
  // automatically. Parent owns the timing/state; panel just exposes the button.
  readonly onFireSalvoRound?: () => void
  readonly salvoRoundActive?: boolean | undefined
  readonly salvoRoundPhaseLabel?: string | undefined
  // PHASE 16.37 — auto-fire indefinite-loop toggle. When ON, the salvo cycle auto-restarts
  // after each round so the player can "fire and forget" a sustained barrage. Parent owns the
  // state; panel just exposes the toggle button.
  readonly autoFireLoopActive?: boolean
  readonly onToggleAutoFireLoop?: () => void
  // PHASE 17.L.B.9 — waypoint queue editor (Q6 PHASE 17 LOCKED). Targetable planet roster
  // sourced from the active galaxy. Player builds + reorders + deletes target waypoints on
  // the controller pad through this surface; queue feeds LAUNCHALL + COPYTGT mass actions.
  readonly targetablePlanets?: ReadonlyArray<{
    readonly id: PlanetId
    readonly label: string
    readonly isEnemy: boolean
  }>
  readonly onSetWaypoints?: (waypoints: ReadonlyArray<PadTargetWaypoint>) => void
}

interface PadCounters {
  readonly total: number
  readonly idle: number
  readonly building: number
  readonly ready: number
  readonly armed: number
  readonly launched: number
  readonly other: number
}

function tallyPads(pads: ReadonlyArray<LaunchPad>): PadCounters {
  let idle = 0
  let building = 0
  let ready = 0
  let armed = 0
  let launched = 0
  let other = 0
  for (const pad of pads) {
    switch (pad.state) {
      case 'IDLE':
      case 'INIT':
        idle += 1
        break
      case 'PRINT':
      case 'BUILD':
      case 'DOCK':
      case 'FUEL':
      case 'AMMO':
        building += 1
        break
      case 'READY':
        ready += 1
        break
      case 'ARM':
        armed += 1
        break
      case 'LAUNCH':
      case 'GONE':
        launched += 1
        break
      default:
        other += 1
    }
  }
  return { total: pads.length, idle, building, ready, armed, launched, other }
}

export function CommandPadPanel({
  planetId,
  theme,
  pads,
  availableVariants,
  onBuildAll,
  onArmAll,
  onLaunchAll,
  onAbortAll,
  onCopyTargetFromController,
  onFireSalvoRound,
  salvoRoundActive,
  salvoRoundPhaseLabel,
  autoFireLoopActive,
  onToggleAutoFireLoop,
  targetablePlanets,
  onSetWaypoints,
}: CommandPadPanelProps) {
  const counters = useMemo(() => tallyPads(pads), [pads])
  const controllerPad = pads[0] ?? null

  if (pads.length < 2) {
    return (
      <div className="command-pad">
        <p className="command-pad__hint">
          Command Pad activates when you have <strong>2 or more launch pads</strong> on the same
          planet. The first pad becomes the controller; the rest accept mass actions (BUILDALL /
          ARMALL / LAUNCHALL / ABORTALL / COPYTGT).
        </p>
        <p className="command-pad__hint">
          Active planet <strong>{String(planetId)}</strong> currently has{' '}
          <strong>{pads.length}</strong> pad{pads.length === 1 ? '' : 's'}. Build more pads to
          unlock multi-pad coordination.
        </p>
      </div>
    )
  }

  return (
    <div className="command-pad">
      <header className="command-pad__header">
        <span className="command-pad__title">
          🎛 Command Pad · {theme.emoji} {String(planetId)}
        </span>
        <span className="command-pad__count">{counters.total} pads</span>
      </header>

      <div className="command-pad__counters">
        <div className="command-pad__counter">
          <span className="command-pad__counter-label">Idle</span>
          <span className="command-pad__counter-value">{counters.idle}</span>
        </div>
        <div className="command-pad__counter">
          <span className="command-pad__counter-label">Building</span>
          <span className="command-pad__counter-value">{counters.building}</span>
        </div>
        <div className="command-pad__counter">
          <span className="command-pad__counter-label">Ready</span>
          <span className="command-pad__counter-value">{counters.ready}</span>
        </div>
        <div className="command-pad__counter">
          <span className="command-pad__counter-label">Armed</span>
          <span className="command-pad__counter-value">{counters.armed}</span>
        </div>
        <div className="command-pad__counter">
          <span className="command-pad__counter-label">Launched</span>
          <span className="command-pad__counter-value">{counters.launched}</span>
        </div>
      </div>

      {controllerPad && (
        <div className="command-pad__controller">
          <span className="command-pad__controller-label">Controller pad</span>
          <span className="command-pad__controller-value">
            {String(controllerPad.id)} · {controllerPad.state}
          </span>
          {controllerPad.targetQueue.length > 0 && (
            <span className="command-pad__controller-target">
              Targets: {controllerPad.targetQueue.length}
            </span>
          )}
        </div>
      )}

      {controllerPad && targetablePlanets && onSetWaypoints && (
        <WaypointQueueEditor
          controllerPad={controllerPad}
          targetablePlanets={targetablePlanets}
          onSetWaypoints={onSetWaypoints}
        />
      )}

      <section className="command-pad__actions">
        <h4 className="command-pad__actions-title">Mass actions</h4>
        <div className="command-pad__action-row">
          <label className="command-pad__build-label">
            <span>BUILDALL —</span>
            <select
              className="command-pad__build-select"
              defaultValue=""
              onChange={(e) => {
                const v = e.currentTarget.value as ColonyShipVariantId | ''
                if (v) {
                  onBuildAll(v)
                  e.currentTarget.value = ''
                }
              }}
            >
              <option value="" disabled>
                pick a variant...
              </option>
              {availableVariants.map((id) => {
                const def = getColonyShipDef(id)
                return (
                  <option key={id} value={id}>
                    {def.emoji} {def.name}
                  </option>
                )
              })}
            </select>
          </label>
        </div>
        <div className="command-pad__action-row command-pad__action-row--buttons">
          <button
            type="button"
            className="command-pad__btn"
            onClick={onArmAll}
            disabled={counters.ready === 0}
            title="Arm every pad that is READY"
          >
            ⚡ ARMALL ({counters.ready})
          </button>
          <button
            type="button"
            className="command-pad__btn command-pad__btn--launch"
            onClick={onLaunchAll}
            disabled={counters.armed === 0}
            title="Launch every armed pad — UMS-style salvo stagger TBD (v1: simultaneous)"
          >
            🚀 LAUNCHALL ({counters.armed})
          </button>
          <button
            type="button"
            className="command-pad__btn command-pad__btn--abort"
            onClick={onAbortAll}
            disabled={counters.armed + counters.ready + counters.building === 0}
            title="Abort every active build / arm / launch"
          >
            ✕ ABORTALL
          </button>
          <button
            type="button"
            className="command-pad__btn"
            onClick={onCopyTargetFromController}
            disabled={!controllerPad || controllerPad.targetQueue.length === 0}
            title="Copy the controller pad's target queue to every slave pad"
          >
            📍 COPYTGT
          </button>
        </div>
      </section>

      {onFireSalvoRound && (
        <section className="command-pad__salvo">
          <h4 className="command-pad__actions-title">Auto-fire round</h4>
          <button
            type="button"
            className="command-pad__btn command-pad__btn--launch"
            onClick={onFireSalvoRound}
            disabled={salvoRoundActive || counters.total === 0}
            title="One-click cycle: BUILDALL → wait → ARMALL → wait → LAUNCHALL"
          >
            ▶ Fire Salvo Round
          </button>
          {onToggleAutoFireLoop && (
            <button
              type="button"
              className={
                autoFireLoopActive
                  ? 'command-pad__btn command-pad__btn--loop-on'
                  : 'command-pad__btn command-pad__btn--loop-off'
              }
              onClick={onToggleAutoFireLoop}
              title={
                autoFireLoopActive
                  ? 'Auto-fire loop is ON — rounds will auto-restart. Click to stop after this round.'
                  : 'Toggle indefinite auto-fire loop — salvo rounds will re-trigger continuously.'
              }
            >
              {autoFireLoopActive ? '🔁 Loop ON' : '⏹ Loop OFF'}
            </button>
          )}
          {salvoRoundActive && (
            <span className="command-pad__salvo-status">
              {salvoRoundPhaseLabel ?? 'running...'}
            </span>
          )}
          {autoFireLoopActive && !salvoRoundActive && (
            <span className="command-pad__salvo-status">⌛ next round in 1.5s…</span>
          )}
        </section>
      )}

      <p className="command-pad__note">
        v1 mass actions apply to every pad on this planet uniformly. UMS-faithful salvo stagger (15s
        interval between LAUNCH messages, per-pad targeted-pad payload) is on the roadmap — see{' '}
        <code>SMOL_REFERENCE_PAD.md</code> §Salvo Stagger.
      </p>
    </div>
  )
}

// PHASE 17.L.B.9 — Waypoint queue editor. Q6 PHASE 17 LOCKED answer required this surface to
// close out CommandPadPanel: "Full UMS parity — Set Pad Controller button → controller-mode
// panel with Build All / Arm All / Launch All / Abort All + per-slave-pad status table +
// waypoint queue editor." Mass-action buttons + per-pad tally already shipped; this is the
// missing drag-reorder GPS-targets editor. Live-saves on every mutation (UMS UnityPad
// CustomData live-read parity).
interface WaypointQueueEditorProps {
  readonly controllerPad: LaunchPad
  readonly targetablePlanets: ReadonlyArray<{
    readonly id: PlanetId
    readonly label: string
    readonly isEnemy: boolean
  }>
  readonly onSetWaypoints: (waypoints: ReadonlyArray<PadTargetWaypoint>) => void
}

function WaypointQueueEditor({
  controllerPad,
  targetablePlanets,
  onSetWaypoints,
}: WaypointQueueEditorProps) {
  const [newPlanetId, setNewPlanetId] = useState<string>('')
  const [newLabel, setNewLabel] = useState<string>('')

  const planetById = useMemo(() => {
    const map = new Map<string, { id: PlanetId; label: string; isEnemy: boolean }>()
    for (const p of targetablePlanets) map.set(String(p.id), p)
    return map
  }, [targetablePlanets])

  const queue = controllerPad.targetQueue

  const commit = (next: ReadonlyArray<PadTargetWaypoint>): void => {
    onSetWaypoints(next)
  }

  const moveUp = (idx: number): void => {
    if (idx <= 0) return
    const next = [...queue]
    const above = next[idx - 1]
    const current = next[idx]
    if (!above || !current) return
    next[idx - 1] = current
    next[idx] = above
    commit(next)
  }

  const moveDown = (idx: number): void => {
    if (idx >= queue.length - 1) return
    const next = [...queue]
    const below = next[idx + 1]
    const current = next[idx]
    if (!below || !current) return
    next[idx + 1] = current
    next[idx] = below
    commit(next)
  }

  const remove = (idx: number): void => {
    const next = queue.filter((_, i) => i !== idx)
    commit(next)
  }

  const addWaypoint = (): void => {
    if (!newPlanetId) return
    const target = planetById.get(newPlanetId)
    if (!target) return
    const label = newLabel.trim()
    const waypoint: PadTargetWaypoint = label
      ? { targetPlanetId: target.id, label }
      : { targetPlanetId: target.id }
    commit([...queue, waypoint])
    setNewPlanetId('')
    setNewLabel('')
  }

  return (
    <section className="command-pad__waypoints">
      <h4 className="command-pad__actions-title">Waypoint queue</h4>
      {queue.length === 0 ? (
        <p className="command-pad__waypoints-empty">
          No waypoints set. Add a target planet below — the queue feeds LAUNCHALL and COPYTGT.
        </p>
      ) : (
        <ol className="command-pad__waypoints-list">
          {queue.map((wp, idx) => {
            const target = planetById.get(String(wp.targetPlanetId))
            const planetLabel = target?.label ?? String(wp.targetPlanetId)
            const isActive = idx === controllerPad.activeTargetIdx
            return (
              <li
                key={`${String(wp.targetPlanetId)}-${idx}`}
                className={
                  isActive
                    ? 'command-pad__waypoints-row command-pad__waypoints-row--active'
                    : 'command-pad__waypoints-row'
                }
              >
                <span className="command-pad__waypoints-index">{idx + 1}.</span>
                <span className="command-pad__waypoints-label">
                  {wp.label ? `${wp.label} · ` : ''}
                  {planetLabel}
                  {target?.isEnemy ? ' (enemy)' : ''}
                  {isActive ? ' ← active' : ''}
                </span>
                <button
                  type="button"
                  className="command-pad__waypoints-btn"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  title="Move this waypoint up"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="command-pad__waypoints-btn"
                  onClick={() => moveDown(idx)}
                  disabled={idx === queue.length - 1}
                  title="Move this waypoint down"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="command-pad__waypoints-btn command-pad__waypoints-btn--danger"
                  onClick={() => remove(idx)}
                  title="Remove this waypoint"
                  aria-label="Remove waypoint"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ol>
      )}
      <div className="command-pad__waypoints-add">
        <select
          className="command-pad__waypoints-planet-select"
          value={newPlanetId}
          onChange={(e) => setNewPlanetId(e.target.value)}
          aria-label="Pick target planet"
        >
          <option value="">— pick target planet —</option>
          {targetablePlanets.map((p) => (
            <option key={String(p.id)} value={String(p.id)}>
              {p.label}
              {p.isEnemy ? ' (enemy)' : ''}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="command-pad__waypoints-label-input"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="optional label..."
          aria-label="Optional waypoint label"
          maxLength={40}
        />
        <button
          type="button"
          className="command-pad__btn"
          onClick={addWaypoint}
          disabled={!newPlanetId}
          title="Add this waypoint to the controller pad's target queue"
        >
          + Add
        </button>
      </div>
    </section>
  )
}
