import { useState, type ReactNode } from 'react'
import type { Planet, PlanetId, Theme } from '@smol/shared'
import './per-planet-dropdown-group.css'

export interface PerPlanetDropdownEntry {
  readonly planet: Planet
  readonly theme?: Theme | null
  readonly rowCount: number
  readonly defaultExpanded?: boolean
  readonly warningEmoji?: string
  readonly body: ReactNode
}

interface PerPlanetDropdownGroupProps {
  readonly entries: ReadonlyArray<PerPlanetDropdownEntry>
  readonly emptyMessage?: string
}

export function PerPlanetDropdownGroup({ entries, emptyMessage }: PerPlanetDropdownGroupProps) {
  const initialExpanded = new Set<PlanetId>()
  for (const entry of entries) {
    if (entry.defaultExpanded) initialExpanded.add(entry.planet.id)
  }
  const [expanded, setExpanded] = useState<Set<PlanetId>>(initialExpanded)

  if (entries.length === 0) {
    return <div className="per-planet-empty">{emptyMessage ?? 'No planets to display.'}</div>
  }

  const toggle = (id: PlanetId): void => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = (): void => {
    setExpanded(new Set(entries.map((e) => e.planet.id)))
  }
  const collapseAll = (): void => {
    setExpanded(new Set())
  }

  return (
    <div className="per-planet-dropdown-group">
      <div className="per-planet-group__controls">
        <button type="button" onClick={expandAll}>
          Expand all
        </button>
        <button type="button" onClick={collapseAll}>
          Collapse all
        </button>
      </div>
      {entries.map((entry) => {
        const isOpen = expanded.has(entry.planet.id)
        const themeEmoji = entry.theme?.emoji ?? '🪐'
        return (
          <section
            key={String(entry.planet.id)}
            className={`per-planet-dropdown ${isOpen ? 'is-open' : 'is-closed'}`}
          >
            <button
              type="button"
              className="per-planet-dropdown__header"
              onClick={() => toggle(entry.planet.id)}
              aria-expanded={isOpen}
            >
              <span className="per-planet-dropdown__chevron">{isOpen ? '▼' : '▶'}</span>
              <span className="per-planet-dropdown__emoji">{themeEmoji}</span>
              <span className="per-planet-dropdown__name">{String(entry.planet.id)}</span>
              <span className="per-planet-dropdown__badge">{entry.rowCount}</span>
              {entry.warningEmoji ? (
                <span className="per-planet-dropdown__warning">{entry.warningEmoji}</span>
              ) : null}
            </button>
            {isOpen ? <div className="per-planet-dropdown__body">{entry.body}</div> : null}
          </section>
        )
      })}
    </div>
  )
}
