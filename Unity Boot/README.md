![Unity Boot](Unity%20Boot%202.png)

# Unity Boot - Boot Controller Script

**Version:** v01.00 | **Last Updated:** 2026-01-18

Centralized boot controller for the Unity Missile System. Runs 40 system checks and controls all 10 LCDs during startup.

---

## PURPOSE

Unity Boot is a dedicated boot controller that:
1. Takes control of ALL 10 LCDs during startup
2. Runs 40 system checks (20 Pad + 20 Inventory)
3. Displays unified boot progress across all displays
4. Signals `boot_complete=true` in CustomData when ready
5. Self-disables after boot, releasing LCDs to operational scripts

---

## SETUP

### Programmable Block

1. Add a Programmable Block to your launch pad grid
2. Load the `Unity Boot` script
3. **Name the PB:** `[PAD1-BOOT] UNITY BOOT`
4. Recompile and run

**IMPORTANT:** Install Unity Boot FIRST, before UnityPad and UnityInventory.

### Required Block

- Button Panel tagged `[SYSTEM]` - Used for boot_complete handshake

---

## HOW IT WORKS

### Boot Sequence

1. Unity Boot starts and clears `boot_complete=false`
2. Takes control of all 10 LCDs
3. Displays animated boot screen with progress
4. Runs 40 checks sequentially (1/40, 2/40, etc.)
5. On error: pauses 5 seconds, shows error message, retries
6. On success: sets `boot_complete=true` in [SYSTEM] CustomData
7. Self-disables (UpdateFrequency.None)
8. UnityPad and UnityInventory detect boot_complete and take their LCDs

### LCD Allocation

| Phase | LCDs |
|-------|------|
| During Boot | ALL 10 (animated boot screen) |
| After Boot | Released to Pad (1,2,3,7,8) and Inventory (4,5,6,9,10) |

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

## HANDSHAKE PROTOCOL

### CustomData Structure

Unity Boot communicates via the [SYSTEM] button panel's CustomData:

```ini
[SYSTEM]
boot_complete=false    ; Set TRUE when 40/40 checks pass
```

### How Operational Scripts Check

UnityPad and UnityInventory wait for boot_complete:

```csharp
bool IsBootComplete(){
    if(btn==null)return false;
    return btn.CustomData.Contains("boot_complete=true");
}
```

---

## ERROR HANDLING

When a boot check fails:
1. Error message displayed on all relevant LCDs
2. `[!!]` prefix shown for failed step
3. 5-second pause (50 ticks at Update100)
4. Error clears, retry continues
5. Boot will not complete until all checks pass

---

## BUILD COMMANDS

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug
```

### Verify Deployment

```powershell
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs" -Raw).Length
```

---

## CHARACTER COUNT

| Metric | Value |
|--------|-------|
| Deployed Size | 12,697 chars |
| Budget | 100,000 chars |
| Margin | 87% |

---

*Unity AI Lab - Boot Systems Division*
