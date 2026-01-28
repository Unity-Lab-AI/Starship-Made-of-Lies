# UNIFIED DOCUMENTATION TEMPLATE

**Last Updated:** 2026-01-24
**Purpose:** Standard template for all Unity Missile System documentation files

---

## TABLE OF CONTENTS STRUCTURE

All documentation files MUST start with a Table of Contents using this format:

```markdown
## Table of Contents

1. [Overview](#overview)
2. [System Integration](#system-integration)
3. [Setup](#setup)
4. [Block Configuration](#block-configuration)
5. [Commands](#commands)
6. [IGC Communication](#igc-communication)
7. [CustomData Schema](#customdata-schema)
8. [LCD Displays](#lcd-displays)
9. [Key Functions](#key-functions)
10. [Build and Deploy](#build-and-deploy)
11. [Character Budget](#character-budget)
12. [Quick Reference](#quick-reference)
```

---

## REQUIRED SECTIONS

### 1. Header Block (ALL DOCS)

```markdown
![Script Name](Script%20Name%202.png)

# ScriptName v01.00

Brief one-line description of the script's purpose.

**Location:** `Unity Missile System/src/scripts/ScriptName/`
**PB Name:** `[PAD1] Script Name`
**Version:** v01.00 | 2026-01-24

---
```

### 2. Table of Contents (ALL DOCS)

Immediately after header. Use anchor links. Must match section headers.

### 3. Overview/Purpose Section (ALL DOCS)

```markdown
## Overview

ScriptName is [component type] that:
1. **Primary function** - What it does first
2. **Secondary function** - What it does next
3. **Integration point** - How it connects to others
4. **Output/Result** - What it produces

---
```

### 4. System Integration (ALL DOCS)

```markdown
## System Integration

### The Unity Missile System

| Component | Script | PB Name | Purpose |
|-----------|--------|---------|---------|
| Boot Controller | Unity Boot.cs | `[PAD1] UNITY BOOT` | 23-check boot sequence |
| Launch Pad | UnityPad.cs | `[PAD1] Unity Pad` | Missile control, LCDs 1,2,3,7,8 |
| Inventory | UnityInventory.cs | `[PAD1] Unity Inventory` | Production, LCDs 4,5,6,9,10,11 |
| Missile | UnityMissile.cs | `[PAD1] Missile #1 Program` | Guided flight |
| Fleet Beacon | UnityBeacon.cs | `[BEACON] Unity Beacon` | Miner status broadcast |
| Signal Hub | UnitySignal.cs | `[PAD1] UNITY SIGNAL` | Camera display, laser targeting |

### Compile Order (Pad Grid)

**PAD > INVENTORY > SIGNAL > BOOT**

| Order | Script | Action |
|-------|--------|--------|
| 1 | UnityPad | Clears CustomData, writes `pad_ready=true` |
| 2 | UnityInventory | Clears CustomData, writes `inv_ready=true` |
| 3 | UnitySignal | Clears CustomData, writes `signal_ready=true` |
| 4 | Unity Boot | Reads ready flags, runs 23 checks, sets `boot_complete=true` |

*Note: UnityBeacon (miners) and UnityMissile (missiles) are on separate grids - compile anytime.*

---
```

### 5. Block Configuration (COMPONENT DOCS)

```markdown
## Block Configuration

### Required Blocks

| Block | Tag | Purpose |
|-------|-----|---------|
| Block Type | `[TAG]` | What it does |

### Optional Blocks

| Block | Tag | Purpose |
|-------|-----|---------|
| Block Type | `[TAG]` | What it does |

---
```

### 6. Commands Section (COMPONENT DOCS)

```markdown
## Commands

| Command | Action |
|---------|--------|
| `COMMAND` | What it does |

---
```

### 7. IGC Communication (ALL COMPONENT DOCS)

```markdown
## IGC Communication

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `CHANNEL_NAME` | IN/OUT/BOTH | What it carries |

### Message Formats

```
FORMAT_NAME|field1|field2|field3
```

---
```

### 8. CustomData Schema (COMPONENT DOCS)

```markdown
## CustomData Schema

**Writes to:** `Me.CustomData` (own PB only)

```ini
[SECTION]
key=value
```

**Reads from:**

| Source | Data |
|--------|------|
| Other PB | What data |

---
```

### 9. Character Budget (ALL DOCS)

```markdown
## Character Budget

| Script | Deployed | Budget | Status |
|--------|----------|--------|--------|
| ScriptName | ~XX,XXX | 100,000 | OK (XX% margin) |

*SE limit is 100,000 characters on DEPLOYED script.cs in AppData.*

---
```

### 10. Build and Deploy (ALL COMPONENT DOCS)

```markdown
## Build and Deploy

### Build Commands

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/ScriptName -c Debug
```

### Deploy Location

```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\ScriptName\script.cs
```

### Verify Size

```powershell
[System.IO.File]::ReadAllText("$env:APPDATA\SpaceEngineers\IngameScripts\local\ScriptName\script.cs").Length
```

---
```

### 11. Quick Reference (ALL DOCS)

```markdown
## Quick Reference

```powershell
# Build
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/ScriptName -c Debug

# Check size
[System.IO.File]::ReadAllText("$env:APPDATA\SpaceEngineers\IngameScripts\local\ScriptName\script.cs").Length
```

---
```

### 12. Footer (ALL DOCS)

```markdown
*Unity AI Lab - [Division Name] Division*
```

---

## STANDARD REFERENCE TABLES

### IGC Channels (Complete)

Include in root README.md and SETUP.md:

```markdown
| Channel | Sender | Receiver | Purpose |
|---------|--------|----------|---------|
| `UNITY_BOOT_REQ` | Boot | Pad/Inv | Request system status |
| `UNITY_BOOT_RSP` | Pad/Inv | Boot | Respond with block counts |
| `UNITY_MSL` | Missile | Pad | Telemetry broadcast |
| `UNITY_MSL_CMD` | Pad | Missile | Commands (DETONATE, ABORT) |
| `UNITY_PAD_CMD` | Controller | Slaves | Mass commands |
| `UNITY_PAD_STATUS` | All Pads | Controller | Status updates |
| `UNITY_SAT_RELAY` | Satellite | Satellite | Inter-satellite mesh |
| `UNITY_SAT_RELAY_STATUS` | Satellite | Pad | Status with grid position |
| `UNITY_SAT_INTERCEPT` | Satellite | Pad | Intercept/detonation messages |
| `ENEMY_SIGNAL` | External | Controller | Enemy positions |
| `MINER_BEACON` | UnityBeacon | Pad/Boot | Fleet status |
```

### Character Budgets (Complete)

Include in root README.md and .claude/CLAUDE.md:

```markdown
| Script | Deployed | Budget | Status |
|--------|----------|--------|--------|
| Unity Boot | ~15,050 | 100,000 | OK (85% margin) |
| UnityPad | ~95,427 | 100,000 | OK (4.6% margin) |
| UnityMissile | ~28,577 | 100,000 | OK (71% margin) |
| UnityInventory | ~90,247 | 100,000 | OK (9.8% margin) |
| UnityBeacon | ~14,658 | 100,000 | OK (85% margin) |
| UnitySignal | ~11,998 | 100,000 | OK (88% margin) |
```

### Compile Order (Complete)

Include in SETUP.md, root README.md:

```markdown
### In-Game Compile Order

**Pad Grid (MUST be in this order):**
1. **UnityPad** - Clears CustomData, sets `pad_ready=true`
2. **UnityInventory** - Clears CustomData, sets `inv_ready=true`
3. **UnitySignal** - Clears CustomData, sets `signal_ready=true`
4. **Unity Boot** - Reads ready flags, runs 23 checks, sets `boot_complete=true`

**Other Grids (any order):**
- **UnityMissile** - On missile grid
- **UnityBeacon** - On miner grid
```

---

## PAM INTEGRATION SECTION

Include in UnityBeacon README.md and any miner-related docs:

```markdown
## PAM Integration

**UnityBeacon works alongside [PAM] Path Auto Miner by Keks**

**Steam Workshop:** https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929

PAM is a fantastic autonomous mining script that handles pathfinding, mining operations, and automated transportation. UnityBeacon complements PAM by broadcasting status to your launch pad.

### How to Use Together

1. Install **PAM** in one PB, **UnityBeacon** in another
2. **Dual-tag** shared blocks: `[PAM] [BEACON] Remote Control`
3. UnityBeacon only **reads** - never controls autopilot
4. PAM handles mining, UnityBeacon handles status reporting

*All credit for PAM goes to **Keks** - we just built the beacon system to track PAM-controlled ships!*
```

---

## BLOCK LAYOUT SECTIONS

### Pad Block Layout

Include in SETUP.md and root README.md:

```markdown
### Pad Block Layout

| Block | Tag | Script | Purpose |
|-------|-----|--------|---------|
| Programmable Block | `[PAD1] UNITY BOOT` | Unity Boot | 23-check boot sequence |
| Programmable Block | `[PAD1] Unity Pad` | UnityPad | Launch control |
| Programmable Block | `[PAD1] Unity Inventory` | UnityInventory | Production |
| Programmable Block | `[PAD1] UNITY SIGNAL` | UnitySignal | Camera display |
| Button Panel | `[PAD1] Controls` | (none) | GPS input |
| Merge Block | `[PAD1]` | UnityPad | Missile docking |
| Connector | `[PAD1]` | UnityPad | Fuel transfer |
| LCD x11 | `[PAD1:1]` - `[PAD1:11]` | Various | Status displays |

**Optional Printer Blocks:**

| Block | Tag | Purpose |
|-------|-----|---------|
| V Pistons | `[PAD1-PRINT] V1` | Vertical motion |
| H Pistons | `[PAD1-PRINT] H1` | Horizontal stepping |
| Welders | `[PAD1-PRINT] W1` | Build welding |
| Projector | `[PAD1-PRINT] Proj` | Blueprint source |
```

### Missile Block Layout

Include in SETUP.md and root README.md:

```markdown
### Missile Block Layout

| Block | Tag | Required | Purpose |
|-------|-----|----------|---------|
| Programmable Block | `[PAD1] Missile #1 Program` | Yes | Guidance |
| Remote Control | (auto-named) | Yes | Navigation |
| Merge Block | (auto-named) | Yes | Pad docking |
| Gyroscope(s) | (auto-named) | Yes | Attitude control |
| Thruster(s) | (auto-named) | Yes | Propulsion |
| Battery(s) | (auto-named) | Yes | Power |
| Warhead(s) | (auto-named) | Yes* | Payload |
| Connector [DOCK] | `[DOCK]` | Optional | Fuel loading |
| Connector [AMMO] | `[AMMO]` | Optional | Ammo ejection |
| Antenna | (auto-named) | Optional | Telemetry |
| Sensor | (auto-named) | Optional | SENSOR mode |
| Camera | (auto-named) | Optional | LIDAR mode |

*Not required for SATELLITE mode
```

### Miner Block Layout

Include in UnityBeacon README.md and SETUP.md:

```markdown
### Miner Block Layout

| Block | Tag | Required | Purpose |
|-------|-----|----------|---------|
| Programmable Block | (any) | Yes | UnityBeacon script |
| Remote Control | `[BEACON]` | Yes | Position/velocity |
| Antenna | `[BEACON]` | Yes | IGC broadcast |
| Connector | `[BEACON]` | Optional | Dock detection |
| LCD | `[BEACON]` | Optional | Status display |

*Batteries, cargo, drills, H2 tanks are auto-detected - no tags needed.*
```

---

## FILE STRUCTURE

```
Unity Missile System/
├── tools/
│   ├── wrap-scripts.ps1     # Wraps all raw .cs to Program.cs
│   └── check-chars.ps1      # Character count utility
├── src/
│   └── scripts/
│       ├── Unity Boot.cs        # Edit this (boot controller)
│       ├── UnityPad.cs          # Edit this (pad controller)
│       ├── UnityMissile.cs      # Edit this (missile guidance)
│       ├── UnityInventory.cs    # Edit this (inventory manager)
│       ├── UnityBeacon.cs       # Edit this (fleet beacon)
│       ├── UnitySignal.cs       # Edit this (signal hub)
│       ├── Unity Boot/          # MDK project
│       ├── UnityPad/            # MDK project
│       ├── UnityMissile/        # MDK project
│       ├── UnityInventory/      # MDK project
│       ├── UnityBeacon/         # MDK project
│       └── UnitySignal/         # MDK project
├── references/
│   └── se_blueprints.csv    # Blueprint reference data
├── QUICK_SETUP.md           # Quick setup guide
├── README.md                # Full documentation
├── SETUP.md                 # Complete setup guide
└── .claude/                 # Development workflow
```

---

## DIVISION NAMES

Use consistent footer branding:

| Script | Division |
|--------|----------|
| Unity Boot | Boot Systems Division |
| UnityPad | Missile Systems Division |
| UnityMissile | Missile Systems Division |
| UnityInventory | Inventory Systems Division |
| UnityBeacon | Mining Division |
| UnitySignal | Signal Systems Division |
| Root README | Missile Systems Division |
| SETUP.md | Missile Systems Division |

---

## FORMATTING RULES

1. **Tables:** Use consistent column widths, left-align text
2. **Code blocks:** Use `powershell` for commands, `ini` for CustomData, `csharp` for code
3. **Headers:** Use `##` for main sections, `###` for subsections
4. **Dividers:** Use `---` between major sections
5. **Bold:** Use for emphasis on key terms, NOT for entire sentences
6. **Inline code:** Use backticks for file paths, commands, block names
7. **Lists:** Use numbered lists for ordered steps, bullets for unordered

---

*Unity AI Lab - Documentation Standards*
