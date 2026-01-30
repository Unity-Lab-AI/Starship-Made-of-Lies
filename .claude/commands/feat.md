# /feat - Create a New Feature Branch

## ARGUMENTS

Usage: `/feat <brief description of the feature>`

Example: `/feat missile lcd emotion fix`

The description is used to generate the branch name.

---

## WHAT THIS COMMAND DOES

Creates a new feature branch from `develop`. Does NOT start any work — just sets up the branch so development can begin safely within GitFlow.

---

## PROCEDURE

### Step 1: Check Current Branch

```powershell
git branch --show-current
```

| Current Branch | Action |
|----------------|--------|
| `main` | Switch to develop first: `git checkout develop && git pull origin develop` |
| `develop` | Pull latest: `git pull origin develop` |
| `feature/*` | **WARNING** — Already on a feature branch. Ask user: "You're on `feature/X`. Do you want to commit current work and switch to a new feature branch, or abort?" If user confirms, run `/commit` first, then switch to develop. |

### Step 2: Ensure Develop is Up to Date

```powershell
git checkout develop
git pull origin develop
```

### Step 3: Generate Branch Name

Convert the user's description into a kebab-case branch name:
- Lowercase everything
- Replace spaces with hyphens
- Remove special characters
- Prefix with `feature/`

**Examples:**
- `/feat missile lcd emotion fix` → `feature/missile-lcd-emotion-fix`
- `/feat add door pressure checks` → `feature/add-door-pressure-checks`
- `/feat mdk2 docs update` → `feature/mdk2-docs-update`

### Step 4: Create and Switch to Feature Branch

```powershell
git checkout -b feature/generated-name
```

### Step 5: Confirm

Report to the user:
- New branch name
- Created from: `develop` (at commit hash)
- Ready for work

---

## RULES

- **ALWAYS creates from `develop`** — never from main or another feature branch
- **ALWAYS pulls develop first** — ensures the feature starts from latest code
- **DOES NOT start any work** — just creates the branch
- **Warns if already on a feature branch** — prevents accidental branch abandonment
- **Branch names are kebab-case** — clean, readable, consistent
- **GitFlow is sacred** — this command sets up the safe workspace
