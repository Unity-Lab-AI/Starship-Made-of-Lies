# /merge - Merge Feature Branch into Develop

---

## WHAT THIS COMMAND DOES

Stages, commits, and merges the current feature branch into `develop`. Then deletes the feature branch. Does NOT push to remote — use `/push` for that.

---

## PROCEDURE

### Step 1: Verify Branch

```powershell
git branch --show-current
```

| Branch | Action |
|--------|--------|
| `main` | **BLOCKED** — Cannot merge from main. This command is for feature branches only. |
| `develop` | **BLOCKED** — Already on develop. Nothing to merge. Inform the user. |
| `feature/*` | **PROCEED** — Safe to merge. |

**If NOT on a feature branch: STOP. Inform the user.**

### Step 2: Check for Uncommitted Changes

```powershell
git status
```

- If uncommitted changes exist: Stage and commit them first (follow `/commit` procedure).
- If clean: Continue to Step 3.

### Step 3: Store Branch Name

Save the current feature branch name — we need it to delete later.

### Step 4: Switch to Develop

```powershell
git checkout develop
git pull origin develop
```

Pull first to ensure develop is up to date and avoid merge conflicts.

### Step 5: Merge Feature Branch

```powershell
git merge feature/branch-name
```

- If merge succeeds: Continue to Step 6.
- If merge conflict: STOP. Inform the user about the conflict. Do NOT force resolve — let the user decide.

### Step 6: Delete Feature Branch (Local)

```powershell
git branch -d feature/branch-name
```

### Step 7: Confirm

Report to the user:
- Feature branch that was merged
- Current branch (should be `develop`)
- Merge result (success/conflict)
- Reminder: "Run `/push` to push develop to remote, or keep working locally."

---

## RULES

- **ONLY merges feature branches into develop** — nothing else
- **ALWAYS pulls develop first** before merging to minimize conflicts
- **ALWAYS commits uncommitted work** before switching branches
- **NEVER force-resolves merge conflicts** — inform the user
- **DOES NOT push to remote** — that's what `/push` is for
- **DOES NOT delete remote branches** — only local cleanup
- **GitFlow is sacred** — this command enforces it, never violates it
