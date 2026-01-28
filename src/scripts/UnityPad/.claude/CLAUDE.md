# UnityPad - .claude Workflow System

Launch pad controller for the Unity Missile System. Manages missile printing, fueling, arming, and launch.

**Location:** `Unity Missile System/src/scripts/UnityPad/` (part of Unity Missile System)
**PB Name:** `[PAD1] Unity Pad`
**Version:** v01.00 | 2026-01-24

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
7. [State Machine](#state-machine)
8. [Printer State Machine](#printer-state-machine)
9. [Block Tags](#block-tags)
10. [LCD Layout](#lcd-layout-after-boot-complete)
11. [Per-PB CustomData Summary](#per-pb-customdata-summary)
12. [CustomData Ownership](#customdata-ownership)
13. [Key Features](#key-features)
14. [Character Budget](#character-budget)
15. [Sprite-Based LCD System](#sprite-based-lcd-system)
16. [Quick Reference](#quick-reference)

---

## PER-PB CUSTOMDATA ARCHITECTURE

**UnityPad writes ONLY to `Me.CustomData` (its own PB).** On compile, `ClearForBoot()` wipes and writes fresh:

```ini
[SYSTEM]
pad_ready=true
[PAD_CFG]
[PAD_STATUS]
[PAD_DATA]
[BLACKBOX]
```

### GPS Input from Button Panel

**GPS coordinates are READ from the button panel `[PAD1] Controls`, NOT from Me.CustomData.**

```csharp
void ParseCustomGPS(){
    if(btn==null)return;
    string cd=btn.CustomData;  // Button panel, NOT Me.CustomData
    // Parse GPS:Name:X:Y:Z:#color: format
}
```

Users paste SE clipboard GPS directly into `[PAD1] Controls` button panel CustomData. UnityPad reads it via `ParseCustomGPS()`.

### Finding Sibling PBs

`FindSiblingPBs()` locates other PBs using `IsSameConstructAs(Me)` for multi-pad safe discovery. No fallback -- if a PB doesn't have the exact `[PAD{id}]` tag, it's ignored. This prevents PAD1 from accidentally grabbing PAD2's PBs.

```csharp
void FindSiblingPBs(){
    var pbs=new List<IMyProgrammableBlock>();
    GridTerminalSystem.GetBlocksOfType(pbs,p=>p.IsSameConstructAs(Me)&&p!=Me);
    foreach(var p in pbs){
        if(p.CustomName.Contains($"[PAD{id}]")&&p.CustomName.ToUpper().Contains("UNITY BOOT"))bootPB=p;
        if(p.CustomName.Contains($"[PAD{id}]")&&p.CustomName.Contains("Unity Inventory"))invPB=p;
        if(p.CustomName.Contains($"[PAD{id}]")&&p.CustomName.Contains("UNITY SIGNAL"))signalPB=p;
    }
}
```

**CRITICAL:** No fallback PB discovery. If a sibling PB isn't tagged with the exact `[PAD{id}]`, it won't be found. This is intentional for multi-pad safety.

| PB | Name Pattern | Example |
|----|--------------|---------|
| bootPB | `[PAD{id}]` + "UNITY BOOT" | `[PAD1] UNITY BOOT` |
| invPB | `[PAD{id}]` + "Unity Inventory" | `[PAD1] Unity Inventory` |
| signalPB | `[PAD{id}]` + "UNITY SIGNAL" | `[PAD1] UNITY SIGNAL` |

### Multi-Pad Discovery

`DiscoverSiblingPads()` uses `IsSameConstructAs(Me)` to find all pad PBs on the same construct. This allows controller mode to see PAD1, PAD2, PAD3, etc. without risking cross-pad contamination.

---

## BOOT SYSTEM DEPENDENCY

**UnityPad waits for boot_complete=true before taking LCD control.**

Unity Boot runs first with 23 unified checks using real PB-to-PB IGC handshaking.

### Pre-Boot Ready Flag

UnityPad **CLEARS Me.CustomData** and writes fresh sections on compile:
```csharp
ClearForBoot();  // WIPES Me.CustomData, writes fresh [SYSTEM] + [PAD_*] + [BLACKBOX]
WriteReadyFlag("pad_ready");  // Sets pad_ready=true in [SYSTEM]
```

**COMPILE ORDER: BEACON → MISSILE → PAD → INVENTORY → SIGNAL → BOOT**

BEACON/MISSILE are on different grids (miner/missile), can compile any time. The pad grid scripts MUST compile in order: PAD → INVENTORY → SIGNAL → BOOT.

The `ClearForBoot()` function:
- **ALWAYS clears Me.CustomData** - this is the reset point
- Writes fresh `[SYSTEM]` section with `pad_ready=true`
- Writes empty `[PAD_CFG]`, `[PAD_STATUS]`, `[PAD_DATA]`, `[BLACKBOX]`
- UnityInventory then adds `inv_ready=true` to its own PB
- Unity Boot runs last to perform 23 checks and set `boot_complete=true` in bootPB.CustomData

### Boot Completion Check

```csharp
IMyProgrammableBlock bootPB, invPB;

bool IsBootComplete(){
    if(bootPB == null) FindSiblingPBs();
    if(bootPB == null) return false;
    return bootPB.CustomData.Contains("boot_complete=true");
}
```

**Reads from:** `bootPB.CustomData` (the `[PAD1] UNITY BOOT` PB)
**LCDs controlled by UnityPad (after boot):** 1, 2, 3, 7, 8

---

## BOOT RESPONSE PROTOCOL

UnityPad responds to Unity Boot's handshake requests during boot sequence.

### IGC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | Boot → Pad | Request system status |
| `UNITY_BOOT_RSP` | Pad → Boot | Respond with block counts |

### Response Format

```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
```

### Boot Response Functions

BOOT_REQ filtering is backward compatible -- accepts both `"PAD_CHECK"` and `"PAD_CHECK:{padID}"`:

```csharp
void CheckBootRequest(){
    while(bootReqL!=null&&bootReqL.HasPendingMessage){
        var msg=bootReqL.AcceptMessage();
        string d=msg.Data.ToString();
        if(d=="PAD_CHECK"||d==$"PAD_CHECK:{id}")SendBootResponse();
    }
}

void SendBootResponse(){
    string rsp=$"PAD|OK|merge={mc},con={cc},bat={bc},h2={h2c},o2={o2c},prt={pc}";
    IGC.SendBroadcastMessage("UNITY_BOOT_RSP",rsp);
}
```

---

## CRITICAL: FILE SYNC RULE

**BOTH files MUST be kept in sync:**
- `src/scripts/UnityPad.cs` - Raw script file (edit this)
- `src/scripts/UnityPad/Program.cs` - MDK build file (auto-wrapped from UnityPad.cs)

**WHEN EDITING:**
1. Edit `src/scripts/UnityPad.cs` directly
2. Run `tools/wrap-scripts.ps1` to sync to Program.cs
3. Build with `dotnet build "src/scripts/UnityPad" -c Debug`

**THE RULE:** Always edit the raw .cs file, then wrap and build.

---

## BUILD AND DEPLOY

### Build Command

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build "src/scripts/UnityPad" -c Debug
```

### Deploy Location

Script auto-deploys to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs
```

---

## CRITICAL RULES (ALWAYS ENFORCED)

| Rule | Value | Enforcement |
|------|-------|-------------|
| **SE Character Limit** | 100,000 chars on DEPLOYED script | Check deployed script.cs, NOT raw .cs |
| **NO COMMENTS IN SE SCRIPTS** | ABSOLUTE | Every char counts |
| **Read line count** | **ALWAYS 600 lines** | **Claude reads 600 lines per Read - NOT a limit, THE number. Read files, don't grep.** |
| **Read before edit** | FULL FILE | Mandatory before ANY edit |
| **Unity persona** | REQUIRED | Validated at every phase |
| **NO TESTS - EVER** | ABSOLUTE | We code it right the first time |
| **BUILD ONE SCRIPT AT A TIME** | **ABSOLUTE** | **NEVER build multiple scripts together** |

---

## STATE MACHINE

```
INIT → IDLE → PRINT → BUILD → DOCK → FUEL → READY → ARM → LAUNCH → GONE
```

| State | Description |
|-------|-------------|
| INIT | Scanning for blocks |
| IDLE | No missile, waiting |
| PRINT | Welding new missile |
| BUILD | Missile building in progress |
| DOCK | Missile docked, connecting |
| FUEL | Transferring fuel/ammo |
| READY | Missile ready for launch |
| ARM | Armed, counting down |
| LAUNCH | Separation sequence |
| GONE | Missile launched, tracking |

---

## PRINTER STATE MACHINE

The printer uses a 5-state machine for welding missiles:

```
ALIGN(0) → UP(1) → DOWN(2) → ZERO(3) → H_STEP(4) → UP(1) → repeat
```

| State | Description |
|-------|-------------|
| 0 (ALIGN) | Align V pistons to prtVZero (1.4m), H pistons to max (7.2m), then turn on welders |
| 1 (UP) | V pistons extend UP toward prtVMax (10m) |
| 2 (DOWN) | V pistons retract DOWN toward 0 |
| 3 (ZERO) | V pistons return to prtVZero (1.4m), then call sH() to step horizontally |
| 4 (H_STEP) | H pistons retract by prtHStep (0.2m), then back to state 1 |

### Printer Constants

| Variable | Value | Purpose |
|----------|-------|---------|
| prtVZero | 1.4f | V piston home/zero position (alignment point) |
| prtVMax | 10f | V piston max extension (full vertical pass) |
| prtHMax | 7.2f | H piston max extension (starting H position) |
| prtHStep | 0.2f | Horizontal retract distance per pass |
| prtVSpeed | 0.5f | V piston velocity |
| prtHSpeed | 0.3f | H piston velocity |

### StartPrint() Initialization

On PRINT command:
1. Sets V piston MaxLimit to prtVZero (for initial alignment)
2. Sets H piston velocity to extend toward max
3. Welders stay OFF until state 0 completes alignment
4. State 0 changes V MaxLimit to prtVMax when ready to weld

### Print Completion

Printing stops when:
- `prtProj.RemainingBlocks == 0` (projector done)
- `prtHPos <= 0.05f` (H pistons fully retracted)

---

## BLOCK TAGS

| Tag | Purpose |
|-----|---------|
| `[PAD#]` | Main pad blocks (merge, connector, button) |
| `[PAD#:1-10]` | LCD displays |
| `[PAD#-PRINT]` | Printer pistons/welders (# = pad number) |

---

## LCD LAYOUT (After Boot Complete)

**UnityPad controls LCDs 1, 2, 3, 7, 8 only.** LCDs 4, 5, 6, 9, 10 are controlled by UnityInventory.

| LCD | Content |
|-----|---------|
| 1 | Main menu / flight tracking |
| 2 | Build status / telemetry |
| 3 | Missile systems |
| 7 | Comms / targeting |
| 8 | Target mode info |

---

## PER-PB CUSTOMDATA SUMMARY

**CRITICAL:** Each script writes ONLY to `Me.CustomData` (its own PB). Scripts find and READ other PBs' CustomData when needed.

| PB Name | Script | Sections in Me.CustomData |
|---------|--------|---------------------------|
| `[PAD1] UNITY BOOT` | Unity Boot | [SYSTEM] with boot_complete |
| `[PAD1] Unity Pad` | UnityPad | [SYSTEM], [PAD_CFG], [PAD_STATUS], [PAD_DATA], [BLACKBOX] |
| `[PAD1] Unity Inventory` | UnityInventory | [SYSTEM], inventory sections, [QUOTAS] |
| Missile PB | UnityMissile | Own config only |
| Miner PB | UnityBeacon | Own config only |

| Block | Purpose |
|-------|---------|
| `[PAD1] Controls` (Button Panel) | GPS input ONLY - user pastes GPS here, UnityPad reads via ParseCustomGPS() |

**BUILD RULE:** Only build scripts that have changes. Never build unchanged scripts.

---

## CUSTOMDATA OWNERSHIP

**UnityPad writes ONLY to Me.CustomData with these sections:**
- `[SYSTEM]` - Contains pad_ready=true (created by ClearForBoot on compile)
- `[PAD_CFG]` - Pad settings (climbDist, detonateDist, tMinus, etc.)
- `[PAD_STATUS]` - State machine status (state, mslFound, mslArmed)
- `[PAD_DATA]` - Operational data (lastLaunch, etc.)
- `[BLACKBOX]` - Error/event log

**UnityPad READS from other sources:**
- `bootPB.CustomData` - Reads boot_complete flag via IsBootComplete()
- `invPB.CustomData` - Reads inventory data via ReadInvStats() for LCD 2 component display
- `btn.CustomData` - Reads GPS coordinates via ParseCustomGPS() (button panel `[PAD1] Controls`)

**NOTE:** ClearForBoot() on compile WIPES Me.CustomData completely and writes fresh sections. UnityPad does NOT write to btn.CustomData - the button panel is for GPS input only.

---

## KEY FEATURES

- **Multi-Pad Controller Mode:** Coordinate multiple pads via SETPADCONTROL
- **Salvo/Carpet Bombing:** Launch missiles in sequence
- **Printer Integration:** Automated missile construction
- **Fleet Tracking:** Monitor mining ships via UnityBeacon
- **Telemetry:** Real-time missile tracking with graphs
- **Satellite Array Management:** Grid position tracking, spiral expansion, intercept handling
- **Setup Commands:** SETUPMOD, SETUPFORCE, NAMEPAD, NAMEMSL sent via UNITY_SETUP_CMD to Boot
- **Controller Commands:** BUILDALL, ARMALL, LAUNCHALL, ABORTALL for mass operations

### Satellite Array Management

UnityPad manages the satellite mesh network with UnitySignal as the data source:

| Feature | Description |
|---------|-------------|
| Status Reading | `ReadSignalSatData()` reads satellite status from signalPB.CustomData |
| Grid Position Tracking | `satGridX`/`satGridZ` dictionaries populated from Signal |
| Spiral Expansion | `AdvanceGridSlot()` calculates next position in spiral pattern |
| Intercept Handling | `CheckSatIntercept()` processes detonation messages, queues replacements |
| Auto-Replacement | `satReplaceQueue` holds positions needing new satellites |

**Data Flow:**
- UnitySignal listens to `UNITY_SAT_RELAY_STATUS` and tracks satellite status
- UnityPad reads `signalPB.CustomData` [SATELLITES] section via `ReadSignalSatData()`
- UnityPad listens directly to `UNITY_SAT_INTERCEPT` for real-time replacement queuing

---

## CHARACTER BUDGET

| Script | Raw .cs | Deployed | Budget | Status |
|--------|---------|----------|--------|--------|
| UnityPad | ~2,300 | ~96,265 | 100,000 | **CRITICAL (3.7% margin)** |

*Note: Boot code removed in v01.00. Boot functionality moved to Unity Boot.*
*Personal equipment tracking removed - UnityInventory handles all tools, weapons, ammo, bottles.*
*v01.00+: Added satellite array management, grid tracking, intercept handling, and auto-replacement.*

### Character Count Command
```powershell
# CORRECT: Count CHARACTERS (this is what SE checks)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs").Length
```

---

## SPRITE-BASED LCD SYSTEM

All LCDs (1-8) use sprite rendering via `MySpriteDrawFrame`:

### Sprite Functions
| Function | Purpose |
|----------|---------|
| `BL(surface)` | Begin LCD frame with background |
| `SH(f,y,text,c)` | Draw header with underline |
| `ST(f,x,y,t,c,sz,align)` | Draw text |
| `SB(f,x,y,w,h,pct,fg,bg)` | Draw progress bar |
| `SLB(f,x,y,w,h,lbl,pct,fg,bg)` | Draw labeled bar |
| `SMI(f,y,idx,text,sel)` | Draw menu item |
| `SBx(f,x,y,w,h,bg,bdr)` | Draw box |
| `PctCol(pct)` | Get color from percentage |

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

## Quick Reference

```powershell
# Build and deploy
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build "src/scripts/UnityPad" -c Debug

# Check deployed size (CHARACTERS, not bytes)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs").Length
```

---

*Unity AI Lab - Missile Systems Division*
