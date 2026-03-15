#!/bin/bash
# Deploy to Vercel via API (bypassing CLI file upload bug)
set -e

TOKEN="vca_2d4qhVLuGalcZd2W5U5UvbKpzjuvSbm2QxHpSF1EF71ir6RhnF10iBLg"
TEAM_ID="team_Jhk4ChcwxuVXk5rXF6VFYgi7"
PROJECT_NAME="helloai"
API="https://api.vercel.com"

echo "=== Building project ==="
npm run build

echo ""
echo "=== Collecting files ==="

# Collect all source files (excluding node_modules, .next, .git, .vercel)
FILES_JSON="["
FIRST=true

upload_file() {
    local filepath="$1"
    local content_sha=$(sha1sum "$filepath" | awk '{print $1}')
    local size=$(stat -c%s "$filepath")
    
    # Upload file
    local response=$(curl -s -w "\n%{http_code}" -X POST "$API/v2/files?teamId=$TEAM_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/octet-stream" \
        -H "x-vercel-digest: $content_sha" \
        -H "Content-Length: $size" \
        --data-binary "@$filepath")
    
    local http_code=$(echo "$response" | tail -1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "409" ]; then
        echo "  ✓ $filepath ($content_sha)"
    else
        echo "  ✗ $filepath (HTTP $http_code)"
        echo "    $(echo "$response" | head -1)"
    fi
    
    echo "$content_sha"
}

# Build file list and upload
declare -A FILE_MAP

while IFS= read -r file; do
    # Skip unwanted files
    [[ "$file" == ./node_modules/* ]] && continue
    [[ "$file" == ./.git/* ]] && continue
    [[ "$file" == ./.vercel/* ]] && continue
    [[ "$file" == ./.next/* ]] && continue
    [[ "$file" == ./deploy.sh ]] && continue
    [[ "$file" == ./.env* ]] && continue
    
    sha=$(upload_file "$file")
    relative="${file#./}"
    
    if [ "$FIRST" = true ]; then
        FIRST=false
    else
        FILES_JSON+=","
    fi
    
    FILES_JSON+="{\"file\":\"$relative\",\"sha\":\"$sha\",\"size\":$(stat -c%s "$file")}"
done < <(find . -type f -not -path './node_modules/*' -not -path './.git/*' -not -path './.vercel/*' -not -path './.next/*' | sort)

FILES_JSON+="]"

echo ""
echo "=== Creating deployment ==="

# Create deployment
DEPLOY_RESPONSE=$(curl -s -X POST "$API/v13/deployments?teamId=$TEAM_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$PROJECT_NAME\",
        \"files\": $FILES_JSON,
        \"projectSettings\": {
            \"framework\": \"nextjs\",
            \"buildCommand\": \"npm run build\",
            \"outputDirectory\": \".next\"
        },
        \"target\": \"production\"
    }")

echo "$DEPLOY_RESPONSE" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if 'url' in d:
    print(f'✅ Deployed! URL: https://{d[\"url\"]}')
    print(f'   Status: {d.get(\"readyState\", \"building\")}')
elif 'error' in d:
    print(f'❌ Error: {d[\"error\"][\"message\"]}')
else:
    print(json.dumps(d, indent=2))
"
