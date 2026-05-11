import {
  abort,
  arm,
  type ColonyShipDef,
  disarm,
  getColonyShipDef,
  type LaunchPad,
  launch,
  type PadState,
  readinessPercent,
} from '@smol/shared'
import './LaunchPadPanel.css'

interface LaunchPadPanelProps {
  readonly pad: LaunchPad
  readonly onAfterAction?: () => void
}

const STATE_LABELS: Readonly<Record<PadState, string>> = {
  INIT: 'Initializing',
  IDLE: 'Idle',
  PRINT: 'Printing',
  BUILD: 'Building',
  DOCK: 'Docked',
  FUEL: 'Fueling',
  AMMO: 'Loading Ammo',
  READY: 'Ready',
  ARM: 'Armed',
  LAUNCH: 'Launching',
  GONE: 'Departed',
}

const STATE_GLYPH: Readonly<Record<PadState, string>> = {
  INIT: '◌',
  IDLE: '·',
  PRINT: '▰',
  BUILD: '▰▰',
  DOCK: '⚓',
  FUEL: '⛽',
  AMMO: '🔫',
  READY: '✓',
  ARM: '⚠',
  LAUNCH: '🚀',
  GONE: '✦',
}

export function LaunchPadPanel({ pad, onAfterAction }: LaunchPadPanelProps) {
  const def: ColonyShipDef | null = pad.loadedShipVariantId
    ? getColonyShipDef(pad.loadedShipVariantId)
    : null
  const readiness = readinessPercent(pad)
  const target = pad.targetQueue[pad.activeTargetIdx] ?? null

  const fuelMax = def?.fuelRequirement ?? 0
  const ammoMax = def?.ammoRequirement ?? 0
  const citizenMax = def?.payload.citizenCapacity ?? 0

  return (
    <section className="launch-pad-panel" aria-label="Launch pad">
      <header className="launch-pad-panel__header">
        <h2>
          🚀 Pad <span className="launch-pad-panel__pad-id">{pad.id}</span>
          {pad.isController ? (
            <span className="launch-pad-panel__controller-badge" title="Controller pad">
              ◆ CTRL
            </span>
          ) : null}
        </h2>
        <span
          className={`launch-pad-panel__state launch-pad-panel__state--${pad.state.toLowerCase()}`}
        >
          {STATE_GLYPH[pad.state]} {STATE_LABELS[pad.state]}
        </span>
      </header>

      {def ? (
        <div className="launch-pad-panel__loaded-ship">
          <span className="launch-pad-panel__ship-emoji" aria-hidden="true">
            {def.emoji}
          </span>
          <span className="launch-pad-panel__ship-name">{def.name}</span>
          <span className="launch-pad-panel__ship-tier">T{def.darknessTier}</span>
        </div>
      ) : (
        <p className="launch-pad-panel__empty">No colony ship loaded.</p>
      )}

      <div className="launch-pad-panel__readiness-bar" role="img" aria-label="Pad readiness">
        <div
          className="launch-pad-panel__readiness-fill"
          style={{ width: `${Math.round(readiness * 100)}%` }}
        />
        <span className="launch-pad-panel__readiness-label">
          {Math.round(readiness * 100)}% ready
        </span>
      </div>

      {def ? (
        <ul className="launch-pad-panel__loadout">
          <li>
            ⛽ Fuel{' '}
            <span className="launch-pad-panel__loadout-num">
              {pad.fuelLoaded}/{fuelMax}
            </span>
          </li>
          <li>
            💥 Ammo{' '}
            <span className="launch-pad-panel__loadout-num">
              {pad.ammoLoaded}/{ammoMax}
            </span>
          </li>
          <li>
            👤 Citizens{' '}
            <span className="launch-pad-panel__loadout-num">
              {pad.citizensLoaded}/{citizenMax}
            </span>
          </li>
        </ul>
      ) : null}

      <div className="launch-pad-panel__target">
        <span className="launch-pad-panel__target-label">Target:</span>{' '}
        {target ? (
          <span className="launch-pad-panel__target-value">
            🎯 {target.label ?? `Planet ${target.targetPlanetId}`}
          </span>
        ) : (
          <span className="launch-pad-panel__target-empty">— none —</span>
        )}
      </div>

      {pad.lastOutcome ? (
        <div
          className={`launch-pad-panel__outcome launch-pad-panel__outcome--${pad.lastOutcome.toLowerCase()}`}
        >
          Last outcome: {pad.lastOutcome.replace('_', ' ')}
        </div>
      ) : null}

      <div className="launch-pad-panel__buttons">
        <button
          type="button"
          disabled={pad.state !== 'READY'}
          onClick={() => {
            arm(pad)
            onAfterAction?.()
          }}
        >
          Arm
        </button>
        <button
          type="button"
          disabled={pad.state !== 'ARM'}
          onClick={() => {
            disarm(pad)
            onAfterAction?.()
          }}
        >
          Disarm
        </button>
        <button
          type="button"
          disabled={pad.state !== 'ARM'}
          onClick={() => {
            launch(pad)
            onAfterAction?.()
          }}
        >
          Launch 🚀
        </button>
        <button
          type="button"
          className="launch-pad-panel__abort"
          disabled={
            pad.state === 'IDLE' ||
            pad.state === 'INIT' ||
            pad.state === 'GONE' ||
            pad.state === 'LAUNCH'
          }
          onClick={() => {
            abort(pad)
            onAfterAction?.()
          }}
        >
          Abort
        </button>
      </div>
    </section>
  )
}
