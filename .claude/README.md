<![CDATA[# Unity Missile System

![Unity Missile System](../Unity%20Missile%20System%202.png)

**5-Script Modular Guided Missile System for Space Engineers**

---

## System Components

| Script | Purpose | Deployed Size |
|--------|---------|---------------|
| **Unity Boot** | Boot controller, 23 system checks, LCD init | ~15,000 chars |
| **UnityPad** | Launch pad controller, menus, targeting | ~98,000 chars |
| **UnityMissile** | In-flight guidance, targeting, detonation | ~26,000 chars |
| **UnityInventory** | Inventory management, production, sorting | ~97,000 chars |
| **UnityBeacon** | Fleet status broadcasting | ~15,000 chars |

## Features

- 11 LCD sprite-based display system
- Centralized boot with 23 system checks
- Multi-pad controller mode
- Salvo and carpet bombing
- ICBM ballistic flight profiles
- Satellite deployment mode
- MinerBeacon fleet tracking
- Auto-production and inventory sorting
- Printer integration for auto-building missiles

## Boot Sequence

```
Unity Boot → 23 checks → boot_complete=true → Self-disables
                              ↓
UnityPad takes LCDs 1,2,3,7,8
UnityInventory takes LCDs 4,5,6,9,10,11
```

## PB Naming Convention

| Script | PB Name |
|--------|---------|
| Unity Boot | `[PAD1] UNITY BOOT` |
| UnityPad | `[PAD1] Unity Pad` |
| UnityMissile | `[PAD1] Missile #1 Program` |
| UnityInventory | `[PAD1] Unity Inventory` |
| UnityBeacon | `[BEACON] Unity Beacon` |

## Build Commands

```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build "Unity Boot" -c Debug
dotnet build UnityPad -c Debug
dotnet build UnityMissile -c Debug
dotnet build UnityInventory -c Debug
dotnet build UnityBeacon -c Debug
```

---

*Unity AI Lab - Missile Systems Division*
*Version v01.00 | 2026-01-18*
]]>