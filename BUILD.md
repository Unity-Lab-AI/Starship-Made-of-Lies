# SMoL — Build & Packaging

This doc covers prerequisites, per-platform build commands, and known blockers for getting Starship Made of Lies running locally and producing distributable artifacts.

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

## Known blockers (non-toolchain)

| Blocker                                | Phase | Resolution                                                                                           |
| -------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------- |
| Real per-theme `.ogg` audio recordings | 12    | Audio team / composer commission. Synth fallback ships today.                                        |
| Citizen voice cameos                   | 12    | Voice acting sessions per theme. SfxOverrides API is the slot.                                       |
| OAuth backend (email/Google/Discord)   | 11    | User picks Supabase / Firebase / self-host. AccountStore interface ships today.                      |
| Persistent leaderboards backend        | 11    | Same backend pick. LeaderboardStore + AchievementStore + SnapshotStore interfaces ship today.        |
| Three.js scene + LOD + camera          | 8     | Multi-day infra build. Will gate full 3D PannerNode spatial audio + client-side state interpolation. |
| App icons (real branding)              | 13    | Ship icons in `src-tauri/icons/` + `client/public/icons/`. Placeholders today.                       |

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
