# PowerShell script to remove duplicate API_ENDPOINTS imports

$files = Get-ChildItem -Path ".\src" -Filter "*.jsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Count how many times the import appears
    $importPattern = "import \{ API_ENDPOINTS \} from ['`"]\.\.?/config/api['`"];"
    $matches = [regex]::Matches($content, $importPattern)
    
    if ($matches.Count > 1) {
        Write-Host "Fixing: $($file.Name) - Found $($matches.Count) duplicate imports"
        
        # Remove all occurrences
        $content = $content -replace $importPattern, ""
        
        # Add single import after the first import statement
        if ($content -match "(import .+ from .+;`r?`n)") {
            $content = $content -replace "(import .+ from .+;`r?`n)", "`$1import { API_ENDPOINTS } from '../config/api';`n"
        }
        
        Set-Content -Path $file.FullName -Value $content
    }
}

Write-Host "`nCleanup complete!"
