# MDK2 Configuration Guide

Reference: https://malforge.github.io/spaceengineers/mdk2/

## Configuration Files

MDK2 projects use two `.ini` files:

| File | Purpose |
|------|---------|
| `[projectname].mdk.ini` | Project-wide settings, version controlled |
| `[projectname].mdk.local.ini` | Machine-specific overrides, excluded from version control |

## [mdk] Section Settings

### type
- Values: `programmableblock` or `mod`
- Set by template, do not modify

### trace
- Values: `on` or `off`
- Default: `off`
- Enables detailed logging for troubleshooting

### minify
Controls code reduction with five levels:

| Level | Description |
|-------|-------------|
| `none` | Unchanged code |
| `trim` | Unused types removed from output |
| `stripcomments` | Removes comments + trim |
| `lite` | Eliminates whitespace + stripcomments |
| `full` | Maximum reduction, renames identifiers to shorter names |

### ignores
Comma-separated glob patterns excluding files from builds.
Example: `obj/**/*`, `MDK/**/*`

### donotclean
Glob patterns for mod projects preventing file deletion during rebuilds.

## Local-Specific Settings

### output
Script destination path:
- `auto` - Resolves to `%AppData%\SpaceEngineers\IngameScripts\local`
- Custom path allowed

### binarypath
Binary location for builds:
- `auto` - Selects the game's `Bin64` folder
- Custom path allowed

**Note:** `.mdk.local.ini` settings always override matching entries in the project file.

---

## Controlling File Order

Use a sort order directive at the top of `.cs` files:

```csharp
// <mdk sortorder="1000" />
```

- Lower values are processed first
- **Critical:** The `Program` class and its contents MUST appear first in the final combined script
- Files with code outside the `Program` class cannot appear before files containing the `Program` class

---

## Minifier and Preserve Regions

### Purpose
Reduces script size to comply with SE programmable block constraints.

### Preserve Regions
Protect code from minification:

```csharp
#region mdk preserve
// Your protected code here (enums, constants, etc.)
#endregion
```

### Use Cases
- Enums or constants that external tools depend on
- Code requiring specific naming conventions or exact formatting

### Best Practices
1. Keep preserve blocks within a single logical scope (inside a class or method)
2. Regions crossing scope boundaries can cause unexpected behavior
3. Only preserve what's absolutely necessary to maintain minifier effectiveness
