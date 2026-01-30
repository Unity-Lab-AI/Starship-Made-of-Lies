# /mdk2 - MDK2 Documentation Lookup

---

## ARGUMENTS

Usage: `/mdk2 <keyword>` or `/mdk2` (no arg lists all topics)

Examples:
- `/mdk2 minify` - How minification works
- `/mdk2 preserve` - How preserve regions work
- `/mdk2 config` - Project configuration guide
- `/mdk2 file order` - Controlling file order
- `/mdk2 mixin` - Mixin projects
- `/mdk2 setup` - Getting started guides
- `/mdk2 nuget` - Updating NuGet packages
- `/mdk2` - List all available topics

---

## WHAT THIS COMMAND DOES

Looks up MDK2 framework documentation from local reference files. Checks the concise `references/MDK2_Configuration.md` summary first, then falls back to the full HTML documentation in `references/mdk2/` (22 files).

---

## PROCEDURE

### Step 1: Parse the Keyword

Take whatever the user typed after `/mdk2`. If nothing was provided, skip to Step 4 (list all topics).

### Step 2: Check MDK2_Configuration.md First

Read `references/MDK2_Configuration.md` (~2.5 KB, fits in one read).

Search for the keyword in the content. This file covers the most common questions:
- `minify` — minification levels (none/trim/stripcomments/lite/full)
- `config` / `ini` / `settings` — mdk.ini and mdk.local.ini configuration
- `preserve` / `region` — preserve regions that protect code from minification
- `sortorder` / `order` — controlling file combination order
- `output` / `deploy` — output path configuration
- `trace` — trace/verbose logging

If the keyword matches content in this file, present the relevant section. This handles most lookups without needing HTML parsing.

### Step 3: Search MDK2 HTML Files

If the keyword wasn't covered by the summary, use this mapping to find the right HTML file:

| Keywords | HTML File |
|----------|-----------|
| `minify`, `minifier`, `preserve`, `region` | `references/mdk2/Using-the-Minifier-and-Preserve-Regions-in-MDK².html` |
| `config`, `configuration`, `ini`, `settings`, `output`, `trace` | `references/mdk2/MDK²-Project-Configuration-Guide.html` |
| `order`, `sort`, `sortorder`, `file order` | `references/mdk2/Controlling-File-Order-in-MDK²-Projects.html` |
| `mixin`, `shared`, `library` | `references/mdk2/Mixin-Projects.html` |
| `setup`, `start`, `getting started`, `visual studio`, `vs` | `references/mdk2/Getting-Started-using-Visual-Studio.html` |
| `rider`, `jetbrains` | `references/mdk2/Getting-Started-using-Jetbrains-Rider.html` |
| `vscode`, `code` | `references/mdk2/Getting-Started-using-VSCode.html` |
| `linux` | `references/mdk2/Running-MDK-on-Linux-(functional,-but-unsupported).html` |
| `update`, `nuget`, `packages` | `references/mdk2/Updating-the-MDK2-Nuget-packages-using-VSCode-or-command-line.html` |
| `template`, `templates` | `references/mdk2/Updating-the-MDK2-templates.html` |
| `programmable`, `pb`, `script` | `references/mdk2/Programmable-Block-Scripts.html` |

If a keyword matches, read the HTML file (600 lines) and extract content from `<main><article class="docs-content">`. Present as clean markdown.

If the keyword doesn't match any mapping, try a case-insensitive Glob:
```
Glob: references/mdk2/*{keyword}*.html
```

### Step 4: No Argument — List All Topics

If the user typed just `/mdk2` with no keyword, present this topic listing:

```
MDK2 Documentation — Available Topics

  /mdk2 minify       Minification levels and preserve regions
  /mdk2 config       Project configuration (mdk.ini settings)
  /mdk2 file order   Controlling file combination order
  /mdk2 mixin        Mixin (shared library) projects
  /mdk2 setup        Getting started with Visual Studio
  /mdk2 vscode       Getting started with VSCode
  /mdk2 rider        Getting started with JetBrains Rider
  /mdk2 linux        Running MDK on Linux
  /mdk2 nuget        Updating NuGet packages
  /mdk2 template     Updating MDK2 templates
  /mdk2 pb           Programmable Block script basics
```

### Step 5: Handle Not Found

If the keyword doesn't match the mapping or Glob:
1. Show the topic listing from Step 4
2. Suggest the closest matching topic

---

## RULES

- **Always check MDK2_Configuration.md first** — it is concise and covers the most common questions
- **Only 15 real content HTML files** — no need for complex search strategies
- **Use the keyword mapping table** for fast resolution
- **No argument = list all topics** — don't error, just help
- **Strip HTML tags** when presenting from HTML files
- **600-line reads** — standard read size

---

*Unity AI Lab - Reference Skills*
