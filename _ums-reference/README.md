# `_ums-reference/` — Preserved UMS Source (Reference Material)

This folder contains the complete **Unity Missile System (UMS)** — a Space Engineers Programmable Block guided missile system that was the original project in this repository.

**The project pivoted on 2026-05-09** to *Starship Made of Lies (SMoL)* — a top-down emoji-driven civilization-building game. Rather than delete the UMS work, we preserve every byte as **reference material** for the SMoL replication phases (PHASES 6-7, primarily) — copying mechanics like the pad state machine, salvo stagger, telemetry panels, IGC protocol, missile trajectory math, and printer integration into the SMoL TypeScript codebase.

## Status

| Aspect | State |
|--------|-------|
| Active project | **Starship Made of Lies (SMoL)** — root of repo |
| UMS development | **SUNSET** — no further commits, no bug fixes, no feature work |
| UMS source | **PRESERVED** here as read-only reference |
| Scheduled deletion | **PHASE 15** — only after SMoL is complete + verified, with explicit user sign-off |

## Contents

| Path | Contents |
|------|----------|
| `src/scripts/` | 6 SE Programmable Block scripts: `Unity Boot.cs`, `UnityPad.cs`, `UnityMissile.cs`, `UnityInventory.cs`, `UnityBeacon.cs`, `UnitySignal.cs` (plus their MDK2 project folders with auto-wrapped `Program.cs`) |
| `src/mods/UMS Mod/` | Space Engineers Harmony plugin (`DeMergeSession.cs`, `Plugin.cs`) |
| `tools/` | PowerShell build/check tools: `wrap-scripts.ps1`, `update-packages.ps1`, `check-chars.ps1`, `minify-cs.ps1` |
| `references/` | Local SE API HTML reference (~30,000 files): `pbapi/`, `modapi/`, `mdk2/` |
| `docs/` | UMS-flavored documentation: `README-UMS.md` (the original 68KB README), `SETUP.md`, `QUICK_SETUP.md`, `CommandPadSetup.md` |

## Why preserved instead of deleted?

User directive (verbatim, 2026-05-09):
> *"we nuke nothing but track it all.. we only nuke once we are done using it for refrence for coping all the graphs panels items hasndling and trajectory and opertions and pringting of missiles all of it need to be kept for refrence to make exact copies of mechanics"*

The UMS source is dense — ~7,000+ lines of compressed C# packed with battle-tested mechanics. SMoL's missile system, telemetry panels, multi-pad coordination, and IGC-equivalent multiplayer protocol all draw heavily from these scripts. Re-deriving the mechanics from a future-Claude's memory under PHASE 6/7 context pressure would lose precision; reading the UMS source while writing the SMoL replication preserves it.

## How SMoL replication uses this folder

The PHASE 0 **extraction docs** at `.claude/SMOL_REFERENCE_*.md` (proprietary, gitignored) capture each UMS subsystem's mechanics structurally — state machines, IGC channel surfaces, LCD layouts, customdata contracts, known-fix histories. Those docs cite specific UMS source lines (e.g. `_ums-reference/src/scripts/UnityPad.cs:1042`) so the SMoL implementer can verify against the source whenever a detail is ambiguous.

When PHASE 15 fires (project complete, SMoL verified, user sign-off), this whole folder gets deleted in one operation: `rm -rf _ums-reference/`.

## Don't

- Don't edit anything in this folder. UMS is sunset — no fixes, no features, no rebuilds. Any attempted improvements should target the SMoL replication in `client/` / `server/` / `shared/` (those don't exist yet — PHASE 1 will scaffold them).
- Don't try to compile / deploy the UMS scripts from here. The tooling expected the original `src/scripts/...` paths. If you actually need a working UMS install for in-game testing, restore the deployed scripts from `%APPDATA%/SpaceEngineers/IngameScripts/local/Unity*/` (those are outside this repo and were the live runtime targets).

## Cross-reference

| Doc | Purpose |
|-----|---------|
| Project root `README.md` | SMoL identity + status |
| `ROADMAP.md` (root) | SMoL phase milestones + LEGACY UMS roadmap preserved |
| `SKILL_TREE.md` (root) | SMoL 15-domain capability map + LEGACY UMS skill tree preserved |

---

*UMS — sunset 2026-05-09. SMoL — long live the dark-comedy civ-builder.*
