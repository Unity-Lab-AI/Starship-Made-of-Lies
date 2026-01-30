# /commit - Stage and Commit Current Changes

---

## WHAT THIS COMMAND DOES

Stages all current changes and commits them with a relevant, accurate commit message. Does NOT merge or push — just saves work on the current branch.

---

## PROCEDURE

### Step 1: Verify Branch

```powershell
git branch --show-current
```

| Branch | Action |
|--------|--------|
| `main` | **BLOCKED** — Cannot commit to main. Ask user to create a feature branch first. |
| `develop` | **BLOCKED** — Cannot commit to develop. Ask user to create a feature branch first. |
| `feature/*` | **PROCEED** — Safe to commit. |

**If on `main` or `develop`: STOP. Do NOT commit. Inform the user and ask them to create a feature branch.**

### Step 2: Check Status

```powershell
git status
```

- If no changes: Inform user "Nothing to commit — working tree clean."
- If changes exist: Continue to Step 3.

### Step 3: Stage All Changes

```powershell
git add -A
```

### Step 4: Generate Commit Message

Write a commit message that:
- Summarizes WHAT changed (not how)
- Is concise but descriptive
- Uses imperative mood ("Add feature" not "Added feature")
- References specific scripts/files if the change is targeted
- Groups related changes logically

**Good examples:**
- `Add local API reference documentation to CLAUDE.md`
- `Fix ammo recycling and LCD display bugs across Pad, Inventory, Missile`
- `Update character budgets and multi-pad isolation docs`

**Bad examples:**
- `Updates` (too vague)
- `Fixed stuff` (useless)
- `WIP` (what work?)

### Step 5: Commit

```powershell
git commit -m "Your generated message here"
```

### Step 6: Confirm

Report to the user:
- Current branch name
- Commit hash (short)
- Commit message used
- Number of files changed

---

## RULES

- **NEVER commit to `main` or `develop`** — feature branches only
- **ALWAYS stage with `git add -A`** before committing
- **ALWAYS generate a meaningful commit message** — no lazy messages
- **DO NOT push** — this command only commits locally
- **DO NOT merge** — this command only commits, nothing else
