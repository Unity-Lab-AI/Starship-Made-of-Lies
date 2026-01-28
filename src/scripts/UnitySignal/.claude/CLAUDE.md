# UnitySignal - .claude Workflow System

**Central Signal Controller** for the Unity Missile System. Manages antennas, laser targeting, satellite constellation tracking, and camera display.

**Location:** `Unity Missile System/src/scripts/UnitySignal/` (part of Unity Missile System)
**PB Name:** `[PAD1] UNITY SIGNAL`
**Version:** v01.00 | 2026-01-24

---

## GitFlow Policy

**All development work occurs in feature branches only.** See main `.claude/CLAUDE.md` for full policy.

| Branch | Purpose | Direct Commits |
|--------|---------|----------------|
| `main` | Production/stable releases | **NEVER** |
| `develop` | Integration/pre-release | **NEVER** |
| `feature/*` | All development work | **YES** |

---

## Table of Contents

1. [Purpose](#purpose)
2. [File Sync Rule](#critical-file-sync-rule)
3. [Build and Deploy](#build-and-deploy)
4. [Compile Order](#compile-order)
5. [CustomData Schema](#customdata-schema)
6. [IGC Communication](#igc-communication)
7. [Key Functions](#key-functions)
8. [Antenna Management](#antenna-management)
9. [Satellite Tracking](#satellite-tracking)
10. [Camera Sources](#camera-sources)
11. [LCD Tagging](#lcd-tagging)
12. [Commands](#commands)
13. [Character Budget](#character-budget)
14. [Quick Reference](#quick-reference)

---

## PURPOSE

UnitySignal is the **central signal hub** for the pad grid:
- **Antenna Management**: Tracks all radio/laser antennas on pad grid
- **Laser Targeting**: Assigns lasers to track active missiles
- **Satellite Tracking**: Monitors satellite constellation status
- **Camera Display**: Shows cameras from local grid, missiles, miners on LCDs
- **CustomData API**: Other scripts read status from Signal's CustomData

---

## CRITICAL: FILE SYNC RULE

**BOTH files MUST be kept in sync:**
- `src/scripts/UnitySignal.cs` - Raw script file (edit this)
- `src/scripts/UnitySignal/Program.cs` - MDK build file (auto-wrapped)

**WHEN EDITING:**
1. Edit `src/scripts/UnitySignal.cs` directly
2. Run `tools/wrap-scripts.ps1` to sync to Program.cs
3. Build with `dotnet build src/scripts/UnitySignal -c Debug`

---

## BUILD AND DEPLOY

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/UnitySignal -c Debug
```

Deploy: `%APPDATA%\SpaceEngineers\IngameScripts\local\UnitySignal\script.cs`

---

## COMPILE ORDER

**IN-GAME:**
```
(Missile Ship)  BEACON > MISSILE
(Pad Grid)      PAD > INVENTORY > SIGNAL > BOOT
```

**CRITICAL:** Signal MUST compile BEFORE Boot so boot can check it!

---

## CUSTOMDATA SCHEMA

UnitySignal writes comprehensive status to `Me.CustomData`:

```ini
[SIGNAL]
signal_ready=true
signal_for_session=ABC123

[ANTENNAS]
radio=2/3
laser=1/4

[LASERS]
laser_0=MSL-1234|2500m|Connected
laser_1=NONE|Idle
laser_2=NONE|Idle
laser_3=SAT-0-0|Connecting

[SATELLITES]
count=4
sat_101=0,0|95|80|4|SAT_HOLD
sat_102=0,1|90|75|3|SAT_HOLD
sat_201=1,0|85|70|4|SAT_HOLD
sat_202=1,1|100|90|4|ACTIVE

[STATUS]
last_update=12345
boot_complete=true
cameras=12
missiles=2
miners=3
satellites=4
```

### Other Scripts Read From Signal

| Script | Reads From Signal |
|--------|-------------------|
| UnityPad | [ANTENNAS], [LASERS], [SATELLITES], [STATUS] |
| UnityInventory | [STATUS] (optional) |

---

## IGC COMMUNICATION

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_MSL` | IN | Missile telemetry + position |
| `MINER_BEACON` | IN | Miner status + camera info |
| `UNITY_SAT_RELAY_STATUS` | IN | Satellite status broadcasts |
| `UNITY_BOOT_REQ` | IN | Boot SIGNAL_CHECK request (accepts both `SIGNAL_CHECK` and `SIGNAL_CHECK:{padID}`) |
| `UNITY_BOOT_RSP` | OUT | Signal responds with camera/LCD counts |

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `UpdatePadFromName()` | Extract padID from PB name |
| `WriteSignalReady()` | Write ready flag with session ID |
| `WriteCustomData()` | Update all status sections |
| `ScanBlocks()` | Find cameras, antennas, LCDs |
| `ProcessMessages()` | Handle all IGC broadcasts |
| `UpdateLaserTargets()` | Assign lasers to track missiles |
| `ParseSatBroadcast()` | Process satellite status |
| `DrawCameraLCD()` | Sprite-based camera display |
| `UpdateEcho()` | Update PB info display |

---

## ANTENNA MANAGEMENT

Signal discovers all antennas on the pad grid:
- **Radio Antennas**: Counts enabled/broadcasting
- **Laser Antennas**: Counts connected, tracks assignments

### Laser Assignment Logic

1. When missile broadcasts position via UNITY_MSL
2. Signal parses X,Y,Z coordinates
3. Assigns nearest free laser to track missile
4. Updates laser target via `SetTargetCoords()`
5. Removes assignment when missile goes offline

---

## SATELLITE TRACKING

Listens to `UNITY_SAT_RELAY_STATUS` broadcasts:
- Tracks satellite ID, grid position (X,Z)
- Monitors battery%, H2%, laser links
- Records status (SAT_HOLD, ACTIVE, SAT_INTERCEPT)
- Times out stale satellites (no broadcast in 60 ticks)

---

## CAMERA SOURCES

| Source | Channel | Format |
|--------|---------|--------|
| Local Grid | Block scan | Cameras tagged `[PAD#]` |
| Missiles | UNITY_MSL | `...|CAMS:count|name1,...` |
| Miners | MINER_BEACON | `...|CAMS:id1,id2,...` |

---

## LCD TAGGING

### Camera LCDs
```
[PAD1CAMS]:1   - Camera LCD slot 1 for PAD1
[CTRLCAMS]:1   - Controller mode (all cameras)
```

### Status LCDs
```
[PAD1SIGNAL]   - Signal status overview
[PAD1DEFENSE]  - Defense weapons status
[PAD1SATS]     - Satellite constellation display
[PAD1PRESSURE] - Pressurization & airlock status
```

### Pressure LCD Features
The `[PAD#PRESSURE]` LCD displays:
- **Overall Pressure**: Bar graph with percentage and status (SEALED/LOW/BREACH)
- **Airlocks**: All door sets with visual door status (E=Exterior, I=Interior)
- **Door Colors**: Green=Closed, Yellow=Interior Open, Red=Exterior Open
- **Per-Airlock Pressure**: Individual pressure readings from airlock vents
- **Pad Vents**: All non-airlock vents with pressure bars
- **Emergency Status**: Shows EMERGENCY/LOCKED/NORMAL state

### Controller Mode
Auto-detected when any `[CTRLCAMS]` LCD exists on grid.

---

## COMMANDS

| Command | Action |
|---------|--------|
| `RESCAN` | Refresh block scan |
| `RESET` | Clear all data, re-initialize |

---

## CHARACTER BUDGET

| Script | Deployed | Budget | Status |
|--------|----------|--------|--------|
| UnitySignal | ~47,118 | 100,000 | OK (52.9% margin) |

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

---

*Unity AI Lab - Signal Systems Division*
