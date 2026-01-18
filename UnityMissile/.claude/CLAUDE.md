# UnityMissile - .claude Workflow System

Guided missile flight controller for the Unity Missile System. Handles all flight phases from launch to detonation.

**Location:** `Unity Missile System/UnityMissile/` (part of Unity Missile System)
**Version:** v01.00 | 2026-01-17

---

## CRITICAL: FILE SYNC RULE

**BOTH files MUST be kept in sync:**
- `UnityMissile.cs` - Raw script file (edit this)
- `UnityMissile/Program.cs` - MDK build file (auto-wrapped from UnityMissile.cs)

**WHEN EDITING:**
1. Edit `UnityMissile.cs` directly
2. Run `wrap-scripts.ps1` to sync to Program.cs
3. Build with `dotnet build UnityMissile -c Debug`

**THE RULE:** Always edit the raw .cs file, then wrap and build.

---

## BUILD AND DEPLOY

### Build Command

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityMissile -c Debug
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
| **Read limit parameter** | **EXACTLY 800** | **ANY OTHER VALUE = CHEATING** |
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
SAT_CLIMB → SAT_BRAKE → SAT_HOLD
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
| SAT_HOLD | Satellite: Station-keeping |

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

## IGC COMMUNICATION

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_MSL` | OUT | Telemetry to pad |
| `UNITY_MSL_CMD` | IN | Commands from pad (DETONATE, ABORT) |

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
| UnityMissile | ~44,000 | 26,058 | 100,000 | OK (74% margin) |

---

## Quick Reference

```powershell
# Build and deploy
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityMissile -c Debug

# Check deployed size
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs" -Raw).Length
```

---

*Unity AI Lab - Missile Systems Division*
