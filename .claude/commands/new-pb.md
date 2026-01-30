# /new-pb - Create a New PB Script Project

## ARGUMENTS

Usage: `/new-pb <description of the script>`

Examples:
- `/new-pb menu system` → creates `MenuSystem` project
- `/new-pb born in a barn` → creates `BornInABarn` project
- `/new-pb grid power monitor` → creates `GridPowerMonitor` project
- `/new-pb speed controller` → creates `SpeedController` project

The description is interpreted naturally. Convert it to PascalCase for the project name.

---

## WHAT THIS COMMAND DOES

Creates a new MDK2 Programmable Block script project under `src/scripts/`, ensures you're on a feature branch, scaffolds the project with `minify=full`, and verifies the build.

---

## PROCEDURE

### Step 1: Parse the Name

Take whatever the user typed after `/new-pb` and convert it to a PascalCase project name:
- `menu system` → `MenuSystem`
- `born in a barn` → `BornInABarn`
- `grid power monitor` → `GridPowerMonitor`
- Remove special characters, capitalize each word, join without spaces

Also generate a kebab-case version for the branch name:
- `menu system` → `menu-system`
- `born in a barn` → `born-in-a-barn`

### Step 2: Check Branch

```powershell
git branch --show-current
```

| Current Branch | Action |
|----------------|--------|
| `main` | Switch to develop, create feature branch: `feature/new-pb-{kebab-name}` |
| `develop` | Create feature branch: `feature/new-pb-{kebab-name}` |
| `feature/*` | **Already on a feature branch — proceed without creating a new one** |

**If on `main` or `develop`:**
```powershell
git checkout develop
git pull origin develop
git checkout -b feature/new-pb-{kebab-name}
```

### Step 3: Create the MDK2 PB Project

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System\src\scripts"
dotnet new mdk2pbscript -n {PascalName} -o {PascalName}
```

This creates:
```
src/scripts/{PascalName}/
├── {PascalName}.csproj
├── Program.cs
├── mdk.ini
└── thumb.png
```

### Step 4: Verify minify=full

Read the generated `mdk.ini` and ensure `minify=full` is set. If the template defaults to something else, edit it:

```ini
[mdk]
type=programmableblock
trace=off
minify=full
ignores=obj/**/*,MDK/**/*,**/*.debug.cs
namespaces=IngameScript
```

### Step 5: Verify the Build

```powershell
cd "S:\FastDevelopment\SE\Unity Missile System"
dotnet build src/scripts/{PascalName} -c Debug
```

Must exit code 0 with no errors.

### Step 6: Check Deployed Character Count

```powershell
powershell -NoProfile -Command "[System.IO.File]::ReadAllText('C:\Users\Sponge\AppData\Roaming\SpaceEngineers\IngameScripts\local\{PascalName}\script.cs').Length"
```

Report the starting character count and margin.

### Step 7: Report

Tell the user:
- Project name and location
- Branch (new or existing)
- Build status
- Starting character count
- Ready for development

---

## RULES

- **ALWAYS ensure minify=full** — every character counts in SE
- **ALWAYS build and verify** — don't leave a broken project
- **ALWAYS check branch** — respect GitFlow
- **If already on a feature branch, stay on it** — don't create a new one unnecessarily
- **Project goes in src/scripts/** — that's where all PB scripts live
- **PascalCase for project name** — matches existing convention (UnityPad, UnityMissile, BornInABarn)
- **If the template command fails** (not installed), run: `dotnet new install Mal.Mdk2.ScriptTemplates` and retry

---

*Unity AI Lab*
