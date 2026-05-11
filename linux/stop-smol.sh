#!/usr/bin/env bash
# SMoL graceful shutdown (Linux) — saves active games, disconnects clients
# cleanly, then stops the 4 background services.
#
# Sequence:
#   1. POST /api/admin/shutdown to the server — triggers Colyseus gracefullyShutdown
#      (every active match snapshots to ./data/snapshots/ + all clients disconnect cleanly)
#   2. Wait 3 seconds for the server to drain
#   3. Hard-kill any remaining SMoL processes (Vite, Caddy, Cloudflared, orphan node)
#
# Mirrors windows/stop-smol.bat behavior on Linux hosts.

set -uo pipefail

# Resolve project root — this script lives in `linux/`, so climb one dir up.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

PID_DIR="$ROOT/local-server/pids"

echo ""
echo "=== SMoL graceful shutdown ==="
echo ""

# --- 1. Hit the shutdown endpoint (server cleans itself up) ---
echo "Sending shutdown request to server on http://localhost:2568/api/admin/shutdown ..."
if command -v curl >/dev/null 2>&1; then
  if curl -fsS -X POST -m 5 http://localhost:2568/api/admin/shutdown 2>/dev/null; then
    echo " — server acknowledged"
  else
    echo " — server did not respond (probably already down)"
  fi
elif command -v wget >/dev/null 2>&1; then
  wget -qO- --post-data='' --timeout=5 http://localhost:2568/api/admin/shutdown 2>/dev/null \
    && echo " — server acknowledged" \
    || echo " — server did not respond (probably already down)"
else
  echo " — neither curl nor wget available, skipping graceful shutdown signal"
fi

# --- 2. Wait for server to drain (save snapshots + disconnect clients) ---
echo ""
echo "Waiting 3 seconds for server to drain..."
sleep 3

# --- 3. Hard-kill remaining processes ---
echo ""
echo "Closing Vite, Caddy, Cloudflared, and any remaining SMoL processes..."

# Stop by PID file (preferred — matches what start-smol.sh tracked)
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

# Fallback — kill anything still listening on our 4 ports (catches orphans)
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

# Catch orphan caddy + cloudflared binaries
pkill -f '^caddy' 2>/dev/null || true
pkill -f '^cloudflared' 2>/dev/null || true

# Catch orphan node processes whose CWD references this project
if command -v pgrep >/dev/null 2>&1; then
  # Match node processes where the command-line / cwd mentions this project root
  for nodepid in $(pgrep -f 'node' 2>/dev/null || true); do
    cwd_link="/proc/$nodepid/cwd"
    if [[ -L "$cwd_link" ]]; then
      cwd="$(readlink -f "$cwd_link" 2>/dev/null || true)"
      if [[ -n "$cwd" && "$cwd" == "$ROOT"* ]]; then
        echo "Killing orphan node PID $nodepid (cwd: $cwd)"
        kill -9 "$nodepid" 2>/dev/null || true
      fi
    fi
  done
fi

echo ""
echo "=== SMoL stopped. Snapshots saved to $ROOT/data/snapshots/ ==="
echo ""
echo "Run linux/start-smol.sh to bring it back up."
echo ""
