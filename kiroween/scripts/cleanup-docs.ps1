# Documentation Cleanup Script
# Removes redundant documentation files from the Kiroween project
# Usage: .\scripts\cleanup-docs.ps1 [-DryRun] [-LogFile <path>]

param(
    [switch]$DryRun = $false,
    [string]$LogFile = "cleanup-log.txt"
)

# Patterns to match for removal
$patterns = @(
    "*_COMPLETE.md",
    "*_IMPLEMENTATION.md",
    "*_VERIFICATION.md",
    "*_SUMMARY.md",
    "*Demo.md",
    "*.demo.tsx",
    "*.demo.html"
)

# Directories to search
$searchPath = "src"

# Files/directories to preserve
$preservePatterns = @(
    "README.md",
    ".kiro/specs/"
)

# Initialize counters
$totalFound = 0
$totalRemoved = 0
$errors = @()

# Start logging
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$logHeader = @"
===========================================
Documentation Cleanup Script
Started: $timestamp
Mode: $(if ($DryRun) { "DRY RUN" } else { "LIVE" })
===========================================

"@

Write-Host $logHeader -ForegroundColor Cyan
Add-Content -Path $LogFile -Value $logHeader

# Function to check if file should be preserved
function Should-Preserve {
    param([string]$filePath)
    
    foreach ($pattern in $preservePatterns) {
        if ($filePath -like "*$pattern*") {
            return $true
        }
    }
    return $false
}

# Find and process files
Write-Host "`nSearching for files to remove..." -ForegroundColor Yellow

foreach ($pattern in $patterns) {
    Write-Host "`nPattern: $pattern" -ForegroundColor Cyan
    
    $files = Get-ChildItem -Path $searchPath -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        $totalFound++
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
        
        # Check if file should be preserved
        if (Should-Preserve $relativePath) {
            $message = "PRESERVED: $relativePath"
            Write-Host $message -ForegroundColor Green
            Add-Content -Path $LogFile -Value $message
            continue
        }
        
        if ($DryRun) {
            $message = "WOULD REMOVE: $relativePath"
            Write-Host $message -ForegroundColor Yellow
            Add-Content -Path $LogFile -Value $message
        } else {
            try {
                Remove-Item -Path $file.FullName -Force
                $totalRemoved++
                $message = "REMOVED: $relativePath"
                Write-Host $message -ForegroundColor Red
                Add-Content -Path $LogFile -Value $message
            } catch {
                $errorMsg = "ERROR removing $relativePath : $_"
                Write-Host $errorMsg -ForegroundColor Red
                Add-Content -Path $LogFile -Value $errorMsg
                $errors += $errorMsg
            }
        }
    }
}

# Summary
$summary = @"

===========================================
SUMMARY
===========================================
Total files found: $totalFound
$(if ($DryRun) { "Files that would be removed: $totalFound" } else { "Files removed: $totalRemoved" })
Errors: $($errors.Count)
===========================================

"@

Write-Host $summary -ForegroundColor Cyan
Add-Content -Path $LogFile -Value $summary

if ($errors.Count -gt 0) {
    Write-Host "Errors encountered:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  $error" -ForegroundColor Red
    }
}

if ($DryRun) {
    Write-Host "`nThis was a DRY RUN. No files were actually removed." -ForegroundColor Yellow
    Write-Host "Run without -DryRun flag to perform actual cleanup." -ForegroundColor Yellow
} else {
    Write-Host "`nCleanup complete! Check $LogFile for details." -ForegroundColor Green
}
