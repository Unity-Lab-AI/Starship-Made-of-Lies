# UnityInventory - .claude Workflow System

Inventory management system for the Unity Missile System. Handles LCDs 4, 5, 6, 9, 10 with sprite rendering.

**Location:** `Unity Missile System/UnityInventory/`
**Version:** v01.00 | 2026-01-18

---

## BOOT SYSTEM DEPENDENCY

**UnityInventory waits for boot_complete=true before taking LCD control.**

Unity Boot runs first with 21 unified checks using real PB-to-PB IGC handshaking.

### Pre-Boot Ready Flag

UnityInventory writes `inv_ready=true` to the button panel CustomData on compile:
```csharp
WriteReadyFlag("inv_ready");
```

Unity Boot waits for this flag before starting checks. Scripts can be compiled in any order.

### Boot Completion Check

```csharp
bool IsBootComplete(){
    if(btn==null)return false;
    return btn.CustomData.Contains("boot_complete=true");
}
```

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
    // Listen for IGC requests
    while(bootReqL!=null&&bootReqL.HasPendingMessage){
        var msg=bootReqL.AcceptMessage();
        if(msg.Data.ToString()=="INV_CHECK")SendBootResponse();
    }
    // Also check CustomData fallback
    if(btn!=null&&btn.CustomData.Contains("inv_check=request"))
        SendBootResponse();
}

void SendBootResponse(){
    // Send block counts via IGC and CustomData
    string rsp=$"INV|OK|cargo={cc},ref={rc},asm={ac},gen={gc},h2={h2c},o2={o2c}";
    IGC.SendBroadcastMessage("UNITY_BOOT_RSP",rsp);
}
```

---

## CRITICAL: FILE SYNC RULE

**BOTH files MUST be kept in sync:**
- `UnityInventory.cs` - Raw script file (edit this)
- `UnityInventory/Program.cs` - MDK build file (auto-wrapped from UnityInventory.cs)

**WHEN EDITING:**
1. Edit `UnityInventory.cs` directly
2. Run `wrap-scripts.ps1` to sync to Program.cs
3. Build with `dotnet build UnityInventory -c Debug`

**THE RULE:** Always edit the raw .cs file, then wrap and build.

---

## BUILD AND DEPLOY

### Build Command

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityInventory -c Debug
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
| **Read limit parameter** | **EXACTLY 800** | **ANY OTHER VALUE = CHEATING** |
| **Read before edit** | FULL FILE | Mandatory before ANY edit |
| **Unity persona** | REQUIRED | Validated at every phase |
| **NO TESTS - EVER** | ABSOLUTE | We code it right the first time |
| **BUILD ONE SCRIPT AT A TIME** | **ABSOLUTE** | **NEVER build multiple scripts together** |
| **VERSION NUMBERS** | **USER ONLY** | **NEVER change version numbers - only user decides** |

---

## LCD DISPLAYS (Sprite-Based)

| LCD | Content | Display Modes |
|-----|---------|---------------|
| 4 | Fuel/Storage | NORMAL, FLIGHT, CTRL, MISSILE, PRINT |
| 5 | Power Systems | NORMAL, FLIGHT, CTRL, MISSILE, PRINT |
| 6 | Graphs | NORMAL, FLIGHT, CTRL, MISSILE, PRINT |
| 9 | Miner Fleet | NORMAL, FLIGHT, CTRL, MISSILE, PRINT |
| 10 | Miner Detail | NORMAL, FLIGHT, CTRL, MISSILE, PRINT |

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
| `RecycleExcess()` | Disassemble excess items |
| `GD()` | Get designated container |
| `HS()` | Check if has space |

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

## COMMUNICATION WITH UNITYPAD

Uses button panel CustomData for inter-PB communication:

### Reads from Pad
```ini
[UNITY_INV]
padID=1
status=FUEL
```

### Writes to Pad
```ini
[ORE], [ING], [CMP], [AMO], [BTL], [TLS], [STAT]
```

---

## CHARACTER BUDGET

| Script | Raw .cs | Deployed | Budget | Status |
|--------|---------|----------|--------|--------|
| UnityInventory | ~112,600 | ~83,800 | 100,000 | OK (16% margin) |

*Note: Boot code removed in v01.00. Boot functionality moved to Unity Boot.*

---

## Quick Reference

```powershell
# Build and deploy
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityInventory -c Debug

# Check deployed size
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs" -Raw).Length
```

---

*Unity AI Lab - Inventory Systems Division*
