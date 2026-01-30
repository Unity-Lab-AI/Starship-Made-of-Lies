# /pbapi - PB Scripting API Lookup

---

## ARGUMENTS

Usage: `/pbapi <type>` or `/pbapi <type>.<member>` or `/pbapi <type> <member>`

Examples:
- `/pbapi IMyThrust` - Show the full thrust interface
- `/pbapi IMyThrust.ThrustOverride` - Show a specific property
- `/pbapi IMyCameraBlock Raycast` - Show a specific method
- `/pbapi IMyGyro` - Show gyro interface
- `/pbapi Vector3D` - Show math type
- `/pbapi MyIni` - Show utility class

---

## WHAT THIS COMMAND DOES

Looks up Space Engineers Programmable Block API interfaces, classes, and members from local reference documentation. Searches `references/pbapi/` (3,858 HTML files) and the quick-reference `references/PB_API_Reference.md`.

---

## PROCEDURE

### Step 1: Parse the Argument

Extract the type name and optional member name from the argument:

| Input Format | Type | Member |
|-------------|------|--------|
| `IMyThrust` | IMyThrust | (none) |
| `IMyThrust.ThrustOverride` | IMyThrust | ThrustOverride |
| `IMyThrust ThrustOverride` | IMyThrust | ThrustOverride |
| `Sandbox.ModAPI.Ingame.IMyThrust` | (use full path directly) | (none) |

If no argument is provided, tell the user to provide a type name and show a few examples.

### Step 2: Quick Check PB_API_Reference.md

Read `references/PB_API_Reference.md` and search for the type name.

- If the type is found AND no specific member was requested: present the quick-reference content for that type. Note that full HTML docs are available for more detail.
- If a specific member was requested OR the type is not in the quick reference: proceed to Step 3.

### Step 3: Find the HTML File

Use Glob to search `references/pbapi/`:

**For a type lookup (no member):**
```
Glob: references/pbapi/*{TypeName}.html
```
Filter OUT files containing `@` (those are member pages, not type pages).

**For a member lookup:**
```
Glob: references/pbapi/*{TypeName}@{MemberName}.html
```

**If user gave full namespace path:**
```
Glob: references/pbapi/{FullPath}.html
```

### Step 4: Read the HTML File

Read the matched file using the Read tool (600 lines).

If multiple files match (e.g., type exists in multiple namespaces), list all matches with their full namespace and present the most likely one (usually `Sandbox.ModAPI.Ingame.*` for PB scripts).

### Step 5: Extract and Present Content

From the `<main class="content">` section, extract and present:

**For a type page:**
1. **Namespace** - from `<div class="page-namespace">`
2. **Declaration** - from `<pre><code class="language-csharp">`
3. **Implements** - from `<strong>Implements:</strong>` list
4. **Own Properties** - from the Properties `<table>`, excluding rows with `<em>Inherited from</em>`
5. **Own Methods** - from the Methods `<table>`, excluding inherited
6. **Inherited Members** - briefly list which parent interfaces contribute inherited members
7. **Type Definitions** - from `<strong>Type Definitions:</strong>` list (block SubtypeIds)

**For a member page:**
1. **Full signature** - from `<pre><code>`
2. **Summary/Description** - from the description section
3. **Returns** - from the Returns section (if method)

Present everything as clean markdown. Strip HTML tags. Format tables as markdown tables.

### Step 6: Handle Not Found

If no file matches the Glob:

1. Try a broader search: `references/pbapi/*{partial}*.html` (case-insensitive if possible)
2. List any similar-looking types found
3. Tell the user the exact search pattern that was tried
4. Suggest checking `/modapi` if the type might be mod-only

---

## RULES

- **Always check PB_API_Reference.md first** for quick answers
- **Always search LOCAL files** - never attempt web lookups for API docs
- **Present own members before inherited members** - reduces noise
- **Exclude `@` files when searching for types** - those are member pages
- **If multiple matches, list them** and present the most likely (Sandbox.ModAPI.Ingame.* preferred)
- **Strip HTML tags** - present clean markdown output
- **600-line reads** - standard read size per CLAUDE.md

---

*Unity AI Lab - Reference Skills*
