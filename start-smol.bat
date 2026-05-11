@echo off
REM SMoL local self-host launcher — opens 3 PowerShell terminals, one per process.
REM Double-click this file (or run from any shell). No args. No setup.
REM
REM Terminal 1: Vite dev server  (http://localhost:5173)
REM Terminal 2: Caddy reverse proxy  (http://localhost:8080)
REM Terminal 3: Cloudflared tunnel   (smol.unityailab.com -> Caddy)
REM
REM Restart-safe: kills any existing caddy/cloudflared/vite instances first.
REM Close any terminal to stop that process. Close all three to stop everything.

cd /d "%~dp0"

echo Stopping any existing SMoL processes and windows...

REM Kill caddy.exe (safe — only Caddy uses this binary name)
taskkill /F /IM caddy.exe >nul 2>&1

REM Kill cloudflared.exe (safe — only Cloudflare tunnel uses this binary name)
taskkill /F /IM cloudflared.exe >nul 2>&1

REM Kill anything listening on Vite port 5173 (avoids killing unrelated node.exe processes)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
)

REM Kill anything listening on Colyseus port 2567
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":2567 " ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
)

REM Kill anything listening on auth HTTP server port 2568
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":2568 " ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
)

REM Close any old SMoL PowerShell windows (matched by window title prefix)
taskkill /F /FI "WINDOWTITLE eq SMoL Vite*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq SMoL Server*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq SMoL Caddy*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq SMoL Cloudflared*" >nul 2>&1

echo Stopped. Starting fresh stack...
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
echo All four terminals launched.
echo.
echo   Local dev:    http://localhost:5173
echo   SMoL server:  ws://localhost:2567 (Colyseus) + http://localhost:2568 (auth API)
echo   Caddy proxy:  http://localhost:8080
echo   Public URL:   https://smol.unityailab.com
echo.
echo To stop: close each PowerShell window (or Ctrl+C inside it).
echo.
pause
