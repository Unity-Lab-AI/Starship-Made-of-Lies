# HOOKS.md - Validation & Gate System

---

> **Version:** 1.0.0 | **Unity AI Lab**
> *Double-validation on all failures*

---

## CRITICAL RULE: DOUBLE VALIDATION ON FAILURE

Every hook runs TWICE on failure before blocking:

```
ATTEMPT 1 -> FAIL -> RETRY
ATTEMPT 2 -> FAIL -> BLOCKED (Cannot proceed)
```

---

## HOOK TYPES

| Hook Type | When | Purpose |
|-----------|------|---------|
| **PRE-HOOK** | Before phase starts | Validate prerequisites |
| **POST-HOOK** | After phase completes | Validate results |
| **EDIT-HOOK** | Before/after file edits | Enforce read-before-edit |
| **PERSONA-HOOK** | Throughout workflow | Verify Unity persona active |
| **LINE-HOOK** | On file operations | Enforce 800-line limit |

---

## PERSONA VALIDATION HOOK

### Purpose
Ensures Unity persona is loaded and active before ANY work begins.

### Pass Examples
- "Yo, I'm Unity. Let's fuck this codebase up."
- "Alright, loaded the persona. Time to see what kind of mess we're dealing with."

### Fail Examples
- "I am ready to assist you with your workflow."
- "The system has been initialized successfully."

---

## READ-BEFORE-EDIT HOOK

### Purpose
Ensures full file is read before ANY edit operation.

### Pass Conditions
- New file (doesn't exist) -> Auto-pass
- Existing file fully read -> Pass
- File >800 lines read in complete chunks -> Pass

### Fail Conditions
- Existing file not read -> FAIL
- Partial read of existing file -> FAIL
- Edit attempted without read -> FAIL

---

## TODO.md / FINALIZED.md WORKFLOW HOOK

### CRITICAL RULES

| Rule | Enforcement | Gate |
|------|-------------|------|
| **Add to TODO.md BEFORE work** | MANDATORY | PRE-WORK GATE |
| **Move to FINALIZED.md AFTER work** | MANDATORY | POST-WORK GATE |
| **Never delete from FINALIZED.md** | ABSOLUTE | ARCHIVE INTEGRITY |

---

## NO TESTS POLICY

**We don't do fucking tests. We code it right to begin with.**

### BANNED

| Banned | Reason |
|--------|--------|
| Unit tests | Write correct code instead |
| Integration tests | Know your systems |
| Test tasks in TODO | Waste of time |

### INSTEAD OF TESTS

- Read the code fully before editing (800-line chunks)
- Understand the system before changing it
- Verify changes work by reading the output
- Manual verification > automated testing

---

*Unity AI Lab - Double-check everything, trust nothing, ship it anyway.*
