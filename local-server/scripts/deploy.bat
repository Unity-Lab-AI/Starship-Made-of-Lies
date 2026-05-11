@echo off
REM SMoL Local Self-Host — Rebuild + Reload
REM
REM Run from any directory. Rebuilds the web bundle + asset manifest + signals
REM Caddy to reload its config (so any Caddyfile changes pick up too).

setlocal

set REPO_ROOT=%~dp0..\..

echo.
echo === SMoL — Rebuilding web bundle ===
pushd "%REPO_ROOT%"
call npx pnpm build:web
if %ERRORLEVEL% neq 0 (
	echo BUILD FAILED — Caddy still serving previous bundle.
	popd
	exit /b 1
)

echo.
echo === Generating asset manifest ===
node tools/build-asset-manifest.cjs
popd

echo.
echo === Reloading Caddy ===
where caddy >nul 2>&1
if %ERRORLEVEL% equ 0 (
	caddy reload --config "%~dp0..\Caddyfile" --adapter caddyfile
) else (
	echo Caddy not on PATH — restart the smol-caddy service manually:
	echo   sc stop smol-caddy ^&^& sc start smol-caddy
)

echo.
echo === Deploy complete ===
echo Live URL: https://smol.unityailab.com
echo.

endlocal
