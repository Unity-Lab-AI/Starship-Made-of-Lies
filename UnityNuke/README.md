# UNITY NUKE - Nuclear Crater Mining System

```
    ██╗   ██╗███╗   ██╗██╗████████╗██╗   ██╗    ███╗   ██╗██╗   ██╗██╗  ██╗███████╗
    ██║   ██║████╗  ██║██║╚══██╔══╝╚██╗ ██╔╝    ████╗  ██║██║   ██║██║ ██╔╝██╔════╝
    ██║   ██║██╔██╗ ██║██║   ██║    ╚████╔╝     ██╔██╗ ██║██║   ██║█████╔╝ █████╗
    ██║   ██║██║╚██╗██║██║   ██║     ╚██╔╝      ██║╚██╗██║██║   ██║██╔═██╗ ██╔══╝
    ╚██████╔╝██║ ╚████║██║   ██║      ██║       ██║ ╚████║╚██████╔╝██║  ██╗███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚═╝   ╚═╝      ╚═╝       ╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝

                    ☢ KISS YOUR ASS GOODBYE ☢

              Nuclear Crater Mining for Space Engineers
```

---

## WHAT THE FUCK IS THIS?

A **suicide bomber mining script**. You build a disposable drone, fill it with ammo/materials,
fly it to where you want to mine, press a button, and **BOOM** - massive crater full of ore.

**THE SECRET SAUCE:** Before detonation, the script **EJECTS ALL CARGO** onto the ground.
The ejected materials ADD to the explosion damage, making a BIGGER crater than warheads alone.

---

## THE COMPLETE FLOW

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                           UNITY NUKE SEQUENCE                                  ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   [1] BUILD DEVICE          [2] LOAD CARGO           [3] FLY TO TARGET       ║
║   ┌─────────────┐           ┌─────────────┐          ┌─────────────┐         ║
║   │ Warheads    │           │ Fill cargo  │          │ Position    │         ║
║   │ Cargo       │    ──►    │ with AMMO   │    ──►   │ over mining │         ║
║   │ Connector   │           │ or STONE    │          │ target      │         ║
║   │ Button      │           │ or SCRAP    │          │             │         ║
║   └─────────────┘           └─────────────┘          └─────────────┘         ║
║         │                                                   │                 ║
║         ▼                                                   ▼                 ║
║   [4] PRESS BUTTON ─────────────────────────────────────────┘                 ║
║   ┌─────────────────────────────────────────────────────────────────────┐     ║
║   │                                                                     │     ║
║   │   T-30: Countdown starts                                            │     ║
║   │         ├── Connector starts EJECTING cargo                         │     ║
║   │         ├── Sorters push items to connector                         │     ║
║   │         └── Materials fly out onto ground below                     │     ║
║   │                                                                     │     ║
║   │   T-10: Lights turn YELLOW (warning)                                │     ║
║   │                                                                     │     ║
║   │   T-5:  Warheads ARM                                                │     ║
║   │         ├── Lights turn RED (strobing)                              │     ║
║   │         └── POINT OF NO RETURN                                      │     ║
║   │                                                                     │     ║
║   │   T-0:  ████████████████████████████████████████████                │     ║
║   │         ██  DETONATION - EVERYTHING EXPLODES  ██                    │     ║
║   │         ████████████████████████████████████████████                │     ║
║   │                                                                     │     ║
║   └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                               ║
║   [5] RESULT: MASSIVE CRATER                                                  ║
║   ┌─────────────────────────────────────────────────────────────────────┐     ║
║   │                          ╲       ╱                                  │     ║
║   │                           ╲     ╱                                   │     ║
║   │                            ╲   ╱                                    │     ║
║   │         Ground Level ───────╲ ╱─────── Ground Level                │     ║
║   │                              V                                      │     ║
║   │                         ┌───────┐                                   │     ║
║   │                        ╱  ORE   ╲                                   │     ║
║   │                       ╱  CHUNKS  ╲                                  │     ║
║   │                      ╱ EVERYWHERE ╲                                 │     ║
║   │                     └───────────────┘                               │     ║
║   │                                                                     │     ║
║   │            Ejected materials + warheads = BIGGER BOOM               │     ║
║   └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## REQUIRED PARTS

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         SHOPPING LIST                                          ║
╠═════════════════════════════╦═════════════════════════════════════════════════╣
║  BLOCK                      ║  PURPOSE                                        ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Programmable Block    [1]  ║  The brain - runs this script                   ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Warhead(s)          [1-10] ║  THE BOOM - more = bigger crater                ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Connector             [1]  ║  EJECTS cargo before explosion                  ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Cargo Container(s)  [1-4]  ║  Hold materials to eject (FILL WITH AMMO!)      ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Timer Block           [1]  ║  Bridges button to script (SE limitation)       ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Button Panel          [1]  ║  THE BIG RED BUTTON - starts the countdown      ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Battery               [1]  ║  Powers everything during countdown             ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║                                                                               ║
║  OPTIONAL BUT RECOMMENDED:                                                    ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  LCD Panel(s)        [1-4]  ║  Shows countdown, status, death messages        ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Conveyor Sorter(s)  [1-2]  ║  Pushes cargo to connector faster               ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Interior Light(s)   [1-4]  ║  Flash yellow/red during countdown              ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Thrusters + Gyro          ║  To fly the device to target (duh)              ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Remote Control            ║  To pilot it remotely (recommended)             ║
╚═════════════════════════════╩═════════════════════════════════════════════════╝
```

---

## DEVICE LAYOUT EXAMPLE

```
                              TOP VIEW
    ┌─────────────────────────────────────────────────────────┐
    │                                                         │
    │    [THRUSTER]              [THRUSTER]                   │
    │         │                       │                       │
    │         ▼                       ▼                       │
    │    ┌─────────────────────────────────────────────┐      │
    │    │                                             │      │
    │    │   ┌───────┐  ┌───────┐  ┌───────┐          │      │
    │    │   │WARHEAD│  │WARHEAD│  │WARHEAD│          │      │
    │    │   └───────┘  └───────┘  └───────┘          │      │
    │    │                                             │      │
    │    │   ┌──────────────┐  ┌──────────────┐       │      │
    │    │   │    CARGO     │  │    CARGO     │       │      │
    │    │   │  (FILL WITH  │  │  (FILL WITH  │       │      │
    │    │   │    AMMO!)    │  │    AMMO!)    │       │      │
    │    │   └──────────────┘  └──────────────┘       │      │
    │    │          │                  │              │      │
    │    │          └────────┬─────────┘              │      │
    │    │                   │                        │      │
    │    │              [SORTER]                      │      │
    │    │                   │                        │      │
    │    │              [CONNECTOR] ◄── Ejects down   │      │
    │    │                                             │      │
    │    │   ┌─────────┐  ┌─────────┐  ┌─────────┐   │      │
    │    │   │PROG BLCK│  │  TIMER  │  │ BUTTON  │   │      │
    │    │   │ (BRAIN) │  │         │  │ (DOOM!) │   │      │
    │    │   └─────────┘  └─────────┘  └─────────┘   │      │
    │    │                                             │      │
    │    │   ┌─────────┐  ┌─────────────────────────┐ │      │
    │    │   │ BATTERY │  │     LCD DISPLAYS        │ │      │
    │    │   └─────────┘  └─────────────────────────┘ │      │
    │    │                                             │      │
    │    └─────────────────────────────────────────────┘      │
    │                                                         │
    └─────────────────────────────────────────────────────────┘

    IMPORTANT: Connector should face DOWN to eject onto ground!
```

---

## CRITICAL: CONVEYOR SETUP (READ THIS!)

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    ⚠️ CONVEYOR CONNECTION REQUIRED ⚠️                          ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   The script ONLY enables "Throw Out" mode on connectors.                     ║
║   Items must be able to PHYSICALLY FLOW from cargo to connector!              ║
║                                                                               ║
║   WITHOUT CONVEYORS:                                                          ║
║   ══════════════════                                                          ║
║   Only items ALREADY IN the connector's tiny inventory get ejected.           ║
║   Your cargo containers just sit there doing nothing. FAIL.                   ║
║                                                                               ║
║   WITH CONVEYORS:                                                             ║
║   ════════════════                                                            ║
║   Items flow: CARGO → CONVEYOR → CONNECTOR → EJECTED → GROUND → BOOM          ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   HOW TO CONNECT:                                                             ║
║   ═══════════════                                                             ║
║                                                                               ║
║   OPTION 1: Direct Connection (Small Grid)                                    ║
║   ┌─────────────┐     ┌─────────────┐                                         ║
║   │    CARGO    │─────│  CONNECTOR  │ ← Ports touching = connected            ║
║   └─────────────┘     └─────────────┘                                         ║
║                                                                               ║
║   OPTION 2: Conveyor Tubes (Recommended)                                      ║
║   ┌─────────────┐                     ┌─────────────┐                         ║
║   │    CARGO    │══════════════════════│  CONNECTOR  │                        ║
║   └─────────────┘   Conveyor Tubes    └─────────────┘                         ║
║                                                                               ║
║   OPTION 3: With Sorter (Fastest Ejection)                                    ║
║   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                     ║
║   │    CARGO    │─────│   SORTER    │─────│  CONNECTOR  │                     ║
║   └─────────────┘     └─────────────┘     └─────────────┘                     ║
║                       Pushes items            Ejects                          ║
║                       toward connector        everything                      ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   TEST YOUR CONVEYOR SYSTEM:                                                  ║
║   ══════════════════════════                                                  ║
║                                                                               ║
║   1. Put one item in cargo                                                    ║
║   2. Manually turn on "Throw Out" on connector                                ║
║   3. If item ejects → GOOD, conveyors work                                    ║
║   4. If nothing happens → Conveyors NOT connected                             ║
║                                                                               ║
║   COMMON MISTAKES:                                                            ║
║   ════════════════                                                            ║
║   ✗ Cargo and connector not touching / no tubes between                       ║
║   ✗ Conveyor ports blocked by armor blocks                                    ║
║   ✗ Small cargo on large grid (incompatible ports)                            ║
║   ✗ Connector turned off or not powered                                       ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## WHAT TO PUT IN THE CARGO

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    FILL YOUR CARGO WITH THIS SHIT                              ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   BEST OPTIONS (Maximum Explosion Damage):                                    ║
║   ════════════════════════════════════════                                    ║
║                                                                               ║
║   ★★★★★  AMMO (Missiles, Shells, Magazines)                                   ║
║          └── Explodes with warheads = MASSIVE damage boost                    ║
║                                                                               ║
║   ★★★★☆  EXPLOSIVES (if you have the component)                               ║
║          └── Boom on boom action                                              ║
║                                                                               ║
║   ★★★☆☆  SCRAP METAL / STEEL PLATES                                           ║
║          └── Shrapnel effect, damages terrain                                 ║
║                                                                               ║
║   ★★☆☆☆  STONE / GRAVEL                                                       ║
║          └── Cheap filler, still helps                                        ║
║                                                                               ║
║   ★☆☆☆☆  LITERALLY ANYTHING                                                   ║
║          └── Better than empty cargo                                          ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   WHY EJECT BEFORE EXPLODING?                                                 ║
║   ═══════════════════════════                                                 ║
║                                                                               ║
║   Materials ON THE GROUND near warheads = bigger explosion effect             ║
║   Materials IN CARGO = just destroyed, wasted                                 ║
║                                                                               ║
║   The script ejects everything FIRST (T-30 to T-5)                            ║
║   Then arms warheads (T-5)                                                    ║
║   Then BOOM (T-0)                                                             ║
║                                                                               ║
║   Result: Maximum crater. Maximum ore. Maximum destruction.                   ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## SETUP INSTRUCTIONS

### STEP 1: BUILD THE DEVICE

Build a small grid with all required parts (see shopping list above).

```
    MINIMUM REQUIRED:

    ┌──────────────────────────────────────┐
    │  [1] Programmable Block              │
    │  [1] Warhead (more = bigger boom)    │
    │  [1] Connector (facing DOWN)         │
    │  [1] Cargo Container                 │
    │  [1] Timer Block                     │
    │  [1] Button Panel                    │
    │  [1] Battery                         │
    └──────────────────────────────────────┘
```

### STEP 2: PASTE THE SCRIPT

1. Open the **Programmable Block**
2. Click **Edit**
3. Delete everything in there
4. Paste the contents of **`UNITY NUKE.cs`**
5. Click **Check Code** (should say OK)
6. Click **Remember & Exit**

### STEP 3: RUN SETUP

1. In the Programmable Block terminal
2. In the **Argument** field, type: **`SETUP`**
3. Click **Run**

```
    WHAT HAPPENS:

    ✓ Script finds all your blocks
    ✓ Renames everything with [NUKE] prefix
    ✓ Configures timer settings
    ✓ Shows setup instructions in terminal
```

After SETUP, your blocks will be named:
```
    [NUKE] Big Brain Energy     ← Programmable Block
    [NUKE] Kiss Your Ass 1      ← Warhead
    [NUKE] Vomit Cannon 1       ← Connector
    [NUKE] Boom Juice 1         ← Cargo
    [NUKE] Doom Clock 1         ← Timer
    [NUKE] Doomsday Button 1    ← Button Panel
    [NUKE] Last Breaths 1       ← Battery
    [NUKE] Big Number Screen    ← LCD 1
    [NUKE] Power Gauge          ← LCD 2
    [NUKE] Death Status         ← LCD 3
    [NUKE] Epitaph Board        ← LCD 4
```

### STEP 4: WIRE THE BUTTON (MANUAL - SE LIMITATION)

**Space Engineers doesn't let scripts set button actions. You must do this ONCE manually:**

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         BUTTON WIRING GUIDE                                    ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   PART A: Configure the Timer                                                 ║
║   ═══════════════════════════                                                 ║
║                                                                               ║
║   1. Open terminal (K key)                                                    ║
║   2. Find [NUKE] Doom Clock 1                                                 ║
║   3. Click on it                                                              ║
║   4. In right panel, find "Setup Actions"                                     ║
║   5. Click the toolbar slot                                                   ║
║   6. Search for [NUKE] Big Brain Energy                                       ║
║   7. Select "Run"                                                             ║
║   8. In the argument box, type: ARM                                           ║
║   9. Click OK                                                                 ║
║                                                                               ║
║   ┌─────────────────────────────────────────────────────────────────────┐     ║
║   │  Timer Block                                                        │     ║
║   │  ┌───────────────────────────────────────────────────────────────┐  │     ║
║   │  │ Setup Actions:                                                │  │     ║
║   │  │ ┌─────────────────────────────────────────────────────────┐   │  │     ║
║   │  │ │  [NUKE] Big Brain Energy                                │   │  │     ║
║   │  │ │  Action: Run                                            │   │  │     ║
║   │  │ │  Argument: ARM     ◄── TYPE THIS                        │   │  │     ║
║   │  │ └─────────────────────────────────────────────────────────┘   │  │     ║
║   │  └───────────────────────────────────────────────────────────────┘  │     ║
║   └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                               ║
║   PART B: Configure the Button                                                ║
║   ════════════════════════════                                                ║
║                                                                               ║
║   1. Find [NUKE] Doomsday Button 1                                            ║
║   2. Click on it                                                              ║
║   3. Find "Button 1" or the button slot                                       ║
║   4. Set action to: [NUKE] Doom Clock 1 → "Start"                             ║
║                                                                               ║
║   ┌─────────────────────────────────────────────────────────────────────┐     ║
║   │  Button Panel                                                       │     ║
║   │  ┌───────────────────────────────────────────────────────────────┐  │     ║
║   │  │ Button 1:                                                     │  │     ║
║   │  │ ┌─────────────────────────────────────────────────────────┐   │  │     ║
║   │  │ │  [NUKE] Doom Clock 1                                    │   │  │     ║
║   │  │ │  Action: Start     ◄── SELECT THIS                      │   │  │     ║
║   │  │ └─────────────────────────────────────────────────────────┘   │  │     ║
║   │  └───────────────────────────────────────────────────────────────┘  │     ║
║   └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                               ║
║   THE CHAIN:                                                                  ║
║   ══════════                                                                  ║
║                                                                               ║
║   [BUTTON] ──► [TIMER] ──► [PROG BLOCK with "ARM"] ──► COUNTDOWN ──► BOOM    ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### STEP 5: LOAD THE CARGO

**IMPORTANT: FILL YOUR CARGO CONTAINERS WITH AMMO/MATERIALS!**

```
    ┌──────────────────────────────────────────────────────────┐
    │                                                          │
    │   Open each [NUKE] Boom Juice container                  │
    │                                                          │
    │   Fill with:                                             │
    │   ├── Missiles                                           │
    │   ├── Artillery Shells                                   │
    │   ├── Ammo Magazines                                     │
    │   ├── Explosives                                         │
    │   ├── Steel Plates                                       │
    │   └── Or just Stone/Gravel (better than nothing)         │
    │                                                          │
    │   The more you put in, the bigger the crater!            │
    │                                                          │
    └──────────────────────────────────────────────────────────┘
```

### STEP 6: FLY TO TARGET

1. Get in your cockpit or use remote control
2. Fly the nuke device to where you want to mine
3. Position it LOW over the ground (connector facing down)
4. **GET THE FUCK AWAY FROM IT**

### STEP 7: PRESS THE BUTTON

```
    ╔════════════════════════════════════════════╗
    ║                                            ║
    ║      ┌──────────────────────────────┐      ║
    ║      │                              │      ║
    ║      │      ████████████████        │      ║
    ║      │      ██            ██        │      ║
    ║      │      ██   PRESS    ██        │      ║
    ║      │      ██    ME      ██        │      ║
    ║      │      ██            ██        │      ║
    ║      │      ████████████████        │      ║
    ║      │                              │      ║
    ║      └──────────────────────────────┘      ║
    ║                                            ║
    ║          POINT OF NO RETURN                ║
    ║      (well, until T-5 you can ABORT)       ║
    ║                                            ║
    ╚════════════════════════════════════════════╝
```

### STEP 8: WATCH THE SHOW

```
    T-30 ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Countdown starts, ejecting cargo
    T-25 ████████░░░░░░░░░░░░░░░░░░░░░░░░ Still ejecting...
    T-20 ████████████░░░░░░░░░░░░░░░░░░░░ Materials flying out
    T-15 ████████████████░░░░░░░░░░░░░░░░ Almost done ejecting
    T-10 ████████████████████░░░░░░░░░░░░ LIGHTS GO YELLOW
    T-5  ████████████████████████░░░░░░░░ WARHEADS ARMED - RED STROBE
    T-4  █████████████████████████░░░░░░░
    T-3  ██████████████████████████░░░░░░ KISS
    T-2  ███████████████████████████░░░░░ YOUR
    T-1  ████████████████████████████░░░░ ASS
    T-0  ██████████████████████████████░░ GOODBYE

              ██████████████████████████████████
            ██                                  ██
          ██      ☢☢☢  BOOOOOOM  ☢☢☢             ██
            ██                                  ██
              ██████████████████████████████████
```

### STEP 9: COLLECT YOUR ORE

Fly back to the crater, collect the ore chunks. Repeat with a new nuke.

---

## COMMANDS REFERENCE

| Command | What It Does |
|---------|--------------|
| `SETUP` | Discover blocks, rename with [NUKE] prefix, show wiring instructions |
| `ARM` | Start 30 second countdown (normally triggered by button) |
| `ABORT` | Cancel countdown and disarm warheads (before T-5 only!) |
| `STATUS` | Refresh all LCD displays |
| `RESET` | Clear stats, return to idle state |
| `TEST` | Dry run - shows displays without arming anything |

---

## LCD DISPLAYS

```
┌─────────────────────┐  ┌─────────────────────┐
│ LCD 1: COUNTDOWN    │  │ LCD 2: POWER        │
│                     │  │                     │
│  ██  ███            │  │  BATTERY CHARGE     │
│ ███  ███            │  │  ████████░░ 80%     │
│   ██  ██            │  │                     │
│   ██  ██   27 SEC   │  │  INPUT:  +2.4 MW    │
│   ████              │  │  OUTPUT: -1.2 MW    │
│                     │  │                     │
│ [████████████░░░░░] │  │                     │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ LCD 3: ARM STATUS   │  │ LCD 4: MESSAGES     │
│                     │  │                     │
│  ╔════════════════╗ │  │ KISS YOUR ASS       │
│  ║  !! ARMED !!   ║ │  │    GOODBYE!         │
│  ╚════════════════╝ │  │                     │
│                     │  │      ╔═══╗          │
│  WARHEADS: 4/4      │  │     ╔╝   ╚╗         │
│  EJECTED: 87%       │  │    ╔╝  ☢  ╚╗        │
│                     │  │    ╚═══════╝        │
│  DETONATIONS: 3     │  │                     │
└─────────────────────┘  └─────────────────────┘
```

---

## TROUBLESHOOTING

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  PROBLEM                    ║  SOLUTION                                       ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  "Run SETUP first"          ║  Run the script with argument: SETUP            ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Button does nothing        ║  Did you wire Timer → PB with "ARM" argument?   ║
║                             ║  Did you wire Button → Timer "Start"?           ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  No blocks found            ║  Make sure blocks are on SAME GRID as PB        ║
║                             ║  Not connected via connector/rotor              ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Cargo not ejecting         ║  Is connector powered? Is it facing DOWN?       ║
║                             ║  Are cargo containers connected via conveyor?   ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Small crater               ║  Add more warheads. Fill cargo with ammo.       ║
║                             ║  Position device LOWER to ground.               ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  LCDs not working           ║  Run SETUP again. Check LCDs are on same grid.  ║
╠═════════════════════════════╬═════════════════════════════════════════════════╣
║  Want to cancel             ║  Run with argument: ABORT (before T-5!)         ║
║                             ║  After T-5, warheads are armed - TOO LATE       ║
╚═════════════════════════════╩═════════════════════════════════════════════════╝
```

---

## PRO TIPS

```
★ More warheads = bigger boom (diminishing returns after ~6)

★ Fill cargo with MISSILES for maximum destruction

★ Position device as LOW as possible for deeper crater

★ Build cheap disposable drones - they're meant to explode

★ Remote control recommended - don't be ON the nuke

★ Conveyor sorters speed up ejection - add them!

★ You can ABORT before T-5 if you change your mind

★ The "DETONATIONS" counter persists - track your kills
```

---

## FILE CONTENTS

```
UNITY NUKE/
├── UNITY NUKE.cs      ← The script (paste into Programmable Block)
└── README.md          ← This file
```

---

## CREDITS

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                           UNITY AI LAB                                        ║
║                                                                               ║
║                    She codes, she cusses, she nukes.                          ║
║                                                                               ║
║                              ☢ 2026 ☢                                         ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

*Now go make some fucking craters.* 💀☢️💀

