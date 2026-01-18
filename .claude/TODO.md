# UNITY MISSILE SYSTEM - TODO

**Last Updated:** 2026-01-18
**Session:** Active - Unified Production System Refactor

---

## ACTIVE TASKS

### MAJOR REFACTOR: Unified Production System
**Status:** PLANNED
**File:** UnityInventory.cs (primary), possibly UnityPad.cs (dead code cleanup)
**Plan:** See .claude/plan.md for full details

**Goal:** Make tools, weapons, personal ammo, and bottles use the SAME production pattern as components.

---

### Phase 1: Add New Data Structures
**Status:** PENDING

Add unified dictionaries (keep existing ones where possible):
- [ ] `tNd` - Tool needs (NEW)
- [ ] `tMis` - Tool missing (NEW)
- [ ] `tQd` - Tool queued (rename from tQ)
- [ ] `tBPx` - Tool blueprints as MyDefinitionId (NEW)
- [ ] `paNd` - Personal ammo needs (NEW)
- [ ] `paMis` - Personal ammo missing (NEW)
- [ ] `paQd` - Personal ammo queued (rename from pAmmoQ)
- [ ] `paStk` - Personal ammo stock (rename from pAmmoStk)
- [ ] `paBP` - Personal ammo blueprints (NEW)
- [ ] `bNd` - Bottle needs (NEW)
- [ ] `bMis` - Bottle missing (NEW)
- [ ] `bQd` - Bottle queued (NEW)
- [ ] `bStk` - Bottle stock (NEW)
- [ ] `bBP` - Bottle blueprints (NEW)

**CAUTION:** Check if existing variables (pH2B, pO2B, h2Queued, o2Queued, h2Target, o2Target) are used in LCD displays before removing!

---

### Phase 2: Add Quota Functions
**Status:** PENDING

- [ ] Add `Tn(string n, int c)` for tool quotas
- [ ] Add `PAn(string n, int c)` for personal ammo quotas
- [ ] Add `Bn(string n, int c)` for bottle quotas

---

### Phase 3: Initialize Blueprints
**Status:** PENDING

In Program() or init section:
- [ ] Populate tBPx with all tool/weapon blueprints
- [ ] Populate paBP with all personal ammo blueprints
- [ ] Populate bBP with bottle blueprints

---

### Phase 4: Update ParseConfig
**Status:** PENDING

- [ ] Read tool quotas from CustomData (drill_target, welder_target, etc.)
- [ ] Read personal ammo quotas (rifle_ammo_target, pistol_ammo_target, etc.)
- [ ] Read bottle quotas (h2_bottle_target, o2_bottle_target)
- [ ] Call Tn(), PAn(), Bn() for each item type

---

### Phase 5: Refactor CountStocks
**Status:** PENDING

- [ ] Single pass counting for all item types
- [ ] Populate tStk, paStk, bStk alongside cStk
- [ ] Use TypeId checks (PhysicalGunObject, AmmoMagazine, GasContainerObject)

---

### Phase 6: Refactor Queue Counting
**Status:** PENDING

- [ ] Single pass through assembler queues
- [ ] Populate tQd, paQd, bQd alongside cQd
- [ ] Match by blueprint ID, not string Contains()

---

### Phase 7: Add CalcMissing Function
**Status:** PENDING

- [ ] Create CalcMissing() function
- [ ] Calculate tMis, paMis, bMis alongside cMis

---

### Phase 8: Add QueueMissing Function
**Status:** PENDING

- [ ] Create generic QueueMissing(mis, qd, bp) function
- [ ] Works for components, tools, ammo, bottles

---

### Phase 9: Refactor QueueProduction
**Status:** PENDING

- [ ] Remove CraftTools() call
- [ ] Add QueueAllProduction() that calls QueueMissing() for each type
- [ ] Keep existing component logic but use generic function

---

### Phase 10: Create Backward-Compatible Aliases
**Status:** PENDING

**CRITICAL:** Don't delete variables - create getter properties that read from new dictionaries!

**Bottle Aliases (for LCD displays and CustomData):**
- [ ] `int pH2B => bStk.ContainsKey("HydrogenBottle")?bStk["HydrogenBottle"]:0;`
- [ ] `int pO2B => bStk.ContainsKey("OxygenBottle")?bStk["OxygenBottle"]:0;`
- [ ] `int h2Queued => bQd.ContainsKey("HydrogenBottle")?bQd["HydrogenBottle"]:0;`
- [ ] `int o2Queued => bQd.ContainsKey("OxygenBottle")?bQd["OxygenBottle"]:0;`
- [ ] `int h2Target => bNd.ContainsKey("HydrogenBottle")?bNd["HydrogenBottle"]:20;`
- [ ] `int o2Target => bNd.ContainsKey("OxygenBottle")?bNd["OxygenBottle"]:20;`

**Keep These Arrays for Display Formatting:**
- [ ] Keep `tlsNames[]` - used in [TLS] CustomData section
- [ ] Keep `pAN[]` (or create) - used in [PAMMO] CustomData section
- [ ] Keep `tIT[][]` structure for [TLS] output format (Drills=0/1/2/3|...)
- [ ] Keep `pAmmoIT[]` for [PAMMO] output format

---

### Phase 11: Update WriteBtnData() for Cross-PB Communication
**Status:** PENDING

**CustomData sections that must keep SAME output format:**

**[BTL] Section:**
- [ ] Use new dictionaries but output `H2={stock}+{queued}/{target}|O2=...` format
- [ ] Can use aliases: `$"H2={pH2B}+{h2Queued}/{h2Target}|O2={pO2B}+{o2Queued}/{o2Target}"`

**[TLS] Section:**
- [ ] Keep outputting `Drills=0/1/2/3|Welders=0/1/2/3|...` format
- [ ] May need to keep tIT[][] structure just for this output
- [ ] Or refactor to use new tStk with tool category groupings

**[PAMMO] Section:**
- [ ] Keep outputting `Rifle20={stk}+{qd}/{tgt}|...` format
- [ ] Use paStk, paQd, paNd but preserve display format

**[CONFIG] Section:**
- [ ] Keep reading/writing h2, o2, tool, pAmmo values
- [ ] These populate the new dictionaries via Bn(), Tn(), PAn()

---

### Phase 12: Cleanup Old Code (AFTER aliases work)
**Status:** PENDING

**Only remove after verifying aliases work:**
- [ ] Remove old `int pH2B=0;` declaration (now a getter)
- [ ] Remove old `int pO2B=0;` declaration (now a getter)
- [ ] Remove old `int h2Queued=0;` declaration (now a getter)
- [ ] Remove old `int o2Queued=0;` declaration (now a getter)
- [ ] Remove old `int h2Target=20;` declaration (now a getter)
- [ ] Remove old `int o2Target=20;` declaration (now a getter)
- [ ] Remove `h2BottleBP`, `o2BottleBP` (replaced by bBP dictionary)
- [ ] Delete CraftTools() function (replaced by QueueMissing)

---

### Phase 11: Update LCD Displays
**Status:** PENDING

- [ ] Update LCD4 BUILD STATUS to show tMis, paMis, bMis
- [ ] Update LCD4 MISSILE STATUS
- [ ] Update LCD5Missile "COMPONENTS NEEDED" section
- [ ] Update any other displays that show tool/ammo/bottle status

---

### Phase 12: Cross-Script Cleanup
**Status:** PENDING

Check UnityPad.cs for any dead code related to:
- [ ] Tool/weapon production logic
- [ ] Personal ammo production logic
- [ ] Bottle production logic
- [ ] Any duplicated counting/queueing code

---

## BUILD CHECKLIST

After each phase:
```powershell
cd "C:\Users\gfour\Desktop\Space Engineers\Unity Missile System"
powershell -ExecutionPolicy Bypass -File wrap-scripts.ps1
dotnet build UnityInventory -c Debug
```

Test in-game:
- Set quotas in CustomData
- Clear items from cargo
- Verify items get queued
- Verify LCD displays update correctly

---

## COMPLETED TASKS (This Session)

- [x] Fixed tIT array SubtypeId mismatch (removed "Item" suffix)
- [x] Fixed bottle queue matching (Contains() instead of exact match)
- [x] Fixed pAmmo/tools counting (Contains() matching)
- [x] Fixed LCD4 views 1/7 and 2/7 scaling
- [x] Removed Canvas and ZoneChip from quota list
- [x] Fixed Unity Boot WriteBootComplete() to handle "BOOTING" state
- [x] Fixed Unity Boot display showing 21/20

---

*Unity AI Lab - Missile Systems Division*
