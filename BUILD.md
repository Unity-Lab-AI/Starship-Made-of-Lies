# SMoL — Build & Packaging

This doc covers prerequisites, per-platform build commands, and known blockers for getting Starship Made of Lies running locally and producing distributable artifacts.

**Version:** v0.01.0 — Alpha (stays at this version until explicitly bumped)

**Community / Feedback:** Single channel — Discord (`https://discord.gg/YWYk4CBr`). Drop bugs, ideas, weirdest match stories there. Per-build "Open Discord" button is wired into the in-app footer via `client/src/services/community.ts`.

## Prerequisites

| Tool         | Min Version | Used For                                       |
| ------------ | ----------- | ---------------------------------------------- |
| Node.js      | 20.x        | Vite dev server, TypeScript build, all scripts |
| pnpm         | 9.15.0      | Workspace dependency manager                   |
| Rust + Cargo | 1.77+       | Tauri desktop builds (Win/Mac/Linux)           |
| Xcode        | 15+         | iOS builds (macOS only)                        |
| Android SDK  | 34+         | Android builds (Linux/macOS/Windows)           |
| Java         | 17          | Android Gradle builds                          |
| Cocoapods    | 1.15+       | iOS pod install                                |

Install Node + pnpm first; everything else is per-platform target. The web build only needs Node + pnpm.

## Quickstart

```bash
# install dependencies
pnpm install

# dev server (web)
pnpm dev                    # → http://localhost:5173/preview

# dev server (multiplayer backend)
pnpm dev:server             # → ws://localhost:2567

# typecheck + lint
pnpm typecheck
pnpm lint
```

## Web build

```bash
pnpm build:web

# artifacts in client/dist/
# entries/, chunks/, assets/ — content-hashed for CDN cache invalidation
```

Manual chunks split bundle into:

- `vendor` (general node_modules)
- `vendor-react` / `vendor-three` / `vendor-colyseus` (large libs)
- `sim` / `protocol` / `audio` / `ui-panels` (per-domain app code)

Set `SMOL_BASE_PATH=/some/sub/path/` env var if deploying under a non-root path.

## PWA / offline web play

`client/public/manifest.webmanifest` declares the installable PWA shape (display=standalone, landscape orientation, icons, shortcuts). `client/public/sw.js` ships a service worker with cache-first for hashed assets, network-first for `/api/`+`/ws`, and stale-while-revalidate for everything else. Registration auto-fires from `client/src/main.tsx` in production builds.

## Asset manifest

```bash
node tools/build-asset-manifest.cjs
```

Scans `assets/themes/**` and emits `client/public/assets-manifest.json` with per-theme file listings + sizes + sha-256 (16-char prefix) checksums. Run before `build:web` if you want CDN deploy steps to know what to upload + invalidate.

## Desktop build (Tauri)

```bash
pnpm build:desktop

# bundles in src-tauri/target/release/bundle/
# Win: msi + nsis exe
# Mac: dmg + app
# Linux: deb + appimage + rpm
```

**Toolchain blockers:**

- Rust + Cargo (rustup default-stable)
- Linux: `libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev pkg-config`
- macOS: Xcode CLI tools
- Windows: WebView2 runtime (usually pre-installed on Win11)

Code signing keys go in env vars `TAURI_SIGNING_PRIVATE_KEY` + `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. CI pulls these from repo secrets.

## Mobile build (Capacitor)

```bash
pnpm build:web
pnpm exec cap sync android
pnpm exec cap sync ios

# Android
pnpm dev:android            # live reload onto device
cd android && ./gradlew bundleRelease assembleRelease

# iOS (macOS only)
pnpm dev:ios                # live reload onto simulator
cd ios/App && pod install
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release archive
```

**Toolchain blockers:**

- iOS: Xcode 15+ + Apple Developer account + provisioning profile + signing cert
- Android: Android SDK 34+ + JDK 17 + Gradle 8+ + signing keystore

## CI/CD

GitHub Actions workflows under `.github/workflows/`:

- `ci.yml` — lint + typecheck + format check on every push/PR
- `build-web.yml` — Vite production bundle + artifact upload (push to main/develop/release/\* and PRs)
- `build-desktop.yml` — Tauri Win/Mac/Linux 3-runner matrix (push to release/\* and manual dispatch)
- `build-mobile.yml` — Capacitor Android (Ubuntu) + iOS (macOS) (push to release/\* and manual dispatch)

Required GitHub repo secrets for full release builds:

- `TAURI_SIGNING_PRIVATE_KEY` + `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- `ANDROID_KEYSTORE_BASE64` + `ANDROID_KEYSTORE_PASSWORD` + `ANDROID_KEY_ALIAS` + `ANDROID_KEY_PASSWORD`
- `APPLE_TEAM_ID`

Without these, the build workflows still run + emit artifacts but signing steps fail. CI (lint/typecheck) runs without any secrets.

## Deploying — local self-host (alpha)

Alpha hosting runs on Gee's local Windows PC at `https://smol.unityailab.com`. Stack: Cloudflare Tunnel (public ingress) → Caddy (`:8080`) → Vite bundle / Colyseus WS / Node.js API.

Full setup walkthrough: [`local-server/README.md`](local-server/README.md)

Quick commands:

```powershell
# First-time scaffolding installed via:
local-server\scripts\install-services.bat   # (run as admin, after Caddy + cloudflared installs)

# Deploy a code change (rebuild + regenerate asset manifest + reload Caddy)
pnpm deploy:local

# Maintenance window — graceful shutdown order (saves all active matches per user directive)
sc stop smol-node-server   # waits for snapshot capture
sc stop smol-cloudflared
sc stop smol-caddy
```

Per user directive (verbatim): _"down only for maintence with no warning saves all current games to host autosaves"_ — graceful-shutdown handler in the Node.js server snapshots all active matches before exit; on boot it resumes matches with `endedAtTick IS NULL` from Postgres `snapshots` table. (Implementation lands in PHASE 11+14 #3 backend wire-up.)

## Known blockers (non-toolchain)

| Blocker                                        | Phase  | Resolution                                                                                                                                                                                                              |
| ---------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Real per-theme `.ogg` audio recordings         | 12     | Audio team / composer commission. Per-theme synth fallback ships in PHASE 14 — every theme has distinct tone arrays / LFO / waveform via `theme-polish.ts`.                                                             |
| LLM voice AI cameo pipeline                    | 14     | DEFERRED post-MVP per user directive — playback selection, generation, female/male templates, intro cameo.                                                                                                              |
| Citizen voice cameos                           | 12     | Voice acting sessions per theme. SfxOverrides API is the slot.                                                                                                                                                          |
| OAuth backend (email/Discord/Google/Apple)     | 11     | User picks Supabase / Firebase / self-host. All 4 providers will wire in. AccountStore interface ships today.                                                                                                           |
| Persistent leaderboards backend                | 11     | Same backend pick. **PHASE 14 lock-in:** ONE global Hall of Champions / leaderboard (not per-server).                                                                                                                   |
| ~~Three.js 3D scene + LOD + camera~~           | ~~8~~  | ✅ Alpha scope shipped 2026-05-10 — playable match loop on `/play` with 2D hex grid (TilePlacementGrid). Real 3D zoom deferred to v1.5+ (multi-day infra; not blocking alpha gameplay).                                 |
| Real Tauri desktop + Capacitor mobile binaries | 13     | Toolchain-blocked — Rust + Xcode + Android-SDK installs needed locally. Configs + CI workflows ship; signing keys + actual builds queued.                                                                               |
| Smarter AI (PHASE 9 AIController.tick)         | 9      | MatchSim uses a simplified random-pick AI today. Full PHASE 9 archetype/difficulty/coop logic exists in `shared/src/sim/ai-*` but is NOT wired into live solo matches. Wire-up = a follow-up phase.                     |
| PHASE 14 advanced mechanics not yet wired      | 14     | Modular ship pieces / indigenous civs / LAST HOPE evac / modular mines / Warning System effects / crash-loot drops have full data + interfaces but are NOT invoked by MatchSim's tick today. Wire-up = follow-up phase. |
| App icons (real branding)                      | 13     | Ship icons in `src-tauri/icons/` + `client/public/icons/`. Placeholders today.                                                                                                                                          |
| Crash + match-end telemetry endpoints          | 14     | `HttpTelemetryPipeline` interface ships in PHASE 14. POST endpoints to be configured at deploy.                                                                                                                         |
| ~~Real Discord invite URL~~                    | ~~14~~ | ✅ RESOLVED 2026-05-10 — real invite `discord.gg/YWYk4CBr` wired in `community.ts` + BUILD.md.                                                                                                                          |

## PHASE 14 polish surfaces (shipped 2026-05-10)

PHASE 14 polish surfaces — what landed in code, distinct from prior phases:

- **5Hz authoritative tick** (was 10Hz). Match length recalibrated: blitz=1500 / standard=4500 / epic=9000 / open=∞.
- **`open` match length + `tickCapOverride`** — default match is now open-ended with mission-objective overlay (per user "mostly everyone will be doing open ended always with mission objective"). All 4 mission objectives (highscore / resource / last-civ-standing / apex-tech) wired into match-end resolver.
- **Permanent vulnerability flag** replaces `VULNERABILITY_WINDOW_TICKS=30` — 100% landing vulnerability everywhere. `isVulnerable()` always returns true.
- **Modular ship loadouts** — `ColonyShipBuild` with 8-slot piece system (hull / propulsion / life-support / landing-gear / payload / sensors / weapons / comms). 30+ pieces. Tech-walls + resource-gates per piece. `defaultBuildFromShipDef` derives a build from any existing ColonyShipDef.
- **Crash-landing mechanic** — `landingGearTier=0` ships CRASH on arrival. `CRASH_LANDED` flight phase + `LootDrop` system + `applyCrashLandingDeaths`.
- **Indigenous AI civs** — every player's home planet spawns indigenous rivals via `spawnIndigenousCiv`. Theme-coupled hostility (allied/neutral/hostile) drives intra-planet warfare phase before inter-planet. Cult/refugee themes = allied; warlord/junta = hostile.
- **Modular mines + missiles** — battery + fuel + auto-guidance + crew + marooned-crew mechanic. `tickMineState` / `tickModularMissile` apply death tracking via `DeathLedger`.
- **`TECH_WARNING_SYSTEM`** — early-game tech (tier 0, prereq Mass Communication) — adds 30 ticks of early-warning + boosted detection range. Researchable before/with Aerospace.
- **LAST HOPE evac** — `LastHopeEvacState` + `tickLastHopeEvac` 4-phase machine (PACKING / BUILDING / LAUNCHING / IN_FLIGHT). `shouldAutoTriggerLastHope` heuristic for civ-near-collapse.
- **Per-theme polish (20 themes × 5 fields)** — `theme-polish.ts`: starvation resist multiplier / faction labels / 5-tier citizen emoji pack / indigenous hostility / role label / synth music preset / boot reveal line.
- **Quality-of-life-driven tier promotion** — `qualityOfLifeIndex` aggregates food variety + food quality + excess housing + water access + happiness floor. `tickTierPromotion` uses QoL × tech × propaganda multiplier.
- **Death cause enum** — explicit cause tracking (starvation / no_air / no_water / explosion / combat / colony_ship_volunteered / crash_landing / plague). `DeathLedger` per-civ ring buffer.
- **Citizens immortal from old age** — death ONLY from explicit causes. No senescence.
- **Manual citizen-pinning override** — `WorkforceState.manualPins` Set + `pinManually` / `clearManualPin` helpers.
- **Render quality preset** — `RenderQuality` enum (low/medium/high) with per-tier LOD overrides + animation density + targetFps. Auto-detect at first launch via `detectRecommendedQuality`.
- **Adaptive HUD per zoom level** — `panelsForZoom` binds galaxy/system/planet/region/base/building zoom levels to panel-visibility. Galaxy = minimal, base = full.
- **Settings model split** — `SETTING_REGISTRY` classifies every setting as `host_shared` (host pushes to match) or `personal` (per-user). 22 settings audited.
- **WCAG AA palette audit** — `auditAllThemes` scans all 20 theme palettes for 4.5:1 contrast. Per-theme retune overrides slot at `RETUNE_OVERRIDES` (currently empty — populate as audits surface violations).
- **Per-theme synth music presets** — every theme has distinct tone array + LFO rate + LFO depth + waveform + intensity scale (calm/tense/victory/defeat). `synthParamsFromThemePolish` consumes them in `AudioSystem`.
- **First-launch role labels** — `buildFirstLaunchCopy` returns "You are the High Priest / CEO / Generalissimo / etc." per theme.
- **Theme reveal in 26 boot checks** — `theme-reveal` boot check uses `Theme.bootRevealLine` for the dramatic reveal moment.
- **Mission objective resolver** — server-side `resolveMatchEnd` evaluates highscore / resource / apex / last-civ-standing every tick; ends match on first-met.
- **Cloud feature gating** — `CLOUD_FEATURE_REQUIREMENTS` lists which features need account login. Local play prompts opt-in for global Hall of Champions / leaderboard.
- **Telemetry pipeline** — `HttpTelemetryPipeline` with crash + anonymous match-end POST + opt-in state machine.
- **Discord button** — `client/src/services/community.ts` exports `DISCORD_INVITE_URL` + `openDiscord()`.
- **3 new client→server messages** — `CLAIM_LOOT_DROP` / `TRIGGER_LAST_HOPE_EVAC` / `MANUAL_SHIP_FIRE` (manual ship control + barrage / auto-salvo).
- **4 new server→client messages** — `LOOT_DROP_AVAILABLE` / `LOOT_DROP_CLAIMED` / `INCOMING_FLIGHT_WARNING` / `LAST_HOPE_EVAC_TRIGGERED`.

## Repo layout

```
Starship Made of Lies/
├── .github/workflows/      # CI + build pipelines
├── .claude/                # Workflow proprietary docs (gitignored)
├── _ums-reference/         # UMS quarantine (preserved until PHASE 15)
├── client/                 # Vite + React + Three.js frontend
│   ├── public/             # static assets (manifest.webmanifest, sw.js, icons)
│   └── src/                # app code (audio, settings, ui, 2d, 3d, theme)
├── server/                 # Colyseus + AI controllers + match state
├── shared/                 # cross-cutting types + game rules
├── src-tauri/              # Tauri desktop shell (Rust)
├── tools/                  # build scripts (asset-manifest + others)
├── assets/                 # theme audio + emoji manifests (most placeholders today)
├── capacitor.config.ts     # iOS/Android shell config
├── package.json            # workspace root
├── pnpm-workspace.yaml
└── BUILD.md                # this file
```
