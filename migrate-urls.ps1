# PowerShell script to replace all hardcoded localhost URLs with API_ENDPOINTS

$files = Get-ChildItem -Path ".\src\components" -Filter "*.jsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if file already has API_ENDPOINTS import
    if ($content -notmatch "API_ENDPOINTS") {
        # Add import if import section exists
        if ($content -match "import .+ from .+;") {
            $content = $content -replace "(import .+ from .+;`r?`n)", "`$1import { API_ENDPOINTS } from '../config/api';`n"
        }
    }
    
    # Replace all localhost URLs
    $content = $content -replace "'http://localhost:5000/bills'", "API_ENDPOINTS.BILLS"
    $content = $content -replace '"http://localhost:5000/bills"', "API_ENDPOINTS.BILLS"
    $content = $content -replace "'http://localhost:5000/chat'", "API_ENDPOINTS.CHAT"
    $content = $content -replace '"http://localhost:5000/chat"', "API_ENDPOINTS.CHAT"
    $content = $content -replace "'http://localhost:5000/settings'", "API_ENDPOINTS.SETTINGS"
    $content = $content -replace "'http://localhost:5000/extract'", "API_ENDPOINTS.EXTRACT"
    $content = $content -replace '"http://localhost:5000/extract"', "API_ENDPOINTS.EXTRACT"
    $content = $content -replace "'http://localhost:5000/notifications'", "API_ENDPOINTS.NOTIFICATIONS"
    $content = $content -replace "'http://localhost:5000/budgets'", "API_ENDPOINTS.BUDGETS"
    $content = $content -replace '"http://localhost:5000/budgets"', "API_ENDPOINTS.BUDGETS"
    $content = $content -replace "'http://localhost:5000/analytics'", "API_ENDPOINTS.ANALYTICS"
    $content = $content -replace "'http://localhost:5000/dev/", "API_ENDPOINTS.DEV_"
    $content = $content -replace "'http://localhost:5000/export/bills'", "API_ENDPOINTS.EXPORT_BILLS"
    $content = $content -replace "'http://localhost:5000/bills/bulk-delete'", "API_ENDPOINTS.BULK_DELETE"
    $content = $content -replace "'http://localhost:5000/bills/bulk-update'", "API_ENDPOINTS.BULK_UPDATE"
    $content = $content -replace "'http://localhost:5000/analytics/budget-comparison'", "API_ENDPOINTS.ANALYTICS_BUDGET_COMPARISON"
    $content = $content -replace "'http://localhost:5000/budgets/check-alerts'", "API_ENDPOINTS.BUDGET_CHECK_ALERTS"
    $content = $content -replace "'http://localhost:5000/notifications/unread-count'", "API_ENDPOINTS.NOTIFICATION_UNREAD_COUNT"
    
    # Handle template literals for dynamic IDs
    $content = $content -replace '`http://localhost:5000/bills/\$\{([^}]+)\}`', 'API_ENDPOINTS.BILL_UPDATE($1)'
    $content = $content -replace '`http://localhost:5000/budgets/\$\{([^}]+)\}`', 'API_ENDPOINTS.BUDGET_DELETE($1)'
    $content = $content -replace '`http://localhost:5000/items/\$\{([^}]+)\}`', 'API_ENDPOINTS.ITEM_DELETE($1)'
    $content = $content -replace '`http://localhost:5000/notifications/\$\{([^}]+)\}/read`', 'API_ENDPOINTS.NOTIFICATION_READ($1)'
    
    Set-Content -Path $file.FullName -Value $content
    Write-Host "Updated: $($file.Name)"
}

Write-Host "`nMigration complete!"
