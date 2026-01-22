# UnityPad Agent

You are the UnityPad specialist. Reference this documentation when working on any Unity Missile System script that interacts with UnityPad.

---

## YOUR DOMAIN

### Files
- `UnityPad.cs` - The raw pad controller script
- `UnityPad/Program.cs` - MDK-wrapped version (auto-generated)
- `UnityPad/.claude/*` - All workflow files

### Coordinates With
- `Unity Boot.cs` - UnityPad reads boot_complete from bootPB.CustomData
- `UnityInventory.cs` - UnityPad reads inventory stats from invPB.CustomData
- `UnityMissile.cs` - UnityPad sends config to missile, receives telemetry
- `UnityBeacon.cs` - UnityPad receives miner broadcasts

---

## PAD SYSTEM ARCHITECTURE

### State Machine
```
INIT → IDLE → PRINT → BUILD → DOCK → FUEL → AMMO → READY → ARM → LAUNCH → GONE
```

| State | Description |
|-------|-------------|
| INIT | Scanning for blocks |
| IDLE | No missile, waiting |
| PRINT | Welding new missile |
| BUILD | Missile building in progress |
| DOCK | Missile docked, connecting |
| FUEL | Transferring fuel/ammo |
| AMMO | Loading ammo |
| READY | Missile ready for launch |
| ARM | Armed, counting down |
| LAUNCH | Separation sequence |
| GONE | Missile launched, tracking |

### Menu System
```
M.MAIN → M.TGT → M.SET → M.ARM → M.WIZARD → M.VIEW
```

### Printer State Machine
```
ALIGN(0) → UP(1) → DOWN(2) → ZERO(3) → H_STEP(4) → repeat
```

---

## PER-PB CUSTOMDATA ARCHITECTURE

### UnityPad writes ONLY to Me.CustomData

```ini
[SYSTEM]
pad_ready=true

[PAD_CFG]
climbDist=200
detonateDist=50
tMinus=10

[PAD_STATUS]
state=READY
mslFound=true
mslArmed=false
mode=NORMAL

[PAD_DATA]
lastLaunch=2026-01-20 08:00

[BLACKBOX]
; Event log
```

### Reading From Other PBs
```csharp
IMyProgrammableBlock bootPB, invPB;

void FindSiblingPBs(){
    var pbs = new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs, b => b.CubeGrid == Me.CubeGrid && b != Me);
    foreach(var pb in pbs){
        string nm = pb.CustomName;
        if(nm.Contains($"[PAD{padID}]") && nm.ToUpper().Contains("UNITY BOOT")) bootPB = pb;
        else if(nm.Contains($"[PAD{padID}]") && nm.Contains("Unity Inventory")) invPB = pb;
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
| `UNITY_MSL` | IN | Missile telemetry |
| `UNITY_MSL_CMD` | OUT | Missile commands (DETONATE, ABORT) |
| `UNITY_PAD_CMD` | IN/OUT | Multi-pad coordination |
| `UNITY_PAD_STATUS` | OUT | Status updates |
| `MINER_BEACON` | IN | Fleet status |
| `UNITY_PRINTER` | IN | Build completion |

### Boot Response Format
```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
```

### Missile Telemetry Format
```
Phase|DistToTarget|Velocity|PosX,PosY,PosZ|Altitude|Fuel%|Status
```

---

## LCD OWNERSHIP

**After boot_complete:** LCDs 1, 2, 3, 7, 8

| LCD | Content |
|-----|---------|
| 1 | Main menu / flight tracking |
| 2 | Build status / telemetry |
| 3 | Missile systems |
| 7 | Comms / targeting |
| 8 | Target mode info |

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `IsBootComplete()` | Check bootPB.CustomData |
| `FindSiblingPBs()` | Locate bootPB, invPB |
| `ParseCustomGPS()` | Read GPS from button panel |
| `SendBootResponse()` | IGC handshake response |
| `CheckBootRequest()` | Listen for boot requests |
| `StartPrint()` | Init missile printing |
| `RunPrinter()` | Execute print state machine |
| `LaunchMissile()` | Separation sequence |
| `HandleBtn()` | Process button input |

---

## BLOCK TAGS

| Tag | Purpose |
|-----|---------|
| `[PAD#]` | Main pad blocks |
| `[PAD#:1-10]` | LCD displays |
| `[PAD#-PRINT]` | Printer pistons/welders |

---

## BUILD COMMANDS

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityPad -c Debug
```

---

## CHARACTER COUNT

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs").Length
```

**Current:** 91,863 characters (8.1% margin)

---

## RULES

1. **NO COMMENTS** in deployed code
2. **Read full file** before editing (600 lines per read)
3. **Build ONE script** at a time
4. **Check deployed size** not raw source
5. **Use Unity persona** at all times

---

*Unity AI Lab - Missile Systems Division*
