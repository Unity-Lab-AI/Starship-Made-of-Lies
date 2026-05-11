@echo off
REM SMoL Local Self-Host — Install Caddy + Cloudflared as Windows Services
REM
REM Prerequisites:
REM   1. Caddy installed at C:\caddy\caddy.exe (or update CADDY_EXE below)
REM   2. cloudflared installed at C:\Program Files (x86)\cloudflared\cloudflared.exe
REM   3. NSSM installed and on PATH (https://nssm.cc/download)
REM   4. Cloudflare Tunnel created + config.yml in place at %USERPROFILE%\.cloudflared\
REM   5. Run this script as Administrator
REM
REM After install, services auto-start on Windows boot.
REM Stop/start manually:  sc stop smol-caddy  /  sc start smol-caddy
REM                       sc stop smol-cloudflared  /  sc start smol-cloudflared

setlocal

set CADDY_EXE=C:\caddy\caddy.exe
set CADDYFILE=%~dp0..\Caddyfile
set CLOUDFLARED_EXE=C:\Program Files (x86)\cloudflared\cloudflared.exe

echo.
echo === SMoL Local Self-Host — Installing Windows Services ===
echo.

REM Verify NSSM is available
where nssm >nul 2>&1
if %ERRORLEVEL% neq 0 (
	echo ERROR: NSSM not found on PATH. Install from https://nssm.cc/download and add to PATH.
	exit /b 1
)

REM Verify Caddy exists
if not exist "%CADDY_EXE%" (
	echo ERROR: Caddy not found at %CADDY_EXE%
	echo Download from https://caddyserver.com/download and place at C:\caddy\caddy.exe
	exit /b 1
)

REM Verify Caddyfile exists
if not exist "%CADDYFILE%" (
	echo ERROR: Caddyfile not found at %CADDYFILE%
	exit /b 1
)

REM Verify cloudflared exists (Cloudflare's installer puts it in Program Files (x86))
if not exist "%CLOUDFLARED_EXE%" (
	echo WARN: cloudflared not found at %CLOUDFLARED_EXE%
	echo Skipping cloudflared service install. Install Cloudflare Tunnel first.
	set SKIP_CLOUDFLARED=1
)

REM Install Caddy as a Windows Service
echo.
echo Installing smol-caddy service...
nssm install smol-caddy "%CADDY_EXE%" run --config "%CADDYFILE%" --adapter caddyfile
nssm set smol-caddy AppDirectory "%~dp0.."
nssm set smol-caddy DisplayName "SMoL — Caddy Reverse Proxy"
nssm set smol-caddy Description "Serves SMoL alpha web build + reverse-proxies WebSocket and API to local Node.js processes"
nssm set smol-caddy Start SERVICE_AUTO_START
nssm set smol-caddy AppStdout "%~dp0..\logs\caddy-stdout.log"
nssm set smol-caddy AppStderr "%~dp0..\logs\caddy-stderr.log"

if not "%SKIP_CLOUDFLARED%"=="1" (
	echo.
	echo Installing smol-cloudflared service...
	REM Note: cloudflared has its own service install that's more idiomatic — using
	REM `cloudflared service install` is preferred over wrapping with NSSM.
	REM Uncomment below if you want NSSM-managed instead:
	REM nssm install smol-cloudflared "%CLOUDFLARED_EXE%" tunnel run smol-alpha
	REM nssm set smol-cloudflared DisplayName "SMoL — Cloudflare Tunnel"
	REM nssm set smol-cloudflared Description "Public ingress tunnel for smol.unityailab.com"
	REM nssm set smol-cloudflared Start SERVICE_AUTO_START
	echo SKIPPED — run "cloudflared service install" instead (it's the official way).
)

echo.
echo === Install complete ===
echo.
echo To start services now:
echo   sc start smol-caddy
echo   cloudflared service install   (then it auto-starts)
echo.
echo To check status:
echo   sc query smol-caddy
echo.
echo To uninstall:
echo   scripts\uninstall-services.bat
echo.

endlocal
