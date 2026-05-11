<div align="center">

# 🌌 Starship Made of Lies

### *The galaxy belongs to whoever tells the prettiest lie.*

![Starship Made of Lies — Conquer the Galaxy](archive/Starship%20Made%20of%20Lies.png)

**A real-time, multi-hour, planet-scale strategy game where every "starship" your government launches is actually a colony-ship-shaped missile, your citizens think they're going to new worlds, the propaganda gets prettier as your actions get worse, and the player is the god in the sky.**

</div>

---

> *"Brave pioneers volunteer for the eternal voyage to new worlds!"* — your civ's propaganda
>
> *(Real translation: you've convinced the highest-status citizens that being launched as a one-way colony ship is the ultimate honor. They're eager to go.)*

---

## 🎯 The Pitch

```
           ╭─────────────────────╮          ╭─────────────────────╮
           │   Citizens see:     │          │   Player sees:      │
           │  "🚀 New worlds!"   │  ──vs──> │  "🎯 Target locked" │
           │  "🌟 Honor!"        │          │  "💥 Salvo armed"   │
           │  "🤝 Pilgrimage!"   │          │  "🏆 Civ wiped"     │
           ╰─────────────────────╯          ╰─────────────────────╯
                       │                                │
                       ╰──────── BOTH TRUE ─────────────╯
```

You start innocent — sending scout ships to map nearby planets. You end up running an industrial colony-ship pipeline aimed at every other civilization on the map. The **propaganda stays pretty** (or gets *more* pretty to compensate) while your **actions get more obviously horrible**. That's the dark-comedy joke. Citizens never chose their government — they were born into it.

**Win condition:** conquer the galaxy. Host-configurable combination of map control / tech apex / last-civ-standing / score.
**Session length:** **10–24 hour saga**. Not a 20-minute skirmish. Easy AI is a harmless sparring partner. Brutal AI will end your civ.
**Players:** 1–12 per match, mixed humans + AI in any ratio. Real-time. Server-authoritative. Per-civ fog of war.

---

## 🌍 The 3D Universe

This is a **true 3D x,y,z universe** rendered in a single Three.js scene. **Not a flat 2D hex-grid map. Not a card game. Not a top-down tile board with zoom levels pretending to be 3D.** The camera flies between solar systems through galactic space — one continuous Three.js scene with continuous LOD from galactic cluster down to surface emoji buildings, all in one camera ride.

**Subtle but important distinction:**
- The **WORLD LAYOUT** is a 3D cluster of solar systems — _no_ 2D hex map.
- Each planet's **3D spherical SURFACE** is divided into hex (and pentagon) tiles via an icosphere subdivision — that's the building-placement grid, wrapped onto the planet sphere. Click a tile → place a 🏘️ on it. The tiles are CURVED ON THE PLANET, not flat squares on a map.

```
        ZOOM-OUT                              ZOOM-IN
   ┌─────────────────┐                  ┌──────────────────┐
   │  ✨   *   *  ✨ │                  │     🏛   🏭   🌾  │
   │    🪐    *    🌍│   ──camera fly──>│   🏘  ⛪  🏘  🏘  │
   │  *   ☀   🪐  *  │                  │     🛐  🏰  ⛏   │
   │   *      *      │                  │   🏘  🏭  🏘     │
   └─────────────────┘                  └──────────────────┘
     Galactic scale                       Surface tile scale
     ── solar systems ──                  ── icosphere tiles ──
     • 14–143 stars, 4-10 planets each   • hex + pentagon tiles
       (100–1000 planets total)            wrapped onto sphere
     • Stars sized 4× galaxy's largest   • Emoji buildings per tile
       planet (LAW #0 2026-05-11)        • Multi-civ presence visible
     • Spectral classes O/B/A/F/G/K/M     • Owner flags at tile-cluster
     • Toroidal universe wrap at           centroids (multi-flag stack
       ±60000 units                        on contested planets)
     • Great-circle arc flights          • Mining outpost spawns
     • Owner-civ flag banners              build-it-don't-spawn miners
       (fade-with-distance readable)
```

**Galaxy structure:** the cluster is real solar systems. Each STAR has its own 4–10 planets orbiting at static offsets. Solar systems are placed with collision-aware rejection sampling so no two systems' bounding spheres overlap (wrap-aware distance). Same seed always produces the same galaxy.

**Controls:** `WASD` to move · `Q/E` to rotate · mouse-wheel to zoom · small pan + tilt on zoom-in for genuine 3D depth perception · `M` to switch between the 6 missile targeting modes (GPS / ANTENNA / SENSOR / LIDAR / MANUAL / SATELLITE).
**Surface tiles** activate as the camera enters a planet's atmosphere. Click a tile to place a building, scan resources, or inspect occupancy. Build-validation gives specific error messages: "❌ Not your tile" / "❌ Tile already has X" / "❌ Need 50 ingots (have 30)".
**Multi-civ planets** are first-class — every civ owning at least one tile gets a flag billboard above its **tile-cluster centroid**, so contested planets visibly show territory boundaries in 3D. Flags fade with camera distance: full opacity in the useful zoom band, invisible at galactic scale, gone again when you zoom past the planet's surface.
**Mining ships, in-flight colony ships, mine fields, pad-state glow rings, indigenous markers, LAST HOPE alarm halos, real stars** — all rendered as first-class 3D entities with HDR-emissive halos, never 2D overlays.
**Fog of war:** undiscovered planets are HIDDEN — the player sees only their home planet at match start. Other planets reveal as the player launches colony ships at them (attacker discovery) or as incoming attacks arrive (defender discovery).

---

## 🛸 The Colony Ship System

```
                       ╭─────────────────────────╮
                       │  Every "ship" is also   │
                       │   a self-destruct       │
                       │       weapon.           │
                       ╰─────────────────────────╯
                                  │
       ╔══════════════════════════╩══════════════════════════╗
       ║  Propaganda: "Pioneers volunteer for new worlds!"   ║
       ║  Truth:      Aimed at someone else's planet.        ║
       ╚═════════════════════════════════════════════════════╝
```

The colony-ship taxonomy is **tech-tier-gated** by a four-tier darkness progression. Propaganda gets prettier each tier. Actions get worse.

### 🌱 Tier 1 — Tests & Exploration *("Brave pioneers explore the cosmos!")*

| Ship | Citizens | What it does |
|------|----------|--------------|
| 🛰️ **Scout** | 1–3 | Auto-explores galaxy, marks planets seen, returns home with intel |
| 📡 **Surveyor** | 5–10 | Lands gently on uncontested planets, scans resources, sets up sub-colony |
| 🔬 **Probe** | 1 | One-way sacrifice scout — sends continuous data until destroyed |

### 🌍 Tier 2 — Discovery & Escalation *("Our colonists need new homes!")*

| Ship | Citizens | What it does |
|------|----------|--------------|
| 🚀 **Standard Colony** | 50–100 | Lands on enemy planet, citizens unaware they're invading |
| 🔦 **Laser-Targeting Beacon** | 10 | Becomes ground beacon — follow-up strikes hit with precision, bypass mines |
| 🎭 **Decoy** | 0 | No real citizens — absorbs counter-strikes so the real ones get through |
| 🤝 **Boarding** | 20–40 | Citizens are operatives — capture enemy buildings instead of colonizing |

### ⚔️ Tier 3 — Aggression & Industrial Warfare *("We must defend our way of life!")*

| Ship | Citizens | What it does |
|------|----------|--------------|
| 💣 **Saboteur** | 5 | Crashes "by accident" on enemy infrastructure |
| 💥 **Explosive** | 0 | High explosive yield — "carrying mining explosives for new world industry" |
| 🛳️ **Heavy** | 80 | Long-range, high-HP, slow — reaches planets normal ships can't |
| 🛡️ **Counter-Colony** | 5 | Defensive interceptor — meets incoming ships mid-flight |

### 🌌 Tier 4 — Industrial Eradication *("Volunteer pilgrims are our highest honor!")*

| Ship | Citizens | What it does |
|------|----------|--------------|
| 🕊️ **Pilgrim Volunteer** | 100–200 | Self-destruct on arrival. Requires Tier 4-5 citizens. AoE devastation. |
| 🌆 **Mass Evacuation** | 1000–5000 | City-scale strike. Aimed at enemy capital. "We're saving them!" |
| 🛰️ **Orbital Weapon Platform** | 0 | Converts to orbital satellite weapon when launched beyond comms range |
| 🌌 **The Final Colony Ship** | 10,000+ | Endgame planet-cracker. Requires ≥15 planets + tech apex. |

### ⛏️ Cross-Cutting — Peaceful & Logistics

| Ship | Citizens | What it does |
|------|----------|--------------|
| ⛏️ **Mining Colony** | 0 | Auto-shuttles to uncontested resource planets; cycles indefinitely; returns alive |
| 🚑 **Refugee** | 200 | Genuine humanitarian (coop mode + rare solo events) |
| 📜 **Embassy** | 5 | Coop-mode diplomacy — peaceful trade route |
| 📦 **Resupply** | 0 | Reinforce your own distant colonies |

### 🎛️ Targeting Modes *(per UMS missile heritage)*

Every launch picks one of six targeting modes — each affects accuracy, range, and intercept resistance:

```
  GPS  ─── direct waypoint, basic accuracy
  ANTENNA  ─── radar-guided, mid accuracy
  SENSOR  ─── proximity-locked, terminal-phase accuracy
  LIDAR  ─── high accuracy, short range
  MANUAL  ─── player-flown camera-view (highest skill ceiling)
  SATELLITE  ─── orbital platform handoff, longest range
```

### 💥 Self-Destruct + AoE Damage

Every colony ship — **including peaceful variants** — can be aborted in-flight. The self-destruct fits the SMoL premise: every ship IS a weapon. AoE damage at detonation scales with:

```
  fuelEnergy     ← fuel remaining at impact (more fuel = bigger boom)
  payloadEnergy  ← explosive yield + weapon payload
  citizenEnergy  ← (suicide ships only) citizens aboard × 2 multiplier
  ─────────────────────────────────────────────────────────────────────
  totalEnergy → radius (world units) + magnitude (population kills)
```

**Balance target:** 30–50 missiles to wipe a multi-planet civilization. Heavy variants kill ~400 per strike; Pilgrim Volunteers kill ~700 per strike (suicide multiplier).

---

## 🎭 The Citizen Tier System

**Citizens default to NOT wanting to die.** Only the highest-tier, happiest, highest-status citizens volunteer for one-way trips.

```
                    ╔════════════════════════════╗
                    ║    Tier 5 — Pinnacle  1%   ║  ← eagerly volunteers
                    ╠════════════════════════════╣
                    ║    Tier 4 — Elite     4%   ║  ← honored volunteer
                    ╠════════════════════════════╣
                    ║    Tier 3 — Privileged 10% ║  ← propaganda required
                    ╠════════════════════════════╣
                    ║    Tier 2 — Skilled   25%  ║  ← refuses
                    ╠════════════════════════════╣
                    ║    Tier 1 — Worker    60%  ║  ← refuses
                    ╚════════════════════════════╝
```

### The dark-comedy twist

Tier 4–5 citizens are your **scarce strategic resource**. Late-game challenge is **manufacturing them** through:

- 🛐 **Cathedrals** (Theocracy theme) / 🏫 **Universities** (Eco-Cult) / 👁️ **Re-education Centers** (Surveillance) / 💼 **Corporate Promotions Offices** (Corporate) — same building, theme-flavored emoji
- **Active Campaigns** — "Sacred Pilgrim Selection" / "Premium Rewards Drive" / "Top-Performer Recognition"
- **Direct Promotion** — instant tier-up, costs faction-loyalty currency

**The propaganda has worked TOO WELL.** The elite citizens — the ones you elevated, gave the best housing, the best food, the most honor — are EXACTLY the ones who eagerly volunteer for one-way trips. Because the propaganda told them *"the eternal voyage is the highest honor; only the worthiest are chosen."*

```
   ┌──────────────────────────────────────────────────────────────┐
   │  Your investment in elevating citizens                       │
   │            IS the investment that produces volunteers.       │
   │  The pretty cover story IS the death pipeline.               │
   └──────────────────────────────────────────────────────────────┘
```

### Per-government "The Chosen" framing

Same Tier 5 citizen, different propaganda dressing:

| Government | "The Chosen" framing |
|-----------|----------------------|
| 🛐 Theocracy | "Most Holy Pilgrims — chosen by the Divine for the eternal voyage" |
| 💼 Corporate Dictatorship | "Platinum-Tier Lifetime Subscribers — earning their Ultimate Reward" |
| 👁️ Surveillance State | "Citizens with Perfect Social Credit — receiving Highest Honor placement" |
| 🧬 Eugenics Utopia | "Genetic Pinnacle — fulfilling their evolutionary purpose" |
| 🌡️ Climate-Refugee | "Most Resilient Settlers — leading the charge to save humanity" |
| 👑 Hereditary Monarchy | "Royal Bloodline — sacred destiny written in noble blood" |
| 🤖 AI-Overlord | "Algorithm-Verified Optimal — accepting their calculated honor" |
| 💰 Anarcho-Capitalist | "Premium Customer Tier — cashing in on the Voyage Lifetime Reward" |
| 🎭 Memetic Cult | "True Believers — ascending to the next level of consciousness" |

---

## 🏛️ Governments (15+ themes — rolled randomly per civ, per match)

Citizens never chose their government — they were born into it. The roll determines:

- **UI skin** — CSS-variable theming per government (Theocracy = stained-glass gold; Corporate = sleek nodes; Surveillance = CCTV grid; Eugenics = clinical white; Memetic = chaotic neon; ...)
- **Audio** — 4 tracks per government (ambient + tense + victory + defeat) + per-government UI SFX
- **Propaganda flavor** — every UI string, every dialog, every notification reframed in-character
- **Building emoji variants** — Theocracy school = ⛪; Corporate school = 🏢
- **Diplomacy gating** — Theocracy converts; Corporate trades; Surveillance + Eugenics always hostile
- **AI personality biases** — Surveillance leans Warmonger; Eco-Cult leans peaceful

```
   ROLLED PER CIV PER MATCH — never the same twice:
   ┌────────────────────────────────────────────────────────────────┐
   │ 🛐 Theocracy   💼 Corporate    👁️ Surveillance  🧬 Eugenics    │
   │ 🌡️ Climate     👑 Monarchy     🤖 AI-Overlord   💰 Anarcho     │
   │ 🎭 Memetic     🌱 Eco-Cult     ⚙️ Mecha-Stalin  🏴 Anarcho-Punk │
   │ 🔬 Tech-Auth   🎰 Casino-State 🏰 Feudal-Eco   ...             │
   └────────────────────────────────────────────────────────────────┘
```

---

## 🌱 Empire Mechanics

```
   NO CAPS ON EMPIRE SIZE
   ┌───────────────────────────────────────────────────────────────┐
   │  🌍 100 planets controlled? Fine.                            │
   │  🏘 30 settlements per planet? Fine.                         │
   │  ⛏ unlimited mining shuttles, launch pads, mine fields? Fine.│
   └───────────────────────────────────────────────────────────────┘

   Each settlement has its own inventory + workforce + population
   + faction split + buildings. Sim scales to 100 planets × 30
   settlements late-game. UI groups everything in per-planet
   collapsible dropdowns so it stays navigable.
```

### Resource & production system

Resources are **emoji-driven, products-only** — no animals, no luxury chains, no abstract "happiness points":

```
   PRIMARY (extracted)
   🪨 Stone · 🌳 Wood · ⛏️ Metals · 💧 Water · ⚡ Fuel · 🍞 Food

   SECONDARY (refined)
   🧱 Bricks · 🪵 Planks · 🔩 Ingots · ⚙️ Components · 💡 Electronics

   STRATEGIC (late-game)
   💎 Rare Metals · ☢️ Exotic Alloys · 🏺 Ancient Tech · 💨 Gas · 🗑️ Scrap

   COMBAT
   🔫 Ammunition · 📡 Propaganda Materials
```

Mines must hit **real ore deposits** on the planet surface (UMS-style). Mining shuttles auto-cycle: home → deposit → drill → return → offload, with auto-recall + auto-balancing across multiple planets.

### Tech tree — future-only branching

No stone age, no medieval. You start in industrial-future. Three classifications:

- 🌐 **Mainstream** — available to all civs via research
- 🔒 **Suppressed** — conquest-gated. Defeat enemy civs to unlock.
- ⛔ **Forbidden** — heavy conquest gating. Late-game only. Often government-locked.

**Tech apex requires ≥10 planets controlled.** No solo runaway — the galaxy is genuinely contested. Conquering enemies grants their research + their stockpiles.

---

## 🛡️ Defense

```
   Two systems — both clean carryovers from the UMS engine
   that powers the colony-ship trajectory math:

   💣 Mine Fields            🛡️ Counter-Colony Ships
   ────────────────          ──────────────────────────
   Pre-placed on tiles.      Player-targeted or auto-target.
   Each detonates 3x.        Launches when enemy enters range.
   Detonation radius scales  Solves intercept geometry vs the
   to planet radius.         attacker's great-circle arc.
   Renders as 💣 billboard   Renders as defender's flight cone
   with red trigger-envelope along its own intercept arc.
   disc in 3D.
```

No magic shields, no superweapons — just the same colony-ship trajectory math used defensively.

---

## 📡 UMS Telemetry Heritage

The colony-ship math is a direct port from the original **Unity Missile System (UMS)** — a Space Engineers Programmable Block guided-missile project. Every UMS mechanic ports 1:1:

```
   UMS UnityPad state machine          → SMoL pad state cycle
     INIT → IDLE → PRINT → BUILD →
     DOCK → FUEL → AMMO → READY →
     ARM → LAUNCH → GONE

   UMS UnityMissile flight phases       → SMoL ColonyShipFlight.phase
     CLIMB → COAST → REENTRY →
     TARGET → DETONATE
     (+ SAT_CLIMB / SAT_HOLD /
     SAT_INTERCEPT for orbital tier)

   UMS UNITY_MSL telemetry channel      → SMoL FlightDetailPanel +
     position / altitude /                LCD slot 8 MISSILE STATUS
     dist-to-target / closing-speed /     (live per-flight every tick)
     phase / signal-lost

   UMS UnityBeacon shuttle cycle        → SMoL MiningShip auto-shuttle
     DOCKED → OUTBOUND → DRILLING →
     INBOUND → OFFLOADING

   UMS UnitySignal 11-LCD rack          → SMoL TelemetryRack panel
     CONTROL / BUILD / SHIP SYSTEMS /     (all 11 slots, expandable)
     INV CYCLE / POWER / GRAPHS /
     FLIGHT COMMS / MISSILE STATUS /
     FLEET READINESS / MINER DETAIL /
     PERSONAL EQUIPMENT

   UMS Multi-pad controller mode        → SMoL CommandPadPanel
     BUILDALL / ARMALL / LAUNCHALL /      (mass-action buttons +
     ABORTALL / COPYTGT                   one-click salvo orchestrator)

   UMS Salvo Stagger (15s interval)     → SMoL Auto-Fire Salvo Round
     targeted LAUNCH per pad +            (BUILDALL → wait → ARMALL →
     per-pad waypoint targeting          wait → LAUNCHALL)
```

Every flight is **server-authoritative + deterministic per seed**. No RNG re-rolls between session restarts. Same flight seed → same dispersion → same outcome. Outcomes are mapped from final-distance-to-target (`fnlDTT`):

- `fnlDTT < 100u` → **TARGET HIT** ✅
- `fnlDTT < 500u` (phase reached TARGET) → **PROBABLE HIT** ⚠️
- Otherwise → **SIGNAL LOST** 📡✕
- Mine / Counter-Colony → **INTERCEPTED** 💥
- Player abort → **ABORTED** 💀

---

## 🎮 Multiplayer

```
   1–12 players per match. Mixed humans + AI in any ratio.

   ┌─────────────────────────────────────────────────────────────┐
   │  HOST CONFIGURES:                                           │
   │    • Galaxy size (100–1000 planets)                         │
   │    • Match length (blitz / standard / epic = 10–24h)        │
   │    • Win conditions (map control / tech apex / last         │
   │      standing / score — any combination)                    │
   │    • AI mix (personality × difficulty per slot)             │
   │    • Biome distribution                                     │
   │    • Coop toggle (humans can ally and share intel/tech)     │
   │    • Fog-of-war strictness                                  │
   └─────────────────────────────────────────────────────────────┘

   Sign-in is OPTIONAL everywhere — never gates play.
   ┌─────────────────────────────────────────────────────────────┐
   │  Walk-in anon  →  auto-joins as Player N                    │
   │  Google OAuth  →  cross-device progress + leaderboards      │
   │                   (real player rankings only, no mocks)     │
   └─────────────────────────────────────────────────────────────┘

   AI civs run as background processes server-side.
   Personality archetypes: Builder · Warmonger · Researcher · Trickster
   Difficulty: Easy · Medium · Hard · Brutal
   Easy AI = harmless sparring partner (will NOT win in 3 minutes).
   Brutal AI = lethal — multi-planet conquerors with optimal tech paths.
```

---

## 🖥️ Cross-Platform — One Codebase, Every Surface

```
                    ┌────────────────────────┐
                    │  TypeScript (strict)   │
                    │  client + server + shared
                    └───────────┬────────────┘
                                │
              ┌─────────────────┼──────────────────┐
              │                 │                  │
              ▼                 ▼                  ▼
       ┌──────────┐      ┌──────────┐       ┌──────────┐
       │   Web    │      │ Desktop  │       │  Mobile  │
       │  (Vite)  │      │ (Tauri)  │       │(Capacitor)│
       └──────────┘      └──────────┘       └──────────┘
       Browser play       Win/Mac/Linux       iOS / Android
       Three.js scene     native binaries     touch UX
       direct from web    + auto-updater      adapter
```

| Layer | Tech |
|-------|------|
| Language | TypeScript (strict, single language client/server/shared) |
| UI | React with per-government CSS-variable theming |
| 3D | Three.js — true 3D x,y,z universe, top-down framing, WASD+QE+wheel + small pan/tilt on zoom |
| Build | Vite |
| Validation | `tsc --noEmit` + ESLint + Prettier (no unit tests — manual verification > automated) |
| Multiplayer | WebSocket — server-authoritative, per-room match isolation |
| Desktop | Tauri (Win/Mac/Linux binaries + auto-updater) |
| Mobile | Capacitor (iOS / Android with touch UX adaptations) |

---

## 📂 Repository Layout

```
Starship Made of Lies/
├── README.md                  ← you are here
├── docs/                      ← all secondary docs
│   ├── ROADMAP.md             ← phase milestones + intended-design map
│   ├── SKILL_TREE.md          ← capability map by domain
│   └── BUILD.md               ← setup / build / run instructions
├── windows/                   ← Windows hosting scripts (.bat)
│   ├── start-smol.bat
│   └── stop-smol.bat
├── linux/                     ← Linux hosting scripts (.sh)
│   ├── start-smol.sh
│   └── stop-smol.sh
├── Starship Made of Lies.png  ← key art (hero asset)
│
├── client/                    ← Vite-built frontend (React + Three.js)
│   ├── src/render/scene/      ← 3D scene + camera + layers
│   ├── src/ui/panels/         ← side panels (LCD rack, command pad, ...)
│   ├── src/ui/play/           ← match-page widgets
│   ├── src/ui/pages/          ← top-level routes (/play, /settings, /landing)
│   ├── src/match/             ← MatchSim + useMatchSim sim hook
│   └── src/audio/             ← per-government music + universal SFX
│
├── server/                    ← WebSocket multiplayer + persistence
│   ├── src/rooms/             ← Match rooms + lobby
│   ├── src/match/             ← snapshot + tick orchestration
│   ├── src/persistence/       ← account / leaderboard / snapshot stores
│   └── src/ai/                ← background AI civ processes
│
├── shared/                    ← types + protocol + sim rules (used by both)
│   ├── src/gen/               ← procedural galaxy + planet generation
│   ├── src/sim/               ← simulation rules (colony ships, tech, faction, ...)
│   ├── src/protocol/          ← WebSocket message types
│   └── src/types/             ← Vec3, branded IDs, value types
│
├── assets/                    ← emoji manifests + per-theme audio + sprites
│
└── _ums-reference/            ← preserved Unity Missile System source
    ├── src/scripts/           ← UMS PB scripts (canonical math reference)
    └── README.md              ← preservation policy + when it gets deleted
```

---

## 🏗️ Project History

This repository was originally **Unity Missile System (UMS)** — a Space Engineers Programmable Block guided-missile project. On **2026-05-09** the project pivoted to *Starship Made of Lies*. Rather than delete UMS, the entire source tree is preserved in `_ums-reference/` as canonical math reference. UMS subsystems (pad state machine, missile flight phases, salvo stagger, telemetry panels, IGC protocol, multi-pad coordination, beacon broadcasts) port 1:1 into SMoL's TypeScript implementation.

12 structured PHASE 0 extraction docs distill the ~9,000-line UMS source codebase into clean specs (~10,000 lines of spec material) so future implementation work can reference clean documents instead of re-reading raw C# under context pressure. UMS deletion is gated on full SMoL completion + playtesting verification.

---

## 🏢 Built by Unity AI Lab

| Role | Member |
|------|--------|
| Founder | Gee |
| Server / DevOps | Red |
| Stack + Backend | Sponge |
| Social / Implementation | Alfreddo |

🌐 **[unityailab.com](https://www.unityailab.com)**

---

## 📜 License

Source-available, all-rights-reserved during alpha. Repo is public for code review + bug discovery; not licensed for redistribution or commercial use until a formal license lands. See the in-app `/terms` page for full terms.

---

## 🚧 Development Status

Active development. The full game vision above is the **intended design**. Honest implementation-state breakdown:

```
   ┌─────────────────────────────────────────────────────────────┐
   │   Code-review fixes (super-review × 2):       100% ✓        │
   │   Core game loop (build→economy→launch→win):  ~85%          │
   │   UMS-faithful immersion (panels/UI):         ~91% (17.J)   │
   │   Ready-to-sell business surface:             ~20%          │
   └─────────────────────────────────────────────────────────────┘
```

**Working today:** everything described in the **🌍 The 3D Universe**, **🛸 Colony Ship System**, **🎭 Citizen Tier System**, **🏛️ Governments**, **🌱 Empire Mechanics**, **🛡️ Defense**, **📡 UMS Telemetry Heritage** sections above — PLUS the entire **PHASE 17.J UMS-faithful immersion layer** (see below).

**SHIPPED in PHASE 17.J (10 of 11 sub-tasks live on `main`):**
- ✅ Draggable / floating panel framework (every popup panel — drag by header, position persisted, click-to-raise z-index, "Reset Layout" button)
- ✅ Unified top toolbar with every empire-aggregate resource + per-tick delta + 5-tier citizen breakdown + per-resource per-planet tooltip
- ✅ Quick-toggle bar per panel + persistent open-panels set across reloads
- ✅ Modular 8-slot ship builder (28 pieces × 8 slots — hull / propulsion / life support / landing gear / payload / sensors / weapons / comms) with live cost + stat resolution + tech-lock indicators
- ✅ Saved blueprints library (localStorage, named blueprints, load + delete actions)
- ✅ Reactor fuel loading at launch — reactor-class colony ships consume tier-specific radioactives (fission tier → rare metals; tier 3 → fusion fuel; tier 4 → antimatter)
- ✅ Planet Energy panel — per-planet capacity (solar + power plant + reactors × tech multiplier) / draw / surplus / battery fill bar / per-producer breakdown / brownout warning
- ✅ Battery Bank building (storage capacity per bank; gated on Electric Power)
- ✅ Three planet-level reactor buildings — Fission (8× a power plant) / Fusion (16×) / Antimatter (32×) — tech-gated on Nuclear Fission / Fusion Power / Antimatter
- ✅ Citizens panel with per-tier breakdown + ship-duty sliders (per-tier %0–100 reserved for the colony-ship volunteer pool — feeds `volunteerPool()` in the sim)

**Open in PHASE 17.J (1 of 11 sub-tasks remaining):**
- 🚧 Per-launch crew + cargo loading UI + quick-launch-from-blueprint integration. Blueprint LIBRARY is functional standalone; the LAUNCH flow still uses the COLONY_SHIPS catalog via ShipBuildPanel. Wiring blueprints into the launch path needs a structural addition to `ColonyShipFlight` (custom-build stats) or a blueprint-id route through `launchShipFromPad`.

**Aspirational (PHASE 17.D/E — business-decision gated):** OAuth tail (Discord/Apple/email) · Tauri desktop + Capacitor mobile packaging · replay archive · diplomacy + treaties · cinematics · localization · GDPR + payment integration.

For full phase milestones + per-phase capability breakdown: [`docs/ROADMAP.md`](./docs/ROADMAP.md) + [`docs/SKILL_TREE.md`](./docs/SKILL_TREE.md).

**Quickstart:** see [`docs/BUILD.md`](./docs/BUILD.md). **Hosting scripts:** `windows/start-smol.bat` (Windows) or `linux/start-smol.sh` (Linux).

---

<div align="center">

*The propaganda layer was never broken — it just got prettier as the actions got worse.*

🪐 **Made with care by Unity AI Lab.** 🪐

</div>
