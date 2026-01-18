# UnityPad - Architecture Reference

*Last Updated: 2026-01-16*
*Unity AI Lab - Missile Systems Division*

---

## Overview

Launch pad controller for the Unity Missile System. Handles:
- Missile construction (printer system)
- Fuel/ammo loading
- Targeting configuration
- Launch sequencing
- Multi-pad coordination
- Inventory management
- Miner fleet tracking

**Character Budget:** ~107,000 deployed / 100,000 limit (OVER - needs minification)

---

## State Machine

```
enum S { INIT, IDLE, PRINT, BUILD, DOCK, FUEL, AMMO, READY, ARM, LAUNCH, GONE }
```

| State | Description | Next State |
|-------|-------------|------------|
| INIT | Scanning for blocks | IDLE or DOCK |
| IDLE | No missile, waiting | PRINT or DOCK |
| PRINT | Printer extending | BUILD |
| BUILD | Welders active | DOCK |
| DOCK | Missile merged | FUEL |
| FUEL | Transferring H2/battery | AMMO |
| AMMO | Loading ammo | READY |
| READY | Fueled, awaiting arm | ARM |
| ARM | Countdown active | LAUNCH |
| LAUNCH | Separation sequence | GONE |
| GONE | Tracking in-flight | IDLE |

---

## Menu System

```
enum M { MAIN, TGT, SET, ARM, WIZARD, VIEW }
```

| Menu | Purpose |
|------|---------|
| MAIN | Primary navigation, launch control |
| TGT | Target selection, GPS, waypoints |
| SET | Settings (climb, detonation, etc.) |
| ARM | Armed state display |
| WIZARD | Setup wizard |
| VIEW | Expanded LCD view |

---

## Targeting Modes

```
enum T { GPS, ANTENNA, SENSOR, LIDAR, MANUAL, SATELLITE }
```

| Mode | Behavior |
|------|----------|
| GPS | Navigate to coordinates |
| ANTENNA | Track broadcasting antenna |
| SENSOR | Proximity detection |
| LIDAR | Camera raycast lock |
| MANUAL | No guidance |
| SATELLITE | Deploy as relay |

---

## Block Tags

### Pad Infrastructure
- `[PAD#]` - Pad blocks (e.g., `[PAD1]`, `[PAD2]`)
- `[PAD#:1-10]` - LCD panels
- `[PAD#-PRINT]` - Printer components

### Auto-Named on Setup
- `[DOCK]` - Fuel connector (closest to merge)
- `[AMMO]` - Ammo connector (farthest from merge)

### Container Routing
- `-ore` - Ore storage
- `-ingot` - Ingot storage
- `-comp` - Component storage
- `-tools` - Tools & personal ammo
- `-ammo` - Base turret ammo
- `-bottle` - H2/O2 bottles

---

## Inventory System

### Container Priority
Size priority: Large > Medium > Small

```csharp
padCargo.Sort((a,b)=>{
  string sa=a.BlockDefinition.SubtypeId;
  int la=sa.Contains("Large")?0:sa.Contains("Medium")?1:2;
  // ...returns Large first
});
```

### RouteItem Logic
1. Check designated container by item type
2. If designated full (>95%), fallback to padCargoL
3. If padCargoL full, fallback to padCargoM
4. Return null if no space

### Ammo Splitting
- Personal ammo (Pistol/RifleGun) → toolCargo
- Base turret ammo → ammoCargo (or toolCargo if no -ammo tag)

---

## LCD System

### Standard LCDs (1-10)
| LCD | Content |
|-----|---------|
| 1 | Control Panel / Menus |
| 2 | Build Status / BOM |
| 3 | Missile Systems |
| 4 | Fuel & Targeting |
| 5 | Pad Power |
| 6 | Production / Graphs |
| 7 | Telemetry / Comms |
| 8 | GPS & Targets |
| 9 | Miner Fleet |
| 10 | Miner Details |

### Controller LCDs (1-8)
Different content when `isController=true`

---

## Key Variables

### Listeners (IGC)
| Var | Full Name | Channel |
|-----|-----------|---------|
| `mL` | mslListener | UNITY_MSL |
| `rL` | relayListener | UNITY_MSL_RELAY |
| `pcL` | padCmdListener | UNITY_PAD_CMD |
| `psL` | padStatusListener | UNITY_PAD_STATUS |
| `ssL` | satStatusListener | UNITY_SAT_RELAY_STATUS |
| `eL` | enemyListener | ENEMY_SIGNAL |
| `bL` | beaconListener | MINER_BEACON |

### Container References
| Var | Purpose |
|-----|---------|
| `oreCargo` | Tagged -ore container |
| `ingotCargo` | Tagged -ingot container |
| `compCargo` | Tagged -comp container |
| `toolCargo` | Tagged -tools container |
| `ammoCargo` | Tagged -ammo container |
| `bottleCargo` | Tagged -bottle container |
| `padCargoL` | Large containers |
| `padCargoM` | Medium containers |
| `padCargoS` | Small containers |

### Printer Variables
| Var | Purpose |
|-----|---------|
| `prtState` | Printer state (0-3) |
| `prtPist` | Printer pistons |
| `prtWeld` | Printer welders |
| `prtProj` | Projector |

---

## Key Functions

### Core Loop
- `Main()` → State machine tick
- `Scan()` → Block detection
- `ScanPad()` → Pad infrastructure
- `ScanMissile()` → Missile blocks
- `ScanPrinter()` → Printer components

### Inventory
- `ManageInventory()` → Auto-sorting loop
- `RouteItem()` → Determine destination
- `OrganizeStorage()` → Move items

### Printing
- `StartPrint()` → Begin print job
- `UpdatePrinter()` → State machine tick
- `StopPrint()` → Cleanup

### LCD
- `UpdateDisplays()` → Main LCD router
- `UpdateLCD1-10()` → Individual panels
- `UpdateControllerLCD1-8()` → Controller mode

### Launch
- `ArmMissile()` → Arm warheads
- `StartLaunch()` → Separation sequence
- `RemoteDetonate()` → Send DETONATE cmd

---

## Minification Reference

See `.claude/ARCHITECTURE.md` for full variable abbreviation table.

Key savings opportunities:
- Remove duplicate ammoItemNames array (~178 chars)
- Consolidate scroll variables to arrays (~200 chars)
- IGC loop helper function (~100 chars)

---

*Unity AI Lab - Missile Systems Division*
