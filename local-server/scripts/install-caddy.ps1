# SMoL Local Self-Host - Auto-install Caddy
#
# Downloads latest Caddy Windows amd64 binary from GitHub releases,
# extracts it to C:\caddy\caddy.exe, verifies it works.
#
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File install-caddy.ps1
#
# Idempotent: safe to re-run, will overwrite existing C:\caddy\caddy.exe

$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Stop'

Write-Host "=== SMoL - Installing Caddy ===" -ForegroundColor Cyan

$rel = Invoke-RestMethod 'https://api.github.com/repos/caddyserver/caddy/releases/latest' -UseBasicParsing
$asset = $rel.assets | Where-Object { $_.name -like 'caddy_*_windows_amd64.zip' } | Select-Object -First 1
if (-not $asset) {
    throw "No windows_amd64.zip asset found in latest Caddy release."
}

Write-Host ("Latest: " + $rel.tag_name)
Write-Host ("Downloading: " + $asset.name)

$zipPath = Join-Path $env:TEMP 'caddy.zip'
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath -UseBasicParsing

New-Item -ItemType Directory -Path 'C:\caddy' -Force | Out-Null
Expand-Archive -Path $zipPath -DestinationPath 'C:\caddy' -Force
Remove-Item $zipPath -Force

$caddyExe = 'C:\caddy\caddy.exe'
if (-not (Test-Path $caddyExe)) {
    throw ("caddy.exe not found at " + $caddyExe + " after extraction.")
}

Write-Host "Verifying install..."
& $caddyExe version

Write-Host "=== Caddy installed at C:\caddy\caddy.exe ===" -ForegroundColor Green
