# Unity Missile System - Script Wrapper for MDK2
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
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
    $rawPath = Join-Path $root $RawFile
    $projectPath = Join-Path $root $ProjectFolder
    $programPath = Join-Path $projectPath "Program.cs"
    if (-not (Test-Path $rawPath)) {Write-Host "ERROR: $rawPath not found" -ForegroundColor Red;return $false}
    Write-Host "Wrapping $Name..." -ForegroundColor Cyan
    $rawContent = Get-Content $rawPath -Raw
    $indentedContent = $rawContent -split "`n" | ForEach-Object { "        $_" }
    $indentedContent = $indentedContent -join "`n"
    $fullScript = $mdkHeader + $indentedContent + "`n" + $mdkFooter
    Set-Content -Path $programPath -Value $fullScript -Encoding UTF8
    Write-Host "  -> $programPath ($($fullScript.Length) chars)" -ForegroundColor Green
    return $true
}

Write-Host "`n=== Unity Missile System Wrapper ===" -ForegroundColor Yellow

# Wrap all scripts first
$success = $true
$success = $success -and (Wrap-Script -Name "UnityPad" -RawFile "UnityPad.cs" -ProjectFolder "UnityPad")
$success = $success -and (Wrap-Script -Name "UnityMissile" -RawFile "UnityMissile.cs" -ProjectFolder "UnityMissile")
$success = $success -and (Wrap-Script -Name "UnityBeacon" -RawFile "UnityBeacon.cs" -ProjectFolder "UnityBeacon")
$success = $success -and (Wrap-Script -Name "UnityInventory" -RawFile "UnityInventory.cs" -ProjectFolder "UnityInventory")
if (-not $success) {Write-Host "WRAP FAILED" -ForegroundColor Red;exit 1}

Write-Host "`nWrapping complete." -ForegroundColor Yellow
Write-Host ""
Write-Host "!!! CRITICAL: BUILD SCRIPTS ONE AT A TIME !!!" -ForegroundColor Red
Write-Host "!!! NEVER BUILD MULTIPLE SCRIPTS TOGETHER !!!" -ForegroundColor Red
Write-Host ""
Write-Host "Build ONLY the script you modified:" -ForegroundColor Yellow
Write-Host "  dotnet build UnityPad -c Debug" -ForegroundColor White
Write-Host "  dotnet build UnityMissile -c Debug" -ForegroundColor White
Write-Host "  dotnet build UnityBeacon -c Debug" -ForegroundColor White
Write-Host "  dotnet build UnityInventory -c Debug" -ForegroundColor White
Write-Host ""
Write-Host "DO NOT chain builds. DO NOT build all at once." -ForegroundColor Red
Write-Host ""
