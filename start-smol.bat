@echo off
REM SMoL local self-host launcher — opens 4 PowerShell terminals, one per process.
REM Double-click this file (or run from any shell). No args. No setup.
REM
REM Terminal 1: Vite dev server   (http://localhost:5173)
REM Terminal 2: SMoL Server       (Colyseus ws://localhost:2567 + auth http://localhost:2568)
REM Terminal 3: Caddy reverse proxy (http://localhost:8080)
REM Terminal 4: Cloudflared tunnel  (smol.unityailab.com -> Caddy)
REM
REM Restart-safe: aggressively kills any prior SMoL-titled PowerShell + processes
REM listening on 5173/2567/2568/8080 + caddy.exe + cloudflared.exe.

cd /d "%~dp0"

echo.
echo === STOPPING any existing SMoL processes + windows ===
echo.

REM --- 1. Kill all PowerShell windows whose title starts with "SMoL" ---
REM Uses Get-Process + MainWindowTitle filter (far more reliable than taskkill /FI wildcards).
REM Catches both legacy `powershell.exe` and modern `pwsh.exe` (PowerShell 7+).
powershell -NoProfile -Command ^
  "Get-Process powershell, pwsh -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like 'SMoL*' } | ForEach-Object { Write-Host ('Killing PowerShell window: ' + $_.MainWindowTitle); Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }"

REM --- 2. Kill caddy.exe + cloudflared.exe (safe — unique binary names) ---
taskkill /F /IM caddy.exe >nul 2>&1
taskkill /F /IM cloudflared.exe >nul 2>&1

REM --- 3. Kill anything listening on our 4 ports (catches orphan node.exe processes) ---
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":2567 " ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":2568 " ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080 " ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
)

REM --- 4. Kill any orphan node.exe processes whose CommandLine references our project ---
REM Catches tsx watch / vite / pnpm child processes still alive after PowerShell parent died.
powershell -NoProfile -Command ^
  "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*Starship Made of Lies*' } | ForEach-Object { Write-Host ('Killing orphan node.exe PID ' + $_.ProcessId); Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

echo.
echo === Cleanup done. Starting fresh stack... ===
echo.

REM --- Terminal 1: Vite dev server ---
start "SMoL Vite [client]" powershell -NoExit -NoProfile -Command ^
  "$Host.UI.RawUI.WindowTitle = 'SMoL Vite [client]'; cd '%~dp0client'; Write-Host 'Starting Vite dev server...' -ForegroundColor Cyan; corepack pnpm dev"

REM --- Terminal 2: SMoL server (Colyseus + auth HTTP) ---
start "SMoL Server [api+ws]" powershell -NoExit -NoProfile -Command ^
  "$Host.UI.RawUI.WindowTitle = 'SMoL Server [api+ws]'; cd '%~dp0server'; Write-Host 'Starting SMoL server (Colyseus 2567 + auth HTTP 2568)...' -ForegroundColor Green; corepack pnpm dev"

REM --- Terminal 3: Caddy reverse proxy ---
start "SMoL Caddy [proxy]" powershell -NoExit -NoProfile -Command ^
  "$Host.UI.RawUI.WindowTitle = 'SMoL Caddy [proxy]'; cd '%~dp0'; Write-Host 'Starting Caddy reverse proxy...' -ForegroundColor Yellow; & 'C:\caddy\caddy.exe' run --config 'local-server\Caddyfile'"

REM --- Terminal 4: Cloudflared tunnel ---
start "SMoL Cloudflared [tunnel]" powershell -NoExit -NoProfile -Command ^
  "$Host.UI.RawUI.WindowTitle = 'SMoL Cloudflared [tunnel]'; cd '%~dp0'; Write-Host 'Starting Cloudflared tunnel smol-alpha...' -ForegroundColor Magenta; & 'C:\Program Files (x86)\cloudflared\cloudflared.exe' tunnel run smol-alpha"

echo.
echo === All 4 terminals launched ===
echo.
echo   Local dev:    http://localhost:5173
echo   SMoL server:  ws://localhost:2567 (Colyseus) + http://localhost:2568 (auth API)
echo   Caddy proxy:  http://localhost:8080
echo   Public URL:   https://smol.unityailab.com
echo.
echo To stop everything: close each PowerShell window (or just re-run this launcher).
echo.
pause
