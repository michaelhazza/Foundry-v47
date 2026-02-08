#!/bin/bash
set -euo pipefail
echo "=== verify-multi-tenant-isolation ==="

SCOPE_MANIFEST="docs/scope-manifest.json"
DATA_REL="docs/data-relationships.json"
FAIL=0

if [[ ! -f "$SCOPE_MANIFEST" ]] || [[ ! -f "$DATA_REL" ]]; then
  echo "[SKIP] Required artifacts not found"
  exit 0
fi

# Read isolation field from scope-manifest.json
ISOLATION_FIELD=$(grep -o '"isolationField": "[^"]*"' "$SCOPE_MANIFEST" | cut -d'"' -f4)

if [[ -z "$ISOLATION_FIELD" ]]; then
  echo "[SKIP] No tenant isolation configured"
  exit 0
fi

echo "Checking tenant isolation field: $ISOLATION_FIELD"

# Extract tenant-scoped entities (tenantKey: direct) from data-relationships.json
TENANT_ENTITIES=$(grep -B 5 '"tenantKey": "direct"' "$DATA_REL" | grep '"name"' | cut -d'"' -f4)

if [[ -z "$TENANT_ENTITIES" ]]; then
  echo "[OK] No tenant-scoped entities found"
  exit 0
fi

echo "Found tenant-scoped entities:"
echo "$TENANT_ENTITIES" | sed 's/^/  - /'

# Verify each tenant-scoped entity has the isolation field
while IFS= read -r entity; do
  if [[ -z "$entity" ]]; then
    continue
  fi
  
  # Check if entity has the isolation field in its columns
  HAS_FIELD=$(grep -A 50 '"name": "'$entity'"' "$DATA_REL" | grep -A 1 '"columns"' | grep -c '"name": "'$ISOLATION_FIELD'"' || echo "0")
  
  if [[ $HAS_FIELD -eq 0 ]]; then
    echo "[X] FAIL: $entity missing $ISOLATION_FIELD column"
    FAIL=1
  else
    echo "[OK] $entity has $ISOLATION_FIELD column"
  fi
done <<< "$TENANT_ENTITIES"

exit $FAIL
