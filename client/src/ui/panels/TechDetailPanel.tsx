// HOTFIX 17.L.D.14 — Tech detail panel extracted from TechTreePanel into its own movable
// PanelFrame so it no longer overlays the tech grid when the parent panel is narrow.
//
// User verbatim (LAW #0): "cant see the info panel for the techs of the tech panel becasue
// it s on top of the tech panel and making it impossible to read it or the tech panel it
// needs to be its own panel along side pully movable like all panels shall be".
//
// Selection state lives on PlayPage so this panel + TechTreePanel can both react to the same
// `selectedTechId` independently. Clicking a prereq/unlock row inside this panel calls
// onSelectTech to navigate the selection — handy for walking the dependency chain without
// closing this panel.

import { useMemo } from 'react'
import {
  type Empire,
  getResearchableTechs,
  getTechNode,
  TECH_NODES,
  type TechId,
  type TechNode,
} from '@smol/shared'
import './TechTreePanel.css'

export interface TechDetailPanelProps {
  readonly empire: Empire
  readonly selectedTechId: TechNode['id'] | null
  readonly onSelectTech: (techId: TechNode['id']) => void
  // PHASE 17.L.D (HOTFIX 2026-05-12) — user verbatim *"there needs to be a spend research
  // button on each tech to unlock it.. the ai is back do doing it but the player has no way
  // to spent tech points or research anything actually correctly"*. Caller wires this to
  // sim.startResearchTech which sets the empire's activeResearchTechId. Returns true on
  // success so the panel can flash success state if desired (currently we just rely on the
  // empire prop re-render).
  readonly onStartResearch?: (techId: TechNode['id']) => boolean
}

export function TechDetailPanel({
  empire,
  selectedTechId,
  onSelectTech,
  onStartResearch,
}: TechDetailPanelProps) {
  const researchable = useMemo(
    () => new Set(getResearchableTechs(empire).map((n) => n.id)),
    [empire],
  )

  // Reverse-prereq index — "Unlocks" list = every tech that has the selected tech as a prereq.
  const unlocksByTechId = useMemo(() => {
    const out = new Map<TechId, TechId[]>()
    for (const node of TECH_NODES) {
      for (const prereqId of node.prerequisites) {
        const arr = out.get(prereqId) ?? []
        arr.push(node.id)
        out.set(prereqId, arr)
      }
    }
    return out
  }, [])

  const selectedNode = selectedTechId
    ? (TECH_NODES.find((n) => n.id === selectedTechId) ?? null)
    : null

  if (!selectedNode) {
    return (
      <div className="tech-tree-panel__detail tech-tree-panel__detail--empty">
        <p>Click any tech in the Tech Tree panel to view its full description here.</p>
      </div>
    )
  }

  const isResearched = empire.researchedTechs.has(selectedNode.id)
  const isResearchable = researchable.has(selectedNode.id)
  const isActive = empire.activeResearchTechId === selectedNode.id
  const progressPoints = empire.researchProgress.get(selectedNode.id) ?? 0
  const progressPct =
    selectedNode.costPoints > 0
      ? Math.min(100, Math.round((progressPoints / selectedNode.costPoints) * 100))
      : 0
  const prereqList = selectedNode.prerequisites
  const unlocksList = unlocksByTechId.get(selectedNode.id) ?? []

  return (
    <div className="tech-tree-panel__detail" aria-label="Selected tech details">
      <header className="tech-tree-panel__detail-header">
        <span className="tech-tree-panel__detail-emoji">{selectedNode.emoji}</span>
        <h3 className="tech-tree-panel__detail-name">{selectedNode.name}</h3>
        <span className="tech-tree-panel__detail-badge">Tier {selectedNode.tier}</span>
      </header>
      <p className="tech-tree-panel__detail-desc">{selectedNode.description}</p>
      <dl className="tech-tree-panel__detail-stats">
        <div>
          <dt>Visibility</dt>
          <dd>{selectedNode.visibility}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{selectedNode.category}</dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd>{selectedNode.costPoints} research points</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            {isResearched
              ? '✅ Researched'
              : isActive
                ? '🔬 Researching now'
                : isResearchable
                  ? '🟢 Researchable now'
                  : '🔒 Locked (prereqs needed)'}
          </dd>
        </div>
      </dl>

      {/* PHASE 17.L.D (HOTFIX 2026-05-12) — Start Research action + progress bar. The
          progress bar shows current research-points accumulated toward the cost, so the
          player can see they ARE making progress even before completion. The button is the
          single action affordance the user asked for — clicking it sets activeResearchTechId
          via the wired sim.startResearchTech action. */}
      {!isResearched && (
        <section className="tech-tree-panel__detail-section tech-tree-panel__detail-research">
          <div className="tech-tree-panel__progress-row">
            <span>
              Progress: <strong>{progressPoints.toLocaleString()}</strong> /{' '}
              <strong>{selectedNode.costPoints.toLocaleString()}</strong> points ({progressPct}%)
            </span>
          </div>
          <div className="tech-tree-panel__progress-bar" aria-hidden>
            <div
              className="tech-tree-panel__progress-bar-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {onStartResearch && (
            <button
              type="button"
              className="tech-tree-panel__start-btn"
              disabled={!isResearchable || isActive}
              onClick={() => onStartResearch(selectedNode.id)}
              title={
                isActive
                  ? 'This tech is your active research target — points are accumulating each tick.'
                  : isResearchable
                    ? `Set ${selectedNode.name} as your active research target. Points will accumulate each tick until it completes.`
                    : 'Researching this tech is locked behind prerequisites. Finish the missing prereqs first.'
              }
            >
              {isActive
                ? '🔬 Currently researching'
                : isResearchable
                  ? `🔬 Start researching ${selectedNode.name}`
                  : '🔒 Prereqs needed'}
            </button>
          )}
        </section>
      )}

      <section className="tech-tree-panel__detail-section">
        <h4>Prerequisites ({prereqList.length})</h4>
        {prereqList.length === 0 ? (
          <p className="tech-tree-panel__detail-empty">None — research available immediately.</p>
        ) : (
          <ul className="tech-tree-panel__detail-list">
            {prereqList.map((pid) => {
              const pnode = getTechNode(pid)
              const isDone = empire.researchedTechs.has(pid)
              return (
                <li
                  key={String(pid)}
                  className={
                    isDone
                      ? 'tech-tree-panel__detail-list-item tech-tree-panel__detail-list-item--ok'
                      : 'tech-tree-panel__detail-list-item tech-tree-panel__detail-list-item--missing'
                  }
                >
                  <button
                    type="button"
                    className="tech-tree-panel__detail-link"
                    onClick={() => onSelectTech(pnode.id)}
                    title={pnode.description}
                  >
                    {isDone ? '✅' : '⏳'} {pnode.emoji} {pnode.name}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="tech-tree-panel__detail-section">
        <h4>Unlocks ({unlocksList.length})</h4>
        {unlocksList.length === 0 ? (
          <p className="tech-tree-panel__detail-empty">
            This tech is a leaf — no downstream techs depend on it.
          </p>
        ) : (
          <ul className="tech-tree-panel__detail-list">
            {unlocksList.map((uid) => {
              const unode = getTechNode(uid)
              return (
                <li key={String(uid)} className="tech-tree-panel__detail-list-item">
                  <button
                    type="button"
                    className="tech-tree-panel__detail-link"
                    onClick={() => onSelectTech(unode.id)}
                    title={unode.description}
                  >
                    ➡ {unode.emoji} {unode.name} (Tier {unode.tier})
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
