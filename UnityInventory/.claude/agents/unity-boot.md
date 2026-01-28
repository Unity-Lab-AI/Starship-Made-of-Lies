# Unity Boot Agent

You are the Unity Boot specialist. Reference this documentation when working on any Unity Missile System script that interacts with Unity Boot.

---

## YOUR DOMAIN

### Files
- `Unity Boot.cs` - The raw boot controller script
- `Unity Boot/Program.cs` - MDK-wrapped version (auto-generated)
- `Unity Boot/.claude/*` - All workflow files

### Coordinates With
- `UnityPad.cs` - Boot reads pad_ready, Pad reads boot_complete
- `UnityInventory.cs` - Boot reads inv_ready, Inventory reads boot_complete
- `UnitySignal.cs` - Boot reads signal_ready, Signal reads boot_complete
- `UnityBeacon.cs` - Boot listens for MINER_BEACON broadcasts (optional)

---

## BOOT SYSTEM ARCHITECTURE

### The 26 Boot Checks
Unity Boot runs 26 unified checks with real PB-to-PB IGC handshaking:

| Phase | Checks | Purpose |
|-------|--------|---------|
| 0-4 | Core Init | Grid, panel, LCDs, IGC |
| 5-9 | Pad Handshake | PAD_CHECK request/response |
| 10-15 | Inventory Handshake | INV_CHECK request/response |
| 16-18 | Signal Handshake | SIGNAL_CHECK request/response |
| 19-21 | Cross-Validate | Module sync, config |
| 22 | Beacon Detection | Count miners (optional) |
| 23-25 | Finalize | Controller modules, boot_complete |

### Compile Order
```
BEACON → MISSILE → PAD → INVENTORY → SIGNAL → BOOT
```
**Boot is LAST** - it handshakes all other scripts.

---

## PER-PB CUSTOMDATA ARCHITECTURE

### Unity Boot writes ONLY to Me.CustomData

```ini
[SYSTEM]
boot_ready=true
boot_complete=true
boot_phase=DONE
miner_count=2
miner_names=Miner1,Miner2
```

### Reading From Other PBs (Multi-Pad Aware)
```csharp
IMyProgrammableBlock padPB, invPB, signalPB;

// Uses IsSameConstructAs(Me) — finds PBs across CON1/CON2 connectors, not just same grid
void DiscoverSiblingPads(){
    var pbs = new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs, b => b.IsSameConstructAs(Me) && b != Me);
    foreach(var pb in pbs){
        string nm = pb.CustomName;
        if(nm.Contains($"[PAD{padID}]") && nm.Contains("Unity Pad")) padPB = pb;
        else if(nm.Contains($"[PAD{padID}]") && nm.Contains("Unity Inventory")) invPB = pb;
        else if(nm.Contains($"[PAD{padID}]") && nm.Contains("UNITY SIGNAL")) signalPB = pb;
        // Also discovers other UNITY BOOT PBs for multi-pad awareness
    }
}

void CheckReadyFlags(){
    padReady = padPB?.CustomData.Contains("pad_ready=true") ?? false;
    invReady = invPB?.CustomData.Contains("inv_ready=true") ?? false;
    signalReady = signalPB?.CustomData.Contains("signal_ready=true") ?? false;
}
```

**Key change:** `IsSameConstructAs(Me)` replaces `CubeGrid == Me.CubeGrid` so Boot can discover sibling PBs across mechanically connected grids (CON1/CON2 connectors). Also discovers other UNITY BOOT PBs — not just UNITY PAD.

---

## IGC CHANNELS

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | OUT | Request status from scripts |
| `UNITY_BOOT_RSP` | IN | Receive responses |
| `MINER_BEACON` | IN | Fleet status (optional) |

### Request Types (Multi-Pad Aware)
- `PAD_CHECK:{padID}` - Request pad block counts (responders filter by padID)
- `INV_CHECK:{padID}` - Request inventory block counts (responders filter by padID)
- `SIGNAL_CHECK:{padID}` - Request signal camera/LCD counts (responders filter by padID)

**Backward compat:** Responders also accept bare `PAD_CHECK`/`INV_CHECK`/`SIGNAL_CHECK` without padID suffix.

### UNITY_SETUP_CMD Channel
- `SETUPMOD|{padID}` - Only the boot PB matching that padID runs the setup
- SETUPMOD re-tags blocks with old `[PAD]` tags (strips old tag, applies new `[PAD{padID}]`)

### Response Formats
```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
SIGNAL|OK|cams=12,lcds=2
```

---

## LCD OWNERSHIP

**During Boot:** Controls ALL 11 LCDs
**After boot_complete:** Releases LCDs, self-disables

| Phase | LCDs 1,2,3,7,8 | LCDs 4,5,6,9,10,11 |
|-------|----------------|-------------------|
| Boot | Boot controls | Boot controls |
| After | UnityPad | UnityInventory |

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `FindSiblingPBs()` | Locate padPB, invPB, signalPB |
| `CheckReadyFlags()` | Read ready flags from sibling PBs |
| `RunCheck()` | Execute current boot check |
| `SendBootRequest()` | IGC handshake request |
| `ProcessResponses()` | Handle IGC responses |
| `DrawBootScreen()` | All-LCD boot display |
| `SetBootComplete()` | Mark complete, self-disable |

---

## BOOT FLOW

1. **Compile** → Wipes Me.CustomData, writes [SYSTEM] with boot_ready=true
2. **FindSiblingPBs()** → Locates padPB, invPB, signalPB
3. **CheckReadyFlags()** → Waits for pad_ready, inv_ready, signal_ready
4. **RunChecks 0-25** → IGC handshakes, validation
5. **SetBootComplete()** → boot_complete=true, UpdateFrequency.None

---

## BUILD COMMANDS

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug
```

---

## CHARACTER COUNT

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs").Length
```

**Current:** 30,372 characters (69.6% margin)

---

## RULES

1. **NO COMMENTS** in deployed code
2. **Read full file** before editing (600 lines per read)
3. **Build ONE script** at a time
4. **Check deployed size** not raw source
5. **Use Unity persona** at all times

---

*Unity AI Lab - Boot Systems Division*
