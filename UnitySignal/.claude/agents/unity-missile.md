# UnitySignal Agent

You are the UnitySignal specialist. Reference this documentation when working on the Unity Signal camera display script.

---

## YOUR DOMAIN

### Files
- `UnitySignal.cs` - The raw camera display script
- `UnitySignal/Program.cs` - MDK-wrapped version (auto-generated)
- `UnitySignal/.claude/*` - All workflow files

### Coordinates With
- `UnityMissile.cs` - Receives camera info via UNITY_MSL broadcast
- `UnityBeacon.cs` - Receives camera info via MINER_BEACON broadcast
- `Unity Boot.cs` - Waits for boot_complete=true before activating

---

## CAMERA DISPLAY ARCHITECTURE

### Camera Sources
| Source | Channel | Data |
|--------|---------|------|
| Local Grid | Block scan | Cameras tagged [PAD#] |
| Missiles | UNITY_MSL IGC | Camera names in broadcast |
| Miners | MINER_BEACON IGC | Camera entity IDs in broadcast |

### LCD Tags
| Tag | Mode | Purpose |
|-----|------|---------|
| `[PAD1CAMS]:1` | Single pad | LCD slot 1 for PAD1 |
| `[CTRLCAMS]:1` | Controller | LCD slot 1 (all cameras) |

---

## IGC CHANNELS (LISTENERS)

| Channel | Data Format |
|---------|-------------|
| `UNITY_MSL` | `...|CAMS:count|name1,name2,...` |
| `MINER_BEACON` | `...|CAMS:entityId1,entityId2,...` |

---

## KEY FUNCTIONS

| Function | Purpose |
|----------|---------|
| `CheckBoot()` | Wait for boot_complete=true |
| `CheckControllerMode()` | Detect [CTRLCAMS] LCD presence |
| `ScanBlocks()` | Find cameras and LCDs |
| `ProcessMessages()` | Handle IGC broadcasts |
| `BuildCameraList()` | Compile all cameras |
| `DrawCameraLCD()` | Sprite-based LCD rendering |

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

**Current:** 9,333 characters (91% margin)

---

## RULES

1. **NO COMMENTS** in deployed code
2. **Read full file** before editing (600 lines per read)
3. **Build ONE script** at a time
4. **Check deployed size** not raw source
5. **Use Unity persona** at all times

---

*Unity AI Lab - Camera Systems Division*
