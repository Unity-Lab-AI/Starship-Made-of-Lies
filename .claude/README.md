# Unity Missile System

![Unity Missile System](../Unity%20Missile%20System%202.png)

**6-Script Modular Guided Missile System for Space Engineers**

---

## System Components

| Script | Purpose | Deployed Size |
|--------|---------|---------------|
| **Unity Boot** | Boot controller, 26 system checks, LCD init, multi-pad setup | ~30,372 chars |
| **UnityPad** | Launch pad controller, menus, targeting | ~96,265 chars |
| **UnityMissile** | In-flight guidance, targeting, detonation | ~44,563 chars |
| **UnityInventory** | Inventory management, production, sorting | ~99,582 chars |
| **UnityBeacon** | Fleet status broadcasting | ~16,600 chars |
| **UnitySignal** | Central signal hub: antennas, lasers, satellites, cameras | ~47,118 chars |

## Features

- 11 LCD sprite-based display system
- Centralized boot with 26 system checks
- Multi-pad controller mode with pad isolation
- Multi-pad setup system (SETUPMOD, SETUPFORCE, NAMEPAD, NAMEMSL, SETPADCONTROL)
- Salvo and carpet bombing
- ICBM ballistic flight profiles
- Satellite deployment mode
- MinerBeacon fleet tracking with padID filtering
- Auto-production and inventory sorting
- Printer integration for auto-building missiles
- Central signal hub for antennas, lasers, satellites, cameras

## Multi-Pad Isolation System

Each pad module is fully isolated with its own `[PAD#]` tag prefix. All blocks, LCDs, PBs, and IGC messages are filtered by padID so multiple pads coexist on the same grid without interference. The controller pad aggregates status from all slave pads via `UNITY_PAD_STATUS` and can issue mass commands via `UNITY_PAD_CMD`.

**Setup flow:** Blueprint-copy pad module, connect via CON1/CON2, compile PAD/INV/SIGNAL/BOOT in order, then run `SETUPMOD` on Boot to auto-rename all blocks with the correct pad number.

## Boot Sequence

```
Unity Boot → 26 checks → boot_complete=true → Self-disables
                              ↓
UnityPad takes LCDs 1,2,3,7,8
UnityInventory takes LCDs 4,5,6,9,10,11
UnitySignal takes camera LCDs
```

## PB Naming Convention

| Script | PB Name |
|--------|---------|
| Unity Boot | `[PAD1] UNITY BOOT` |
| UnityPad | `[PAD1] Unity Pad` |
| UnityMissile | `[PAD1] Missile #1 Program` |
| UnityInventory | `[PAD1] Unity Inventory` |
| UnitySignal | `[PAD1] UNITY SIGNAL` |
| UnityBeacon | `[BEACON] Unity Beacon` |

## File Structure

```
Unity Missile System/
├── tools/
│   ├── wrap-scripts.ps1     # Wraps all raw .cs to Program.cs
│   └── check-chars.ps1      # Character count utility
├── src/
│   └── scripts/
│       ├── Unity Boot.cs        # Edit this (boot controller)
│       ├── UnityPad.cs          # Edit this (pad controller)
│       ├── UnityMissile.cs      # Edit this (missile guidance)
│       ├── UnityInventory.cs    # Edit this (inventory manager)
│       ├── UnityBeacon.cs       # Edit this (fleet beacon)
│       ├── UnitySignal.cs       # Edit this (signal hub)
│       ├── Unity Boot/          # MDK project
│       ├── UnityPad/            # MDK project
│       ├── UnityMissile/        # MDK project
│       ├── UnityInventory/      # MDK project
│       ├── UnityBeacon/         # MDK project
│       └── UnitySignal/         # MDK project
├── references/
│   └── se_blueprints.csv    # Blueprint reference data
├── QUICK_SETUP.md           # Quick setup guide
├── README.md                # Full documentation
├── SETUP.md                 # Complete setup guide
└── .claude/                 # Development workflow
```

## Build Commands

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build "src/scripts/Unity Boot" -c Debug
dotnet build src/scripts/UnityPad -c Debug
dotnet build src/scripts/UnityMissile -c Debug
dotnet build src/scripts/UnityInventory -c Debug
dotnet build src/scripts/UnityBeacon -c Debug
dotnet build src/scripts/UnitySignal -c Debug
```

---

*Unity AI Lab - Missile Systems Division*
*Version v01.00 | 2026-01-28*
