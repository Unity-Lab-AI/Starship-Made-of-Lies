import { type PlanetId } from '@smol/shared'
import { PanelFrame } from './PanelFrame'
import './play-shell.css'

interface PlanetPickerEntry {
  readonly id: PlanetId
  readonly label: string
  readonly biomeEmoji: string
  readonly tileCount: number
  readonly buildingCount: number
  readonly isActive: boolean
}

interface PlanetPickerProps {
  readonly planets: ReadonlyArray<PlanetPickerEntry>
  readonly onSelect: (id: PlanetId) => void
  readonly onClose: () => void
}

export function PlanetPicker({ planets, onSelect, onClose }: PlanetPickerProps) {
  return (
    <PanelFrame
      panelId="planet-picker"
      title={`Your Planets (${planets.length})`}
      emoji="📍"
      onClose={onClose}
      variant="centered"
      width={420}
      extraClass="planet-picker"
    >
      {planets.length === 0 ? (
        <p className="planet-picker__empty">You own no planets. (Should not happen — bug?)</p>
      ) : (
        <ul className="planet-picker__list">
          {planets.map((p) => (
            <li key={String(p.id)}>
              <button
                type="button"
                className={`planet-picker__row ${p.isActive ? 'planet-picker__row--active' : ''}`}
                onClick={() => onSelect(p.id)}
              >
                <span className="planet-picker__row-emoji" aria-hidden>
                  {p.biomeEmoji}
                </span>
                <span className="planet-picker__row-label">{p.label}</span>
                <span className="planet-picker__row-stat">{p.buildingCount} bldgs</span>
                <span className="planet-picker__row-stat">{p.tileCount} tiles</span>
                {p.isActive && <span className="planet-picker__row-active">VIEWING</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelFrame>
  )
}
