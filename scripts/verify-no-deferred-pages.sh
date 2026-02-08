#!/bin/bash
set -euo pipefail
echo "=== verify-no-deferred-pages ==="

UI_DEPS="docs/ui-api-deps.json"
SCOPE_MANIFEST="docs/scope-manifest.json"
FAIL=0

if [[ ! -f "$UI_DEPS" ]] || [[ ! -f "$SCOPE_MANIFEST" ]]; then
  echo "[SKIP] Required artifacts not found"
  exit 0
fi

# Extract deferred resources
DEFERRED_RESOURCES=$(grep -A 1 '"deferredEntities"' "$SCOPE_MANIFEST" | grep '"name"' | cut -d'"' -f4)

if [[ -z "$DEFERRED_RESOURCES" ]]; then
  echo "[OK] No deferred resources"
  exit 0
fi

# Extract all page paths
PAGE_PATHS=$(grep -o '"path": "[^"]*"' "$UI_DEPS" | cut -d'"' -f4)

echo "Checking for pages referencing deferred resources..."

# Check if any page path contains deferred resource names
while IFS= read -r resource; do
  if [[ -z "$resource" ]]; then
    continue
  fi
  
  MATCHING_PAGES=$(echo "$PAGE_PATHS" | grep -i "$resource" || echo "")
  
  if [[ -n "$MATCHING_PAGES" ]]; then
    echo "[X] FAIL: Found pages referencing deferred resource '$resource':"
    echo "$MATCHING_PAGES" | sed 's/^/    /'
    FAIL=1
  fi
done <<< "$DEFERRED_RESOURCES"

if [[ $FAIL -eq 0 ]]; then
  echo "[OK] No pages reference deferred resources"
fi

exit $FAIL
