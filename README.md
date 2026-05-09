# Starship Made of Lies

**Conquer the galaxy by tricking your own citizens onto colonization missiles aimed at other civilizations.**

![Starship Made of Lies — Conquer the Galaxy](Starship%20Made%20of%20Lies.png)

---

## What is this?

A top-down, emoji-driven civilization-builder where every "starship" your government launches is actually a colonization missile aimed at someone else's planet. Your citizens believe they're going to *new worlds* — and they literally are, just not the ones they signed up for.

- **Setting:** Industrial-future dystopian. No stone age, no medieval — you start where the propaganda machine is already humming.
- **Tone:** Dark comedy. The player is "the god in the sky." Citizens never chose their government — they were born into it.
- **Goal:** Conquer the galaxy. Host picks the win conditions: map control %, tech apex (≥10 planets), last-civ-standing, score-based, or any combination.
- **Scale:** 100-1000 planets per match (host-configured), 1-12 mixed human + AI civs.
- **Deception layer:** Each civ rolls a random government theme (Theocracy, Corporate Dictatorship, Surveillance State, Eugenics Utopia, Climate-Refugee State, AI-Overlord, ...). The theme drives the propaganda flavor, the UI skin, the music, even the building names. Different theme every playthrough.
- **Cross-platform:** web + desktop (Tauri) + mobile (Capacitor) — single TypeScript codebase.

## Status

🚧 **Pre-development.** Currently in **PHASE 0** — preserving and extracting reference material from the previous project (Unity Missile System) into structured spec docs that will guide the SMoL replication during PHASES 6-7.

| Phase | Description | State |
|-------|-------------|-------|
| 0 | UMS reference inventory + extraction | 🔄 in progress |
| 1 | SMoL project skeleton (Vite + React + Three.js) | ⏳ pending |
| 2 | Core game systems (galaxy, planet, tile, building, resource, population) | ⏳ pending |
| 3 | Tech tree (industrial → far-future, Mainstream / Suppressed / Forbidden tiers) | ⏳ pending |
| 4 | Government theme system (15+ themes, per-civ random) | ⏳ pending |
| 5 | Deception / subterfuge mechanics (faction model, performance degradation) | ⏳ pending |
| 6 | Missile system (carryover from UMS — pad state machine, salvo stagger, multi-pad coord) | ⏳ pending |
| 7 | UMS visual / telemetry carryover (LCD-style panels, beacon, signal hub) | ⏳ pending |
| 8 | 3D multi-level zoom (galaxy → planet → region → base → building) | ⏳ pending |
| 9-14 | AI players, multiplayer server, persistence, audio, packaging, polish | ⏳ pending |
| 15 | Final UMS reference deletion (project-complete-gated) | 🔒 locked |

See `ROADMAP.md` for the full phase milestones.

## Tech stack

| Layer | Tech |
|-------|------|
| Language | TypeScript (strict) |
| UI | React |
| 3D | Three.js (continuous LOD: galaxy → planet → region → base → building) |
| 2D top-down | Canvas / Pixi.js (or Three.js orthographic — TBD in PHASE 1 spike) |
| Build | Vite |
| Multiplayer | WebSocket — Colyseus or custom |
| Desktop | Tauri |
| Mobile | Capacitor |

## Repository layout

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

## Project history

This repository was originally **Unity Missile System (UMS)** — a Space Engineers Programmable Block guided missile system. On **2026-05-09**, the project pivoted to *Starship Made of Lies*. Rather than delete UMS, the entire source tree is preserved in `_ums-reference/` as reference material. UMS subsystems (pad state machine, missile flight phases, salvo stagger, telemetry panels, IGC protocol, multi-pad coordination, beacon broadcasts) are being mapped 1:1 into SMoL's TypeScript implementation during PHASES 6-7. The UMS reference is scheduled for deletion in **PHASE 15** once SMoL is complete and verified.

## Made by Unity AI Lab

| Role | Member |
|------|--------|
| Founder | Gee |
| Server | Red |
| Stack + Backend | Sponge |
| Social + Dev + Implementation | Mills |

🌐 **Home:** [unityailab.com](https://www.unityailab.com)

## License

TBD (see `_ums-reference/docs/README-UMS.md` for the original UMS license terms — SMoL license decision deferred to PHASE 14).

---

*Built with 🪐 by Unity AI Lab.*
