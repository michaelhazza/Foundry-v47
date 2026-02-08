#!/bin/bash
set -euo pipefail
echo "=== verify-ui-self-consistency ==="

UI_DEPS="docs/ui-api-deps.json"
FAIL=0

if [[ ! -f "$UI_DEPS" ]]; then
  echo "[SKIP] ui-api-deps.json not found"
  exit 0
fi

# Verify schema version
if ! grep -q '"\$schema": "ui-api-deps-v' "$UI_DEPS"; then
  echo "[X] FAIL: Missing or invalid \$schema field"
  FAIL=1
else
  echo "[OK] Schema version present"
fi

# Verify pages array exists
if ! grep -q '"pages"' "$UI_DEPS"; then
  echo "[X] FAIL: Missing pages array"
  FAIL=1
else
  echo "[OK] pages array present"
fi

# Verify each page has required fields
PAGE_COUNT=$(grep -c '"path":.*"filePath":' "$UI_DEPS" || echo "0")

if [[ $PAGE_COUNT -gt 0 ]]; then
  echo "Validating $PAGE_COUNT page entries..."
  
  for i in $(seq 0 $((PAGE_COUNT - 1))); do
    PAGE_PATH=$(grep -o '"path": "[^"]*"' "$UI_DEPS" | sed -n "$((i+1))p" | cut -d'"' -f4)
    
    # Check for required fields
    HAS_FILE=$(grep -A 2 '"path": "'$PAGE_PATH'"' "$UI_DEPS" | grep -c '"filePath"' || echo "0")
    
    if [[ $HAS_FILE -eq 0 ]]; then
      echo "[X] FAIL: Page $PAGE_PATH missing 'filePath' field"
      FAIL=1
    else
      echo "[OK] $PAGE_PATH has required fields"
    fi
  done
fi

exit $FAIL
