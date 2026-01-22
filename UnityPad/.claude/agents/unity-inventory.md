# UnityInventory - Inventory Manager

Reference documentation for UnityInventory when working on other Unity Missile System scripts.

---

## OVERVIEW

**Script:** `UnityInventory.cs`
**PB Name:** `[PAD1] Unity Inventory`
**Deployed:** `%APPDATA%\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs`
**Characters:** 90,247 (9.8% margin)

Inventory management handling auto-production, quota tracking, and miner fleet display.

---

## CUSTOMDATA (Me.CustomData)

UnityInventory writes ONLY to its own PB's CustomData:

```ini
[SYSTEM]
inv_ready=true

[QUOTAS]
ammo_target=50000
h2_target=20

[MISSILE]
status=IDLE

[CONFIG]
ammo=50000

[STATUS]
refineries=3/4

[ORE]
Iron=25000

[INGOTS]
Iron=15000

[COMPONENTS]
SteelPlate=5000+50/6000

[TURRET_AMMO]
NATO_25x184=45000

[BOTTLES]
HydrogenBottle=15+5/20

[TOOLS_WEAPONS]
Welder4=2+0/20

[PERSONAL_AMMO]
NATO_5p56_Mag=50+0/100
```

---

## IGC CHANNELS

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | IN | Boot handshake request |
| `UNITY_BOOT_RSP` | OUT | Boot handshake response |
| `MINER_BEACON` | IN | Fleet status broadcasts |

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `IsBootComplete()` | Checks bootPB.CustomData for boot_complete=true |
| `FindSiblingPBs()` | Locates bootPB and padPB by name pattern |
| `SendBootResponse()` | Responds to boot handshake |
| `CountStocks()` | Count all items in containers |
| `QueueProduction()` | Queue missing items to assemblers |
| `RecycleExcess()` | Multi-assembler recycling (UseConveyorSystem=false) |
| `LoadMissileAmmo()` | Transfer ammo to missile |

---

## PRODUCTION SYSTEM

### Quota Dictionaries
| Dictionary | Item Type |
|------------|-----------|
| `cNd` | Components |
| `tNd` | Tools & Weapons |
| `paNd` | Personal Ammo |
| `bNd` | Bottles (H2/O2) |

### Container Tags
| Tag | Destination |
|-----|-------------|
| `-ore` | Ore storage |
| `-ingot` | Ingot storage |
| `-comp` | Component storage |
| `-ammo` | Ammo storage |
| `-tools` | Tool storage |
| `-bottle` | Bottle storage |

---

## LCD OWNERSHIP

**After boot_complete:** LCDs 4, 5, 6, 9, 10, 11

---

## READS FROM OTHER PBs

| Source | Data |
|--------|------|
| `bootPB.CustomData` | boot_complete flag |
| `padPB.CustomData` | pad mode, missile status |

---

## CHARACTER COUNT

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs").Length
```

---

*Unity AI Lab - Inventory Systems Division*
