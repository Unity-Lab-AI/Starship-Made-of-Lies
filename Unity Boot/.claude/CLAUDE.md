# Unity Boot - .claude Workflow System

Centralized boot controller for the Unity Missile System. Uses real PB-to-PB handshaking via IGC to verify all systems are running before releasing LCD control.

**Location:** `Unity Missile System/Unity Boot/`

---

## PURPOSE

Unity Boot is a dedicated boot controller that:
1. Waits for all required scripts to compile (pre-boot ready sync)
2. Takes control of ALL 10 LCDs during startup
3. Runs 21 unified system checks with real IGC handshaking
4. Sends requests to Pad and Inventory PBs, awaits responses
5. Validates response data (block counts, system status)
6. Detects miner fleet via MINER_BEACON broadcasts (check 20)
7. Signals `boot_complete=true` in CustomData when ready
8. Self-disables after boot, releasing LCDs to operational scripts

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

## PRE-BOOT READY SYNC

Scripts can be compiled in ANY order. Unity Boot waits for all required scripts before starting:

| Script | Ready Flag | Required |
|--------|------------|----------|
| Unity Boot | `boot_ready=true` | Yes (auto) |
| UnityPad | `pad_ready=true` | Yes |
| UnityInventory | `inv_ready=true` | Yes |
| UnityBeacon | (detected via MINER_BEACON) | No (optional) |

When waiting, shows "WAITING FOR SCRIPTS" screen on all 10 LCDs.

---

## REAL HANDSHAKE PROTOCOL

Unlike simple block scanning, Unity Boot uses actual PB-to-PB communication via IGC.

### IGC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | Boot → Pad/Inv | Request system status |
| `UNITY_BOOT_RSP` | Pad/Inv → Boot | Respond with block counts |
| `MINER_BEACON` | Beacon → Boot | Fleet status broadcasts |

### Response Format

```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
MB|EntityId|ShipName|Bat%|Cargo%|H2%|...  (miner beacon)
```

### CustomData Structure (Button Panel [SYSTEM])

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

; Miner fleet data (from check 20)
miner_count=0
miner_names=
beacon_optional=true

[QUOTAS]
ammo_target=50000
h2_target=20
o2_target=20

[BLACKBOX]
pad_errors=
inv_errors=
last_launch=
```

### Boot Flow

1. **Scripts compile** → Each writes its ready flag (pad_ready, inv_ready, boot_ready)
2. **Unity Boot checks flags** → If not all ready, shows "WAITING FOR SCRIPTS" screen
3. **All ready** → Clears stale data, starts 21/21 checks
4. **Checks 1-4** → Local block scan (grid, panel, LCDs, IGC)
5. **Checks 5-10** → Pad handshake and validation (merge, power, fuel)
6. **Checks 11-16** → Inventory handshake and validation (cargo, ref, asm, gas)
7. **Checks 17-19** → Cross-validate, module sync, write config
8. **Check 20** → Beacon detection - listens for MINER_BEACON, stores miner names
9. **Check 21** → System ready
10. **If success** → Sets `boot_complete=true` in CustomData
11. **Unity Boot disables itself** → `UpdateFrequency.None`
12. **UnityPad sees boot_complete=true** → Takes LCDs 1,2,3,7,8
13. **UnityInventory sees boot_complete=true** → Takes LCDs 4,5,6,9,10

---

## THE 21 UNIFIED CHECKS

| # | Check | Method | Verifies |
|---|-------|--------|----------|
| 1 | Initializing Core | Local | Grid has blocks |
| 2 | Scanning Grid | Local | Grid topology |
| 3 | Button Panel | Local | Control panel found |
| 4 | Detecting LCDs | Local | At least 1 LCD tagged |
| 5 | IGC Channels | Local | Channels registered |
| 6 | Request Pad Status | CustomData/IGC | pad_check=request sent |
| 7 | Await Pad Response | CustomData/IGC | pad_status != waiting |
| 8 | Validate Pad Merge | Response | merge block count |
| 9 | Validate Pad Power | Response | battery count |
| 10 | Validate Pad Fuel | Response | tank counts |
| 11 | Request Inv Status | CustomData/IGC | inv_check=request sent |
| 12 | Await Inv Response | CustomData/IGC | inv_status != waiting |
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

Timeout handling:
- If Pad/Inventory doesn't respond within 30 ticks, shows timeout error
- Retries request after error pause

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
| Unity Boot | ~14,600 | 100,000 | OK (85% margin) |

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
