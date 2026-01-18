# UNIFIED PRODUCTION SYSTEM PLAN

**Generated:** 2026-01-18 13:45
**Task:** Refactor tools, weapons, personal ammo, and bottles to use same production pattern as components
**Scope:** UnityInventory.cs - Major refactor of production system

---

## EXECUTIVE SUMMARY

Components use a clean, unified system:
- `cNd` - needs (quotas)
- `cStk` - stock counts
- `cQd` - queue counts
- `cMis` - missing (need - stock)
- `compBP` - blueprints
- Single production loop that queues missing items

Tools, weapons, personal ammo, and bottles use fragmented, inconsistent systems that don't work reliably. This plan unifies ALL production to match the component pattern.

---

## CURRENT SYSTEM (BROKEN)

### Components (WORKS - Use as Template)
```
cNd[name] = quota          // Set by Cn() calls
cStk[name] = stock         // Counted from cargo
cQd[name] = queued         // Counted from assembler queues
cMis[name] = need - stock  // Calculated each tick
compBP[name] = blueprint   // MyDefinitionId lookup

Production (line 323):
foreach(kv in cMis) {
  stillNeed = kv.Value - cQd[kv.Key]
  if(stillNeed > 0) queue it
}
```

### Tools/Weapons (BROKEN)
```
tIT[][] = item SubtypeIds  // 2D array by category
tBP[][] = blueprint names  // 2D array by category
tStk[name] = stock         // Fragmented counting
tQ[name] = queued          // Fragmented counting
toolTarget = single int    // ONE target for ALL tools!

Production (lines 432-433):
Loops through categories, checks if ANY tool in category < target
Only queues first tool in category that's below target
```

**Problems:**
- Single `toolTarget` for all tools (can't set drill=5, welder=10)
- 2D arrays are hard to maintain
- Counting logic is scattered and uses Contains() hacks
- Queue logic only queues one tool per category

### Personal Ammo (BROKEN)
```
pAmmoIT[] = item SubtypeIds
pAmmoBP[] = blueprint names
pAmmoStk[name] = stock
pAmmoQ[name] = queued
pAmmoTarget = single int   // ONE target for ALL ammo!

Production (line 434):
Loops through each ammo type, queues if below target
```

**Problems:**
- Single `pAmmoTarget` for all ammo types
- Can't set rifle_mag=100, pistol_mag=50

### Bottles (BROKEN)
```
pH2B, pO2B = stock (separate vars)
h2Queued, o2Queued = queued (separate vars)
h2Target, o2Target = needs (separate vars)
h2BottleBP, o2BottleBP = blueprints (separate vars)

Production (lines 319-320):
Simple if statements for each bottle type
```

**Problems:**
- Hardcoded for only H2 and O2
- Can't easily add new bottle types
- Inconsistent with component system

---

## NEW UNIFIED SYSTEM

### Phase 1: Create Unified Data Structures

**New Dictionaries:**
```csharp
// Tools & Weapons (replaces tIT[][], tBP[][], tStk, tQ)
Dictionary<string,int> tNd = new Dictionary<string,int>();   // Tool needs
Dictionary<string,int> tStk = new Dictionary<string,int>();  // Tool stock (keep)
Dictionary<string,int> tQd = new Dictionary<string,int>();   // Tool queued (rename from tQ)
Dictionary<string,int> tMis = new Dictionary<string,int>();  // Tool missing
Dictionary<string,MyDefinitionId> tBPx = new Dictionary<string,MyDefinitionId>(); // Tool blueprints

// Personal Ammo (replaces pAmmoIT[], pAmmoBP[], pAmmoStk, pAmmoQ)
Dictionary<string,int> paNd = new Dictionary<string,int>();  // PAmmo needs
Dictionary<string,int> paStk = new Dictionary<string,int>(); // PAmmo stock (rename from pAmmoStk)
Dictionary<string,int> paQd = new Dictionary<string,int>();  // PAmmo queued (rename from pAmmoQ)
Dictionary<string,int> paMis = new Dictionary<string,int>(); // PAmmo missing
Dictionary<string,MyDefinitionId> paBP = new Dictionary<string,MyDefinitionId>(); // PAmmo blueprints

// Bottles (replaces pH2B, pO2B, h2Queued, etc)
Dictionary<string,int> bNd = new Dictionary<string,int>();   // Bottle needs
Dictionary<string,int> bStk = new Dictionary<string,int>();  // Bottle stock
Dictionary<string,int> bQd = new Dictionary<string,int>();   // Bottle queued
Dictionary<string,int> bMis = new Dictionary<string,int>();  // Bottle missing
Dictionary<string,MyDefinitionId> bBP = new Dictionary<string,MyDefinitionId>(); // Bottle blueprints
```

### Phase 2: Create Quota Functions (like Cn())

```csharp
// Tool quota: Tn("HandDrill", 5) sets need for HandDrill to 5
void Tn(string n, int c) { tNd[n] = c; }

// Personal ammo quota: PAn("NATO_5p56x45mm", 100)
void PAn(string n, int c) { paNd[n] = c; }

// Bottle quota: Bn("HydrogenBottle", 20)
void Bn(string n, int c) { bNd[n] = c; }
```

### Phase 3: Initialize Blueprints (in Program())

```csharp
// Tools - map item SubtypeId to blueprint
tBPx["HandDrill"] = MyDefinitionId.Parse(BP+"HandDrill");
tBPx["HandDrill2"] = MyDefinitionId.Parse(BP+"HandDrill2");
tBPx["Welder"] = MyDefinitionId.Parse(BP+"Welder");
// ... etc for all tools/weapons

// Personal Ammo
paBP["NATO_5p56x45mm"] = MyDefinitionId.Parse(BP+"NATO_5p56x45mmMagazine");
paBP["NATO_25x184mm"] = MyDefinitionId.Parse(BP+"NATO_25x184mmMagazine");
// ... etc for all ammo types

// Bottles
bBP["HydrogenBottle"] = MyDefinitionId.Parse(BP+"HydrogenBottle");
bBP["OxygenBottle"] = MyDefinitionId.Parse(BP+"OxygenBottle");
```

### Phase 4: Set Quotas from CustomData

In ParseConfig(), read individual quotas:
```csharp
// Tools
Tn("HandDrill", GetInt("drill_target", 5));
Tn("HandDrill2", GetInt("drill2_target", 3));
Tn("Welder", GetInt("welder_target", 5));
Tn("Welder2", GetInt("welder2_target", 3));
// ... or use category targets like drill_target applies to all drills

// Personal Ammo
PAn("NATO_5p56x45mm", GetInt("rifle_ammo_target", 100));
PAn("NATO_25x184mm", GetInt("gatling_ammo_target", 500));

// Bottles
Bn("HydrogenBottle", GetInt("h2_bottle_target", 20));
Bn("OxygenBottle", GetInt("o2_bottle_target", 20));
```

### Phase 5: Unified Stock Counting

In CountStocks(), use single pass:
```csharp
// Count all items in one pass
foreach(var cargo in allCargo) {
  var inv = cargo.GetInventory();
  foreach(var item in GL(inv)) {
    string sub = item.Type.SubtypeId;
    string tid = item.Type.TypeId;
    int amt = (int)item.Amount;

    if(tid.Contains("Component")) AD(cStk, sub, amt);
    else if(tid.Contains("PhysicalGunObject")) AD(tStk, sub, amt);
    else if(tid.Contains("AmmoMagazine")) AD(paStk, sub, amt);
    else if(tid.Contains("GasContainerObject")) AD(bStk, sub, amt);
    else if(tid.Contains("OxygenContainerObject")) AD(bStk, sub, amt);
  }
}
```

### Phase 6: Unified Queue Counting

```csharp
// Count queued items from all assemblers
foreach(var a in padAsm) {
  var q = new List<MyProductionItem>();
  a.GetQueue(q);
  foreach(var i in q) {
    string bn = i.BlueprintId.SubtypeName;
    int amt = (int)i.Amount;

    // Components
    foreach(var bp in compBP) if(i.BlueprintId == bp.Value) AD(cQd, bp.Key, amt);
    // Tools
    foreach(var bp in tBPx) if(i.BlueprintId == bp.Value) AD(tQd, bp.Key, amt);
    // Personal Ammo
    foreach(var bp in paBP) if(i.BlueprintId == bp.Value) AD(paQd, bp.Key, amt);
    // Bottles
    foreach(var bp in bBP) if(i.BlueprintId == bp.Value) AD(bQd, bp.Key, amt);
  }
}
```

### Phase 7: Unified Missing Calculation

```csharp
// Calculate missing for all types
void CalcMissing() {
  // Components (existing)
  cMis.Clear();
  foreach(var kv in cNd) {
    int have = cStk.ContainsKey(kv.Key) ? cStk[kv.Key] : 0;
    if(have < kv.Value) cMis[kv.Key] = kv.Value - have;
  }

  // Tools
  tMis.Clear();
  foreach(var kv in tNd) {
    int have = tStk.ContainsKey(kv.Key) ? tStk[kv.Key] : 0;
    if(have < kv.Value) tMis[kv.Key] = kv.Value - have;
  }

  // Personal Ammo
  paMis.Clear();
  foreach(var kv in paNd) {
    int have = paStk.ContainsKey(kv.Key) ? paStk[kv.Key] : 0;
    if(have < kv.Value) paMis[kv.Key] = kv.Value - have;
  }

  // Bottles
  bMis.Clear();
  foreach(var kv in bNd) {
    int have = bStk.ContainsKey(kv.Key) ? bStk[kv.Key] : 0;
    if(have < kv.Value) bMis[kv.Key] = kv.Value - have;
  }
}
```

### Phase 8: Unified Production Queueing

```csharp
void QueueAllProduction() {
  // Queue missing components (existing logic)
  QueueMissing(cMis, cQd, compBP);

  // Queue missing tools
  QueueMissing(tMis, tQd, tBPx);

  // Queue missing personal ammo
  QueueMissing(paMis, paQd, paBP);

  // Queue missing bottles
  QueueMissing(bMis, bQd, bBP);
}

void QueueMissing(Dictionary<string,int> mis, Dictionary<string,int> qd, Dictionary<string,MyDefinitionId> bp) {
  if(mis.Count == 0) return;
  foreach(var kv in mis) {
    int queued = qd.ContainsKey(kv.Key) ? qd[kv.Key] : 0;
    int stillNeed = kv.Value - queued;
    if(stillNeed <= 0 || !bp.ContainsKey(kv.Key)) continue;
    var bpId = bp[kv.Key];
    int perAsm = Math.Max(1, stillNeed / padAsm.Count);
    foreach(var a in padAsm) {
      if(stillNeed <= 0) break;
      if(a.CanUseBlueprint(bpId)) {
        a.AddQueueItem(bpId, (MyFixedPoint)perAsm);
        stillNeed -= perAsm;
      }
    }
  }
}
```

---

## IMPLEMENTATION STEPS

### Step 1: Add New Dictionaries
- Add tNd, tMis, tQd (rename tQ), tBPx
- Add paNd, paMis, paQd (rename pAmmoQ), paStk (rename pAmmoStk), paBP
- Add bNd, bMis, bQd, bStk, bBP

### Step 2: Add Quota Functions
- Add Tn(), PAn(), Bn() functions

### Step 3: Initialize Blueprints
- Populate tBPx, paBP, bBP in Program() or init

### Step 4: Update ParseConfig
- Read individual item quotas or category quotas
- Call Tn(), PAn(), Bn() for each item type

### Step 5: Refactor CountStocks
- Single pass counting for all item types
- Populate tStk, paStk, bStk alongside cStk

### Step 6: Refactor Queue Counting
- Single pass through assembler queues
- Populate tQd, paQd, bQd alongside cQd

### Step 7: Add CalcMissing Function
- Calculate tMis, paMis, bMis alongside cMis

### Step 8: Add QueueMissing Function
- Generic function that works for all item types

### Step 9: Refactor QueueProduction
- Remove CraftTools() call
- Call QueueAllProduction() instead

### Step 10: Remove Old Code
- Delete CraftTools() function
- Delete tIT[][], tBP[][] arrays
- Delete pAmmoIT[], pAmmoBP[] arrays
- Delete pH2B, pO2B, h2Queued, o2Queued variables
- Delete h2BottleBP, o2BottleBP variables

### Step 11: Update LCD Displays
- Update displays to use new dictionaries
- tMis, paMis, bMis can be shown like cMis

---

## CROSS-PB COMMUNICATION (CRITICAL)

UnityInventory writes status to button panel CustomData for UnityPad to read. This format MUST be preserved.

### CustomData Sections That Use Old Variables

**[BTL] Section (line 596):**
```csharp
// CURRENT - uses pH2B, h2Queued, h2Target, pO2B, o2Queued, o2Target
c.AppendLine($"H2={pH2B}+{h2Queued}/{h2Target}|O2={pO2B}+{o2Queued}/{o2Target}");

// NEW - must produce SAME output using new dictionaries
int h2s=bStk.ContainsKey("HydrogenBottle")?bStk["HydrogenBottle"]:0;
int h2q=bQd.ContainsKey("HydrogenBottle")?bQd["HydrogenBottle"]:0;
int h2t=bNd.ContainsKey("HydrogenBottle")?bNd["HydrogenBottle"]:0;
int o2s=bStk.ContainsKey("OxygenBottle")?bStk["OxygenBottle"]:0;
int o2q=bQd.ContainsKey("OxygenBottle")?bQd["OxygenBottle"]:0;
int o2t=bNd.ContainsKey("OxygenBottle")?bNd["OxygenBottle"]:0;
c.AppendLine($"H2={h2s}+{h2q}/{h2t}|O2={o2s}+{o2q}/{o2t}");
```

**[TLS] Section (line 598):**
```csharp
// CURRENT - uses tIT[][], tStk, tlsNames[]
for(int i=0;i<tlsNames.Length;i++){
  var s="";
  for(int j=0;j<tIT[i].Length;j++)
    s+=$"{(tStk.ContainsKey(tIT[i][j])?tStk[tIT[i][j]]:0)}/";
  c.Append($"{tlsNames[i]}={s.TrimEnd('/')}|");
}

// NEW - keep tlsNames[] for display, use tStk (same), add tQd, tNd
// Must still output: Drills=0/1/2/3|Welders=0/1/2/3|...
```

**[PAMMO] Section (lines 600-602):**
```csharp
// CURRENT - uses pAmmoIT[], pAmmoStk, pAmmoQ, pAmmoBP[]
string[] pAN={"Rifle20","Rifle5",...};
for(int i=0;i<pAmmoBP.Length;i++){
  int stk=pAmmoStk.ContainsKey(pAmmoIT[i])?pAmmoStk[pAmmoIT[i]]:0;
  int qd=pAmmoQ.ContainsKey(pAmmoBP[i])?pAmmoQ[pAmmoBP[i]]:0;
  c.Append($"{pAN[i]}={stk}+{qd}/{pAmmoTarget}|");
}

// NEW - use paStk, paQd, paNd
// Must still output: Rifle20=50+10/100|...
```

**[CONFIG] Section (lines 558-572):**
```csharp
// These variables are READ from CustomData:
// h2Target, o2Target, toolTarget, pAmmoTarget
// They become bNd["HydrogenBottle"], bNd["OxygenBottle"], etc.
// But we still need to WRITE them back in same format!

// KEEP these variables as "display aliases" that read from dictionaries:
int h2Target => bNd.ContainsKey("HydrogenBottle")?bNd["HydrogenBottle"]:20;
int o2Target => bNd.ContainsKey("OxygenBottle")?bNd["OxygenBottle"]:20;
```

### Variable Replacement Strategy

**Option A: Keep Aliases (Recommended)**
Keep old variable names as properties/getters that read from new dictionaries:
```csharp
int pH2B => bStk.ContainsKey("HydrogenBottle")?bStk["HydrogenBottle"]:0;
int pO2B => bStk.ContainsKey("OxygenBottle")?bStk["OxygenBottle"]:0;
int h2Queued => bQd.ContainsKey("HydrogenBottle")?bQd["HydrogenBottle"]:0;
int o2Queued => bQd.ContainsKey("OxygenBottle")?bQd["OxygenBottle"]:0;
int h2Target => bNd.ContainsKey("HydrogenBottle")?bNd["HydrogenBottle"]:20;
int o2Target => bNd.ContainsKey("OxygenBottle")?bNd["OxygenBottle"]:20;
```
This way ALL existing code that uses these variables keeps working!

**Option B: Find/Replace All Usages**
Replace every usage of old variables with dictionary lookups.
More work, higher risk of breaking something.

**Recommendation: Option A** - Create getter properties for backward compatibility.

### Arrays Still Needed for Display

These arrays are used for CustomData output formatting and should be KEPT:
- `tlsNames[]` - Display names for tool categories ("Drills", "Welders", etc.)
- `pAN[]` (pAmmoNames) - Display names for ammo types ("Rifle20", "Rifle5", etc.)

But the 2D arrays `tIT[][]` and `tBP[][]` can be replaced with flat dictionaries.

---

## FILES TO MODIFY

| File | Change |
|------|--------|
| UnityInventory.cs | Major refactor of production system |
| UnityInventory.cs | Update WriteBtnData() to use new dictionaries |
| UnityInventory.cs | Add getter properties for backward compat |
| UnityPad.cs | Check for any dead production code |

---

## CHARACTER BUDGET

| Before | After (Est) | Change |
|--------|-------------|--------|
| ~78,000 | ~76,000 | -2,000 (removing redundant code) |

The unified system should actually be SMALLER because:
- Removes duplicate counting logic
- Removes CraftTools() function
- Uses generic QueueMissing() instead of separate logic
- Removes 2D arrays in favor of dictionaries

---

## VERIFICATION

1. Build and deploy
2. Set quotas in CustomData:
   ```
   drill_target=5
   welder_target=5
   rifle_ammo_target=100
   h2_bottle_target=20
   ```
3. Clear all tools/ammo/bottles from cargo
4. Wait for tick
5. Verify ALL items get queued in assemblers
6. Verify LCD shows missing items correctly

---

*Unity AI Lab - Production System Refactor Plan*
*Generated: 2026-01-18*
