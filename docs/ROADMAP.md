<div align="center">

# 🗺️ Starship Made of Lies — Roadmap

### *The full intended game design, phase by phase.*

</div>

---

This roadmap describes **the complete intended game**, not the current implementation snapshot. Each phase is a contiguous design slice. Active per-phase implementation progress + sub-task tracking lives in `.claude/TODO.md`. Honest implementation-state-vs-design-intent breakdown lives further down this doc in the **Implementation Lattice** section.

```
   ╔═════════════════════════════════════════════════════════════╗
   ║   THIS ROADMAP DESCRIBES THE GAME WHEN FINISHED.            ║
   ║   Not the current build. Not the alpha. The vision.         ║
   ╚═════════════════════════════════════════════════════════════╝
```

---

## 🎯 Vision Statement

A real-time, multi-hour, planet-scale strategy game where every "starship" your government launches is actually a colony-ship-shaped missile. Your citizens believe they're going to new worlds. Your propaganda gets prettier as your actions get worse. The galaxy belongs to whoever tells the prettiest lie.

**Single TypeScript codebase shipped to web + desktop (Tauri Win/Mac/Linux) + mobile (Capacitor iOS/Android). Real-time multiplayer 1–12 players. 100–1000 planets per match. 10–24 hour match length. True 3D x,y,z Three.js universe with continuous LOD from galactic scale down to surface emoji buildings.**

---

## 📈 Current Implementation Snapshot (2026-05-12)

```
   ╔═════════════════════════════════════════════════════════════╗
   ║   Code-review fixes (3 super-reviews shipped): 100% ✓       ║
   ║   Core game loop (build→economy→launch→win):  ~92%          ║
   ║   UMS-faithful immersion (panels, UI):        ~98% (17.J/L) ║
   ║   PHASE 0 design contract enforcement:        ~88% (17.L)   ║
   ║   Multiplayer + sign-in foundation:           ~65%          ║
   ║   Ready-to-sell business surface:             ~70%          ║
   ╚═════════════════════════════════════════════════════════════╝
```

**Working today (verified against source 2026-05-13 late):** build emoji buildings on planet hex tiles with sim-side tech-prereq enforcement (`placeBuildingCanonical` fails locked builds with `🔒 Can't build X — research Y first`) AND engineering-progression gating (`Empire.everBuiltBuildings` tracks "ever built" per civ; TECH_ORBITAL_MECHANICS + TECH_ANTIMATTER + TECH_FUSION_PROPULSION require BLDG_LAUNCH_PAD built first; `TechDetailPanel` surfaces the specific missing building) · per-tile building inspect panel (click any built tile in default mode → category + slots + build time + buildCost + per-tick inputs/outputs + Demolish button) · demolish-recycle tool with 100% buildCost refund + red BuildPicker toggle + special handling for LaunchPad / MineField / CivicCenter · planet-level economy (33 resources in `shared/src/sim/resources.ts`, 29 buildings in `shared/src/sim/building.ts`, drift-gated production catalog with `validateBuildingProductionCatalog`) · 6 baseline-buildable buildings without any tech: Farm / Aqueduct / Home / Research Lab / School / Solar Array · Lab is a pure baseline research producer (no resource intake — Lab burning electronics was soft-locking the only path to its own resource) · production tick pre-checks tech-locked outputs so a Factory pre-Assembly Line / Foundry pre-Metallurgy idles cleanly instead of waste-burning inputs · Disassembly mode also drips `0.00001` research points per recovered resource unit into the civ pool · pre-built starter economy on every civ home planet (6 Farms + 3 Aqueducts + 4 Homes + 1 Lumber Camp + 1 Quarry + 1 Solar Array + 2 Labs) placed via farthest-point spread sampling so they distribute across the planet sphere instead of clustering on one icosphere face patch · 30-pt research pool seed at match start · resource stocks scale freely to 1 billion (universal cap; no tier-multiplier clamping) and the top toolbar always renders +/- per-tick deltas (sub-1 magnitudes included via `formatRate()`) with chip spacing sized for 10-digit numbers · top toolbar shows live research pool + per-tick accrual rate alongside resource counters · workforce sliders (food/industry/research/propaganda/military) · launch colony ships at enemies · 6 targeting modes (GPS / ANTENNA / SENSOR / LIDAR / MANUAL / SATELLITE) · counter-colony-ship interception · mine fields · 19 colony ship variants in `shared/src/sim/colony-ship.ts` · 61 tech nodes in `shared/src/sim/tech.ts` (including `TECH_SELF_DESTRUCT_SYSTEMS`) · 20 government themes in `shared/src/sim/themes.ts` · indigenous civilizations · 4 AI difficulty levels × 4 playstyle archetypes (builder / warmonger / researcher / trickster) · solar-system clustered galaxy with 4× star scale + collision-free wrap-aware placement · spectral-class stars (O/B/A/F/G/K/M) · outpost-driven mining-ship economy with NO_SIGNAL crawl-home · fog of war (host-toggleable) · 11-LCD telemetry rack · Auto-Fire salvo orchestrator · god-control mid-flight redirect · draggable / position-persisted panels · unified top toolbar (every resource + 5-tier citizen breakdown) · Reset Layout · Planet Energy panel · Battery Bank + Fission/Fusion/Antimatter reactor buildings · reactor-class colony ships consume tier-specific radioactives at launch · reactor mid-flight fuel drain → STRANDED phase · Citizens panel with ship-duty sliders driving the volunteer pool · modular 8-slot ship builder · saved-blueprints library · blueprint→print→launch wiring (`ColonyShipFlight.customBuild` + `synthesizeCustomDef`) · LaunchManifestModal drag-allocate crew + cargo UI · TrackingCameraPanel · ProductionChainsPanel · QuotasPanel (per-resource quota sliders + per-building production-mode toggle with auto / paused / disassembly) reads + writes live Maps every render (useMemo trap dropped) · auto-recycle on excess · save / load via `serializeMatch` / `deserializeMatch` (JSON Map/Set tagging) · BootSequencePanel gates `/play` entry and the check list auto-scrolls to keep the live OK-registered item in view · Settlements V1 (founding + picker UI; full per-settlement inventory bifurcation remains aggregate-share approximation per user decision).

**PHASE 17.J complete (11 of 11 sub-tasks shipped on `main`).** Blueprint→print→launch wiring closed in commit `91efe1c8` — `ColonyShipFlight.customBuild` synthesizes a flight def from blueprint stats overlaid on the base variant.

**PHASE 17.L close-out shipped (PHASE 0 design contract honoring — three super-review passes):** citizen tier-gate enforcement at launch (`padCitizenMixSatisfiesShip`) · reactor mid-flight fuel drain → STRANDED state · `BATTERY_BANK_CAPACITY = 500` stockpile cap · brownout-driven build pause + utility auto-disable · workforce reserved-pool via `shipDutyReservedPool()` · player-pickable base variant in Ship Builder · drag-allocate crew + cargo manifest (`LaunchManifestModal.tsx`) · tracking-camera panel · production-chain Sankey panel · UMS quotas + auto-recycle · host-configurable save/load · boot ceremony fullscreen gate before `/play` unlock · settlements V1 with capital/colonizing/ruined status + boundary tints · Self-Destruct Systems tech node + flight-gate.

**Layer D shipped 2026-05-12 (3 atomic cascades on `main`):** multiplayer client wired to real `colyseus.js` (`Client.joinOrCreate('smol_match', {token})`) · server matchmaking endpoint validates Bearer tokens via lookup (no `startsWith` heuristic) · `POST /api/auth/guest` mints UUIDv4 guest tokens server-side · cinematic UI text overlay with 5 mood states · replay snapshot ring buffer (50 entries × 60-tick interval ≈ 10 min @ 1×) · diplomacy resolver (`canTradeBetweenCivs` / `canShareIntelBetweenCivs` / `isHostileBetweenCivs`) · i18n catalog with 11 locale slots + LTR/RTL flip (translator content English-only per user; non-English slots fall back to English) · touch gestures (one-finger rotate, two-finger pinch zoom, two-finger pan) · GPU vertex-shader dust particles (10k) · volumetric `FogExp2` scaled to universe extent · GitHub + Discord OAuth providers · `FileAccountStore` + `PostgresAccountStore` adapters (Postgres via optional `pg`).

**PHASE 17.L.D shipped 2026-05-13 (tech gating + starter economy hardening + UX/economy stabilization, 17.L.D.10 through 17.L.D.21):** pre-built starter buildings on every civ home planet (6 Farms + 3 Aqueducts + 4 Homes + 1 Lumber Camp + 1 Quarry + 1 Solar Array + 2 Labs) placed via farthest-point spread sampling across the planet sphere · 30-pt research pool pre-seeded so Industrial Logistics is one tick-1 click away · starter resource amounts bumped for breathing room (planks 200→300, bricks 50→120, components 60→120, electronics 25→60, wood 80→200, stone 80→200) · sim-side tech-prereq gate added to `placeBuildingCanonical` (was missing entirely) · engineering-progression gating wired (TECH_ORBITAL_MECHANICS / TECH_ANTIMATTER / TECH_FUSION_PROPULSION require BLDG_LAUNCH_PAD built first; `Empire.everBuiltBuildings` Set + `TechNode.requiredBuildings` field + `meetsBuildingRequirements()` check) · `TECH_GATED_BUILDINGS` refactored to derive from `TECH_NODES` (Cathedral / Apartment / Reactor Fission / Reactor Fusion / Reactor Antimatter / Battery Bank / God Control all properly gated) · Cathedral now gated by Mass Communication, Apartment by Heavy Industry · Research Lab ungated to baseline-buildable + Lab cost changed from bricks + electronics to planks + bricks · Lab no longer consumes electronics per tick (was soft-locking the only research path to its own resource) · production tick pre-checks tech-locked outputs so buildings idle cleanly without waste-burning inputs · disassembly mode also drips `0.00001` research points per recovered unit · per-tile building inspect panel (click any built tile → see stats + Demolish button) · demolish-recycle with 100% buildCost refund + red BuildPicker toggle · QuotasPanel + TechDetailPanel + ShipBuilderPanel useMemo traps fixed (mutable-Map deps never re-fired; Mass Comm researched but Warning System stayed locked, sliders snapped to stale values — all live now) · QuotasPanel numeric input step 100→1 · top toolbar `🔬 N pts · +M/t` research-pool counter · resource stocks scale freely to 1 billion · always-visible per-tick deltas (sub-1 magnitudes included via `formatRate()` which handles negatives; `formatNumber` adds B-suffix) · resource chip spacing sized for 10-digit numbers (flex-wrap enabled) · NewGamePage UI hotfix (CSS popover tooltips + visible inactive tabs + inline field hints) · research-accrual fractional-points fix (was floored to 0 before pool deposit) · BootSequencePanel check list auto-scrolls to the live OK-registered item · Wiki rewrite of Mechanics + Themes + Tech tree sections (29 buildings / 6 baseline / 61 tech nodes / 19 colony ships with reference mode for full-catalog Wiki view).

**Audio asset drop-in scaffold (2026-05-12):** `client/public/assets/themes/<slug>/<kind>/SPEC.md` for 80 theme tracks (20 themes × 4 kinds: ambient / tense / victory / defeat) + `client/public/assets/sfx/<event-id>/SPEC.md` for 20 SFX events. Each SPEC.md specifies exact filename, mood, duration, LUFS loudness target, and OGG Vorbis q5/48kHz/stereo format. Regenerated via `node tools/generate-audio-asset-stubs.cjs`. Synth fallback continues to play until real audio files drop into the folders.

**Aspirational (user-side activation gates):** OAuth credentials for Google/GitHub/Discord/Apple (server scaffolds shipped; provider creds + redirect URI whitelisting required) · Postgres install + `DATABASE_URL` + run `server/sql/0001_accounts.sql` (client wired, blocked on install) · 1024-px hero icon source PNG (`tools/generate-icons.cjs` ready) · 80 real `.ogg` audio assets (drop-in folders + manifest ready) · Tauri keypair + Android keystore + Apple Developer cert for binary signing · Cloudflare Tunnel + DNS routes for public ingress. All gated on user-side execution per `EXTERNAL_BLOCKERS.md`.

**Still open (verified 2026-05-13 late):** build timers for every building — `placeBuildingCanonical` instant-places; parallel `buildingsUnderConstruction` Map + per-tick decrement + UI overlay still needed (multi-day refactor; `buildTimeTicks` field already on every def). Three-mode mining 'oneway' for planet-local — `shuttle-single` + `shuttle-multi` branch live in `mining-ship.ts`; `'oneway'` is in the type union but intentionally removed from planet-local at user's direction — decision pending whether to delete from the union or re-add for late-game depletion. Full per-settlement data-model bifurcation (separate inventory / workforce / population / faction per `Settlement`) — kept as proportional-share approximation per user. Forward-replay (re-tick from snapshot through events) — rewind exists but unused; forward path deferred. Per-government themed cinematic narration — 5 archetypal governments covered (Theocracy / Corporate / Surveillance / AI-Overlord / Military Junta); remaining 15 fall back to base copy. PlanetEnergyPanel useMemo trap (same pattern as QuotasPanel; display-only, lower-impact). Broader useMemo audit across `LaunchManifestModal` / `CommandPadPanel` / `BuildPicker` for mutation-aliasing.

Per-phase implementation progress + sub-task tracking lives in `.claude/TODO.md` (gitignored — proprietary workflow). Atomic-commit ship history lives in `.claude/FINALIZED.md`.

---

## 🌌 Game Pillars

```
   ┌──────────────────────────────────────────────────────────────┐
   │  PILLAR 1: Every starship is a missile                       │
   │            Every match is a story of slow corruption         │
   │            Propaganda layer is the dark-comedy hook          │
   │                                                              │
   │  PILLAR 2: True 3D universe — galaxy → planet → surface     │
   │            No 2D fallback, no hex game, no card game        │
   │            One Three.js scene, continuous LOD                │
   │                                                              │
   │  PILLAR 3: Every game-world entity is selectable + 3D-visible│
   │            Ships, mines, beacons, satellites, civilizations  │
   │            Click anything → full inspector panel             │
   │                                                              │
   │  PILLAR 4: Citizens have agency by tier                      │
   │            Only the propaganda-elevated volunteer to die     │
   │            Your investment in elevating them produces the    │
   │            death-ship pipeline                               │
   │                                                              │
   │  PILLAR 5: UMS canonical math, faithfully ported             │
   │            Every flight is server-authoritative              │
   │            Same seed → same outcome → multiplayer fair       │
   │                                                              │
   │  PILLAR 6: No caps on empire size                            │
   │            Unlimited planets + unlimited settlements/planet  │
   │            UI scales via per-planet collapsible dropdowns    │
   └──────────────────────────────────────────────────────────────┘
```

---

## 🛣️ Phase Map

The phases below are the **complete design slices** that constitute the full game. Phases are listed in design dependency order, not necessarily execution order.

```
                  ┌─────────── FOUNDATION ───────────┐
                  │                                  │
   PHASE 0  →  PHASE 1  →  PHASE 2  →  PHASE 3  →  PHASE 4
   UMS spec    Skeleton    Core sim    Tech tree   Governments
   extraction  scaffolds   data model              + themes
                  │                                  │
                  └─────────── ESCALATION ───────────┘
                  │                                  │
   PHASE 5  →  PHASE 6  →  PHASE 7  →  PHASE 8 / 16
   Deception   Colony      Telemetry   3D x,y,z
   + citizen   ships +     panels +    universe +
   tiers       defense     beacons     LOD blending
                  │                                  │
                  └─────────── DEPLOYMENT ───────────┘
                  │                                  │
   PHASE 9  →  PHASE 10  →  PHASE 11  →  PHASE 12  →  PHASE 13
   AI civs     Multiplayer  Persistence  Audio       Cross-platform
                  │                                  │
                  └─────────── POLISH ───────────────┘
                  │                                  │
   PHASE 14  →  PHASE 17–18  →  PHASE 15
   Launch      Mobile +        Final UMS
   readiness   replay +        nuke
               diplomacy +     (post-playtest)
               cinematics
```

---

## 🔬 PHASE 0 — UMS Reference Inventory & Extraction

**Goal:** Distill the canonical Unity Missile System source into structured spec docs so future implementation phases work from clean references instead of re-reading raw C#.

**Deliverables:**
- 12 `SMOL_REFERENCE_*.md` extraction docs covering: master map, pad subsystem, missile subsystem, inventory, boot, signal, beacon, graphs/panels, IGC protocol (19 channels), trajectory math, printing pipeline, mod reference, tooling.
- Preserve the entire UMS source tree in `_ums-reference/` as canonical math reference until PHASE 15 deletion.

---

## 🏗️ PHASE 1 — Project Skeleton

**Goal:** Stand up the monorepo with one TypeScript codebase shared across client/server/shared. Wire Vite + React + Three.js + Tauri + Capacitor + ESLint + Prettier + husky + WebSocket multiplayer.

**Components:**
- `client/` — Vite-built frontend with React UI shell + Three.js 3D scene
- `server/` — WebSocket multiplayer + persistence + AI process orchestration
- `shared/` — types, protocol messages, simulation rules (used by both)
- `assets/` — emoji manifests, per-government audio, sprite atlases

**Toolchain:** TypeScript strict mode (`exactOptionalPropertyTypes`), `tsc --noEmit` + `eslint --max-warnings 0` on every commit via husky.

---

## 🧮 PHASE 2 — Core Game Systems

**Goal:** Data layer for everything that lives in a match.

**Subsystems:**
- **Galaxy generation** — procedural placement of 100–1000 planets in 3D space, seeded RNG for deterministic re-rolls
- **Planet generation** — icosphere mesh subdivision per size tier (moon → small → standard → large → super), geodesic hex tile graph, biome assignment via lat/lon noise, hostility-tier-weighted resource node scatter
- **Tile + occupancy** — every tile has a centroid (x,y,z Vec3), normal, biome, neighbors, owner, occupancy (empty / building / launchPad / mine / mineField / counterMissilePad)
- **Resources** — emoji-driven, products only; per-planet inventory with **upgradeable capacity**; primary (extracted) + secondary (refined) + strategic + combat categories
- **Buildings** — every building has a category (production / housing / research / propaganda / defense / extraction), buildCost, buildTimeTicks, citizenSlots
- **Population + workforce** — 5-tier citizen population (Worker → Pinnacle), workforce sliders per planet, food + housing + happiness/subterfuge thresholds, priority sliders
- **Mining shuttles + resource nodes** — UMS-style auto-shuttle entities cycling DOCKED → OUTBOUND → DRILLING → INBOUND → OFFLOADING against discrete ResourceNode deposits

```
   Planet data flow:

   PlanetGenContext
        │
        ▼
   buildIcosphere(sizeTier)
        │
        ▼
   tiles[] — hex graph with centroid Vec3
        │
        ▼
   scatterResourceNodes(biome × hostilityTier)
        │
        ▼
   PlanetState — inventory + workforce + population + faction + beacon
```

---

## 🌳 PHASE 3 — Tech Tree

**Goal:** Future-only branching research with three classifications.

```
   TIER GATES
   ┌────────────────────────────────────────────────────────────┐
   │                                                            │
   │  🌐 Mainstream   → available to all civs via research      │
   │                                                            │
   │  🔒 Suppressed   → conquest-gated. Defeat enemy civ to     │
   │                     unlock their researched techs.         │
   │                                                            │
   │  ⛔ Forbidden    → heavy conquest gating. Late-game only.   │
   │                     Often government-locked (Theocracy     │
   │                     can't research Surveillance State's    │
   │                     Forbidden tech, etc.)                  │
   │                                                            │
   │  Tech apex requires ≥10 planets controlled — no solo       │
   │  runaway is possible.                                      │
   └────────────────────────────────────────────────────────────┘
```

**Tech effect categories:**
- Building production multiplier
- Propaganda power multiplier
- Ship variant unlocks (gates Tier 2/3/4 ship designs)
- Defense effectiveness (mine field detonation count, counter-ship intercept geometry)
- Citizen tier-promotion cost reductions
- Targeting mode unlocks (GPS / ANTENNA / SENSOR / LIDAR / MANUAL / SATELLITE)
- Trajectory math features (predictive intercept, spiral approach, evasion patterns)

Conquering enemies grants their research + their stockpiles. Tech tree must be **fully built out** to fit the 10–24h match arc — early-game research unlocks Tier 2 ships, mid-game unlocks Tier 3, late-game unlocks Tier 4 + Forbidden tech.

---

## 🏛️ PHASE 4 — Government System

**Goal:** 15+ rolled-per-civ governments, each shipping a complete sensory + behavioral overlay.

**Per-government assets:**
- CSS-variable UI skin (color palette + iconography + typography)
- 4 audio tracks (ambient + tense + victory + defeat) + per-government UI SFX
- Propaganda flavor text for every UI string, dialog, notification, event log message
- Building emoji variants (Theocracy school = ⛪; Corporate school = 🏢)
- Diplomacy gating + AI personality biases

**Governments at launch (15+):**

```
   🛐 Theocracy            👁️ Surveillance State    💼 Corporate Dictatorship
   🧬 Eugenics Utopia      🤖 AI-Overlord            💰 Anarcho-Capitalist
   🎭 Memetic Cult         🌡️ Climate-Refugee        👑 Hereditary Monarchy
   🌱 Eco-Cult              ⚙️ Mecha-Stalin          🏴 Anarcho-Punk
   🔬 Tech-Authoritarian   🎰 Casino-State          🏰 Feudal-Economy
   ...
```

**Per-government "The Chosen" framing** drives the citizen-tier system: Theocracy = "Most Holy Pilgrims", Corporate = "Platinum-Tier Subscribers", Surveillance = "Perfect Social Credit Citizens", etc.

User-facing label is **"Government"** (not "Theme"). Internal TS type may stay `Theme` for dev jargon.

---

## 🎭 PHASE 5 — Deception, Subterfuge & Citizen Tiers

**Goal:** The dark-comedy hook. Propaganda + faction split + citizen tier promotion + "manufacturing volunteers" pipeline.

**Faction split per planet:**
- Loyal % — believes the propaganda, contributes full production + accepts campaigns
- Skeptic % — production multiplier penalty + slight subterfuge generation
- Dissident % — significant subterfuge + can sabotage buildings if grows past threshold

**Active campaigns** (multi-phase propaganda events):
- "Sacred Pilgrim Selection" / "Premium Rewards Drive" / "Top-Performer Recognition" / etc.
- Each archetype shifts faction split + tier promotion rates while active
- Theme + government modify campaign cost + effectiveness

**Citizen tier promotion:**
- Indoctrination buildings (Cathedral / University / Re-education Center / Corporate Promotions Office — theme-flavored)
- Direct promotion costs faction-loyalty currency
- Tier 5 ("The Chosen") is the scarce strategic resource — only 1% of any population
- Promotion rates scale with techPromotionMultiplier + activeCampaign bonuses

**The pipeline:**
```
   60% Worker  ─propaganda─→  25% Skilled  ─indoctrination─→  10% Privileged
                                                                    │
                                                              campaign + tech
                                                                    ▼
                                                                4% Elite
                                                                    │
                                                              direct promotion
                                                                    ▼
                                                            1% Pinnacle "Chosen"
                                                                    │
                                                            volunteers eagerly
                                                                    ▼
                                                           🕊️ Pilgrim Volunteer
                                                              one-way trip
```

---

## 🚀 PHASE 6 — Colony Ship System

**Goal:** UMS UnityPad + UnityMissile carryover. Full state machine, salvo stagger, six targeting modes, build phase machine, payload variants.

### Pad state machine (UMS UnityPad carryover)

```
   INIT → IDLE → PRINT → BUILD → DOCK → FUEL → AMMO → READY → ARM → LAUNCH → GONE
                  │                                                              │
                  └──────────────────────── ABORT ─────────────────────────────  │
                                                                                  │
                                                       BUILDALL ◀── controller mode loops back
```

Every state has visible 3D treatment on the pad's surface tile:
- PRINT — amber printer-arm scaffold
- BUILD — yellow cone growing taller as build progresses
- DOCK → FUEL → AMMO — loading rings
- READY — green steady glow
- ARM — red urgent pulse (~110ms)
- LAUNCH — white flash + cone lifts off
- GONE — empty pad with smoke haze

### Flight phase machine (UMS UnityMissile carryover)

```
   CLIMB → COAST → REENTRY → TARGET → DETONATE
                                            │
                                  ┌─────────┴─────────┐
                                  │                   │
                             TARGET_HIT          PROBABLE_HIT
                                                       OR
                                                  SIGNAL_LOST

   Alternate branches:
   ─ INTERCEPTED (mine field or counter-ship)
   ─ ABORTED (player self-destruct)
   ─ CRASH_LANDED (gear failure)
   ─ SAT_CLIMB → SAT_BRAKE → SAT_HOLD → SAT_INTERCEPT (orbital tier)
```

**Outcome math:** server-authoritative + deterministic per seed. fnlDTT (final distance to target) maps to outcome per UMS spec — `<100u → TARGET_HIT`, `<500u && phase=TARGET → PROBABLE_HIT`, else `SIGNAL_LOST`. No RNG re-rolls between sessions.

### Six targeting modes

```
   GPS       direct waypoint, base accuracy
   ANTENNA   radar-guided, mid accuracy
   SENSOR    proximity-locked terminal-phase
   LIDAR     high accuracy, short range
   MANUAL    player-flown camera-view
   SATELLITE orbital handoff, longest range
```

### 18+ colony ship variants — see README §🛸 Colony Ship System

### Self-destruct on all ships + AoE damage scaling

Every ship can be aborted in-flight. Self-destruct AoE damage scales with `fuelRemaining + payloadType + (suicide × citizens × 2)`. Balance target: **30–50 missiles to wipe a multi-planet civilization**.

### Multi-pad controller mode (UMS UnityPad carryover)

- One pad per planet is designated controller via `SETPADCONTROL`
- Mass-action buttons: `BUILDALL` / `ARMALL` / `LAUNCHALL` / `ABORTALL` / `COPYTGT`
- Targeted salvo stagger: 15s interval between launches per pad
- Auto-fire salvo round orchestrator: `BUILDALL → wait → ARMALL → wait → LAUNCHALL` one-click

### Defense

- **Mine fields** — pre-placed tile defense, detonationRadius scales to planet radius, 3 detonations per mine
- **Counter-Colony Ships** — interceptors, launch geometry solved against attacker's great-circle arc, proximity-detonate

---

## 📡 PHASE 7 — UMS Telemetry Carryover

**Goal:** Full 11-LCD telemetry rack + planet beacon + signal hub + multi-civ camera display.

### 11-LCD numbered panel rack (UMS UnitySignal carryover)

```
   ┌──────────────────────────────────────────────────────────────┐
   │  Slot 1  — CONTROL          Slot 2  — BUILD STATUS           │
   │  Slot 3  — SHIP SYSTEMS     Slot 4  — INV CYCLE (7-tab)      │
   │  Slot 5  — POWER             Slot 6  — GRAPHS (12-graph cycle)│
   │  Slot 7  — FLIGHT COMMS      Slot 8  — MISSILE STATUS         │
   │  Slot 9  — FLEET READINESS  Slot 10 — MINER DETAIL            │
   │  Slot 11 — PERSONAL EQUIP                                    │
   └──────────────────────────────────────────────────────────────┘
```

### Planet beacon (UMS UnitySignal carryover)

Per-planet alert log: incoming hostile / outgoing launch / impact detected / intercept success / colony established / etc. Live ring buffer of 50 alerts. Powers the 3D LAST HOPE alarm halo when civ enters near-collapse.

### Signal hub (UMS UnitySignal carryover)

- Antenna management (radio + laser link tracking)
- Laser targeting (auto-assigns lasers to flights via UNITY_MSL telemetry)
- Satellite constellation tracking (orbital weapon platform handoff)
- Camera display (local + missile-onboard + miner-onboard cameras)

### Per-planet UI panels

Every per-planet panel uses **collapsible dropdowns per planet** to scale to 100+ planet late-game. Flat cross-planet lists are forbidden — they don't scale.

```
   ▼ Planet Alpha (🌍 Theocracy)
     ├─ Resources: 🌾 5000  ⛏️ 2000  ⚡ 800  ...
     ├─ Population: T1: 600  T2: 250  T3: 100  T4: 40  T5: 10
     ├─ Faction: Loyal 70%  Skeptic 25%  Dissident 5%
     └─ Buildings (12): ...
   ▶ Planet Beta (🌍 Corporate)
   ▶ Planet Gamma (🌍 Surveillance)
   ...
```

---

## 🌌 PHASE 8 / 16 — True 3D Universe

**Goal:** ONE Three.js scene from galactic scale down to surface emoji buildings. Continuous LOD blending. NO 2D fallback. NO hex-game UI. NO card-game UI.

### Layer stack (rendered in one scene)

```
   ┌─ Galactic sun (anchor at origin)                              ─┐
   ├─ Starfield (THREE.Points background)                           │
   ├─ Planet meshes (SphereGeometry, biome-colored)                 │
   ├─ Planet halos (additive Fresnel shader)                        │
   ├─ Owned-planet rings (golden pulse)                             │
   ├─ LAST HOPE alarm halos (orange-red pulse, civ near collapse)   │
   ├─ Owner-civ flag billboards (multi-civ stacks @ tile-cluster    │
   │  centroids — flags float over each civ's actual territory)     │
   ├─ Indigenous civ markers (red banner below planet)              │
   ├─ Flight arc cones (oriented along arc tangent + phase emissive)│
   ├─ Mining ship cones (oriented along travel direction)           │
   ├─ Beacon pulse rings (planet-alerts)                            │
   ├─ Mine field 💣 billboards (trigger envelope discs)             │
   ├─ Pad state glow rings (state-colored, on surface tile)         │
   ├─ Surface InstancedMesh per planet (hex tiles, biome-colored)   │
   ├─ Building meshes per tile (emoji billboards at zoom)           │
   ├─ Range overlay (toggle — current civ's launch range envelope)  │
   └─ Camera-handled raycaster (tile pick + flight cone pick)      ─┘
```

### Camera controls

```
   WASD      ──── pan camera around current focus
   QE        ──── rotate camera yaw
   wheel     ──── zoom in/out (logarithmic)
   shift     ──── speed multiplier (boost)
   pan/tilt  ──── small ZOOM-DEPTH-CUE on zoom-in for genuine 3D feel
```

**Surface tiles activate when camera distance < `surfaceRadius × 6`** — InstancedMesh is rendered with per-tile color tinting (owner civ tinge + biome base). Click any tile → places the active build (if buildMode is set) OR opens tile inspector.

**Clickable in-flight ships** — raycaster picks flight cone meshes BEFORE surface/planet picks. Click → opens FlightDetailPanel showing variant + crew + cargo + fuel-remaining + payload + closing speed + distance + phase + ETA + signal-lost + self-destruct button per UMS UNITY_MSL telemetry spec.

### Continuous LOD blending (PHASE 16.7)

Galaxy view ⟷ planet view is a **single camera ride**, not a modal toggle. As you zoom into a planet, the surface tiles fade in while the planet's overall mesh fades to an outline shell. Conversely, zooming out fades the surface back into the planet sphere.

### Fog of war (PHASE 16.8)

Per-civ discovery state on every planet. Tiles render with darkness overlay until scanned. Surface details (resources, buildings, occupancies) hidden until discovered. Re-fog applies if civ loses contact with a planet (e.g., satellite out of range).

---

## 🤖 PHASE 9 — AI Players

**Goal:** Personality × Difficulty AI civs run as background server processes.

### Personality archetypes

```
   🏗️ BUILDER       Production-focused, slow ship deployment, big stockpiles
   ⚔️ WARMONGER     Early ship aggression, rapid Tier 3-4 unlocks
   🔬 RESEARCHER    Tech apex focus, late but devastating power spikes
   🎭 TRICKSTER     Decoys + saboteurs + boarding ships, manipulates faction
```

### Difficulty mix

```
   EASY      Slow decisions, sub-optimal targeting, harmless sparring partner
              ── Will NOT win a 3-minute speedrun. The match is a 10-24h saga.
   MEDIUM    Reasonable opening, occasional mistakes
   HARD      Optimal tech paths, opportunistic intercepts
   BRUTAL    Lethal. Multi-planet conquerors. Won't make easy mistakes.
```

Per-difficulty playtest required after any balance touch. Easy AI is the floor; Brutal AI is the ceiling. The full game must remain playable + winnable at both.

---

## 🌐 PHASE 10 — Multiplayer Server

**Goal:** WebSocket-driven server-authoritative match rooms with persistent lobby + cross-civ message scaling.

```
   ┌─────────── LOBBY ────────────┐
   │  Host configures:            │
   │  ─ Galaxy size               │
   │  ─ Match length              │
   │  ─ AI slot mix               │
   │  ─ Win conditions            │
   │  ─ Biome distribution        │
   │  ─ Coop toggle               │
   │                              │
   │  Players join as either:     │
   │  ─ Google OAuth user         │
   │  ─ Anonymous Player N        │
   └──────────────┬───────────────┘
                  │
                  ▼ start match
   ┌──── MATCH ROOM (per match) ───┐
   │  ─ Authoritative MatchState  │
   │  ─ Tick scheduler            │
   │  ─ Per-civ snapshot delta    │
   │     broadcast                 │
   │  ─ Fog-of-war enforcement     │
   │  ─ Server-resolved outcomes  │
   │     (no client RNG)           │
   └───────────────────────────────┘
```

**Sign-in is optional everywhere — never gates play.** Anonymous walk-in auto-joins as Player N. Google OAuth grants cross-device progress + leaderboard placement. Sign-in is a benefit, not a gate.

---

## 💾 PHASE 11 — Persistence & Meta-Progression

**Goal:** Optional account, Hall of Champions, achievements, replay archive.

**Persistence stores:**
- `AccountStore` — user identity + preferences
- `LeaderboardStore` — real player rankings only (NO mock, NO fictional placeholders, NO dev names except AboutPage)
- `AchievementStore` — earned in match, persisted per account
- `FileSnapshotStore` — per-match state snapshots for replay reconstruction
- `MatchHistoryStore` — match outcomes + civs + duration + winning conditions

**Empty state law:** Every persistence-derived UX surface (achievements, profile stats, lifetime counts, leaderboards) renders **real data**. Empty state + zero counts before player plays. NO mock constants, NO fake injection.

---

## 🎵 PHASE 12 — Audio System

**Goal:** Per-government music library + universal SFX + adaptive mixer.

```
   PER-GOVERNMENT TRACK SET (4 tracks each × 15+ governments)
   ┌─────────────────────────────────────────────────────────┐
   │  ambient      ─── exploring, peaceful periods           │
   │  tense        ─── enemy detected, builds in mood        │
   │  victory      ─── conquest moment / Tier 4 ship launch  │
   │  defeat       ─── civ loses last planet / LAST HOPE     │
   └─────────────────────────────────────────────────────────┘

   UNIVERSAL SFX (cross-government)
   ─ Pad state transitions (PRINT / BUILD / READY / LAUNCH / etc.)
   ─ Flight phase transitions (CLIMB / TARGET / DETONATE / INTERCEPTED)
   ─ Combat impacts (mine intercept / counter-ship hit)
   ─ Beacon alerts (incoming hostile / impact detected)
   ─ UI clicks + hover states

   ADAPTIVE MIXER
   ─ Cross-fades between tracks based on threat level
   ─ Ducks ambient when SFX fires
   ─ Per-government UI SFX swapped on government roll
```

---

## 📱 PHASE 13 — Cross-Platform Packaging

**Goal:** Single TypeScript codebase shipped to web + desktop + mobile.

```
   ┌─ WEB ──────────────────┐
   │  Vite production build │
   │  Service worker cache  │
   │  PWA manifest          │
   └────────────────────────┘

   ┌─ DESKTOP ──────────────────────────────────┐
   │  Tauri (Win / Mac / Linux native binaries) │
   │  Auto-updater                              │
   │  Hardened CSP                              │
   │  Deep-link smol:// scheme                  │
   │  Signed installers per platform            │
   └────────────────────────────────────────────┘

   ┌─ MOBILE ────────────────────────────────────┐
   │  Capacitor (iOS .ipa + Android .apk/.aab)  │
   │  Touch UX adaptations:                     │
   │   ─ Pinch-zoom replaces wheel              │
   │   ─ Two-finger drag replaces WASD          │
   │   ─ Long-press replaces right-click        │
   │   ─ Bottom-sheet panels replace side panels│
   └────────────────────────────────────────────┘
```

---

## ✨ PHASE 14 — Polish & Launch Readiness

**Goal:** Surface polish + a11y + telemetry + balance tuning + edge cases.

**Polish surfaces:**
- WCAG AA palette audit per government
- Render quality presets (Low / Medium / High / Ultra) tied to LOD distances + shader complexity
- Modular ship piece-builder (head / body / engine / gear modular configurations)
- LAST HOPE evac state machine (multi-stage civ-near-collapse event)
- Indigenous AI on home planets (intra-planet warfare BEFORE inter-planet warfare)
- Crash-landing outcomes with cargo loot (early-game ships LACK landing gear → crash → other players loot)
- Telemetry pipeline (anonymized opt-in analytics)
- 5Hz tick rate baseline (configurable per match)

**Balance tuning targets:**
- Match length lands in **10–24h saga** band
- Easy AI doesn't win in 3 minutes
- 30–50 missiles wipes a multi-planet civ
- No solo runaway — tech apex requires ≥10 planets

---

## 🔧 PHASE 17 — Active Sub-Phases (in-flight as of 2026-05-11)

PHASE 17 subdivided into focused sub-phases during the post-16 super-review cycle. Each ships atomically and cascades to `main`.

```
   ╔═══════════ SHIPPED ═══════════════════════════════════════════╗
   ║  17.PRE  Camera/zoom unfuck — kill GalaxyView remount loop    ║
   ║  17.A    Fog of war HIDES planets + placeBuilding canonical    ║
   ║          + depth-cue bump (camera parallax registers)          ║
   ║  17.B    Economy plumbing — BUILDING_PRODUCTION audit +        ║
   ║          outpost-driven miners + balance-constants module     ║
   ║          + NO_SIGNAL crawl-home + match-length 1h/10h/24h     ║
   ║  17.I    Solar-system galaxy structure — Star entity + 4× star ║
   ║          scale + collision-free wrap-aware placement +         ║
   ║          spectral classes (O/B/A/F/G/K/M)                      ║
   ║  SR×1    Super-review remediation — 14 fixes (determinism,    ║
   ║          log-depth, NO_SIGNAL trigger, AI outpost branch,     ║
   ║          owner-flag distance fade, …)                          ║
   ║  SR×2    Super-review ROUND 2 — 16 follow-on fixes (shader     ║
   ║          chunks, O-class star/orbit collision, server AI       ║
   ║          mining context, indigenous fade, tilesById cache, …)  ║
   ║  17.J.1-3  Panel framework foundation — draggable panels +     ║
   ║           unified TopToolbar (resources + citizen tiers) +     ║
   ║           per-panel persistent open-state + Reset Layout       ║
   ║  17.J.6-8  Planet energy + Battery Bank + 3-tier reactor       ║
   ║           buildings (Fission/Fusion/Antimatter) tech-gated     ║
   ║  17.J.5  Reactor fuel loading at launch — tier-specific        ║
   ║           radioactives consumed from planet stockpile          ║
   ║  17.J.9-4-11  Citizens panel + ship-duty sliders + modular    ║
   ║           8-slot ship builder + saved blueprints library       ║
   ║  17.J.10  Per-launch blueprint→print→launch wiring             ║
   ║           (ColonyShipFlight.customBuild synthesizes a flight   ║
   ║           def from blueprint stats overlaid on base variant)   ║
   ║  17.K     Fog-of-war host toggle in New Game setup             ║
   ║  17.L.A.6 Citizen tier-gate enforcement at launch — suicide   ║
   ║           colony ships REFUSE non-tier-4-5 citizens aboard.    ║
   ║           Per SMOL_DESIGN_COLONY_SHIPS §9-NEW + user verbatim  ║
   ║           "citizens dont want to kill them selves but for the  ║
   ║           most high tiered/happy/statas we have".              ║
   ║  17.L.A.16 All ships abortable at any time. Pad-abort covers   ║
   ║           PRINT/BUILD/DOCK/FUEL/AMMO/READY/ARM/LAUNCH (was     ║
   ║           limited to FUEL onward). Counter-colony-ships no     ║
   ║           longer hide Abort — defender can self-destruct own   ║
   ║           interceptor. Per user verbatim "hold up now all      ║
   ║           ships have abort that can be triggered by the        ║
   ║           player at any time".                                 ║
   ║  17.L Round 1 — Energy economy chain (A.1 + A.2 + A.3 atomic) ║
   ║  17.L.A.2 Battery-bank fuel-stockpile cap (batteryCount ×     ║
   ║           BATTERY_BANK_CAPACITY + baseline). Surplus lost.    ║
   ║  17.L.A.3 Brownout building auto-disable (fuel-consuming      ║
   ║           buildings idle when surplus<0 AND stock≤0).         ║
   ║  17.L.A.1 Reactor mid-flight fuel drain → STRANDED. Reactor   ║
   ║           variants carry trip-length+buffer fuel; god-control ║
   ║           redirects + long detours can run out → STRANDED.    ║
   ║  17.L.A.4  Workforce reserved-pool enforcement — closes the   ║
   ║           17.J.9 double-count loop. New availableWorkers(pop)  ║
   ║           subtracts shipDutyReservedPool from worker pool.     ║
   ║           tickCivResearch now uses it — research labor drops   ║
   ║           when citizens are reserved for ship duty.            ║
   ║  17.L.A.17 Self-Destruct Systems tech + flight gate. New       ║
   ║           TECH_SELF_DESTRUCT_SYSTEMS (tier 1 industrial) +     ║
   ║           ColonyShipDef.selfDestructCapable derived flag +     ║
   ║           ColonyShipFlight.selfDestructInstalled per-flight    ║
   ║           gate. abortFlight refuses when no tech OR variant    ║
   ║           has no detonation hardware. Ships can otherwise      ║
   ║           only end via planet impact / crash / starvation /    ║
   ║           power-out / fuel-out / reactor end-of-life. Per      ║
   ║           user verbatim "research and installed on the ship    ║
   ║           before u can self destruct ships".                   ║
   ╚════════════════════════════════════════════════════════════════╝

   ╔═══════════ ACTIVE ═════════════════════════════════════════════╗
   ║  17.L     PHASE 0 / PHASE 17 design contract honoring          ║
   ║           (super-review 2026-05-11 found 13 LOCKED answers     ║
   ║           half-shipped or silently dropped — see TODO 17.L)    ║
   ║                                                                ║
   ║  17.L.A   P1 close-the-loop items:                             ║
   ║           · reactor mid-flight fuel drain → STRANDED           ║
   ║           · battery-bank fuel stockpile cap                    ║
   ║           · brownout building auto-disable                     ║
   ║           · workforce reserved-pool enforcement                ║
   ║           · player-pickable base variant in builder            ║
   ║           · drag-allocate crew + cargo UI at launch            ║
   ║           · crew + cargo preset persistence                    ║
   ║           · tracking-camera panel (Q13 LOCKED, never started)  ║
   ║           · Sankey production chains (Q14 LOCKED)              ║
   ║           · 3-mode mining (Q5 LOCKED, never started)           ║
   ║           · UMS quotas + auto-recycle (Q11 LOCKED)             ║
   ║           · save/load host-config (Q12 LOCKED)                 ║
   ║           · boot-ceremony /play fullscreen gate (Q9 LOCKED)    ║
   ║           · PHASE 17.13 multi-settlement-per-planet revival    ║
   ║                                                                ║
   ║  17.L.B   P2 polish: crew/cargo preview, multi-pad blueprint   ║
   ║           print, resize handles, NO TRUNCATION audit,          ║
   ║           profanity scrub, waypoint queue editor               ║
   ║                                                                ║
   ║  17.L.C   P3 design: mid-flight refuel, energy gating, planet  ║
   ║           summary popup, snap-to-grid, drag-bounds viz, perf   ║
   ║           index for empire-peak scale                          ║
   ╚════════════════════════════════════════════════════════════════╝

   ╔═══════════ DESIGNED, NOT YET IMPLEMENTED ══════════════════════╗
   ║  17.C    UMS feature restoration tail (pad polish + Sankey +   ║
   ║          save/load + tech-tree expansion to 60+ nodes + …)     ║
   ║  17.D    Auth overhaul tail (Discord/Apple/email-passwordless) ║
   ║  17.E    Multiplayer-at-scale + Mobile + Replay + Diplomacy +  ║
   ║          Cinematics + Localization (was PHASE 18)              ║
   ║  17.F    Star rendering polish (comet-debris fix — circular    ║
   ║          alpha mask, power-law distribution, twinkle)          ║
   ║  17.G    Planet surface terrain visuals (procedural texture    ║
   ║          per planet, clouds, terraforming visuals)             ║
   ║  17.H    Open-planet model (anyone builds on any planet,       ║
   ║          dominant civ gets naming rights, combat is colony-    ║
   ║          ship-only)                                            ║
   ╚════════════════════════════════════════════════════════════════╝
```

### PHASE 17.J — Detail (10/11 shipped, 1 still open)

User verbatim drives the spec (LAW #0 quote captured in `.claude/TODO.md` PHASE 17.J header):

> *"customize what part my ships use and what crew and supplies and the loading of ammunition and radioactives for reactors, build solar panels with fuel/battery/energy/reactor all that shit tracked in the UMS like panels, all panels are full draggable and moveable all over the screen by the user, HUD up display and quick panel toggle for all the panels, toolbar and resources at the top with citizens and its panel setting slider for work and ship duties"*

**Ship history (4 atomic commits on `feature/17.J-feature-richness`, cascaded to `main`):**

```
   55167940  17.J.1 + 17.J.2 + 17.J.3
             Panel framework — draggable panels with header drag handles,
             localStorage position persistence, click-to-raise z-index,
             bounds-clamp on load, unified TopToolbar showing every
             empire-aggregate resource + per-tick delta + 5-tier citizen
             breakdown + per-resource per-planet tooltips, persistent
             open-panels Set, Reset Layout button in HUD footer.

   5009c8c4  17.J.6 + 17.J.7 + 17.J.8
             Planet Energy panel (per-planet capacity / draw / surplus /
             battery fill bar / per-producer breakdown / brownout warning)
             + Battery Bank (utility, gated on Electric Power) + Fission
             Reactor (consumes rare metals → 8× a power plant) + Fusion
             Reactor (consumes fusion fuel → 16×) + Antimatter Reactor
             (consumes antimatter → 32×). Tech-gated on TECH_NUCLEAR_FISSION,
             TECH_FUSION_POWER, TECH_ANTIMATTER. ⚡ toolbar + Y hotkey.

   fc337b8a  17.J.5
             Reactor fuel loading at launch. ColonyShipDef gains
             reactorFuelType + reactorFuelAmount derived from powerSource +
             payloadTierRequired. launchShipFromPadAction validates planet
             stockpile + consumes the radioactive at liftoff or aborts the
             launch with an event message.

   bb301f36  17.J.9 + 17.J.4 + 17.J.11
             Citizens panel — empire-aggregate header + per-planet
             collapsible row with 5 ship-duty sliders per planet (0-100%
             per tier). PlanetPopulation gains shipDutyPercentByTier;
             volunteerPool() extended so reserved citizens from tier 1-3
             add to the tier 4-5 base. 👥 toolbar + N hotkey.

             Ship Builder — 8-slot picker (hull / propulsion / life support /
             landing gear / payload / sensors / weapons / comms) with live
             resolved stats + total cost + missing-tech warnings + validation.
             Saved blueprints persist to localStorage.v1; Load / Delete
             actions per saved blueprint. 🛠 toolbar + U hotkey.
```

**Open in 17.J:**

```
   17.J.10  Per-launch crew + cargo loading UI + quick-launch-from-blueprint
            integration. Blueprint LIBRARY is functional standalone; the
            LAUNCH flow still uses the COLONY_SHIPS catalog via the existing
            ShipBuildPanel. Wiring blueprints into the launch path needs
            either a "custom" ship category in ColonyShipFlight (new field
            customBuildStats) or a blueprint-id route through
            launchShipFromPad. Crew preset + cargo preset persistence
            extending the blueprint format also lands in this sub-task.
```

**Acceptance:** user playtests post-17.J and **CAN'T NAME a missing feature** from the original UMS-faithful immersion quote.

---

## 🔄 PHASE 17.E + Beyond — Late-Stage Expansion

**Goal:** Late-stage feature expansion building on the core game.

**Subsystems:**
- **Replay archive** — every match snapshot stored, playable forward/back at variable speed
- **Diplomacy mode** — coop alliances, peaceful trade routes via Embassy ships, treaty system
- **Events + Cinematics** — periodic galactic events (supernova / wormhole opens / Ancient Tech discovered), cinematic shot for Tier 4 launches + civ defeats
- **Localization** — i18n framework, top-10 language packs
- **Modding hooks** — government / ship variant / tech / building plugin API for community content

---

## 🗑️ PHASE 15 — Final UMS Nuke (Project-Completion-Gated)

**Goal:** Once SMoL is verifiably complete + post-playtest validated, delete the `_ums-reference/` preservation tree.

**Gate conditions (ALL must be true):**
- Full game vision shipped + verified
- Playtesting completed with documented outcome
- All player-reported issues resolved
- User confirms "the project is complete, nuke UMS"

**NOT calendar-gated.** Multi-month wait expected. UMS preservation is **not optional** until this gate clears.

---

## 📊 Implementation Lattice

```
   ╔════════════════════════════════════════════════════════════╗
   ║   Current implementation progress lives in two places:    ║
   ║                                                            ║
   ║   • `.claude/TODO.md`                                      ║
   ║       Granular sub-tasks per active phase. ~280+ entries. ║
   ║                                                            ║
   ║   • `.claude/FINALIZED.md`                                 ║
   ║       Atomic archive of completed phases + sub-phases.    ║
   ║       What shipped + when + how it was verified.          ║
   ║                                                            ║
   ║   These two files are workflow docs (gitignored from the  ║
   ║   public repo per the .claude/ IP-boundary policy).       ║
   ╚════════════════════════════════════════════════════════════╝
```

The phase order above is the **design dependency order**. Active execution order interleaves phases — for example, PHASE 16 (3D universe) ran in parallel with PHASE 17.0 (auth overhaul) once the foundation phases were stable. PHASE 15 (UMS nuke) executes dead last after every other phase verifies.

---

<div align="center">

*🪐 The roadmap is the lie. The game is the truth.*

**Made by Unity AI Lab.**

</div>
