# UnityMissile - Architecture Reference

*Last Updated: 2026-01-20*
*Unity AI Lab - Missile Systems Division*

---

## Overview

In-flight guidance system for the Unity Missile System. Handles:
- Flight phase management
- Target tracking (6 modes)
- Attitude control
- Warhead arming/detonation
- Telemetry broadcast
- Satellite station-keeping

**Character Budget:** ~25,000 deployed / 100,000 limit (OK - 75% margin)

---

## Flight Phases

```
enum F { IDLE, CLIMB, ARM, COAST, REENTRY, TARGET, SAT_CLIMB, SAT_BRAKE, SAT_HOLD }
```

### Standard Flight
```
IDLE → CLIMB → ARM → COAST → REENTRY → TARGET → [DETONATE]
```

| Phase | Description | Transition |
|-------|-------------|------------|
| IDLE | On pad, waiting | Config received → CLIMB |
| CLIMB | Ascending (up or forward) | Altitude reached → ARM |
| ARM | Warheads armed | In space → COAST, else TARGET |
| COAST | Ballistic trajectory | Gravity detected → REENTRY |
| REENTRY | Re-entering atmosphere | Close to target → TARGET |
| TARGET | Terminal guidance | Proximity → DETONATE |

### Satellite Mode
```
SAT_CLIMB → SAT_BRAKE → SAT_HOLD
```

| Phase | Description |
|-------|-------------|
| SAT_CLIMB | Ascending until zero-G |
| SAT_BRAKE | Killing velocity |
| SAT_HOLD | Station-keeping, relay |

---

## Targeting Modes

```
enum T { GPS, ANTENNA, SENSOR, LIDAR, MANUAL, SATELLITE }
```

| Mode | Guidance | Best For |
|------|----------|----------|
| GPS | Fly to coordinates | Static targets |
| ANTENNA | Track broadcasting signal | Ships, bases |
| SENSOR | Proximity hunting | Moving targets |
| LIDAR | Camera raycast | Precise strikes |
| MANUAL | No guidance | Remote control |
| SATELLITE | Station-keeping | Relay network |

---

## Configuration

Missile reads config from PB CustomData on launch:

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
ArmDist=200
```

### Config Variables
| Key | Variable | Default |
|-----|----------|---------|
| Mode | `tgtMode` | GPS |
| GPS | `tgtGPS` | 0,0,0 |
| Antenna | `tgtAntenna` | "" |
| Climb | `climbDist` | 500 |
| Detonate | `detDist` | 50 |
| BurnTime | `burnTime` | 5 |
| ReentryDist | `reentryDist` | 500 |
| ArmDist | `armDist` | detDist*4 |

---

## IGC Communication

### Outbound (Telemetry)
```
Channel: UNITY_MSL
Format: Phase|DistToTarget|Velocity|X,Y,Z|Altitude|Fuel%|Status
```

### Inbound (Commands)
```
Channel: UNITY_MSL_CMD
Commands: DETONATE, ABORT
```

### Satellite Relay
```
Channels: UNITY_SAT_RELAY, UNITY_SAT_RELAY_STATUS
```

---

## Required Blocks

| Block | Purpose | Required |
|-------|---------|----------|
| Remote Control | Navigation | YES |
| Gyroscope(s) | Attitude | YES |
| Thruster(s) | Propulsion | YES |
| Battery(s) | Power | YES |
| Warhead(s) | Payload | YES* |
| Antenna | Telemetry | NO |
| Sensor | SENSOR mode | NO |
| Camera | LIDAR mode | NO |

*Warheads optional for satellite mode

---

## Key Variables

### Flight State
| Var | Purpose |
|-----|---------|
| `phase` | Current flight phase |
| `tgtMode` | Targeting mode |
| `tgtGPS` | Target coordinates |
| `climbDist` | Climb distance |
| `detDist` | Detonation distance |
| `armDist` | Arming distance |

### Telemetry
| Var | Purpose |
|-----|---------|
| `distToTgt` | Distance to target |
| `speed` | Current velocity |
| `altitude` | Height above ground |
| `gravity` | Local gravity |

### Satellite
| Var | Purpose |
|-----|---------|
| `isSatellite` | Satellite mode flag |
| `satPosition` | Station-keeping position |
| `satID` | Satellite identifier |

---

## Key Functions

### Flight Control
- `Main()` → Phase router
- `DoClimb()` → Ascent logic
- `DoArm()` → Warhead arming
- `DoCoast()` → Ballistic flight
- `DoReentry()` → Atmosphere entry
- `DoTarget()` → Terminal guidance
- `Detonate()` → Warhead trigger

### Satellite
- `DoSatClimb()` → Orbit insertion
- `DoSatBrake()` → Velocity kill
- `DoSatHold()` → Station-keeping
- `RelayMissileTraffic()` → Communication relay

### Navigation
- `AimAt(Vector3D)` → Point at target
- `AimAtUp()` → Vertical orientation
- `EnableThrust()` → Activate thrusters
- `EnableThrustUp()` → Upward thrust only

### Communication
- `BroadcastPos()` → Send telemetry
- `BroadcastSatStatus()` → Satellite status
- `CheckCommands()` → Process IGC

---

## ICBM Flight Profile

### Planet Launch (High Altitude Target)
1. **CLIMB** - Thrust UP until gravity < 0.05 m/s²
2. **ARM** - Arm warheads, capture direction
3. **COAST** - Burn for `burnTime` seconds, then engines OFF
4. **REENTRY** - Gravity detected, re-enable thrust
5. **TARGET** - Terminal guidance to impact

### Space Launch
1. **CLIMB** - Thrust FORWARD for `climbDist`
2. **ARM** - Arm warheads
3. **COAST** - Ballistic toward target
4. **TARGET** - Terminal guidance

---

## Safety Systems

### Arming Logic
- Never arm on pad (100m safety)
- Only arm when approaching target
- Distance check: `distToTgt < armDist && distFromPad > climbDist*2`

### Stuck Detection
- Monitor closing rate
- If not closing for X ticks, detonate
- Prevents missiles circling forever

### Satellite Safety
- `isSatellite` flag prevents warhead arming
- `Detonate()` returns early for satellites
- No boom, just relay

---

## Thruster Management

### During Flight
```csharp
EnableThrust()     // All thrusters ON
EnableThrustUp()   // Only upward thrusters
DisableThrust()    // All OFF (coast)
```

### Thruster Detection
- Atmospheric: SubtypeId contains "Atmospheric"
- Hydrogen: SubtypeId contains "Hydrogen"
- Ion: Default (no keyword)

---

*Unity AI Lab - Missile Systems Division*
