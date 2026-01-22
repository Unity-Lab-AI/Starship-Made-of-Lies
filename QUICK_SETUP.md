# UNITY MISSILE SYSTEM - Quick Setup Guide

**Version:** v01.00 | **Last Updated:** 2026-01-18

---

## WHAT'S IN THE BOX

| Script | Purpose | Runs On |
|--------|---------|---------|
| **Unity Boot** | Boot controller, 20 unified checks with IGC handshaking | Same grid as UnityPad |
| **UnityPad** | Launch pad controller, targeting, fleet management | Your base/ship with launch pads |
| **UnityMissile** | Guidance system, flies to target and detonates | The missile itself |
| **UnityInventory** | Inventory sorting, production, miner transfers | Same grid as UnityPad (separate PB) |
| **UnityBeacon** | Fleet tracker, broadcasts ship status | Mining ships |

---

## IN-GAME SETUP

### Step 1: Load Scripts in Space Engineers

Scripts auto-deploy to:
```
%APPDATA%\SpaceEngineers\IngameScripts\local\
├── Unity Boot\script.cs
├── UnityPad\script.cs
├── UnityMissile\script.cs
├── UnityInventory\script.cs
└── UnityBeacon\script.cs
```

In-game: **G Menu → Info → Edit → Browse Workshop → Local Scripts**

---

### Step 2: UnityPad Setup (Launch Pad) - COMPILE FIRST

**CRITICAL:** UnityPad MUST be compiled FIRST - it wipes all CustomData and creates fresh [SYSTEM].

1. Add Programmable Block near pad controls
2. Load `UnityPad` script
3. **Name the PB:** `[PAD1] Unity Pad`
4. Click "Recompile"
5. ClearForBoot() wipes ALL CustomData, writes fresh [SYSTEM], sets `pad_ready=true`

---

### Step 3: UnityInventory Setup - COMPILE SECOND

1. Add SECOND Programmable Block on same grid
2. Load `UnityInventory` script
3. **Name the PB:** `[PAD1] Unity Inventory`
4. Click "Recompile"
5. Adds `inv_ready=true` to existing CustomData

---

### Step 4: Unity Boot Setup - COMPILE LAST

1. Add THIRD Programmable Block on same grid
2. Load `Unity Boot` script
3. **Name the PB:** `[PAD1] UNITY BOOT`
4. Click "Recompile"
5. Sees both ready flags, runs 23 checks with real PB-to-PB IGC handshaking
6. Sets `boot_complete=true` when done
7. UnityPad and UnityInventory detect boot_complete and take their LCDs

#### Run SETUPMOD First
After installing UnityPad script, run `SETUPMOD` to auto-tag all blocks:

```
Arguments: SETUPMOD
```

**SETUPMOD automatically tags:**
- Merge Block → `[PAD1]`
- Connector → `[PAD1]`
- Button Panel → `[PAD1]`
- 10 LCDs → `[PAD1:1]` through `[PAD1:10]`
- Printer blocks → `[PAD1-PRINT]`

#### LCD Panels (`[PAD#:N]`):
| Tag | Display |
|-----|---------|
| `[PAD1:1]` | Main menu / control |
| `[PAD1:2]` | Build status / telemetry |
| `[PAD1:3]` | Missile systems |
| `[PAD1:4]` | Pad overview (auto-cycles 7 views) |
| `[PAD1:5]` | Power systems |
| `[PAD1:6]` | Graphs (auto-cycles 7 graphs) |
| `[PAD1:7]` | Telemetry / comms |
| `[PAD1:8]` | GPS / satellites |
| `[PAD1:9]` | Miner fleet status |
| `[PAD1:10]` | Miner detail / storage |

#### Example Block Names (after SETUPMOD):
```
[PAD1] Merge Block
[PAD1] Connector
[PAD1] Button Panel
[PAD1:1] LCD Panel
[PAD1:2] LCD Panel
[PAD1] Antenna
```

---

### Step 3: UnityMissile Setup (The Missile)

#### Required Blocks (NO special tags needed):
| Block | Purpose |
|-------|---------|
| Programmable Block | Runs UnityMissile script |
| Remote Control | Navigation & gravity detection |
| Gyroscope(s) | Steering |
| Thruster(s) | Propulsion (H2 recommended) |
| Warhead(s) | Payload |
| Merge Block | Connects to pad |
| Battery | Power |
| H2 Tank | Fuel |

#### Optional Blocks:
| Block | Purpose |
|-------|---------|
| Antenna | Telemetry broadcast |
| Camera | LIDAR targeting |
| Sensor | Proximity targeting |
| Connector `[AMMO]` | Ammo ejection on arm |

#### Missile Names:
When launched, the missile auto-renames all its parts to `Missile #N [BlockType]`

**IMPORTANT:** The missile skips blocks tagged with `[PAD` or `[CONTROLLER` - this protects your pad blocks from being renamed.

---

### Step 4: UnityBeacon Setup (Mining Ships)

#### Required Blocks (tag with `[BEACON]`):
| Block | Tag | Purpose |
|-------|-----|---------|
| Programmable Block | (runs UnityBeacon script) | Brain |
| Remote Control | `[BEACON]` | Position & velocity |
| Antenna | `[BEACON]` | Broadcasts status |

#### Optional Blocks:
| Block | Tag | Purpose |
|-------|-----|---------|
| Connector | `[BEACON]` | Docking detection |
| LCD Panel | `[BEACON]` | Ship status display |

#### Commands:
| Command | Action |
|---------|--------|
| `SETUP` | Auto-tag first RC, Antenna, Connector, LCD |
| `SETHOME` | Save current position as home base |
| `RESCAN` | Re-scan for tagged blocks |

---

## FLIGHT MODES

| Mode | Behavior | Best For |
|------|----------|----------|
| **DIRECT** (default) | Straight to target, no orbit | Short range, planet surface |
| **AUTO** | Climb to altitude, then engage | Medium range |
| **ICBM** | Full orbit insertion, coast, reentry | Long range, cross-planet |

**Default is DIRECT** - missile flies straight at GPS target.

---

## TARGETING MODES

| Mode | How It Works |
|------|--------------|
| **GPS** | Flies to set coordinates |
| **ANTENNA** | Follows broadcasted position |
| **SENSOR** | Locks nearest enemy in sensor range |
| **LIDAR** | Camera raycast tracking |
| **MANUAL** | Fly straight, player controls |
| **SATELLITE** | Deploys to orbit as relay |

---

## BASIC COMMANDS (UnityPad)

### Targeting
| Command | Action |
|---------|--------|
| `TARGET` | Set GPS from clipboard |
| `CLEAR` | Clear current target |

### Launch Control
| Command | Action |
|---------|--------|
| `ARM` | Arm missile (starts countdown) |
| `LAUNCH` | Skip countdown, launch immediately |
| `ABORT` | Cancel armed state |
| `DETONATE` | Remote detonate active missile |

### Configuration
| Command | Action |
|---------|--------|
| `MODE GPS/LIDAR/SENSOR/ANTENNA` | Set targeting mode |
| `FLIGHT DIRECT/AUTO/ICBM` | Set flight mode |
| `CREATIVE` | Toggle creative mode ammo |

### Storage
| Command | Action |
|---------|--------|
| `ORGANIZE` | Force storage organization |
| `AUTOORG` | Toggle auto-organization |

### System
| Command | Action |
|---------|--------|
| `RESCAN` | Re-detect all blocks |
| `RESET ALL` | Reset to defaults |

---

## DEFAULT VALUES (v01.00)

| Setting | Default | Description |
|---------|---------|-------------|
| Flight Mode | DIRECT | Straight to target |
| Climb Distance | 500m | Altitude before targeting |
| Lidar Range | 500m | Camera scan distance |
| Reentry Distance | 500m | When to start final approach |
| Detonation Distance | 50m | Warhead trigger range |
| Sensor Range | 50m | Enemy detection radius |
| Countdown | 10 sec | Time before launch |
| Burn Time | 5 sec | ICBM mode thrust duration |

---

## MULTI-PAD CONTROLLER MODE

Set one pad as CONTROLLER to manage multiple SLAVE pads:

1. On controller pad: Run `SETCONTROLLER`
2. On slave pads: They auto-register via IGC

### Controller Commands:
| Command | Action |
|---------|--------|
| `SALVO` | Fire all ready missiles |
| `CARPET` | Staggered launch sequence |
| `ALL ARM` | Arm all pads |
| `ALL ABORT` | Abort all pads |

---

## PRINTER INTEGRATION

Connect a printer/projector/welder setup for auto-rebuilding:

1. Tag printer connector with `[PRINTER]`
2. Pad auto-detects when missile is printed
3. Sends `PRINT` command when missile destroyed
4. Receives `UNITY_PRINTER` broadcast when build complete

---

## IGC CHANNELS

| Channel | Direction | Data |
|---------|-----------|------|
| `UNITY_BOOT_REQ` | Boot → Pad/Inv | Request system status |
| `UNITY_BOOT_RSP` | Pad/Inv → Boot | Block count responses |
| `UNITY_MSL` | Missile → Pad | Telemetry |
| `UNITY_MSL_CMD` | Pad → Missile | Commands |
| `MINER_BEACON` | Miner → Pad | Fleet status |
| `UNITY_PAD_CMD` | Controller → Slaves | Mass commands |
| `UNITY_PRINTER` | Printer → Pad | Build complete |

---

## BUILD FROM SOURCE

### Prerequisites
- .NET SDK
- MDK2 (NuGet packages in projects)

### Build Commands
```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"

# CRITICAL: Sync source files first!
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1

# Build ONE AT A TIME (any order for build - compile order matters in-game)
dotnet build UnityPad -c Debug
dotnet build UnityInventory -c Debug
dotnet build "Unity Boot" -c Debug
dotnet build UnityMissile -c Debug
dotnet build UnityBeacon -c Debug
```

**IN-GAME COMPILE ORDER:** BEACON → MISSILE → PAD → INVENTORY → BOOT

BEACON and MISSILE are on different PBs (miner/missile), so they can be compiled any time.
The 3 scripts on the pad PB MUST be: PAD first, INVENTORY second, BOOT last.

### Verify Deployment
```powershell
# Check deployed sizes
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs").Length
```

---

## TROUBLESHOOTING

### Missile goes to orbit instead of target
- Check flight mode is DIRECT (not AUTO or ICBM)
- Run `FLIGHT DIRECT` or `RESET ALL`

### Pad blocks getting renamed to "Missile #1"
- Tag your pad blocks with `[PAD1]` or `[PAD2]`, etc.
- Missile skips blocks with `[PAD` in name

### Missile not launching
- Check merge block is tagged `[PAD1]` (run SETUPMOD)
- Check connector is tagged `[PAD1]`
- Ensure missile has Remote Control

### No telemetry on LCD
- Check missile has antenna
- Check antenna is enabled and broadcasting
- Check broadcast tag matches (default: `UNITY_MSL`)

### MinerBeacon not showing on pad
- Run `RESCAN` on pad
- Check miner antenna is broadcasting
- Check channel matches (default: `MINER_BEACON`)

---

## CHARACTER LIMITS

| Script | Deployed | Limit | Margin |
|--------|----------|-------|--------|
| Unity Boot | 12,697 | 100,000 | 87% |
| UnityPad | 89,239 | 100,000 | 11% |
| UnityMissile | 26,058 | 100,000 | 74% |
| UnityInventory | 78,680 | 100,000 | 21% |
| UnityBeacon | 10,800 | 100,000 | 89% |

---

## FILE STRUCTURE

```
Unity Missile System/
├── wrap-scripts.ps1         # Wraps all raw .cs to Program.cs
├── Unity Boot.cs            # Edit this (boot controller)
├── UnityPad.cs              # Edit this (pad controller)
├── UnityMissile.cs          # Edit this (missile guidance)
├── UnityInventory.cs        # Edit this (inventory manager)
├── UnityBeacon.cs           # Edit this (fleet beacon)
├── Unity Boot/              # MDK project
├── UnityPad/                # MDK project
├── UnityMissile/            # MDK project
├── UnityInventory/          # MDK project
├── UnityBeacon/             # MDK project
├── QUICK_SETUP.md           # This file
├── README.md                # Full documentation
├── SETUP.md                 # Complete setup guide
└── .claude/                 # Development workflow
```

---

## SPRITE-BASED LCD SYSTEM

All LCDs now use modern sprite rendering via `MySpriteDrawFrame` for crisp, colorful displays:

### Color Palette
| Color | RGB | Usage |
|-------|-----|-------|
| `cPri` | (0,180,255) | Primary blue - headers |
| `cAcc` | (255,200,0) | Accent gold - highlights |
| `cOK` | (0,255,100) | Green - good status (>70%) |
| `cWrn` | (255,180,0) | Orange - warning (30-70%) |
| `cErr` | (255,60,60) | Red - critical (<30%) |

Progress bars automatically change color based on fill percentage.

---

*Unity AI Lab - Making Things Go Boom Since 2026*
*Version v01.00 | 2026-01-18*
