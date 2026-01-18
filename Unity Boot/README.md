![Unity Boot](Unity%20Boot%202.png)

# Unity Boot - Boot Controller Script

Centralized boot controller for the Unity Missile System. Uses real PB-to-PB IGC handshaking to verify all systems are running before releasing LCD control.

---

## PURPOSE

Unity Boot is a dedicated boot controller that:
1. Takes control of ALL 10 LCDs during startup
2. Runs 20 unified system checks with real IGC handshaking
3. Sends requests to Pad and Inventory PBs, awaits their responses
4. Validates response data (block counts, system status)
5. Signals `boot_complete=true` in CustomData when ready
6. Self-disables after boot, releasing LCDs to operational scripts

---

## SETUP

### Programmable Block

1. Add a Programmable Block to your launch pad grid
2. Load the `Unity Boot` script
3. **Name the PB:** `[PAD1-BOOT] UNITY BOOT`
4. Recompile and run

**IMPORTANT:** All three PBs (Boot, Pad, Inventory) must be running. Boot talks to them via IGC.

### Required Blocks

- Button Panel with "control" in name - Used for boot handshake and CustomData storage

### Optional Blocks (Module Connections)

- Connector tagged `[PAD#-CON1]` - First module connection point
- Connector tagged `[PAD#-CON2]` - Second module connection point

These connectors are used for physical module sync detection during boot.

---

## HOW IT WORKS

### Real PB-to-PB Handshaking

Unlike simple block scanning, Unity Boot verifies that Pad and Inventory PBs are actually running and responding:

**IGC Channels:**
| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | Boot → Pad/Inv | Request system status |
| `UNITY_BOOT_RSP` | Pad/Inv → Boot | Respond with block counts |

**Response Format:**
```
PAD|OK|merge=1,con=2,bat=4,h2=2,o2=1,prt=6
INV|OK|cargo=5,ref=2,asm=3,gen=4,h2=2,o2=1
```

### Boot Sequence

1. Unity Boot starts and clears `boot_complete=false`
2. Takes control of all 10 LCDs
3. Runs checks 1-4 (local block scan)
4. Check 5: Sends `PAD_CHECK` request via IGC
5. Check 6: Awaits Pad response
6. Checks 7-10: Validates Pad response data
7. Check 11: Sends `INV_CHECK` request via IGC
8. Check 12: Awaits Inventory response
9. Checks 13-16: Validates Inventory response data
10. Checks 17-20: Cross-validate, module sync, write config, complete
11. Sets `boot_complete=true` in [SYSTEM] CustomData
12. Self-disables (UpdateFrequency.None)
13. UnityPad and UnityInventory detect boot_complete and take their LCDs

### LCD Allocation

| Phase | LCDs |
|-------|------|
| During Boot | ALL 10 (animated boot screen) |
| After Boot | Released to Pad (1,2,3,7,8) and Inventory (4,5,6,9,10) |

---

## THE 20 UNIFIED CHECKS

| # | Check | Method |
|---|-------|--------|
| 1-4 | Grid, Panel, LCDs, IGC | Local block scan |
| 5 | Request Pad Status | IGC + CustomData |
| 6 | Await Pad Response | Real handshake |
| 7-10 | Validate Pad Merge/Power/Fuel | Parse response |
| 11 | Request Inv Status | IGC + CustomData |
| 12 | Await Inv Response | Real handshake |
| 13-16 | Validate Inv Cargo/Ref/Asm/Gas | Parse response |
| 17-18 | Cross-Validate, Module Sync | All systems check |
| 19-20 | Write Config, System Ready | Finalize boot |

---

## MODULE SYNC (Connector-Based)

Boot check #17 detects physically connected modules via connectors:

### How It Works

1. Boot scans for connectors tagged `[PAD#-CON1]` and `[PAD#-CON2]`
2. Checks if each connector is actually connected (`Status == Connected`)
3. Counts connected modules and displays status

### Module Sync Status

| Connectors | Display |
|------------|---------|
| None connected | "Standalone mode" |
| CON1 connected | "Syncing 1 module(s)" |
| Both connected | "Syncing 2 module(s)" |

### Block Naming

```
[PAD1-CON1] Connector    <- First module port
[PAD1-CON2] Connector    <- Second module port
```

This allows you to dock additional module grids (storage, refinery, etc.) and have them detected during boot.

---

## HANDSHAKE PROTOCOL

### CustomData Structure

Unity Boot communicates via the button panel's CustomData:

```ini
[SYSTEM]
boot_complete=false
pad_check=none
pad_status=waiting
inv_check=none
inv_status=waiting

[QUOTAS]
ammo_target=50000
h2_target=20
o2_target=20

[BLACKBOX]
pad_errors=
inv_errors=
last_launch=
```

### How Operational Scripts Check

UnityPad and UnityInventory wait for boot_complete:

```csharp
bool IsBootComplete(){
    if(btn==null)return false;
    return btn.CustomData.Contains("boot_complete=true");
}
```

### How They Respond to Boot Requests

```csharp
void CheckBootRequest(){
    while(bootReqL.HasPendingMessage){
        var msg=bootReqL.AcceptMessage();
        if(msg.Data.ToString()=="PAD_CHECK")SendBootResponse();
    }
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

Timeout handling:
- If Pad/Inventory doesn't respond within 30 ticks, shows timeout error
- Retries request after error pause

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

## CHARACTER BUDGET

| Metric | Value |
|--------|-------|
| Deployed | 10,666 chars |
| Budget | 100,000 chars |
| Status | OK (89% margin) |

---

*Unity AI Lab - Boot Systems Division*
