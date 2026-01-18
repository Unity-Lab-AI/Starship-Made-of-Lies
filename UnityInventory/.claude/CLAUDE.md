# UnityInventory - .claude Workflow System

Inventory management system for the Unity Missile System. Handles LCDs 4, 5, 6, 9, 10 with sprite rendering.

**Location:** `Unity Missile System/UnityInventory/`
**Version:** v01.00 | 2026-01-18

---

## BOOT SYSTEM DEPENDENCY

**UnityInventory waits for boot_complete=true before taking LCD control.**

Unity Boot must run first and complete 40 system checks. UnityInventory checks for boot completion via:

```csharp
bool IsBootComplete(){
    if(btn==null)return false;
    return btn.CustomData.Contains("boot_complete=true");
}
```

**LCDs controlled by UnityInventory (after boot):** 4, 5, 6, 9, 10

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
| `ManageInventory()` | Main inventory orchestrator |
| `RouteItem()` | Find destination for item type |
| `FeedRefineries()` | Supply ore to refineries |
| `FeedAssemblers()` | Supply ingots to assemblers |
| `CraftTools()` | Queue tool production |
| `GD()` | Get designated container |
| `HS()` | Check if has space |
| `HT()` | Check if has item type |
| `ID()` | Check if container is designated |

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
| UnityInventory | ~98,000 | 78,680 | 100,000 | OK (21% margin) |

*Note: Boot code removed in v01.00 (2026-01-18). Boot functionality moved to Unity Boot.*

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
