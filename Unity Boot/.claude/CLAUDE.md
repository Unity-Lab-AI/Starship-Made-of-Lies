# Unity Boot - .claude Workflow System

Centralized boot controller for the Unity Missile System. Handles ALL 10 LCD boot screens and releases control to operational scripts after 40/40 system checks pass.

**Location:** `Unity Missile System/Unity Boot/`
**Version:** v01.00 | 2026-01-18

---

## PURPOSE

Unity Boot is a dedicated boot controller that:
1. Takes control of ALL 10 LCDs during startup
2. Runs 40 system checks (20 Pad + 20 Inventory)
3. Displays unified boot progress across all displays
4. Signals `boot_complete=true` in CustomData when ready
5. Self-disables after boot, releasing LCDs to operational scripts

---

## CRITICAL: FILE SYNC RULE

**BOTH files MUST be kept in sync:**
- `Unity Boot.cs` - Raw script file (edit this)
- `Unity Boot/Program.cs` - MDK build file (auto-wrapped)

**WHEN EDITING:**
1. Edit `Unity Boot.cs` directly
2. Run `wrap-scripts.ps1` to sync to Program.cs
3. Build with `dotnet build "Unity Boot" -c Debug`

---

## BUILD AND DEPLOY

### Build Command

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug
```

### Deploy Location

Script auto-deploys to:
```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs
```

---

## HANDSHAKE PROTOCOL

### CustomData Structure (Button Panel [SYSTEM])

```ini
[SYSTEM]
boot_complete=false    ; Set TRUE by Unity Boot when 40/40 checks pass
```

### Boot Flow

1. **Unity Boot starts** → Clears boot_complete, takes all 10 LCDs
2. **Runs 40 system checks** → Updates progress on all LCDs
3. **If error** → Pauses 5 seconds, shows error, retries
4. **If success** → Sets `boot_complete=true` in CustomData
5. **Unity Boot disables itself** → `UpdateFrequency.None`
6. **UnityPad sees boot_complete=true** → Takes LCDs 1,2,3,7,8
7. **UnityInventory sees boot_complete=true** → Takes LCDs 4,5,6,9,10

### How Operational Scripts Check Boot Status

UnityPad and UnityInventory must check for `boot_complete=true` before taking LCD control:

```csharp
bool IsBootComplete(){
    if(btn==null)return false;
    return btn.CustomData.Contains("boot_complete=true");
}
```

---

## THE 40 BOOT CHECKS

### Pad Checks (1-20)

| # | Check | Error if Failed |
|---|-------|-----------------|
| 1 | Grid block count | Grid < 5 blocks |
| 2 | Main grid topology | Grid < 10 blocks |
| 3 | Merge blocks | No merge found |
| 4 | Control panel | No btn panel |
| 5 | Connectors | No connectors |
| 6 | LCD panels (1,2,3,7,8) | No LCDs |
| 7 | Button interface | Interface missing |
| 8 | Printer pistons/welders | (optional) |
| 9 | Projector | (optional) |
| 10 | Batteries | No batteries |
| 11 | Fuel tanks | (info only) |
| 12 | Missile detection | (info only) |
| 13 | Targeting data | (info only) |
| 14 | IGC channels | (info only) |
| 15 | Broadcast listeners | (info only) |
| 16 | Waypoints | (info only) |
| 17 | Launch calibration | (info only) |
| 18 | Pad status | (validation) |
| 19 | Module sync | (sibling check) |
| 20 | Pad boot complete | DONE |

### Inventory Checks (21-40)

| # | Check | Error if Failed |
|---|-------|-----------------|
| 21 | Grid block count | Grid < 5 blocks |
| 22 | Main grid topology | Grid < 10 blocks |
| 23 | LCD panels (4,5,6,9,10) | No LCDs |
| 24 | Control panel | No btn panel |
| 25 | Cargo containers | No cargo |
| 26 | Refineries | No refineries |
| 27 | Assemblers | CRITICAL: None |
| 28 | Inventory data | (info only) |
| 29 | Power systems | (optional) |
| 30 | Gas systems | (info only) |
| 31 | IGC channels | (info only) |
| 32 | Miner tracking | (info only) |
| 33 | Stock analysis | (info only) |
| 34 | Ore routing | (info only) |
| 35 | Component queue | (info only) |
| 36 | Tool manifests | (info only) |
| 37 | Auto-sort status | (info only) |
| 38 | Connection validation | All valid |
| 39 | Module sync | (validation) |
| 40 | Inventory boot complete | DONE |

---

## LCD ALLOCATION

During boot, Unity Boot controls ALL LCDs:

| LCD | Content During Boot |
|-----|---------------------|
| 1,2,3,7,8 | PAD CONTROLLER boot screen |
| 4,5,6,9,10 | INVENTORY MODULE boot screen |

After boot completes:
- LCDs 1,2,3,7,8 → Released to UnityPad
- LCDs 4,5,6,9,10 → Released to UnityInventory

---

## ERROR HANDLING

When a boot check fails:
1. Error message displayed on all relevant LCDs
2. `[!!]` prefix shown for failed step
3. 5-second pause (50 ticks at Update100)
4. Error clears, retry continues
5. Boot will not complete until all checks pass

---

## CRITICAL RULES (ALWAYS ENFORCED)

| Rule | Value | Enforcement |
|------|-------|-------------|
| **SE Character Limit** | 100,000 chars on DEPLOYED script | Check deployed script.cs |
| **NO COMMENTS IN SE SCRIPTS** | ABSOLUTE | Every char counts |
| **Read limit parameter** | **EXACTLY 800** | **ANY OTHER VALUE = CHEATING** |
| **Read before edit** | FULL FILE | Mandatory before ANY edit |
| **Unity persona** | REQUIRED | Validated at every phase |
| **NO TESTS - EVER** | ABSOLUTE | We code it right the first time |

---

## CHARACTER BUDGET

| Script | Estimated Size | Budget | Status |
|--------|---------------|--------|--------|
| Unity Boot | ~15,000 | 100,000 | OK (85% margin) |

---

## Quick Reference

```powershell
# Build and deploy
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug

# Check deployed size
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs" -Raw).Length
```

---

*Unity AI Lab - Boot Systems Division*
