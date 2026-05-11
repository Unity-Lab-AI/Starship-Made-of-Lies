# Starship Made of Lies

**Conquer the galaxy by tricking your own citizens onto colony ships aimed at other civilizations.**

![Starship Made of Lies — Conquer the Galaxy](Starship%20Made%20of%20Lies.png)

> *"Brave pioneers volunteer for the eternal voyage to new worlds!"* — your civ's propaganda
>
> *(Real translation: you've convinced the highest-status citizens that being launched as a one-way colony ship is the ultimate honor. They're eager to go.)*

---

## What is this?

A top-down, emoji-driven civilization-builder where every "starship" your government launches is actually a colony ship. Your citizens think they're going to *new worlds* — and they literally are, just not the ones they signed up for.

It's a **dark-comedy strategy game** with a slow-corruption arc. You start innocent (just sending scout ships to map the galaxy) and end up running an industrial-scale colony-ship pipeline aimed at every other civilization on the map. The propaganda layer stays pretty (or gets *more* pretty to compensate) while your actions get more obviously horrible. That's the joke.

- **You're the god in the sky.** Citizens never chose their government — they were born into it.
- **Every match is different.** Your civ rolls a random government theme — Theocracy, Corporate Dictatorship, Surveillance State, Eugenics Utopia, AI-Overlord, Memetic Cult, Climate-Refugee State, Anarcho-Capitalist, Hereditary Monarchy, ... 15+ themes. Each ships its own UI skin, music, propaganda flavor, and building emoji set.
- **Cross-platform single codebase.** Web (browser), desktop (Tauri Win/Mac/Linux), mobile (Capacitor iOS/Android). One TypeScript codebase, shipped everywhere.
- **Real-time multiplayer.** 1-12 players per match, mixed humans + AI, fog-of-war per civ. Coop or vs-everyone — host configures.
- **Planet-scale strategy.** 100-1000 planets per match (host config), true sphere geometry, great-circle colony-ship trajectories visible to everyone in real-time.

---

## The Colony Ship System

The core gameplay loop is the **colony ship taxonomy** — 4 tech-tier-gated tiers of ship variants, each progressively darker. The propaganda gets prettier as the player's actions get worse.

### 🌱 Tier 1 — Tests & Exploration

*"Brave pioneers explore the cosmos!"* (Player believes this is true. So do citizens.)

| Ship | What it does |
|------|--------------|
| 🛰️ **Scout Colony Ship** | Auto-explores the galaxy, marks planets seen, returns home with intel |
| 📡 **Surveyor Colony Ship** | Lands gently on uncontested planets, scans for resources, sets up sub-colony |
| 🔬 **Probe Colony Ship** | One-way sacrifice scout — sends back continuous data until destroyed |

### 🌍 Tier 2 — Discovery & Escalation

*"Our colonists need new homes! Pioneers, answer the call!"* (You've discovered other civs. Time to "colonize.")

| Ship | What it does |
|------|--------------|
| 🚀 **Standard Colony Ship** | Lands on enemy planet, citizens unaware they're invading |
| 🔦 **Laser-Targeting Beacon Ship** | Lands on enemy planet, becomes ground beacon — follow-up ships hit with precision (bypasses mine fields) |
| 🎭 **Decoy Colony Ship** | No real citizens aboard; absorbs counter-strikes so the real ones get through |
| 🤝 **Boarding Colony Ship** | Citizens are operatives; capture enemy buildings instead of building new colony |

### ⚔️ Tier 3 — Aggression & Industrial Warfare

*"We must defend our way of life!"* (You're at war. Propaganda is desperate.)

| Ship | What it does |
|------|--------------|
| 💣 **Saboteur Colony Ship** | Designed to crash on enemy infrastructure, framed as "tragic pioneer accident" |
| 💥 **Explosive Colony Ship** | Large warhead — propaganda calls it "carrying mining explosives for new world industry" |
| 🛳️ **Heavy Colony Ship** | Long-range, high-HP, slow — reaches distant planets normal ships can't |
| 🛡️ **Counter-Colony Ship** | Defensive interceptor — meets incoming enemy ships mid-flight |

### 🌌 Tier 4 — Industrial Eradication

*"Their salvation requires great sacrifice! Volunteer pilgrims are our highest honor!"* (You know what you're doing. The propaganda is at maximum cope.)

| Ship | What it does |
|------|--------------|
| 🕊️ **Pilgrim Volunteer Ship** | Suicide colony ship. Requires Tier 4-5 citizens (see below). 100-200 "honored volunteers" aboard. |
| 🌆 **Mass Evacuation Ship** | City-scale. 1000-5000 citizens. Aimed at enemy capital. "We're saving them from our dying world!" |
| 🛰️ **Orbital Weapon Platform** | Auto-converts to orbital satellite weapon when launched beyond comms range |
| 🌌 **The Final Colony Ship** | Endgame super-weapon. 10,000+ citizens. Planet-cracker. Requires ≥15 planets controlled + tech apex. |

### ⛏️ Cross-Cutting (peaceful variants)

| Ship | What it does |
|------|--------------|
| ⛏️ **Mining Colony Ship** | Auto-shuttle to uncontested resource planets. Set target ore + auto-settings, miner cycles indefinitely. Citizens return alive. |
| 🚑 **Refugee Colony Ship** | Genuine humanitarian (coop mode + rare solo events) |
| 📜 **Embassy Colony Ship** | Coop-mode diplomacy — peaceful trade route |
| 📦 **Resupply Colony Ship** | Reinforce your own distant colonies |

---

## The Citizen Tier System (the dark hook)

**Citizens default to NOT wanting to die.** Only the highest-tier / happiest / highest-status citizens can be recruited for one-way colony ships.

### 5-tier population model

| Tier | Name | % of population | Volunteers for one-way trips? |
|------|------|----------------|-------------------------------|
| 1 | Worker | 60% | NO — refuses |
| 2 | Skilled | 25% | NO |
| 3 | Privileged | 10% | Maybe — heavy propaganda required |
| 4 | Elite / Honored | 4% | YES — accepts as "honored volunteer" |
| 5 | Pinnacle ("The Chosen") | 1% | YES — eagerly volunteers |

### The dark-comedy twist

Tier 4-5 citizens are the **scarce strategic resource** that feeds your suicide-colony-ship pipeline. Your late-game challenge is **manufacturing high-tier citizens** through:

- **Indoctrination Buildings** (theme-flavored — Cathedral 🛐 / University 🏫 / Re-education Center 👁️ / Corporate Promotions Office 💼 / etc.)
- **Active Campaigns** ("Sacred Pilgrim Selection" / "Premium Rewards Drive" / "Top-Performer Recognition")
- **Direct Promotion** (instant tier-up + faction-loyalty cost)

The propaganda has worked TOO WELL: the elite citizens — the ones you elevated, gave the best housing, the best food, the most honor — are EXACTLY the ones who eagerly volunteer for one-way trips. Because the propaganda told them *"the eternal voyage is the highest honor; only the worthiest are chosen."*

**Your investment in elevating citizens IS the investment that produces volunteers.** The pretty cover story IS the death pipeline.

### Per-theme "The Chosen" framing

Same Tier 5 citizen, different propaganda:

| Theme | "The Chosen" framing |
|-------|----------------------|
| 🛐 Theocracy | "The Most Holy Pilgrims — chosen by the Divine for the eternal voyage" |
| 💼 Corporate Dictatorship | "Platinum-Tier Lifetime Subscribers — earning their Ultimate Reward" |
| 👁️ Surveillance State | "Citizens with Perfect Social Credit — receiving Highest Honor placement" |
| 🧬 Eugenics Utopia | "Genetic Pinnacle — fulfilling their evolutionary purpose" |
| 🌡️ Climate-Refugee State | "Most Resilient Settlers — leading the charge to save humanity" |
| 👑 Hereditary Monarchy | "Royal Bloodline — sacred destiny written in noble blood" |
| 🤖 AI-Overlord | "Algorithm-Verified Optimal — accepting their calculated honor" |
| 💰 Anarcho-Capitalist | "Premium Customer Tier — cashing in on the Voyage Lifetime Reward" |
| 🎭 Memetic Cult | "True Believers — ascending to the next level of consciousness" |

---

## Government Themes (random per civ — every match is different)

15+ themes ship at launch. Your civ rolls one randomly when the match starts. Citizens never chose — they were born into it. The theme drives:

- **UI skin** (CSS-variable theming — Theocracy = stained-glass golds; Corporate = sleek nodes; Surveillance = CCTV grid; Eugenics = clinical white; Memetic = chaotic neon; ...)
- **Audio** (4 tracks per theme: ambient + tense + victory + defeat) + per-theme UI SFX
- **Propaganda flavor** (every UI string, every dialog, every notification reframed)
- **Building emoji variants** (Theocracy school = ⛪; Corporate school = 🏢)
- **Diplomacy gating** (Theocracy converts; Corporate trades; Surveillance + Eugenics always hostile)
- **AI personality biases** (Surveillance theme leans Warmonger; Eco-Cult leans peaceful)

---

## Tech Tree

**Future-only branching tree.** No stone-age, no medieval — you start where the propaganda machine is already humming. Three classifications of tech:

- **Mainstream** — Available to all civs from research
- **Suppressed** — Conquest-gated. Defeat enemy civs to unlock them.
- **Forbidden** — Heavy conquest gating. Late-game only. Often theme-locked.

**Tech apex requires ≥10 planets controlled.** No solo runaway — the galaxy is genuinely contested.

Conquering enemies gives you tech-loot AND resource-loot. Defeated civ's research becomes yours. Their stockpiles transfer.

---

## Defense

Just two systems — both clean carryovers from the original Unity Missile System engine that powers the colony-ship math:

- **Mine fields** — Pre-place defensive mines on tiles. Incoming colony ships passing through trigger them.
- **Counter-Colony Ships (interceptors)** — Player-targeted or auto-target enemy in range; meets incoming ship mid-flight.

No magic shields, no superweapons — just the same colony-ship system used defensively.

---

## Multiplayer

- **1-12 players per match** — mixed humans + AI civs in any ratio
- **Real-time** — server-authoritative WebSocket state
- **Fog of war** per civ
- **Host-configurable lobby:** galaxy size (100-1000 planets), match length (blitz/standard/epic), win conditions (any combination of map control / tech apex / last-civ-standing / score-based), AI personality + difficulty mix, biome distribution, coop mode toggle
- **Coop mode:** humans can ally, share intel, trade tech. Default mode is pure conquest — AI always hostile.
- **AI civs** are visible to all players (no fog-of-war cheats). Run as background processes server-side. Personality archetypes: Builder / Warmonger / Researcher / Trickster × Easy / Medium / Hard / Brutal.

---

## Status

🚧 **Active alpha — mid-PHASE 16 / 17.** Updated 2026-05-10 per super-review gap analysis (TODO PHASE 16.14).

Project pivoted from Unity Missile System to SMoL on 2026-05-09. The TypeScript stack (client + server + shared) is scaffolded and running locally. A playable match loop exists on `/play`. The 3D Three.js scene + camera controller + galaxy/surface layers are wired. Significant gaps remain between the UMS canonical spec and what's reachable from the player UI — those gaps are tracked in `.claude/TODO.md` PHASE 16.13 + 16.14.

| Phase | Description | State |
|-------|-------------|-------|
| 0 | UMS reference inventory + extraction (12 spec docs) | ✓ DONE 2026-05-09 |
| 1 | SMoL project skeleton (Vite + React + Three.js + Tauri + Capacitor) | ✓ DONE |
| 2 | Core game systems (galaxy, planet, tile, building, resource, population) | ✓ partial — data model + tile generation shipped; UI surfaces only partially wired |
| 3 | Tech tree (Mainstream / Suppressed / Forbidden tiers) | ✓ partial — tree + research action shipped; conquest-gate tuning ongoing |
| 4 | Government theme system (20 themes, per-civ random) | ✓ partial — theme catalog + per-civ random roll + CSS skin live; assets stubbed |
| 5 | Deception / subterfuge + Citizen Tier System | ✓ partial — faction model + propaganda + 5-tier citizens shipped; tier-up-to-Pinnacle pipeline not fully reachable from UI |
| 6 | Colony ship system (18 variants — UMS mechanics carryover) | ⚠ partial — taxonomy + state machine + trajectory math shipped; multi-pad controller mode, 6 targeting modes, build phase machine, mining auto-shuttle MISSING |
| 7 | LCD-style telemetry panels + planet beacon + signal hub | ⚠ partial — beacon + signal-capability shipped; UMS 11-LCD rack (production graphs, personal-equipment 4-column, camera array, signal status, fleet readiness, miner detail) MISSING |
| 8 / 16 | 3D x,y,z universe (galaxy → planet → region → base → building) | ⚠ in progress — Three.js scene + cameraController + galaxy/surface layers shipped. PHASE 16.13: `/play` 3D-canvas-as-default + small pan/tilt on zoom + surface raycast all PENDING |
| 9 | AI players (archetype × difficulty) | ✓ partial — archetype/difficulty data shipped; simplified random AI in MatchSim today, full AIController.tick wire-up pending |
| 10 | Multiplayer server (Colyseus / WebSocket) | ✓ partial — server scaffold + anon Player N + lobby + match room shipped; full fog-of-war + cross-civ message scaling pending |
| 11 | Persistence + meta-progression | ✓ partial — FileSnapshotStore + AccountStore interfaces shipped; production Postgres backend pending |
| 12 | Audio system | ✓ partial — per-theme synth fallback live; real `.ogg` per-theme recordings pending |
| 13 | Cross-platform packaging | ✓ partial — Tauri + Capacitor configs + GitHub Actions matrix shipped; real Win/Mac/Linux/iOS/Android signed binaries pending toolchain installs |
| 14 | Polish + launch readiness | ✓ partial — many surfaces shipped 2026-05-10 (5Hz tick, modular ship pieces, crash landings, indigenous AI data, LAST HOPE state machine, render quality presets, WCAG AA palette audit, telemetry pipeline); full tick wire-up of LAST HOPE + indigenous + modular ship combat pending |
| 16.13 | True 3D x,y,z universe rebuild (LAW #0 2026-05-10) | ⏳ ACTIVE — TODO sub-tasks 16.13.1–16.13.16 |
| 16.14 | Doc reality sync (this work) | ⏳ ACTIVE — TODO sub-tasks 16.14.1–16.14.8 |
| 17.0 | Auth overhaul (Google OAuth + Player N anon + ghost-player fix) | ✓ DONE 2026-05-10 |
| 17.x – 18.x | Mobile + replay + diplomacy + events + cinematics + localization | ⏳ planned |
| 15 | Final UMS reference deletion (project-completion-gated) | 🔒 locked until playtested |

See `ROADMAP.md` for full milestones, `.claude/TODO.md` for granular sub-tasks (PHASE 16.13 / 16.14 are the active blocks).

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Language | TypeScript (strict) — single language, client + server + shared |
| UI | React (per-government-theme UI skin via CSS variables) |
| 3D | Three.js — TRUE 3D x,y,z universe (top-down framing, WASD=move, QE=rotate, mouse-wheel=zoom, small pan/tilt on zoom for depth, continuous LOD: galaxy → planet → region → base → building). NO 2D / hex-game / card-game fallback per LAW #0 2026-05-10 (TODO PHASE 16.13). Surface tile interaction = Three.js raycast on `InstancedMesh` inside the 3D camera, not a separate 2D canvas. |
| Build | Vite |
| Type-check + lint | `tsc --noEmit` + ESLint + Prettier (no unit tests; manual verification > automated testing) |
| Multiplayer | WebSocket — Colyseus or custom |
| Desktop | Tauri (Win/Mac/Linux native binaries + auto-updater) |
| Mobile | Capacitor (iOS / Android wrap with touch UX adaptations) |

---

## Repository Layout

```
Starship Made of Lies/
├── README.md                     ← you are here
├── ROADMAP.md                    ← SMoL phase milestones (+ LEGACY UMS preserved)
├── SKILL_TREE.md                 ← 15-domain capability map (+ LEGACY UMS preserved)
├── Starship Made of Lies.png     ← key art (hero asset)
├── _ums-reference/               ← preserved Unity Missile System source — reference for PHASES 6-7
│   ├── src/                      ← UMS PB scripts + mod
│   ├── tools/                    ← UMS PowerShell build tools
│   ├── references/               ← SE API HTML docs (~30k files)
│   ├── docs/                     ← UMS-flavored documentation
│   └── README.md                 ← explains why this folder exists + when it gets deleted
├── client/                       ← (PHASE 1) frontend bundle
├── server/                       ← (PHASE 1) multiplayer game server
├── shared/                       ← (PHASE 1) shared types + protocol + sim rules
└── assets/                       ← (PHASE 1) emoji manifests, per-theme audio, sprites
```

---

## Project History

This repository was originally **Unity Missile System (UMS)** — a Space Engineers Programmable Block guided missile system. On **2026-05-09**, the project pivoted to *Starship Made of Lies*. Rather than delete UMS, the entire source tree is preserved in `_ums-reference/` as reference material. UMS subsystems (pad state machine, missile flight phases, salvo stagger, telemetry panels, IGC protocol, multi-pad coordination, beacon broadcasts) are being mapped 1:1 into SMoL's TypeScript implementation during PHASES 6-7. The UMS reference is scheduled for deletion in **PHASE 15** once SMoL is complete and verified.

The pivot was documented in PHASE 0: 12 structured extraction docs (~10,000 lines of spec) distill the ~9,000-line UMS source codebase so PHASE 6/7 implementers can work from clean specs instead of re-comprehending raw C# under context pressure.

---

## Made by Unity AI Lab

| Role | Member |
|------|--------|
| Founder | Gee |
| Server | Red |
| Stack + Backend | Sponge |
| Social + Dev + Implementation | Mills |

🌐 **Home:** [unityailab.com](https://www.unityailab.com)

---

## License

Source-available, all-rights-reserved during alpha. Repo public for code review + bug discovery; not licensed for redistribution or commercial use until a formal license lands. See the in-app `/terms` page for full terms of service.

---

*Built with 🪐 by Unity AI Lab. The propaganda layer was never broken — it just got prettier as the actions got worse.*
