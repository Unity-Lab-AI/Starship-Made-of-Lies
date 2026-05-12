import {
  type BuildingDefId,
  type MineField,
  type PlanetId,
  BLDG_COUNTER_MISSILE,
} from '@smol/shared'
import './DefensePanel.css'

// PHASE 17.12.2 — Defense panel. Per user TODO spec: dedicated 🛡 Defense toolbar entry with
// per-planet mine-field visualization, counter-missile-pad coverage, and incoming-threat list.
//
// Per user correction 2026-05-12: "what the fuck is up with this buildanbble mine fireld this
// is bogus mine fields are emjoi spaceships launched one at a time after printing and design
// work of what type of starship u are using for the mine fireld options". Mines are LAUNCHED
// ships, NOT tile-placed buildings. The quick-build button for Mine Field is removed; player
// uses 🛠 Ship Builder to design a mine-laying variant + launches it from a pad. Counter-
// Missile Pad stays as a tile building (it's a launcher infrastructure, not the projectile).

export interface DefensePanelIncomingThreat {
  readonly flightId: string
  readonly fromPlanetLabel: string
  readonly variantEmoji: string
  readonly variantName: string
  readonly phaseLabel: string
  readonly etaTicks: number
}

interface DefensePanelProps {
  readonly planetId: PlanetId
  readonly planetLabel: string
  readonly mineFields: ReadonlyArray<MineField>
  readonly counterPadCount: number
  readonly incomingThreats: ReadonlyArray<DefensePanelIncomingThreat>
  readonly onQuickBuild: (defId: BuildingDefId) => void
}

export function DefensePanel({
  planetId,
  planetLabel,
  mineFields,
  counterPadCount,
  incomingThreats,
  onQuickBuild,
}: DefensePanelProps) {
  const totalDetonationsRemaining = mineFields.reduce((s, m) => s + m.remainingDetonations, 0)
  return (
    <section className="defense-panel" aria-label={`Defense overview for ${planetLabel}`}>
      <header className="defense-panel__header">
        <h2>🛡 Defense — {planetLabel}</h2>
      </header>

      <section className="defense-panel__section" aria-label="Defense stats">
        <ul className="defense-panel__stat-list">
          <li className="defense-panel__stat">
            <span className="defense-panel__stat-emoji" aria-hidden>
              💣
            </span>
            <span className="defense-panel__stat-label">Mine Fields placed</span>
            <span className="defense-panel__stat-value">
              {mineFields.length} ({totalDetonationsRemaining} detonations remaining)
            </span>
          </li>
          <li className="defense-panel__stat">
            <span className="defense-panel__stat-emoji" aria-hidden>
              🛡️
            </span>
            <span className="defense-panel__stat-label">Counter-Missile Pads</span>
            <span className="defense-panel__stat-value">{counterPadCount}</span>
          </li>
          <li className="defense-panel__stat">
            <span className="defense-panel__stat-emoji" aria-hidden>
              🚨
            </span>
            <span className="defense-panel__stat-label">Incoming hostile flights</span>
            <span
              className={`defense-panel__stat-value${
                incomingThreats.length > 0 ? ' defense-panel__stat-value--alert' : ''
              }`}
            >
              {incomingThreats.length}
            </span>
          </li>
        </ul>
      </section>

      <section className="defense-panel__section" aria-label="Incoming threats">
        <h3 className="defense-panel__section-title">Incoming threats</h3>
        {incomingThreats.length === 0 ? (
          <p className="defense-panel__empty">
            No hostile flights currently targeting this planet.
          </p>
        ) : (
          <ul className="defense-panel__threat-list">
            {incomingThreats.map((t) => (
              <li key={t.flightId} className="defense-panel__threat-row">
                <span className="defense-panel__threat-emoji" aria-hidden>
                  {t.variantEmoji}
                </span>
                <div className="defense-panel__threat-text">
                  <span className="defense-panel__threat-name">{t.variantName}</span>
                  <span className="defense-panel__threat-source">from {t.fromPlanetLabel}</span>
                </div>
                <span className="defense-panel__threat-phase">{t.phaseLabel}</span>
                <span className="defense-panel__threat-eta">
                  ETA {t.etaTicks > 0 ? `${t.etaTicks}t` : 'impact'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="defense-panel__section" aria-label="Build counter-missile pad">
        <h3 className="defense-panel__section-title">Build defensive infrastructure</h3>
        <div className="defense-panel__quick-build">
          <button
            type="button"
            className="defense-panel__build-btn"
            onClick={() => onQuickBuild(BLDG_COUNTER_MISSILE)}
            title="Open the build picker pre-selected to Counter-Missile Pad. Auto-intercepts incoming flights."
          >
            🛡️ Place Counter-Missile Pad
          </button>
        </div>
        <p className="defense-panel__hint">
          {/* Per user correction 2026-05-12: mines are LAUNCHED ships, not tile-placed
              buildings. Pointer to the correct workflow goes here. */}
          💣 <strong>Mines are LAUNCHED, not placed.</strong> Open 🛠 Ship Builder to design a
          mine-laying variant + launch it from a Launch Pad to deploy mines in a target zone.
        </p>
        <p className="defense-panel__hint">
          Cover-arc indicator on the planet sphere + per-pad reserves slider land in a follow-on
          polish pass.
        </p>
      </section>
      {/* planetId unused at render — kept on props so the parent can scope incoming threats. */}
      <span hidden aria-hidden>
        {String(planetId)}
      </span>
    </section>
  )
}
