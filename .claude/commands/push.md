# /push - Push Develop to Remote

---

## WHAT THIS COMMAND DOES

Pushes the `develop` branch to `origin/develop`. If currently on a feature branch, it will go through the full save-and-merge process first (with user confirmation).

This is the "I'm done, ship it to remote" command.

---

## PROCEDURE

### Step 1: Check Current Branch

```powershell
git branch --show-current
```

| Current Branch | Action |
|----------------|--------|
| `main` | **BLOCKED** — This command pushes develop, not main. Inform the user. |
| `develop` | Skip to Step 3 (already on develop). |
| `feature/*` | Go to Step 2 (need to save and merge first). |

### Step 2: Feature Branch Handling (Only if on feature/*)

**ASK USER FOR CONFIRMATION:**
> "You're on `feature/X`. To push develop, I need to commit your changes, merge into develop, and then push. Proceed?"

- If user confirms: Execute the full `/merge` procedure (commit, switch to develop, merge, delete feature branch).
- If user declines: STOP. Do nothing.
- If merge conflict occurs: STOP. Inform user. Do NOT push.

### Step 3: Ensure Develop is Current

```powershell
git pull origin develop
```

- If pull succeeds: Continue.
- If pull has conflicts: STOP. Inform user about remote conflicts.

### Step 4: Push to Remote

```powershell
git push origin develop
```

### Step 5: Confirm

Report to the user:
- Branch pushed: `develop`
- Remote: `origin/develop`
- Latest commit hash and message
- If a feature branch was merged: which branch, now deleted locally

---

## RULES

- **ONLY pushes `develop`** — never pushes feature branches or main
- **If on a feature branch: ALWAYS asks user for confirmation** before merging and pushing
- **ALWAYS pulls before pushing** — prevents rejected pushes
- **NEVER pushes main** — main promotion is a separate, deliberate process
- **NEVER force pushes** — if push is rejected, inform the user
- **Handles the full pipeline** — from feature branch to remote develop in one command if confirmed
- **GitFlow is sacred** — this command is the final step, it must be clean
