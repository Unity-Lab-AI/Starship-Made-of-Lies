# /modapi - Mod API Lookup

---

## ARGUMENTS

Usage: `/modapi <type>` or `/modapi <type>.<member>` or `/modapi <type> <member>`

Examples:
- `/modapi MyObjectBuilder_SafeZoneBlock` - Show an ObjectBuilder type
- `/modapi MyAPIGateway` - Show the gateway class
- `/modapi MySafeZone.IsActionAllowed` - Show a specific member
- `/modapi IMyThrust` - Show the mod-side version of a PB interface

---

## WHAT THIS COMMAND DOES

Looks up Space Engineers Mod API classes, interfaces, and members from local reference documentation. Searches `references/modapi/` (27,289 HTML files). Use this for mod development types that aren't available in the PB scripting sandbox.

For PB scripting interfaces (IMyThrust, IMyCameraBlock, etc.), prefer `/pbapi` instead — it searches the PB-whitelisted subset.

---

## PROCEDURE

### Step 1: Parse the Argument

Same parsing as `/pbapi`:

| Input Format | Type | Member |
|-------------|------|--------|
| `MyAPIGateway` | MyAPIGateway | (none) |
| `MySafeZone.IsActionAllowed` | MySafeZone | IsActionAllowed |
| `MySafeZone IsActionAllowed` | MySafeZone | IsActionAllowed |

If no argument is provided, tell the user to provide a type name and show examples.

### Step 2: Find the HTML File

Use Glob on `references/modapi/`:

**For a type lookup (no member):**
```
Glob: references/modapi/*{TypeName}.html
```
Filter OUT files containing `@` (member pages).

**For a member lookup:**
```
Glob: references/modapi/*{TypeName}@{MemberName}.html
```

**CRITICAL:** The modapi folder has 27,289 files. Glob patterns MUST include the type name — never wildcard the entire folder.

### Step 3: Handle Multiple Matches

The modapi has more namespace collisions than pbapi. If multiple type files match:

1. List ALL matches with their full namespace paths
2. Present the most likely candidate:
   - For `IMy*` types: prefer `Sandbox.ModAPI.*` namespace
   - For `MyObjectBuilder_*` types: prefer `ObjectBuilders.*` namespace
   - For game entity types: prefer `Sandbox.Game.Entities.*` namespace
3. Mention alternatives so the user can request a different one

### Step 4: Read and Extract Content

Read the matched HTML file (600 lines). Extract from `<main class="content">`:

Same structure as pbapi HTML:
- `<h1>` — type/member name
- `<pre><code class="language-csharp">` — C# signature
- Properties and Methods tables
- Implements list

Present as clean markdown, own members before inherited.

### Step 5: Cross-Reference with PB API

After presenting, check if the type also exists in pbapi:
```
Glob: references/pbapi/*{TypeName}.html
```

If it does, note: "This type is also available in the PB scripting API. Use `/pbapi {TypeName}` for the PB-whitelisted version."

### Step 6: Handle Not Found

If no file matches:

1. Try broader search: `references/modapi/*{partial}*.html`
2. List similar types found
3. If type starts with `IMy`, suggest checking `/pbapi` instead
4. Tell the user the search pattern that was tried

---

## RULES

- **Glob patterns MUST include the type name** — never wildcard 27k files
- **If type starts with `IMy` and exists in pbapi, mention it** — user might want the PB version
- **Handle namespace collisions gracefully** — list all matches, present most likely
- **For ObjectBuilder types, show full namespace** — these are heavily used in mod definitions
- **Strip HTML tags** — present clean markdown
- **600-line reads** — standard read size

---

*Unity AI Lab - Reference Skills*
