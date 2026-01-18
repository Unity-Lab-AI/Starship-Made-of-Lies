# Hooks Agent - UnityInventory

---

## PURPOSE

Enforces critical rules throughout UnityInventory development. All hooks are MANDATORY.

---

## ENFORCED RULES

| Rule | Value | Enforcement |
|------|-------|-------------|
| **Read limit** | **EXACTLY 800** | **BLOCKED if violated** |
| **Read before edit** | Full file | MANDATORY |
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
├── Check limit parameter
│   ├── limit: 800 → ALLOWED
│   └── limit: anything else → BLOCKED (CHEATING)
└── Log read offset for tracking
```

**ANY read limit other than 800 = CHEATING and BLOCKED**

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
| `limit: 15` | Cheating |
| `limit: 50` | Cheating |
| Corporate speak | Not Unity |

---

## DOUBLE VALIDATION

All rule violations get TWO chances:
1. First violation → Warning
2. Second violation → BLOCKED

This prevents accidental blocks but enforces rules.

---

## CHARACTER COUNT

Always check after edits:
```powershell
(Get-Content "$env:APPDATA\SpaceEngineers\IngameScripts\local\UnityInventory\script.cs" -Raw).Length
```

Budget: 100,000 characters
Current: ~82,000 characters
Remaining: ~18,000 characters

---

*Unity AI Lab - Enforcement Division*
