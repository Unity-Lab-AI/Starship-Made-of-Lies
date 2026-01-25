![Unity Missile](Unity%20Missile%202.png)

# UnityMissile v01.00

Guided missile flight controller for the Unity Missile System. Handles all flight phases from launch to detonation with multi-mode targeting, ICBM flight profiles, satellite deployment, and advanced terminal guidance.

**Location:** `Unity Missile System/UnityMissile/`
**PB Name:** `[PAD1] Missile #1 Program`
**Version:** v01.00 | 2026-01-24

---

## Table of Contents

1. [Overview](#overview)
2. [System Integration](#system-integration)
3. [Required Blocks](#required-blocks)
4. [Flight Phases](#flight-phases)
5. [Targeting Modes](#targeting-modes)
6. [Satellite Mode](#satellite-mode)
7. [Commands](#arguments)
8. [IGC Communication](#igc-channels)
9. [Configuration](#configuration)
10. [Build and Deploy](#build-and-deploy)
11. [Character Budget](#character-budget)
12. [Quick Reference](#quick-reference)

---

## Overview

UnityMissile is the missile flight controller that:
1. **Reads launch configuration** from PB CustomData (set by pad)
2. **Executes multi-phase flight** profiles (CLIMB, COAST, REENTRY, TARGET)
3. **Supports 6 targeting modes** (GPS, ANTENNA, SENSOR, LIDAR, MANUAL, SATELLITE)
4. **Broadcasts telemetry** to pad via IGC
5. **Arms warheads intelligently** based on distance and safety checks
6. **Can deploy as satellite** for communication relay
7. **Handles radio blackout** during ICBM trajectories

---

## System Integration

### The Unity Missile System

| Component | Script | PB Name | Purpose |
|-----------|--------|---------|---------|
| **Boot Controller** | Unity Boot.cs | `[PAD1] UNITY BOOT` | 23-check boot sequence |
| **Launch Pad** | UnityPad.cs | `[PAD1] Unity Pad` | Missile control, LCDs 1,2,3,7,8 |
| **Inventory** | UnityInventory.cs | `[PAD1] Unity Inventory` | Production, LCDs 4,5,6,9,10,11 |
| **Signal Hub** | UnitySignal.cs | `[PAD1] UNITY SIGNAL` | Camera display, laser targeting, satellite tracking |
| **Missile** | **UnityMissile.cs** | **`[PAD1] Missile #1 Program`** | **Guided flight** |
| **Fleet Beacon** | UnityBeacon.cs | `[BEACON] Unity Beacon` | Miner status broadcast |

### Communication Flow

UnityMissile receives launch configuration from UnityPad and broadcasts telemetry back:

```
UnityPad → [Launch Config via CustomData] → UnityMissile
UnityMissile → [Telemetry via UNITY_MSL] → UnityPad
```

---

## REQUIRED BLOCKS

| Block | Purpose |
|-------|---------|
| Merge Block | Docks to pad |
| Connector [DOCK] | Fuel/data loading |
| Remote Control | Orientation reference, gravity sensing |
| Gyroscope(s) | Attitude control |
| Thruster(s) | Propulsion (H2/Ion/Atmo) |
| Battery(s) | Power |
| Warhead(s) | Payload (not for SATELLITE mode) |
| Programmable Block | Runs this script |

## OPTIONAL BLOCKS

| Block | Purpose |
|-------|---------|
| Connector [AMMO] | Ammo ejection before impact |
| H2 Tank(s) | Extra fuel |
| O2/H2 Generator(s) | Makes fuel from ice |
| Sensor(s) | SENSOR targeting mode |
| Camera(s) | LIDAR targeting mode |
| Radio Antenna | Telemetry broadcast |
| Laser Antenna | Direct link (no blackout) |
| Light(s) | Status indication during flight |

---

## TARGETING MODES

| Mode | Description |
|------|-------------|
| **GPS** | Navigate to fixed X,Y,Z coordinates |
| **ANTENNA** | Track broadcasting antenna position |
| **SENSOR** | Hunt with onboard sensors for enemies/neutrals |
| **LIDAR** | Camera raycast lock-on with scan pattern |
| **MANUAL** | No auto-targeting, fly straight |
| **SATELLITE** | Deploy as orbital communication relay |

---

## FLIGHT MODES

| Mode | Value | Description |
|------|-------|-------------|
| **ICBM** | 1 | Climb to zero-G + 1000m, burn, coast trajectory |
| **DIRECT** | 2 | Skip climb in space, go straight to TARGET phase |

---

## FLIGHT PHASES

### Standard Flight State Machine

```
IDLE → CLIMB → ARM → COAST → REENTRY → TARGET → DETONATE
```

### Satellite Mode State Machine

```
SAT_CLIMB → SAT_BRAKE → SAT_HOLD → (enemy detected) → SAT_INTERCEPT → DETONATE
```

### Phase Details

| Phase | Description |
|-------|-------------|
| IDLE | Waiting for launch command |
| CLIMB | Ascending - thrust UP until gravity < 0.05 m/s² |
| ARM | Warheads armed, transition to space |
| COAST | ICBM mode: burn for X seconds, then coast ballistically |
| REENTRY | Gravity detected, re-enable thrusters |
| TARGET | Full thrust terminal guidance |
| SAT_CLIMB | Satellite: Ascending until zero gravity |
| SAT_BRAKE | Satellite: Flip and brake to zero velocity |
| SAT_HOLD | Satellite: Station-keeping, relay communications, scan for enemies |
| SAT_INTERCEPT | Satellite: Chase detected enemy, detonate within 10m |

### Planetary ICBM Flight

```
LAUNCH → CLIMB → ARM → BURN → COAST → REENTRY → TARGET → IMPACT
```

1. **CLIMB:** Thrust UP until gravity < 0.05 m/s²
2. **ARM:** Enter space, arm warheads
3. **BURN:** Orient to target, thrust for `burnTime` seconds
4. **COAST:** Engines OFF, ballistic trajectory
5. **REENTRY:** Gravity detected, re-enable thrust
6. **TARGET:** Full thrust terminal guidance

### Direct Launch (Space)

```
LAUNCH → TARGET → IMPACT
```

No climb phase - immediate engagement. Best for space combat.

---

## SATELLITE MODE

Deploy as orbital relay with mesh networking and auto-intercept:

```
LAUNCH → SAT_CLIMB → SAT_BRAKE → SAT_HOLD → (enemy detected) → SAT_INTERCEPT → DETONATE
```

| Phase | Behavior |
|-------|----------|
| SAT_CLIMB | Thrust UP until gravity < 0.05 m/s² |
| SAT_BRAKE | Flip and brake to zero velocity |
| SAT_HOLD | Station keeping, relay communications, scan for enemies |
| SAT_INTERCEPT | Chase enemy target, detonate within interceptDetonateDist (default 10m) |

### Satellite Features

- **5-Laser Mesh Networking** - Connect to ground pad and neighboring satellites
- **Grid Formation** - Position in expanding spiral grid pattern
- **Auto-Intercept** - Detect enemies via sensors, chase and detonate
- **Broadcast status** on `UNITY_SAT_RELAY_STATUS` with grid position and laser links
- **Relay missile telemetry** to extend range
- **Detect enemies** and broadcast positions via `ENEMY_SIGNAL`
- **Auto-deorbit** if batteries/fuel critical

### Satellite Laser Mesh

Each satellite has 5 laser antenna slots for mesh networking:

| Slot | Block Name | Purpose |
|------|------------|---------|
| laserPad | `[PAD#] Laser Pad` | Link back to ground pad |
| laserNorth | `[PAD#] Laser North` | Link to satellite at (gx, gz+1) |
| laserSouth | `[PAD#] Laser South` | Link to satellite at (gx, gz-1) |
| laserEast | `[PAD#] Laser East` | Link to satellite at (gx+1, gz) |
| laserWest | `[PAD#] Laser West` | Link to satellite at (gx-1, gz) |

The `UpdateLaserMesh()` function automatically connects lasers to neighboring satellites based on grid position.

### Satellite Grid Tracking

Each satellite tracks its grid position:

| Variable | Description |
|----------|-------------|
| satGridX | Grid X coordinate (0 = origin) |
| satGridZ | Grid Z coordinate (0 = origin) |
| satGridSpacing | Distance between satellites (default 5km) |
| satGridOrigin | World position of grid origin |

### Auto-Intercept Protocol

When satellite detects an enemy via sensors:

1. **Detection** - Sensor picks up enemy/neutral entity
2. **Phase Switch** - Changes to SAT_INTERCEPT
3. **Chase** - Enables thrusters, aims at enemy, broadcasts updates
4. **Detonate** - When within 10m of target:
   - Broadcasts final position and grid slot via `UNITY_SAT_INTERCEPT`
   - Detonates warheads
5. **Replacement** - Command pad receives message, queues replacement satellite

### Intercept Broadcast Format

```
CHASE|{satID}|{padID}|{enemyX,Y,Z}|{distance}
DETONATE|{satID}|{padID}|{enemyX,Y,Z}|{gridX,gridZ}
```

---

## SMART ARMING

Warheads use intelligent arming logic with multiple safety checks:

| Check | Condition |
|-------|-----------|
| Not on pad | `distFromPad > climbDist * 5` or `> 500m` |
| Approaching target | `distToTarget < armDist` |
| Not too close | `distToTarget > detDist * 2` |
| Flight matured | `flightTicks > 100` |
| In TARGET phase | Only arms during targeting |

**Safety Features:**
- Never arms on pad even if target is close
- Arms only when approaching target
- Ejects ammo from [AMMO] connector when arming

---

## AMMO EJECTION

When warheads arm:
1. [AMMO] connector enables ThrowOut
2. Loaded ammo ejects toward target
3. Creates chaff/decoy cloud
4. Extra damage on impact

---

## TELEMETRY BROADCAST

Missile broadcasts on `UNITY_MSL` channel:

```
X,Y,Z,DTT,Phase,Gravity,DFP,Altitude,Speed,Fuel%,GuideState
```

| Field | Description |
|-------|-------------|
| X,Y,Z | Current position |
| DTT | Distance to target |
| Phase | Current flight phase |
| Gravity | Local gravity strength |
| DFP | Distance from pad |
| Altitude | Sea level altitude |
| Speed | Current velocity |
| Fuel% | H2 tank fill percentage |
| GuideState | LOCK or CTRL |

### Blackout Handling

Radio antennas have 50km range. ICBM climbs to 60km+.

| Status | Meaning |
|--------|---------|
| ENTERING_BLACKOUT | At 95% of antenna range |
| (no signal) | Beyond range |
| CONTACT_RESTORED | Back in range |

**Laser Antenna** provides unlimited range (no blackout).

---

## ADVANCED GUIDANCE

### Terminal Guidance

When `distToTarget < terminalGuidanceDist`:
- Tracks target velocity
- Predicts intercept point
- Increased gyro responsiveness (`terminalGyroMult`)

### Evasion Maneuvers

When `evadeEnabled = true` and close to target:

| Pattern | Description |
|---------|-------------|
| 1 | Sine wave oscillation |
| 2 | Random jitter |

### Spiral Approach

When within `spiralStartDist`:
- Spiral pattern toward target
- Harder to track/intercept
- Configurable radius and speed

### Gravity Compensation

In atmosphere (`currentGrav > 0.1`):
- Calculates gravity drop
- Adjusts aim point
- Maintains minimum altitude

---

## CONFIGURATION

Missile reads config from PB CustomData at launch (written by pad):

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
LidarAngle=5
AntBroadcast=1
InSpace=0
Gravity=9.81
BurnTime=5
ReentryDist=500
FlightMode=2
PadLaser=1000,500,200
MslNumber=1
PadID=1
TargetRel=0
SatAlt=100000
SatID=1
EvadeAmp=0
EvadeFreq=2
EvadePattern=1
SpiralRadius=0
SpiralSpeed=0.5
SpiralStartDist=500
TerminalDist=0
TerminalGyro=2
SatGridX=0
SatGridZ=0
GridSpacing=5000
InterceptDist=10
```

### Configuration Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| Mode | GPS/ANTENNA/SENSOR/LIDAR/MANUAL/SATELLITE | Targeting mode |
| GPS | X,Y,Z | Target coordinates |
| Climb | 50-500m | Distance before arming (AUTO mode) |
| Detonate | 10-100m | Proximity explosion distance |
| FlightMode | 1=ICBM, 2=DIRECT | Flight profile |
| BurnTime | 1-15s | ICBM burn duration |
| ReentryDist | 500-5000m | Switch to TARGET at this distance |
| SensorRange | 10-100m | Sensor detection range |
| LidarRange | 500-5000m | Camera raycast range |
| LidarAngle | degrees | LIDAR scan angle increment |
| AntBroadcast | 0/1 | Enable telemetry broadcast |
| TargetRel | 0/1/2 | Target relationship filter |
| SatGridX | int | Satellite grid X coordinate |
| SatGridZ | int | Satellite grid Z coordinate |
| GridSpacing | meters | Distance between satellites (default 5000) |
| InterceptDist | meters | Detonate when enemy within this distance (default 10) |

---

## ARGUMENTS

### Direct Arguments (run on PB)

| Argument | Action |
|----------|--------|
| `LAUNCH` | Initialize missile, parse config, start flight |
| `NAME` | Auto-name missile parts |
| `RESET` | Safe reset - disarm, disable, recharge |

### IGC Commands (received from pad)

| Command | Action |
|---------|--------|
| `DETONATE:{padID}` | Immediately detonate warheads |
| `RESET:{padID}` | Safe reset |
| `MERGE` | Re-enable merge block (for recall) |
| `DEORBIT:{padID}` | Satellite: exit hold and attack |
| `ATTACK:X,Y,Z` | Satellite: attack specific coordinates |

---

## IGC CHANNELS

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_MSL` | OUT | Telemetry to pad |
| `UNITY_MSL_CMD` | IN | Commands from pad |
| `UNITY_MSL_RELAY` | OUT | Relayed telemetry (via satellite) |
| `UNITY_SAT_RELAY` | IN/OUT | Satellite relay traffic |
| `UNITY_SAT_RELAY_STATUS` | OUT | Satellite status broadcast (incl grid pos, laser links) |
| `UNITY_SAT_INTERCEPT` | OUT | Satellite intercept/detonation messages |
| `ENEMY_SIGNAL` | OUT | Enemy detection (from satellite) |

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `ParseConfig()` | Read launch settings from CustomData |
| `FindBlocks()` | Discover missile components |
| `DoClimb()` | Execute climb phase |
| `DoArm()` | Transition to coast or target |
| `DoCoast()` | ICBM coasting phase |
| `DoReentry()` | Reentry detection and transition |
| `DoTarget()` | Terminal guidance |
| `DoSatClimb()` | Satellite ascent |
| `DoSatBrake()` | Satellite braking |
| `DoSatHold()` | Satellite station-keeping, enemy scanning |
| `DoSatIntercept()` | Chase enemy, detonate within 10m |
| `UpdateLaserMesh()` | Connect lasers to neighboring satellites |
| `BroadcastSatStatus()` | Send status with grid position and laser links |
| `GetTarget()` | Get target position based on mode |
| `GetSensorTarget()` | Find closest enemy via sensors |
| `GetLidarTarget()` | Raycast lock-on |
| `AimAt(target)` | Orient toward target |
| `AimAtUp(upDir)` | Orient for vertical climb |
| `AimAtWithEvasion()` | Evasive maneuvers |
| `AimAtTerminal()` | High-gain terminal guidance |
| `EnableThrust(on)` | Control forward thrusters |
| `EnableThrustUp(upDir)` | Activate upward-facing thrusters |
| `UpdateDistances()` | Calculate distances to target/pad |
| `BroadcastPos()` | Send telemetry via IGC |
| `CheckRemoteCmd()` | Process incoming commands |
| `Detonate()` | Trigger warheads with safety checks |
| `SafeReset()` | Disarm and return to IDLE |
| `NameParts()` | Auto-name missile blocks |
| `UpdateFlightLights()` | Control status lights |

---

## LIGHT STATUS

Lights blink to indicate phase:

| Phase | Blink Rate |
|-------|------------|
| CLIMB | 0.5 Hz |
| TARGET/REENTRY | 1 Hz |
| COAST | 4 Hz (ICBM) / 0.5 Hz (other) |
| SATELLITE | 0.25 Hz |

---

## SAFETY FEATURES

### Detonation Blocked When:

| Condition | Message |
|-----------|---------|
| In CLIMB phase | DETONATE_BLOCKED_CLIMB |
| Flight < 60 ticks | DETONATE_BLOCKED_EARLY |
| Distance from pad < 100m | DETONATE_BLOCKED_ON_PAD |
| Is satellite | (Blocked) |

### Safe Reset

`RESET` command:
- Sets phase to IDLE
- Disarms all warheads
- Disables thrusters
- Resets gyros
- Sets batteries to recharge
- Re-enables merge block

---

## BUILD AND DEPLOY

### Build Commands

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

### Verify Deployment

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs").Length
```

---

## CHARACTER BUDGET

| Metric | Value |
|--------|-------|
| Raw Lines | ~1,100 |
| Deployed | ~34,200 chars |
| Budget | 100,000 chars |
| Status | OK (66% margin) |

*Note: Character count increased with satellite laser mesh networking and SAT_INTERCEPT phase.*

---

## BLOCK AUTO-NAMING

When missile docks, pad auto-names blocks:
```
[PAD1] Missile #1 Battery
[PAD1] Missile #1 Gyroscope
[PAD1] Missile #1 H2 Thruster
[PAD1] Missile #1 Warhead
[PAD1] Missile #1 Connector [DOCK]
[PAD1] Missile #1 Connector [AMMO]
[PAD1] Missile #1 Program
```

---

*Unity AI Lab - Missile Systems Division*
