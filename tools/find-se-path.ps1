<#
.SYNOPSIS
    Finds Space Engineers installation path by scanning Steam libraries.
.DESCRIPTION
    Parses Steam's libraryfolders.vdf to find all library paths,
    then checks each for appmanifest_244850.acf (Space Engineers).
    Returns the Bin64 path if found.
#>

$ErrorActionPreference = 'SilentlyContinue'
$seAppId = "244850"

# Steam default install location
$steamPath = "${env:ProgramFiles(x86)}\Steam"
$libraryFoldersVdf = Join-Path $steamPath "steamapps\libraryfolders.vdf"

if (-not (Test-Path $libraryFoldersVdf)) {
    Write-Error "Steam not found at default location"
    exit 1
}

# Parse libraryfolders.vdf to extract library paths
$content = Get-Content $libraryFoldersVdf -Raw
$libraryPaths = @()

# Extract all "path" values using regex
$matches = [regex]::Matches($content, '"path"\s+"([^"]+)"')
foreach ($match in $matches) {
    $path = $match.Groups[1].Value -replace '\\\\', '\'
    $libraryPaths += $path
}

# Check each library for Space Engineers appmanifest
foreach ($libPath in $libraryPaths) {
    $manifestPath = Join-Path $libPath "steamapps\appmanifest_$seAppId.acf"
    if (Test-Path $manifestPath) {
        # Found SE - construct Bin64 path
        $seBin64 = Join-Path $libPath "steamapps\common\SpaceEngineers\Bin64"
        if (Test-Path $seBin64) {
            Write-Output $seBin64
            exit 0
        }
    }
}

Write-Error "Space Engineers not found in any Steam library"
exit 1
