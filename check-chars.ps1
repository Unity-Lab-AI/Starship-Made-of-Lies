$base = "$env:APPDATA\SpaceEngineers\IngameScripts\local"
@("UnityPad","UnityMissile","UnityBeacon","UnityInventory") | ForEach-Object {
    $f = "$base\$_\script.cs"
    if (Test-Path $f) {
        $len = (Get-Content $f -Raw).Length
        $status = if ($len -lt 100000) { "[OK]" } else { "[OVER!]" }
        Write-Host "$_`: $len / 100000 $status"
    }
}
