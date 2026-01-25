#!/bin/bash
# API URL Migration Script - Batch replace all hardcoded localhost URLs

cd "$(dirname "$0")/src"

# Function to replace URLs in a file
replace_in_file() {
    local file=$1
    # Check if file needs import
    if ! grep -q "API_ENDPOINTS" "$file"; then
        # Add import after other imports
        sed -i '1i import { API_ENDPOINTS } from "../config/api";' "$file" 2>/dev/null || \
        sed -i '1i import { API_ENDPOINTS } from "./config/api";' "$file" 2>/dev/null || \
        sed '1i import { API_ENDPOINTS } from "../config/api";' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    fi
    
    # Replace URLs
    sed -i 's|"http://localhost:5000/bills"|API_ENDPOINTS.BILLS|g' "$file" || sed 's|"http://localhost:5000/bills"|API_ENDPOINTS.BILLS|g' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    sed -i 's|'"'"'http://localhost:5000/bills'"'"'|API_ENDPOINTS.BILLS|g' "$file" || sed 's|'"'"'http://localhost:5000/bills'"'"'|API_ENDPOINTS.BILLS|g' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    sed -i 's|'"'"'http://localhost:5000/chat'"'"'|API_ENDPOINTS.CHAT|g' "$file" || sed 's|'"'"'http://localhost:5000/chat'"'"'|API_ENDPOINTS.CHAT|g' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    sed -i 's|'"'"'http://localhost:5000/settings'"'"'|API_ENDPOINTS.SETTINGS|g' "$file" || sed 's|'"'"'http://localhost:5000/settings'"'"'|API_ENDPOINTS.SETTINGS|g' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    sed -i 's|'"'"'http://localhost:5000/extract'"'"'|API_ENDPOINTS.EXTRACT|g' "$file" || sed 's|'"'"'http://localhost:5000/extract'"'"'|API_ENDPOINTS.EXTRACT|g' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    sed -i 's|'"'"'http://localhost:5000/notifications'"'"'|API_ENDPOINTS.NOTIFICATIONS|g' "$file" || sed 's|'"'"'http://localhost:5000/notifications'"'"'|API_ENDPOINTS.NOTIFICATIONS|g' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    sed -i 's|'"'"'http://localhost:5000/budgets'"'"'|API_ENDPOINTS.BUDGETS|g' "$file" || sed 's|'"'"'http://localhost:5000/budgets'"'"'|API_ENDPOINTS.BUDGETS|g' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    sed -i 's|'"'"'http://localhost:5000/analytics'"'"'|API_ENDPOINTS.ANALYTICS|g' "$file" || sed 's|'"'"'http://localhost:5000/analytics'"'"'|API_ENDPOINTS.ANALYTICS|g' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
}

# Update all component files
find components -name "*.jsx" -type f | while read file; do
    echo "Updating $file..."
    replace_in_file "$file"
done

echo "Migration complete!"
