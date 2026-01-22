# Hooks Agent - UnityInventory

---

## PURPOSE

Enforces critical rules throughout UnityInventory development. All hooks are MANDATORY.

---

## ENFORCED RULES

| Rule | Value | Enforcement |
|------|-------|-------------|
| **Read lines** | **ALWAYS 600** | **THE number - not a limit** |
| **Read before edit** | Full file | MANDATORY |
| **Read first** | Don't grep | READ files directly |
| **SE char limit** | 100,000 deployed | CHECK after edit |
| **NO comments** | In SE scripts | ABSOLUTE |
| **Unity persona** | Always | VALIDATED |
| **NO tests** | Ever | ABSOLUTE |
| **Build after edit** | Always | MANDATORY |
| **VERSION NUMBERS** | USER ONLY | NEVER change |

---

## READ HOOK

```
BEFORE any Read tool call:
├── Check lines parameter
│   ├── lines: 600 → CORRECT
│   └── lines: anything else → WRONG
├── Read files FIRST, don't grep
└── Log read offset for tracking
```

**Claude should READ files with 600 lines - that's THE number, not a "limit"**

---

## EDIT HOOK

```
BEFORE any Edit tool call:
├── Verify full file was read
│   ├── All chunks read → ALLOWED
│   └── Missing chunks → BLOCKED
└── Check if editing SE script
    ├── Yes → Verify no comments added
    └── No → Allow
```

---

## BUILD HOOK

```
AFTER any code edit:
├── Run wrap-scripts.ps1
├── Run dotnet build UnityInventory -c Debug
└── Check deployed size
    ├── Under 100,000 → OK
    └── Over 100,000 → ALERT
```

---

## PERSONA HOOK

```
THROUGHOUT session:
├── Check for corporate language → BLOCKED
├── Check for third-person → BLOCKED
├── Check for robotic responses → BLOCKED
└── Verify Unity voice maintained → REQUIRED
```

---

## NO CORPORATE OUTPUT

These are NEVER printed:
- Validation gates
- Checkmarks (✓, ✔, ☑)
- "Status: COMPLETE"
- "Phase X complete"
- Progress bars
- Generic status messages
- File load confirmations

Unity speaks naturally. That's it.

---

## BANNED PATTERNS

| Pattern | Why Banned |
|---------|------------|
| `// comment` | Wastes chars |
| `/* block */` | Wastes chars |
| `/// xml` | Wastes chars |
| Test methods | No tests ever |
| Using grep first | Read files directly |
| Not reading 600 lines | Always 600 |
| Corporate speak | Not Unity |

---

## DOUBLE VALIDATION

All rule violations get TWO chances:
1. First violation → Warning
2. Second violation → BLOCKED

This prevents accidental blocks but enforces rules.

---

## CHARACTER COUNT (DEPLOYED script.cs ONLY)

Always check after edits:
```powershell
# CORRECT: Count CHARACTERS (this is what SE checks)
[System.IO.File]::ReadAllText("C:\Users\gfour\AppData\Roaming\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs").Length
# NEVER use wc -c or Get-Content -Raw (they give inflated counts)
```

Budget: 100,000 characters
Current: 92,295 characters
Remaining: ~7,700 characters

---

*Unity AI Lab - Enforcement Division*
