![Unity Missile](Unity%20Missile%202.png)

# UNITY MISSILE v01.00

**Guided Missile Script | Multi-Mode Targeting | ICBM Flight | Satellite Mode**

---

## FEATURES

- **6 Targeting Modes** - GPS, ANTENNA, SENSOR, LIDAR, MANUAL, SATELLITE
- **3 Flight Modes** - AUTO (climb), ICBM (orbit), DIRECT (immediate)
- **ICBM Flight** - Climb, burn, coast, reentry trajectory
- **Smart Arming** - Arms based on distance, never on pad
- **Ammo Ejection** - Chaff/decoy payload on arm
- **Satellite Mode** - Deploy as communication relay
- **Telemetry Broadcast** - Real-time position/status to pad
- **Blackout Handling** - Queued commands during radio silence

---

## REQUIRED BLOCKS

| Block | Purpose |
|-------|---------|
| Merge Block | Docks to pad |
| Connector [DOCK] | Fuel/ammo loading |
| Remote Control | Orientation reference |
| Gyroscope | Attitude control |
| Thruster | Propulsion (H2/Ion/Atmo) |
| Battery | Power |
| Warhead | Payload (not for SATELLITE) |
| Programmable Block | Runs this script |

## OPTIONAL BLOCKS

| Block | Purpose |
|-------|---------|
| Connector [AMMO] | Ammo ejection before impact |
| H2 Tank | Extra fuel |
| O2/H2 Generator | Makes fuel from ice |
| Sensor | SENSOR targeting mode |
| Camera | LIDAR targeting mode |
| Radio Antenna | Telemetry broadcast |
| Laser Antenna | Direct link (no blackout) |

---

## TARGETING MODES

| Mode | Behavior |
|------|----------|
| **GPS** | Fly to X,Y,Z coordinates |
| **ANTENNA** | Track broadcasting antenna |
| **SENSOR** | Hunt with onboard sensors |
| **LIDAR** | Camera raycast lock-on |
| **MANUAL** | No guidance, fly straight |
| **SATELLITE** | Deploy as relay satellite |

---

## FLIGHT MODES

| Mode | Description |
|------|-------------|
| **AUTO** | Climb `climbDist` meters, then ARM phase |
| **ICBM** | Climb to zero-G + 1000m, coast trajectory |
| **DIRECT** | Skip climb, go straight to TARGET phase |

---

## FLIGHT PHASES

### State Machine
```
IDLE → LAUNCH → CLIMB → ARM → COAST → REENTRY → TARGET → DETONATE
                  |
                  +→ SAT_CLIMB → SAT_BRAKE → SAT_HOLD (Satellite Mode)
```

### Planetary Launch (ICBM)
```
LAUNCH → CLIMB → ARM → BURN → COAST → REENTRY → TARGET → IMPACT
```

| Phase | Behavior |
|-------|----------|
| CLIMB | Thrust UP until gravity < 0.05 m/s² |
| ARM | Arm warheads, enter space |
| BURN | Orient to target, thrust for X seconds |
| COAST | Engines OFF, ballistic trajectory |
| REENTRY | Gravity detected, re-enable thrusters |
| TARGET | Full thrust terminal guidance |

### Auto Launch
```
LAUNCH → CLIMB → ARM → TARGET → IMPACT
```
Climbs `climbDist` meters, then proceeds directly to targeting.

### Direct Launch
```
LAUNCH → TARGET → IMPACT
```
No climb phase - immediate engagement. Best for space combat.

---

## SATELLITE MODE

Deploy as stationary communication relay:

```
LAUNCH → SAT_CLIMB → SAT_BRAKE → SAT_HOLD
```

| Phase | Behavior |
|-------|----------|
| SAT_CLIMB | Thrust UP until gravity < 0.05 m/s² |
| SAT_BRAKE | Flip and brake to zero velocity |
| SAT_HOLD | Station keeping, relay communications |

Satellites:
- Warheads stay SAFE (never arm)
- Broadcast status on `UNITY_SAT_RELAY_STATUS`
- Relay missile telemetry
- Extend controller range

---

## SMART ARMING

Warheads use intelligent arming logic:

| Condition | Result |
|-----------|--------|
| Distance from pad < Climb * 2 | Stay SAFE |
| Distance to target < ArmDist | ARM warheads |

**Safety:**
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

Missile broadcasts on `UNITY_MSL`:
- Position (X, Y, Z)
- Distance to target
- Current phase
- Gravity reading
- Distance from pad

Pad receives and displays on LCD7.

---

## BLACKOUT HANDLING

Radio antennas have 50km range. ICBM climbs to 60km+.

| Status | Meaning |
|--------|---------|
| ENTERING_BLACKOUT | 95% of antenna range |
| (no signal) | Beyond range |
| CONTACT_RESTORED | Back in range |

**Laser Antenna** provides unlimited range (no blackout).

---

## SETTINGS (from pad)

| Setting | Range | Description |
|---------|-------|-------------|
| Climb | 50-500m | Distance before arming (AUTO mode) |
| Detonate | 10-100m | Proximity explosion |
| Flight | AUTO/ICBM/DIRECT | Flight mode selection |
| Burn | 1-15s | ICBM burn time |
| Reentry | 500-5000m | Reentry distance |
| Sensor | 10-100m | Sensor range |
| LIDAR | 500-5000m | Camera raycast range |
| Broadcast | ON/OFF | Antenna telemetry |

---

## BLOCK AUTO-NAMING

When missile docks, pad auto-names blocks:
```
Missile #1 Battery
Missile #1 Gyroscope
Missile #1 H2 Thruster
Missile #1 Warhead
Missile #1 Connector [DOCK]
Missile #1 Connector [AMMO]
```

---

## COMMANDS (from pad)

| Command | Action |
|---------|--------|
| LAUNCH | Start flight sequence |
| DETONATE | Remote detonation |
| ABORT | Explode immediately |

---

## IGC CHANNELS

| Channel | Purpose |
|---------|---------|
| `UNITY_MSL` | Telemetry broadcast |
| `UNITY_MSL_CMD` | Command listener |
| `UNITY_SAT_RELAY` | Satellite relay |
| `UNITY_SAT_RELAY_STATUS` | Satellite status |

---

## CHARACTER BUDGET

| Metric | Value |
|--------|-------|
| Raw Source | ~44,000 chars |
| Deployed | 26,058 chars |
| Budget | 100,000 chars |
| Status | OK (74% margin) |

---

## BUILD COMMAND

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityMissile -c Debug
```

Deploys to: `%APPDATA%\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs`

---

*Unity AI Lab - Missile Systems Division*
*Version v01.00 | 2026-01-17*
