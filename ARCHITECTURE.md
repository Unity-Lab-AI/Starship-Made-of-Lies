# UNITY MISSILE SYSTEM - Architecture

*Last scanned: 2026-01-18*

---

## System Overview

Five-script guided missile system for Space Engineers:
- **Unity Boot** - Boot controller runs 20 unified checks with real IGC handshaking
- **UnityPad** - Pad handles everything pre-launch (menus, fueling, targeting, printing)
- **UnityInventory** - Inventory management (sorting, production, fleet tracking)
- **UnityMissile** - Missile handles everything in-flight (guidance, targeting, detonation)
- **UnityBeacon** - Optional miner fleet status broadcasting

---

## Boot System Architecture

Unity Boot is a dedicated boot controller that runs FIRST before operational scripts. Uses real PB-to-PB IGC handshaking to verify all systems are running.

**Boot Flow:**
```
Unity Boot starts → Controls ALL 10 LCDs → Runs 20 checks → Sets boot_complete=true → Self-disables
                           ↓                      ↓
                    Sends IGC requests      Validates responses
                    to Pad & Inventory      from both PBs
                                                  ↓
UnityPad waits for boot_complete → Takes LCDs 1,2,3,7,8
UnityInventory waits for boot_complete → Takes LCDs 4,5,6,9,10
```

**IGC Channels (Boot Handshake):**
| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | Boot → Pad/Inv | Request system status |
| `UNITY_BOOT_RSP` | Pad/Inv → Boot | Respond with block counts |

**Response Formats:**
```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
```

**CustomData Structure (Button Panel [SYSTEM]):**
```ini
[SYSTEM]
boot_complete=false    ; Set TRUE by Unity Boot when 20/20 checks pass
pad_check=none         ; Boot writes "request", Pad writes "done"
pad_status=waiting     ; Pad writes response data here
inv_check=none         ; Boot writes "request", Inv writes "done"
inv_status=waiting     ; Inventory writes response data here
```

**The 20 Unified Boot Checks:**
| # | Check | Method |
|---|-------|--------|
| 1-4 | Grid, Panel, LCDs, IGC | Local block scan |
| 5 | Request Pad Status | IGC + CustomData |
| 6 | Await Pad Response | Real handshake |
| 7-10 | Validate Pad Merge/Power/Fuel | Parse response |
| 11 | Request Inv Status | IGC + CustomData |
| 12 | Await Inv Response | Real handshake |
| 13-16 | Validate Inv Cargo/Ref/Asm/Gas | Parse response |
| 17-20 | Cross-Validate, Sync, Config, Ready | Finalize boot |

**Module Sync (Check #17):**
Boot detects physically connected modules via connectors tagged `[PAD#-CON1]` and `[PAD#-CON2]`. If a connector is locked to another grid, it counts as a connected module.

| Connectors | Status |
|------------|--------|
| None connected | Standalone mode |
| CON1 connected | Syncing 1 module(s) |
| Both connected | Syncing 2 module(s) |

---

## Programmable Block Naming Convention

Scripts are loaded onto programmable blocks with specific naming patterns:

| Script | PB Name Format | Example |
|--------|---------------|---------|
| **Unity Boot** | `[PAD#-BOOT] UNITY BOOT` | `[PAD1-BOOT] UNITY BOOT` |
| **UnityPad** | `[PAD#] Unity Pad` | `[PAD1] Unity Pad` |
| **UnityMissile** | `PAD# Missile #X Unity Missile` | `PAD1 Missile #1 Unity Missile` |
| **UnityInventory** | `[PAD#] Unity Inventory` | `[PAD1] Unity Inventory` |
| **UnityBeacon** | `[BEACON] Unity Beacon` | `[BEACON] Unity Beacon` |

**Notes:**
- Unity Boot must run FIRST before UnityPad and UnityInventory
- The `[PAD#]` tag in the PB name ties it to a specific pad
- Missile PB names include the pad ID and missile build number
- UnityInventory runs on a separate PB for inventory management (same grid as UnityPad)
- All block tags remain unchanged (e.g., `[PAD1]`, `[PAD1:1]`, `-ore`, `[DOCK]`)

---

## Script Architecture

### UnityPad.cs (~100,000 chars deployed / 100,000 limit) - AT LIMIT

The brain of the operation. Runs on the launch pad's programmable block.

**State Machine:**
```
INIT → IDLE → PRINT → BUILD → DOCK → FUEL → AMMO → READY → ARM → LAUNCH → GONE
```

**Menu System:**
```
MAIN → TGT (Target) → SET (Settings) → ARM → WIZARD
```

**Key Systems:**
| System | Purpose |
|--------|---------|
| Printer Controller | Piston-based missile auto-fabrication |
| Block Scanner | Detects pad and missile components |
| Fuel Manager | Auto-transfers battery/H2/ice/ammo |
| IGC Listener | Receives missile telemetry |
| LCD Controller | 10-panel display system |
| Menu Handler | Button navigation |
| Inventory Manager | Tagged container routing, auto-sorting |
| Multi-Pad Controller | Coordinates multiple launch pads |
| Fleet Tracker | Monitors miner ships via UnityBeacon |

**Block Detection Tags:**
- `[PAD#]` - Pad blocks (e.g., `[PAD1]`, `[PAD2]`) - excluded from missile scan
- `[PAD#:1-10]` - LCD panels (e.g., `[PAD1:1]` through `[PAD1:10]`)
- `[PAD#-PRINT]` - Printer pistons, welders, projector
- `[DOCK]` - Fuel connector (auto-named on setup)
- `[AMMO]` - Ammo connector (auto-named on setup)

*Note: Code matches `[PAD` prefix to find any pad number*

**Container Tags (Inventory Routing):**
- `-ore` - Ore storage (e.g., `Large Cargo -ore`)
- `-ingot` - Ingot storage
- `-comp` - Component storage
- `-tools` - Tools & personal ammo
- `-ammo` - Base turret ammo
- `-bottle` - H2/O2 bottles

---

### UnityMissile.cs (~25,000 chars deployed / 100,000 limit) - OK

In-flight guidance system. Runs on the missile's programmable block.

**Flight Phases:**
```
IDLE → CLIMB → ARM → COAST → REENTRY → TARGET → DETONATE
```

**Satellite Mode:**
```
SAT_CLIMB → SAT_BRAKE → SAT_HOLD (station-keeping relay)
```

**Targeting Modes:**
| Mode | Behavior |
|------|----------|
| GPS | Fly to coordinates |
| ANTENNA | Track broadcasting signal |
| SENSOR | Hunt with onboard sensors |
| LIDAR | Camera raycast lock-on |
| MANUAL | Straight flight, no guidance |
| SATELLITE | Deploy as orbital relay |

**ICBM Profile (Planet Launch):**
```
LAUNCH → CLIMB (exit atmo, 60km+) → ARM → BURN → COAST → REENTRY → TARGET → BOOM
```

---

### UnityBeacon.cs (~7,600 chars deployed / 100,000 limit) - OK

Miner fleet status broadcaster. Runs on mining ships to report back to pad.

**Broadcasts every 3 seconds:**
- Ship name, entity ID
- Battery %, Cargo %, H2 %
- Position, speed, altitude
- Distance from home
- Status (DOCKED/DRILLING/TRAVELING/HOME/IDLE)
- Drill/grinder counts and active state

**Block Tags:**
- `[BEACON]` - Marks blocks for the script

---

## Communication Flow

```
┌─────────────────┐                    ┌─────────────────┐
│   UnityPad.cs   │                    │ UnityMissile.cs │
│   (Launch Pad)  │                    │   (In-Flight)   │
├─────────────────┤                    ├─────────────────┤
│ CustomData      │──── Config ────────│ ParseConfig()   │
│ (write config)  │     on launch      │ (read config)   │
├─────────────────┤                    ├─────────────────┤
│ mslListener     │◄─── Telemetry ─────│ BroadcastPos()  │
│ (IGC receive)   │     position,      │ (IGC send)      │
│                 │     phase, dist    │                 │
├─────────────────┤                    ├─────────────────┤
│ RemoteDetonate()│──── DETONATE ──────│ cmdListener     │
│ (IGC send)      │     command        │ (IGC receive)   │
└─────────────────┘                    └─────────────────┘
```

**IGC Channels:**
| Channel | Sender | Receiver | Purpose |
|---------|--------|----------|---------|
| `UNITY_BOOT_REQ` | Boot | Pad/Inv | Request system status |
| `UNITY_BOOT_RSP` | Pad/Inv | Boot | Respond with block counts |
| `UNITY_MSL` | Missile | Pad | Telemetry broadcast |
| `UNITY_MSL_CMD` | Pad | Missile | Commands (DETONATE, ABORT) |
| `UNITY_PAD_CMD` | Controller | Slaves | Mass commands |
| `UNITY_PAD_STATUS` | All Pads | Controller | Status updates |
| `UNITY_SAT_RELAY` | Satellite | Satellite | Inter-satellite mesh |
| `UNITY_SAT_RELAY_STATUS` | Satellite | Pad | Satellite status |
| `ENEMY_SIGNAL` | External | Controller | Enemy positions |
| `MINER_BEACON` | UnityBeacon | Pad | Fleet status |
| `UNITY_PRINTER` | Printer | Pad | Build completion |

---

## Printer System

Auto-prints missiles using piston-based welders.

**Print Cycle:**
```
prtState=0: RETRACT (initial reset to start position)
prtState=1: EXTEND (move welders out)
prtState=2: WELD+RETRACT (welders ON, slow retraction)
→ Repeat until projector shows 0 remaining blocks
```

**Block Requirements:**
- Pistons tagged `[PRINT]`
- Welders tagged `[PRINT]`
- Projector tagged `[PRINT]`

---

## Missile Systems Management

**After BUILD/DOCK (DisableMissileThrusters):**
- Thrusters: OFF, override 0%
- Gyros: OFF, no override
- Generators: OFF
- Batteries: RECHARGE mode
- Warheads: SAFE
- Antennas: OFF
- Sensors: OFF
- Cameras: OFF

**On ARM (EnableMissileForLaunch):**
- All systems: ON
- Batteries: DISCHARGE mode
- Antennas: 50km range, broadcasting
- Cameras: Raycast enabled

---

## Blackout Handling

Radio antennas have 50km range. ICBM climbs to 60km+. This creates a blackout zone.

**Missile Side:**
- Broadcasts `ENTERING_BLACKOUT` at 95% range
- Stops broadcasting in blackout zone
- Broadcasts `CONTACT_RESTORED` when back in range

**Pad Side:**
- Tracks `mslInBlackout` flag
- Shows last known status during blackout
- Can queue abort (`abortQueued`) during blackout
- Executes queued abort when contact restored

---

## LCD Display Layout

### Standard Mode (10 Panels)
| LCD | Content |
|-----|---------|
| 1 | Control Panel - menus, navigation, launch/arm |
| 2 | Build Requirements - components, ingots, ores |
| 3 | Missile Systems - block counts, ON/OFF status |
| 4 | Fuel & Targeting - power, H2, ammo, state |
| 5 | Pad Power - batteries, generation, net flow |
| 6 | Production - refineries, assemblers, graphs |
| 7 | Telemetry - comms, flight tracking, blackout |
| 8 | GPS & Targets - mode, waypoints, antennas |
| 9 | Miner Fleet - ship list, status overview |
| 10 | Miner Details - selected ship info |

### Controller Mode (8 Panels)
| LCD | Content |
|-----|---------|
| 1 | Command Center - mass control menu |
| 2 | Pad Status - all pads with [MPAR] indicators |
| 3 | Missile Inventory - ready/armed/flying counts |
| 4 | Mass Targeting - target GPS for broadcast |
| 5 | Launch Control - salvo/carpet settings |
| 6 | Build Queue - printing status across pads |
| 7 | Fleet Status - in-flight missile telemetry |
| 8 | Satellite Network - deployed satellites |

### In-Flight Display (GONE State)
All LCDs switch to flight tracking mode showing telemetry, phase, distance, and abort options.

---

## Auto-Queue System

**Components:**
- Scans projector for missing blocks
- Calculates component requirements
- Queues in assemblers automatically

**Ores (via ingot requirements):**
- Iron: 70% conversion
- Nickel: 40% conversion
- Cobalt: 30% conversion
- Silicon: 70% conversion
- Gold: 1% conversion
- Silver: 10% conversion
- Platinum: 0.5% conversion
- Magnesium: 0.7% conversion
- Uranium: 1% conversion

---

## File Structure

```
Unity Missile System/
├── Unity Boot.cs            # RAW boot script (EDIT THIS)
├── UnityPad.cs              # RAW pad script (EDIT THIS)
├── UnityMissile.cs          # RAW missile script (EDIT THIS)
├── UnityInventory.cs        # RAW inventory script (EDIT THIS)
├── UnityBeacon.cs           # RAW beacon script (EDIT THIS)
├── wrap-scripts.ps1         # Wraps all raw .cs to Program.cs
├── README.md                # User documentation
├── ARCHITECTURE.md          # This file
├── SETUP.md                 # Complete setup guide
├── SKILL_TREE.md            # Capabilities
├── ROADMAP.md               # Future plans
│
├── Unity Boot/              # MDK Project
│   ├── Program.cs           # Wrapped from Unity Boot.cs
│   ├── Unity Boot.csproj
│   ├── mdk.ini              # minify=full
│   └── .claude/             # Boot-specific workflow
│
├── UnityPad/                # MDK Project
│   ├── Program.cs           # Wrapped from UnityPad.cs
│   ├── UnityPad.csproj
│   ├── mdk.ini              # minify=full
│   └── .claude/             # Pad-specific workflow
│
├── UnityMissile/            # MDK Project
│   ├── Program.cs           # Wrapped from UnityMissile.cs
│   ├── UnityMissile.csproj
│   ├── mdk.ini              # minify=full
│   └── .claude/             # Missile-specific workflow
│
├── UnityInventory/          # MDK Project
│   ├── Program.cs           # Wrapped from UnityInventory.cs
│   ├── UnityInventory.csproj
│   ├── mdk.ini              # minify=full
│   └── .claude/             # Inventory-specific workflow
│
├── UnityBeacon/             # MDK Project
│   ├── Program.cs           # Wrapped from UnityBeacon.cs
│   ├── UnityBeacon.csproj
│   ├── mdk.ini              # minify=full
│   └── .claude/             # Beacon-specific workflow
│
└── .claude/                 # Main workflow system
    ├── CLAUDE.md            # Rules and enforcement
    ├── TODO.md              # Active tasks
    ├── FINALIZED.md         # Completed tasks
    ├── agents/              # Agent definitions
    └── commands/            # Workflow commands
```

---

## UnityInventory.cs Architecture (~78,680 chars deployed)

Dedicated inventory management script running on a separate PB from UnityPad. Waits for boot_complete before taking control of LCDs 4, 5, 6, 9, 10.

**Communication:** Button panel CustomData (shared with UnityPad)

**Key Systems:**
| System | Purpose |
|--------|---------|
| Container Scanner | Finds tagged cargo containers by type |
| Inventory Router | Routes items to correct containers |
| Production Manager | Queues components/ammo/bottles/tools |
| Refinery Feeder | Keeps refineries supplied with ore |
| Assembler Feeder | Keeps assemblers supplied with ingots |
| Miner Handler | Pulls ore from docked miners |
| Auto-Sorter | Moves items from small → large containers |

**Container Tags:**
- `-ore` - Ore storage
- `-ingot` - Ingot storage
- `-comp` - Component storage
- `-tools` - Hand tools (drills, welders, grinders)
- `-ammo` - Turret/launcher ammo
- `-PAmmo` - Personal weapon ammo
- `-bottle` - H2/O2 bottles

**Button Panel Protocol (Pad ↔ Inventory):**
```ini
[REQ]               # Pad writes what it needs
missileType=4
fuelReady=1

[TARGETS]           # Pad writes stock targets
ammo=50000
h2Bot=20

[ORE]               # Inventory writes current stock
Iron=25000
Ice=2500

[ING]
Iron=15000
Gravel=5000

[CMP]
SteelPlate=500/6000
Construction=250/3500

[STAT]
refWorking=3
asmWorking=2
cargoPct=45
```

**21 Tracked Components:**
SteelPlate, Construction, SmallTube, LargeTube, Motor, Computer, MetalGrid, Display, BulletproofGlass, PowerCell, Thrust, Explosives, Detector, RadioCommunication, GravityGenerator, InteriorPlate, Girder, Medical, Reactor, SolarCell, Superconductor

---

## Development Workflow

1. Edit `UnityPad.cs` or `UnityMissile.cs`
2. Run `powershell -File wrap-scripts.ps1`
3. Build: `dotnet build UnityPad` or `dotnet build UnityMissile`
4. MDK auto-deploys to SE ingame scripts folder
5. Check character count: `(Get-Content 'UnityPad.cs' -Raw).Length`

---

## Character Budget

**IMPORTANT:** These counts are for DEPLOYED `script.cs` files, not raw source.

| Script | Lines | Deployed | Limit | Margin | Status |
|--------|-------|----------|-------|--------|--------|
| Unity Boot | ~250 | 12,697 | 100,000 | 87,303 | OK |
| UnityPad | ~2,000 | 89,239 | 100,000 | 10,761 | OK |
| UnityMissile | ~900 | ~26,000 | 100,000 | 74,000 | OK |
| UnityInventory | ~1,200 | 78,680 | 100,000 | 21,320 | OK |
| UnityBeacon | ~175 | ~10,800 | 100,000 | 89,200 | OK |

*Note: Boot code extracted from UnityPad and UnityInventory into Unity Boot on 2026-01-18.*

**Check deployed sizes:**
```powershell
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityPad\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs" -Raw).Length
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs" -Raw).Length
```

---

## Variable Abbreviations Reference

For code size optimization, these variable names are abbreviated:

| Abbreviation | Full Name | Purpose |
|--------------|-----------|---------|
| `trkM` | trackedMiners | Dictionary of tracked mining ships |
| `dTgt` | detectedTargets | List of auto-detected enemy positions |
| `sStL` | satStatusListener | Satellite status IGC listener |
| `pStL` | padStatusListener | Pad status IGC listener |
| `aRS` | autoReplaceSats | Auto-replace lost satellites flag |
| `sRQ` | satReplaceQueued | Count of satellites queued for replacement |
| `tSC` | targetSatCount | Target number of satellites |
| `bcnL` | beaconListener | Miner beacon IGC listener |
| `enmL` | enemyListener | Enemy position IGC listener |
| `oreC` | oreConnectors | List of ore transfer connectors |
| `cPat` | carpetPattern | Carpet bombing pattern (0=line,1=grid,2=circle) |
| `cSpd` | carpetSpread | Carpet bombing spread distance |
| `svInt` | salvoInterval | Seconds between salvo launches |
| `svAct` | salvoActive | Salvo mode active flag |
| `sPos` | satPositions | Dictionary of satellite positions |
| `sBat` | satBattery | Dictionary of satellite battery levels |
| `sLSn` | satLastSeen | Dictionary of satellite last-seen times |
| `sTout` | satTimeout | Satellite timeout in seconds |
| `lSatC` | lastSatCheck | Last satellite network check time |
| `sStTag` | satStatusTag | Satellite status IGC channel tag |
| `pStTag` | padStatusTag | Pad status IGC channel tag |
| `pCmdL` | padCmdListener | Pad command IGC listener |
| `mslL` | mslListener | Missile telemetry IGC listener |
| `relL` | relayListener | Relay IGC listener |
| `aAtk` | autoAttack | Auto-attack mode flag |
| `isCtl` | isController | Controller mode flag |
| `detAnts` | detectedAnts | List of detected antenna names |
| `bcTag` | broadcastTag | Missile broadcast tag |
| `antBC` | antBroadcast | Antenna broadcast enabled flag |
| `mslDTT` | mslDistToTgt | Missile distance to target |
| `mslDFP` | mslDistFromPad | Missile distance from pad |
| `mslVel` | mslVelocity | Missile velocity |
| `mslBO` | mslInBlackout | Missile in blackout zone flag |
| `mslLnch` | mslLaunched | Missile launched flag |
| `mslAlt` | mslAltitude | Missile altitude |
| `mslGSt` | mslGyroStatus | Missile gyro status string |
| `mslAmmo` | mslAmmoCount | Missile ammo count |
| `hasTlm` | hasTelemetry | Has telemetry signal flag |
| `tlmTO` | telemetryTimeout | Telemetry timeout in ticks |
| `fnlDTT` | finalDistToTgt | Final distance to target at detonation |
| `lKPh` | lastKnownPhase | Last known missile phase |
| `lKDst` | lastKnownDist | Last known distance to target |
| `lMnuT` | lastMenuTime | Last menu interaction time |
| `lnchT` | launchTime | Launch timestamp |
| `lnchTk` | launchTicks | Ticks since launch |
| `lTlm` | lastTelemetry | Last telemetry receive time |
| `lTlmT` | lastTelTime | Last telemetry timestamp |
| `abtQ` | abortQueued | Abort queued during blackout |
| `abtS` | abortSent | Abort command sent flag |
| `abtT` | abortTime | Abort timestamp |
| `outT` | outcomeTime | Mission outcome time |
| `shwOut` | showOutcome | Show outcome screen flag |
| `fDist` | flightDist | Flight distance history array |
| `fAlt` | flightAlt | Flight altitude history array |
| `fSpd` | flightSpd | Flight speed history array |
| `fIdx` | flightIdx | Flight history index |
| `fltMd` | flightMode | Flight mode setting |
| `reDst` | reentryDist | Reentry distance setting |
| `cntDn` | countDown | Countdown seconds |
| `clbDst` | climbDist | Climb distance setting |
| `wpts` | waypoints | Waypoint list |
| `brnT` | burnTime | Burn time setting |
| `bldNum` | buildNumber | Build number counter |
| `bldCmp` | buildComplete | Build complete flag |
| `pNmd` | partsNamed | Parts named flag |
| `prtST` | prtStuckTicks | Printer stuck tick counter |
| `pH2B` | padH2Bottles | Pad hydrogen bottle count |
| `pO2B` | padO2Bottles | Pad oxygen bottle count |
| `h2PT` | h2PctTarget | Hydrogen percent target |
| `o2PT` | o2PctTarget | Oxygen percent target |
| `pUrnC` | padUranCount | Pad uranium count |
| `pIceC` | padIceCount | Pad ice count |
| `pPrt` | padPrinting | Dictionary of pad printing status |
| `pMslF` | padMslFound | Dictionary of pad missile found status |
| `pTgts` | padTargets | Dictionary of pad target coords |
| `kPads` | knownPads | List of known pad IDs |
| `kSats` | knownSats | List of known satellite IDs |

---

*Unity AI Lab - Missile Systems Division*
