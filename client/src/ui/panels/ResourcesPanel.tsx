import { getResourceDef, listStocks, type PlanetInventory } from '@smol/shared'
import './ResourcesPanel.css'

interface ResourcesPanelProps {
  readonly inventory: PlanetInventory
  readonly title?: string
}

export function ResourcesPanel({ inventory, title = 'Resources' }: ResourcesPanelProps) {
  const stocks = listStocks(inventory)
  const sorted = [...stocks].sort((a, b) => {
    const aw = categoryWeight(a.def.category)
    const bw = categoryWeight(b.def.category)
    if (aw !== bw) return aw - bw
    return a.def.name.localeCompare(b.def.name)
  })
  return (
    <section className="resources-panel" aria-label={title}>
      <header className="resources-panel__header">
        <h2>📦 {title}</h2>
        <span className="resources-panel__count">{sorted.length} types</span>
      </header>
      {sorted.length === 0 ? (
        <p className="resources-panel__empty">No resources stockpiled.</p>
      ) : (
        <ul className="resources-panel__list">
          {sorted.map(({ def, amount }) => (
            <li
              key={def.id}
              className={`resources-panel__row resources-panel__row--${def.category}`}
            >
              <span className="resources-panel__emoji" aria-hidden="true">
                {def.emoji}
              </span>
              <span className="resources-panel__name">{def.name}</span>
              <span className="resources-panel__amount">{amount.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function categoryWeight(category: string): number {
  switch (category) {
    case 'raw':
      return 0
    case 'refined':
      return 1
    case 'component':
      return 2
    case 'product':
      return 3
    case 'strategic':
      return 4
    default:
      return 5
  }
}

export { getResourceDef as describeResource }
