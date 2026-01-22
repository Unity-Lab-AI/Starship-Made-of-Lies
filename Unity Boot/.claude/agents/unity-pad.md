# UnityPad - Launch Pad Controller

Reference documentation for UnityPad when working on other Unity Missile System scripts.

---

## OVERVIEW

**Script:** `UnityPad.cs`
**PB Name:** `[PAD1] Unity Pad`
**Deployed:** `%APPDATA%\SpaceEngineers\IngameScripts\local\UnityPad\script.cs`
**Characters:** 91,863 (8.1% margin)

Launch pad controller handling missile printing, fueling, arming, and launch.

---

## STATE MACHINE

```
INIT → IDLE → PRINT → BUILD → DOCK → FUEL → AMMO → READY → ARM → LAUNCH → GONE
```

| State | Description |
|-------|-------------|
| INIT | Scanning for blocks |
| IDLE | No missile, waiting |
| PRINT | Welding new missile |
| BUILD | Missile building |
| DOCK | Missile docked |
| FUEL | Transferring fuel |
| AMMO | Loading ammo |
| READY | Ready for launch |
| ARM | Armed, countdown |
| LAUNCH | Separation |
| GONE | Tracking |

---

## CUSTOMDATA (Me.CustomData)

UnityPad writes ONLY to its own PB's CustomData:

```ini
[SYSTEM]
pad_ready=true

[PAD_CFG]
climbDist=200
detonateDist=50

[PAD_STATUS]
state=READY
mslFound=true
mode=NORMAL

[PAD_DATA]
lastLaunch=...

[BLACKBOX]
```

---

## IGC CHANNELS

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_BOOT_REQ` | IN | Boot handshake request |
| `UNITY_BOOT_RSP` | OUT | Boot handshake response |
| `UNITY_MSL` | IN | Missile telemetry |
| `UNITY_MSL_CMD` | OUT | Missile commands (DETONATE, ABORT) |
| `UNITY_PAD_CMD` | IN/OUT | Multi-pad coordination |
| `MINER_BEACON` | IN | Fleet status |

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `IsBootComplete()` | Checks bootPB.CustomData for boot_complete=true |
| `FindSiblingPBs()` | Locates bootPB and invPB by name pattern |
| `ParseCustomGPS()` | Reads GPS from button panel |
| `SendBootResponse()` | Responds to boot handshake |
| `StartPrint()` | Initiates missile printing |
| `LaunchMissile()` | Separation sequence |

---

## LCD OWNERSHIP

**After boot_complete:** LCDs 1, 2, 3, 7, 8

---

## READS FROM OTHER PBs

| Source | Data |
|--------|------|
| `bootPB.CustomData` | boot_complete flag |
| `invPB.CustomData` | Inventory stats for LCD 2 |
| `btn.CustomData` | GPS coordinates (button panel) |

---

## CHARACTER COUNT

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs").Length
```

---

*Unity AI Lab - Missile Systems Division*
