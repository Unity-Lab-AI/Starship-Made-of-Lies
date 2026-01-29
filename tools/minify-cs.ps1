# Unity Missile System - C# Pre-Minifier
# Minifies C# source code before MDK processing for smaller deployed scripts
#
# Transformations:
# - Removes single-line comments (//)
# - Removes multi-line comments (/* */)
# - Removes blank lines
# - Trims whitespace from each line
# - Collapses braces onto same line
# - Joins statements where safe
# - Preserves string literal contents
#
# Usage:
#   $minified = Minify-CSharp -Code $sourceCode
#   OR
#   .\minify-cs.ps1 -InputFile "source.cs" -OutputFile "minified.cs"

param(
    [string]$InputFile,
    [string]$OutputFile
)

function Minify-CSharp {
    param([string]$Code)

    # Step 1: Extract and protect string literals
    # This handles: "string", @"verbatim", $"interpolated", $@"combined"
    $stringPlaceholders = @{}
    $stringIndex = 0

    # Process strings character by character to handle all cases correctly
    $result = New-Object System.Text.StringBuilder
    $i = 0
    $len = $Code.Length

    while ($i -lt $len) {
        $char = $Code[$i]
        $nextChar = if ($i + 1 -lt $len) { $Code[$i + 1] } else { $null }
        $prevChar = if ($i -gt 0) { $Code[$i - 1] } else { $null }

        # Check for string literal start
        $isVerbatim = $false
        $isInterpolated = $false
        $stringStart = $false

        if ($char -eq '"' -and $prevChar -ne '\') {
            # Check for @ or $ prefix
            $checkPos = $i - 1
            while ($checkPos -ge 0 -and $Code[$checkPos] -match '[@$]') {
                if ($Code[$checkPos] -eq '@') { $isVerbatim = $true }
                if ($Code[$checkPos] -eq '$') { $isInterpolated = $true }
                $checkPos--
            }
            $stringStart = $true
        }

        if ($stringStart) {
            # Find the prefix start position
            $prefixStart = $i
            if ($i -gt 0 -and $Code[$i-1] -eq '@') { $prefixStart = $i - 1 }
            if ($i -gt 0 -and $Code[$i-1] -eq '$') { $prefixStart = $i - 1 }
            if ($i -gt 1 -and $Code[$i-2] -match '[@$]' -and $Code[$i-1] -match '[@$]') { $prefixStart = $i - 2 }

            # Extract the full string including prefix
            $stringContent = New-Object System.Text.StringBuilder
            for ($j = $prefixStart; $j -lt $i; $j++) {
                [void]$stringContent.Append($Code[$j])
            }
            [void]$stringContent.Append('"')
            $i++

            # Find the end of the string
            while ($i -lt $len) {
                $c = $Code[$i]
                [void]$stringContent.Append($c)

                if ($c -eq '"') {
                    if ($isVerbatim) {
                        # In verbatim strings, "" is an escaped quote
                        if ($i + 1 -lt $len -and $Code[$i + 1] -eq '"') {
                            $i++
                            [void]$stringContent.Append('"')
                        } else {
                            break
                        }
                    } else {
                        # In regular strings, \" is an escaped quote
                        if ($i -gt 0 -and $Code[$i - 1] -ne '\') {
                            break
                        }
                    }
                }
                $i++
            }

            # Store the string and add placeholder
            $placeholder = "___MSTR${stringIndex}___"
            $stringPlaceholders[$placeholder] = $stringContent.ToString()
            $stringIndex++

            # Remove any prefix chars we already added to result
            $resultStr = $result.ToString()
            $trimCount = $i - $prefixStart - $stringContent.Length + 1
            if ($prefixStart -lt $i) {
                $charsToRemove = $i - $prefixStart - $stringContent.Length
                if ($result.Length -gt 0) {
                    # Check if we need to remove @ or $ prefix from result
                    $endPos = $result.Length
                    while ($endPos -gt 0 -and $result[$endPos - 1] -match '[@$]') {
                        $endPos--
                    }
                    if ($endPos -lt $result.Length) {
                        $result = New-Object System.Text.StringBuilder($result.ToString().Substring(0, $endPos))
                    }
                }
            }

            [void]$result.Append($placeholder)
            $i++
            continue
        }

        # Check for single-line comment
        if ($char -eq '/' -and $nextChar -eq '/') {
            # Skip to end of line
            while ($i -lt $len -and $Code[$i] -ne "`n" -and $Code[$i] -ne "`r") {
                $i++
            }
            continue
        }

        # Check for multi-line comment
        if ($char -eq '/' -and $nextChar -eq '*') {
            $i += 2
            while ($i -lt $len - 1) {
                if ($Code[$i] -eq '*' -and $Code[$i + 1] -eq '/') {
                    $i += 2
                    break
                }
                $i++
            }
            continue
        }

        [void]$result.Append($char)
        $i++
    }

    $code = $result.ToString()

    # Step 2: Normalize line endings
    $code = $code -replace '\r\n', "`n"
    $code = $code -replace '\r', "`n"

    # Step 3: Trim each line and remove blank lines
    $lines = $code -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
    $code = $lines -join "`n"

    # Step 4: Collapse braces
    $code = $code -replace '\n\{', '{'
    $code = $code -replace '\{\n', '{'
    $code = $code -replace '\n\}', '}'

    # Step 5: Join lines after semicolons and closing braces
    $code = $code -replace ';\n', ';'
    $code = $code -replace '\}\n', '}'

    # Step 6: Collapse multiple spaces (but not in placeholders)
    $code = $code -replace '  +', ' '

    # Step 7: Remove spaces around operators and punctuation (careful with strings)
    $code = $code -replace ' ?\{ ?', '{'
    $code = $code -replace ' ?\} ?', '}'
    $code = $code -replace ' ?\( ?', '('
    $code = $code -replace ' ?\) ?', ')'
    $code = $code -replace ' ?\[ ?', '['
    $code = $code -replace ' ?\] ?', ']'
    $code = $code -replace ' ?; ?', ';'
    $code = $code -replace ' ?, ?', ','
    $code = $code -replace ' ?\+ ?', '+'
    $code = $code -replace ' ?- ?', '-'
    $code = $code -replace ' ?\* ?', '*'
    $code = $code -replace ' ?/ ?', '/'
    $code = $code -replace ' ?= ?', '='
    $code = $code -replace ' ?< ?', '<'
    $code = $code -replace ' ?> ?', '>'
    $code = $code -replace ' ?\| ?', '|'
    $code = $code -replace ' ?& ?', '&'
    $code = $code -replace ' ?: ?', ':'
    $code = $code -replace ' ?\? ?', '?'

    # Step 8: Restore string literals
    foreach ($key in $stringPlaceholders.Keys) {
        $code = $code.Replace($key, $stringPlaceholders[$key])
    }

    return $code
}

# If run as script with parameters
if ($InputFile -and $OutputFile) {
    if (-not (Test-Path $InputFile)) {
        Write-Error "Input file not found: $InputFile"
        exit 1
    }

    $source = Get-Content $InputFile -Raw
    $minified = Minify-CSharp -Code $source
    Set-Content -Path $OutputFile -Value $minified -Encoding UTF8 -NoNewline

    $originalSize = (Get-Item $InputFile).Length
    $minifiedSize = $minified.Length
    $reduction = [math]::Round((1 - $minifiedSize / $originalSize) * 100, 1)

    Write-Host "Minified: $originalSize -> $minifiedSize chars ($reduction% reduction)"
}
