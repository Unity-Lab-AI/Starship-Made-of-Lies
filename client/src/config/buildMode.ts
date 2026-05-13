// PHASE 17.L.D.14 — build-mode flag for the static-demo bundle hosted on GitHub Pages.
//
// Set `VITE_SMOL_DEMO_MODE=true` at build time (e.g. in the GitHub Actions workflow that
// builds + publishes to gh-pages) to produce a demo-only bundle:
//   • Hides the "Multiplayer" item from MainMenu
//   • Hard-guards the /multiplayer route (direct navigation shows a "demo build" notice)
//   • Renders a "DEMO BUILD" indicator label under the Quit button on the title screen
//
// In any other build (local dev, production server-hosted full game), the flag defaults to
// false and the menu/routes behave normally.
//
// Implementation: Vite inlines `import.meta.env.VITE_*` env vars into the static bundle at
// build time. Reading the flag at module init means it's a compile-time constant for
// downstream React components — Vite's tree-shaker can dead-code-eliminate Multiplayer-only
// imports on demo builds, keeping the static bundle leaner.

const RAW = import.meta.env.VITE_SMOL_DEMO_MODE
export const IS_DEMO_BUILD: boolean = RAW === 'true' || RAW === '1' || RAW === true

// Human-readable label for the UI indicator chip. Single source of truth so the badge text
// stays consistent if we ever rename / re-style the demo-mode marker.
export const DEMO_BUILD_LABEL = 'DEMO BUILD'

// Hosted location of the live demo (for the "play the demo" link in the full-game build, if
// we ever want to cross-link). Wired to GitHub Pages default URL pattern matching the repo
// name (Unity-Lab-AI/Starship-Made-of-Lies → unity-lab-ai.github.io/Starship-Made-of-Lies/).
export const DEMO_BUILD_URL = 'https://unity-lab-ai.github.io/Starship-Made-of-Lies/'
