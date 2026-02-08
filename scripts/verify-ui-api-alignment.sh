#!/bin/bash
set -euo pipefail
echo "=== verify-ui-api-alignment ==="

UI_DEPS="docs/ui-api-deps.json"
SERVICE_CONTRACTS="docs/service-contracts.json"
FAIL=0

if [[ ! -f "$UI_DEPS" ]] || [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] Required artifacts not found"
  exit 0
fi

# Extract page dependencies
PAGE_COUNT=$(grep -c '"path":.*"filePath":' "$UI_DEPS" || echo "0")

if [[ $PAGE_COUNT -eq 0 ]]; then
  echo "[OK] No pages with API dependencies"
  exit 0
fi

echo "Checking UI-API alignment for $PAGE_COUNT pages..."

# For each page, verify referenced endpoints exist in service-contracts
for i in $(seq 0 $((PAGE_COUNT - 1))); do
  PAGE_PATH=$(grep -o '"path": "[^"]*"' "$UI_DEPS" | sed -n "$((i+1))p" | cut -d'"' -f4)
  
  # Extract endpoint references for this page
  ENDPOINT_REFS=$(grep -A 30 '"path": "'$PAGE_PATH'"' "$UI_DEPS" | grep '"endpoint"' | cut -d'"' -f4)
  
  if [[ -z "$ENDPOINT_REFS" ]]; then
    continue
  fi
  
  # Verify each referenced endpoint exists
  while IFS= read -r endpoint; do
    if [[ -z "$endpoint" ]]; then
      continue
    fi
    
    ENDPOINT_EXISTS=$(grep -c '"path": "'$endpoint'"' "$SERVICE_CONTRACTS" || echo "0")
    
    if [[ $ENDPOINT_EXISTS -eq 0 ]]; then
      echo "[X] FAIL: Page $PAGE_PATH references non-existent endpoint: $endpoint"
      FAIL=1
    fi
  done <<< "$ENDPOINT_REFS"
  
  if [[ $FAIL -eq 0 ]]; then
    echo "[OK] $PAGE_PATH API dependencies verified"
  fi
done

exit $FAIL
