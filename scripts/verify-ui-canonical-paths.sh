#!/bin/bash
set -euo pipefail
echo "=== verify-ui-canonical-paths ==="

UI_DEPS="docs/ui-api-deps.json"
FAIL=0

if [[ ! -f "$UI_DEPS" ]]; then
  echo "[SKIP] ui-api-deps.json not found"
  exit 0
fi

# Verify pages have unique canonical paths
PAGE_PATHS=$(grep -o '"path": "[^"]*"' "$UI_DEPS" | cut -d'"' -f4)

if [[ -z "$PAGE_PATHS" ]]; then
  echo "[OK] No pages defined"
  exit 0
fi

# Check for duplicate paths
DUPLICATE_PATHS=$(echo "$PAGE_PATHS" | sort | uniq -d)

if [[ -n "$DUPLICATE_PATHS" ]]; then
  echo "[X] FAIL: Duplicate page paths found:"
  echo "$DUPLICATE_PATHS" | sed 's/^/    /'
  FAIL=1
else
  PAGE_COUNT=$(echo "$PAGE_PATHS" | wc -l)
  echo "[OK] All $PAGE_COUNT page paths are unique"
fi

# Verify paths follow /resource or /resource/:id pattern
while IFS= read -r path; do
  if [[ -z "$path" ]]; then
    continue
  fi
  
  # Check for valid path patterns
  if [[ ! "$path" =~ ^/[a-z-]+(/:[a-zA-Z]+)?$ ]]; then
    echo "[X] FAIL: Invalid path pattern: $path (use /resource or /resource/:id)"
    FAIL=1
  fi
done <<< "$PAGE_PATHS"

if [[ $FAIL -eq 0 ]]; then
  echo "[OK] All paths follow canonical patterns"
fi

exit $FAIL
