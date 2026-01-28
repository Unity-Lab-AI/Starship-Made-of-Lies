![Unity Signal](Unity%20Signal%202.png)

# UnitySignal v01.00

Central signal controller for the Unity Missile System. Manages camera display, laser antenna targeting, satellite constellation tracking, and antenna status monitoring.

**Location:** `Unity Missile System/src/scripts/UnitySignal/`
**PB Name:** `[PAD1] UNITY SIGNAL`
**Version:** v01.00 | 2026-01-24

---

## Table of Contents

1. [Overview](#overview)
2. [System Integration](#system-integration)
3. [Setup](#setup)
4. [Block Configuration](#block-configuration)
5. [Commands](#commands)
6. [IGC Communication](#igc-communication)
7. [CustomData Schema](#customdata-schema)
8. [LCD Displays](#lcd-displays)
9. [Key Features](#key-features)
10. [Build and Deploy](#build-and-deploy)
11. [Character Budget](#character-budget)
12. [Quick Reference](#quick-reference)

---

## Overview

UnitySignal is the **central signal hub** that:
1. **Tracks cameras** from local grid, missiles, and miners
2. **Displays camera lists** on dedicated `[PAD#CAMS]` LCDs
3. **Assigns laser antennas** to track active missiles
4. **Monitors satellite constellation** status and intercepts
5. **Writes status** to CustomData for other scripts to read
6. **Responds to boot handshakes** during system initialization

---

## System Integration

### The Unity Missile System

| Component | Script | PB Name | Purpose |
|-----------|--------|---------|---------|
| Boot Controller | Unity Boot.cs | `[PAD1] UNITY BOOT` | 26-check boot sequence |
| Launch Pad | UnityPad.cs | `[PAD1] Unity Pad` | Missile control, LCDs 1,2,3,7,8 |
| Inventory | UnityInventory.cs | `[PAD1] Unity Inventory` | Production, LCDs 4,5,6,9,10,11 |
| Missile | UnityMissile.cs | `[PAD1] Missile #1 Program` | Guided flight |
| Fleet Beacon | UnityBeacon.cs | `[BEACON] Unity Beacon` | Miner status broadcast |
| **Signal Hub** | **UnitySignal.cs** | **`[PAD1] UNITY SIGNAL`** | **Camera display, laser targeting** |

### Compile Order (Pad Grid)

**PAD > INVENTORY > SIGNAL > BOOT**

| Order | Script | Action |
|-------|--------|--------|
| 1 | UnityPad | Clears CustomData, writes `pad_ready=true` |
| 2 | UnityInventory | Clears CustomData, writes `inv_ready=true` |
| 3 | **UnitySignal** | Clears CustomData, writes `signal_ready=true` |
| 4 | Unity Boot | Reads ready flags, runs 26 checks, sets `boot_complete=true` |

*Note: UnityBeacon (miners) and UnityMissile (missiles) are on separate grids - compile anytime.*

### Data Flow

```
UnityMissile ───UNITY_MSL───┐
                            ├──► UnitySignal ──► [PAD#CAMS] LCDs
UnityBeacon ─MINER_BEACON───┤                ──► Me.CustomData
                            │                ──► Laser Antennas
Satellites ─SAT_RELAY_STATUS┘
```

---

## Setup

### 1. Add Programmable Block

1. Add a Programmable Block to your pad grid
2. Load the `UnitySignal` script
3. Name the PB: `[PAD1] UNITY SIGNAL`

### 2. Add Camera LCDs

Tag LCDs for camera display:

| Tag | Mode | Purpose |
|-----|------|---------|
| `[PAD1CAMS]:1` | Single pad | Camera LCD slot 1 |
| `[PAD1CAMS]:2` | Single pad | Camera LCD slot 2 |
| `[CTRLCAMS]:1` | Controller | All-pads camera view |

### 3. Compile Order

**CRITICAL:** Compile AFTER Pad and Inventory, BEFORE Boot:

```
1. UnityPad
2. UnityInventory
3. UnitySignal     ← Compile here
4. Unity Boot
```

---

## Block Configuration

### Required Blocks

| Block | Tag | Purpose |
|-------|-----|---------|
| Programmable Block | `[PAD1] UNITY SIGNAL` | Runs this script |
| LCD(s) | `[PAD1CAMS]:1`, `:2`, etc. | Camera list display |

### Optional Blocks

| Block | Purpose | Notes |
|-------|---------|-------|
| Radio Antennas | Antenna count tracking | Auto-detected on grid |
| Laser Antennas | Missile tracking | Auto-assigned to active missiles |
| Cameras | Local camera discovery | Tag with `[PAD#]` |

### Sibling PBs (Auto-Detected)

| PB | Name Pattern | Purpose |
|----|--------------|---------|
| bootPB | `[PAD#] UNITY BOOT` | Boot completion check |
| padPB | `[PAD#] Unity Pad` | Session ID validation |

---

## Commands

| Command | Action |
|---------|--------|
| `RESCAN` | Re-scan for cameras, antennas, LCDs |
| `RESET` | Clear all tracking data, re-initialize |

---

## IGC Communication

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_MSL` | IN | Missile telemetry + camera info |
| `MINER_BEACON` | IN | Miner status + camera IDs |
| `UNITY_SAT_RELAY_STATUS` | IN | Satellite status broadcasts |
| `UNITY_SAT_INTERCEPT` | IN | Intercept/detonation messages |
| `UNITY_BOOT_REQ` | IN | Boot SIGNAL_CHECK request |
| `UNITY_BOOT_RSP` | OUT | Respond with camera/LCD count |

### Camera Info in UNITY_MSL

Missiles append camera info to telemetry:

```
X,Y,Z,DTT,Phase,Grav,DFP,Alt,Spd,Fuel,Guide|CAMS:count|name1,name2,...
```

### Camera Info in MINER_BEACON

Miners append camera entity IDs:

```
MB|EntityId|Name|Bat|Crg|H2|...|CAMS:id1,id2,...
```

### Boot Response

When Boot sends `SIGNAL_CHECK` or `SIGNAL_CHECK:{padID}` (backward compatible):

```
SIGNAL|OK|cams={count},lcds={count}
```

**Multi-Pad Safe:** Only responds to boot requests matching its own padID. Accepts both the legacy `SIGNAL_CHECK` format and the new `SIGNAL_CHECK:{padID}` format.

---

## CustomData Schema

**Writes to:** `Me.CustomData` (own PB only)

```ini
[SIGNAL]
signal_ready=true
signal_for_session={pad_session_guid}

[ANTENNAS]
radio=2/3
laser=1/4

[LASERS]
laser_0=MSL-1234|2500m|Connected
laser_1=NONE|Idle
laser_2=SAT-0-0|Connecting

[SATELLITES]
count=4
sat_101=0,0|95|80|4|SAT_HOLD
sat_102=0,1|90|75|3|SAT_HOLD

[INTERCEPTS]
12345|DETONATE|3|1|50000,100000,25000|0,0
12300|CHASE|3|1|50100,100200,25100|150

[STATUS]
last_update=12345
boot_complete=true
cameras=12
missiles=2
miners=3
satellites=4
```

### Section Details

| Section | Content |
|---------|---------|
| `[SIGNAL]` | Ready flag, session ID |
| `[ANTENNAS]` | Radio/laser enabled counts |
| `[LASERS]` | Per-laser target assignment |
| `[SATELLITES]` | Satellite grid positions, status |
| `[INTERCEPTS]` | Recent intercept messages |
| `[STATUS]` | Summary counts |

### Other Scripts Read From Signal

| Script | Reads |
|--------|-------|
| UnityPad | [SATELLITES], [STATUS] for satellite grid tracking |
| Unity Boot | [SIGNAL] for signal_ready check |

---

## LCD Displays

### Camera LCD Layout

```
+-----------------------------+
| == PAD 1 CAMERAS ==         |
| TOTAL: 12  |  PAGE 1/2      |
|-----------------------------|
| ● 01 [PAD1] Forward Cam LOCAL
| ○ 02 [PAD1] Dock Camera  LOCAL
| ● 03 Missile #1 Cam    MISSILE
| ● 04 Ice Miner Cam      MINER
|-----------------------------|
| Auto-cycle every 5s         |
+-----------------------------+
```

### Display Features

| Feature | Description |
|---------|-------------|
| Status Dots | ● Green = active, ○ Gray = off/idle, ◐ Orange = transitional |
| Slot Numbers | Two-digit padded (01, 02, etc.) |
| Type Colors | LOCAL = blue, MISSILE = red, MINER = gold |
| Pagination | Auto-cycles every 5 seconds |
| Widescreen | 2-column layout for wide LCDs |

### Controller Mode

Auto-detected when any `[CTRLCAMS]` LCD exists on grid.

In controller mode:
- Shows cameras from ALL pads
- Accepts both `[CTRLCAMS]:1` and `[PAD#CAMS]:1` tags

---

## Key Features

### Camera Sources

| Source | Discovery | Info |
|--------|-----------|------|
| Local Grid | Block scan for `[PAD#]` cameras | Entity ID, enabled state |
| Missiles | UNITY_MSL broadcast | Camera names from missile |
| Miners | MINER_BEACON broadcast | Camera entity IDs |

### Laser Antenna Targeting

1. Missile broadcasts position in UNITY_MSL
2. Signal parses X,Y,Z coordinates
3. First free laser assigned to missile
4. Laser target set via `SetTargetCoords()`
5. Assignment removed when missile goes offline (600 ticks)

### Satellite Tracking

Listens to `UNITY_SAT_RELAY_STATUS`:
- Parses satellite ID, grid position (X,Z)
- Tracks battery%, H2%, laser links
- Records status (SAT_HOLD, ACTIVE, SAT_INTERCEPT)
- Times out after 600 ticks without broadcast

### Intercept Logging

Listens to `UNITY_SAT_INTERCEPT`:
- Stores CHASE and DETONATE messages
- Keeps last 10 intercepts
- Written to CustomData for other scripts

---

## Build and Deploy

### Build Commands

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/UnitySignal -c Debug
```

### Deploy Location

```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnitySignal\script.cs
```

### Verify Size

```powershell
[System.IO.File]::ReadAllText("$env:APPDATA\SpaceEngineers\IngameScripts\local\UnitySignal\script.cs").Length
```

---

## Character Budget

| Metric | Value |
|--------|-------|
| Raw Lines | ~390 |
| Deployed | ~47,118 chars |
| Budget | 100,000 chars |
| Status | OK (52.9% margin) |

*SE limit is 100,000 characters on DEPLOYED script.cs in AppData.*

---

## Quick Reference

```powershell
# Build
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/UnitySignal -c Debug

# Check size
[System.IO.File]::ReadAllText("$env:APPDATA\SpaceEngineers\IngameScripts\local\UnitySignal\script.cs").Length
```

### LCD Tags

```
[PAD1CAMS]:1    - Camera LCD slot 1 for PAD1
[PAD1CAMS]:2    - Camera LCD slot 2 for PAD1
[CTRLCAMS]:1    - Controller mode (all cameras)
```

### Commands

```
RESCAN   - Refresh block scan
RESET    - Clear all data, re-initialize
```

---

*Unity AI Lab - Signal Systems Division*
