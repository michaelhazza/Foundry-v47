#!/bin/bash
set -euo pipefail
echo "=== verify-index-strategy ==="

DATA_REL="docs/data-relationships.json"
SCOPE_MANIFEST="docs/scope-manifest.json"
FAIL=0

if [[ ! -f "$DATA_REL" ]] || [[ ! -f "$SCOPE_MANIFEST" ]]; then
  echo "[SKIP] Required artifacts not found"
  exit 0
fi

# Read isolation field
ISOLATION_FIELD=$(grep -o '"isolationField": "[^"]*"' "$SCOPE_MANIFEST" | cut -d'"' -f4)

if [[ -z "$ISOLATION_FIELD" ]]; then
  echo "[SKIP] No tenant isolation configured"
  exit 0
fi

# Find tables with softDeleteColumn
SOFT_DELETE_TABLES=$(grep -B 5 '"softDeleteColumn":' "$DATA_REL" | grep '"name"' | cut -d'"' -f4)

if [[ -z "$SOFT_DELETE_TABLES" ]]; then
  echo "[OK] No soft-delete tables found"
  exit 0
fi

echo "Checking index strategy for soft-delete tables..."

# Verify each soft-delete table has an index on the soft-delete column
while IFS= read -r table; do
  if [[ -z "$table" ]]; then
    continue
  fi
  
  # Extract soft-delete column name for this table
  SD_COL=$(grep -A 1 '"name": "'$table'"' "$DATA_REL" | grep -A 20 '"softDeleteColumn"' | head -1 | cut -d'"' -f4)
  
  if [[ -z "$SD_COL" ]]; then
    continue
  fi
  
  # Check if table has an index including the soft-delete column
  HAS_SD_INDEX=$(grep -A 50 '"name": "'$table'"' "$DATA_REL" | grep -A 2 '"indexes"' | grep -c "\"$SD_COL\"" || echo "0")
  
  if [[ $HAS_SD_INDEX -eq 0 ]]; then
    echo "[X] FAIL: $table missing index on soft-delete column $SD_COL"
    FAIL=1
  else
    echo "[OK] $table has index on $SD_COL"
  fi
  
  # Check tenant-scoped tables have composite indexes
  TENANT_KEY=$(grep -A 5 '"name": "'$table'"' "$DATA_REL" | grep '"tenantKey"' | cut -d'"' -f4)
  
  if [[ "$TENANT_KEY" == "direct" ]]; then
    # Should have composite index with isolation field
    HAS_COMPOSITE=$(grep -A 50 '"name": "'$table'"' "$DATA_REL" | grep -A 2 '"indexes"' | grep -c "\"$ISOLATION_FIELD\".*\"$SD_COL\"\|\"$SD_COL\".*\"$ISOLATION_FIELD\"" || echo "0")
    
    if [[ $HAS_COMPOSITE -eq 0 ]]; then
      echo "[X] FAIL: $table missing composite index ($ISOLATION_FIELD, $SD_COL)"
      FAIL=1
    else
      echo "[OK] $table has composite tenant + soft-delete index"
    fi
  fi
done <<< "$SOFT_DELETE_TABLES"

exit $FAIL
