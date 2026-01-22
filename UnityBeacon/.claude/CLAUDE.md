# UnityBeacon v01.00 - .claude Workflow System

IGC beacon script for mining ships. Broadcasts status to UnityPad for fleet tracking. Features sprite-based LCD rendering.

**Designed to work with [PAM] Path Auto Miner by Keks** - https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929

**Location:** `Unity Missile System/UnityBeacon/` (part of Unity Missile System)
**Version:** v01.00 | 2026-01-22

---

## CRITICAL: FILE SYNC RULE

**BOTH files MUST be kept in sync:**
- `UnityBeacon.cs` - Raw script file (edit this)
- `UnityBeacon/Program.cs` - MDK build file (auto-wrapped from UnityBeacon.cs)

**WHEN EDITING:**
1. Edit `UnityBeacon.cs` directly
2. Run `wrap-scripts.ps1` to sync to Program.cs
3. Build with `dotnet build UnityBeacon -c Debug`

**THE RULE:** Always edit the raw .cs file, then wrap and build.

---

## BUILD AND DEPLOY

### Build Command

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityBeacon -c Debug
```

### Deploy Location

Script auto-deploys to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs
```

### MDK Requirements

The MDK project requires:
- `mdk.ini` with `type=programmableblock` (NO output= line!)
- `Program.cs` with `namespace IngameScript` and `partial class Program`
- `thumb.png` for script browser icon
- `Instructions.readme` (optional)

### mdk.ini (CORRECT)

```ini
[mdk]
type=programmableblock
trace=on
minify=full
minifyextraoptions=none
ignores=obj/**/*,MDK/**/*,**/*.debug.cs
namespaces=IngameScript
```

**CRITICAL:** Always use `minify=full` - it reduces deployed size by ~20-30%!

**WARNING:** Do NOT add `output=` line - it creates local folders instead of deploying to SE!

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
| **VERSION NUMBERS** | **USER ONLY** | **NEVER change version numbers - only user decides** |

---

## PER-PB CUSTOMDATA ARCHITECTURE

**CRITICAL:** Each script writes ONLY to `Me.CustomData` (its own PB). Scripts find and READ other PBs' CustomData when needed.

| PB Name Pattern | Script | Sections Owned |
|-----------------|--------|----------------|
| `[PAD{id}] UNITY BOOT` | Unity Boot | [SYSTEM] |
| `[PAD{id}] Unity Pad` | UnityPad | [BLACKBOX], [PAD_CFG], [PAD_STATUS], [PAD_DATA] |
| `[PAD{id}] Unity Inventory` | UnityInventory | [QUOTAS], [MISSILE], [CONFIG], inventory sections |
| Missile PB | UnityMissile | Own config only |
| `[BEACON]` | UnityBeacon | Own config only |

**BUILD RULE:** Only build scripts that have changes. Never build unchanged scripts.

**NOTE:** UnityBeacon runs on MINER ships - completely separate from pad PBs.

---

## MDK PROJECT STRUCTURE

```
Unity Missile System/
├── UnityPad.cs                   # Pad controller (receives beacon broadcasts)
├── UnityMissile.cs               # Missile script
├── UnityBeacon.cs                # THIS PROJECT - Raw script
├── UnityBeacon/                  # MDK Project folder
│   ├── Program.cs                # Main script file (wrapped from UnityBeacon.cs)
│   ├── UnityBeacon.csproj        # Project file
│   ├── mdk.ini                   # MDK config
│   ├── thumb.png                 # Script icon
│   ├── .claude/                  # Workflow (THIS FOLDER)
│   │   ├── CLAUDE.md             # This file
│   │   ├── TODO.md
│   │   └── FINALIZED.md
│   └── Instructions.readme       # Script description
└── .claude/                      # Main project workflow
```

---

## BLOCK TAGS

| Tag | Purpose |
|-----|---------|
| `[BEACON]` | Blocks used by UnityBeacon script |

---

## INTEGRATION WITH UNITY MISSILE SYSTEM

| Component | Location | Purpose |
|-----------|----------|---------|
| **UnityPad.cs** | `Unity Missile System/` | Launch pad, receives beacon broadcasts on LCD 9-10 |
| **UnityMissile.cs** | `Unity Missile System/` | Missile guidance |
| **UnityBeacon.cs** | `Unity Missile System/` | Runs on miner, broadcasts status |

### IGC Communication

| Channel | Sender | Receiver | Purpose |
|---------|--------|----------|---------|
| `MINER_BEACON` | UnityBeacon | UnityPad | Miner status broadcast (every 3 sec) |
| `UNITY_MSL` | Missile | Pad | Missile telemetry |
| `UNITY_MSL_CMD` | Pad | Missile | Missile commands |

### Broadcast Format

```
MB|EntityId|ShipName|Bat%|Cargo%|H2%|X,Y,Z|Speed|Alt|DistHome|Status|DrillCount|DrillsOn|GrinderCount|GrindersOn|Docked
```

**Example:**
```
MB|123456789|Miner1|85|42|68|1000,500,200|5|150|2500|DRILLING|4|4|0|0|0
```

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `Scan()` | Find blocks tagged with [BEACON] |
| `Broadcast()` | Send status via IGC every 3 seconds |
| `InferStatus()` | Determine ship state from block readings |
| `UpdateLCD()` | Display sprite-based status on ship's LCD |
| `AutoName()` | SETUP command - auto-tag blocks |
| `ParseConfig()` | Read settings from CustomData |
| `SaveConfig()` | Save settings to CustomData |
| `Reset()` | Clear all config, reset defaults |

---

## SPRITE-BASED LCD SYSTEM

All LCDs use sprite rendering via `MySpriteDrawFrame`:

### Sprite Functions

| Function | Purpose |
|----------|---------|
| `BL(surface)` | Begin LCD frame with dark background |
| `SH(f,y,text,c)` | Draw header with underline |
| `ST(f,x,y,t,c,sz,align)` | Draw text |
| `SB(f,x,y,w,h,pct,fg,bg)` | Draw progress bar |
| `SLB(f,x,y,w,h,lbl,pct,fg,bg)` | Draw labeled progress bar |
| `SD(f,y)` | Draw horizontal divider line |
| `PctCol(pct)` | Get color from percentage |

### Color Palette

```csharp
cPri = Blue (0,180,255)      // Primary
cSec = Gray (100,100,100)    // Secondary/Dividers
cAcc = Gold (255,200,0)      // Accent/Ship name
cOK  = Green (0,255,100)     // Good status (>70%)
cWrn = Orange (255,180,0)    // Warning (30-70%)
cErr = Red (255,60,60)       // Critical (<30%)
cBg  = Dark (10,10,15)       // Background
cBdr = Border (40,40,50)     // Border
cTxt = Light (220,220,220)   // Text
```

---

## COMMANDS

| Command | Action |
|---------|--------|
| `SETUP` | Auto-tag first RC, Antenna, Connector, LCD with [BEACON] |
| `SETHOME` | Save current position as home base |
| `RESCAN` | Re-scan for tagged blocks |
| `RESET` | Clear all config, clear LCD, reset to defaults |

---

## STATUS INFERENCE

| Status | Condition |
|--------|-----------|
| DOCKED | Connector locked |
| DRILLING | Drills on, speed < 2 m/s |
| DRILL_MOVE | Drills on, moving |
| GRINDING | Grinders on, speed < 2 m/s |
| GRIND_MOVE | Grinders on, moving |
| DEPARTING | Speed > 5 m/s, near home (<500m) |
| TRAVELING | Speed > 5 m/s |
| HOME | At home position (<100m), idle |
| IDLE | Default |

---

## CUSTOMDATA (MINER PB ONLY)

UnityBeacon runs on mining ships and uses its OWN PB's `Me.CustomData` for settings:

```ini
[BEACON]
ShipName=Miner1
HomeX=1000
HomeY=500
HomeZ=200
```

**UnityBeacon communicates via IGC ONLY:**
- Broadcasts on `MINER_BEACON` channel every 3 seconds
- Does not read from or write to pad CustomData
- Completely independent of Unity Boot/Pad/Inventory CustomData system

---

## PAM COMPATIBILITY

**UnityBeacon is designed to work perfectly alongside [PAM] Path Auto Miner by Keks:**

**Steam Workshop:** https://steamcommunity.com/sharedfiles/filedetails/?id=1507646929

PAM is a fantastic autonomous mining script that handles pathfinding, mining operations, and automated transportation. All credit for PAM goes to **Keks** - we just built the beacon system to track PAM-controlled ships!

**How it works together:**
- Doesn't interfere with PAM's operation
- Shares blocks via dual-tagging: `[PAM] [BEACON] Block Name`
- Reads ship state independently
- PAM handles autopilot, UnityBeacon handles status reporting

---

## CHARACTER BUDGET

**IMPORTANT:** The 100k limit applies to the DEPLOYED `script.cs`, NOT the raw source file!

| Script | Raw .cs | Deployed | Budget | Status |
|--------|---------|----------|--------|--------|
| UnityBeacon | ~200 | 14,658 | 100,000 | OK (85% margin) |

**NOTE:** mdk.ini MUST have `minify=full` for proper compression!

### Character Count

```powershell
# CORRECT: Count CHARACTERS (this is what SE checks)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs").Length
```

---

## Quick Reference

```powershell
# Build and deploy
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityBeacon -c Debug

# Check deployed size (CHARACTERS, not bytes)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs").Length
```

---

*Unity AI Lab - Mining Division*
