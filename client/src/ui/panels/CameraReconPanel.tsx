import { LCDFrame } from './LCDFrame'
import './CameraReconPanel.css'

export type ScoutShipKind = 'scout' | 'surveyor' | 'probe'

export type ThreatLevel = 'unknown' | 'clear' | 'moderate' | 'hostile' | 'overwhelming'

export interface ScoutReport {
  readonly id: string
  readonly shipKind: ScoutShipKind
  readonly targetLabel: string
  readonly biomeLabel: string
  readonly biomeEmoji: string
  readonly hostilityTier: 0 | 1 | 2 | 3
  readonly resourceHotspots: ReadonlyArray<{
    readonly resourceLabel: string
    readonly emoji: string
    readonly density: 'low' | 'mid' | 'high'
  }>
  readonly threatLevel: ThreatLevel
  readonly observedCivLabel: string | null
  readonly observedTechSignature: string | null
  readonly arrivedAtTick: number
}

interface CameraReconPanelProps {
  readonly reports: ReadonlyArray<ScoutReport>
  readonly currentTick: number
}

const SHIP_GLYPH: Readonly<Record<ScoutShipKind, string>> = {
  scout: '🛰️',
  surveyor: '📡',
  probe: '🔬',
}

const THREAT_VARIANT: Readonly<Record<ThreatLevel, 'green' | 'amber' | 'red' | 'blue'>> = {
  unknown: 'blue',
  clear: 'green',
  moderate: 'amber',
  hostile: 'red',
  overwhelming: 'red',
}

const THREAT_LABEL: Readonly<Record<ThreatLevel, string>> = {
  unknown: 'unknown',
  clear: 'clear',
  moderate: 'moderate',
  hostile: 'hostile',
  overwhelming: 'overwhelming',
}

export function CameraReconPanel({ reports, currentTick }: CameraReconPanelProps) {
  const sorted = [...reports].sort((a, b) => b.arrivedAtTick - a.arrivedAtTick)
  const overallThreat: ThreatLevel =
    sorted.find((r) => r.threatLevel === 'overwhelming')?.threatLevel ??
    sorted.find((r) => r.threatLevel === 'hostile')?.threatLevel ??
    sorted.find((r) => r.threatLevel === 'moderate')?.threatLevel ??
    'clear'
  const variant = THREAT_VARIANT[overallThreat]
  return (
    <LCDFrame
      title="📡 Recon Camera Feed"
      statusGlyph={overallThreat === 'clear' ? '✓' : '!'}
      statusLabel={`${reports.length} reports`}
      variant={variant}
    >
      <div className="recon-panel">
        {reports.length === 0 ? (
          <p className="recon-panel__empty">No scout reports on file.</p>
        ) : (
          <ul className="recon-panel__list">
            {sorted.map((report) => (
              <ReconRow key={report.id} report={report} currentTick={currentTick} />
            ))}
          </ul>
        )}
      </div>
    </LCDFrame>
  )
}

interface ReconRowProps {
  readonly report: ScoutReport
  readonly currentTick: number
}

function ReconRow({ report, currentTick }: ReconRowProps) {
  const ticksAgo = Math.max(0, currentTick - report.arrivedAtTick)
  const variant = THREAT_VARIANT[report.threatLevel]
  return (
    <li className={`recon-panel__row recon-panel__row--${variant}`}>
      <header className="recon-panel__row-head">
        <span className="recon-panel__ship">
          {SHIP_GLYPH[report.shipKind]} {report.shipKind}
        </span>
        <span className="recon-panel__target">{report.targetLabel}</span>
        <span className="recon-panel__ago">T-{ticksAgo}</span>
      </header>
      <div className="recon-panel__row-body">
        <div className="recon-panel__biome">
          <span>{report.biomeEmoji}</span>
          <span>{report.biomeLabel}</span>
          <span className="recon-panel__hostility">tier-{report.hostilityTier}</span>
        </div>
        <div className="recon-panel__resources">
          {report.resourceHotspots.length === 0 ? (
            <span className="recon-panel__resources-empty">no hotspots</span>
          ) : (
            report.resourceHotspots.map((r, i) => (
              <span
                key={`${report.id}-r-${i}`}
                className={`recon-panel__hotspot recon-panel__hotspot--${r.density}`}
              >
                {r.emoji} {r.resourceLabel}
              </span>
            ))
          )}
        </div>
        <div className="recon-panel__intel">
          {report.observedCivLabel && (
            <span className="recon-panel__civ">civ={report.observedCivLabel}</span>
          )}
          {report.observedTechSignature && (
            <span className="recon-panel__tech">tech={report.observedTechSignature}</span>
          )}
          <span className={`recon-panel__threat recon-panel__threat--${variant}`}>
            threat={THREAT_LABEL[report.threatLevel]}
          </span>
        </div>
      </div>
    </li>
  )
}
