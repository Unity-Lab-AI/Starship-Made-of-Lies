import { useMemo } from 'react'
import {
  type ColonyShipVariantId,
  type LaunchPad,
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
          {salvoRoundActive && (
            <span className="command-pad__salvo-status">
              {salvoRoundPhaseLabel ?? 'running...'}
            </span>
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
