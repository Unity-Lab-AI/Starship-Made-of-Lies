import { useState } from 'react'
import {
  bureaucracyDecayLabel,
  type DeceptionLedger,
  type DeceptionMetric,
  dissidentRatio,
  type FactionSplit,
  frameMetric,
  loyalRatio,
  performanceMultiplier,
  type Theme,
} from '@smol/shared'
import './DeceptionPanel.css'

interface DeceptionPanelProps {
  readonly theme: Theme
  readonly faction: FactionSplit
  readonly ledger: DeceptionLedger
}

const METRICS: ReadonlyArray<DeceptionMetric> = [
  'volunteersRecruited',
  'citizensConscripted',
  'colonyShipsLaunched',
  'enemyCivilizationsDestroyed',
  'citizensSentOnOneWayTrips',
]

export function DeceptionPanel({ theme, faction, ledger }: DeceptionPanelProps) {
  const [truthToggle, setTruthToggle] = useState(false)
  const loyalPct = Math.round(loyalRatio(faction) * 100)
  const dissidentPct = Math.round(dissidentRatio(faction) * 100)
  const skepticPct = Math.max(0, 100 - loyalPct - dissidentPct)
  const perfMult = performanceMultiplier(faction)
  const decayPhrase = bureaucracyDecayLabel(theme, dissidentRatio(faction))

  return (
    <section className="deception-panel" aria-label="Deception state">
      <header className="deception-panel__header">
        <h2>{theme.emoji} Loyalty Index</h2>
        <button
          type="button"
          className="deception-panel__truth-toggle"
          onClick={() => setTruthToggle((t) => !t)}
          aria-pressed={truthToggle}
        >
          {truthToggle ? 'Showing Truth' : 'Show Truth'}
        </button>
      </header>

      <div className="deception-panel__faction-bar" role="img" aria-label="Faction split">
        <div
          className="deception-panel__faction-cell deception-panel__faction-loyal"
          style={{ width: `${loyalPct}%` }}
        >
          <span className="deception-panel__faction-cell-label">Loyal {loyalPct}%</span>
        </div>
        <div
          className="deception-panel__faction-cell deception-panel__faction-skeptic"
          style={{ width: `${skepticPct}%` }}
        >
          <span className="deception-panel__faction-cell-label">Skeptic {skepticPct}%</span>
        </div>
        <div
          className="deception-panel__faction-cell deception-panel__faction-dissident"
          style={{ width: `${dissidentPct}%` }}
        >
          <span className="deception-panel__faction-cell-label">Dissident {dissidentPct}%</span>
        </div>
      </div>

      <div className="deception-panel__decay">
        <span className="deception-panel__decay-label">Bureaucracy:</span>{' '}
        <em className="deception-panel__decay-phrase">{decayPhrase}</em>
        <span className="deception-panel__perf">— performance ×{perfMult.toFixed(2)}</span>
      </div>

      <ul className="deception-panel__ledger">
        {METRICS.map((metric) => (
          <li key={metric} className="deception-panel__ledger-item">
            {frameMetric(metric, theme, ledger[metric], truthToggle)}
          </li>
        ))}
      </ul>
    </section>
  )
}
