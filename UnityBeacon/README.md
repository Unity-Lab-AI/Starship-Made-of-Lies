![Unity Beacon](Unity%20Beacon%202.png)

# UnityBeacon v01.00 - Miner Status Broadcaster

Part of the **Unity Missile System** - broadcasts miner status via IGC so the UnityPad can track your mining fleet whether docked or flying. Features sprite-based LCD rendering for crisp status displays.

**Designed to work with [PAM] Path Auto Miner by Keks** - the fantastic autonomous mining script from the Steam Workshop.

**Location:** `Unity Missile System/UnityBeacon/`
**Version:** v01.00 | 2026-01-17

---

## System Overview

```
+------------------+                    +------------------+
|   YOUR MINER     |     IGC Radio     |   UNITY PAD      |
|------------------|    ==========>    |------------------|
| [PAM] Autopilot  |   MINER_BEACON    | LCD 9: Fleet     |
| [BEACON] Status  |                   | LCD 10: Details  |
+------------------+                    +------------------+
```

**Works alongside [PAM] Path Auto Miner** (https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929) by **Keks** - doesn't interfere with autopilot or mining operations. PAM handles the mining, UnityBeacon handles the status reporting!

---

## Quick Setup

### 1. Build on Your Miner
- 1x Programmable Block
- Load MinerBeacon script

### 2. Run SETUP
```
Arguments: SETUP
```
Auto-tags your first Remote Control, Antenna, Connector with `[BEACON]`

### 3. Set Home Base
Fly/dock at your base, then run:
```
Arguments: SETHOME
```

### 4. Configure Ship Name
Click PB -> Edit CustomData -> Change `ShipName=`:
```ini
[MINER_BEACON]
ShipName=Ice Miner
Channel=MINER_BEACON
BlockTag=[BEACON]
HomeGPS=0,0,0
```

---

## Required Blocks

Tag these blocks with `[BEACON]` in their name:

| Block | Required | Purpose |
|-------|----------|---------|
| Remote Control | YES | Position, velocity, altitude |
| Antenna | YES | IGC broadcast (50km range) |
| Connector | Optional | Dock detection |
| LCD Panel | Optional | Status display on miner |

**Note:** Batteries, cargo, drills, H2 tanks are auto-detected - no tags needed.

---

## PAM Compatibility

**MinerBeacon is designed to work perfectly alongside [PAM] Path Auto Miner by Keks:**

**Steam Workshop:** https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929

PAM is a fantastic autonomous mining script that handles pathfinding, mining operations, and automated transportation. All credit for PAM goes to **Keks** - we just built the beacon system to track PAM-controlled ships!

**How to use together:**
1. Use a **separate PB** for MinerBeacon (PAM has its own PB)
2. **Dual-tag** blocks: `[PAM] [BEACON] Remote Control`
3. MinerBeacon only **reads** - never controls autopilot
4. Add a second Remote Control if needed (orientation doesn't matter)
5. PAM handles mining, UnityBeacon handles status reporting to your base

---

## Commands

| Command | Action |
|---------|--------|
| `SETUP` | Auto-name first RC, Antenna, Connector with [BEACON] |
| `SETHOME` | Save current position as home base |
| `RESCAN` | Re-scan for tagged blocks |

---

## Inferred Status

MinerBeacon automatically determines your ship's status:

| Status | Condition |
|--------|-----------|
| DOCKED | Connector locked |
| DRILLING | Drills on, speed < 2 m/s |
| DRILL_MOVE | Drills on, moving |
| GRINDING | Grinders on, speed < 2 m/s |
| GRIND_MOVE | Grinders on, moving |
| DEPARTING | Speed > 5 m/s, near home |
| TRAVELING | Speed > 5 m/s |
| HOME | At home position, idle |
| IDLE | Default |

---

## LCD Display (On Miner) - Sprite-Based

If you tag an LCD with `[BEACON]`, the miner displays a sprite-based status panel.

### Sprite Rendering System

All LCDs use modern `MySpriteDrawFrame` rendering for crisp, colorful displays:

| Function | Purpose |
|----------|---------|
| `BL(surface)` | Begin LCD frame with dark background |
| `SH(f,y,text,c)` | Draw header with underline |
| `ST(f,x,y,t,c,sz,align)` | Draw text |
| `SB(f,x,y,w,h,pct,fg,bg)` | Draw progress bar |
| `SLB(f,x,y,w,h,lbl,pct,fg,bg)` | Draw labeled progress bar |
| `SD(f,y)` | Draw horizontal divider line |
| `PctCol(pct)` | Get color from percentage (green/yellow/red) |

### Color Palette

| Color | RGB | Usage |
|-------|-----|-------|
| `cPri` | (0,180,255) | Primary blue - headers, highlights |
| `cSec` | (100,100,100) | Secondary gray - dividers |
| `cAcc` | (255,200,0) | Accent gold - ship name |
| `cOK` | (0,255,100) | Green - good status (>70%) |
| `cWrn` | (255,180,0) | Orange - warning (30-70%) |
| `cErr` | (255,60,60) | Red - critical (<30%) |
| `cBg` | (10,10,15) | Dark background |
| `cBdr` | (40,40,50) | Border color |
| `cTxt` | (220,220,220) | Light text |

### Display Layout

```
+------------------------+
|  == BEACON STATUS ==   | (cPri header)
|------------------------| (cSec divider)
|  [Ship Name]           | (cAcc accent)
|  Status: DRILLING      | (status color)
|------------------------| (cSec divider)
| Bat: [=======  ] 78%   | (colored bar)
| Crg: [====     ] 42%   | (colored bar)
| H2:  [========= ] 95%  | (colored bar)
|------------------------| (cSec divider)
| Speed: 1 m/s           |
| Alt:   150 m           |
| Dist:  2500 m          |
| Drills: 4/4            |
+------------------------+
```

Progress bars change color based on fill percentage using `PctCol()`.

---

## UnityPad Integration

When MinerBeacon broadcasts, the UnityPad:

1. **Receives** via `MINER_BEACON` IGC channel
2. **Tracks** in `trackedMiners` dictionary by EntityId
3. **Correlates** docked ships when connector locks
4. **Displays** on LCD 9 (fleet overview) and LCD 10 (details)
5. **Cleans** stale entries after 120 seconds of no signal

### LCD 9: Fleet Overview
```
+--------------------+
| == MINER FLEET ==  |
| Tracked: 3         |
| Docked: 1          |
| Flying: 2          |
|--------------------|
| [Ice Miner] DOCKED |
|  Bat:95% Crg:42%   |
| [Miner 2] DRILLING |
|  Bat:78% @2500m    |
| [Miner 3] TRAVELING|
|  Bat:82% @8200m    |
+--------------------+
```

### LCD 10: Miner Details
```
+--------------------+
| == MINER DETAIL == |
| = Ice Miner =      |
| Status: DOCKED     |
| Bat: [=========]95%|
| Crg: [====     ]42%|
| H2:  [=======  ]68%|
| Docked @Port1      |
|--------------------|
| = Miner 2 =        |
| Status: DRILLING   |
| Bat: [=======  ]78%|
| Crg: [======   ]65%|
| Spd:1m/s Alt:45m   |
| Dist:2500m Drills:4|
+--------------------+
```

---

## Broadcast Format

```
MB|EntityId|ShipName|Bat%|Cargo%|H2%|X,Y,Z|Speed|Alt|DistHome|Status|DrillCount|DrillsOn|GrinderCount|GrindersOn|Docked
```

Example:
```
MB|123456789|Ice Miner|78|42|95|1000,2000,3000|5|150|2500|DRILLING|4|4|0|0|0
```

---

## The Complete System

UnityBeacon is part of the Unity Missile System:

| Component | Script | Location | Purpose |
|-----------|--------|----------|---------|
| **Launch Pad** | UnityPad.cs | `Unity Missile System/` | Controls missiles, displays, miner tracking |
| **Missile** | UnityMissile.cs | `Unity Missile System/` | Guided missile with multiple targeting modes |
| **Fleet Beacon** | UnityBeacon.cs | `Unity Missile System/` | Broadcasts miner status to pad |
| **Inventory** | UnityInventory.cs | `Unity Missile System/` | Manages storage, refineries, assemblers |

### IGC Channel Map

| Channel | Sender | Receiver | Purpose |
|---------|--------|----------|---------|
| `UNITY_MSL` | Missile | Pad | Telemetry |
| `UNITY_MSL_CMD` | Pad | Missile | Commands |
| `UNITY_PAD_CMD` | Controller | Slaves | Mass commands |
| `MINER_BEACON` | MinerBeacon | Pad | Miner status |

---

## Files

```
Unity Missile System/
├── wrap-scripts.ps1         # Wraps all raw .cs to Program.cs
├── UnityPad.cs              # Pad controller
├── UnityMissile.cs          # Missile script
├── UnityBeacon.cs           # THIS PROJECT - Raw script (edit this)
├── UnityInventory.cs        # Inventory manager
├── UnityPad/                # MDK project
├── UnityMissile/            # MDK project
├── UnityInventory/          # MDK project
├── UnityBeacon/             # MDK project
│   ├── Program.cs           # Auto-wrapped from UnityBeacon.cs
│   ├── UnityBeacon.csproj
│   ├── mdk.ini              # minify=full
│   ├── thumb.png
│   ├── README.md            # This file
│   └── .claude/             # Workflow files
│       ├── CLAUDE.md
│       ├── TODO.md
│       └── FINALIZED.md
└── .claude/                 # Main project workflow
```

---

## Building

```powershell
# From Unity Missile System folder:
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"

# Step 1: Wrap raw .cs files into Program.cs (MANDATORY)
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1

# Step 2: Build the project
dotnet build UnityBeacon -c Debug
```

**WARNING:** MDK builds from `Program.cs`, NOT from `UnityBeacon.cs`! Always run `wrap-scripts.ps1` before building!

---

## Character Budget

**IMPORTANT:** The 100k limit applies to the DEPLOYED `script.cs`, NOT the raw source file!

| Metric | Value |
|--------|-------|
| Raw Source | ~12,000 chars |
| Deployed | 10,800 chars |
| Budget | 100,000 chars |
| Status | OK (89% margin) |

**NOTE:** All mdk.ini files MUST have `minify=full` for proper compression!

### Character Count Commands

```powershell
# Check deployed script size (THIS IS WHAT MATTERS!)
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs" -Raw).Length
```

---

## Deploy Location

Script auto-deploys to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs
```

---

## Quick Reference

```powershell
# Build and deploy
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityBeacon -c Debug

# Check deployed size
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs" -Raw).Length
```

---

*Unity AI Lab - Mining Division*
*Version v01.00 | 2026-01-17*
