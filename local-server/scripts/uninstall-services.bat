@echo off
REM SMoL Local Self-Host — Uninstall Windows Services
REM
REM Run as Administrator.

setlocal

echo.
echo === SMoL Local Self-Host — Uninstalling Windows Services ===
echo.

sc stop smol-caddy 2>nul
nssm remove smol-caddy confirm 2>nul

REM Cloudflared installed via `cloudflared service install` is uninstalled via:
echo To uninstall the cloudflared service, run:
echo   cloudflared service uninstall
echo.

echo === Uninstall complete ===
echo.

endlocal
