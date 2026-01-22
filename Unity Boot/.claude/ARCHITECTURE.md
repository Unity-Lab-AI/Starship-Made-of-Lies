# Unity Boot - Architecture Reference

*Last Updated: 2026-01-20 (Per-PB CustomData Migration)*
*Unity AI Lab - Boot Systems Division*

---

## Overview

Centralized boot controller for the Unity Missile System. Runs 23 system checks with real PB-to-PB IGC handshaking before releasing LCD control to operational scripts.

**Character Budget:** 15,451 deployed / 100,000 limit (85% margin)
**PB Name:** `[PAD{id}] UNITY BOOT` (e.g., `[PAD1] UNITY BOOT`)

---

## Per-PB CustomData Architecture

**Unity Boot writes ONLY to `Me.CustomData`** - each script has its own PB in the Per-PB architecture.

### PB Discovery

```csharp
IMyProgrammableBlock padPB, invPB;

void FindSiblingPBs(){
    var pbs = new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs, b => b.CubeGrid == Me.CubeGrid && b != Me);
    foreach(var pb in pbs){
        string nm = pb.CustomName;
        if(nm.Contains($"[PAD{padID}]") && !nm.Contains("-")) padPB = pb;
        else if(nm.Contains($"[PAD{padID}-INV]")) invPB = pb;
    }
}
```

### Sections Unity Boot Owns

```csharp
string[] bootOwn = {"[SYSTEM]"};
```

### Reading From Other PBs

| Need | Read From |
|------|-----------|
| pad_ready | padPB.CustomData |
| inv_ready | invPB.CustomData |
| pad_status | padPB.CustomData |
| inv_status | invPB.CustomData |

### CheckReadyFlags()

```csharp
void CheckReadyFlags(){
    if(padPB == null || invPB == null) FindSiblingPBs();
    padReady = padPB != null && padPB.CustomData.Contains("pad_ready=true");
    invReady = invPB != null && invPB.CustomData.Contains("inv_ready=true");
}
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `FindSiblingPBs()` | Discovers padPB and invPB |
| `CheckReadyFlags()` | Reads ready flags from sibling PBs |
| `WriteBootComplete()` | Writes boot_complete=true to Me.CustomData |

---

## Boot Sequence

### Pre-Boot Ready Sync

Unity Boot waits for all required scripts to write their ready flags:

| Flag | Script | Required |
|------|--------|----------|
| `boot_ready=true` | Unity Boot | Yes (auto) |
| `pad_ready=true` | UnityPad | Yes |
| `inv_ready=true` | UnityInventory | Yes |

**Compile Order:** ANY - ClearForBoot() preserves existing CustomData

### The 23 Boot Checks

| # | Check | Method | Verifies |
|---|-------|--------|----------|
| 1 | Initializing Core | Local | Grid has blocks |
| 2 | Scanning Grid | Local | Grid topology |
| 3 | Button Panel | Local | Control panel found |
| 4 | Detecting LCDs | Local | At least 1 LCD tagged |
| 5 | IGC Channels | Local | Channels registered |
| 6 | Request Pad Status | IGC/CustomData | pad_check=request sent |
| 7 | Await Pad Response | IGC/CustomData | pad_status != waiting |
| 8 | Validate Pad Merge | Response | merge block count |
| 9 | Validate Pad Power | Response | battery count |
| 10 | Validate Pad Fuel | Response | tank counts |
| 11 | Request Inv Status | IGC/CustomData | inv_check=request sent |
| 12 | Await Inv Response | IGC/CustomData | inv_status != waiting |
| 13 | Validate Inv Cargo | Response | cargo containers |
| 14 | Validate Inv Refinery | Response | refineries |
| 15 | Validate Inv Assembler | Response | assemblers |
| 16 | Validate Inv Gas | Response | generators |
| 17 | Cross-Validate | Both | All systems accounted |
| 18 | Module Sync | CustomData | Multi-pad coordination |
| 19 | Write Config | CustomData | Load/verify quotas |
| 20 | Beacon Detection | MINER_BEACON | Detect miners, store names |
| 21 | System Ready | CustomData | boot_complete=true |

---

## IGC Communication

### Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | Boot → Pad/Inv | Request system status |
| `UNITY_BOOT_RSP` | Pad/Inv → Boot | Respond with block counts |
| `MINER_BEACON` | Beacon → Boot | Fleet status broadcasts |

### Response Formats

**Pad Response:**
```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
```

**Inventory Response:**
```
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
```

**Miner Beacon:**
```
MB|EntityId|ShipName|Bat%|Cargo%|H2%|X,Y,Z|Speed|...
```

---

## LCD Allocation

### During Boot

Unity Boot controls ALL 11 LCDs:

| LCD Group | Content |
|-----------|---------|
| 1, 2, 3, 7, 8 | PAD CONTROLLER boot screen |
| 4, 5, 6, 9, 10, 11 | INVENTORY MODULE boot screen |

### After Boot Complete

| LCD | Owner |
|-----|-------|
| 1, 2, 3, 7, 8 | UnityPad |
| 4, 5, 6, 9, 10, 11 | UnityInventory |

---

## CustomData Structure

### [SYSTEM] Section

```ini
[SYSTEM]
; Pre-boot ready flags
boot_ready=true
pad_ready=true
inv_ready=true

; Boot state
boot_complete=false
boot_phase=RUNNING

; PB handshake data
pad_check=none
pad_status=waiting
inv_check=none
inv_status=waiting

; Miner fleet data
miner_count=0
miner_names=
beacon_optional=true
```

### [QUOTAS] Section

```ini
[QUOTAS]
ammo_target=50000
h2_target=20
o2_target=20
```

### [BLACKBOX] Section

```ini
[BLACKBOX]
pad_errors=
inv_errors=
last_launch=
```

---

## Section Ownership

| Section | Owner | Action After Boot |
|---------|-------|-------------------|
| `[SYSTEM]` | Unity Boot creates | Other scripts read |
| `[QUOTAS]` | Unity Boot creates | UnityInventory reads |
| `[BLACKBOX]` | Unity Boot creates | Other scripts append |

**Unity Boot does NOT touch:**
- `[PAD_CFG]`, `[PAD_STATUS]`, `[PAD_DATA]` (UnityPad owns)
- `[MISSILE]`, `[CONFIG]`, `[ORE]`, `[INGOTS]`, etc. (UnityInventory owns)

---

## Error Handling

### Check Failure

1. Error message displayed on all relevant LCDs
2. `[!!]` prefix shown for failed step
3. 5-second pause (50 ticks at Update100)
4. Error clears, retry continues
5. Boot will not complete until all checks pass

### Timeout

- If Pad/Inventory doesn't respond within 30 ticks, shows timeout error
- Retries request after error pause

---

## Boot Flow

```
1. Scripts compile in any order
       ↓
2. Unity Boot checks ready flags
       ↓ (if not ready)
   Shows "WAITING FOR SCRIPTS" screen
       ↓ (if ready)
3. Clears stale check data
       ↓
4. Runs 23 checks sequentially
       ↓ (on success)
5. Sets boot_complete=true
       ↓
6. Self-disables (UpdateFrequency.None)
       ↓
7. UnityPad takes LCDs 1,2,3,7,8
   UnityInventory takes LCDs 4,5,6,9,10,11
```

---

## Key Functions

| Function | Purpose |
|----------|---------|
| `Main()` | Main tick, runs current check |
| `RunCheck()` | Execute numbered check |
| `ClearForBoot()` | Reset boot flags (preserve sections) |
| `WriteReadyFlag()` | Write ready flag to CustomData |
| `SendPadRequest()` | IGC request to Pad |
| `SendInvRequest()` | IGC request to Inventory |
| `ValidateResponse()` | Parse and validate response |
| `ListenForMiners()` | Collect MINER_BEACON broadcasts |
| `SetBootComplete()` | Final success, disable self |
| `ShowError()` | Display error with pause |
| `UpdateBootLCDs()` | Update all 11 LCDs |

---

## Sprite-Based LCD System

### Sprite Functions

| Function | Purpose |
|----------|---------|
| `BL(surface)` | Begin LCD frame with dark background |
| `SH(f,y,text,c)` | Draw header with underline |
| `ST(f,x,y,t,c,sz,align)` | Draw text |
| `SB(f,x,y,w,h,pct,fg,bg)` | Draw progress bar |
| `SD(f,y)` | Draw horizontal divider |
| `PctCol(pct)` | Get color from percentage |

### Color Palette

```csharp
cPri = Blue (0,180,255)      // Primary
cSec = Gray (100,100,100)    // Secondary
cAcc = Gold (255,200,0)      // Accent
cOK  = Green (0,255,100)     // Success
cWrn = Orange (255,180,0)    // Warning
cErr = Red (255,60,60)       // Error
cBg  = Dark (10,10,15)       // Background
cTxt = Light (220,220,220)   // Text
```

---

*Unity AI Lab - Boot Systems Division*
