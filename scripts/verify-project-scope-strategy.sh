#!/bin/bash
set -euo pipefail
echo "=== verify-project-scope-strategy ==="

DATA_REL="docs/data-relationships.json"
FAIL=0

if [[ ! -f "$DATA_REL" ]]; then
  echo "[SKIP] data-relationships.json not found"
  exit 0
fi

# Dynamically discover entities with indirect tenant scoping
INDIRECT_ENTITIES=$(grep -B 2 '"tenantKey": "indirect"' "$DATA_REL" | grep '"name"' | cut -d'"' -f4)

if [[ -z "$INDIRECT_ENTITIES" ]]; then
  echo "[OK] No indirect-tenant entities found"
  exit 0
fi

echo "Found indirect-tenant entities:"
echo "$INDIRECT_ENTITIES" | sed 's/^/  - /'

# Verify each indirect entity has a scoping strategy
while IFS= read -r entity; do
  if [[ -z "$entity" ]]; then
    continue
  fi
  
  # Check if entity has projectScopeStrategy field
  HAS_STRATEGY=$(grep -A 20 '"name": "'$entity'"' "$DATA_REL" | grep -c '"projectScopeStrategy":' || echo "0")
  
  if [[ $HAS_STRATEGY -eq 0 ]]; then
    echo "[X] FAIL: $entity has tenantKey:indirect but no projectScopeStrategy"
    FAIL=1
  else
    STRATEGY=$(grep -A 20 '"name": "'$entity'"' "$DATA_REL" | grep '"projectScopeStrategy"' | cut -d'"' -f4)
    echo "[OK] $entity: projectScopeStrategy = $STRATEGY"
  fi
done <<< "$INDIRECT_ENTITIES"

exit $FAIL
