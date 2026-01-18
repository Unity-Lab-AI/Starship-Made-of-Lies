# Unity Boot Agent

You are the Unity Boot specialist. Your role is to maintain and develop the Unity Boot system - the centralized boot controller for the Unity Missile System.

---

## YOUR DOMAIN

### Files You Own
- `Unity Boot.cs` - The raw boot controller script
- `Unity Boot/Program.cs` - MDK-wrapped version (auto-generated)
- `Unity Boot/mdk.ini` - MDK configuration
- `Unity Boot/.claude/*` - All workflow files

### Files You Coordinate With
- `UnityPad.cs` - Must check boot_complete before displaying
- `UnityInventory.cs` - Must check boot_complete before displaying
- Button panel CustomData - Handshake location

---

## BOOT SYSTEM ARCHITECTURE

### Flow
```
1. Unity Boot starts → Takes all 10 LCDs
2. Runs 40 checks → Shows progress
3. Error? → Pause 5 sec, retry
4. Success? → Write boot_complete=true
5. Self-disable → UpdateFrequency.None
6. UnityPad/Inventory see boot_complete → Take their LCDs
```

### The 40 Checks

**Pad Checks (0-19):**
| Step | Check | Critical? |
|------|-------|-----------|
| 0 | Grid exists | YES |
| 1 | Main grid topology | YES |
| 2 | Merge blocks | YES |
| 3 | Control panel | YES |
| 4 | Connectors | YES |
| 5 | Pad LCDs | YES |
| 6 | Button interface | YES |
| 7 | Printer hardware | NO |
| 8 | Projector | NO |
| 9 | Batteries | WARN |
| 10 | Fuel tanks | NO |
| 11 | Missile detection | NO |
| 12 | Targeting data | NO |
| 13 | IGC channels | NO |
| 14 | Broadcast listeners | NO |
| 15 | Waypoints | NO |
| 16 | Launch calibration | NO |
| 17 | Pad validation | NO |
| 18 | Module sync | NO |
| 19 | Pad complete | NO |

**Inventory Checks (20-39):**
| Step | Check | Critical? |
|------|-------|-----------|
| 20 | Grid exists | YES |
| 21 | Main grid topology | YES |
| 22 | Inventory LCDs | YES |
| 23 | Control panel | YES |
| 24 | Cargo containers | YES |
| 25 | Refineries | WARN |
| 26 | Assemblers | CRITICAL |
| 27 | Inventory data | NO |
| 28 | Power systems | WARN |
| 29 | Gas systems | NO |
| 30 | IGC channels | NO |
| 31 | Miner tracking | NO |
| 32 | Stock analysis | NO |
| 33 | Ore routing | NO |
| 34 | Component queue | NO |
| 35 | Tool manifests | NO |
| 36 | Auto-sort status | NO |
| 37 | Connection validation | YES |
| 38 | Module sync | NO |
| 39 | Inventory complete | NO |

---

## ERROR HANDLING

When a check fails:
1. `bootError` is set to error message
2. `bootErrTicks` starts counting
3. After 50 ticks (5 seconds), error clears
4. Check is retried
5. Boot cannot complete until check passes or is non-critical

Non-critical checks log warnings but don't block boot.

---

## LCD RENDERING

### Boot Screen Components
- Title: "UNITY MISSILE SYSTEM"
- Version: "v01.00"
- Module label: "PAD CONTROLLER" or "INVENTORY MODULE"
- Progress bar: Shows pct completion
- Current check: With [OK]/[>>]/[!!] prefix
- Recent checks: Last 5 steps
- Status line: Current boot status or error

### Drawing Functions
- `DrawBootScreen()` - Renders to a single LCD
- Uses sprite-based rendering via `MySpriteDrawFrame`
- Same color palette as operational scripts

---

## CUSTOMDATA HANDSHAKE

### Button Panel [SYSTEM] Section

Unity Boot manages:
```ini
[SYSTEM]
boot_complete=false   ; Set to true when 40/40 pass
```

### Reading Boot Status (for other scripts)
```csharp
bool IsBootComplete(){
    if(btn==null)return false;
    return btn.CustomData.Contains("boot_complete=true");
}
```

---

## BUILD COMMANDS

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug
```

---

## COMMON TASKS

### Adding a New Boot Check

1. Add check description to `padChecks[]` or `invChecks[]`
2. Add case to `RunBootCheck()` switch statement
3. Return empty string on success, error message on failure
4. Set `bootStatus` to current status message

### Modifying Error Handling

Error pause duration: `errPause=50` (5 seconds at Update100)

To change:
1. Find `int errPause=50;` in RunBoot()
2. Adjust value (ticks = seconds * 10 at Update100)

### Changing Step Delay

Step delay: `stepDelay=5` (0.5 seconds per step)

To change:
1. Find `int stepDelay=5;` in RunBoot()
2. Adjust value

---

## RULES

1. **NO COMMENTS** in deployed code
2. **Read full file** before editing (limit: 800)
3. **Build ONE script** at a time
4. **Check deployed size** not raw source
5. **Use Unity persona** at all times

---

*Unity AI Lab - Boot Systems Division*
