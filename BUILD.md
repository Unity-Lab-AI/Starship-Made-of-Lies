<div align="center">

# 🛠️ Starship Made of Lies — Build & Setup

### _Get the game running locally + produce distributable artifacts._

</div>

---

**Version:** v0.01.0 — Alpha (stays at this version until explicitly bumped)
**Community:** Discord — [`discord.gg/YWYk4CBr`](https://discord.gg/YWYk4CBr) — bug reports, ideas, weirdest match stories
**Live alpha host:** `https://smol.unityailab.com` (self-hosted on Gee's Windows PC during alpha)

---

## 🧰 Prerequisites

| Tool         | Min Version | Required for                                 |
| ------------ | ----------- | -------------------------------------------- |
| Node.js      | 20.x        | Vite dev server + TypeScript build + scripts |
| pnpm         | 9.15.0      | Workspace dependency manager                 |
| Rust + Cargo | 1.77+       | Tauri desktop builds (Win/Mac/Linux)         |
| Xcode        | 15+         | iOS builds (macOS only)                      |
| Android SDK  | 34+         | Android builds (Linux/macOS/Windows)         |
| Java         | 17          | Android Gradle builds                        |
| Cocoapods    | 1.15+       | iOS pod install                              |

Install Node + pnpm first — everything else is **per-platform-target opt-in**. Web-only builds need only Node + pnpm.

---

## ⚡ Quickstart

```bash
# Install dependencies
pnpm install

# Dev server (web)
pnpm dev                    # → http://localhost:5173/preview

# Dev server (multiplayer backend)
pnpm dev:server             # → ws://localhost:2567

# Static validation
pnpm typecheck
pnpm lint
```

```
   ┌───────────────────────────────────────────────────────────┐
   │  Open http://localhost:5173/preview in a browser          │
   │                                                           │
   │  ─ Click "Start Match" → instant solo run                 │
   │  ─ Click "Multiplayer" → joins ws://localhost:2567        │
   │     (start backend first with `pnpm dev:server`)          │
   │  ─ Tweak `/play` settings + camera controls in Settings   │
   └───────────────────────────────────────────────────────────┘
```

---

## 🌐 Web Build

```bash
pnpm build:web
# → artifacts in client/dist/
```

```
   client/dist/
   ├── index.html            ← entry
   ├── assets/               ← content-hashed chunks (CDN-cache-friendly)
   │   ├── vendor.[hash].js          ← general node_modules
   │   ├── vendor-react.[hash].js    ← React + react-dom + router
   │   ├── vendor-three.[hash].js    ← Three.js
   │   ├── vendor-colyseus.[hash].js ← WebSocket multiplayer client
   │   ├── sim.[hash].js             ← simulation rules
   │   ├── protocol.[hash].js        ← message types
   │   ├── audio.[hash].js           ← audio system
   │   └── ui-panels.[hash].js       ← side panels
   └── manifest.webmanifest  ← PWA installability
```

**Deploy under a non-root path:** set `SMOL_BASE_PATH=/some/sub/path/` env var before `pnpm build:web`.

### PWA / offline play

`client/public/manifest.webmanifest` declares the installable PWA shape (display=standalone, landscape orientation, icons, shortcuts).
`client/public/sw.js` ships a service worker — **cache-first** for hashed assets, **network-first** for `/api/` + `/ws`, **stale-while-revalidate** for everything else.

Service worker auto-registers from `client/src/main.tsx` in production builds. Skipped in dev.

### Asset manifest

```bash
node tools/build-asset-manifest.cjs
```

Scans `assets/themes/**` and emits `client/public/assets-manifest.json` with per-theme file listings + sizes + sha-256 (16-char prefix) checksums. Run before `pnpm build:web` so CDN deploy steps know what to upload + invalidate.

---

## 🖥️ Desktop Build (Tauri)

```bash
pnpm build:desktop
# → bundles in src-tauri/target/release/bundle/
```

```
   PLATFORM TARGETS
   ┌────────────────────────────────────────────────────┐
   │  Windows ──► .msi installer + nsis .exe            │
   │  macOS   ──► .dmg disk image + .app bundle         │
   │  Linux   ──► .deb + .AppImage + .rpm               │
   └────────────────────────────────────────────────────┘
```

**Toolchain blockers per platform:**

- **Linux:** `libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev pkg-config`
- **macOS:** Xcode CLI tools
- **Windows:** WebView2 runtime (pre-installed on Win 11; download from MS for Win 10)
- **All platforms:** `rustup default stable`

**Code signing keys** (release builds):

- `TAURI_SIGNING_PRIVATE_KEY` + `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` env vars
- CI pulls these from GitHub repo secrets

---

## 📱 Mobile Build (Capacitor)

```bash
# Build web bundle + sync to native shells
pnpm build:web
pnpm exec cap sync android
pnpm exec cap sync ios

# Android live-reload onto device
pnpm dev:android

# Android release build
cd android && ./gradlew bundleRelease assembleRelease

# iOS live-reload onto simulator (macOS only)
pnpm dev:ios

# iOS release build
cd ios/App && pod install
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release archive
```

**Toolchain blockers:**

- **iOS:** Xcode 15+ · Apple Developer account · provisioning profile · signing cert
- **Android:** Android SDK 34+ · JDK 17 · Gradle 8+ · signing keystore

**Touch UX adaptations** (auto-applied on touch-platform detection):

- Pinch-zoom replaces mouse-wheel zoom
- Two-finger drag replaces WASD pan
- Long-press replaces right-click
- Bottom-sheet panels replace side panels

---

## 🤖 CI/CD

GitHub Actions workflows under `.github/workflows/`:

| Workflow            | Triggers                                       | Output                                   |
| ------------------- | ---------------------------------------------- | ---------------------------------------- |
| `ci.yml`            | Every push + PR                                | Lint + typecheck + format check          |
| `build-web.yml`     | push to `main` / `develop` / `release/*` + PRs | Vite production bundle + artifact upload |
| `build-desktop.yml` | push to `release/*` + manual dispatch          | Tauri Win/Mac/Linux 3-runner matrix      |
| `build-mobile.yml`  | push to `release/*` + manual dispatch          | Capacitor Android (Ubuntu) + iOS (macOS) |

**Required GitHub repo secrets** for full release builds:

```
   ┌─ Desktop signing ────────────────────────────────────────┐
   │  TAURI_SIGNING_PRIVATE_KEY                               │
   │  TAURI_SIGNING_PRIVATE_KEY_PASSWORD                      │
   └──────────────────────────────────────────────────────────┘

   ┌─ Android signing ────────────────────────────────────────┐
   │  ANDROID_KEYSTORE_BASE64                                 │
   │  ANDROID_KEYSTORE_PASSWORD                               │
   │  ANDROID_KEY_ALIAS                                       │
   │  ANDROID_KEY_PASSWORD                                    │
   └──────────────────────────────────────────────────────────┘

   ┌─ iOS signing ────────────────────────────────────────────┐
   │  APPLE_TEAM_ID                                           │
   └──────────────────────────────────────────────────────────┘
```

Without these, build workflows still run + emit artifacts but signing steps fail gracefully. CI (lint/typecheck) runs without any secrets.

---

## 🏠 Local Self-Host (Alpha Deploy)

Alpha hosting runs on the founder's local Windows PC at `https://smol.unityailab.com`.

```
   ┌─ STACK ──────────────────────────────────────────────────┐
   │                                                          │
   │   public ingress    ──► Cloudflare Tunnel                │
   │                              │                           │
   │   reverse proxy     ──► Caddy (port :8080)               │
   │                              │                           │
   │           ┌──────────────────┼──────────────────┐        │
   │           ▼                  ▼                  ▼        │
   │     Vite bundle        Colyseus WS         Node.js API   │
   │     (static)           (ws://...)          (REST)        │
   │                                                          │
   └──────────────────────────────────────────────────────────┘
```

Full setup walkthrough: [`local-server/README.md`](local-server/README.md)

**Quick commands:**

```powershell
# First-time scaffolding (run as admin)
local-server\scripts\install-services.bat

# Deploy a code change
pnpm deploy:local           # rebuild + regenerate manifest + reload Caddy

# Maintenance window — graceful shutdown
sc stop smol-node-server    # waits for snapshot capture
sc stop smol-cloudflared
sc stop smol-caddy
```

**Graceful shutdown policy:** the Node server snapshots all active matches before exit; on boot it resumes matches with `endedAtTick IS NULL` from the persistence layer. No active match is lost during maintenance.

---

## 📐 Repo Layout

```
   Starship Made of Lies/
   ├── .github/workflows/    ─ CI + build pipelines
   ├── .claude/              ─ Workflow proprietary docs (gitignored)
   ├── _ums-reference/       ─ Preserved UMS source (deleted in PHASE 15)
   ├── client/               ─ Vite + React + Three.js frontend
   │   ├── public/           ─ Static assets (manifest, sw.js, icons)
   │   └── src/
   │       ├── audio/        ─ Per-government music + universal SFX
   │       ├── match/        ─ MatchSim + useMatchSim sim hook
   │       ├── render/       ─ Three.js scene + camera + layers
   │       ├── services/     ─ Community, telemetry, persistence client
   │       ├── ui/           ─ React components (panels, pages, play widgets)
   │       └── 3d/           ─ Three.js helpers (post-LOD, shaders)
   ├── server/               ─ WebSocket multiplayer + persistence + AI procs
   │   ├── src/rooms/        ─ Match rooms + lobby
   │   ├── src/match/        ─ Snapshot + tick orchestration
   │   ├── src/persistence/  ─ Account / Leaderboard / Snapshot stores
   │   └── src/ai/           ─ Background AI civ processes
   ├── shared/               ─ Types + protocol + sim rules (used by both)
   │   └── src/
   │       ├── gen/          ─ Galaxy + planet generation
   │       ├── sim/          ─ Simulation rules (ships, tech, faction, ...)
   │       ├── protocol/     ─ WebSocket message types
   │       └── types/        ─ Vec3, branded IDs, value types
   ├── src-tauri/            ─ Tauri desktop shell (Rust + .conf.json + icons)
   ├── tools/                ─ build-asset-manifest.cjs + other build helpers
   ├── assets/               ─ Per-government audio + emoji manifests + sprites
   ├── capacitor.config.ts   ─ iOS/Android shell config
   ├── pnpm-workspace.yaml   ─ Workspace definition
   └── BUILD.md              ─ This file
```

---

## 🧪 Validation Discipline

```
   ╔══════════════════════════════════════════════════════════════╗
   ║   NO unit tests in this project — by design.                ║
   ║                                                              ║
   ║   Validation is:                                             ║
   ║     ✓ TypeScript strict-mode + exactOptionalPropertyTypes   ║
   ║     ✓ `tsc --noEmit` on every commit (husky pre-commit)     ║
   ║     ✓ `eslint --max-warnings 0` on every commit             ║
   ║     ✓ `prettier --write` on every commit                    ║
   ║     ✓ Manual play-verification before each phase ships       ║
   ║                                                              ║
   ║   The bar: code correctly the first time, validate through  ║
   ║   types + lint + actually playing the game.                  ║
   ╚══════════════════════════════════════════════════════════════╝
```

Husky pre-commit hooks (configured in `.husky/`) run lint-staged → ESLint + Prettier on staged files → workspace-wide `tsc --noEmit`. Commit blocks on any failure.

---

## 🐛 Troubleshooting

### `pnpm install` fails on Node 18

Upgrade to Node 20+. The Vite + Three.js toolchain requires Node 20 features.

### Tauri build fails on Linux with `webkit2gtk` missing

Install platform deps (see Desktop Build section). Different distros split webkit2gtk into different packages — Ubuntu uses `libwebkit2gtk-4.1-dev`, Fedora uses `webkit2gtk4.1-devel`, Arch uses `webkit2gtk-4.1`.

### iOS build fails with "No code signing identity"

Set `APPLE_TEAM_ID` env var + ensure provisioning profile is downloaded into Xcode. If running locally without signing cert, build for simulator only: `xcodebuild -workspace App.xcworkspace -scheme App -sdk iphonesimulator`.

### Service worker not registering in dev

Service worker registration is **skipped in dev** by design — to avoid stale-cache surprises during iteration. Test SW behavior with `pnpm build:web && pnpm preview`.

### Match desync between server + clients

Server is authoritative — clients render the server's broadcast. If they diverge, the client is dropping snapshot deltas. Check WebSocket connection state in browser devtools network tab; look for closed connections.

---

<div align="center">

_🪐 Build it. Ship it. Lie about it convincingly._

**Built with care by Unity AI Lab.**

</div>
