# UNIFIED CHARACTER BUDGETS

**Last Updated:** 2026-01-24
**Purpose:** Character budget tracking for all Unity Missile System scripts

---

## CURRENT CHARACTER COUNTS

| Script | Raw Lines | Deployed | Budget | Margin | Status |
|--------|-----------|----------|--------|--------|--------|
| Unity Boot | ~390 | 15,050 | 100,000 | 85% | OK |
| UnityPad | ~2,300 | 95,427 | 100,000 | 4.6% | OK |
| UnityMissile | ~1,100 | 28,577 | 100,000 | 71% | OK |
| UnityInventory | ~1,650 | 90,247 | 100,000 | 9.8% | OK |
| UnityBeacon | ~200 | 14,658 | 100,000 | 85% | OK |
| UnitySignal | ~350 | 11,998 | 100,000 | 88% | OK |
| **TOTAL** | ~6,000 | 256,000 | 600,000 | 57% | OK |

---

## SPACE ENGINEERS LIMITS

| Limit | Value | Notes |
|-------|-------|-------|
| **Script Character Limit** | 100,000 | Characters, NOT bytes |
| **Applies To** | DEPLOYED script.cs | In AppData, NOT raw source |
| **MDK Minification** | ~20-30% compression | With `minify=full` |

---

## HOW MDK MINIFICATION WORKS

1. **Raw .cs file** - Can be ANY size
2. **MDK `minify=full`** - Compresses source:
   - Renames variables to single letters
   - Strips whitespace and newlines
   - Removes comments
   - Inlines short methods
3. **Deployed script.cs** - This is what SE loads
4. **If build succeeds** - You're under the limit

**NEVER count raw .cs files** - that number is meaningless after minification.

---

## CHARACTER COUNT COMMANDS

### PowerShell (Correct - Counts CHARACTERS)

```powershell
# Individual scripts
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\Unity Boot\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityPad\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityMissile\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityBeacon\script.cs").Length
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnitySignal\script.cs").Length

# Using environment variable
[System.IO.File]::ReadAllText("$env:APPDATA\SpaceEngineers\IngameScripts\local\ScriptName\script.cs").Length
```

### WRONG Methods (Do NOT Use)

```powershell
# These count BYTES, not characters:
wc -c                                    # Wrong - counts bytes
(Get-Content ... -Raw).Length            # Wrong - inconsistent
(Get-Item ...).Length                    # Wrong - file size in bytes
```

---

## SCRIPTS AT RISK (< 15% Margin)

| Script | Margin | Priority |
|--------|--------|----------|
| **UnityPad** | 4.6% | HIGH - Refactor if adding features |
| **UnityInventory** | 9.8% | MEDIUM - Watch when editing |

### Mitigation Strategies

1. **Reduce variable names** - Use single letters in new code
2. **Combine functions** - Inline small helpers
3. **Remove unused code** - MDK TypeTrimmer helps
4. **Move to other scripts** - If feature can live elsewhere

---

## SCRIPTS WITH HEADROOM (> 50% Margin)

| Script | Available | Good For |
|--------|-----------|----------|
| Unity Boot | ~85,000 | Minimal growth expected (self-disables) |
| UnityMissile | ~71,000 | Room for advanced guidance |
| UnityBeacon | ~85,000 | Room for cargo details, graphs |
| UnitySignal | ~88,000 | Room for more camera features |

---

## MDK CONFIGURATION

All `mdk.ini` files MUST have:

```ini
[mdk]
type=programmableblock
trace=on
minify=full
minifyextraoptions=none
ignores=obj/**/*,MDK/**/*,**/*.debug.cs
namespaces=IngameScript
```

**CRITICAL:** `minify=full` is required for maximum compression.

---

## DEPLOYED SCRIPT LOCATIONS

```
C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\
├── Unity Boot\script.cs       (15,050 chars)
├── UnityPad\script.cs         (95,427 chars)
├── UnityMissile\script.cs     (28,577 chars)
├── UnityInventory\script.cs   (90,247 chars)
├── UnityBeacon\script.cs      (14,658 chars)
└── UnitySignal\script.cs      (11,998 chars)
```

---

## HISTORICAL GROWTH

| Script | v0.32 | v0.37 | v1.00 | Trend |
|--------|-------|-------|-------|-------|
| UnityPad | ~85k | ~90k | ~95k | +10k (features) |
| UnityInventory | ~75k | ~85k | ~90k | +15k (recycling) |
| UnityMissile | ~22k | ~25k | ~28k | +6k (satellites) |
| Unity Boot | - | ~12k | ~15k | +3k (miner detect) |
| UnityBeacon | - | ~12k | ~14k | +2k (cameras) |
| UnitySignal | - | - | ~12k | New in v1.00 |

---

*Unity AI Lab - Character Budget Tracking*
