import os
import re

# List of files with duplicate imports
files = [
    'src/components/ModernUpload.jsx',
    'src/components/ModernBillTable.jsx',
    'src/components/Analytics.jsx',
    'src/components/Dashboard.jsx',
    'src/components/BudgetManager.jsx',
    'src/components/DatabaseManager.jsx',
    'src/components/Notifications.jsx',
    'src/components/Settings.jsx',
    'src/components/ThemeProvider.jsx',
    'src/components/DataExport.jsx',
]

for filepath in files:
    if not os.path.exists(filepath):
        print(f"Skip: {filepath}")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Find all import lines and the first non-import line
    import_lines = []
    api_endpoint_found = False
    other_lines = []
    i = 0
    
    for line in lines:
        if line.strip().startswith('import '):
            if 'API_ENDPOINTS' not in line:
                import_lines.append(line)
            elif not api_endpoint_found:
                import_lines.append(line)
                api_endpoint_found = True
            # Skip duplicate API_ENDPOINTS imports
        else:
            other_lines = lines[i:]
            break
        i += 1
    
    # Reconstruct file
    new_content = ''.join(import_lines) + ''.join(other_lines)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Fixed: {filepath}")

print("\nAll files fixed!")
