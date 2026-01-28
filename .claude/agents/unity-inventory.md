# UnityInventory Agent

You are the UnityInventory specialist. Reference this documentation when working on any Unity Missile System script that interacts with UnityInventory.

---

## YOUR DOMAIN

### Files
- `src/scripts/UnityInventory.cs` - The raw inventory script
- `src/scripts/UnityInventory/Program.cs` - MDK-wrapped version (auto-generated)
- `src/scripts/UnityInventory/.claude/*` - All workflow files

### Coordinates With
- `src/scripts/Unity Boot.cs` - UnityInventory reads boot_complete from bootPB.CustomData
- `src/scripts/UnityPad.cs` - UnityInventory reads pad mode from padPB.CustomData
- `src/scripts/UnityBeacon.cs` - UnityInventory receives miner broadcasts for LCDs 9-10

---

## INVENTORY SYSTEM ARCHITECTURE

### Production Flow
```
CountStocks() → CalcMissing() → QueueProduction() → QueueMissing()
```

### Quota Dictionaries
| Dictionary | Item Type | Default Min |
|------------|-----------|-------------|
| `cNd` | Components | Per-item hardcoded |
| `tNd` | Tools & Weapons | 20 each |
| `paNd` | Personal Ammo | 20 each |
| `bNd` | Bottles (H2/O2) | 20 each |

### Container Tags
| Tag | Destination |
|-----|-------------|
| `-ore` | Ore storage |
| `-ingot` | Ingot storage |
| `-comp` | Component storage |
| `-ammo` | Ammo storage |
| `-tools` | Tool storage |
| `-bottle` | Bottle storage |
| `-pammo` | Personal ammo |

---

## PER-PB CUSTOMDATA ARCHITECTURE

### UnityInventory writes ONLY to Me.CustomData

```ini
[SYSTEM]
inv_ready=true

[QUOTAS]
ammo_target=50000
h2_target=20

[MISSILE]
status=IDLE
target=---

[CONFIG]
ammo=50000
ice=1000

[STATUS]
refineries=3/4 working
cargo=45%

[ORE]
Iron=25000
Stone=5000

[INGOTS]
Iron=15000
Silicon=8000

[COMPONENTS]
SteelPlate=5000+50/6000
Construction=2000+0/3500

[TURRET_AMMO]
NATO_25x184=45000

[BOTTLES]
HydrogenBottle=15+5/20

[TOOLS_WEAPONS]
Welder4=2+0/20

[PERSONAL_AMMO]
NATO_5p56_Mag=50+0/100
```

### Reading From Other PBs
```csharp
IMyProgrammableBlock bootPB, padPB;

void FindSiblingPBs(){
    var pbs = new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs, b => b.CubeGrid == Me.CubeGrid && b != Me);
    foreach(var pb in pbs){
        string nm = pb.CustomName;
        if(nm.Contains($"[PAD{padID}]") && nm.ToUpper().Contains("UNITY BOOT")) bootPB = pb;
        else if(nm.Contains($"[PAD{padID}]") && nm.Contains("Unity Pad")) padPB = pb;
    }
}

bool IsBootComplete(){
    if(bootPB == null) FindSiblingPBs();
    if(bootPB == null) return false;
    return bootPB.CustomData.Contains("boot_complete=true");
}
```

---

## IGC CHANNELS

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | IN | Boot handshake request |
| `UNITY_BOOT_RSP` | OUT | Boot handshake response |
| `MINER_BEACON` | IN | Fleet status broadcasts |

### Boot Response Format
```
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
```

### BOOT_REQ Filtering (Multi-Pad)
UnityInventory accepts both `"INV_CHECK"` and `"INV_CHECK:{padID}"` from UNITY_BOOT_REQ. Only responds when the padID matches (or no padID suffix for backward compat). This means PAD2's boot won't accidentally trigger PAD1's inventory to respond.

---

## LCD OWNERSHIP

**After boot_complete:** LCDs 4, 5, 6, 9, 10, 11

| LCD | Content |
|-----|---------|
| 4 | Fuel/Storage (7-view auto-cycle) |
| 5 | Power Systems |
| 6 | Graphs (7-view auto-cycle) |
| 9 | Miner Fleet |
| 10 | Miner Detail |
| 11 | Personal Items (wide) |

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `IsBootComplete()` | Check bootPB.CustomData |
| `FindSiblingPBs()` | Locate bootPB, padPB |
| `SendBootResponse()` | IGC handshake response |
| `CheckBootRequest()` | Listen for boot requests |
| `CountStocks()` | Count all items in containers |
| `CalcMissing()` | Calculate shortfall vs quotas |
| `QueueProduction()` | Queue missing items to assemblers |
| `QueueMissing()` | Generic queue for tools/ammo/bottles |
| `FeedRefineries()` | Supply ore to refineries |
| `FeedAssemblers()` | Supply ingots to assemblers |
| `RecycleExcess()` | Multi-assembler recycling system |
| `LoadMissileAmmo()` | Transfer ammo to missile |
| `CheckBeacons()` | Process MINER_BEACON broadcasts |

---

## RECYCLING SYSTEM (RecycleExcess)

Multi-assembler recycling with scaled distribution:

### Key Behaviors
- **Recycler Count:** `recyclers = padAsm.Take(1 + totEx/500).ToList()` - scales with excess
- **Mode Switching:** Sets `Mode = Disassembly` and `UseConveyorSystem = false`
- **Tool Transfer:** Uses `GetInventory(1)` for tools (SE requirement for disassembly)
- **Component/Ammo:** Uses `GetInventory(0)` for components and ammo
- **Queue Cleanup:** Clears assembly queue before switching to disassembly
- **Conveyor Restore:** Re-enables `UseConveyorSystem = true` when returning to assembly mode

### Why UseConveyorSystem = false?
Prevents the organizer from pulling items right back out of the disassembler while recycling.
Script transfers via `TransferItemTo()` bypass conveyor settings, so items still get in.

---

## S-10 AMMO ROUTING

S-10 pistol ammo (SemiAutoPistolMagazine) routes to generic cargo, not pAmmoCargo:

```csharp
// In GD() routing function:
s=="SemiAutoPistolMagazine" ? fb : (pAmmoCargo ?? toolCargo)
```

**Why?** S-10 is used for missile warhead loading (10,106 rounds per missile), not personal carry.
Other personal ammo (S-20A, Elite, rifles, flares) still routes to pAmmoCargo.

Active cleanup pushes existing S-10 from pAmmoCargo to generic cargo.

---

## BOTTLE COUNTING SYSTEM

Uses `GetItemAmount()` for reliable bottle counting instead of string matching:

```csharp
MyItemType h2BottleType = MyItemType.Parse(OB+"GasContainerObject/HydrogenBottle");
MyItemType o2BottleType = MyItemType.Parse(OB+"OxygenContainerObject/OxygenBottle");

// In CountStocks() after countInv:
pH2B=0; pO2B=0;
foreach(var c in padCargo){
    var inv = c.GetInventory();
    if(inv != null){
        pH2B += (int)inv.GetItemAmount(h2BottleType);
        pO2B += (int)inv.GetItemAmount(o2BottleType);
    }
}
```

**Why?** String matching on `TypeId.ToLower()` was unreliable. GetItemAmount() matches the pattern used for ammo counting.

---

## AMMO TYPE SYNCHRONIZATION

UnityInventory syncs ammo type from UnityPad for correct production targeting:

```csharp
// In ReadPadSettings(), parsing padPB.CustomData:
else if(k=="type" && n>=0 && n<10){
    if(n != ammoTypeIdx){
        ammoTypeIdx = n;
        UpdateAmmoType();  // Updates ammoBP and ammoType
    }
}

// Production target selection:
int prodTgt = ammoTypeIdx==0 ? mslAmmoTarget : ammoTarget;
```

| ammoTypeIdx | Ammo Type | Target Variable | Default |
|-------------|-----------|-----------------|---------|
| 0 | S-10 Pistol | `mslAmmoTarget` | 50,000 |
| 1-9 | Other ammo | `ammoTarget` | 500 |

**mslAmmoTarget minimum:** `if(mslAmmoTarget < 1000) mslAmmoTarget = 50000;` (prevents corrupted Storage)

---

## MINER BEACON INTEGRATION

UnityInventory receives broadcasts from UnityBeacon ships:

```
MB|EntityId|ShipName|Bat%|Cargo%|H2%|X,Y,Z|Speed|Alt|DistHome|Status|...
```

Displays fleet status on LCDs 9 and 10.

---

## BUILD COMMANDS

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/UnityInventory -c Debug
```

---

## CHARACTER COUNT

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs").Length
```

**Current:** 99,582 characters (**0.4% margin - CRITICAL, basically zero room**)

---

## RULES

1. **NO COMMENTS** in deployed code
2. **Read full file** before editing (600 lines per read)
3. **Build ONE script** at a time
4. **Check deployed size** not raw source
5. **Use Unity persona** at all times

---

*Unity AI Lab - Inventory Systems Division*
