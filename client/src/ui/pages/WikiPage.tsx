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

// PHASE 17.L.D.13.D (2026-05-13) — section id + label finally renamed `themes` → `governments`
// per the LAW-tagged memory `feedback_themes_are_governments_global_rename.md` (user verbatim
// *"they arent themes they are govenrments"*). Internal `Theme` / `ThemeId` types stay
// untouched (dev jargon); only the user-facing nav label was the holdout. Section content
// already uses "government" framing in the intro paragraph; this fixes the tab nav itself.
type WikiSection = 'governments' | 'tech' | 'mechanics'

const SECTIONS: ReadonlyArray<{ id: WikiSection; label: string; emoji: string }> = [
  { id: 'governments', label: 'Governments', emoji: '🎭' },
  { id: 'tech', label: 'Tech tree', emoji: '🌐' },
  { id: 'mechanics', label: 'Mechanics', emoji: '📜' },
]

export function WikiPage() {
  const [section, setSection] = useState<WikiSection>('governments')
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
          {section === 'governments' && (
            <div>
              <h2>20 government archetypes</h2>
              <p className="wiki-page__intro">
                Every civilization rolls a random <strong>government</strong> at match start — you
                cannot choose, cannot see it before play, cannot re-roll. What each government
                ACTUALLY changes in alpha:{' '}
                <strong>citizen tier names, building name/emoji reskins, palette colors</strong>,
                and a couple of propaganda-flavored achievement labels. Most other propaganda
                strings exist as flavor reference for designers/lore — they aren't yet surfaced in
                the player UI. Click a government below to preview its data.
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
                <h4>
                  Citizen tier names <span className="wiki-page__wired-tag">✅ wired</span>
                </h4>
                <p className="wiki-page__detail-note">
                  Replaces the generic Worker / Skilled / Privileged / Elite / Pinnacle labels
                  everywhere in the UI (Citizens panel, ship Launch Manifest, tier counter chips).
                </p>
                <ol className="wiki-page__tiers">
                  {([1, 2, 3, 4, 5] as const).map((t) => (
                    <li key={t}>{theme.citizenTierNames[t]}</li>
                  ))}
                </ol>
                <h4>
                  Propaganda flavor{' '}
                  <span className="wiki-page__flavor-tag">📝 mostly reference</span>
                </h4>
                <p className="wiki-page__detail-note">
                  Only <strong>Volunteer epithet</strong> and <strong>Enemy epithet</strong>{' '}
                  currently surface in the player UI (achievement labels like "N{' '}
                  <em>{theme.propaganda.volunteerEpithet}</em>s Recruited"). The other strings ship
                  as canon reference for cinematics / match-end screens / future propaganda
                  campaigns — they aren't wired yet, so don't expect them in alpha play.
                </p>
                <dl className="wiki-page__propaganda">
                  <dt>
                    Volunteer epithet <span className="wiki-page__wired-tag">✅ wired</span>
                  </dt>
                  <dd>"{theme.propaganda.volunteerEpithet}"</dd>
                  <dt>
                    Enemy epithet <span className="wiki-page__wired-tag">✅ wired</span>
                  </dt>
                  <dd>"{theme.propaganda.enemyEpithet}"</dd>
                  <dt>
                    Recruitment slogan <span className="wiki-page__flavor-tag">📝 reference</span>
                  </dt>
                  <dd>"{theme.propaganda.recruitmentSlogan}"</dd>
                  <dt>
                    One-way trip cover name{' '}
                    <span className="wiki-page__flavor-tag">📝 reference</span>
                  </dt>
                  <dd>"{theme.propaganda.oneWayTripCoverName}"</dd>
                  <dt>
                    Victory announcement <span className="wiki-page__flavor-tag">📝 reference</span>
                  </dt>
                  <dd>"{theme.propaganda.victoryAnnouncement}"</dd>
                  <dt>
                    Defeat excuse <span className="wiki-page__flavor-tag">📝 reference</span>
                  </dt>
                  <dd>"{theme.propaganda.defeatExcuse}"</dd>
                </dl>
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
                  hidden until conquest gates trigger. Research uses a{' '}
                  <strong>shared empire pool</strong> — each tick your scientists deposit points
                  into the pool, and you spend the full <code>costPoints</code> of a tech in one
                  click via the Tech Detail "Research X" button. Two apex paths win the match:{' '}
                  <strong>Singularity</strong> (mainstream) or <strong>Reality Editing</strong>{' '}
                  (forbidden), both gated on ≥10 controlled planets.{' '}
                  <em>Click any visible tech to see full details.</em>
                </p>
                <TechTreePanel
                  empire={empire}
                  clickableStates={['researched', 'researchable', 'hinted', 'visible']}
                  selectedTechId={selectedTechId}
                  onSelectTech={(id) => setSelectedTechId((cur) => (cur === id ? null : id))}
                  referenceMode
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
              <p className="wiki-page__intro">
                Reference for the actual numbers + systems the sim runs. All values reflect the
                current alpha balance — they will be re-tuned as playtesting reveals pacing issues.
                Where a number appears here, the sim uses the same value at runtime.
              </p>

              <article>
                <h3>🚀 First 30 ticks — what you start with</h3>
                <p>
                  Every new match seeds your home planet with a stable starter economy so you don't
                  death-spiral on tick 1.
                </p>
                <p>
                  <strong>Pre-built starter buildings (no cost — spawn freebies):</strong>
                </p>
                <ul>
                  <li>
                    <strong>6 🌾 Farms</strong> — ~64.8 food/tick supply vs ~50/tick demand at 1000
                    pop. +14.8/t surplus.
                  </li>
                  <li>
                    <strong>3 💧 Aqueducts</strong> — ~54 water/tick vs ~20/tick demand. +34/t
                    surplus.
                  </li>
                  <li>
                    <strong>4 🏠 Homes</strong> — housing headroom for growth past the 1000 cap.
                  </li>
                  <li>
                    <strong>1 🪵 Lumber Camp</strong> — wood inflow so building chains can scale.
                  </li>
                  <li>
                    <strong>1 ⛏️ Quarry</strong> — stone inflow.
                  </li>
                  <li>
                    <strong>1 ☀️ Solar Array</strong> — energy presence.
                  </li>
                  <li>
                    <strong>2 🥼 Research Labs</strong> — research pool accrual at 2× the
                    no-building rate. <em>Lab is now baseline-buildable</em> (PHASE 17.L.D.10) so
                    you can build more labs from tick 1 without any tech prereq.
                  </li>
                </ul>
                <p>
                  <strong>Starter inventory (stocks):</strong> 8000 food · 8000 water · 200 wood ·
                  200 stone · 300 planks · 120 bricks · 400 metals · 200 ingots · 120 components ·
                  60 electronics · 80 propaganda materials · 80 fuel · 200 ammunition.
                </p>
                <p>
                  <strong>Starter research pool:</strong> 30 points pre-seeded so you can buy{' '}
                  <strong>Industrial Logistics</strong> (cost 30) on tick 1 to unlock the Mine +
                  Refinery + Lumber Camp + Quarry chain. AI civs get the same seed so they aren't
                  paralyzed at match start either.
                </p>
                <p className="wiki-page__pro-tip">
                  💡 Recommended first research: Industrial Logistics → Combustion Engines (Power
                  Plant) → Mass Production (Factory + Foundry) → Computing (more Labs).
                </p>
              </article>

              <article>
                <h3>👥 Citizens — 5-tier population</h3>
                <p>
                  Population is split across 5 tiers. Default ratio on a new planet:{' '}
                  <strong>Worker 60%</strong> (Tier 1) → <strong>Skilled 25%</strong> (Tier 2) →{' '}
                  <strong>Privileged 10%</strong> (Tier 3) → <strong>Elite 4%</strong> (Tier 4) →{' '}
                  <strong>Pinnacle "The Chosen" 1%</strong> (Tier 5). Home planet starts with{' '}
                  <strong>1000 citizens</strong>.
                </p>
                <p>
                  Only Tier 4-5 will <em>volunteer</em> for one-way colony ships. Promotion rate is
                  driven by quality-of-life (food variety + housing + water + happiness floor).
                  Promotion buildings (School / University / Cathedral / Re-education / Corporate
                  Promotions / TV Station) accelerate tier-up rate.
                </p>
                <p>
                  Citizens are immortal from old age. They die ONLY from:{' '}
                  <strong>starvation</strong>, <strong>dehydration</strong>, lack of air on ship,
                  explosions, combat, or volunteering for one-way trips.
                </p>
              </article>

              <article>
                <h3>🍞💧 Food + Water economy</h3>
                <p>
                  Each citizen consumes <strong>0.05 food / tick</strong> and{' '}
                  <strong>0.02 water / tick</strong>. At 1000 pop: 50 food/t + 20 water/t demand.
                </p>
                <p>
                  Starting planet seeds: <strong>8000 food + 8000 water</strong>. With no production
                  that's ~160 ticks (32 sec wall-clock) of food runway, ~400 ticks (80 sec) of water
                  runway — comfortable buffer to build a Farm + Aqueduct.
                </p>
                <p>
                  <strong>🌾 Farm</strong> consumes 1 water/t → produces 12 food/t (~10.8/t
                  effective with default 0.9 food workforce mult). Farms <em>require water</em> —
                  zero-water planets can't farm.
                </p>
                <p>
                  <strong>💧 Aqueduct</strong> consumes nothing → produces 20 water/t (~18/t
                  effective). ~5 Farms feed 1000 pop, ~2 Aqueducts hydrate them.
                </p>
                <p>
                  <strong>Starvation</strong> fires when food / citizen &lt; 1. Per-tick kill rate ={' '}
                  <code>0.005 × shortfall × tier-multiplier</code> (Tier-1 workers die 1.5× faster,
                  Tier-5 0.4× slower). <strong>Dehydration</strong> fires when water / citizen &lt;
                  0.5 at <code>0.006 × shortfall</code>. Both are softened 4× from the original
                  brutal rates after early playtest.
                </p>
                <p className="wiki-page__pro-tip">
                  💡 Open <strong>Planet Summary</strong> from the toolbar Intel category to see
                  live demand-vs-supply per tick for both food and water.
                </p>
              </article>

              <article>
                <h3>🔬 Research — pool currency model</h3>
                <p>
                  Each tick your scientists generate raw research points = scientists × 0.1 × (labs
                  × 1.0 + universities × 1.5 || 1.0) × performanceMultiplier. Default workforce
                  slider puts 15% of citizens on research; with 1000 pop that's 150 scientists.
                </p>
                <p>
                  Raw points are divided by <strong>RESEARCH_POINT_DIVISOR = 200</strong> (50×
                  slower than the early-alpha rate) for saga pacing, then added to the empire's{' '}
                  <strong>research points pool</strong>. Pool is shared across the whole empire and
                  stored as a float so slow accrual still accumulates over ticks.
                </p>
                <p>
                  To research a tech: open <strong>Tech Tree</strong>, click any tech, click{' '}
                  <strong>"🔬 Research X — N pts"</strong> in the Tech Detail panel. The full cost
                  is deducted from the pool atomically and the tech completes instantly. No per-tech
                  progress bar — pool is the only currency.
                </p>
                <p>
                  Tech costs in points: Tier-0 ~30 pts (~80 sec at default rate), Tier-1 ~60 pts,
                  Tier-2 ~120 pts, Tier-3 ~200-300 pts, Tier-4 Apex ~500+ pts. Stack labs and
                  universities + push more citizens to the research slider to accelerate.
                </p>
                <p>
                  AI civs use the same pool — they pick their preferred tech each decision tick and
                  try to purchase from their pool. If short, they wait.
                </p>
              </article>

              <article>
                <h3>🏗 Building catalog — 29 buildings</h3>
                <p>
                  <strong>6 baseline-unlocked</strong> at match start (buildable without any tech):
                  Farm, Aqueduct, Home, <strong>🥼 Research Lab</strong>, School, Solar Array.
                  Mining Outpost is also foundational + always available. Everything else is
                  tech-gated.
                </p>
                <p>
                  Lumber Camp + Quarry are gated behind <strong>Industrial Logistics</strong> (your
                  starter research pool covers it) — the freebie 1 Lumber Camp + 1 Quarry from the
                  pre-built starter set grandfather in, but you must research Industrial Logistics
                  to build ADDITIONAL ones.
                </p>
                <p>
                  Locked buildings render greyed in the Build picker with a "🧬 Requires:
                  &lt;TechName&gt;" hint so you know exactly what to research. Attempting to build a
                  locked building from the placement action fires a "🔒 Can't build X — research Y
                  first" event in the bottom panel.
                </p>
                <p>
                  Categories: <strong>food</strong> (Farm), <strong>extraction</strong> (Lumber
                  Camp, Quarry, Mine, Mining Outpost), <strong>industry</strong> (Refinery, Foundry,
                  Factory), <strong>research</strong> (Lab), <strong>housing</strong> (Home,
                  Apartment), <strong>propaganda</strong> (School, University, Cathedral,
                  Re-education Center, Corporate Promotions Office, TV Station),{' '}
                  <strong>utility</strong> (Aqueduct, Solar Array, Power Plant, Battery Bank,
                  Fission/Fusion/Antimatter Reactor, God Control, Civic Center),{' '}
                  <strong>defense</strong> (Mine Field, Counter-Missile Pad),{' '}
                  <strong>launch</strong> (Launch Pad).
                </p>
              </article>

              <article>
                <h3>🔗 Resource chain — raw to advanced</h3>
                <p>
                  Extraction produces raw materials. Industry refines them. Most builds need
                  intermediate or advanced goods.
                </p>
                <ul>
                  <li>
                    <strong>🪵 Lumber Camp</strong> → wood. <strong>⛏️ Quarry</strong> → stone.{' '}
                    <strong>🪨 Mine</strong> → metals + rare metals.
                  </li>
                  <li>
                    <strong>🏭 Refinery</strong> consumes wood / stone / metals → produces planks /
                    bricks / ingots. Bootstrap-able from starter inventory (40 wood + 30 stone + 20
                    metals — all in starter).
                  </li>
                  <li>
                    <strong>⚒️ Foundry</strong> consumes bricks + metals → produces ingots + alloys.
                    Tier-2 industry; Mass Production tech.
                  </li>
                  <li>
                    <strong>🏗️ Factory</strong> consumes ingots + components → produces components /
                    electronics / ammunition / propaganda materials. Tier-3 industry.
                  </li>
                  <li>
                    <strong>⚡ Power Plant</strong> burns fuel for energy (constant draw).{' '}
                    <strong>☢️ Fission</strong> / <strong>🌟 Fusion</strong> /{' '}
                    <strong>💠 Antimatter</strong> reactors consume their tier-specific radioactive
                    resource at 4× / 8× / 16× a Power Plant's throughput. Reactor variants on colony
                    ships consume radioactives at launch (validated in the Launch Manifest).
                  </li>
                  <li>
                    <strong>🔋 Battery Bank</strong> stockpiles surplus fuel; surfaces in the Planet
                    Energy panel as capacity cap. Gated behind Electric Power.
                  </li>
                </ul>
                <p className="wiki-page__pro-tip">
                  💡 Refinery is the brick producer — you can't build a Foundry without bricks
                  first. Research Industrial Logistics → place a Refinery → wait for ingots/planks
                  to accrue → THEN research Mass Production for Factory + Foundry.
                </p>
              </article>

              <article>
                <h3>👷 Workforce sliders</h3>
                <p>
                  Each planet has 5 workforce sliders that allocate citizens to broad categories:
                  <strong> food (40% default)</strong>, <strong>industry (20%)</strong>,{' '}
                  <strong>research (15%)</strong>, <strong>military (10%)</strong>,{' '}
                  <strong>propaganda (15%)</strong>. Sliders sum to 1.0 and are renormalized on
                  edit. Citizens count toward production multipliers in their assigned category.
                </p>
                <p>
                  Manual pins override the slider for specific tier counts — useful when you need
                  exactly N elites in research regardless of the global percentage.
                </p>
              </article>

              <article>
                <h3>🚀 Colony ships — 19 variants, 4 darkness tiers</h3>
                <p>
                  Citizens think they're going to "new worlds." They literally are — but the new
                  worlds are someone else's planet. The propaganda gets prettier as actions get
                  worse — that's the dark comedy.
                </p>
                <p>
                  <strong>Tier 1 — Innocent</strong>: Scout, Surveyor, Probe (peaceful exploration
                  framing). <strong>Tier 2 — Discovery</strong>: Embassy, Resupply, Pilgrim
                  Volunteer ("honored journey"). <strong>Tier 3 — Aggression</strong>: Explosive,
                  Heavy, Counter-Colony, Saboteur (open warfare).{' '}
                  <strong>Tier 4 — Eradication</strong>: Orbital Weapon Platform, Final Colony Ship
                  + apex variants (industrial-scale "honored volunteer" suicide ships).
                </p>
                <p>
                  Ships unlock via <strong>payloadTier</strong> tech effects: tier 1 from Aerospace,
                  tier 2 from Orbital Mechanics, tier 3 from advanced industry techs, tier 4 from
                  Antimatter + Nanotech apex techs. Locked ships are visible in the Ship Builder
                  with a 🧬 tech-prereq chip.
                </p>
                <p>
                  Each ship is modular: hull / propulsion / life-support / landing-gear / payload /
                  sensors / weapons / comms. <strong>No landing gear = CRASH on arrival</strong> —
                  crashing onto enemy planets is your first source of loot.
                </p>
                <p>
                  Reactor variants consume their tier-specific radioactive resource at launch time
                  (validated by the Launch Manifest modal). No fuel = no launch.
                </p>
              </article>

              <article>
                <h3>🛡 Defense</h3>
                <p>
                  Mines + counter-ships only. No turret towers. Mines are launched ship variants
                  (emoji 💣) — design a mine-laying variant in the Ship Builder, build it at a
                  Launch Pad, fire it as a stationary intercept layer.
                </p>
                <p>
                  Counter-Missile Pad fires intercept ships at incoming attackers mid-flight. Cost
                  (fuel + ammo) is consumed instantly on counter-launch — no separate build cycle,
                  UMS-faithful counter-missile silo semantics.
                </p>
                <p>
                  <strong>100% landing vulnerability</strong> — there is no grace period. Get a
                  Warning System tech early or get blindsided. Self-Destruct Systems tech lets you
                  abort your own in-flight ships when you change your mind mid-arc.
                </p>
              </article>

              <article>
                <h3>🌐 Tech tree — {TECH_NODES.length} nodes</h3>
                <p>
                  5 tiers (0-4) × 7 categories: <strong>industrial</strong>,{' '}
                  <strong>information</strong>, <strong>spacefaring</strong>,{' '}
                  <strong>advanced</strong>, <strong>farFuture</strong>, <strong>control</strong>,{' '}
                  <strong>forbidden</strong>. 3 visibility states:
                </p>
                <ul>
                  <li>
                    <strong>Mainstream</strong>: visible from start, researchable when prereqs met.
                  </li>
                  <li>
                    <strong>Suppressed</strong>: hinted only when prereqs are met (you can see a "?"
                    silhouette suggesting something exists).
                  </li>
                  <li>
                    <strong>Forbidden</strong>: hidden entirely until a conquest gate triggers (e.g.
                    defeat N civs, capture N planets, recover ancient tech).
                  </li>
                </ul>
                <p>
                  Two apex paths win the match: <strong>Singularity</strong> (mainstream) or{' '}
                  <strong>Reality Editing</strong> (forbidden), both gated on ≥ 10 controlled
                  planets via the Apex Check requirement.
                </p>
                <p className="wiki-page__pro-tip">
                  💡 The Tech tree tab (top of this Wiki) shows the full {TECH_NODES.length}-node
                  reference catalog including Suppressed and Forbidden nodes — in-match those stay
                  hidden until prereqs / conquest gates trigger, but the Wiki is reference material
                  and reveals everything.
                </p>
              </article>

              <article>
                <h3>🏘 Settlements — multi per planet</h3>
                <p>
                  Each planet starts with a single <strong>Capital</strong> settlement that controls
                  every tile. Build a <strong>Civic Center</strong> on any owned tile to found a new
                  settlement claiming a 3-ring radius of adjacent owned tiles. Heavy cost (200
                  ingots + 100 bricks + 50 components + 1000 propaganda materials) prevents
                  settlement-spam.
                </p>
                <p>
                  In v1, settlements show tile-count + building-count + proportional population
                  share but the planet economy remains a single pool. Per-settlement inventory
                  bifurcation lands in a follow-on phase.
                </p>
              </article>

              <article>
                <h3>🪶 Indigenous AI civs</h3>
                <p>
                  Every player's home planet spawns indigenous civs with theme-coupled hostility.
                  Theocracy / Cult themes spawn allied indigenous; Warlord / Junta spawn hostile;
                  others neutral. Intra-planet warfare comes BEFORE inter-planet warfare.
                </p>
                <p>
                  Indigenous civs run their own decision loop and can launch ships of their own if
                  they unlock the tech. Parley actions appear in the Indigenous panel every{' '}
                  <code>INDIGENOUS_PARLEY_INTERVAL</code> ticks.
                </p>
              </article>

              <article>
                <h3>🚨 LAST HOPE evac</h3>
                <p>
                  When your civ is collapsing — last planet, low pop, under siege — trigger the LAST
                  HOPE auto-evac. Whole civilization packs up + auto-builds a rocket + launches to
                  an unexplored planet. Final-ditch escape. Auto-checks fire every{' '}
                  <code>LAST_HOPE_AUTO_CHECK_INTERVAL = 50</code> ticks with a{' '}
                  <code>LAST_HOPE_GRACE_PERIOD_TICKS = 300</code> grace window.
                </p>
              </article>

              <article>
                <h3>🏆 Win conditions</h3>
                <p>
                  Open-ended by default; the host picks any combination of conditions in the
                  pre-match setup. First condition met ends the match:
                </p>
                <ul>
                  <li>
                    <strong>🏴 Last Civ Standing</strong> — last surviving civ wins. No time limit.
                  </li>
                  <li>
                    <strong>🌌 Apex Tech</strong> — first civ to complete Singularity OR Reality
                    Editing wins. No time limit.
                  </li>
                  <li>
                    <strong>🎯 Highscore Target — race</strong> — first civ to reach the target
                    score wins.
                  </li>
                  <li>
                    <strong>📦 Resource Target — race</strong> — first civ to stockpile target units
                    of the picked resource wins.
                  </li>
                </ul>
              </article>

              <article>
                <h3>🎭 Governments — see the Themes tab</h3>
                <p>
                  Every civilization rolls a random government archetype at match start. Honest
                  alpha scope: what's wired today = citizen tier names + building name/emoji reskins
                  + palette colors + 2 propaganda-flavored achievement labels (volunteer epithet +
                  enemy epithet). Everything else (recruitment slogan, one-way trip cover name,
                  victory announcement, defeat excuse, theme-specific cinematics) ships as flavor
                  reference for designers — not yet surfaced to players. Full roster + which strings
                  are wired vs reference is in the <strong>Themes</strong> tab above.
                </p>
              </article>

              <article>
                <h3>💾 Save + load</h3>
                <p>
                  Host picks save mode in the pre-match setup: <strong>Off</strong> (memory-only),{' '}
                  <strong>Manual</strong> (💾 toolbar button), <strong>Auto-5min</strong> (default),
                  or <strong>Auto-15min</strong>. Saves go to local browser storage as JSON. Loading
                  restores full match state including population, inventory, in-flight ships,
                  research progress, and AI decision context.
                </p>
              </article>

              <article>
                <h3>📡 Multiplayer</h3>
                <p>
                  Server-authoritative via Colyseus. The match host sets speed + map size + win
                  conditions in the pre-match setup; non-host players cannot change these mid-match
                  (host-set chip in the TopToolbar shows the lock). Speed buttons are disabled for
                  non-host clients. Currently alpha — single-player is the primary surface;
                  multiplayer is wired but not playtested at scale.
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
