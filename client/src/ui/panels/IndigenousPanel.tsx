import {
  RESOURCE_PROPAGANDA_MATERIALS,
  type IndigenousCiv,
  type PlanetInventory,
} from '@smol/shared'
import './IndigenousPanel.css'

// PHASE 17.12.3 — manual parley cost mirrored from MatchSim.MANUAL_PARLEY_PROPAGANDA_COST so
// the button can show "needs 50 propaganda" + disable when insufficient. Single source of
// truth lives in MatchSim; this is a display-only mirror.
const MANUAL_PARLEY_COST = 50

interface IndigenousPanelProps {
  readonly indig: IndigenousCiv | null
  // PHASE 17.12.3 — planet inventory feeding the parley button. When omitted (legacy
  // callers), the button hides — keeps the panel backwards-compatible with older props.
  readonly hostPlanetInventory?: PlanetInventory | null
  readonly onManualParley?: () => void
}

const HOSTILITY_LABEL: Readonly<Record<string, string>> = {
  hostile: 'HOSTILE',
  neutral: 'Neutral',
  allied: 'ALLIED',
}

const HOSTILITY_CLASS: Readonly<Record<string, string>> = {
  hostile: 'indigenous-panel__hostility--hostile',
  neutral: 'indigenous-panel__hostility--neutral',
  allied: 'indigenous-panel__hostility--allied',
}

export function IndigenousPanel({
  indig,
  hostPlanetInventory,
  onManualParley,
}: IndigenousPanelProps) {
  if (!indig || !indig.alive) {
    return (
      <section className="indigenous-panel" aria-label="Indigenous civilization">
        <header className="indigenous-panel__header">
          <h2>🪶 Indigenous</h2>
        </header>
        <p className="indigenous-panel__empty">No indigenous presence on this planet.</p>
      </section>
    )
  }
  return (
    <section className="indigenous-panel" aria-label="Indigenous civilization">
      <header className="indigenous-panel__header">
        <h2>
          {indig.emoji} {indig.displayName}
        </h2>
        <span className={`indigenous-panel__hostility ${HOSTILITY_CLASS[indig.hostility] ?? ''}`}>
          {HOSTILITY_LABEL[indig.hostility] ?? indig.hostility}
        </span>
      </header>
      <ul className="indigenous-panel__stats">
        <li>Tiles held: {indig.controlledTileIds.size}</li>
        <li>Attacks attempted: {indig.attacksAttempted}</li>
        <li>Successful attacks: {indig.attacksSucceeded}</li>
        <li>Parleys accepted: {indig.parleysAccepted}</li>
      </ul>
      <p className="indigenous-panel__hint">
        {indig.hostility === 'hostile'
          ? 'They attack your tiles every 80 ticks. Heavy propaganda may force a parley.'
          : indig.hostility === 'neutral'
            ? 'Modest propaganda may negotiate tile defection.'
            : 'Aligned with your civ. Light propaganda may onboard them fully.'}
      </p>
      {onManualParley && hostPlanetInventory && (
        <div className="indigenous-panel__manual-parley">
          {(() => {
            const have = hostPlanetInventory.stocks.get(RESOURCE_PROPAGANDA_MATERIALS) ?? 0
            const canAfford = have >= MANUAL_PARLEY_COST
            return (
              <>
                <button
                  type="button"
                  className="indigenous-panel__parley-btn"
                  disabled={!canAfford}
                  onClick={() => onManualParley()}
                  title={
                    canAfford
                      ? `Spend ${MANUAL_PARLEY_COST} propaganda materials to force an immediate parley attempt (boosted power).`
                      : `Need ${MANUAL_PARLEY_COST} propaganda materials — currently have ${have}.`
                  }
                >
                  {canAfford
                    ? `🤝 Negotiate Now (${MANUAL_PARLEY_COST} 📣)`
                    : `⛔ Negotiate Now (need ${MANUAL_PARLEY_COST} 📣, have ${have})`}
                </button>
                <p className="indigenous-panel__parley-hint">
                  Burns propaganda materials to bypass the 60-tick auto-trigger.
                </p>
              </>
            )
          })()}
        </div>
      )}
    </section>
  )
}
