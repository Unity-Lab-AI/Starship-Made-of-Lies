# Starship Made of Lies - Script Wrapper for MDK2
# Usage:
#   tools/wrap-scripts.ps1                - Wrap only
#   tools/wrap-scripts.ps1 -Minify        - Wrap with pre-minification
#   tools/wrap-scripts.ps1 -Update        - Update packages first, then wrap
#   tools/wrap-scripts.ps1 -Update -Minify - Update + wrap + pre-minify
param(
    [switch]$Update,
    [switch]$Minify
)

$ErrorActionPreference = "Stop"
# Script is in tools/, so go up one level to get project root, then into src/scripts
$toolsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $toolsDir
$scriptsDir = Join-Path $root "src\scripts"

# Load the minifier if -Minify flag is set
if ($Minify) {
    $minifierPath = Join-Path $toolsDir "minify-cs.ps1"
    if (Test-Path $minifierPath) {
        . $minifierPath
        Write-Host "Pre-minification ENABLED" -ForegroundColor Magenta
    } else {
        Write-Host "WARNING: minify-cs.ps1 not found, disabling pre-minification" -ForegroundColor Yellow
        $Minify = $false
    }
}

# Update packages if requested
if ($Update) {
    $updateScript = Join-Path $toolsDir "update-packages.ps1"
    if (Test-Path $updateScript) {
        & $updateScript
    } else {
        Write-Host "WARNING: update-packages.ps1 not found" -ForegroundColor Yellow
    }
}

$mdkHeader = @"
using Sandbox.Game.EntityComponents;
using Sandbox.ModAPI.Ingame;
using Sandbox.ModAPI.Interfaces;
using SpaceEngineers.Game.ModAPI.Ingame;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;
using VRage;
using VRage.Collections;
using VRage.Game;
using VRage.Game.Components;
using VRage.Game.GUI.TextPanel;
using VRage.Game.ModAPI.Ingame;
using VRage.Game.ModAPI.Ingame.Utilities;
using VRage.Game.ObjectBuilders.Definitions;
using VRageMath;

namespace IngameScript
{
    public partial class Program : MyGridProgram
    {
"@
$mdkFooter = @"
    }
}
"@

function Wrap-Script {
    param ([string]$Name,[string]$RawFile,[string]$ProjectFolder)
    $rawPath = Join-Path $scriptsDir $RawFile
    $projectPath = Join-Path $scriptsDir $ProjectFolder
    $programPath = Join-Path $projectPath "Program.cs"
    if (-not (Test-Path $rawPath)) {Write-Host "ERROR: $rawPath not found" -ForegroundColor Red;return $false}
    Write-Host "Wrapping $Name..." -ForegroundColor Cyan
    $rawContent = Get-Content $rawPath -Raw
    $originalSize = $rawContent.Length

    # Apply pre-minification if enabled
    if ($Minify) {
        $rawContent = Minify-CSharp -Code $rawContent
        $minifiedSize = $rawContent.Length
        $reduction = [math]::Round((1 - $minifiedSize / $originalSize) * 100, 1)
        Write-Host "  Pre-minified: $originalSize -> $minifiedSize chars ($reduction% reduction)" -ForegroundColor Magenta
    }

    $indentedContent = $rawContent -split "`n" | ForEach-Object { "        $_" }
    $indentedContent = $indentedContent -join "`n"
    $fullScript = $mdkHeader + $indentedContent + "`n" + $mdkFooter
    Set-Content -Path $programPath -Value $fullScript -Encoding UTF8
    Write-Host "  -> $programPath ($($fullScript.Length) chars)" -ForegroundColor Green
    return $true
}

Write-Host "`n=== Starship Made of Lies Wrapper ===" -ForegroundColor Yellow

# Wrap all scripts first
$success = $true
$success = $success -and (Wrap-Script -Name "UnityPad" -RawFile "UnityPad.cs" -ProjectFolder "UnityPad")
$success = $success -and (Wrap-Script -Name "UnityMissile" -RawFile "UnityMissile.cs" -ProjectFolder "UnityMissile")
$success = $success -and (Wrap-Script -Name "UnityBeacon" -RawFile "UnityBeacon.cs" -ProjectFolder "UnityBeacon")
$success = $success -and (Wrap-Script -Name "UnityInventory" -RawFile "UnityInventory.cs" -ProjectFolder "UnityInventory")
$success = $success -and (Wrap-Script -Name "Unity Boot" -RawFile "Unity Boot.cs" -ProjectFolder "Unity Boot")
$success = $success -and (Wrap-Script -Name "UnitySignal" -RawFile "UnitySignal.cs" -ProjectFolder "UnitySignal")
$success = $success -and (Wrap-Script -Name "UnityNuke" -RawFile "UnityNuke.cs" -ProjectFolder "UnityNuke")
if (-not $success) {Write-Host "WRAP FAILED" -ForegroundColor Red;exit 1}

Write-Host "`nWrapping complete." -ForegroundColor Yellow
Write-Host ""
Write-Host "!!! CRITICAL: BUILD SCRIPTS ONE AT A TIME !!!" -ForegroundColor Red
Write-Host "!!! NEVER BUILD MULTIPLE SCRIPTS TOGETHER !!!" -ForegroundColor Red
Write-Host ""
Write-Host "Build ONLY the script you modified:" -ForegroundColor Yellow
Write-Host "  dotnet build src/scripts/UnityPad -c Debug" -ForegroundColor White
Write-Host "  dotnet build src/scripts/UnityMissile -c Debug" -ForegroundColor White
Write-Host "  dotnet build src/scripts/UnityBeacon -c Debug" -ForegroundColor White
Write-Host "  dotnet build src/scripts/UnityInventory -c Debug" -ForegroundColor White
Write-Host "  dotnet build `"src/scripts/Unity Boot`" -c Debug" -ForegroundColor White
Write-Host "  dotnet build src/scripts/UnitySignal -c Debug" -ForegroundColor White
Write-Host "  dotnet build src/scripts/UnityNuke -c Debug" -ForegroundColor White
Write-Host ""
Write-Host "To update packages before wrapping, use: tools/wrap-scripts.ps1 -Update" -ForegroundColor DarkGray
Write-Host "To enable pre-minification, use: tools/wrap-scripts.ps1 -Minify" -ForegroundColor DarkGray
Write-Host ""
