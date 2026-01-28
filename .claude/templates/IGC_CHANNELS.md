# UNIFIED IGC CHANNELS REFERENCE

**Last Updated:** 2026-01-28
**Purpose:** Complete IGC (Inter-Grid Communication) channel reference for Unity Missile System

---

## ALL IGC CHANNELS

| Channel | Sender | Receiver | PadID Filtering | Purpose |
|---------|--------|----------|-----------------|---------|
| `UNITY_BOOT_REQ` | Boot | Pad/Inv/Signal | **Yes** - includes padID in request | Request system status during boot |
| `UNITY_BOOT_RSP` | Pad/Inv/Signal | Boot | Yes - response includes padID | Respond with block counts |
| `UNITY_MSL` | Missile | Pad/Signal | No - broadcast to all | Telemetry broadcast (position, phase, fuel) |
| `UNITY_MSL_CMD` | Pad | Missile | **Yes** - DETONATE requires padID | Commands (DETONATE, ABORT, RESET) |
| `UNITY_PAD_CMD` | Controller | Slave Pads | **Yes** - filtered by padID (SETUPMOD) | Mass commands (BUILDALL, ARMALL, LAUNCHALL, SETUPMOD) |
| `UNITY_PAD_STATUS` | All Pads | Controller | Yes - status includes padID | Status updates for multi-pad display |
| `UNITY_SAT_RELAY` | Satellite | Satellite | No - mesh relay | Inter-satellite mesh relay traffic |
| `UNITY_SAT_RELAY_STATUS` | Satellite | Pad/Signal | No - broadcast to all | Status with grid position, laser links |
| `UNITY_SAT_INTERCEPT` | Satellite | Pad/Signal | Yes - includes padID | Intercept/detonation messages |
| `ENEMY_SIGNAL` | External/Sat | Controller | No - broadcast to all | Enemy positions for auto-attack |
| `MINER_BEACON` | UnityBeacon | Pad/Inv/Boot | **Yes** - bcnPad field filters by pad | Fleet status (battery, cargo, position) |
| `UNITY_PRINTER` | Printer | Pad | No - local grid only | Build completion notification |
| `UNITY_SIGNAL_CMD` | Pad | Signal | Yes - padID scoped | Signal commands (TRACK, LASER, RESCAN) |
| `UNITY_SIGNAL_RSP` | Signal | Pad | Yes - padID scoped | Signal command responses |

---

## BOOT HANDSHAKE PROTOCOL

### Request (Boot → Pad/Inv/Signal)

**Channel:** `UNITY_BOOT_REQ`

```
PAD_CHECK:{padID}      # Request Pad status (padID for multi-pad isolation)
INV_CHECK:{padID}      # Request Inventory status
SIGNAL_CHECK:{padID}   # Request Signal status
```

**Note:** The padID is included so that on multi-pad grids, only the correct sibling scripts respond to their own boot controller's requests.

### Response (Pad/Inv → Boot)

**Channel:** `UNITY_BOOT_RSP`

```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
```

| Field | Meaning |
|-------|---------|
| PAD/INV | Script identifier |
| OK | Status (OK or ERROR) |
| merge | Merge block count |
| con | Connector count |
| bat | Battery count |
| h2/o2 | Tank counts |
| prt | Printer blocks (pistons + welders) |
| cargo | Cargo container count |
| ref | Refinery count |
| asm | Assembler count |
| gen | Generator count |

---

## MISSILE TELEMETRY

### Telemetry (Missile → Pad)

**Channel:** `UNITY_MSL`

```
X,Y,Z,DTT,Phase,Gravity,DFP,Altitude,Speed,Fuel%,GuideState|CAMS:count|cam1,cam2,...
```

| Field | Description |
|-------|-------------|
| X,Y,Z | Current world position |
| DTT | Distance to target (meters) |
| Phase | Flight phase (CLIMB, ARM, COAST, TARGET, etc.) |
| Gravity | Local gravity strength (m/s²) |
| DFP | Distance from pad (meters) |
| Altitude | Sea level altitude (meters) |
| Speed | Current velocity (m/s) |
| Fuel% | H2 tank fill percentage |
| GuideState | Guidance status (LOCK or CTRL) |
| CAMS:count | Camera count (optional) |
| cam1,cam2 | Camera names (optional) |

### Commands (Pad → Missile)

**Channel:** `UNITY_MSL_CMD`

| Command | PadID Required | Action |
|---------|----------------|--------|
| `DETONATE:{padID}` | **Yes** | Immediately detonate warheads (missile checks padID matches) |
| `RESET:{padID}` | **Yes** | Safe reset - disarm, disable, recharge |
| `MERGE` | No | Re-enable merge block (for recall) |
| `DEORBIT:{padID}` | **Yes** | Satellite: exit hold and attack |
| `ATTACK:X,Y,Z` | No | Satellite: attack specific coordinates |

---

## SATELLITE CONSTELLATION

### Status Broadcast (Satellite → Pad)

**Channel:** `UNITY_SAT_RELAY_STATUS`

```
SAT|{satID}|{X,Y,Z}|{bat%}|{h2%}|{status}|{gridX},{gridZ}|{laserLinks}
```

| Field | Description |
|-------|-------------|
| satID | Satellite identifier (missile number) |
| X,Y,Z | Current world position |
| bat% | Battery percentage |
| h2% | Hydrogen percentage |
| status | Phase (SAT_HOLD, SAT_INTERCEPT, etc.) |
| gridX,gridZ | Grid coordinates in satellite mesh |
| laserLinks | Connected lasers (PAD,NORTH,SOUTH,EAST,WEST) |

**Example:**
```
SAT|3|50000,100000,25000|85|60|SAT_HOLD|1,0|PAD,NORTH,SOUTH
```

### Intercept Messages (Satellite → Pad)

**Channel:** `UNITY_SAT_INTERCEPT`

```
CHASE|{satID}|{padID}|{enemyX,Y,Z}|{distance}
DETONATE|{satID}|{padID}|{enemyX,Y,Z}|{gridX,gridZ}
```

| Message | When Sent |
|---------|-----------|
| CHASE | Satellite detected enemy, switching to intercept |
| DETONATE | Satellite within 10m of enemy, about to detonate |

---

## MULTI-PAD CONTROLLER

### Commands (Controller → Slaves)

**Channel:** `UNITY_PAD_CMD`

| Command | Action |
|---------|--------|
| `COPYTGT:{gps}` | Set target on all pads |
| `BUILD` | Start printing on empty pads |
| `ARM` | Arm all ready missiles |
| `LAUNCH` | Launch all armed missiles |
| `ABORT` | Remote detonate all in-flight |
| `SALVO:{interval}` | Start salvo mode |
| `SETUPMOD:{padID}` | Setup module - auto-rename blocks with correct pad number |
| `SETUPFORCE:{padID}` | Force setup - re-rename even if already tagged |

### Status (All Pads → Controller)

**Channel:** `UNITY_PAD_STATUS`

```
{padID}|{state}|{mslArmed}|{mslReady}|{mslCount}
```

---

## MINER FLEET TRACKING

### Beacon Broadcast (Miner → Pad)

**Channel:** `MINER_BEACON`

```
MB|{bcnPad}|{EntityId}|{ShipName}|{Bat%}|{Cargo%}|{H2%}|{X,Y,Z}|{Speed}|{Alt}|{DistHome}|{Status}|{DrillCount}|{DrillsOn}|{GrinderCount}|{GrindersOn}|{Docked}|CAMS:{camId1},{camId2}...
```

**PadID Filtering:** The `bcnPad` field contains the beacon's assigned pad number (e.g., `PAD1`). Receiving scripts (UnityPad, UnitySignal) filter broadcasts by matching `bcnPad` against their own padID. Controller mode ignores this filter and sees ALL miners across all pads.

| Field | Description |
|-------|-------------|
| MB | Message identifier |
| bcnPad | Beacon's assigned pad ID (e.g., PAD1) for multi-pad filtering |
| EntityId | Unique grid entity ID |
| ShipName | Miner name from config |
| Bat% | Battery percentage |
| Cargo% | Cargo fill percentage |
| H2% | Hydrogen percentage |
| X,Y,Z | World position |
| Speed | Current velocity (m/s) |
| Alt | Altitude (meters) |
| DistHome | Distance from home base (meters) |
| Status | Inferred status (DOCKED, DRILLING, etc.) |
| DrillCount | Total drill count |
| DrillsOn | Active drills |
| GrinderCount | Total grinder count |
| GrindersOn | Active grinders |
| Docked | 1 if connector locked, 0 otherwise |
| CAMS | Optional camera entity IDs |

**Example:**
```
MB|123456789|Ice Miner|78|42|95|1000,2000,3000|5|150|2500|DRILLING|4|4|0|0|0|CAMS:111,222
```

### Inferred Status Values

| Status | Condition |
|--------|-----------|
| DOCKED | Connector locked |
| DRILLING | Drills on, speed < 2 m/s |
| DRILL_MOVE | Drills on, moving |
| GRINDING | Grinders on, speed < 2 m/s |
| GRIND_MOVE | Grinders on, moving |
| DEPARTING | Speed > 5 m/s, near home (<500m) |
| TRAVELING | Speed > 5 m/s |
| HOME | At home position (<100m), idle |
| IDLE | Default |

---

## ENEMY DETECTION

### Enemy Signal (External → Controller)

**Channel:** `ENEMY_SIGNAL`

**Formats Accepted:**
```
Vector3D position directly
"X,Y,Z" string format
```

Used by:
- Satellites detecting enemies
- External scripts reporting threats
- Auto-attack mode target acquisition

---

## IGC USAGE BY SCRIPT

| Script | Listens To | Broadcasts On |
|--------|------------|---------------|
| Unity Boot | UNITY_BOOT_RSP, MINER_BEACON | UNITY_BOOT_REQ |
| UnityPad | UNITY_MSL, UNITY_PAD_STATUS, UNITY_SAT_INTERCEPT, MINER_BEACON, UNITY_BOOT_REQ | UNITY_MSL_CMD, UNITY_PAD_CMD, UNITY_BOOT_RSP |
| UnityInventory | MINER_BEACON, UNITY_BOOT_REQ | UNITY_BOOT_RSP |
| UnityMissile | UNITY_MSL_CMD | UNITY_MSL, UNITY_SAT_RELAY_STATUS, UNITY_SAT_INTERCEPT |
| UnityBeacon | (none) | MINER_BEACON |
| UnitySignal | UNITY_MSL, MINER_BEACON, UNITY_SAT_RELAY_STATUS, UNITY_SAT_INTERCEPT, UNITY_BOOT_REQ | UNITY_BOOT_RSP |

---

## MULTI-PAD PADID ISOLATION

All IGC messages that need pad-level isolation include a `padID` field. This ensures that on grids with multiple pad modules (PAD1, PAD2, PAD3...), each script only processes messages meant for its own pad.

**Key isolation points:**
- `UNITY_BOOT_REQ` includes padID so only the correct sibling scripts respond
- `UNITY_MSL_CMD` DETONATE/RESET include padID so missiles only obey their own pad
- `MINER_BEACON` includes `bcnPad` so each pad only tracks its own miners (controller sees all)
- `UNITY_PAD_CMD` SETUPMOD is filtered by padID for targeted module setup
- `UNITY_SAT_INTERCEPT` includes padID for correct pad attribution

---

*Unity AI Lab - IGC Communications Reference*
