**SUPERSEDED** by multi-pad isolation documentation update (2026-01-28)

# Documentation Update Plan - 2026-01-26

## Code Changes to Document

### Today's Fixes in UnityInventory.cs

| Fix | Location | Description |
|-----|----------|-------------|
| **Bottle Counting** | Lines 318-320 | Uses `GetItemAmount(h2BottleType/o2BottleType)` instead of unreliable string matching |
| **mslAmmoTarget Minimum** | Line 142 | `if(mslAmmoTarget<1000)mslAmmoTarget=50000;` prevents corrupted Storage |
| **ammoTypeIdx Sync** | Line 675 | ReadPadSettings reads `type` key from padPB.CustomData, calls UpdateAmmoType() |
| **CanTransferItemTo Removed** | Lines 446, 458, etc. | Removed conveyor check bottleneck - subgrid transfers now work |
| **Production Target Logic** | Line 350 | `prodTgt = ammoTypeIdx==0 ? mslAmmoTarget : ammoTarget` |

### Updated Character Budget

| Script | Old Deployed | New Deployed | Margin |
|--------|--------------|--------------|--------|
| UnityInventory | ~90,200 | 95,641 | **4.4%** |

---

## Documentation Files to Update

### PHASE 1: Core Documentation (CRITICAL)

| File | Changes Needed |
|------|----------------|
| `.claude/TODO.md` | Add completed tasks, update character budgets |
| `.claude/CLAUDE.md` | Update UnityInventory section with new counting logic |
| `.claude/ARCHITECTURE.md` | Update inventory system architecture |
| `.claude/FINALIZED.md` | Add today's completed tasks |

### PHASE 2: UnityInventory-Specific Docs

| File | Changes Needed |
|------|----------------|
| `UnityInventory/.claude/CLAUDE.md` | Full update - bottle counting, ammo sync, production |
| `UnityInventory/.claude/FINALIZED.md` | Add today's completed tasks |
| `UnityInventory/README.md` | Update feature list |

### PHASE 3: Agent Files (6 locations)

| Location | File | Changes |
|----------|------|---------|
| `.claude/agents/` | `unity-inventory.md` | Update counting logic, production system |
| `Unity Boot/.claude/agents/` | `unity-inventory.md` | Same |
| `UnityPad/.claude/agents/` | `unity-inventory.md` | Same |
| `UnityMissile/.claude/agents/` | `unity-inventory.md` | Same |
| `UnityInventory/.claude/agents/` | `unity-inventory.md` | Same |
| `UnityBeacon/.claude/agents/` | `unity-inventory.md` | Same |

### PHASE 4: Templates

| File | Changes |
|------|---------|
| `.claude/templates/CHARACTER_BUDGETS.md` | Update UnityInventory to 95,641 (4.4%) |

### PHASE 5: Root Documentation

| File | Check For | Update If Needed |
|------|-----------|------------------|
| `README.md` | Inventory features | Update if references bottle/ammo system |
| `SETUP.md` | Inventory setup | Update if references configuration |
| `QUICK_SETUP.md` | Quick start | Update if mentions inventory |
| `SKILL_TREE.md` | Feature tree | Add bottle counting fix |
| `ROADMAP.md` | Development status | Mark items complete |

---

## Update Content Templates

### Bottle Counting (New)

```markdown
### Bottle Counting System

UnityInventory uses `GetItemAmount()` with pre-defined `MyItemType` objects for reliable bottle counting:

```csharp
MyItemType h2BottleType = MyItemType.Parse(OB+"GasContainerObject/HydrogenBottle");
MyItemType o2BottleType = MyItemType.Parse(OB+"OxygenContainerObject/OxygenBottle");

// CountStocks() - after countInv calls:
pH2B=0;pO2B=0;
foreach(var c in padCargo){
    var inv=c.GetInventory();
    if(inv!=null){
        pH2B+=(int)inv.GetItemAmount(h2BottleType);
        pO2B+=(int)inv.GetItemAmount(o2BottleType);
    }
}
```

This replaces unreliable string matching on `TypeId.ToLower()` with the same reliable method used for ammo counting.
```

### mslAmmoTarget Minimum Enforcement

```markdown
### Missile Ammo Target Minimum

To prevent corrupted Storage data from breaking production:

```csharp
// In Program() after LoadStorage():
if(mslAmmoTarget < 1000) mslAmmoTarget = 50000;
```

If Storage contains old/invalid mslAmmoTarget, it resets to 50000 (default for 5 missiles worth).
```

### ammoTypeIdx Sync

```markdown
### Ammo Type Synchronization

UnityInventory syncs the selected ammo type from UnityPad:

```csharp
// In ReadPadSettings(), parsing padPB.CustomData:
else if(k=="type" && n>=0 && n<10){
    if(n != ammoTypeIdx){
        ammoTypeIdx = n;
        UpdateAmmoType();  // Updates ammoBP and ammoType
    }
}
```

This ensures LCD 2 shows the correct ammo type that UnityPad has selected.
```

### Production Target Logic

```markdown
### Production Target Selection

```csharp
int prodTgt = ammoTypeIdx==0 ? mslAmmoTarget : ammoTarget;
```

| ammoTypeIdx | Ammo Type | Target Variable | Default |
|-------------|-----------|-----------------|---------|
| 0 | S-10 Pistol | `mslAmmoTarget` | 50,000 |
| 1-9 | Other ammo | `ammoTarget` | 500 |

S-10 pistol ammo is used for missile warhead loading (10,106 rounds per missile), hence the higher target.
```

---

## Execution Order

1. Update `.claude/TODO.md` with new tasks and completed items
2. Update `.claude/FINALIZED.md` with today's work
3. Update `.claude/CLAUDE.md` (main project)
4. Update `.claude/ARCHITECTURE.md`
5. Update `UnityInventory/.claude/CLAUDE.md` (full rewrite of relevant sections)
6. Update all 6 `unity-inventory.md` agent files
7. Update `.claude/templates/CHARACTER_BUDGETS.md`
8. Review and update root docs (README, SETUP, etc.)

---

*Unity AI Lab - Documentation Division*
