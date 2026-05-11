import { type IndigenousCiv } from '@smol/shared'
import './IndigenousPanel.css'

interface IndigenousPanelProps {
  readonly indig: IndigenousCiv | null
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

export function IndigenousPanel({ indig }: IndigenousPanelProps) {
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
    </section>
  )
}
