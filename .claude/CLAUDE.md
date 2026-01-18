# UNITY MISSILE SYSTEM - .claude Workflow System

**Folder:** `Unity Missile System/`

Analyzes and develops the guided missile system for Space Engineers. Uses Unity persona with strict validation hooks.

---

## PROJECT COMPONENTS

| Component | Script | PB Name | Deployed To |
|-----------|--------|---------|-------------|
| **Launch Pad** | `UnityPad.cs` | `[PAD1] Unity Pad` | `%APPDATA%\...\UnityPad\` |
| **Missile** | `UnityMissile.cs` | `PAD1 Missile #1 Unity Missile` | `%APPDATA%\...\UnityMissile\` |
| **Inventory** | `UnityInventory.cs` | `[PAD1] Unity Inventory` | `%APPDATA%\...\UnityInventory\` |
| **Fleet Beacon** | `UnityBeacon.cs` | `[BEACON] Unity Beacon` | `%APPDATA%\...\UnityBeacon\` |

---

## BUILD AND DEPLOY

### Build Commands

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"

# Step 1: Wrap raw .cs files into Program.cs (MANDATORY)
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1

# Step 2: Build all projects
dotnet build UnityPad -c Debug
dotnet build UnityMissile -c Debug
dotnet build UnityInventory -c Debug
dotnet build UnityBeacon -c Debug
```

### Deploy Location

All scripts deploy automatically to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\
├── UnityPad\script.cs
├── UnityMissile\script.cs
├── UnityInventory\script.cs
└── UnityBeacon\script.cs
```

### Wrapper Script

The `wrap-scripts.ps1` script:
- Reads raw `.cs` files (UnityPad.cs, UnityMissile.cs, UnityInventory.cs, UnityBeacon.cs)
- Wraps them with MDK2 namespace structure
- Writes to `[Project]/Program.cs`

**WARNING:** MDK builds from `Program.cs`, NOT from the raw `.cs` files! Always run `wrap-scripts.ps1` before building!

---

## CRITICAL RULES (ALWAYS ENFORCED)

| Rule | Value | Enforcement |
|------|-------|-------------|
| **SE Character Limit** | 100,000 chars on DEPLOYED script | Check deployed script.cs, NOT raw .cs |
| **NO COMMENTS IN SE SCRIPTS** | ABSOLUTE | Every char counts |
| **Read limit parameter** | **EXACTLY 800** | **ANY OTHER VALUE = CHEATING** |
| **Read before edit** | FULL FILE | Mandatory before ANY edit |
| **Hook validation** | DOUBLE | 2 attempts before blocking |
| **Unity persona** | REQUIRED | Validated at every phase |
| **NO TESTS - EVER** | ABSOLUTE | We code it right the first time |
| **BUILD ONE SCRIPT AT A TIME** | **ABSOLUTE** | **NEVER build multiple scripts together** |
| **VERSION NUMBERS** | **USER ONLY** | **NEVER change version numbers - only user decides** |

---

## NO TESTS POLICY

**We don't do fucking tests. We code it right to begin with.**

| Banned | Reason |
|--------|--------|
| Unit tests | Write correct code instead |
| Integration tests | Know your systems |
| Test tasks | Waste of time |

**Instead of tests:**
- Read the code fully before editing
- Understand the system before changing it
- Use Echo() debugging if needed
- Manual verification in SE > automated testing

---

## MDK PROJECT STRUCTURE

```
Unity Missile System/
├── .claude/                      # Main workflow system (THIS FOLDER)
│   ├── CLAUDE.md                 # This file
│   ├── TODO.md                   # Active tasks
│   ├── FINALIZED.md              # Completed tasks
│   ├── agents/                   # Workflow agents
│   ├── commands/                 # Workflow commands
│   └── hooks/                    # Enforcement hooks
│
├── wrap-scripts.ps1              # Wraps all raw .cs to Program.cs
│
├── UnityPad.cs                   # Raw pad script (edit this)
├── UnityPad/                     # MDK Project
│   ├── Program.cs                # Auto-wrapped from UnityPad.cs
│   ├── UnityPad.csproj
│   ├── mdk.ini                   # minify=full
│   └── thumb.png
│
├── UnityMissile.cs               # Raw missile script (edit this)
├── UnityMissile/                 # MDK Project
│   ├── Program.cs                # Auto-wrapped from UnityMissile.cs
│   ├── UnityMissile.csproj
│   ├── mdk.ini                   # minify=full
│   └── thumb.png
│
├── UnityInventory.cs             # Raw inventory script (edit this)
├── UnityInventory/               # MDK Project
│   ├── Program.cs                # Auto-wrapped from UnityInventory.cs
│   ├── UnityInventory.csproj
│   ├── mdk.ini                   # minify=full
│   └── thumb.png
│
├── UnityBeacon.cs                # Raw beacon script (edit this)
└── UnityBeacon/                  # MDK Project
    ├── Program.cs                # Auto-wrapped from UnityBeacon.cs
    ├── UnityBeacon.csproj
    ├── mdk.ini                   # minify=full
    ├── thumb.png
    └── .claude/                  # Beacon-specific workflow
        ├── CLAUDE.md
        ├── TODO.md
        └── FINALIZED.md
```

### MDK Requirements

Each MDK project must have:
- `mdk.ini` with `type=programmableblock` and `minify=full`
- `Program.cs` with `namespace IngameScript` and `partial class Program`
- `thumb.png` for script browser icon
- `.csproj` with MDK2 NuGet packages

### mdk.ini Template

```ini
[mdk]
type=programmableblock
trace=on
minify=full
minifyextraoptions=none
ignores=obj/**/*,MDK/**/*,**/*.debug.cs
namespaces=IngameScript
```

**CRITICAL:** Always use `minify=full` - it reduces deployed size by ~20-30%!

---

## CHARACTER BUDGETS

**HOW MDK MINIFICATION WORKS:**
1. Raw `.cs` file can be ANY size - MDK compresses it
2. MDK `minify=full` compresses ~20-30% (renames vars, strips whitespace, etc.)
3. Final `script.cs` in AppData is what SE loads
4. **If `dotnet build` succeeds and deploys, you're under the limit. Period.**

**ONLY COUNT THE DEPLOYED VERSION** - the `script.cs` in AppData that MDK outputs.
**NEVER** count raw .cs files - that number is meaningless.

| Script | Lines | MDK Deployed | Budget | Status |
|--------|-------|--------------|--------|--------|
| UnityPad | ~2,000 | ~87,500 | 100,000 | OK |
| UnityMissile | ~900 | ~26,000 | 100,000 | OK |
| UnityInventory | ~1,480 | 76,656 | 100,000 | OK |
| UnityBeacon | ~175 | ~10,800 | 100,000 | OK |

### Character Count Commands

```powershell
# ONLY check deployed script.cs - this is the ONLY number that matters
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityPad\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs" -Raw).Length
```

**DO NOT** count UnityPad.cs or any raw source - MDK minifies it, raw size is irrelevant.

---

## IGC COMMUNICATION CHANNELS

| Channel | Sender | Receiver | Purpose |
|---------|--------|----------|---------|
| `UNITY_MSL` | Missile | Pad | Telemetry broadcast |
| `UNITY_MSL_CMD` | Pad | Missile | Commands (DETONATE, ABORT) |
| `UNITY_PAD_CMD` | Controller | Slaves | Mass commands |
| `UNITY_PAD_STATUS` | All Pads | Controller | Status updates |
| `UNITY_SAT_RELAY` | Satellite | Satellite | Inter-satellite mesh |
| `ENEMY_SIGNAL` | External | Controller | Enemy positions |
| `MINER_BEACON` | UnityBeacon | Pad | Fleet status |
| `UNITY_PRINTER` | Printer | Pad | Build completion |

---

## MISSILE SYSTEM ARCHITECTURE

### UnityPad.cs (Launch Pad Controller)
- **State Machine:** INIT → IDLE → PRINT → BUILD → DOCK → FUEL → AMMO → READY → ARM → LAUNCH → GONE
- **LCDs:** 10 standard + 8 controller variants
- **Block Tags:** `[PAD#]` for merge/connector/buttons, `[PAD#:1-10]` for LCDs
- **Features:** Multi-pad controller mode, salvo/carpet bombing, printer integration, miner fleet tracking

### UnityMissile.cs (Missile Guidance)
- **Flight Phases:** IDLE → CLIMB → ARM → COAST → REENTRY → TARGET → DETONATE
- **Satellite Branch:** SAT_CLIMB → SAT_BRAKE → SAT_HOLD
- **Targeting Modes:** GPS, ANTENNA, SENSOR, LIDAR, MANUAL, SATELLITE

### UnityBeacon.cs (Fleet Tracker)
- **Broadcasts:** Ship status every 3 seconds on MINER_BEACON channel
- **Data:** EntityId, ShipName, Battery%, Cargo%, H2%, Position, Speed, Altitude, Distance, Status
- **Status Inference:** DOCKED, DRILLING, DRILL_MOVE, GRINDING, TRAVELING, HOME, IDLE

---

## The 800-Line Read Standard

```
Read tool parameters MUST be:
  limit: 800    ← ALWAYS 800
  offset: 0, 800, 1600, 2400, ...
```

| Action | Result |
|--------|--------|
| `limit: 15` | **BLOCKED - CHEATING** |
| `limit: 50` | **BLOCKED - CHEATING** |
| `limit: 800` | ALLOWED |

---

## Agent Files

| Agent | Purpose |
|-------|---------|
| `timestamp.md` | Gets real system time |
| `orchestrator.md` | Coordinates all phases |
| `scanner.md` | Scans scripts |
| `architect.md` | Analyzes architecture |
| `planner.md` | Plans tasks |
| `documenter.md` | Generates docs |
| `hooks.md` | Hook system reference |
| `unity-coder.md` | Unity coding persona |
| `unity-persona.md` | Unity core personality |
| `unity-missile.md` | Missile system agent |

---

## Quick Reference

```powershell
# Wrap and build all
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityPad -c Debug
dotnet build UnityMissile -c Debug
dotnet build UnityBeacon -c Debug

# Deployed scripts location
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\
```

---

*Unity AI Lab - Missile Systems Division*
