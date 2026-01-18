# UnityPad - .claude Workflow System

Launch pad controller for the Unity Missile System. Manages missile printing, fueling, arming, and launch.

**Location:** `Unity Missile System/UnityPad/` (part of Unity Missile System)
**Version:** v01.00 | 2026-01-17

---

## CRITICAL: FILE SYNC RULE

**BOTH files MUST be kept in sync:**
- `UnityPad.cs` - Raw script file (edit this)
- `UnityPad/Program.cs` - MDK build file (auto-wrapped from UnityPad.cs)

**WHEN EDITING:**
1. Edit `UnityPad.cs` directly
2. Run `wrap-scripts.ps1` to sync to Program.cs
3. Build with `dotnet build UnityPad -c Debug`

**THE RULE:** Always edit the raw .cs file, then wrap and build.

---

## BUILD AND DEPLOY

### Build Command

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityPad -c Debug
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
| **Read limit parameter** | **EXACTLY 800** | **ANY OTHER VALUE = CHEATING** |
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

## BLOCK TAGS

| Tag | Purpose |
|-----|---------|
| `[PAD#]` | Main pad blocks (merge, connector, button) |
| `[PAD#:1-10]` | LCD displays |
| `[PAD#-PRINT]` | Printer pistons/welders (# = pad number) |

---

## LCD LAYOUT

| LCD | Content |
|-----|---------|
| 1 | Main menu / flight tracking |
| 2 | Build status / telemetry |
| 3 | Missile systems |
| 4 | Fuel status / cargo |
| 5 | Power systems |
| 6 | Graphs (power/H2/O2) |
| 7 | Comms / targeting |
| 8 | Target mode info |
| 9 | Miner fleet (if any) |
| 10 | Miner details / storage |

---

## KEY FEATURES

- **Multi-Pad Controller Mode:** Coordinate multiple pads
- **Salvo/Carpet Bombing:** Launch missiles in sequence
- **Printer Integration:** Automated missile construction
- **Fleet Tracking:** Monitor mining ships via UnityBeacon
- **Telemetry:** Real-time missile tracking with graphs

---

## CHARACTER BUDGET

| Script | Raw .cs | Deployed | Budget | Status |
|--------|---------|----------|--------|--------|
| UnityPad | ~121,000 | 88,003 | 100,000 | OK (12% margin) |

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
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityPad -c Debug

# Check deployed size
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityPad\script.cs" -Raw).Length
```

---

*Unity AI Lab - Missile Systems Division*
