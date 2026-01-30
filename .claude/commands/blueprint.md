# /blueprint - SE Blueprint/Recipe Lookup

---

## ARGUMENTS

Usage: `/blueprint <search term>`

Examples:
- `/blueprint SteelPlate` - SteelPlate recipe
- `/blueprint Iron` - All Iron-related blueprints (ore smelting, etc.)
- `/blueprint ammo` - All ammo blueprints
- `/blueprint NATO` - NATO ammo magazine recipes
- `/blueprint Welder` - Welder tool recipe
- `/blueprint bottle` - H2/O2 bottle recipes
- `/blueprint Missile` - Missile200mm recipe

---

## WHAT THIS COMMAND DOES

Looks up Space Engineers crafting blueprints and recipes from `references/se_blueprints.csv`. Shows what a blueprint produces and its identifier for use in scripting (assembler queue operations, production targets, etc.).

---

## PROCEDURE

### Step 1: Parse the Search Term

Take whatever the user typed after `/blueprint`. If nothing was provided, show usage examples and a few common search terms.

### Step 2: Read the CSV

Read `references/se_blueprints.csv` (approximately 160 rows — fits in a single read).

The CSV has 3 columns:
```
File,BlueprintId,Produces
```

- **File** — Source data file (e.g., `Content\Data\Blueprints.sbc`)
- **BlueprintId** — Full blueprint ID (e.g., `MyObjectBuilder_BlueprintDefinition/SteelPlate`)
- **Produces** — Output item with quantity (e.g., `Component/SteelPlate x1`)

### Step 3: Search

Perform a **case-insensitive** search across BOTH the `BlueprintId` and `Produces` columns.

This allows flexible searches:
- By blueprint name: `SteelPlate` matches `...BlueprintDefinition/SteelPlate`
- By product type: `Iron` matches `Ingot/Iron` in Produces
- By category: `Ammo` matches `AmmoMagazine/*` in Produces
- By partial name: `NATO` matches `NATO_25x184mm`, `NATO_5p56x45mm`, etc.

### Step 4: Present Results

Format matching rows as a clean table:

```
Blueprint                  | Produces
---------------------------|---------------------------
SteelPlate                 | Component/SteelPlate x1
IronOreToIngot             | Ingot/Iron x0.7
```

**Cleanup rules:**
- Strip `MyObjectBuilder_BlueprintDefinition/` prefix from BlueprintId
- Strip `Position####_` prefixes from positioned blueprints (e.g., `Position0090_Welder4` becomes `Welder4`)
- Keep the Produces column as-is (contains item type path and quantity)
- Omit the File column unless the user specifically asks about source files

### Step 5: Group if Many Results

If more than 10 results match, group them by category based on the Produces column prefix:

| Prefix | Category |
|--------|----------|
| `Component/` | Components |
| `Ingot/` | Ingots (Ore Smelting) |
| `AmmoMagazine/` | Ammunition |
| `PhysicalGunObject/` | Tools & Weapons |
| `OxygenContainerObject/` | O2 Bottles |
| `GasContainerObject/` | H2 Bottles |
| `ConsumableItem/` | Food |
| `SeedItem/` | Seeds |

### Step 6: Handle Not Found

If no rows match:
1. Tell the user no blueprints matched their search
2. Suggest checking spelling
3. Show a few example searches: `SteelPlate`, `Iron`, `ammo`, `NATO`, `Welder`, `bottle`

---

## RULES

- **Read the full CSV** — it is small enough for a single read
- **Case-insensitive search** across both BlueprintId and Produces columns
- **Strip verbose prefixes** for clean, readable output
- **Group by category** when results exceed 10 matches
- **Omit the File column** unless explicitly requested
- **No argument = show usage** with example search terms

---

*Unity AI Lab - Reference Skills*
