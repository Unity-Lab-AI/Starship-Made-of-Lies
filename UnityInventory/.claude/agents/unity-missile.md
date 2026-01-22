# UnityMissile - Missile Guidance

Reference documentation for UnityMissile when working on other Unity Missile System scripts.

---

## OVERVIEW

**Script:** `UnityMissile.cs`
**PB Name:** `PAD1 Missile #1 Program`
**Deployed:** `%APPDATA%\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs`
**Characters:** 24,321 (76% margin)

Guided missile flight controller handling all phases from launch to detonation.

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
| IDLE | Waiting for launch |
| CLIMB | Ascending to altitude |
| ARM | Warheads armed |
| COAST | Cruising to target |
| REENTRY | Descending |
| TARGET | Final approach |
| DETONATE | Impact |
| SAT_HOLD | Orbital station-keeping |

---

## TARGETING MODES

| Mode | Description |
|------|-------------|
| GPS | Fixed coordinates |
| ANTENNA | Track broadcasting antenna |
| SENSOR | Proximity detection |
| LIDAR | Camera raycast lock |
| MANUAL | Remote guided |
| SATELLITE | Orbital platform |

---

## CUSTOMDATA (Me.CustomData)

Missile reads config from PB at launch (written by UnityPad):

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
```

---

## IGC CHANNELS

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
| Remote Control | Navigation |
| Gyroscope(s) | Attitude control |
| Thruster(s) | Propulsion |
| Battery(s) | Power |
| Warhead(s) | Payload |
| Antenna | Telemetry |
| Sensor | Proximity (optional) |
| Camera | LIDAR (optional) |

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `ParseConfig()` | Read launch config from CustomData |
| `RunPhase()` | Execute current flight phase |
| `Navigate()` | Thrust vector control |
| `Detonate()` | Arm and trigger warheads |
| `BroadcastTelemetry()` | Send status via IGC |

---

## COMMUNICATION WITH UNITYPAD

1. **Pre-Launch:** UnityPad writes config to missile PB CustomData
2. **Launch:** Missile reads config, begins flight
3. **Flight:** Missile broadcasts telemetry on UNITY_MSL
4. **Control:** UnityPad can send DETONATE/ABORT via UNITY_MSL_CMD

---

## CHARACTER COUNT

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs").Length
```

---

*Unity AI Lab - Missile Systems Division*
