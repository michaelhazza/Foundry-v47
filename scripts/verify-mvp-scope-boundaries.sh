#!/bin/bash
set -euo pipefail
echo "=== verify-mvp-scope-boundaries ==="

SCOPE_MANIFEST="docs/scope-manifest.json"
SERVICE_CONTRACTS="docs/service-contracts.json"
FAIL=0

if [[ ! -f "$SCOPE_MANIFEST" ]] || [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] Required artifacts not found"
  exit 0
fi

# Extract deferred resources from scope-manifest.json
DEFERRED_RESOURCES=$(grep -A 1 '"deferredEntities"' "$SCOPE_MANIFEST" | grep '"name"' | cut -d'"' -f4)

if [[ -z "$DEFERRED_RESOURCES" ]]; then
  echo "[OK] No deferred resources"
  exit 0
fi

echo "Checking MVP scope boundaries for deferred resources:"
echo "$DEFERRED_RESOURCES" | sed 's/^/  - /'

# Check if any endpoint paths contain deferred resource names (loose check)
ENDPOINT_PATHS=$(grep -o '"path": "[^"]*"' "$SERVICE_CONTRACTS" | cut -d'"' -f4)

while IFS= read -r resource; do
  if [[ -z "$resource" ]]; then
    continue
  fi
  
  # Warn if any endpoint path contains the deferred resource name
  MATCHING_ENDPOINTS=$(echo "$ENDPOINT_PATHS" | grep -i "$resource" || echo "")
  
  if [[ -n "$MATCHING_ENDPOINTS" ]]; then
    echo "[WARN] Found endpoints referencing deferred resource '$resource':"
    echo "$MATCHING_ENDPOINTS" | sed 's/^/    /'
    echo "       Verify these are intentionally deferred, not MVP scope leakage"
  fi
done <<< "$DEFERRED_RESOURCES"

# Check deferralDeclarations completeness
DEFERRED_COUNT=$(echo "$DEFERRED_RESOURCES" | wc -l)
DECLARATION_COUNT=$(grep -c '"deferralDeclarations"' "$SCOPE_MANIFEST" || echo "0")

if [[ $DECLARATION_COUNT -eq 0 ]] && [[ $DEFERRED_COUNT -gt 0 ]]; then
  echo "[X] FAIL: Deferred resources exist but no deferralDeclarations section"
  FAIL=1
fi

exit $FAIL
