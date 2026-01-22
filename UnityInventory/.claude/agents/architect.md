# Architect Agent - UnityInventory

---

## PURPOSE

Analyzes UnityInventory.cs architecture and system integration. Provides structural understanding for modifications.

---

## UNITYINVENTORY ARCHITECTURE

### Core Systems

| System | Purpose | Key Methods |
|--------|---------|-------------|
| Assembler Management | Queue components | FeedAssemblers, QueueComponents |
| Ammo Loading | Load missiles | LoadMissileAmmo, GetAmmoType |
| Hydrogen Management | Track H2 levels | ReadH2Tanks |
| LCD Rendering | Status displays | DrawGraphs, UpdateLCDs |
| Miner Tracking | Fleet status | ProcessMinerBeacon |

### State Flow

```
INIT → SCAN → IDLE ↔ WORK
              ↑
         IGC Messages
```

### Block Detection

Inventory uses block tags to find components:
- `[PAD#]` - Pad-specific blocks
- `[INV]` - Inventory-managed blocks
- Assemblers, cargo, connectors by type

### LCD System

| LCD Tag | Content |
|---------|---------|
| `[PAD#:4]` | Fuel/Storage |
| `[PAD#:5]` | Power Systems |
| `[PAD#:6]` | Graphs |
| `[PAD#:9]` | Miner Fleet |
| `[PAD#:10]` | Miner Detail |

---

## IGC INTEGRATION

| Channel | Direction | Purpose |
|---------|-----------|---------|
| UNITY_PAD_CMD | Listen | Pad commands |
| UNITY_INV_STATUS | Send | Inventory status |
| MINER_BEACON | Listen | Miner updates |

---

## INVENTORY TRANSFERS

```
Cargo → Assembler Queue → Output → Missile Loading
          ↓
    Component Tracking
          ↓
    LCD Graph Display
```

---

## BOOT HANDSHAKE

Inventory coordinates with UnityPad during boot:
1. Pad sets `pad_done=1` in button CustomData
2. Inventory waits for this before completing boot
3. Both scripts sync before going operational

---

## SPRITE RENDERING SYSTEM

| Function | Purpose |
|----------|---------|
| `BL(surface)` | Begin LCD frame |
| `SH(f,y,text,c)` | Draw header |
| `ST(f,x,y,t,c)` | Draw text |
| `SB(f,x,y,w,h,pct,fg,bg)` | Draw bar |
| `SLB(f,x,y,w,h,lbl,pct,fg,bg)` | Draw labeled bar |
| `SBx(f,x,y,w,h,bg,bdr)` | Draw box |
| `SD(f,y,w,c)` | Draw divider |
| `SDot(f,x,y,st)` | Draw status dot |
| `PctCol(pct)` | Get color from % |

---

## CRITICAL CONSTRAINTS

| Constraint | Limit | Impact |
|------------|-------|--------|
| SE char limit | 100,000 | Must stay under |
| Grid scans | Expensive | Throttle frequency |
| Inventory ops | Per-tick limit | Batch operations |

---

## MODIFICATION GUIDELINES

When editing UnityInventory.cs:
1. READ FULL file first (600-line chunks - don't grep, READ it)
2. Understand integration points
3. NO comments in code
4. Build after changes
5. Check deployed size

---

*Unity AI Lab - Architecture Division*
