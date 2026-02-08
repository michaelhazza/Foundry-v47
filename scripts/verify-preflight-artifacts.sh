#!/bin/bash
set -euo pipefail
echo "=== verify-preflight-artifacts ==="

DOCS_DIR="docs"
FAIL=0

# Check required specification artifacts (NOT build outputs)
REQUIRED_FILES=(
  "$DOCS_DIR/scope-manifest.json"
  "$DOCS_DIR/env-manifest.json"
  "$DOCS_DIR/data-relationships.json"
  "$DOCS_DIR/service-contracts.json"
  "$DOCS_DIR/ui-api-deps.json"
  "$DOCS_DIR/gate-scripts-reference.md"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "[X] FAIL: Missing required artifact: $file"
    FAIL=1
  else
    echo "[OK] $file exists"
  fi
done

if [[ $FAIL -eq 0 ]]; then
  echo "[OK] All required specification artifacts present"
fi

exit $FAIL
