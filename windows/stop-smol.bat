@echo off
REM SMoL graceful shutdown — saves active games, disconnects clients cleanly, then closes
REM all SMoL terminals (Vite, Server, Caddy, Cloudflared).
REM
REM Sequence:
REM   1. POST /api/admin/shutdown to the server — triggers Colyseus gracefullyShutdown
REM      (every active match snapshots to ./data/snapshots/ + all clients disconnect cleanly)
REM   2. Wait 3 seconds for server to drain
REM   3. Hard-kill any remaining SMoL processes (Vite, Caddy, Cloudflared, orphan node)

REM Resolve project root — this script lives in `windows/`, so climb one dir up.
set ROOT=%~dp0..
cd /d "%ROOT%"

echo.
echo === SMoL graceful shutdown ===
echo.

REM --- 1. Hit the shutdown endpoint (server cleans itself up) ---
echo Sending shutdown request to server on http://localhost:2568/api/admin/shutdown ...
powershell -NoProfile -Command ^
  "try { $r = Invoke-WebRequest -Uri 'http://localhost:2568/api/admin/shutdown' -Method POST -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; Write-Host ('Server response: ' + $r.Content) -ForegroundColor Green } catch { Write-Host ('Server did not respond (probably already down): ' + $_.Exception.Message) -ForegroundColor Yellow }"

REM --- 2. Wait for server to drain (save snapshots + disconnect clients) ---
echo.
echo Waiting 3 seconds for server to drain...
timeout /t 3 /nobreak >nul

REM --- 3. Hard-kill the other terminals + any orphan processes ---
echo.
echo Closing Vite, Caddy, Cloudflared, and any remaining SMoL terminals...

REM Kill all PowerShell windows whose title starts with "SMoL"
powershell -NoProfile -Command ^
  "Get-Process powershell, pwsh -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like 'SMoL*' } | ForEach-Object { Write-Host ('Killing PowerShell window: ' + $_.MainWindowTitle); Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }"

REM Kill caddy + cloudflared
taskkill /F /IM caddy.exe >nul 2>&1
taskkill /F /IM cloudflared.exe >nul 2>&1

REM Kill anything still listening on our 4 ports (catches orphan node.exe)
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

REM Kill any orphan node.exe processes whose CommandLine references our project
powershell -NoProfile -Command ^
  "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*Starship Made of Lies*' } | ForEach-Object { Write-Host ('Killing orphan node.exe PID ' + $_.ProcessId); Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

echo.
echo === SMoL stopped. Snapshots saved to ./data/snapshots/ ===
echo.
echo Run windows\start-smol.bat to bring it back up.
echo.
pause
