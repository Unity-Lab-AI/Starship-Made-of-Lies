# Unity Missile System - Complete Setup Guide

**Location:** `Space Engineers/Unity Missile System/`
**Version:** v01.00 | 2026-01-24

---

## Table of Contents

1. [Overview](#overview)
2. [Launch Pad Setup](#part-1-launch-pad-setup)
3. [Missile Setup](#part-2-missile-setup)
4. [Mining Ship Setup](#part-3-mining-ship-setup)
5. [In-Game Compile Order](#part-4-in-game-compile-order)
6. [Boot Sequence Checks](#part-5-boot-sequence-checks)
7. [GPS Targeting](#part-6-gps-targeting)
8. [Missile Flight Phases](#part-7-missile-flight-phases)
9. [UnityPad Commands](#part-8-unitypad-commands)
10. [UnityInventory Commands](#part-9-unityinventory-commands)
11. [Remote Camera Viewing](#part-10-remote-camera-viewing)
12. [Satellite Array Management](#part-11-satellite-array-management)
13. [Quick Start Checklist](#quick-start-checklist)

---

## Overview

The Unity Missile System consists of 6 scripts that work together:

| Component | Script | Purpose |
|-----------|--------|---------|
| **Boot Controller** | Unity Boot.cs | 23-check boot sequence, PB handshaking |
| **Launch Pad** | UnityPad.cs | Missile control, targeting, LCDs 1,2,3,7,8 |
| **Inventory** | UnityInventory.cs | Production, sorting, LCDs 4,5,6,9,10,11 |
| **Signal Hub** | UnitySignal.cs | Camera tracking, satellite monitoring |
| **Missile** | UnityMissile.cs | Guided flight, targeting, detonation |
| **Fleet Beacon** | UnityBeacon.cs | Miner status broadcasting |

---

## Part 1: Launch Pad Setup

### Required Blocks (Tag with `[PAD1]`)

| Block Type | Tag Example | Notes |
|------------|-------------|-------|
| Programmable Block | `[PAD1] UNITY BOOT` | Boot controller |
| Programmable Block | `[PAD1] Unity Pad` | Pad controller |
| Programmable Block | `[PAD1] Unity Inventory` | Production system |
| Button Panel | `[PAD1] Controls` | GPS input - paste targets here |
| Merge Block | `[PAD1] Merge` | Missile docking |
| Connector | `[PAD1] Connector` | Fuel/ammo transfer |
| LCD Panel x12 | `[PAD1:1]` through `[PAD1:12]` | Display panels |

### LCD Assignments

| LCD | Controller | Content |
|-----|------------|---------|
| 1 | UnityPad | Main menu / flight tracking |
| 2 | UnityPad | Build status / component needs |
| 3 | UnityPad | Missile systems / printer status |
| 4 | UnityInventory | 7-view auto-cycle (build, missile, fuel, power, cargo, production, comms) |
| 5 | UnityInventory | Power overview (batteries, solar, wind, reactors) |
| 6 | UnityInventory | Graphs (12 graph types auto-cycling) |
| 7 | UnityPad | Communications / telemetry |
| 8 | UnityPad | Target info / missile loading status |
| 9 | UnityInventory | Miner Fleet status |
| 10 | UnityInventory | Miner Details |
| 11 | UnityInventory | Personal Equipment (tools, weapons, ammo, bottles) |
| 12 | UnityPad | Black Box log (optional) |

### Production Blocks (No tags needed - auto-detected)

- Assemblers (at least 1)
- Refineries
- Cargo containers
- Batteries
- H2/O2 tanks
- Gas generators
- Reactors (optional)
- Solar panels (optional)
- Wind turbines (optional)

### Printer Setup (Tag with `[PAD1-PRINT]`)

| Block | Tag Example | Notes |
|-------|-------------|-------|
| Vertical Pistons | `[PAD1-PRINT] V Piston 1` | Welding up/down motion |
| Horizontal Pistons | `[PAD1-PRINT] H Piston 1` | Side-to-side stepping |
| Welders | `[PAD1-PRINT] Welder 1` | Must be on piston arm |
| Projector | `[PAD1-PRINT] Projector` | Load missile blueprint |

---

## Part 2: Missile Setup

### Required Blocks on Missile

| Block Type | Notes |
|------------|-------|
| Programmable Block | Load UnityMissile script |
| Remote Control | Required for navigation |
| Gyroscope(s) | Attitude control |
| Thrusters | Any type (atmospheric, hydrogen, ion) |
| Batteries | Power storage |
| Warhead(s) | Payload |
| Merge Block | For docking to pad |
| Connector | For fuel/ammo transfer (optional) |
| Antenna | For telemetry broadcast |
| Sensor | For proximity detection (optional) |
| Camera | For LIDAR targeting (optional) |
| Laser Antennas x5 | For satellite mesh (Pad, North, South, East, West) |

### Missile Naming

After docking, run command `NAMEMSL` on UnityPad to auto-name missile blocks.

Missile PB name format: `[PAD1] Missile #1 Program`

### Laser Antenna Setup (For Satellites)

Name lasers for mesh networking:
```
[PAD1] Laser Pad      - Links back to ground pad
[PAD1] Laser North    - Links to satellite in +Z direction
[PAD1] Laser South    - Links to satellite in -Z direction
[PAD1] Laser East     - Links to satellite in +X direction
[PAD1] Laser West     - Links to satellite in -X direction
```

---

## Part 3: Mining Ship Setup

### Required Blocks (Tag with `[BEACON]`)

| Block Type | Tag Example | Notes |
|------------|-------------|-------|
| Programmable Block | `[BEACON] Unity Beacon` | Load UnityBeacon script |
| Remote Control | `[BEACON] Remote` | Required for navigation data |
| Antenna | `[BEACON] Antenna` | For broadcast (auto-enabled) |
| Connector | `[BEACON] Connector` | For docking detection |
| LCD (optional) | `[BEACON] Status` | Local status display |

### UnityBeacon CustomData Config

```ini
[MINER_BEACON]
ShipName=Miner Alpha
Channel=MINER_BEACON
BlockTag=[BEACON]
PadID=1
HomeGPS=0,0,0
```

### Commands

| Command | Action |
|---------|--------|
| `SETUP` | Auto-name required blocks with [BEACON] tag |
| `RESCAN` | Refresh all blocks |
| `SETHOME` | Set current position as home |
| `RESET` | Clear config and restart |

### Camera Auto-Naming

UnityBeacon automatically names cameras with `[PAD{padID}] {shipName} Cam` format for camera relay system.

---

## Part 4: In-Game Compile Order

**CRITICAL: Scripts must be compiled in this order on the launch pad:**

**PAD → INVENTORY → SIGNAL → BOOT**

| Order | Script | Action |
|-------|--------|--------|
| 1 | **UnityPad** | Wipes Me.CustomData, writes `pad_ready=true` |
| 2 | **UnityInventory** | Wipes Me.CustomData, writes `inv_ready=true` |
| 3 | **UnitySignal** | Wipes Me.CustomData, writes `signal_ready=true` |
| 4 | **Unity Boot** | Reads ready flags, runs 23 checks, sets `boot_complete=true` |

**Note:** UnityBeacon (miners) and UnityMissile (missiles) are on separate grids - compile anytime.

---

## Part 5: Boot Sequence Checks

Unity Boot performs 23 checks:

| # | Check | What It Does |
|---|-------|--------------|
| 0 | Initializing Core | Grid has minimum blocks |
| 1 | Scanning Grid | Count pad grid blocks |
| 2 | Button Panel | Control panel found |
| 3 | Detecting LCDs | Minimum 1 LCD tagged |
| 4 | IGC Channels | Channels registered |
| 5 | Request Pad Status | Send PAD_CHECK via IGC |
| 6 | Await Pad Response | Wait for UnityPad response |
| 7 | Missile Merge Block | Validate merge count |
| 8 | Validate Pad Power | Validate battery count |
| 9 | Validate Pad Fuel | Validate H2/O2 tanks |
| 10 | Request Inv Status | Send INV_CHECK via IGC |
| 11 | Await Inv Response | Wait for UnityInventory response |
| 12 | Validate Inv Cargo | Validate cargo containers |
| 13 | Validate Inv Refinery | Validate refineries |
| 14 | Validate Inv Assembler | Validate assemblers |
| 15 | Validate Inv Gas | Validate generators |
| 16 | Cross-Validate | Both systems responded |
| 17 | Module Sync | Check sibling pads |
| 18 | Write Config | Setup default quotas |
| 19 | Beacon Detection | Count miners (optional) |
| 20 | Controller Modules | Report connected pads |
| 21 | System Ready | Mark boot complete |
| 22 | All Systems Operational | Final status |

---

## Part 6: GPS Targeting

### Adding Targets

Paste GPS coordinates into `[PAD1] Controls` button panel CustomData:

```
GPS:Target Alpha:1000:500:200:#FF00FF00:
GPS:Target Bravo:2000:600:300:#FFFF0000:
GPS:Enemy Base:-5000:1200:800:#FFFF0000:
```

### Target Modes

| Mode | Description |
|------|-------------|
| GPS | Navigate to fixed coordinates |
| ANTENNA | Track broadcasting antenna by name |
| SENSOR | Proximity detection via sensor |
| LIDAR | Camera raycast lock |
| MANUAL | No auto-targeting, remote guided |
| SATELLITE | Deploy as orbital platform |

---

## Part 7: Missile Flight Phases

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
| SAT_CLIMB | Ascending to orbit |
| SAT_BRAKE | Slowing to orbital velocity |
| SAT_HOLD | Station-keeping, enemy scanning |
| SAT_INTERCEPT | Chase enemy, detonate within 10m |

---

## Part 8: UnityPad Commands

| Command | Action |
|---------|--------|
| `LAUNCH` | Fire armed missile |
| `ARM` | Arm missile warheads |
| `DISARM` | Disarm warheads |
| `PRINT` | Start missile printer |
| `RESCAN` | Refresh all blocks |
| `NAMEPAD` | Auto-name pad blocks |
| `NAMEMSL` | Auto-name missile blocks |
| `SETPADCONTROL` | Toggle controller mode |

### Controller Mode Commands (Multi-Pad)

| Command | Action |
|---------|--------|
| `COPYTGT` | Send GPS to all pads |
| `BUILDALL` | Print on all pads |
| `ARMALL` | Arm all missiles |
| `LAUNCHALL` | Launch all missiles |
| `STARTSALVO` | Begin salvo sequence |
| `ABORTALL` | Abort all missiles |

---

## Part 9: UnityInventory Commands

| Command | Action |
|---------|--------|
| `SORT` | Force inventory sort |
| `RESCAN` | Refresh all blocks |
| `AUTOORG` | Toggle auto-sorting |

### Cargo Container Tags

For dedicated storage, name containers:
- `[PAD1]-ORE` - Ore storage
- `[PAD1]-INGOT` - Ingot storage
- `[PAD1]-COMP` - Components
- `[PAD1]-AMMO` - Turret ammo
- `[PAD1]-PAMMO` - Personal ammo
- `[PAD1]-TOOLS` - Tools and weapons
- `[PAD1]-BOTTLE` - H2/O2 bottles
- `[PAD1]-FOOD` - Consumables
- `[PAD1]-MISC` - Miscellaneous

---

## Part 10: Remote Camera Viewing

### How It Works

SE natively supports viewing cameras from cockpits via antenna relay:
1. Remote grid needs antenna (radio or laser)
2. Camera must have "Broadcast using antenna" enabled
3. Command center needs antenna in range
4. Sit in control seat and access "Remote Cameras" from G menu

### UnitySignal Camera Display

UnitySignal (pure ingame PB script) handles camera tracking:
- Tracks local cameras on pad grid
- Receives missile camera info via UNITY_MSL broadcasts
- Receives miner camera info via MINER_BEACON broadcasts
- Manages laser antennas to track active missiles
- Monitors satellite constellation status

### Camera LCD Tag

Add LCD with `[PAD1CAMS]:1` to show camera list. UnitySignal displays cameras from local grid, missiles, and miners with auto-paging.

---

## Part 11: Satellite Array Management

### Grid Formation

Satellites deploy in expanding spiral pattern:
- First satellite: position (0,0)
- Subsequent satellites expand outward
- Grid spacing configurable (default 5km)

### Laser Mesh Networking

Each satellite can link to:
- **Pad** - Back to ground command
- **North/South/East/West** - Adjacent satellites

If one satellite is destroyed, others auto-relink through available anchors.

### Intercept Protocol

When enemy detected:
1. Satellite switches to SAT_INTERCEPT
2. Broadcasts last known enemy position
3. Chases target until within 10m
4. Detonates warheads
5. Command pad receives position, auto-launches replacement

---

## Quick Start Checklist

### Launch Pad

- [ ] 4 Programmable Blocks (BOOT, PAD, INVENTORY, SIGNAL)
- [ ] Button Panel named `[PAD1] Controls`
- [ ] Merge Block with `[PAD1]` tag
- [ ] Connector with `[PAD1]` tag
- [ ] 11+ LCDs named `[PAD1:1]` through `[PAD1:11]`
- [ ] At least 1 Assembler
- [ ] At least 1 Refinery
- [ ] Cargo containers
- [ ] Batteries and H2/O2 tanks
- [ ] Antenna for telemetry

### Missile

- [ ] Programmable Block with UnityMissile
- [ ] Remote Control
- [ ] Gyroscope(s)
- [ ] Thrusters
- [ ] Batteries
- [ ] Warhead(s)
- [ ] Merge Block (matches pad)
- [ ] Antenna

### Mining Ship

- [ ] Programmable Block with UnityBeacon
- [ ] Remote Control with `[BEACON]` tag
- [ ] Antenna with `[BEACON]` tag
- [ ] Connector with `[BEACON]` tag

### Compile Order

1. Compile UnityPad PB
2. Compile UnityInventory PB
3. Compile UnitySignal PB
4. Compile Unity Boot PB
5. Wait for boot sequence to complete
6. Paste GPS targets into button panel
7. Ready to launch!

---

*Unity AI Lab - Missile Systems Division*
