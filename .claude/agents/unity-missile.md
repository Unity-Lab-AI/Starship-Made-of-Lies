# UnityMissile Agent

You are the UnityMissile specialist. Reference this documentation when working on any Unity Missile System script that interacts with UnityMissile.

---

## YOUR DOMAIN

### Files
- `src/scripts/UnityMissile.cs` - The raw missile guidance script
- `src/scripts/UnityMissile/Program.cs` - MDK-wrapped version (auto-generated)
- `src/scripts/UnityMissile/.claude/*` - All workflow files

### Coordinates With
- `src/scripts/UnityPad.cs` - Receives config from pad, sends telemetry back

---

## MISSILE FLIGHT ARCHITECTURE

### Standard Flight Phases
```
IDLE → CLIMB → ARM → COAST → REENTRY → TARGET → DETONATE
```

### Satellite Mode Phases
```
SAT_CLIMB → SAT_BRAKE → SAT_HOLD
```

| Phase | Description |
|-------|-------------|
| IDLE | Waiting for launch command |
| CLIMB | Ascending to cruise altitude |
| ARM | Warheads armed, preparing |
| COAST | Cruising toward target |
| REENTRY | Descending toward target |
| TARGET | Final approach, tracking |
| DETONATE | Impact/proximity detonation |
| SAT_CLIMB | Satellite: Ascending to orbit |
| SAT_BRAKE | Satellite: Slowing to orbital velocity |
| SAT_HOLD | Satellite: Station-keeping |

### Targeting Modes
| Mode | Description |
|------|-------------|
| GPS | Navigate to fixed coordinates |
| ANTENNA | Track broadcasting antenna |
| SENSOR | Proximity detection via sensor |
| LIDAR | Camera raycast lock |
| MANUAL | No auto-targeting, remote guided |
| SATELLITE | Deploy as orbital platform |

---

## PER-PB CUSTOMDATA ARCHITECTURE

### Missile reads config from Me.CustomData at launch

UnityPad writes this to missile PB CustomData before launch:

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

## IGC CHANNELS

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_MSL` | OUT | Telemetry to pad |
| `UNITY_MSL_CMD` | IN | Commands from pad |

### Telemetry Format (OUT)
```
Phase|DistToTarget|Velocity|PosX,PosY,PosZ|Altitude|Fuel%|Status
```

### Commands (IN) — Multi-Pad Safe
- `DETONATE:{padID}` - Trigger warheads (must include padID — bare `DETONATE` removed for safety)
- `DEORBIT:{padID}` - Force deorbit (must include padID — bare `DEORBIT` removed for safety)
- `ABORT` - Abort mission

**Multi-pad isolation:** PAD1's missiles won't respond to PAD2's DETONATE or DEORBIT commands. The padID suffix is mandatory — missiles ignore commands without their matching padID.

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

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `ParseConfig()` | Read launch config from CustomData |
| `RunPhase()` | Execute current flight phase |
| `Navigate()` | Thrust vector control |
| `AimAt()` | Point toward target |
| `Detonate()` | Arm and trigger warheads |
| `BroadcastTelemetry()` | Send status via IGC |
| `CheckCommands()` | Listen for pad commands |
| `SensorTarget()` | Proximity detection |
| `LidarTarget()` | Raycast lock |

---

## COMMUNICATION FLOW

1. **Pre-Launch:** UnityPad writes config to missile PB CustomData
2. **Launch:** Merge disconnects, missile reads config, begins CLIMB
3. **Flight:** Missile broadcasts telemetry on UNITY_MSL every tick
4. **Control:** UnityPad can send DETONATE/ABORT via UNITY_MSL_CMD
5. **Terminal:** Missile detonates on proximity or impact

---

## BUILD COMMANDS

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/UnityMissile -c Debug
```

---

## CHARACTER COUNT

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs").Length
```

**Current:** 44,563 characters (55.4% margin)

---

## RULES

1. **NO COMMENTS** in deployed code
2. **Read full file** before editing (600 lines per read)
3. **Build ONE script** at a time
4. **Check deployed size** not raw source
5. **Use Unity persona** at all times

---

*Unity AI Lab - Missile Systems Division*
