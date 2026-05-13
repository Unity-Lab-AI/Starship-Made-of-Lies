import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  type TechId,
  type TechNode,
  type ThemeId,
  TECH_NODES,
  THEMES,
  civId,
  getBuildingDef,
  getTechNode,
  getTheme,
  newEmpire,
  planetId as planetIdValue,
  themeAsCSSVars,
  TECH_AEROSPACE,
  TECH_COMPUTING,
  TECH_INDUSTRIAL_LOGISTICS,
  TECH_MASS_PRODUCTION,
} from '@smol/shared'
import { TechTreePanel } from '../panels/TechTreePanel'
import './SubPage.css'
import './WikiPage.css'

type WikiSection = 'themes' | 'tech' | 'mechanics'

const SECTIONS: ReadonlyArray<{ id: WikiSection; label: string; emoji: string }> = [
  { id: 'themes', label: 'Themes', emoji: '🎭' },
  { id: 'tech', label: 'Tech tree', emoji: '🌐' },
  { id: 'mechanics', label: 'Mechanics', emoji: '📜' },
]

export function WikiPage() {
  const [section, setSection] = useState<WikiSection>('themes')
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(THEMES[0]!.id)
  const [selectedTechId, setSelectedTechId] = useState<TechId | null>(null)
  const [themeSearch, setThemeSearch] = useState('')
  const theme = getTheme(selectedThemeId)
  const styleVars = useMemo(() => themeAsCSSVars(theme), [theme])

  const filteredThemes = useMemo(() => {
    const needle = themeSearch.trim().toLowerCase()
    if (!needle) return THEMES
    return THEMES.filter(
      (t) =>
        t.name.toLowerCase().includes(needle) ||
        t.tagline.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle),
    )
  }, [themeSearch])

  const empire = useMemo(() => {
    const e = newEmpire(civId('wiki-civ'), planetIdValue('wiki-planet'))
    e.researchedTechs.add(TECH_INDUSTRIAL_LOGISTICS)
    e.researchedTechs.add(TECH_MASS_PRODUCTION)
    e.researchedTechs.add(TECH_COMPUTING)
    // PHASE 17.L.D (HOTFIX 2026-05-12) — pool model: legacy startResearch removed in favor
    // of purchaseResearchFromPool. For wiki preview just set activeResearchTechId directly
    // (legacy field on the interface) so the tech tree highlights AEROSPACE as the
    // "currently selected" tech without spending from the (zero) pool.
    e.activeResearchTechId = TECH_AEROSPACE
    return e
  }, [])

  const selectedTech: TechNode | null = selectedTechId ? getTechNode(selectedTechId) : null

  return (
    <div className="sub-page" style={styleVars as React.CSSProperties}>
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>Game Wiki</h1>
      </header>
      <main className="wiki-page__content">
        <nav className="wiki-page__nav" role="tablist">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={section === s.id}
              className={`wiki-page__nav-btn ${section === s.id ? 'wiki-page__nav-btn--active' : ''}`}
              onClick={() => setSection(s.id)}
            >
              <span aria-hidden>{s.emoji}</span> {s.label}
            </button>
          ))}
        </nav>

        <section className="wiki-page__panel">
          {section === 'themes' && (
            <div>
              <h2>20 government themes</h2>
              <p className="wiki-page__intro">
                Every civilization rolls a random theme — you cannot choose. Each theme reskins
                propaganda copy, citizen tier names, building names, faction labels, and AI
                personality. Click a theme to preview its palette + tagline.
              </p>
              <div className="wiki-page__theme-search">
                <input
                  type="search"
                  className="wiki-page__theme-search-input"
                  placeholder="Search themes by name, tagline, or description…"
                  value={themeSearch}
                  onChange={(e) => setThemeSearch(e.target.value)}
                  aria-label="Filter themes by search"
                />
                <span className="wiki-page__theme-search-count">
                  {filteredThemes.length}/{THEMES.length}
                </span>
              </div>
              <div className="wiki-page__theme-grid">
                {filteredThemes.length === 0 ? (
                  <p className="wiki-page__theme-empty">
                    No themes match "{themeSearch}". Try shorter or different keywords.
                  </p>
                ) : (
                  filteredThemes.map((t) => {
                    const isSelected = t.id === selectedThemeId
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`wiki-page__theme-card ${isSelected ? 'wiki-page__theme-card--active' : ''}`}
                        onClick={() => setSelectedThemeId(t.id)}
                      >
                        <span className="wiki-page__theme-emoji" aria-hidden>
                          {t.emoji}
                        </span>
                        <span className="wiki-page__theme-name">{t.name}</span>
                        <span className="wiki-page__theme-tagline">{t.tagline}</span>
                      </button>
                    )
                  })
                )}
              </div>
              <article className="wiki-page__theme-detail">
                <h3>
                  {theme.emoji} {theme.name}
                </h3>
                <p>
                  <em>{theme.tagline}</em>
                </p>
                <p>{theme.description}</p>
                <h4>Propaganda</h4>
                <dl className="wiki-page__propaganda">
                  <dt>Recruitment slogan</dt>
                  <dd>"{theme.propaganda.recruitmentSlogan}"</dd>
                  <dt>One-way trip cover name</dt>
                  <dd>"{theme.propaganda.oneWayTripCoverName}"</dd>
                  <dt>Volunteer epithet</dt>
                  <dd>"{theme.propaganda.volunteerEpithet}"</dd>
                  <dt>Enemy epithet</dt>
                  <dd>"{theme.propaganda.enemyEpithet}"</dd>
                  <dt>Victory announcement</dt>
                  <dd>"{theme.propaganda.victoryAnnouncement}"</dd>
                  <dt>Defeat excuse</dt>
                  <dd>"{theme.propaganda.defeatExcuse}"</dd>
                </dl>
                <h4>Citizen tiers</h4>
                <ol className="wiki-page__tiers">
                  {([1, 2, 3, 4, 5] as const).map((t) => (
                    <li key={t}>{theme.citizenTierNames[t]}</li>
                  ))}
                </ol>
              </article>
            </div>
          )}

          {section === 'tech' && (
            <div className="wiki-page__tech-layout">
              <div className="wiki-page__tech-tree-col">
                <h2>Tech tree</h2>
                <p className="wiki-page__intro">
                  {TECH_NODES.length} nodes across 5 tiers + 7 categories. Mainstream techs are
                  visible from start; Suppressed are hinted only when prereqs met; Forbidden are
                  hidden until conquest gates trigger. Two apex paths win the match:{' '}
                  <strong>Singularity</strong> (mainstream) or <strong>Reality Editing</strong>{' '}
                  (forbidden), both gated on ≥10 controlled planets.{' '}
                  <em>Click any visible tech to see full details.</em>
                </p>
                <TechTreePanel
                  empire={empire}
                  clickableStates={['researched', 'researchable', 'hinted', 'visible']}
                  selectedTechId={selectedTechId}
                  onSelectTech={(id) => setSelectedTechId((cur) => (cur === id ? null : id))}
                />
              </div>
              <aside className="wiki-page__tech-detail">
                {selectedTech ? (
                  <TechDetail node={selectedTech} />
                ) : (
                  <p className="wiki-page__tech-detail-empty">
                    Click a tech node to read its description, prerequisites, cost, effects, and
                    conquest gates.
                  </p>
                )}
              </aside>
            </div>
          )}

          {section === 'mechanics' && (
            <div>
              <h2>Core mechanics</h2>
              <article>
                <h3>Citizens</h3>
                <p>
                  5-tier system: Worker (60%) → Skilled (25%) → Privileged (10%) → Elite (4%) →
                  Pinnacle "The Chosen" (1%). Only Tier 4-5 will <em>volunteer</em> for one-way
                  colony ships. Promotion rate driven by quality-of-life (food variety + housing +
                  water + happiness floor).
                </p>
                <p>
                  Citizens are immortal from old age. They die ONLY from: starvation, lack of air on
                  ship, no water, explosions, combat, or volunteering for one-way trips.
                </p>
              </article>
              <article>
                <h3>Colony ships (the lie)</h3>
                <p>
                  Citizens think they're going to "new worlds." They literally are — but the new
                  worlds are someone else's planet. 19 ship variants across 4 darkness tiers.
                  Modular pieces: hull / propulsion / life-support / landing-gear / payload /
                  sensors / weapons / comms.{' '}
                  <strong>No landing gear = ship CRASHES on arrival</strong> — crashing onto enemy
                  planets is your first source of loot.
                </p>
              </article>
              <article>
                <h3>Defense</h3>
                <p>
                  Mines + counter-ships only. No turret towers. Mines are modular (battery + fuel +
                  crew + auto-pilot). Crew can get marooned and die.
                </p>
                <p>
                  100% landing vulnerability — there is no grace period. Get a Warning System tech
                  early or get blindsided.
                </p>
              </article>
              <article>
                <h3>Indigenous AI civs</h3>
                <p>
                  Every player's home planet spawns indigenous civs with theme-coupled hostility.
                  Theocracy/Cult themes spawn allied indigenous; Warlord/Junta spawn hostile; others
                  neutral. Intra-planet warfare comes BEFORE inter-planet warfare.
                </p>
              </article>
              <article>
                <h3>LAST HOPE evac</h3>
                <p>
                  When your civ is collapsing — last planet, low pop, under siege — trigger the LAST
                  HOPE auto-evac. Whole civilization packs up + auto-builds a rocket + launches to
                  an unexplored planet. Final-ditch escape.
                </p>
              </article>
              <article>
                <h3>Win conditions</h3>
                <p>
                  Open-ended by default with mission-objective overlay. Match ends when first met:
                  Highscore Target / Resource Target / Last Civ Standing / Apex Tech.
                </p>
              </article>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function TechDetail({ node }: { readonly node: TechNode }) {
  const prereqNodes = node.prerequisites.map((id) => getTechNode(id))
  const effects = node.effects
  const unlockedBuildingNames = (effects.unlockBuildings ?? []).map((id) => {
    try {
      return getBuildingDef(id).name
    } catch {
      return String(id)
    }
  })
  const unlockedShips = effects.unlockColonyShipVariants ?? []
  const unlockedBiomes = effects.unlockBiomes ?? []

  return (
    <article className="wiki-page__tech-detail-card">
      <header className="wiki-page__tech-detail-header">
        <span className="wiki-page__tech-detail-emoji" aria-hidden>
          {node.emoji}
        </span>
        <div>
          <h3>{node.name}</h3>
          <div className="wiki-page__tech-detail-meta">
            <span className={`wiki-page__tech-detail-tag tag-${node.visibility}`}>
              {node.visibility}
            </span>
            <span className="wiki-page__tech-detail-tag tag-tier">Tier {node.tier}</span>
            <span className="wiki-page__tech-detail-tag tag-category">{node.category}</span>
            <span className="wiki-page__tech-detail-tag tag-cost">{node.costPoints} pts</span>
          </div>
        </div>
      </header>
      <p className="wiki-page__tech-detail-desc">{node.description}</p>

      {prereqNodes.length > 0 && (
        <section className="wiki-page__tech-detail-section">
          <h4>Prerequisites</h4>
          <ul className="wiki-page__tech-detail-prereqs">
            {prereqNodes.map((p) => (
              <li key={String(p.id)}>
                {p.emoji} {p.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      {node.conquestGate && (
        <section className="wiki-page__tech-detail-section">
          <h4>Conquest gate</h4>
          <ul className="wiki-page__tech-detail-gate">
            {node.conquestGate.minDefeatedCivs !== undefined && (
              <li>≥ {node.conquestGate.minDefeatedCivs} defeated civilization(s)</li>
            )}
            {node.conquestGate.minCapturedPlanets !== undefined && (
              <li>≥ {node.conquestGate.minCapturedPlanets} captured planet(s)</li>
            )}
            {node.conquestGate.requiredAncientTech !== undefined && (
              <li>≥ {node.conquestGate.requiredAncientTech} ancient tech recovered</li>
            )}
          </ul>
        </section>
      )}

      {node.requiresApexCheck && (
        <section className="wiki-page__tech-detail-section">
          <h4>Apex check</h4>
          <p className="wiki-page__tech-detail-apex">
            Requires ≥ 10 controlled planets to research.
          </p>
        </section>
      )}

      <section className="wiki-page__tech-detail-section">
        <h4>Effects</h4>
        <ul className="wiki-page__tech-detail-effects">
          {effects.researchSpeedMultiplier && (
            <li>Research speed × {effects.researchSpeedMultiplier}</li>
          )}
          {effects.buildingProductionMultiplier && (
            <li>Building production × {effects.buildingProductionMultiplier}</li>
          )}
          {effects.propagandaPowerMultiplier && (
            <li>Propaganda power × {effects.propagandaPowerMultiplier}</li>
          )}
          {effects.citizenPromotionRateMultiplier && (
            <li>Citizen promotion rate × {effects.citizenPromotionRateMultiplier}</li>
          )}
          {effects.volunteerPoolMultiplier && (
            <li>Volunteer pool × {effects.volunteerPoolMultiplier}</li>
          )}
          {effects.colonyShipPayloadTier !== undefined && (
            <li>Unlocks Tier {effects.colonyShipPayloadTier} colony ship payload</li>
          )}
          {unlockedBuildingNames.length > 0 && (
            <li>Unlocks buildings: {unlockedBuildingNames.join(', ')}</li>
          )}
          {unlockedShips.length > 0 && <li>Unlocks ships: {unlockedShips.join(', ')}</li>}
          {unlockedBiomes.length > 0 && (
            <li>Unlocks colonization of biomes: {unlockedBiomes.join(', ')}</li>
          )}
          {effects.autoBuildEnabled && <li>Enables auto-build (no manual queue overhead)</li>}
          {effects.disablesEnemyProduction && <li>Disables enemy production output</li>}
          {effects.winsGame && <li className="wiki-page__tech-detail-wins">🏆 WINS THE MATCH</li>}
        </ul>
      </section>
    </article>
  )
}
