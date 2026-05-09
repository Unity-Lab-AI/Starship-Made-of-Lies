# Starship Made of Lies - NuGet Package Updater
# Updates all MDK2 packages to latest versions before building
# Run this periodically or before builds to stay current
$ErrorActionPreference = "Continue"

$toolsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $toolsDir
$scriptsDir = Join-Path $root "src\scripts"
$modsDir = Join-Path $root "src\mods"

Write-Host "`n=== Starship Made of Lies Package Updater ===" -ForegroundColor Yellow

# MDK2 packages for PB scripts
# Note: Mal.Mdk2.References uses MSBuild imports and can't be updated via 'dotnet add'
#       It must be updated manually in csproj files if needed
$mdkPackages = @(
    "Mal.Mdk2.PbAnalyzers",
    "Mal.Mdk2.PbPackager"
)

# PB script projects
$pbProjects = @(
    "Unity Boot",
    "UnityPad",
    "UnityMissile",
    "UnityInventory",
    "UnityBeacon",
    "UnitySignal",
    "UnityNuke"
)

# Mod packages
$modPackages = @(
    "Lib.Harmony"
)

# Mod projects
$modProjects = @(
    "UMS Mod"
)

$updatedCount = 0
$failedCount = 0

Write-Host "`nUpdating MDK2 packages for PB scripts..." -ForegroundColor Cyan
Write-Host "(Mal.Mdk2.References must be updated manually in csproj if needed)" -ForegroundColor DarkGray

foreach ($project in $pbProjects) {
    $projectPath = Join-Path $scriptsDir $project
    if (Test-Path $projectPath) {
        Write-Host "`n  $project" -ForegroundColor White
        foreach ($package in $mdkPackages) {
            Write-Host "    -> $package" -ForegroundColor Gray -NoNewline
            $output = & dotnet add "$projectPath" package $package 2>&1
            if ($LASTEXITCODE -eq 0) {
                # Check if version changed
                if ($output -match "version '([^']+)'") {
                    Write-Host " v$($Matches[1])" -ForegroundColor Green
                } else {
                    Write-Host " OK" -ForegroundColor Green
                }
                $updatedCount++
            } else {
                Write-Host " FAILED" -ForegroundColor Red
                $failedCount++
            }
        }
    } else {
        Write-Host "  $project - NOT FOUND" -ForegroundColor Red
    }
}

Write-Host "`nUpdating packages for mods..." -ForegroundColor Cyan

foreach ($project in $modProjects) {
    $projectPath = Join-Path $modsDir $project
    if (Test-Path $projectPath) {
        Write-Host "`n  $project" -ForegroundColor White
        foreach ($package in $modPackages) {
            Write-Host "    -> $package" -ForegroundColor Gray -NoNewline
            $output = & dotnet add "$projectPath" package $package 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host " OK" -ForegroundColor Green
                $updatedCount++
            } else {
                Write-Host " FAILED" -ForegroundColor Red
                $failedCount++
            }
        }
    } else {
        Write-Host "  $project - NOT FOUND" -ForegroundColor Red
    }
}

Write-Host "`n---" -ForegroundColor Gray
Write-Host "Updated: $updatedCount packages" -ForegroundColor Green
if ($failedCount -gt 0) {
    Write-Host "Failed: $failedCount packages" -ForegroundColor Red
}
Write-Host ""
