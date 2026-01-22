# UnityInventory - Architecture Reference

*Last Updated: 2026-01-21 (Ammo Classification & Quota Fix)*
*Unity AI Lab - Inventory Systems Division*

---

## Overview

Unified inventory management system for the Unity Missile System. Handles:
- Production management (components, tools, ammo, bottles)
- Container organization with tagged routing
- Refinery and assembler feeding
- MinerBeacon fleet tracking
- LCD displays 4, 5, 6, 9, 10, 11
- Blueprint component priority during printing

**Character Budget:** 89,503 deployed / 100,000 limit (10.5% margin)
**PB Name:** `[PAD{id}-INV]` (e.g., `[PAD1-INV] Unity Inventory`)

---

## Per-PB CustomData Architecture

**UnityInventory writes ONLY to `Me.CustomData`** - each script has its own PB in the Per-PB architecture.

### PB Discovery

```csharp
IMyProgrammableBlock bootPB, padPB;

void FindSiblingPBs(){
    var pbs = new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs, b => b.CubeGrid == Me.CubeGrid && b != Me);
    foreach(var pb in pbs){
        string nm = pb.CustomName;
        if(nm.Contains($"[PAD{padID}]") && nm.ToUpper().Contains("UNITY BOOT")) bootPB = pb;
        else if(nm.Contains($"[PAD{padID}]") && !nm.Contains("-")) padPB = pb;
    }
}
```

### Sections UnityInventory Owns

```csharp
string[] invOwn = {"[QUOTAS]", "[MISSILE]", "[CONFIG]", "[WAYPOINTS]", "[STATUS]",
                   "[ORE]", "[INGOTS]", "[COMPONENTS]", "[TURRET_AMMO]",
                   "[BOTTLES]", "[TOOLS_WEAPONS]", "[PERSONAL_AMMO]"};
```

### Reading From Other PBs

| Need | Read From |
|------|-----------|
| boot_complete | bootPB.CustomData |
| pad mode | padPB.CustomData |

### IsBootComplete()

```csharp
bool IsBootComplete(){
    if(bootPB == null) FindSiblingPBs();
    if(bootPB == null) return false;
    return bootPB.CustomData.Contains("boot_complete=true");
}
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `FindSiblingPBs()` | Discovers bootPB and padPB |
| `WriteBtnData()` | Writes inventory sections to Me.CustomData |
| `ReadPadSettings()` | Reads mode from padPB.CustomData |

---

## LCD Allocation

| LCD | Content | Update Function |
|-----|---------|-----------------|
| 4 | Fuel/Storage | `UpdateLCD4()` |
| 5 | Power Systems | `UpdateLCD5()` |
| 6 | Graphs (auto-cycle) | `UpdateLCD6()` |
| 9 | Miner Fleet | `UpdateLCD9()` |
| 10 | Miner Detail | `UpdateLCD10()` |
| 11 | Personal Items (Wide) | `UpdateLCD11()` |

---

## Production System

### Quota Dictionaries

| Dictionary | Item Type | Purpose |
|------------|-----------|---------|
| `cNd` | Components | Component quotas (hardcoded per-item) |
| `tNd` | Tools & Weapons | Tool quotas (min 20) |
| `paNd` | Personal Ammo | Personal ammo quotas (min 20) - **ALL personal ammo uses this consistently** |
| `bNd` | Bottles | H2/O2 bottle quotas (min 20) |
| `bpNd` | Blueprint Needs | Printer component requirements (from UnityPad) |

**Note:** All personal ammo targets are read from `paNd` dictionary. No hardcoded index-based special cases.

### Blueprint Mappings

| Dictionary | Purpose |
|------------|---------|
| `tBPx` | Tool SubtypeId → Blueprint Definition |
| `paBPx` | Personal Ammo SubtypeId → Blueprint Definition |
| `bBPx` | Bottle SubtypeId → Blueprint Definition |

### Production Flow

```
CountStocks()      →  Count items in containers, populate stock dictionaries
    ↓
CalcMissing()      →  Compare stock vs quotas, calculate shortfall
    ↓
QueueProduction()  →  Call QueueMissing() for tools, ammo, bottles
    ↓
QueueMissing()     →  Generic queue function, adds to assembler queues
```

**Note:** CanUseBlueprint() checks were removed - items queue directly to assemblers.

---

## Inventory Functions

### Stock Counting

| Function | Purpose |
|----------|---------|
| `CountStocks()` | Main tick - counts all items, triggers production |
| `AD()` | Add/increment dictionary value |
| `NT()` | Normalize tool name for stock lookup |
| `SPP()` | Strip Position Prefix - extracts clean subtype from blueprint names |

### Queue Classification (Exact-Match)

Queue classification uses **exact-match** against stripped blueprint subtypes, not substring matching:

```csharp
string sub = SPP(bn);  // "Position0010_SemiAutoPistolMagazine" → "SemiAutoPistolMagazine"
if(tBPx.ContainsKey(sub)) AD(tQ, sub, amt);    // Tools/weapons
if(paBPx.ContainsKey(sub)) AD(pAmmoQ, sub, amt); // Personal ammo
```

This prevents cross-contamination where `SemiAutoPistolMagazine` would incorrectly match `SemiAutoPistol` weapon.

### Container Management

| Function | Purpose |
|----------|---------|
| `GD()` | Get designated container by item type |
| `HS()` | Check if inventory has space |
| `RouteItem()` | Determine destination for item |
| `OrganizeStorage()` | Auto-sort items to tagged containers |

### Production

| Function | Purpose |
|----------|---------|
| `CalcMissing()` | Calculate shortfall vs quotas |
| `QueueMissing()` | Generic queue function for all craftable items |
| `SetToolQuotas()` | Set tool quota (enforces min 20) |
| `SetPAmmoQuotas()` | Set personal ammo quota (enforces min 20) |
| `SetBottleQuotas()` | Set bottle quotas (enforces min 20) |

### Feeding

| Function | Purpose |
|----------|---------|
| `FeedRefineries()` | Supply ore to refineries |
| `FeedAssemblers()` | Supply ingots to assemblers |

---

## LCD 11 - Personal Items Display

Wide LCD (2:1 aspect ratio) with sprite-based rendering.

### Friendly Name Function (FN)

Converts code names to display names while preserving tier numbers:

| SubtypeId | Display Name |
|-----------|--------------|
| `HandDrill` | Drill 1 |
| `HandDrill2` | Drill 2 |
| `HandDrill3` | Drill 3 |
| `HandDrill4` | Drill 4 |
| `Welder` | Welder 1 |
| `Welder2` | Welder 2 |
| `AngleGrinder` | Grinder 1 |
| `AutomaticRifle` | Rifle |
| `PreciseAutomaticRifle` | Rifle Prec |
| `RapidFireAutomaticRifle` | Rifle Rapid |

### Column Layout

| Column | X Position | Items |
|--------|------------|-------|
| 1 | 5 | Drills, Welders |
| 2 | 135 | Grinders, Weapons |
| 3 | 270 | Personal Ammo |
| 4 | 405 | Bottles |

---

## Container Tags

| Tag | Destination |
|-----|-------------|
| `-ore` | Ore storage |
| `-ingot` | Ingot storage |
| `-comp` | Component storage |
| `-ammo` | Turret ammo storage |
| `-tools` | Tool storage |
| `-bottle` | Bottle storage |
| `-pammo` | Personal ammo |

---

## CustomData Sections (Written by UnityInventory)

| Section | Content |
|---------|---------|
| `[MISSILE]` | Missile config data |
| `[CONFIG]` | User targets (ice, uran, bottles) |
| `[WAYPOINTS]` | GPS waypoint list |
| `[STATUS]` | Refinery/assembler status |
| `[ORE]` | Ore stock counts |
| `[INGOTS]` | Ingot stock counts |
| `[COMPONENTS]` | Component stock+queued/target |
| `[TURRET_AMMO]` | Turret ammo counts |
| `[BOTTLES]` | H2/O2 bottle counts |
| `[TOOLS_WEAPONS]` | Tool/weapon counts |
| `[PERSONAL_AMMO]` | Personal ammo counts |

### CustomData Preservation

`WriteBtnData()` preserves sections it doesn't own:
- Captures `[PAD_*]` sections into `padSecs`
- Captures content after `[PAD_*]` into `afterPadSecs`
- Re-appends both after writing inventory sections

---

## Miner Beacon Integration

### IGC Channel

`MINER_BEACON` - Receives broadcasts every 3 seconds

### Tracked Data

| Field | Description |
|-------|-------------|
| EntityId | Ship's unique ID |
| ShipName | Display name |
| Battery% | Power level |
| Cargo% | Cargo fill level |
| H2% | Hydrogen fill level |
| Position | X,Y,Z coordinates |
| Speed | m/s velocity |
| Altitude | Height above surface |
| Distance | Distance from home |
| Status | DOCKED, DRILLING, TRAVELING, etc. |
| DrillCount | Number of drills |
| GrinderCount | Number of grinders |

---

## Sprite Functions

| Function | Purpose |
|----------|---------|
| `BL(surface)` | Begin LCD frame with background |
| `SH(f,y,text,c)` | Draw header with underline |
| `ST(f,x,y,t,c,sz,align)` | Draw text |
| `SB(f,x,y,w,h,pct,fg,bg)` | Draw progress bar |
| `SLB(f,x,y,w,h,lbl,pct,fg,bg)` | Draw labeled bar |
| `SBx(f,x,y,w,h,bg,bdr)` | Draw box |
| `SD(f,y,w,c)` | Draw divider line |
| `SDot(f,x,y,st)` | Draw status dot |
| `PctCol(pct)` | Get color from percentage |

---

## Color Palette

```csharp
cPri = Blue (0,180,255)      // Primary
cSec = Gray (100,100,100)    // Secondary
cAcc = Gold (255,200,0)      // Accent
cOK  = Green (0,255,100)     // Good status
cWrn = Orange (255,180,0)    // Warning
cErr = Red (255,60,60)       // Error
cBg  = Dark (10,10,15)       // Background
cBdr = Border (40,40,50)     // Border
cTxt = Light (220,220,220)   // Text
```

---

*Unity AI Lab - Inventory Systems Division*
