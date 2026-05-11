#!/usr/bin/env bash
# SMoL local self-host launcher (Linux) — starts 4 background processes, one per service.
# Matches the windows/start-smol.bat behavior on Linux hosts.
#
# Process 1: Vite dev server   (http://localhost:5173)
# Process 2: SMoL Server       (Colyseus ws://localhost:2567 + auth http://localhost:2568)
# Process 3: Caddy reverse proxy (http://localhost:8080)
# Process 4: Cloudflared tunnel  (smol.unityailab.com -> Caddy)
#
# Each process runs with nohup + & — survives shell logout. PIDs are written
# to local-server/pids/*.pid so stop-smol.sh can shut them down cleanly.
# Logs go to local-server/logs/*.log.
#
# Restart-safe: kills any prior processes via PID file or port-lookup (lsof/fuser).

set -uo pipefail

# Resolve project root — this script lives in `linux/`, so climb one dir up.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

PID_DIR="$ROOT/local-server/pids"
LOG_DIR="$ROOT/local-server/logs"
mkdir -p "$PID_DIR" "$LOG_DIR"

echo ""
echo "=== STOPPING any existing SMoL processes ==="
echo ""

# --- Kill processes from prior run via PID files ---
for service in vite server caddy cloudflared; do
  pidfile="$PID_DIR/$service.pid"
  if [[ -f "$pidfile" ]]; then
    pid="$(cat "$pidfile" 2>/dev/null || true)"
    if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
      echo "Killing $service PID $pid"
      kill "$pid" 2>/dev/null || true
      sleep 0.3
      kill -9 "$pid" 2>/dev/null || true
    fi
    rm -f "$pidfile"
  fi
done

# --- Kill anything listening on our 4 ports (catches orphan node processes) ---
for port in 5173 2567 2568 8080; do
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  elif command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
    if [[ -n "$pids" ]]; then
      echo "Killing port $port PIDs: $pids"
      echo "$pids" | xargs -r kill -9 2>/dev/null || true
    fi
  fi
done

# --- Kill orphan caddy + cloudflared binaries ---
pkill -f '^caddy' 2>/dev/null || true
pkill -f '^cloudflared' 2>/dev/null || true

echo ""
echo "=== Cleanup done. Starting fresh stack... ==="
echo ""

# --- Verify pnpm is available ---
if ! command -v pnpm >/dev/null 2>&1; then
  if command -v corepack >/dev/null 2>&1; then
    PNPM_CMD="corepack pnpm"
  else
    echo "ERROR: pnpm + corepack not found. Install Node 20+ with corepack enabled." >&2
    exit 1
  fi
else
  PNPM_CMD="pnpm"
fi

# --- Process 1: Vite dev server ---
echo "[1/4] Starting Vite dev server (port 5173)..."
nohup bash -c "cd '$ROOT/client' && $PNPM_CMD dev" \
  > "$LOG_DIR/vite.log" 2>&1 &
echo $! > "$PID_DIR/vite.pid"
echo "       PID $(cat "$PID_DIR/vite.pid") — log: $LOG_DIR/vite.log"

# --- Process 2: SMoL server (Colyseus + auth HTTP) ---
echo "[2/4] Starting SMoL server (Colyseus 2567 + auth HTTP 2568)..."
nohup bash -c "cd '$ROOT/server' && $PNPM_CMD dev" \
  > "$LOG_DIR/server.log" 2>&1 &
echo $! > "$PID_DIR/server.pid"
echo "       PID $(cat "$PID_DIR/server.pid") — log: $LOG_DIR/server.log"

# --- Process 3: Caddy reverse proxy ---
# Expects `caddy` on PATH (install: https://caddyserver.com/docs/install).
echo "[3/4] Starting Caddy reverse proxy (port 8080)..."
if command -v caddy >/dev/null 2>&1; then
  nohup caddy run --config "$ROOT/local-server/Caddyfile" \
    > "$LOG_DIR/caddy.log" 2>&1 &
  echo $! > "$PID_DIR/caddy.pid"
  echo "       PID $(cat "$PID_DIR/caddy.pid") — log: $LOG_DIR/caddy.log"
else
  echo "       WARN: caddy binary not on PATH — skipping. Install: https://caddyserver.com/docs/install"
fi

# --- Process 4: Cloudflared tunnel ---
# Expects `cloudflared` on PATH (install: https://pkg.cloudflare.com).
echo "[4/4] Starting Cloudflared tunnel smol-alpha..."
if command -v cloudflared >/dev/null 2>&1; then
  nohup cloudflared tunnel run smol-alpha \
    > "$LOG_DIR/cloudflared.log" 2>&1 &
  echo $! > "$PID_DIR/cloudflared.pid"
  echo "       PID $(cat "$PID_DIR/cloudflared.pid") — log: $LOG_DIR/cloudflared.log"
else
  echo "       WARN: cloudflared binary not on PATH — skipping. Install: https://pkg.cloudflare.com"
fi

echo ""
echo "=== All processes launched in the background ==="
echo ""
echo "  Local dev:    http://localhost:5173"
echo "  SMoL server:  ws://localhost:2567 (Colyseus) + http://localhost:2568 (auth API)"
echo "  Caddy proxy:  http://localhost:8080"
echo "  Public URL:   https://smol.unityailab.com"
echo ""
echo "Logs:   $LOG_DIR/"
echo "PIDs:   $PID_DIR/"
echo ""
echo "To stop everything cleanly: linux/stop-smol.sh"
echo "To watch a log live:        tail -f $LOG_DIR/<service>.log"
echo ""
