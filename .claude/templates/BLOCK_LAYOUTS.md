# UNIFIED BLOCK LAYOUTS

**Last Updated:** 2026-01-24
**Purpose:** Standard block configuration tables for all Unity Missile System documentation

---

## PAD BLOCK LAYOUT

### Core Pad Blocks

| Block | Tag | Script | Purpose |
|-------|-----|--------|---------|
| Programmable Block | `[PAD1] UNITY BOOT` | Unity Boot | 23-check boot sequence, self-disables after |
| Programmable Block | `[PAD1] Unity Pad` | UnityPad | Launch control, LCDs 1,2,3,7,8 |
| Programmable Block | `[PAD1] Unity Inventory` | UnityInventory | Production, LCDs 4,5,6,9,10,11 |
| Programmable Block | `[PAD1] UNITY SIGNAL` | UnitySignal | Camera display, laser targeting |
| Button Panel | `[PAD1] Controls` | (user input) | GPS coordinates - paste targets here |
| Merge Block | `[PAD1]` | UnityPad | Missile docking point |
| Connector | `[PAD1]` | UnityPad | Fuel/ammo transfer to missile |
| LCD x11 | `[PAD1:1]` - `[PAD1:11]` | Various | Status displays |

### LCD Assignments

| LCD | Controller | Content |
|-----|------------|---------|
| 1 | UnityPad | Main menu / flight tracking |
| 2 | UnityPad | Build status / telemetry |
| 3 | UnityPad | Missile systems / printer status |
| 4 | UnityInventory | 7-view auto-cycle (build, missile, fuel, power, cargo, production, comms) |
| 5 | UnityInventory | Power overview (batteries, solar, wind, reactors) |
| 6 | UnityInventory | Graphs (12 graph types auto-cycling) |
| 7 | UnityPad | Communications / telemetry |
| 8 | UnityPad | Target info / satellite network |
| 9 | UnityInventory | Miner Fleet status |
| 10 | UnityInventory | Miner Details |
| 11 | UnityInventory | Personal Equipment (tools, weapons, ammo, bottles) |

### Optional Printer Blocks

| Block | Tag | Purpose |
|-------|-----|---------|
| Vertical Pistons | `[PAD1-PRINT] V1`, `V2`... | Welding up/down motion |
| Horizontal Pistons | `[PAD1-PRINT] H1`, `H2`... | Side-to-side stepping |
| Welders | `[PAD1-PRINT] W1`, `W2`... | Build welders |
| Projector | `[PAD1-PRINT] Proj` | Blueprint source |

### Optional Camera LCDs (UnitySignal)

| Block | Tag | Purpose |
|-------|-----|---------|
| LCD | `[PAD1CAMS]:1` | Camera list slot 1 |
| LCD | `[PAD1CAMS]:2` | Camera list slot 2 |
| LCD | `[CTRLCAMS]:1` | Controller mode camera LCD |

### Infrastructure Blocks (Auto-Detected)

| Block | Tag | Purpose |
|-------|-----|---------|
| Assemblers | (none) | Component production |
| Refineries | (none) | Ore processing |
| Cargo Containers | (none) | Item storage |
| Batteries | (none) | Power storage |
| H2/O2 Tanks | (none) | Fuel storage |
| Gas Generators | (none) | Ice processing |
| Reactors | (none) | Power generation |
| Solar Panels | (none) | Power generation |
| Wind Turbines | (none) | Power generation |

### Container Routing Tags

| Tag | Contents |
|-----|----------|
| `[PAD1]-ORE` | Raw ores |
| `[PAD1]-INGOT` | Ingots (incl Gravel) |
| `[PAD1]-COMP` | Components |
| `[PAD1]-AMMO` | Turret ammo |
| `[PAD1]-PAMMO` | Personal ammo |
| `[PAD1]-TOOLS` | Tools and weapons |
| `[PAD1]-BOTTLE` | H2/O2 bottles |
| `[PAD1]-FOOD` | Consumables |
| `[PAD1]-MISC` | Miscellaneous |

---

## MISSILE BLOCK LAYOUT

### Required Blocks

| Block | Auto-Named | Purpose |
|-------|------------|---------|
| Programmable Block | `[PAD1] Missile #1 Program` | UnityMissile guidance script |
| Remote Control | `Missile #1 Remote` | Navigation reference, gravity sensing |
| Merge Block | `Missile #1 Merge` | Docks to pad merge block |
| Gyroscope(s) | `Missile #1 Gyroscope` | Attitude control (1+ required) |
| Thruster(s) | `Missile #1 H2 Thruster` | Propulsion (Atmo/H2/Ion) |
| Battery(s) | `Missile #1 Battery` | Power storage |
| Warhead(s) | `Missile #1 Warhead` | Payload (not for SATELLITE mode) |

### Optional Blocks

| Block | Tag/Name | Purpose |
|-------|----------|---------|
| Connector | `Missile #1 [DOCK] Connector` | Fuel/ice/ammo loading |
| Connector | `Missile #1 [AMMO] Connector` | Ammo ejection before impact |
| H2 Tank(s) | `Missile #1 H2 Tank` | Extra fuel capacity |
| O2/H2 Generator | `Missile #1 Generator` | Makes fuel from ice |
| Sensor | `Missile #1 Sensor` | SENSOR targeting mode |
| Camera | `Missile #1 Camera` | LIDAR targeting mode |
| Radio Antenna | `Missile #1 Antenna` | Telemetry broadcast |
| Laser Antenna | `[PAD1] Laser Pad` | Direct link (no blackout) |
| Light(s) | `Missile #1 Light` | Status indication |

### Satellite Laser Mesh (SATELLITE Mode Only)

| Block | Name | Purpose |
|-------|------|---------|
| Laser Antenna | `[PAD1] Laser Pad` | Link back to ground pad |
| Laser Antenna | `[PAD1] Laser North` | Link to satellite at grid (X, Z+1) |
| Laser Antenna | `[PAD1] Laser South` | Link to satellite at grid (X, Z-1) |
| Laser Antenna | `[PAD1] Laser East` | Link to satellite at grid (X+1, Z) |
| Laser Antenna | `[PAD1] Laser West` | Link to satellite at grid (X-1, Z) |

### Missile Connector Tags

| Tag | Purpose | Location |
|-----|---------|----------|
| `[DOCK]` | Fuel/ice/ammo loading | Closest to pad when docked |
| `[AMMO]` | Ammo ejection | Farthest from pad |

---

## MINER BLOCK LAYOUT

### Required Blocks (UnityBeacon)

| Block | Tag | Required | Purpose |
|-------|-----|----------|---------|
| Programmable Block | (any) | Yes | UnityBeacon script |
| Remote Control | `[BEACON]` | Yes | Position, velocity, altitude |
| Antenna | `[BEACON]` | Yes | IGC broadcast (50km range) |

### Optional Blocks

| Block | Tag | Purpose |
|-------|-----|---------|
| Connector | `[BEACON]` | Dock detection |
| LCD Panel | `[BEACON]` | Local status display |

### Auto-Detected Blocks (No Tags Needed)

| Block | Purpose |
|-------|---------|
| Batteries | Power level tracking |
| Cargo Containers | Cargo fill percentage |
| H2 Tanks | Hydrogen level tracking |
| Drills | Drill count and active status |
| Grinders | Grinder count and active status |

### PAM Compatibility

When using with **[PAM] Path Auto Miner** by Keks:

| Block | Dual-Tag | Notes |
|-------|----------|-------|
| Remote Control | `[PAM] [BEACON] Remote` | PAM uses for autopilot, Beacon reads position |
| Connector | `[PAM] [BEACON] Connector` | Both scripts can read dock status |

**PAM Steam Workshop:** https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929

---

## MULTI-PAD CONFIGURATION

### Tag Format by Pad ID

| Pad | Core Blocks | LCDs | Printer |
|-----|-------------|------|---------|
| PAD1 | `[PAD1]` | `[PAD1:1]` - `[PAD1:11]` | `[PAD1-PRINT]` |
| PAD2 | `[PAD2]` | `[PAD2:1]` - `[PAD2:11]` | `[PAD2-PRINT]` |
| PAD3 | `[PAD3]` | `[PAD3:1]` - `[PAD3:11]` | `[PAD3-PRINT]` |
| etc. | `[PAD#]` | `[PAD#:1]` - `[PAD#:11]` | `[PAD#-PRINT]` |

### Shared Resources

All pads on same grid share:
- Cargo containers
- Refineries
- Assemblers
- Power grid (batteries, reactors, solar)
- H2/O2 systems (tanks, generators)

Each pad has unique:
- 4 Programmable Blocks (Boot, Pad, Inventory, Signal)
- Merge block
- Docking connector
- 11 LCDs
- Button panel

---

*Unity AI Lab - Block Configuration Reference*
