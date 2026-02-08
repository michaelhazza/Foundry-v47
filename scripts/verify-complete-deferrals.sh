#!/bin/bash
set -euo pipefail
echo "=== verify-complete-deferrals ==="

SCOPE_MANIFEST="docs/scope-manifest.json"
FAIL=0

if [[ ! -f "$SCOPE_MANIFEST" ]]; then
  echo "[SKIP] scope-manifest.json not found"
  exit 0
fi

# Check if deferralDeclarations exists
if ! grep -q '"deferralDeclarations"' "$SCOPE_MANIFEST"; then
  echo "[SKIP] No deferralDeclarations found"
  exit 0
fi

# Extract deferred entity names from deferredEntities array
DEFERRED_NAMES=$(grep -A 1 '"deferredEntities"' "$SCOPE_MANIFEST" | grep '"name"' | cut -d'"' -f4)

if [[ -z "$DEFERRED_NAMES" ]]; then
  echo "[OK] No deferred entities"
  exit 0
fi

echo "Checking deferral completeness for deferred entities:"
echo "$DEFERRED_NAMES" | sed 's/^/  - /'

# Verify each deferred entity has a deferralDeclaration
while IFS= read -r entity; do
  if [[ -z "$entity" ]]; then
    continue
  fi
  
  if ! grep -q "\"$entity\":" "$SCOPE_MANIFEST"; then
    echo "[X] FAIL: $entity in deferredEntities but no deferralDeclaration"
    FAIL=1
  else
    echo "[OK] $entity has deferralDeclaration"
  fi
done <<< "$DEFERRED_NAMES"

exit $FAIL
