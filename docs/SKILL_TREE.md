# STARSHIP MADE OF LIES — Skill Tree

*Last Updated: 2026-05-11 (PHASE 17.J 10/11 sub-tasks shipped)*
*Project: SMoL (Starship Made of Lies) — formerly Unity Missile System*
*Unity AI Lab*

> ## ⚠ REALITY CHECK 2026-05-11
>
> **The per-row `⬜ planned` markers in the SMoL Capability Map (sections 1–15 below) capture DESIGN INTENT — what each skill SHOULD do when fully implemented.** Many are SHIPPED today; some are partially wired; some remain pure design.
>
> **For the honest shipped-state snapshot of SMoL**, see the new **🎯 SMoL Implementation Snapshot (2026-05-11)** section immediately below. It reflects post-PHASE 17.A/B/I + super-review × 2 (30+ code-review fixes) + 10/11 PHASE 17.J sub-tasks shipped (panel framework + TopToolbar + Reset Layout + Planet Energy panel + Battery Bank + 3-tier reactor buildings + reactor fuel loading + Citizens panel with ship-duty sliders + modular 8-slot ship builder + saved blueprints library). Only 17.J.10 (per-launch crew/cargo UI + blueprint→launch wiring) remains open.
>
> **For the UMS LEGACY summary at the bottom of this doc** (`Feature Status Summary` showing 101/101 complete + `Future Possibilities`) — that table describes the Unity Missile System Space Engineers project's complete shipped state. It's preserved as canonical math reference until PHASE 15 nuke. SMoL is the active project on top.

---

## 🎯 SMoL Implementation Snapshot (2026-05-11)

```
   ┌─────────────────────────────────────────────────────────────┐
   │   Capability                                  State         │
   ├─────────────────────────────────────────────────────────────┤
   │   Galaxy + planet generation                  ✅ Shipped    │
   │   Solar-system clustering (4× star scale)     ✅ Shipped    │
   │   Spectral-class star variety (O/B/A/F/G/K/M) ✅ Shipped    │
   │   Universe wrap (toroidal ±60k)               ✅ Shipped    │
   │   Hex/pentagon tiles on planet spheres        ✅ Shipped    │
   │   Building catalog (24 buildings)             ✅ Shipped    │
   │   Production system (BUILDING_PRODUCTION,     ✅ Shipped    │
   │     audited 2026-05-11, drift gate active)                  │
   │   Outpost-driven mining-ship economy          ✅ Shipped    │
   │   NO_SIGNAL crawl-home + solar recharge       ✅ Shipped    │
   │   Workforce sliders (5 categories)            ✅ Shipped    │
   │   Citizen tier system (5-tier)                ✅ Shipped    │
   │   Tech tree (38 nodes)                        ✅ Shipped    │
   │     ├─ Full expansion to 60+ nodes            🚧 17.C.7     │
   │   Government themes (15+)                     ✅ Shipped    │
   │   18 colony ship variants                     ✅ Shipped    │
   │   Pad state machine + salvo stagger           ✅ Shipped    │
   │   6 targeting modes (GPS/ANT/SEN/LID/MAN/SAT) ✅ Shipped    │
   │   Counter-colony-ship interception            ✅ Shipped    │
   │   Mine fields                                 ✅ Shipped    │
   │   Indigenous civilizations                    ✅ Shipped    │
   │   AI civs (4 personalities × 4 difficulties)  ✅ Shipped    │
   │     ├─ Outpost-rush priority boost            ✅ Shipped    │
   │   Fog of war (hidden planets at match start)  ✅ Shipped    │
   │   placeBuilding canonical (specific errors)   ✅ Shipped    │
   │   God-control mid-flight redirect             ✅ Shipped    │
   │   11-LCD telemetry rack                       ✅ Shipped    │
   │   Owner-flag distance fade                    ✅ Shipped    │
   │   Indigenous-marker distance fade             ✅ Shipped    │
   │   Match-length scaling (1h/10h/24h sagas)     ✅ Shipped    │
   │   Logarithmic depth buffer + shader chunks    ✅ Shipped    │
   │   Galaxy gen determinism                      ✅ Shipped    │
   ├─────────────────────────────────────────────────────────────┤
   │   SHIPPED — PHASE 17.J UMS-faithful immersion (10/11)        │
   ├─────────────────────────────────────────────────────────────┤
   │   Draggable / floating panels                 ✅ 17.J.1     │
   │   Unified top toolbar (resources + tiers)     ✅ 17.J.2     │
   │   Quick-toggle bar + Reset Layout             ✅ 17.J.3     │
   │   Modular 8-slot ship builder                 ✅ 17.J.4     │
   │   Reactor fuel loading (radioactives)         ✅ 17.J.5     │
   │   Planet energy panel (capacity/draw/surplus) ✅ 17.J.6     │
   │   Battery Bank building                       ✅ 17.J.7     │
   │   Fission/Fusion/Antimatter reactor buildings ✅ 17.J.8     │
   │   Citizen panel w/ ship-duty sliders          ✅ 17.J.9     │
   │   Saved ship blueprints library               ✅ 17.J.11    │
   │   Blueprint→print→launch wiring               ✅ 17.J.10    │
   │   Fog-of-war host toggle in New Game          ✅ 17.K       │
   │   Citizen tier-gate enforcement at launch     ✅ 17.L.A.6   │
   │   All ships abortable at any time             ✅ 17.L.A.16  │
   │   Self-Destruct Systems tech + flight gate    ✅ 17.L.A.17  │
   │   Workforce reserved-pool enforcement         ✅ 17.L.A.4   │
   │   Reactor mid-flight fuel drain → STRANDED    ✅ 17.L.A.1   │
   │   Battery-bank fuel-stockpile cap             ✅ 17.L.A.2   │
   │   Brownout building auto-disable              ✅ 17.L.A.3   │
   │   NO TRUNCATION audit (10 CSS patterns fixed) ✅ 17.L.B.7   │
   │   Profanity scrub in game code                ✅ 17.L.B.8   │
   │   TelemetryRack POWER-slot mirror             ✅ 17.L.B.6   │
   │   padId perf index (O(1) launch lookup)       ✅ 17.L.C.9   │
   │   Hard energy gating on blueprint print       ✅ 17.L.C.2   │
   ├─────────────────────────────────────────────────────────────┤
   │   ACTIVE — PHASE 17.L tail (super-review additions)         │
   ├─────────────────────────────────────────────────────────────┤
   │   Reactor mid-flight fuel drain → STRANDED    🚧 17.L.A.1   │
   │   Battery-bank fuel stockpile cap             🚧 17.L.A.2   │
   │   Brownout building auto-disable              🚧 17.L.A.3   │
   │   Workforce reserved-pool enforcement         🚧 17.L.A.4   │
   │   Player-pickable base variant in builder     🚧 17.L.A.5   │
   │   Drag-allocate crew + cargo manifest UI      🚧 17.L.A.7   │
   │   Crew + cargo preset persistence             🚧 17.L.A.8   │
   │   Tracking camera panel (single-flight RTT)   🚧 17.L.A.9   │
   │   Production-chain Sankey panel               🚧 17.L.A.10  │
   │   Three-mode mining (oneway/single/multi)     🚧 17.L.A.11  │
   │   UMS quotas + auto-recycle                   🚧 17.L.A.12  │
   │   Save/Load host-configurable                 🚧 17.L.A.13  │
   │   Boot-ceremony /play fullscreen gate         ✅ 17.L.A.14  │
   │   Multi-settlement-per-planet revival         🚧 17.L.A.15  │
   ├─────────────────────────────────────────────────────────────┤
   │   AWAITING BUSINESS DECISIONS — PHASE 17.D/E + EXTERNAL    │
   ├─────────────────────────────────────────────────────────────┤
   │   OAuth tail (Discord/Apple/email-passwordless) 🟡 17.D     │
   │   Real Postgres-backed multiplayer at scale     🟡 17.E     │
   │   Tauri desktop builds (Win/Mac/Linux)          🟡 17.E     │
   │   Capacitor mobile builds (iOS/Android)         🟡 17.E     │
   │   Replay archive                                🟡 17.E     │
   │   Diplomacy + treaty system                     🟡 17.E     │
   │   Cinematics + events                           🟡 17.E     │
   │   Localization (i18n)                           🟡 17.E     │
   │   GDPR / data-deletion compliance               🟡 EXTERNAL │
   │   Payment integration / monetization            🟡 EXTERNAL │
   └─────────────────────────────────────────────────────────────┘
```

**Legend:** ✅ Shipped + verified · 🚧 Active feature work · 🟡 Designed, awaiting business / external decision

---

## 📚 SMoL Capability Map (Design Intent — what each skill SHOULD do)

> The tables below are the canonical _design specification_ for every SMoL capability across 15 domains × 4 complexity tiers × 4 priority levels. Skills marked `⬜ planned` describe the FULL intended behavior — even when partially shipped, this captures what "done" looks like.

---

## SMoL — CURRENT PROJECT SKILL TREE (Templated Scaffold)

> Capability map for SMoL — the top-down emoji civilization-builder. Organized by DOMAIN (15 areas), COMPLEXITY (Basic / Intermediate / Advanced / Expert), and PRIORITY (P0 Critical / P1 Important / P2 Nice / P3 Future). This is a SCAFFOLD — capabilities get marked as PHASES 1-14 complete and the corresponding skill nodes light up.

### By Domain

#### 1. Frontend / UI Shell (`client/`, React + CSS variables)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| React app shell | 1 | ⬜ planned | Basic | P0 |
| TypeScript strict mode + tsc-noEmit type-check | 1 | ⬜ planned | Basic | P0 |
| CSS variable theming (per-government-theme UI skin) | 4 | ⬜ planned | Intermediate | P1 |
| Responsive layout (mobile + desktop + native) | 13 | ⬜ planned | Advanced | P1 |
| Per-theme UI skin loader (Theocracy = stained glass / Corporate = sleek / Surveillance = CCTV grid / etc.) | 4 | ⬜ planned | Advanced | P1 |
| LCD-style telemetry panel components (UMS carryover, theme-skinned) | 7 | ⬜ planned | Intermediate | P0 |

#### 2. 3D Rendering (`client/3d/`, Three.js)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| ~~2D hex-grid renderer (TilePlacementGrid)~~ — RETIRED as player canvas 2026-05-10; reverted to dev-debug-only overlay per LAW #0 (TODO 16.13). Game is TRUE 3D x,y,z universe via Three.js, NO 2D fallback, NO hex-game framing, NO card-game framing. | 1 | dev-debug only | Basic | retired (see 16.13) |
| Multi-level LOD swap (galaxy → planet → region → base → building) | 8 | ⬜ planned | Expert | P0 |
| Planet-sphere mesh + hex-tile geodesic projection | 2 | ⬜ planned | Advanced | P0 |
| WASD + QE rotate + mousewheel zoom + drag-pan camera | 8 | ⬜ planned | Intermediate | P0 |
| Cinematic camera moments (missile launch swoop, colony land, victory) | 8 | ⬜ planned | Advanced | P2 |
| Planet biome shading (10+ biomes, hostility tier visuals) | 2 | ⬜ planned | Advanced | P1 |
| 1000-planet galaxy view at 60fps | 14 | ⬜ planned | Expert | P0 |

#### 3. 3D Surface Raycast UI (`client/src/render/` + `client/src/3d/`, Three.js raycast on surface InstancedMesh — NO separate 2D canvas per LAW #0 2026-05-10, TODO PHASE 16.13)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| Surface tile raycast (mouse → InstancedMesh face → tile id → `placeBuilding` action) — through the 3D camera, NOT a separate 2D canvas | 16.5.6 | ⬜ planned | Intermediate | P0 |
| Fog-of-war as 3D camera-overlay shader (per-civ visibility rendered on planet sphere) | 16.8 | ⬜ planned | Advanced | P0 |
| Tile-level inspection (mouse-hover surface tile → context popover in 3D scene, never a 2D modal) | 16.5 | ⬜ planned | Intermediate | P0 |

#### 4. Galaxy + Planet Generation (`shared/gen/`)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| Procedural galaxy generator (100-1000 planets, distributed in 3D) | 2 | ⬜ planned | Advanced | P0 |
| Procedural planet generator (10+ biomes, hostility tiers) | 2 | ⬜ planned | Advanced | P0 |
| Per-biome resource distribution (terran=food/wood; lava=rare metals; etc.) | 2 | ⬜ planned | Intermediate | P0 |
| Hostility-tier biome lock (tier 0 home / tier 1 basic / tier 2 advanced / tier 3 end-game) | 3 | ⬜ planned | Intermediate | P1 |
| Player starting-planet placement (default different planets, optional shared) | 2 | ⬜ planned | Basic | P0 |

#### 5. Civilization Building (`shared/sim/`)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| Hex tile data model (terrain, resources, occupancy, owner, buildings) | 2 | ⬜ planned | Intermediate | P0 |
| Free-form-on-tile + 3D zoom-in placement (two-layer system) | 2, 8 | ⬜ planned | Advanced | P0 |
| Building catalog (farm 🌾 / school 🏫 / home 🏠 / factory 🏭 / lab 🥼 / propaganda / launch pad 🚀 / mine ⛏️ / etc.) | 2 | ⬜ planned | Intermediate | P0 |
| Resource system (emoji-driven, products only, NO animals, masterfully curated) | 2 | ⬜ planned | Intermediate | P0 |
| Per-planet inventory (PLANET-LOCAL, shared across bases on same planet) | 2 | ⬜ planned | Advanced | P0 |
| Universal tech transfer across empire | 3 | ⬜ planned | Intermediate | P0 |
| Population growth (food + housing + happiness/subterfuge thresholds) | 2 | ⬜ planned | Intermediate | P0 |
| Workforce priority sliders (Food / Industry / Research / Military / Propaganda %) | 2 | ⬜ planned | Intermediate | P0 |
| Citizen auto-assignment based on slider weights | 2 | ⬜ planned | Intermediate | P0 |

#### 6. Deception / Subterfuge Layer (`shared/sim/deception/`)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| Propaganda buildings (passive Loyalty/sec) | 5 | ⬜ planned | Intermediate | P0 |
| Active campaigns (resource-spend Loyalty boost) | 5 | ⬜ planned | Intermediate | P0 |
| Direct conscription (override will, hard hit to faction balance) | 5 | ⬜ planned | Basic | P0 |
| Faction model (loyal / skeptic / dissident, propaganda flips skeptics) | 5 | ⬜ planned | Advanced | P0 |
| Performance-degradation discovery model ("they just won't do things as well") | 5 | ⬜ planned | Advanced | P0 |
| Gradual-reveal UI (innocent → dark metrics over match) | 5 | ⬜ planned | Intermediate | P1 |
| "For the greater good" framing layer | 5 | ⬜ planned | Basic | P1 |
| **Citizen Tier System (5-tier — Worker/Skilled/Privileged/Elite/Pinnacle)** | 5.5 | ⬜ planned | Advanced | P0 |
| **Indoctrination Buildings — theme-flavored (Cathedral 🛐 / University 🏫 / Re-education Center 👁️ / Corporate Promotions Office 💼 / etc.)** | 5.5 | ⬜ planned | Intermediate | P0 |
| **Active Campaigns for tier-up surges (theme-flavored names)** | 5.5 | ⬜ planned | Intermediate | P1 |
| **Direct Promotion mechanic (instant tier-up + faction-loyalty cost)** | 5.5 | ⬜ planned | Intermediate | P1 |
| **Per-suicide-ship tier requirement validation** | 5.5 | ⬜ planned | Advanced | P0 |
| **Build-screen UI for suicide ships shows tier-cost preview** | 5.5 | ⬜ planned | Intermediate | P0 |
| **Conscription override mode (force-launch low-tier with severe faction crash)** | 5.5 | ⬜ planned | Advanced | P1 |
| **Faction-loyalty cascade on suicide-ship launch (Tier-5 honored, Tier-3-4 mixed, Tier-1-2 dissident-shift)** | 5.5 | ⬜ planned | Advanced | P0 |
| **Per-planet citizen tier breakdown UI ("1450 Workers / 600 Skilled / 240 Privileged / 96 Elite / 24 Chosen")** | 5.5 | ⬜ planned | Intermediate | P0 |
| **"Volunteer Pool" indicator on civ UI (sum of Tier 5 across empire)** | 5.5 | ⬜ planned | Basic | P0 |
| **Per-theme "The Chosen" framing string library (Theocracy="Most Holy Pilgrims", Corporate="Platinum-Tier Subscribers", etc.)** | 5.5 | ⬜ planned | Intermediate | P1 |
| **Darkness progression arc (tech tier unlocks gate ship variants per tier — no skipping the corruption)** | 5.5 | ⬜ planned | Advanced | P0 |

#### 7. Government Theme System (`shared/sim/themes/`, `assets/themes/`)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| Theme catalog (15-20+ themes — Theocracy / Corporate / Junta / Surveillance / Climate-Refugee / Eugenics / AI-Overlord / Anarcho-Cap / Hereditary / Eco-Cult / Hivemind / Game-Show / Cyberpunk / Gerontocracy / Memetic / etc.) | 4 | ⬜ planned | Expert | P0 |
| Per-theme propaganda style (text/dialog templates) | 4 | ⬜ planned | Advanced | P0 |
| Per-theme UI skin (CSS variables: colors, fonts, panel borders) | 4 | ⬜ planned | Advanced | P0 |
| Per-theme music tracks (4 per theme: ambient + tense + victory + defeat) | 12 | ⬜ planned | Advanced | P1 |
| Per-theme UI SFX (button click, build complete, citizen voice cameos) | 12 | ⬜ planned | Intermediate | P1 |
| Per-theme building emoji variants (Theocracy school = ⛪; Corporate school = 🏢) | 4 | ⬜ planned | Intermediate | P1 |
| Random theme roll on civ creation (each civ rolls independently) | 4 | ⬜ planned | Basic | P0 |
| Theme propagation to colonies | 4 | ⬜ planned | Intermediate | P1 |
| Theme conversion on conquered planets (gradual transition) | 4 | ⬜ planned | Advanced | P2 |
| Theme-gated diplomacy rules (Theocracy converts; Surveillance always hostile; etc.) | 4 | ⬜ planned | Advanced | P1 |

#### 8. Tech Tree & Research (`shared/sim/tech/`)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| Future-only branching/web tech tree | 3 | ⬜ planned | Advanced | P0 |
| Mainstream / Suppressed / Forbidden tier classification | 3 | ⬜ planned | Intermediate | P0 |
| Suppressed/Forbidden conquest-gating (X enemy defeats / Y planet captures unlock) | 3 | ⬜ planned | Advanced | P0 |
| Tech prerequisites (DAG of dependencies) | 3 | ⬜ planned | Intermediate | P0 |
| Research-points generation (scientists 🥼 from priority slider) | 3 | ⬜ planned | Intermediate | P0 |
| Conquest tech-loot (defeat enemy → unlock one of their techs) | 3 | ⬜ planned | Intermediate | P0 |
| Conquest resource-loot (bulk transfer to attacker) | 3 | ⬜ planned | Basic | P0 |
| Planetary-coverage research multiplier (more planets = faster) | 3 | ⬜ planned | Advanced | P0 |
| Tech apex check (≥10 planets controlled before final tier) | 3 | ⬜ planned | Intermediate | P0 |
| Tech-tier-gated hostile biome unlock | 3 | ⬜ planned | Intermediate | P1 |
| Tech tree visualizer (per-theme styled) | 3 | ⬜ planned | Advanced | P1 |

#### 9. Colony Ship System (was "Missile System" — UMS feature carryover + SMoL design extensions — `shared/sim/colonyship/`)

> Renamed 2026-05-09 from "Missile System" to "Colony Ship System" per user terminology shift ("is say 'missiles' ahumm colony ships"). Every UMS missile concept maps to a SMoL colony ship variant. UMS LEGACY references in this doc untouched.

##### 9a. Core mechanics (UMS-direct carryover)

| Skill | Phase | Status | Complexity | Priority | UMS Source |
|-------|-------|--------|------------|----------|------------|
| Multi-pad coordination (one civ owns multiple pads, scales with empire) | 6 | ⬜ planned | Advanced | P0 | UnityPad.cs |
| Pad state machine (INIT → IDLE → PRINT → BUILD → DOCK → FUEL → AMMO → READY → ARM → LAUNCH → GONE) | 6 | ⬜ planned | Advanced | P0 | UnityPad.cs |
| Per-pad targeting (different pads → different targets) | 6 | ⬜ planned | Intermediate | P0 | UnityPad.cs |
| Salvo launch with stagger (15s default `svInt`) | 6 | ⬜ planned | Advanced | P1 | UnityPad.cs UpdateSalvo |
| Saved-target locations (galaxy waypoint list) | 6 | ⬜ planned | Intermediate | P0 | UnityPad button-panel GPS |
| Pad inventory + telemetry panels (per-pad LCD-style, theme-skinned) | 6, 7 | ⬜ planned | Intermediate | P0 | UnityPad LCDs |
| Colony ship body construction (resource cost, build time, queued in pad) | 6 | ⬜ planned | Intermediate | P0 | UnityPad.cs BUILD state |
| Citizen loading (configurable count, theme-flavored coax — gated by Citizen Tier System) | 6 | ✅ 17.L.A.6 partial — tier-gate at launch live; manual coax UI deferred to 17.L.A.7 | Intermediate | P0 | SMOL_DESIGN_COLONY_SHIPS §9-NEW + user verbatim *"citizens dont want to kill them selves but for the most high tiered/happy/statas we have"* |
| Payload configurator (citizens vs equipment vs weapons trade-off) | 6 | ⬜ planned | Advanced | P0 | (SMoL-new) |
| Tech-tier-scaled payload size | 6 | ⬜ planned | Intermediate | P1 | (SMoL-new) |
| Arm/Disarm controls | 6 | ⬜ planned | Basic | P0 | UnityPad.cs ARM/DISARM |
| Great-circle colony-ship arc on planet sphere | 6 | ⬜ planned | Expert | P0 | UnityMissile.cs CLIMB+COAST+REENTRY |
| Visible trajectory to all players (no surprise attacks; defender prepares) | 6 | ⬜ planned | Intermediate | P0 | (SMoL-new) |
| Mine field defense (pre-placed mines intercept incoming) | 6 | ⬜ planned | Advanced | P0 | UMS mines |
| Counter-colony-ship launch (defender intercepts mid-flight; intercept math) | 6 | ⬜ planned | Expert | P0 | (SMoL-new derived) |
| Outcome resolution (TARGET HIT / PROBABLE HIT / SIGNAL LOST / INTERCEPTED / ABORTED) | 6 | ⬜ planned | Intermediate | P0 | UMS outcome enum |
| Landing site selection (player picks tile within target planet/zone) | 6 | ⬜ planned | Intermediate | P0 | (SMoL-new) |
| Colony bootstrap on landing (fresh-game-start with shipped resources) | 6 | ⬜ planned | Advanced | P0 | (SMoL-new) |
| Empire-wide tech inheritance | 6 | ⬜ planned | Basic | P0 | (SMoL-new) |
| Local resource detection (planet-local biome → mineable/buildable list) | 6 | ⬜ planned | Intermediate | P1 | (SMoL-new) |
| Initial defense vulnerability (new colony fortify-or-die window) | 6 | ⬜ planned | Intermediate | P1 | (SMoL-new) |
| Intra-planet colonization (colony ships can land same-planet for forward bases) | 6 | ⬜ planned | Intermediate | P1 | (SMoL-new) |

##### 9b. Colony Ship Variants — Tier 1 (Tests & Exploration)

| Skill | Phase | Status | Complexity | Priority | Reference |
|-------|-------|--------|------------|----------|-----------|
| Scout Colony Ship 🛰️ (auto-explore, attack-if-attacked, returns alive) | 6.5 | ⬜ planned | Advanced | P0 | UMS UnityMissile T.MANUAL + sensor-driven explore |
| Surveyor Colony Ship 📡 (peaceful land + scan + sub-colony establishment) | 6.5 | ⬜ planned | Intermediate | P0 | (SMoL-new) |
| Probe Colony Ship 🔬 (one-way sacrifice scout, sends data until destroyed) | 6.5 | ⬜ planned | Basic | P0 | (SMoL-new) |

##### 9c. Colony Ship Variants — Tier 2 (Discovery & Escalation)

| Skill | Phase | Status | Complexity | Priority | Reference |
|-------|-------|--------|------------|----------|-----------|
| Standard Colony Ship 🚀 (canonical SMoL launch action — invade enemy planet under colonization cover) | 6.6 | ⬜ planned | Advanced | P0 | UMS missile + SMoL coax loading |
| Laser-Targeting Beacon Ship 🔦 (lands on enemy planet, becomes ground beacon for follow-up precision strikes) | 6.6 | ⬜ planned | Expert | P0 | UMS pad-laser + missile-side laser uplink |
| Decoy Colony Ship 🎭 (no citizens; intercept-magnet for salvo) | 6.6 | ⬜ planned | Advanced | P1 | UMS salvo desync + telemetry-fakery |
| Boarding Colony Ship 🤝 (citizens are operatives; captures enemy buildings) | 6.6 | ⬜ planned | Advanced | P1 | (SMoL-new — building-capture mechanic) |

##### 9d. Colony Ship Variants — Tier 3 (Aggression & Industrial Warfare)

| Skill | Phase | Status | Complexity | Priority | Reference |
|-------|-------|--------|------------|----------|-----------|
| Saboteur Colony Ship 💣 (disguised crash on enemy infrastructure, framed as "tragic accident") | 6.7 | ⬜ planned | Advanced | P0 | UMS detonation + small-payload variant |
| Explosive Colony Ship 💥 (large warhead, multi-building damage, framed as "carrying mining explosives") | 6.7 | ⬜ planned | Advanced | P0 | UMS detonation + large-payload variant |
| Heavy Colony Ship 🛳️ (long-range, high-HP, slow — can reach distant planets) | 6.7 | ⬜ planned | Intermediate | P1 | (SMoL-new — size-scaled variant) |
| Counter-Colony Ship 🛡️ (interceptor — defends against incoming) | 6.7 | ⬜ planned | Expert | P0 | UMS counter-missile geometry |

##### 9e. Colony Ship Variants — Tier 4 (Industrial Eradication — REQUIRES TIER 4-5 CITIZENS)

| Skill | Phase | Status | Complexity | Priority | Reference |
|-------|-------|--------|------------|----------|-----------|
| Pilgrim Volunteer Ship 🕊️ (suicide colony ship — requires Tier 4-5 citizens; one-way "honored" trip) | 6.8 | ⬜ planned | Advanced | P0 | UMS manual-mode self-destruct + payload-as-detonator |
| Mass Evacuation Ship 🌆 (city-scale; thousands of citizens; aimed at enemy capital) | 6.8 | ⬜ planned | Expert | P1 | (SMoL-new — scaled-up Pilgrim Volunteer) |
| Orbital Weapon Platform 🛰️ (BLACKOUT_SAT mechanic — auto-conversion to orbital satellite weapon) | 6.8 | ⬜ planned | Expert | P0 | UnityMissile satellite branch direct carryover |
| The Final Colony Ship 🌌 (endgame super-weapon, planet-cracker, requires ≥15 planets + tech apex) | 6.8 | ⬜ planned | Expert | P2 | (SMoL-new — capstone variant) |

##### 9f. Cross-cutting variants

| Skill | Phase | Status | Complexity | Priority | Reference |
|-------|-------|--------|------------|----------|-----------|
| Mining Colony Ship ⛏️ — UMS-style auto-shuttle (target ore + auto-settings + cycle indefinitely) | 6.9 | ⬜ planned | Advanced | P0 | UnityBeacon shuttle-cycle + UnityInventory cargo correlation |
| Multi-planet auto-rotation queue (SMoL automation upgrade beyond UMS) | 6.9 | ⬜ planned | Intermediate | P1 | (SMoL-new) |
| Auto-recall on threat (miner evacuates if planet under attack) | 6.9 | ⬜ planned | Intermediate | P1 | (SMoL-new) |
| Fleet auto-balancing (civ AI distributes miners across planets per resource needs) | 6.9 | ⬜ planned | Advanced | P1 | (SMoL-new) |
| Refugee Colony Ship 🚑 (genuine humanitarian, coop-mode + rare solo events) | 6.9 | ⬜ planned | Basic | P2 | (SMoL-new) |
| Embassy Colony Ship 📜 (coop-mode diplomacy — peaceful trade route) | 6.9 | ⬜ planned | Basic | P2 | (SMoL-new) |
| Resupply Colony Ship 📦 (own-empire reinforcement — supplies + reinforcements to distant colonies) | 6.9 | ⬜ planned | Intermediate | P1 | (SMoL-new) |

#### 10. UMS Visual / Telemetry Carryover (`client/panels/`)
| Skill | Phase | Status | Complexity | Priority | UMS Source |
|-------|-------|--------|------------|----------|------------|
| LCD panel base component (monospace, scanlines, theme-skinnable) | 7 | ⬜ planned | Intermediate | P0 | UMS LCD aesthetic |
| Per-base inventory panel (resources, production rates, stock graphs) | 7 | ⬜ planned | Intermediate | P0 | UnityInventory LCD |
| Per-pad status panel (missile state, fuel/ammo, target, ETA) | 7 | ⬜ planned | Intermediate | P0 | UnityPad LCD |
| Production graph (per-resource over time, ASCII bar / sparkline) | 7 | ⬜ planned | Advanced | P1 | UMS graph patterns |
| Build-queue panel (per-base + per-pad) | 7 | ⬜ planned | Basic | P0 | UMS queue display |
| Planet-level beacon (incoming/outgoing missile alerts) | 7 | ⬜ planned | Intermediate | P0 | UnityBeacon carryover |
| Signaling system (radar/sensor tech tier reveals incoming earlier) | 7 | ⬜ planned | Advanced | P1 | UnitySignal carryover |
| Antenna tech upgrades (signaling range, fog-of-war reveal speed) | 7 | ⬜ planned | Intermediate | P1 | UnitySignal antenna mgmt |
| Camera/recon panels (per-civ scout reports) | 7 | ⬜ planned | Intermediate | P2 | UnitySignal cameras |
| Game-state init checklist on match start (UMS 26-check carryover, dystopian-flavored) | 7 | ⬜ planned | Advanced | P1 | Unity Boot 26-check |
| Per-theme boot sequence flavor (Theocracy = "Invoking sacred protocols..."; Corporate = "Booting enterprise systems...") | 7 | ⬜ planned | Intermediate | P2 | (SMoL-new derived) |
| WebSocket message types (UMS IGC channel carryover) | 7 | ⬜ planned | Advanced | P0 | UMS IGC channels |

#### 11. AI Players (`server/ai/`)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| Background-process per AI civ (worker thread or server-side process) | 9 | ⬜ planned | Advanced | P0 |
| State sync to all clients (AI civs visible in multiplayer) | 9 | ⬜ planned | Intermediate | P0 |
| No-cheat policy (AI uses same game mechanics, no fog-of-war bypass) | 9 | ⬜ planned | Intermediate | P0 |
| Personality archetypes (Builder / Warmonger / Researcher / Trickster) | 9 | ⬜ planned | Advanced | P0 |
| Difficulty scaling (Easy / Medium / Hard / Brutal) | 9 | ⬜ planned | Intermediate | P0 |
| Co-op mode: humans team-up against AI civs | 9, 10 | ⬜ planned | Advanced | P1 |
| Co-op diplomacy (alliance, shared intel) | 9, 10 | ⬜ planned | Advanced | P1 |

#### 12. Multiplayer Server (`server/`, Colyseus or custom)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| Authoritative server (game-state owned by server) | 10 | ⬜ planned | Advanced | P0 |
| WebSocket transport | 10 | ⬜ planned | Intermediate | P0 |
| Per-room match isolation | 10 | ⬜ planned | Intermediate | P0 |
| Fog-of-war enforcement server-side | 10 | ⬜ planned | Advanced | P0 |
| Lobby UI (host creates, players join via code) | 10 | ⬜ planned | Intermediate | P0 |
| Host config (planet count 100-1000, players 1-12, length blitz/standard/epic, win conditions any combo, AI mix, biomes, co-op toggle) | 10 | ⬜ planned | Advanced | P0 |
| Slot system (12 slots; humans + AI fill) | 10 | ⬜ planned | Basic | P0 |
| Theme reveal at lobby (slots show rolled theme; lock or re-roll once) | 10 | ⬜ planned | Intermediate | P1 |
| Tick-rate (10Hz server / 30+Hz client interpolation) | 10 | ⬜ planned | Advanced | P0 |
| Action validation (server validates each player action) | 10 | ⬜ planned | Intermediate | P0 |
| State delta sync per civ's fog-of-war | 10 | ⬜ planned | Advanced | P0 |
| Auto-save host-side (resume on host return) | 10 | ⬜ planned | Intermediate | P1 |
| Disconnection handling (AI takeover for short periods, or pause on all-disconnect) | 10 | ⬜ planned | Advanced | P2 |

#### 13. Persistence + Meta-progression (`server/persist/`)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| Anonymous play (instant access, no signup) | 11 | ⬜ planned | Basic | P0 |
| Optional account (email or OAuth — Google / Discord) | 11 | ⬜ planned | Intermediate | P1 |
| Lifetime stats per account | 11 | ⬜ planned | Basic | P1 |
| Multi-category Hall of Champions (Most Planets / Fastest Tech Apex / Most Deceptive / Theme Specialist / Most Ruthless) | 11 | ⬜ planned | Intermediate | P1 |
| Achievement manifest (per-match outcome triggers) | 11 | ⬜ planned | Basic | P1 |
| Achievement unlocks (cosmetic UI flairs, profile badges, rare theme variants) | 11 | ⬜ planned | Intermediate | P2 |

#### 14. Audio System (`client/audio/`)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| Per-theme soundtrack (4 tracks × 15+ themes = 60+ tracks) | 12 | ⬜ planned | Intermediate | P1 |
| Adaptive music (intensity scales with match state) | 12 | ⬜ planned | Advanced | P2 |
| Cross-fade between zones / events | 12 | ⬜ planned | Intermediate | P2 |
| Universal SFX (UI clicks, building complete, missile launch, missile impact, colony established) | 12 | ⬜ planned | Basic | P1 |
| Per-theme UI SFX (button click flavor, citizen voice cameos) | 12 | ⬜ planned | Intermediate | P2 |
| Spatial audio (planet-level events have positional audio) | 12 | ⬜ planned | Advanced | P2 |
| Audio mixer (Master / Music / SFX / Voice volume sliders) | 12 | ⬜ planned | Basic | P1 |
| Per-theme mix presets (Theocracy boosts choral; Corporate boosts elevator-jazz) | 12 | ⬜ planned | Intermediate | P2 |

#### 15. Cross-Platform Packaging (`src-tauri/`, `mobile/`)
| Skill | Phase | Status | Complexity | Priority |
|-------|-------|--------|------------|----------|
| Vite production bundle (web) | 13 | ⬜ planned | Basic | P0 |
| Web deploy (Cloudflare Pages / Vercel / self-host) | 13 | ⬜ planned | Intermediate | P0 |
| CDN for assets (per-theme audio + emoji manifests) | 13 | ⬜ planned | Intermediate | P1 |
| Tauri config for Windows / macOS / Linux | 13 | ⬜ planned | Advanced | P1 |
| Desktop UX (window controls, native menus, fullscreen) | 13 | ⬜ planned | Intermediate | P1 |
| Auto-updater (Tauri built-in) | 13 | ⬜ planned | Intermediate | P1 |
| Capacitor config for iOS + Android | 13 | ⬜ planned | Advanced | P1 |
| Mobile UX adaptations (tap-and-hold for build menu, pinch-to-zoom on planet view, swipe pan) | 13 | ⬜ planned | Advanced | P1 |
| App store assets (icons, splash, screenshots) | 13 | ⬜ planned | Basic | P1 |
| App store submission flows (Apple App Store + Google Play) | 13 | ⬜ planned | Advanced | P2 |

### By Complexity (rolled up across domains)

| Tier | Description | Domains touched |
|------|-------------|-----------------|
| **Basic** | Foundational primitives (anonymous play, basic SFX, T-shirt UX) | All domains |
| **Intermediate** | Standard operational capabilities (theme system mechanics, AI personality, per-base panels) | All domains |
| **Advanced** | Power-user features (theme-gated diplomacy, server fog-of-war, multi-pad coordination, great-circle math) | 4-12 |
| **Expert** | System integration mastery (multi-level LOD, theme catalog 15+, intercept math, 1000-planet 60fps) | 2, 7, 8, 9 |

### By Priority (rolled up)

- **P0 Critical** — Required for SMoL to function as the designed game (galaxy gen, missile system, theme system foundations, multiplayer server, basic platform packaging)
- **P1 Important** — Significantly improves quality (per-theme assets, achievements, mobile UX, intercept math, conquest tech-loot)
- **P2 Nice-to-Have** — Polish (cinematic camera moments, spatial audio, theme conversion on conquered planets, app store submission)
- **P3 Future** — Post-MVP (modding, localization, spectator mode, ranked seasonal ladder, cross-progression)

### Dependency Graph (high-level)

```
                    ┌─────────────────────────────┐
                    │  PHASE 0: UMS Reference     │
                    │  Extraction Docs            │
                    └────────────┬────────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
        ┌───────▼────────┐               ┌────────▼────────┐
        │ PHASE 1:       │               │ Reference docs  │
        │ Skeleton       │               │ → consulted     │
        │ (TS/React/3D)  │               │ throughout 1-14 │
        └───────┬────────┘               └─────────────────┘
                │
   ┌────────────┼────────────┬─────────────┬────────────┐
   │            │            │             │            │
 ┌─▼──────┐ ┌──▼──────┐ ┌────▼────┐ ┌──────▼─────┐ ┌────▼─────┐
 │ PHASE 2│ │ PHASE 3 │ │ PHASE 4 │ │ PHASE 5    │ │ PHASE 6  │
 │ Galaxy │ │ Tech    │ │ Themes  │ │ Deception  │ │ Missile  │
 │ Planets│ │ Tree    │ │ System  │ │ Subterfuge │ │ (UMS!)   │
 └────┬───┘ └────┬────┘ └────┬────┘ └─────┬──────┘ └────┬─────┘
      │          │           │            │             │
      └──────────┴───────────┼────────────┴─────────────┘
                             │
                  ┌──────────▼──────────┐
                  │ PHASE 7: UMS Visual │
                  │ + Telemetry         │
                  └──────────┬──────────┘
                             │
              ┌──────────────┼──────────────┬──────────────┐
              │              │              │              │
         ┌────▼────┐    ┌────▼────┐   ┌─────▼────┐   ┌─────▼────┐
         │ PHASE 8 │    │ PHASE 9 │   │ PHASE 10 │   │ PHASE 11 │
         │ 3D Zoom │    │ AI      │   │ MP Server│   │ Persist  │
         └────┬────┘    └────┬────┘   └─────┬────┘   └─────┬────┘
              │              │              │              │
              └──────────────┴──────────────┴──────────────┘
                                  │
                       ┌──────────▼──────────┐
                       │ PHASE 12: Audio     │
                       └──────────┬──────────┘
                                  │
                       ┌──────────▼──────────┐
                       │ PHASE 13: Packaging │
                       └──────────┬──────────┘
                                  │
                       ┌──────────▼──────────┐
                       │ PHASE 14: Polish    │
                       │ + LAUNCH 🚀          │
                       └──────────┬──────────┘
                                  │
                       ┌──────────▼──────────┐
                       │ PHASE 15: NUKE UMS  │
                       │ (project complete)  │
                       └─────────────────────┘
```

### Cross-Reference

- **`.claude/TODO.md`** — Granular task list per phase
- **`ROADMAP.md`** — Phase milestones overview
- **`.claude/SMOL_REFERENCE_*.md`** (PHASE 0 deliverables) — UMS subsystem extractions referenced by Phase 6, 7, etc.

### Skill Status Summary (updated 2026-05-10 per super-review reality sync — PHASE 16.14)

> Counts are rolled up from `/super-review` 2026-05-10 measurement of the codebase vs UMS canonical spec. "Shipped" = data structure + interface + UI surface reachable from `/play`. "Partial" = data + interface landed; UI surface partial OR tick wire-up pending. "Planned" = nothing yet OR data-only with no producer/consumer.

| Domain | Total | Shipped | Partial | Planned | Notes |
|--------|-------|---------|---------|---------|-------|
| 1. Frontend / UI Shell | 6 | 3 | 2 | 1 | React shell + TS strict + CSS variable theming live; responsive mobile + per-theme skin loader partial; LCD-style panel components partial (4-tab overlay shipped, 11-LCD rack missing) |
| 2. 3D Rendering | 7 | 3 | 2 | 2 | Camera controller + galaxy biome shading + surface InstancedMesh shipped; planet sphere + biome hostility tier visuals partial; multi-level LOD + 1000-planet 60fps + cinematic moments planned (PHASE 16.13 / 16.7 active) |
| 3. 3D Surface Raycast UI | 3 | 0 | 1 | 2 | Tile-raycast scaffolded in PlayPage when galaxyOpen=true; primary placement still uses 2D TilePlacementGrid (PHASE 16.5.6 + 16.13.9 pending); fog-of-war shader planned |
| 4. Galaxy + Planet Generation | 5 | 4 | 1 | 0 | 100-1000 planet procedural shipped; biome distribution + per-biome resources shipped; resource-node Vec3 scatter shipped; hostility-tier biome lock partial |
| 5. Civilization Building | 9 | 5 | 3 | 1 | Hex tile data + building catalog + emoji resource system + per-planet inventory + workforce sliders shipped; population + auto-assignment + free-form-on-tile partial (multi-civ-per-planet UI per `feedback_planets_green_big_multi_civ.md` MISSING); upgradeable inventory capacity planned |
| 6. Deception / Subterfuge | ~19 | 8 | 6 | ~5 | Propaganda + active campaigns + faction model + 5-tier citizens + per-suicide-ship tier validation shipped; Indoctrination buildings + Active Campaigns surface partial; some Citizen Tier UI rows (Volunteer Pool indicator, per-theme Chosen framing strings) planned |
| 7. Government Theme System | 10 | 6 | 3 | 1 | 20-theme catalog + per-civ random + UI skin + per-theme propaganda + building emoji variants + boot reveal line shipped; per-theme music partial (synth fallback only, real .ogg pending); theme conversion on conquered planets planned |
| 8. Tech Tree & Research | 11 | 7 | 3 | 1 | Future-only tree + Mainstream/Suppressed/Forbidden + research-points + tech apex gate shipped; conquest tech-loot + conquest resource-loot + planetary-coverage multiplier partial; tech tree visualizer planned |
| 9. Colony Ship System | ~50 | 12 | 18 | ~20 | Pad state machine + 18-variant taxonomy + great-circle arc + mine intercept + counter-missile intercept + per-pad targeting queue + outcome enum + Tier 1 Scout/Surveyor/Probe + Tier 2 Standard shipped; build phase machine + 6 targeting modes + multi-pad controller mode mass actions + auto-fire / carpet bomb / auto-attack player surface MISSING (super-review Critical/High); mining colony ship auto-shuttle MISSING (Critical); Tier 3 / Tier 4 ship variant UI reachability partial |
| 10. UMS Visual / Telemetry Carryover | 12 | 4 | 2 | 6 | LCD-frame component + flight telemetry panel + per-base inventory panel + beacon panel shipped; build-queue + production graphs partial (referenced but not default-visible per super-review); 11-LCD numbered rack + 12-graph sparkline cycle + personal-equipment 4-column + camera array + signal status + per-theme boot sequence flavor screen MISSING (super-review Critical/Medium) |
| 11. AI Players | 7 | 3 | 3 | 1 | Background-process server + AI civs visible in multiplayer + simplified random AI shipped; archetype × difficulty + co-op mode partial (data exists; full AIController.tick wire-up pending); co-op diplomacy planned |
| 12. Multiplayer Server | 13 | 8 | 4 | 1 | Authoritative server + WebSocket + per-room match + lobby + host config + slot system + theme reveal + auto-save shipped; tick-rate (5Hz) + per-civ fog-of-war filter + state-delta sync + action validation partial; disconnection AI takeover planned |
| 13. Persistence + Meta-progression | 6 | 3 | 3 | 0 | Anonymous play + FileSnapshotStore + lifetime stats shipped; Google OAuth + Hall of Champions + achievement manifest partial (Google live 2026-05-10 per PHASE 17.0; leaderboard + achievement wire-up to real player data pending) |
| 14. Audio System | 8 | 3 | 3 | 2 | Synth audio fallback + universal SFX + audio mixer shipped; per-theme soundtrack + UI SFX + per-theme mix presets partial (synth only, real recordings pending); adaptive music + spatial audio planned |
| 15. Cross-Platform Packaging | 10 | 4 | 4 | 2 | Vite production bundle + Tauri config + Capacitor config + GitHub Actions matrix shipped; web deploy + CDN + desktop UX + auto-updater partial (local-host alpha only); app store assets + submission flows planned |
| **TOTAL** | **~176** | **~73** | **~55** | **~48** | Roughly 41% shipped, 31% partial (data + interface + partial UI), 27% planned. Super-review gaps tracked in `.claude/TODO.md` PHASE 16.14. |

### Future Possibilities (Post-MVP / Out-of-Scope per TODO)

- Modding / community theme content
- Localization (English-only MVP)
- Spectator + replay mode
- Ranked seasonal ladder
- Cross-progression between web/desktop/mobile
- LLM-driven adaptive AI (an upgrade path for AI personalities)

---

## LEGACY UMS REFERENCE — Preserved Verbatim (Sunset 2026-05-09)

> The Unity Missile System skill tree below is preserved as reference material — its STRUCTURAL PATTERN (By Domain → By Complexity → By Priority → Dependency Graph → Status Summary → Future) is the template SMoL's skill tree above follows. The CONTENT is the historical record of what UMS could do (101 features, all complete). UMS source code remains preserved in the repo as reference material until PHASE 15.

[ORIGINAL UMS SKILL TREE CONTENT BELOW — PRESERVED VERBATIM, NOT MODIFIED]

# STARSHIP MADE OF LIES - Skill Tree [LEGACY UMS]

*Original Last Updated: 2026-01-29*
*Unity AI Lab - Missile Systems Division*

---

## Overview

Complete capability map for the Starship Made of Lies (6 scripts). Organized by domain, complexity, and priority to help understand what the system can do and what's still on the roadmap.

**Scripts:** Unity Boot, UnityPad, UnityInventory, UnitySignal, UnityMissile, UnityBeacon

---

## By Domain

### Boot & System Initialization

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Per-PB CustomData Architecture | Unity Boot | COMPLETE | Advanced |
| 26 Unified Boot Checks | Unity Boot | COMPLETE | Expert |
| Real IGC Handshaking | Unity Boot | COMPLETE | Advanced |
| PB Discovery Pattern | Unity Boot | COMPLETE | Intermediate |
| Ready Flag Synchronization | Unity Boot | COMPLETE | Intermediate |
| LCD Boot Screen Display | Unity Boot | COMPLETE | Basic |
| Session ID Tracking | Unity Boot | COMPLETE | Intermediate |
| Self-Disable After Boot | Unity Boot | COMPLETE | Basic |

### Guidance & Navigation

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| GPS Coordinate Targeting | UnityMissile | COMPLETE | Basic |
| Antenna Signal Tracking | UnityMissile | COMPLETE | Intermediate |
| Sensor Proximity Hunting | UnityMissile | COMPLETE | Intermediate |
| LIDAR Camera Raycast | UnityMissile | COMPLETE | Advanced |
| Manual Remote Control | UnityMissile | COMPLETE | Basic |
| Satellite Deployment | UnityMissile | COMPLETE | Expert |
| ICBM Ballistic Profile | UnityMissile | COMPLETE | Advanced |
| Zero-G Space Flight | UnityMissile | COMPLETE | Intermediate |
| Gravity Detection | UnityMissile | COMPLETE | Basic |
| Reentry Phase Handling | UnityMissile | COMPLETE | Advanced |

### Communication & Telemetry

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| IGC Missile Telemetry | Both | COMPLETE | Intermediate |
| Remote Detonation Command | Both | COMPLETE | Basic |
| Position Broadcasting | UnityMissile | COMPLETE | Basic |
| Satellite Relay Network | Both | COMPLETE | Expert |
| Multi-Pad IGC Coordination | UnityPad | COMPLETE | Advanced |
| Blackout Detection | UnityPad | COMPLETE | Intermediate |
| Miner Fleet Tracking | UnityPad | COMPLETE | Advanced |
| Beacon Status Broadcast | UnityBeacon | COMPLETE | Basic |

### Display & UI

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| 10-Panel LCD System | UnityPad | COMPLETE | Advanced |
| Controller LCD Mode (8 panels) | UnityPad | COMPLETE | Advanced |
| Menu Navigation | UnityPad | COMPLETE | Basic |
| Setup Wizard | UnityPad | COMPLETE | Intermediate |
| Flight Telemetry Display | UnityPad | COMPLETE | Intermediate |
| Power Graphs | UnityPad | COMPLETE | Advanced |
| Miner Fleet Display | UnityPad | COMPLETE | Intermediate |
| Progress Bars | UnityPad | COMPLETE | Basic |
| Status Indicators | UnityPad | COMPLETE | Basic |
| Ship Status LCD | UnityBeacon | COMPLETE | Basic |

### Block Detection & Management

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Pad Block Scanning | UnityPad | COMPLETE | Intermediate |
| Missile Block Scanning | UnityPad | COMPLETE | Intermediate |
| Tag-Based Block Discovery | UnityPad | COMPLETE | Basic |
| Multi-Pad Discovery | UnityPad | COMPLETE | Advanced |
| Auto Block Naming | UnityPad | COMPLETE | Intermediate |
| Grid Size Detection | UnityPad | COMPLETE | Basic |
| Thruster Type Detection | UnityPad | COMPLETE | Intermediate |

### Signal & Communications Controller

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Antenna Management | UnitySignal | COMPLETE | Basic |
| Laser Antenna Control | UnitySignal | COMPLETE | Intermediate |
| Satellite Constellation Tracking | UnitySignal | COMPLETE | Advanced |
| Camera Array Management | UnitySignal | COMPLETE | Intermediate |
| Session ID Broadcasting | UnitySignal | COMPLETE | Intermediate |
| CAMS LCD Display | UnitySignal | COMPLETE | Basic |
| SAT_RELAY_STATUS Processing | UnitySignal | COMPLETE | Advanced |

### Inventory & Resources

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Container Tag Routing | UnityInventory | COMPLETE | Intermediate |
| Size-Priority Sorting (L>M>S) | UnityInventory | COMPLETE | Intermediate |
| Ammo Type Splitting | UnityInventory | COMPLETE | Intermediate |
| Refinery Auto-Feed | UnityInventory | COMPLETE | Basic |
| Assembler Auto-Feed | UnityInventory | COMPLETE | Basic |
| Component Auto-Queue | UnityInventory | COMPLETE | Advanced |
| Ore Requirement Calc | UnityInventory | COMPLETE | Advanced |
| H2/O2 Bottle Auto-Craft | UnityInventory | COMPLETE | Advanced |
| Miner Ore Pull | UnityInventory | COMPLETE | Intermediate |
| RouteItem Fallback | UnityInventory | COMPLETE | Intermediate |
| Multi-Assembler Recycling | UnityInventory | COMPLETE | Expert |
| S-10 Ammo Special Routing | UnityInventory | COMPLETE | Advanced |
| Production Quota Management | UnityInventory | COMPLETE | Advanced |
| Recycling Excess Guards | UnityInventory | COMPLETE | Advanced |
| FeedAssemblers Mode Check | UnityInventory | COMPLETE | Intermediate |
| Ammo LCD Sign Display | UnityInventory | COMPLETE | Intermediate |

### Missile Construction

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Piston-Based Printer | UnityPad | COMPLETE | Advanced |
| Projector Integration | UnityPad | COMPLETE | Intermediate |
| Print State Machine | UnityPad | COMPLETE | Advanced |
| Build Progress Tracking | UnityPad | COMPLETE | Intermediate |
| Stuck Detection | UnityPad | COMPLETE | Advanced |
| Auto-Resume on Recompile | UnityPad | COMPLETE | Expert |
| Bill of Materials Display | UnityPad | COMPLETE | Intermediate |
| Missing Components Calc | UnityPad | COMPLETE | Advanced |

### Launch Operations

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| State Machine (11 states) | UnityPad | COMPLETE | Advanced |
| T-Minus Countdown | UnityPad | COMPLETE | Basic |
| Merge Block Docking | UnityPad | COMPLETE | Basic |
| Fuel Transfer | UnityPad | COMPLETE | Intermediate |
| Ammo Loading | UnityPad | COMPLETE | Intermediate |
| Missile Systems Enable | UnityPad | COMPLETE | Intermediate |
| Missile Systems Disable | UnityPad | COMPLETE | Intermediate |
| Warhead Arming Sequence | UnityPad | COMPLETE | Intermediate |
| Launch Separation | UnityPad | COMPLETE | Basic |

### Mass Operations (Controller)

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Multi-Pad Controller Mode | UnityPad | COMPLETE | Expert |
| Copy Target to All | UnityPad | COMPLETE | Intermediate |
| Build All Command | UnityPad | COMPLETE | Intermediate |
| Arm All Command | UnityPad | COMPLETE | Intermediate |
| Launch All Command | UnityPad | COMPLETE | Intermediate |
| Salvo Mode (Staggered) | UnityPad | COMPLETE | Advanced |
| Carpet Bomb Patterns | UnityPad | COMPLETE | Expert |
| Kill All Auto-Attack | UnityPad | COMPLETE | Expert |
| Abort All Command | UnityPad | COMPLETE | Intermediate |

### Safety Systems

| Skill | Script | Status | Complexity |
|-------|--------|--------|------------|
| Warheads Safe During Climb | UnityMissile | COMPLETE | Basic |
| Distance-Based Arming | UnityMissile | COMPLETE | Intermediate |
| Stuck Detection Detonation | UnityMissile | COMPLETE | Intermediate |
| Proximity Detonation | UnityMissile | COMPLETE | Basic |
| Satellite No-Explode | UnityMissile | COMPLETE | Basic |
| Countdown Safety | UnityPad | COMPLETE | Basic |
| PB ABORT Command | UnityPad | COMPLETE | Intermediate |
| Boot Session Verification | UnityMissile | COMPLETE | Advanced |
| Auto Fire Mode | UnityPad | COMPLETE | Intermediate |

---

## By Complexity

### Basic (Learn First)

Foundational features - must work for system to function.

- GPS Targeting
- Manual Flight Mode
- Remote Detonation
- Position Broadcasting
- Menu Navigation
- Tag-Based Discovery
- Merge Block Docking
- T-Minus Countdown
- Progress Bars
- Proximity Detonation

### Intermediate (Core Features)

Standard operational capabilities.

- Antenna Signal Tracking
- Sensor Proximity Mode
- Zero-G Space Flight
- IGC Telemetry
- Blackout Detection
- Setup Wizard
- Pad/Missile Block Scanning
- Container Routing
- Fuel/Ammo Transfer
- Build Progress Display
- Beacon Broadcasting

### Advanced (Power User)

Complex features for advanced operations.

- LIDAR Camera Raycast
- ICBM Ballistic Profile
- Reentry Phase Handling
- Multi-Pad Coordination
- 10-Panel LCD System
- Power History Graphs
- Piston Printer System
- Component Auto-Queue
- Ore Requirement Calc
- Salvo Launch Mode
- Miner Fleet Tracking

### Expert (Full Mastery)

System integration and automation.

- Satellite Relay Network
- Multi-Pad Controller Mode
- Carpet Bomb Patterns
- Kill All Auto-Attack
- Print Auto-Resume
- Full Inventory Automation

---

## By Priority

### Critical (System Won't Work Without)

| Skill | Why Critical |
|-------|--------------|
| GPS Targeting | Primary targeting mode |
| State Machine | Controls all pad operations |
| Block Scanning | Detects missile/pad components |
| Fuel Transfer | Missiles need fuel |
| Launch Separation | Obviously |
| Warhead Safety | Don't blow up on pad |

### Important (Core Experience)

| Skill | Why Important |
|-------|---------------|
| All Targeting Modes | Flexibility in combat |
| IGC Telemetry | Know where missiles are |
| LCD Display System | User feedback |
| Printer Integration | Auto-build missiles |
| Container Routing | Keep inventory organized |
| Multi-Pad Support | Scale operations |

### Nice-to-Have (Quality of Life)

| Skill | Benefit |
|-------|---------|
| Power Graphs | Visual monitoring |
| Carpet Bomb Patterns | Tactical options |
| Satellite Relay | Extended range |
| Miner Fleet Tracking | Base management |
| Auto-Attack Mode | Hands-free defense |
| H2/O2 Auto-Craft | Survival convenience |

---

## Dependency Graph

```
                    ┌─────────────────┐
                    │  Block Scanning │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────┐
    │ Pad Blocks  │  │ Missile Blocks│  │ Printer     │
    └──────┬──────┘  └───────┬───────┘  └──────┬──────┘
           │                 │                 │
    ┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────┐
    │ State       │  │ Fuel Transfer │  │ Auto-Build  │
    │ Machine     │  │ Ammo Load     │  │ System      │
    └──────┬──────┘  └───────┬───────┘  └─────────────┘
           │                 │
           └────────┬────────┘
                    │
             ┌──────▼──────┐
             │   LAUNCH    │
             └──────┬──────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
 ┌──────▼──────┐ ┌──▼──┐ ┌──────▼──────┐
 │ GPS Target  │ │CLIMB│ │ Telemetry   │
 │ Antenna     │ └──┬──┘ │ Broadcast   │
 │ Sensor      │    │    └─────────────┘
 │ LIDAR       │ ┌──▼──┐
 └─────────────┘ │ ARM │
                 └──┬──┘
                    │
              ┌─────▼─────┐
              │  TARGET   │
              │ (Guidance)│
              └─────┬─────┘
                    │
              ┌─────▼─────┐
              │ DETONATE  │
              └───────────┘
```

---

---

## 🏛️ LEGACY: Unity Missile System (UMS) — Final Shipped State

> The table below is the **complete shipped state of the LEGACY Unity Missile System (UMS) project** — the Space Engineers Programmable Block project that this repository was originally before pivoting to SMoL on 2026-05-09. **It is preserved as canonical math reference for SMoL's colony-ship trajectory math** (see `_ums-reference/`). The 101/101 figure refers to the UMS C# scripts' final state, NOT to SMoL features.
>
> **For SMoL's actual shipped state, scroll to the top: 🎯 SMoL Implementation Snapshot.**

### UMS Feature Status Summary (legacy — 101 features in 11 categories)

| Category | Total | Complete | Pending |
|----------|-------|----------|---------|
| Boot & System Init | 8 | 8 | 0 |
| Guidance & Navigation | 10 | 10 | 0 |
| Communication | 8 | 8 | 0 |
| Display & UI | 10 | 10 | 0 |
| Block Detection | 7 | 7 | 0 |
| Signal Controller | 7 | 7 | 0 |
| Inventory | 16 | 16 | 0 |
| Construction | 8 | 8 | 0 |
| Launch Operations | 9 | 9 | 0 |
| Mass Operations | 9 | 9 | 0 |
| Safety Systems | 9 | 9 | 0 |
| **UMS TOTAL** | **101** | **101** | **0** |

These 101 features port 1:1 into SMoL's TypeScript implementation (trajectory math, pad state machine, salvo stagger, telemetry channels). Port progress lives in the SMoL Implementation Snapshot above. UMS source deletion is gated on full SMoL completion + post-playtest verification (PHASE 15).

### UMS Future Possibilities (carried forward into SMoL as design seeds)

Things UMS didn't implement that became SMoL ship-variant or tech-tree design intent:

- Spiral approach patterns for evasion → **SMoL ship variant: 'spiral' guidance mode**
- Terminal guidance correction → **SMoL Tier 2 tech: 'Terminal Guidance Correction'**
- Multi-target sequencing → **SMoL salvo controller mode (auto-fire round)**
- Decoy deployment → **SMoL Decoy colony-ship variant (Tier 2)**
- EMP payload mode → **SMoL Saboteur ship payload type (Tier 3)**
- Formation flying → **SMoL counter-colony-ship intercept geometry**
- Return-to-base abort → **SMoL ABORT command on all flights**
- Damage assessment telemetry → **SMoL FlightDetailPanel post-impact log**
- Fuel efficiency optimization → **SMoL fuel-remaining → AoE damage scaling**
- Adaptive guidance switching → **SMoL 6 targeting modes with mode-specific dispersion**

---

*Unity AI Lab*
*"The propaganda layer was never broken — it just got prettier as the actions got worse."*
