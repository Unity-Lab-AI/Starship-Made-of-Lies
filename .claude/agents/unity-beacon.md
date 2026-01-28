# UnityBeacon Agent

You are the UnityBeacon specialist. Reference this documentation when working on any Unity Missile System script that interacts with UnityBeacon.

---

## YOUR DOMAIN

### Files
- `src/scripts/UnityBeacon.cs` - The raw beacon script
- `src/scripts/UnityBeacon/Program.cs` - MDK-wrapped version (auto-generated)
- `UnityBeacon/.claude/*` - All workflow files

### Coordinates With
- `src/scripts/Unity Boot.cs` - Boot detects miners via MINER_BEACON (Check 19)
- `src/scripts/UnityPad.cs` - Pad receives miner broadcasts
- `src/scripts/UnityInventory.cs` - Inventory displays fleet on LCDs 9-10

**PAM Compatible:** Works alongside [PAM] Path Auto Miner by Keks

---

## BEACON SYSTEM ARCHITECTURE

### Broadcast Cycle
Every 3 seconds, UnityBeacon broadcasts ship status via IGC.

### Status Inference
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

## PER-PB CUSTOMDATA ARCHITECTURE

### UnityBeacon writes ONLY to Me.CustomData (on miner ship)

```ini
[BEACON]
ShipName=Miner1
HomeX=1000
HomeY=500
HomeZ=200
```

---

## IGC CHANNELS

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `MINER_BEACON` | OUT | Broadcast status every 3 seconds |

### Broadcast Format (Multi-Pad Aware)
```
MB|PadID|EntityId|ShipName|Bat%|Cargo%|H2%|X,Y,Z|Speed|Alt|DistHome|Status|DrillCount|DrillsOn|GrinderCount|GrindersOn|Docked
```

**Example:**
```
MB|1|123456789|Miner1|85|42|68|1000,500,200|5|150|2500|DRILLING|4|4|0|0|0
```

**Multi-pad filtering:** Broadcasts include PadID in the data payload. Receiving pads filter by `bcnPad != padID` to ignore miners belonging to other pads. Controller mode sees ALL miners regardless of PadID.

---

## RECEIVERS

UnityBeacon broadcasts are received by:

| Script | Purpose |
|--------|---------|
| Unity Boot | Check 19 - Beacon Detection (counts miners) |
| UnityPad | Fleet tracking |
| UnityInventory | LCDs 9, 10 - Miner Fleet display |

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `Scan()` | Find blocks tagged [BEACON] |
| `Broadcast()` | Send IGC status |
| `InferStatus()` | Determine ship state |
| `UpdateLCD()` | Sprite-based display on miner |
| `AutoName()` | SETUP - auto-tag blocks |
| `ParseConfig()` | Read CustomData settings |
| `SaveConfig()` | Write CustomData settings |

---

## COMMANDS

| Command | Action |
|---------|--------|
| `SETUP` | Auto-tag first RC, Antenna, Connector, LCD with [BEACON] |
| `SETHOME` | Save current position as home base |
| `RESCAN` | Re-scan for tagged blocks |
| `RESET` | Clear all config, reset defaults |

---

## BLOCK TAGS

| Tag | Purpose |
|-----|---------|
| `[BEACON]` | Blocks used by UnityBeacon |
| `[PAM] [BEACON]` | Dual-tagged for PAM compatibility |

---

## BUILD COMMANDS

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
powershell -ExecutionPolicy Bypass -File tools/wrap-scripts.ps1
dotnet build src/scripts/UnityBeacon -c Debug
```

---

## CHARACTER COUNT

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs").Length
```

**Current:** ~16,600 characters (83.4% margin)

---

## RULES

1. **NO COMMENTS** in deployed code
2. **Read full file** before editing (600 lines per read)
3. **Build ONE script** at a time
4. **Check deployed size** not raw source
5. **Use Unity persona** at all times

---

*Unity AI Lab - Mining Division*
