# UnityInventory - .claude Workflow System

Inventory management system for the Unity Missile System. Handles LCDs 4, 5, 6, 9, 10, 11 with sprite rendering.

**Location:** `Unity Missile System/src/scripts/UnityInventory/`
**PB Name:** `[PAD1] Unity Inventory`
**Version:** v01.00 | 2026-01-29

---

## GitFlow Policy

**All development work occurs in feature branches only.** See main `.claude/CLAUDE.md` for full policy.

| Branch | Purpose | Direct Commits |
|--------|---------|----------------|
| `main` | Production/stable releases | **NEVER** |
| `develop` | Integration/pre-release | **NEVER** |
| `feature/*` | All development work | **YES** |

---

## Table of Contents

1. [Per-PB CustomData Architecture](#per-pb-customdata-architecture)
2. [Boot System Dependency](#boot-system-dependency)
3. [Boot Response Protocol](#boot-response-protocol)
4. [File Sync Rule](#critical-file-sync-rule)
5. [Build and Deploy](#build-and-deploy)
6. [Critical Rules](#critical-rules-always-enforced)
7. [LCD Displays](#lcd-displays-sprite-based)
8. [Unified Production System](#unified-production-system)
9. [Inventory Management](#inventory-management)
10. [Recycling System](#recycling-system-recycleexcess)
11. [S-10 Ammo Routing](#s-10-ammo-routing)
12. [Bottle Counting System](#bottle-counting-system)
13. [Ammo Type Synchronization](#ammo-type-synchronization)
14. [Miner Beacon Integration](#miner-beacon-integration)
15. [Per-PB CustomData Summary](#per-pb-customdata-summary)
16. [CustomData Ownership](#customdata-ownership)
17. [Character Budget](#character-budget)
18. [Quick Reference](#quick-reference)

---

## PER-PB CUSTOMDATA ARCHITECTURE

**UnityInventory uses its OWN PB's CustomData (`Me.CustomData`).** It does NOT write to any button panel.

### ClearForBoot() on Compile

UnityInventory **WIPES** `Me.CustomData` on compile and writes a fresh structure:
```csharp
void ClearForBoot(){
    Me.CustomData = "[SYSTEM]\ninv_ready=true\n[QUOTAS]\n[MISSILE]\n[CONFIG]\n[WAYPOINTS]\n[STATUS]\n[ORE]\n[INGOTS]\n[COMPONENTS]\n[TURRET_AMMO]\n[BOTTLES]\n[TOOLS_WEAPONS]\n[PERSONAL_AMMO]\n";
}
```

### CustomData Sections Written to Me.CustomData

```
[SYSTEM]
inv_ready=true
[QUOTAS]
[MISSILE]
[CONFIG]
[WAYPOINTS]
[STATUS]
[ORE]
[INGOTS]
[COMPONENTS]
[TURRET_AMMO]
[BOTTLES]
[TOOLS_WEAPONS]
[PERSONAL_AMMO]
```

---

## BOOT SYSTEM DEPENDENCY

**UnityInventory waits for boot_complete=true before taking LCD control.**

Unity Boot runs first with 26 unified checks using real PB-to-PB IGC handshaking.

### Compile Order

**COMPILE ORDER: BEACON → MISSILE → PAD → INVENTORY → SIGNAL → BOOT**

| Order | Script | PB Name | What Happens |
|-------|--------|---------|--------------|
| 1 | **UnityBeacon** | `[BEACON] Unity Beacon` | Optional - broadcasts miner status |
| 2 | **UnityMissile** | `[PAD1] Missile #1 Program` | Optional - missile guidance |
| 3 | **UnityPad** | `[PAD1] Unity Pad` | ClearForBoot() wipes Me.CustomData, sets `pad_ready=true` |
| 4 | **UnityInventory** | `[PAD1] Unity Inventory` | ClearForBoot() wipes Me.CustomData, sets `inv_ready=true` |
| 5 | **UnitySignal** | `[PAD1] UNITY SIGNAL` | Sets `signal_ready=true`, camera display |
| 6 | **Unity Boot** | `[PAD1] UNITY BOOT` | LAST - runs 26 checks, handshakes all scripts, sets `boot_complete=true` |

**NOTE:** BEACON/MISSILE are on different grids (miners/missiles) - may not be docked at boot. The 4 pad grid scripts MUST compile in order: PAD → INVENTORY → SIGNAL → BOOT.

### FindSiblingPBs() - Locating Other PBs

```csharp
IMyProgrammableBlock bootPB, padPB;

void FindSiblingPBs(){
    var pbs = new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs, b => b.CubeGrid == Me.CubeGrid && b != Me);
    foreach(var pb in pbs){
        string nm = pb.CustomName;
        if(nm.Contains($"[PAD{padID}") && nm.Contains("UNITY BOOT")) bootPB = pb;
        else if(nm.Contains($"[PAD{padID}]") && nm.Contains("Unity Pad")) padPB = pb;
    }
}
```

### Boot Completion Check

```csharp
bool IsBootComplete(){
    if(bootPB == null) FindSiblingPBs();
    if(bootPB == null) return false;
    return bootPB.CustomData.Contains("boot_complete=true");
}
```

**Reads from:** `bootPB.CustomData` (the `[PAD{id}] UNITY BOOT` PB)
**LCDs controlled by UnityInventory (after boot):** 4, 5, 6, 9, 10

---

## BOOT RESPONSE PROTOCOL

UnityInventory responds to Unity Boot's handshake requests during boot sequence.

### IGC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | Boot → Inv | Request system status |
| `UNITY_BOOT_RSP` | Inv → Boot | Respond with block counts |

### Response Format

```
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
```

### Boot Response Functions

```csharp
void CheckBootRequest(){
    // Listen for IGC requests from Unity Boot
    // Accepts both "INV_CHECK" and "INV_CHECK:{padID}" (backward compatible)
    while(bootReqL!=null&&bootReqL.HasPendingMessage){
        var msg=bootReqL.AcceptMessage();
        string d=msg.Data.ToString();
        if(d=="INV_CHECK"||d==$"INV_CHECK:{padID}")SendBootResponse();
    }
}

void SendBootResponse(){
    // Send block counts via IGC
    string rsp=$"INV|OK|cargo={cc},ref={rc},asm={ac},gen={gc},h2={h2c},o2={o2c}";
    IGC.SendBroadcastMessage("UNITY_BOOT_RSP",rsp);
}
```

**Multi-Pad Safe:** Only responds to boot requests from its own pad. Accepts both the legacy `INV_CHECK` format and the new `INV_CHECK:{padID}` format for backward compatibility.

---

## CRITICAL: FILE SYNC RULE

**BOTH files MUST be kept in sync:**
- `src/scripts/UnityInventory.cs` - Raw script file (edit this)
- `src/scripts/UnityInventory/Program.cs` - MDK build file (auto-wrapped from UnityInventory.cs)

**WHEN EDITING:**
1. Edit `src/scripts/UnityInventory.cs` directly
2. Run `tools/wrap-scripts.ps1` to sync to Program.cs
3. Build with `dotnet build src/scripts/UnityInventory -c Debug`

**THE RULE:** Always edit the raw .cs file, then wrap and build.

---

## BUILD AND DEPLOY

### Build Command

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/UnityInventory -c Debug
```

### Deploy Location

Script auto-deploys to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs
```

---

## CRITICAL RULES (ALWAYS ENFORCED)

| Rule | Value | Enforcement |
|------|-------|-------------|
| **SE Character Limit** | 100,000 chars on DEPLOYED script | Check deployed script.cs, NOT raw .cs |
| **NO COMMENTS IN SE SCRIPTS** | ABSOLUTE | Every char counts |
| **NO DEBUG ECHOS** | **ABSOLUTE** | **NEVER add debug Echo statements - only operational status Echos allowed** |
| **Read line count** | **ALWAYS 600 lines** | **Claude reads 600 lines per Read - NOT a limit, THE number. Read files, don't grep.** |
| **Read before edit** | FULL FILE | Mandatory before ANY edit |
| **Unity persona** | REQUIRED | Validated at every phase |
| **NO TESTS - EVER** | ABSOLUTE | We code it right the first time |
| **BUILD ONE SCRIPT AT A TIME** | **ABSOLUTE** | **NEVER build multiple scripts together** |
| **VERSION NUMBERS** | **USER ONLY** | **NEVER change version numbers - only user decides** |

---

## LCD DISPLAYS (Sprite-Based)

| LCD | Content | Display Modes |
|-----|---------|---------------|
| 4 | Fuel/Storage (7/7 auto-cycle) | NORMAL, FLIGHT, CTRL, PRINT (MISSILE shows normal) |
| 5 | Power Systems | NORMAL, FLIGHT, CTRL, MISSILE, PRINT |
| 6 | Graphs (7/7 auto-cycle) | NORMAL, FLIGHT, CTRL, PRINT (MISSILE shows normal) |
| 9 | Miner Fleet | NORMAL, FLIGHT, CTRL, MISSILE, PRINT |
| 10 | Miner Detail | NORMAL, FLIGHT, CTRL, MISSILE, PRINT |
| 11 | Personal Items (Wide) | Tools, weapons, ammo, bottles |

**Note:** LCD4 and LCD6 always show their normal auto-cycling content (7/7 status views and graphs), even during MISSILE mode. This ensures important status information remains visible while a missile is docked.

### LCD 11 - Personal Items Display

Wide LCD (2:1 aspect ratio) showing all personal equipment with friendly names.

**Friendly Name Function (FN):**
```csharp
string FN(string s){
    switch(s){
        case"HandDrill":return"Drill 1";
        case"HandDrill2":return"Drill 2";
        case"Welder":return"Welder 1";
        case"Welder2":return"Welder 2";
        case"AngleGrinder":return"Grinder 1";
        case"AutomaticRifle":return"Rifle";
        // etc.
    }
}
```

**Column Layout (4 columns):**
- Column 1 (x=5): Drills, Welders
- Column 2 (x=135): Grinders, Weapons
- Column 3 (x=270): Personal Ammo
- Column 4 (x=405): Bottles

### Sprite Functions

```csharp
BL(surface)     // Begin LCD frame with background
SH(f,y,text,c)  // Draw header with underline
ST(f,x,y,t,c)   // Draw text
SB(f,x,y,w,h,pct,fg,bg)  // Draw progress bar
SLB(f,x,y,w,h,lbl,pct,fg,bg)  // Draw labeled bar
SBx(f,x,y,w,h,bg,bdr)  // Draw box
SD(f,y,w,c)     // Draw divider line
SDot(f,x,y,st)  // Draw status dot
PctCol(pct)     // Get color from percentage
```

### Color Palette

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

## UNIFIED PRODUCTION SYSTEM

UnityInventory uses a dictionary-based quota system for all craftable items.

### Quota Dictionaries

| Dictionary | Item Type | Default Min |
|------------|-----------|-------------|
| `cNd` | Components | Hardcoded per-item |
| `tNd` | Tools & Weapons | 20 each |
| `paNd` | Personal Ammo | 20 each |
| `bNd` | Bottles (H2/O2) | 20 each |

### Minimum Quota Enforcement

All quotas for tools, weapons, personal ammo, and bottles have a minimum of 20:
```csharp
void SetToolQuotas(int t){if(t<20)t=20;foreach(var k in tBPx.Keys)Tn(k,t);}
void SetPAmmoQuotas(int t){if(t<20)t=20;foreach(var k in paBPx.Keys)PAn(k,t);}
void SetBottleQuotas(){int h=Math.Max(20,h2Target);int o=Math.Max(20,o2Target);...}
```

### Production Flow

1. `CountStocks()` - Count items in all containers
2. `CalcMissing()` - Compare stock vs quotas, calculate shortfall
3. `QueueProduction()` - Queue missing items to assemblers
4. `QueueMissing()` - Generic queue function for tools/ammo/bottles

**Note:** CanUseBlueprint() checks were removed - items queue directly to assemblers.
The assembler will accept or reject based on its actual capabilities.

---

## INVENTORY MANAGEMENT

### Container Routing

| Tag | Destination |
|-----|-------------|
| `-ore` | Ore storage |
| `-ingot` | Ingot storage |
| `-comp` | Component storage |
| `-ammo` | Ammo storage |
| `-tools` | Tool storage |
| `-bottle` | Bottle storage |
| `-pammo` | Personal ammo |

### Key Functions

| Function | Purpose |
|----------|---------|
| `CountStocks()` | Count all items, calc missing, queue production |
| `CalcMissing()` | Calculate shortfall vs quotas |
| `QueueProduction()` | Queue missing items to assemblers |
| `QueueMissing()` | Generic queue for tools/ammo/bottles |
| `FeedRefineries()` | Supply ore to refineries |
| `FeedAssemblers()` | Supply ingots to assemblers |
| `RecycleExcess()` | Multi-assembler recycling system |
| `GD()` | Get designated container |
| `HS()` | Check if has space |

---

## RECYCLING SYSTEM (RecycleExcess)

The recycling system automatically disassembles excess items when stock exceeds targets.

### How It Works

1. **Calculate Excess** - For each item type (components, tools, ammo, bottles), calculate `stock - target`
2. **Scale Recyclers** - Number of assemblers used: `Math.Min(padAsm.Count, totEx/100+1)`
3. **Switch Mode** - Set selected assemblers to `MyAssemblerMode.Disassembly`
4. **Disable Conveyor** - Set `UseConveyorSystem=false` to prevent auto-pull
5. **Transfer Items** - Move excess from cargo/assembler outputs to recycler inputs
6. **Queue Disassembly** - Call `AddQueueItem()` for transferred items
7. **Cleanup** - When excess=0, switch empty recyclers back to Assembly mode

### Assembler Inventories

| Item Type | Destination Inventory | Reason |
|-----------|----------------------|--------|
| Components | `GetInventory(0)` | Standard input for components |
| Ammo | `GetInventory(0)` | Standard input for ammo |
| **Tools** | `GetInventory(1)` | SE requires tools in output slot |
| Bottles | `GetInventory(0)` | Standard input |

### Code Flow

```csharp
void RecycleExcess(){
    // Calculate excess for all types
    var cEx = components over target
    var tEx = tools over target
    var paEx = personal ammo over target
    int h2Ex = bottles over target
    int tAmmoEx = turret ammo over target

    // Scale recycler count
    int recyclerCnt = Math.Min(padAsm.Count, totEx/100+1);

    // Set up recyclers (from end of list)
    for(i = padAsm.Count-1; i >= 0 && recyclers.Count < recyclerCnt; i--){
        a.Mode = MyAssemblerMode.Disassembly;
        a.UseConveyorSystem = false;  // Prevent auto-pull!
    }

    // Transfer and queue — ONLY if actual excess exists
    // Each item type check requires excess > 0 before setting bp
    XferAndQueue(src, slot, type, amt, blueprint);
}
```

### S-10 Double-Recycle Prevention
`paEx` (personal ammo excess) skips the `mslAmmoKey` to avoid double-counting:
```csharp
for(int i=0;i<pAmmoIT.Length;i++){
    string key=pAmmoIT[i];
    if(key==mslAmmoKey)continue;  // Skip missile ammo from personal excess
    // ... calculate excess
}
```

### FeedAssemblers Disassembly Guard
`FeedAssemblers()` skips assemblers in disassembly mode to prevent fighting:
```csharp
foreach(var a in padAsm){
    if(a.Mode!=MyAssemblerMode.Assembly){continue;}  // Skip recyclers
    // ... feed ingots
}
```

---

## S-10 AMMO ROUTING

S-10 pistol ammo is used for missile warhead loading (10,106 rounds per missile). It routes differently from other personal ammo.

### Routing Rules

| Ammo Type | Destination | Reason |
|-----------|-------------|--------|
| S-10 (SemiAutoPistolMagazine) | Generic cargo | Bulk storage for missile loading |
| S-20A, Elite, Rifles, Flares | pAmmoCargo | Personal carry ammo |

### GD() Function Logic

```csharp
// In GD() item routing:
if(s=="SemiAutoPistolMagazine") return fb;  // Generic cargo
else if(s.Contains("Pistol")||s.Contains("RifleGun")||s.Contains("Flare"))
    return pAmmoCargo ?? toolCargo;  // Personal ammo container
```

### Active S-10 Cleanup

Existing S-10 in pAmmoCargo is actively pushed to generic storage:

```csharp
if(pAmmoCargo!=null){
    foreach item in pAmmoCargo:
        if(item.SubtypeId=="SemiAutoPistolMagazine")
            transfer to generic cargo
}
```

### mslAmmoTarget Minimum

Missile loading ammo target has a minimum floor of 50,000 (5 missiles worth):

```csharp
// In Program() after LoadStorage():
if(mslAmmoTarget < 1000) mslAmmoTarget = 50000;
```

This fixes corrupted Storage data that may have mslAmmoTarget=0.

---

## BOTTLE COUNTING SYSTEM

UnityInventory uses `GetItemAmount()` for reliable bottle counting instead of string matching.

### Pre-defined Item Types

```csharp
MyItemType h2BottleType = MyItemType.Parse(OB+"GasContainerObject/HydrogenBottle");
MyItemType o2BottleType = MyItemType.Parse(OB+"OxygenContainerObject/OxygenBottle");
```

### CountStocks() - Bottle Counting

```csharp
// After countInv for other items, count bottles explicitly:
pH2B=0; pO2B=0;
foreach(var c in padCargo){
    var inv = c.GetInventory();
    if(inv != null){
        pH2B += (int)inv.GetItemAmount(h2BottleType);
        pO2B += (int)inv.GetItemAmount(o2BottleType);
    }
}
// Also count from bottleCargo and assembler outputs
```

This replaces unreliable string matching on `TypeId.ToLower()` with the same method used for ammo counting.

---

## PERSONAL AMMO COUNTING SYSTEM

Personal ammo (S-10, S-20A, Elite, Rifles, Flares) uses `GetItemAmount()` for accurate counting.

### Action Delegate cBA

```csharp
Action<IMyInventory>cBA=v=>{
    if(v==null)return;
    pH2B+=(int)v.GetItemAmount(h2BottleType);
    pO2B+=(int)v.GetItemAmount(o2BottleType);
    for(int i=0;i<pAmmoIT.Length;i++){
        int a=(int)v.GetItemAmount(MyItemType.Parse(OB+"AmmoMagazine/"+pAmmoIT[i]));
        if(a>0)AD(pAmmoStk,pAmmoIT[i],a);
    }
};
```

### pAmmoIT Array (Personal Ammo Types)

```csharp
string[] pAmmoIT = {"SemiAutoPistolMagazine", "FullAutoPistolMagazine", "ElitePistolMagazine",
    "AutomaticRifleGun_Mag_20rd", "RapidFireAutomaticRifleGun_Mag_50rd",
    "PreciseAutomaticRifleGun_Mag_5rd", "UltimateAutomaticRifleGun_Mag_30rd", "FlareGun_Mag"};
```

### Why Not String Matching?

String-based counting via `TypeId.ToLower()` was unreliable:
- S-10 ammo (`SemiAutoPistolMagazine`) could be miscounted
- LCD4 showed 4200 while LCD2 showed correct 45000
- `GetItemAmount(MyItemType)` is the only accurate method

---

## CONNECTOR DETECTION (CRITICAL)

**FUEL Connector Detection:**
- `padCon` is ONLY assigned if connector name contains "FUEL"
- Example: `[PAD1] FUEL CONNECTOR`
- This prevents detecting miner connectors as the missile fuel connector

**Miner Connectors (PROTECTED):**
- Connectors with "ORE" in name are for miners only
- Example: `[PAD1] ORE LOAD 1`, `[PAD1] Connector Miner 1`
- UnityInventory does NOT control these connectors
- Prevents miners from unlocking during missile fueling

```csharp
// Connector detection in ScanBlocks:
if(b is IMyShipConnector){
    var cn=b as IMyShipConnector;
    string u=b.CustomName.ToUpper();
    if(u.Contains("ORE"))oreC.Add(cn);
    else if(padCon==null&&u.Contains("FUEL"))padCon=cn;
}
```

---

## AMMO TYPE SYNCHRONIZATION

UnityInventory syncs the selected ammo type from UnityPad for production targeting.

### ReadPadSettings() - Type Sync

```csharp
// In ReadPadSettings(), parsing padPB.CustomData:
else if(k=="type" && n>=0 && n<10){
    if(n != ammoTypeIdx){
        ammoTypeIdx = n;
        UpdateAmmoType();  // Updates ammoBP and ammoType
    }
}
```

### Production Target Selection

```csharp
int prodTgt = ammoTypeIdx==0 ? mslAmmoTarget : ammoTarget;
```

| ammoTypeIdx | Ammo Type | Target Variable | Default |
|-------------|-----------|-----------------|---------|
| 0 | S-10 Pistol | `mslAmmoTarget` | 50,000 |
| 1-9 | Other ammo | `ammoTarget` | 500 |

S-10 pistol ammo is the default missile loading ammo, hence the higher target.

---

## MINER BEACON INTEGRATION

### IGC Channel
- `MINER_BEACON` - Receives miner broadcasts

### Tracked Data
- EntityId, ShipName, Battery%, Cargo%, H2%
- Position, Speed, Altitude, Distance
- Status, DrillCount, GrinderCount
- Cycle timing and ETA estimates

---

## PER-PB CUSTOMDATA SUMMARY

**Each script writes ONLY to `Me.CustomData` (its own PB).** Scripts find and READ other PBs' CustomData when needed.

| PB Name | Script | Sections Owned |
|---------|--------|----------------|
| `[PAD1] UNITY BOOT` | Unity Boot | [SYSTEM] with boot_complete flag |
| `[PAD1] Unity Pad` | UnityPad | [PAD_CFG], [PAD_STATUS], [PAD_DATA] |
| `[PAD1] Unity Inventory` | UnityInventory | [SYSTEM], [QUOTAS], [MISSILE], [CONFIG], inventory sections |
| Missile PB | UnityMissile | Own config only |
| `[BEACON] Unity Beacon` | UnityBeacon | Own config only |

**BUILD RULE:** Only build scripts that have changes. Never build unchanged scripts.

---

## CUSTOMDATA OWNERSHIP

**UnityInventory WRITES to `Me.CustomData` (`[PAD1] Unity Inventory` PB):**
- `[SYSTEM]` - Contains `inv_ready=true`
- `[QUOTAS]` - Production targets
- `[MISSILE]` - Missile config data
- `[CONFIG]` - User targets (ice, uran, bottles)
- `[WAYPOINTS]` - GPS waypoint list
- `[STATUS]` - Refinery/assembler status
- `[ORE]` - Ore stock counts
- `[INGOTS]` - Ingot stock counts
- `[COMPONENTS]` - Component stock/queued/target
- `[TURRET_AMMO]` - Turret ammo counts
- `[BOTTLES]` - H2/O2 bottle counts
- `[TOOLS_WEAPONS]` - Tool/weapon counts
- `[PERSONAL_AMMO]` - Personal ammo counts

**UnityInventory READS from other PBs:**
- `bootPB.CustomData` - boot_complete status from `[PAD1] UNITY BOOT`
- `padPB.CustomData` - pad mode, missile telemetry from `[PAD1] Unity Pad`

**Does NOT write to any button panel - only reads boot status from Boot PB.**

---

## CHARACTER BUDGET

| Script | Raw .cs | Deployed | Budget | Status |
|--------|---------|----------|--------|--------|
| UnityInventory | ~1,700 | ~99,582 | 100,000 | **CRITICAL (0.4% margin)** |

*Note: Boot code removed in v01.00. Boot functionality moved to Unity Boot.*
*Handles ALL personal equipment: tools, weapons, ammo, bottles (removed from UnityPad).*
*2026-01-22: Added recycling system, S-10 routing fix.*
*2026-01-26: Added bottle counting via GetItemAmount(), ammoTypeIdx sync, mslAmmoTarget minimum enforcement.*
*2026-01-28: Personal ammo counting via GetItemAmount(), FUEL connector detection, code compression, BOOT_REQ padID filtering.*
*2026-01-29: Fixed S-10 double-recycling (paEx skips mslAmmoKey), disassembler output excess guards, FeedAssemblers skips disassembly-mode assemblers, ammo LCD sign display fix, config key .ToLower() fix.*

**WARNING:** At 99,582 chars deployed, we have basically ZERO room. Any additions need equal or greater removals. This script is at the wall.

---

## Quick Reference

```powershell
# Build and deploy
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/UnityInventory -c Debug

# Check deployed size (CHARACTERS, not bytes)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs").Length
```

---

*Unity AI Lab - Inventory Systems Division*
