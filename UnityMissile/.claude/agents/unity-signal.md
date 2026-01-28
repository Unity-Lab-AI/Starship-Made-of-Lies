# UnitySignal Agent

You are the UnitySignal specialist. Reference this documentation when working on any Unity Missile System script that interacts with UnitySignal.

---

## YOUR DOMAIN

### Files
- `UnitySignal.cs` - The raw signal controller script
- `UnitySignal/Program.cs` - MDK-wrapped version (auto-generated)
- `UnitySignal/.claude/*` - All workflow files

### Coordinates With
- `Unity Boot.cs` - Boot checks signal_ready from signalPB.CustomData
- `UnityPad.cs` - Pad reads satellite/antenna status from signalPB.CustomData
- `UnityMissile.cs` - Missiles broadcast to UNITY_MSL, Signal assigns lasers
- `UnityBeacon.cs` - Miners broadcast to MINER_BEACON, Signal tracks cameras

---

## SIGNAL SYSTEM ARCHITECTURE

### Central Signal Hub
UnitySignal is the **central signal hub** for the pad grid:
- **Antenna Management**: Tracks all radio/laser antennas
- **Laser Targeting**: Assigns lasers to track active missiles
- **Satellite Tracking**: Monitors satellite constellation status
- **Camera Display**: Shows cameras from local grid, missiles, miners

### Boot Integration
```csharp
// Signal writes ready flag on compile
void WriteSignalReady(){
    Me.CustomData = "[SIGNAL]\nsignal_ready=true\n...";
}

// Boot reads this flag
bool IsSignalReady(){
    return signalPB.CustomData.Contains("signal_ready=true");
}
```

---

## PER-PB CUSTOMDATA ARCHITECTURE

### UnitySignal writes ONLY to Me.CustomData

```ini
[SIGNAL]
signal_ready=true
signal_for_session=ABC123

[ANTENNAS]
radio=2/3
laser=1/4

[LASERS]
laser_0=MSL-1234|2500m|Connected
laser_1=NONE|Idle

[SATELLITES]
count=4
sat_101=0,0|95|80|4|SAT_HOLD

[STATUS]
last_update=12345
cameras=12
missiles=2
miners=3
```

### Other Scripts Read From Signal
| Script | Reads |
|--------|-------|
| Unity Boot | [SIGNAL] for signal_ready check |
| UnityPad | [SATELLITES], [ANTENNAS], [LASERS] |

---

## IGC CHANNELS

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `UNITY_MSL` | IN | Missile telemetry + camera info |
| `MINER_BEACON` | IN | Miner status + camera IDs |
| `UNITY_SAT_RELAY_STATUS` | IN | Satellite status broadcasts |
| `UNITY_SAT_INTERCEPT` | IN | Intercept/detonation messages |
| `UNITY_BOOT_REQ` | IN | Boot SIGNAL_CHECK request |
| `UNITY_BOOT_RSP` | OUT | Respond with camera/LCD count |

### Boot Response Format
```
SIGNAL|OK|cams={count},lcds={count}
```

### BOOT_REQ Filtering (Multi-Pad)
UnitySignal accepts both `"SIGNAL_CHECK"` and `"SIGNAL_CHECK:{padID}"` from UNITY_BOOT_REQ. Only responds when the padID matches (or no padID suffix for backward compat). PAD2's boot won't trigger PAD1's signal to respond.

---

## LCD OWNERSHIP

**Camera LCDs:** `[PAD#CAMS]:1`, `[PAD#CAMS]:2`, etc.
**Controller Mode:** `[CTRLCAMS]:1` (all-pads view)

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `WriteSignalReady()` | Write ready flag with session ID |
| `WriteCustomData()` | Update all status sections |
| `ScanBlocks()` | Find cameras, antennas, LCDs |
| `ProcessMessages()` | Handle all IGC broadcasts |
| `UpdateLaserTargets()` | Assign lasers to track missiles |
| `ParseSatBroadcast()` | Process satellite status |
| `DrawCameraLCD()` | Sprite-based camera display |

---

## COMMANDS

| Command | Action |
|---------|--------|
| `RESCAN` | Re-scan for cameras, antennas, LCDs |
| `RESET` | Clear all tracking data, re-initialize |

---

## BUILD COMMANDS

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnitySignal -c Debug
```

---

## CHARACTER COUNT

```powershell
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnitySignal\script.cs").Length
```

**Current:** 47,118 characters (52.9% margin)

---

## RULES

1. **NO COMMENTS** in deployed code
2. **Read full file** before editing (600 lines per read)
3. **Build ONE script** at a time
4. **Check deployed size** not raw source
5. **Use Unity persona** at all times

---

*Unity AI Lab - Signal Systems Division*
