# UnityMissile - .claude Workflow System

Guided missile flight controller for the Unity Missile System. Handles all flight phases from launch to detonation.

**Location:** `Unity Missile System/src/scripts/UnityMissile/` (part of Unity Missile System)
**PB Name:** `[PAD1] Missile #1 Program`
**Version:** v01.00 | 2026-01-24

---

## Table of Contents

1. [File Sync Rule](#critical-file-sync-rule)
2. [Build and Deploy](#build-and-deploy)
3. [Critical Rules](#critical-rules-always-enforced)
4. [Flight Phases](#flight-phases)
5. [Targeting Modes](#targeting-modes)
6. [Configuration](#configuration)
7. [Per-PB CustomData Architecture](#per-pb-customdata-architecture)
8. [IGC Communication](#igc-communication)
9. [Required Blocks](#required-blocks)
10. [Character Budget](#character-budget)
11. [Quick Reference](#quick-reference)

---

## CRITICAL: FILE SYNC RULE

**BOTH files MUST be kept in sync:**
- `src/scripts/UnityMissile.cs` - Raw script file (edit this)
- `src/scripts/UnityMissile/Program.cs` - MDK build file (auto-wrapped from UnityMissile.cs)

**WHEN EDITING:**
1. Edit `src/scripts/UnityMissile.cs` directly
2. Run `tools/wrap-scripts.ps1` to sync to Program.cs
3. Build with `dotnet build "src/scripts/UnityMissile" -c Debug`

**THE RULE:** Always edit the raw .cs file, then wrap and build.

---

## BUILD AND DEPLOY

### Build Command

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build "src/scripts/UnityMissile" -c Debug
```

### Deploy Location

Script auto-deploys to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs
```

---

## CRITICAL RULES (ALWAYS ENFORCED)

| Rule | Value | Enforcement |
|------|-------|-------------|
| **SE Character Limit** | 100,000 chars on DEPLOYED script | Check deployed script.cs, NOT raw .cs |
| **NO COMMENTS IN SE SCRIPTS** | ABSOLUTE | Every char counts |
| **Read line count** | **ALWAYS 600 lines** | **Claude reads 600 lines per Read - NOT a limit, THE number. Read files, don't grep.** |
| **Read before edit** | FULL FILE | Mandatory before ANY edit |
| **Unity persona** | REQUIRED | Validated at every phase |
| **NO TESTS - EVER** | ABSOLUTE | We code it right the first time |
| **BUILD ONE SCRIPT AT A TIME** | **ABSOLUTE** | **NEVER build multiple scripts together** |
| **VERSION NUMBERS** | **USER ONLY** | **NEVER change version numbers - only user decides** |

---

## FLIGHT PHASES

### Standard Flight
```
IDLE → CLIMB → ARM → COAST → REENTRY → TARGET → DETONATE
```

### Satellite Mode
```
SAT_CLIMB → SAT_BRAKE → SAT_HOLD → (enemy detected) → SAT_INTERCEPT → DETONATE
```

| Phase | Description |
|-------|-------------|
| IDLE | Waiting for launch command |
| CLIMB | Ascending to cruise altitude |
| ARM | Warheads armed, preparing for attack |
| COAST | Cruising toward target |
| REENTRY | Descending toward target |
| TARGET | Final approach, tracking target |
| DETONATE | Impact/proximity detonation |
| SAT_CLIMB | Satellite: Ascending to orbit |
| SAT_BRAKE | Satellite: Slowing to orbital velocity |
| SAT_HOLD | Satellite: Station-keeping, enemy scanning |
| SAT_INTERCEPT | Satellite: Chase enemy, detonate within 10m |

---

## TARGETING MODES

| Mode | Description |
|------|-------------|
| GPS | Navigate to fixed coordinates |
| ANTENNA | Track broadcasting antenna |
| SENSOR | Proximity detection via sensor |
| LIDAR | Camera raycast lock |
| MANUAL | No auto-targeting, remote guided |
| SATELLITE | Deploy as orbital platform |

---

## CONFIGURATION

Missile reads config from PB CustomData at launch:

```ini
[UNITY_MISSILE]
Mode=GPS
GPS=1000,500,200
Antenna=Enemy Base
Broadcast=UNITY_MSL
Climb=500
Detonate=50
SensorRange=50
LidarRange=500
InSpace=0
Gravity=9.81
BurnTime=5
ReentryDist=500
FlightMode=2
```

---

## PER-PB CUSTOMDATA ARCHITECTURE

**CRITICAL:** Each script writes ONLY to `Me.CustomData` (its own PB). Scripts find and READ other PBs' CustomData when needed.

| PB Name Pattern | Script | Sections Owned |
|-----------------|--------|----------------|
| `[PAD{id}] UNITY BOOT` | Unity Boot | [SYSTEM] |
| `[PAD{id}] Unity Pad` | UnityPad | [BLACKBOX], [PAD_CFG], [PAD_STATUS], [PAD_DATA] |
| `[PAD{id}] Unity Inventory` | UnityInventory | [QUOTAS], [MISSILE], [CONFIG], inventory sections |
| Missile PB | UnityMissile | Own config only (reads launch config from pad) |
| `[BEACON]` | UnityBeacon | Own config only |

**BUILD RULE:** Only build scripts that have changes. Never build unchanged scripts.

**NOTE:** UnityMissile communicates via IGC only - reads launch config from its own PB CustomData.

### Multi-Pad Command Safety

**CRITICAL:** Bare `DETONATE` and `DEORBIT` commands are REMOVED. All destructive commands require padID qualification:

| Command | Status |
|---------|--------|
| `DETONATE` (bare) | **REMOVED** -- ignored |
| `DETONATE:{padID}` | Required -- only responds if padID matches |
| `DEORBIT` (bare) | **REMOVED** -- ignored |
| `DEORBIT:{padID}` | Required -- only responds if padID matches |

This prevents PAD1's missiles from responding to PAD2's commands in multi-pad setups.

---

## IGC COMMUNICATION

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_MSL` | OUT | Telemetry to pad |
| `UNITY_MSL_CMD` | IN | Commands from pad (DETONATE:{padID}, DEORBIT:{padID}, ABORT) |

### Telemetry Format
```
Phase|DistToTarget|Velocity|PosX,PosY,PosZ|Altitude|Fuel%|Status
```

---

## REQUIRED BLOCKS

| Block | Purpose |
|-------|---------|
| Remote Control | Navigation, gravity sensing |
| Gyroscope(s) | Attitude control |
| Thruster(s) | Propulsion (Atmo/H2/Ion) |
| Battery(s) | Power storage |
| Warhead(s) | Payload |
| Antenna | Telemetry broadcast |
| Sensor | Proximity detection (optional) |
| Camera | LIDAR targeting (optional) |

---

## CHARACTER BUDGET

| Script | Raw .cs | Deployed | Budget | Status |
|--------|---------|----------|--------|--------|
| UnityMissile | ~1,165 | ~44,563 | 100,000 | OK (55.4% margin) |

*Note: Character count increased with satellite laser mesh networking, grid tracking, and SAT_INTERCEPT phase.*

---

## Quick Reference

```powershell
# Build and deploy
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build "src/scripts/UnityMissile" -c Debug

# Check deployed size (CHARACTERS, not bytes)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs").Length
```

---

*Unity AI Lab - Missile Systems Division*
