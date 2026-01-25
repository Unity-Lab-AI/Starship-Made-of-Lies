# UNIFIED IGC CHANNELS REFERENCE

**Last Updated:** 2026-01-24
**Purpose:** Complete IGC (Inter-Grid Communication) channel reference for Unity Missile System

---

## ALL IGC CHANNELS

| Channel | Sender | Receiver | Purpose |
|---------|--------|----------|---------|
| `UNITY_BOOT_REQ` | Boot | Pad/Inv | Request system status during boot |
| `UNITY_BOOT_RSP` | Pad/Inv | Boot | Respond with block counts |
| `UNITY_MSL` | Missile | Pad/Signal | Telemetry broadcast (position, phase, fuel) |
| `UNITY_MSL_CMD` | Pad | Missile | Commands (DETONATE, ABORT, RESET) |
| `UNITY_PAD_CMD` | Controller | Slave Pads | Mass commands (BUILDALL, ARMALL, LAUNCHALL) |
| `UNITY_PAD_STATUS` | All Pads | Controller | Status updates for multi-pad display |
| `UNITY_SAT_RELAY` | Satellite | Satellite | Inter-satellite mesh relay traffic |
| `UNITY_SAT_RELAY_STATUS` | Satellite | Pad/Signal | Status with grid position, laser links |
| `UNITY_SAT_INTERCEPT` | Satellite | Pad/Signal | Intercept/detonation messages |
| `ENEMY_SIGNAL` | External/Sat | Controller | Enemy positions for auto-attack |
| `MINER_BEACON` | UnityBeacon | Pad/Inv/Boot | Fleet status (battery, cargo, position) |
| `UNITY_PRINTER` | Printer | Pad | Build completion notification |

---

## BOOT HANDSHAKE PROTOCOL

### Request (Boot → Pad/Inv)

**Channel:** `UNITY_BOOT_REQ`

```
PAD_CHECK    # Request Pad status
INV_CHECK    # Request Inventory status
```

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

| Command | Action |
|---------|--------|
| `DETONATE:{padID}` | Immediately detonate warheads |
| `RESET:{padID}` | Safe reset - disarm, disable, recharge |
| `MERGE` | Re-enable merge block (for recall) |
| `DEORBIT:{padID}` | Satellite: exit hold and attack |
| `ATTACK:X,Y,Z` | Satellite: attack specific coordinates |

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
MB|{EntityId}|{ShipName}|{Bat%}|{Cargo%}|{H2%}|{X,Y,Z}|{Speed}|{Alt}|{DistHome}|{Status}|{DrillCount}|{DrillsOn}|{GrinderCount}|{GrindersOn}|{Docked}|CAMS:{camId1},{camId2}...
```

| Field | Description |
|-------|-------------|
| MB | Message identifier |
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

*Unity AI Lab - IGC Communications Reference*
