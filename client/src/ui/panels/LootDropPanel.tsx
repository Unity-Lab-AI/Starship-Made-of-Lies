import { type LootDrop, type LootDropId } from '@smol/shared'
import './LootDropPanel.css'

interface LootDropPanelProps {
  readonly drops: ReadonlyArray<LootDrop>
  readonly currentTick: number
  readonly onClaim: (id: LootDropId) => void
}

const DEBRIS_LABEL: Readonly<Record<string, string>> = {
  colony_ship_crash: 'Crashed colony ship',
  mine_field_residue: 'Mine field residue',
  enemy_ship_intercept: 'Intercepted ship',
  orbital_strike_debris: 'Orbital strike debris',
}

export function LootDropPanel({ drops, currentTick, onClaim }: LootDropPanelProps) {
  if (drops.length === 0) {
    return (
      <section className="loot-drop-panel" aria-label="Salvage">
        <header className="loot-drop-panel__header">
          <h2>🎁 Salvage</h2>
        </header>
        <p className="loot-drop-panel__empty">No debris on your planets.</p>
      </section>
    )
  }
  return (
    <section className="loot-drop-panel" aria-label="Salvage">
      <header className="loot-drop-panel__header">
        <h2>🎁 Salvage</h2>
        <span className="loot-drop-panel__count">{drops.length}</span>
      </header>
      <ul className="loot-drop-panel__list">
        {drops.map((drop) => {
          const expiresIn =
            drop.expiresAtTick === null ? null : Math.max(0, drop.expiresAtTick - currentTick)
          return (
            <li key={String(drop.id)} className="loot-drop-panel__item">
              <div className="loot-drop-panel__title">
                💥 {DEBRIS_LABEL[drop.debrisKind] ?? drop.debrisKind}
              </div>
              <div className="loot-drop-panel__resources">
                {drop.resources.map((r) => (
                  <span key={String(r.resource)} className="loot-drop-panel__resource">
                    +{r.amount} {String(r.resource)}
                  </span>
                ))}
              </div>
              {expiresIn !== null && (
                <div className="loot-drop-panel__expires">expires in {expiresIn} ticks</div>
              )}
              <button
                type="button"
                className="loot-drop-panel__claim"
                onClick={() => onClaim(drop.id)}
              >
                Claim
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
