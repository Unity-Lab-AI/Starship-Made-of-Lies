# SMoL Local Self-Host

Scaffolding for hosting the SMoL alpha on Gee's local Windows PC.

**Public URL:** `https://smol.unityailab.com` (subdomain of `unityailab.com`)
**Stack:** Cloudflare Tunnel (public ingress) → Caddy (reverse proxy on `:8080`) → Vite static bundle / Colyseus WS / Node.js API.

## What's in here

| File                                  | Purpose                                                                |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `Caddyfile`                           | Caddy config — routes `/ws*` `/api/*` and serves Vite bundle           |
| `cloudflared/config.yml.template`     | Cloudflare Tunnel config — copy to `~/.cloudflared/config.yml`         |
| `scripts/install-services.bat`        | NSSM-based Windows Service installer (run as admin)                    |
| `scripts/uninstall-services.bat`      | Service uninstaller (run as admin)                                     |
| `scripts/deploy.bat`                  | Rebuild bundle + reload Caddy (hot-deploy)                             |

## First-time setup

### 1. Cloudflare prerequisites

- `unityailab.com` must be on Cloudflare's nameservers. Check at https://dash.cloudflare.com → Websites. Free plan is fine.
- DNS propagation 5-30 min after switching nameservers at your registrar.

### 2. Install Cloudflare Tunnel (cloudflared)

Download `cloudflared-windows-amd64.exe` from https://github.com/cloudflare/cloudflared/releases and rename to `cloudflared.exe`. Place at `C:\Program Files (x86)\cloudflared\cloudflared.exe` (or update path in scripts).

```powershell
cloudflared tunnel login
cloudflared tunnel create smol-alpha
```

The `create` command prints a tunnel UUID and writes credentials to `%USERPROFILE%\.cloudflared\<uuid>.json`.

Copy `cloudflared/config.yml.template` to `%USERPROFILE%\.cloudflared\config.yml` and replace `<TUNNEL_UUID>` with the UUID Cloudflare gave you.

```powershell
cloudflared tunnel route dns smol-alpha smol.unityailab.com
cloudflared tunnel run smol-alpha
```

If `https://smol.unityailab.com` returns a 502 (because Caddy isn't running yet), that's expected — proceed to Caddy setup.

### 3. Install Caddy

Download Windows binary from https://caddyserver.com/download (architecture: `amd64`, plugin set: empty/default). Place at `C:\caddy\caddy.exe`.

Test:

```powershell
cd "C:\Users\gfour\Desktop\Starship Made of Lies\local-server"
C:\caddy\caddy.exe run --config Caddyfile --adapter caddyfile
```

You should see Caddy listening on `:8080`. Tunnel ↔ Caddy ↔ Vite-bundle should all resolve at this point.

### 4. Build the web bundle

From repo root:

```powershell
pnpm build:web
```

Output lands in `client/dist/` — Caddy serves from there per the `Caddyfile`.

### 5. Test from another network

Open `https://smol.unityailab.com` from a phone on cellular (NOT your home WiFi — that bypasses Cloudflare and proves nothing).

Expected: SMoL landing page renders, no cert warnings, no 502s.

### 6. Install as Windows Services

Install NSSM from https://nssm.cc/download and add to PATH.

```powershell
# As Administrator:
cd "C:\Users\gfour\Desktop\Starship Made of Lies\local-server\scripts"
install-services.bat

# Cloudflared has its own service installer (recommended over NSSM):
cloudflared service install
```

After this, Caddy + Cloudflared start automatically on Windows boot.

## Day-to-day

### Deploy a code change

From repo root or the scripts dir:

```powershell
pnpm deploy:local
# or
local-server\scripts\deploy.bat
```

This rebuilds the bundle + regenerates the asset manifest + signals Caddy to reload. Players see the new build on next page-load.

### Maintenance window (planned downtime)

Per user directive *"down only for maintence with no warning saves all current games to host autosaves"* — the Node.js server (PHASE 11+14 #3 wire-up) implements a graceful-shutdown handler that snapshots all active matches before exit. Stop services in this order:

```powershell
sc stop smol-node-server   # waits for graceful snapshot capture
sc stop smol-cloudflared
sc stop smol-caddy
```

After maintenance, start in reverse:

```powershell
sc start smol-caddy
sc start smol-cloudflared
sc start smol-node-server   # boots, reads snapshots, resumes matches
```

### Logs

Caddy logs land at `local-server/logs/caddy-stdout.log` + `caddy-stderr.log`.

Cloudflared logs via Windows Event Viewer (under "Cloudflare Tunnel") OR `cloudflared.log` in `%PROGRAMDATA%\cloudflared\`.

## Open hooks for future work

- **PHASE 11+14 #3 wire-up** — Postgres install + schema migrations + AccountStore/etc impls + graceful-shutdown handler. Adds Node.js server on `:3001` for `/api/*` routes (auth + telemetry).
- **PHASE 4 audio CDN (#10)** — once real `.ogg` recordings land, they get served through this same Caddy install (no separate CDN needed during alpha; bandwidth-bottleneck accepted per user directive).
- **Backups (#blocker entry)** — DEFERRED per *"4 deffered"*. Add `pg_dump` cron / off-site replication when user signals.

## Troubleshooting

| Symptom                                 | Diagnose                                                              |
| --------------------------------------- | --------------------------------------------------------------------- |
| 502 Bad Gateway                         | Caddy not running — `sc query smol-caddy` / restart it                |
| 521/522 Cloudflare error                | Cloudflared not running OR tunnel config wrong UUID                   |
| Cert warning                            | DNS still propagating — wait or check Cloudflare → SSL/TLS → Full     |
| WS connect fails                        | Cloudflare's WS handling — try ws.smol.unityailab.com subdomain split |
| Service won't start                     | Check `local-server/logs/caddy-stderr.log` for actual error           |
| Page loads but JS crashes               | Check browser console — likely missing chunk / asset-manifest miss    |

## Costs

- Domain: `unityailab.com` (already owned)
- Cloudflare: free tier (Tunnel + DNS + DDoS)
- Caddy: free
- NSSM: free
- Local PC power: ¯\\\_(ツ)\_/¯

Bandwidth-bottleneck accepted per user directive *"its fine for bottleneck during testing"* — no CDN escalation during alpha.
