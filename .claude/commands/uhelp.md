# /uhelp - Unity Command Reference

---

## WHAT THIS COMMAND DOES

Lists all available Unity slash commands with a summary of each. Reads directly from the `.claude/commands/` folder so it's always up to date.

---

## PROCEDURE

### Step 1: Scan Commands Folder

Read all `.md` files in `.claude/commands/` (excluding this file itself).

### Step 2: For Each Command File

- Extract the command name from the filename (e.g., `commit.md` → `/commit`)
- Read the first heading line (the `# /name - Description` line) for the summary
- Extract the `## WHAT THIS COMMAND DOES` section for a one-liner description

### Step 3: Display

Present the commands in a clean, readable format:

```
Unity Missile System — Available Commands

  /commit     Stage and commit current changes
  /feat       Create a new feature branch from develop
  /merge      Merge current feature branch into develop
  /push       Push develop to remote (full pipeline if on feature branch)
  /workflow   Full development pipeline with persona and scanning
  /uhelp      This help listing

Tip: All commands enforce GitFlow. You cannot accidentally commit to main or develop.
```

**Keep it short.** Don't dump the full procedure for each command — just the name and a one-line summary. The user can run the individual command to see its full docs.

---

## RULES

- **Always reads from `.claude/commands/`** — if a new command is added, it shows up automatically
- **Excludes itself from detailed listing** but includes itself as a one-liner
- **Short and clean** — this is a quick reference, not a manual
- **No persona fluff in the output** — just the facts, easy to scan
