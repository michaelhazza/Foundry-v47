#!/bin/bash
set -euo pipefail
echo "=== verify-cascade-completeness ==="

DATA_REL="docs/data-relationships.json"
FAIL=0

if [[ ! -f "$DATA_REL" ]]; then
  echo "[SKIP] data-relationships.json not found"
  exit 0
fi

# Find all foreign key relationships
echo "Checking cascade rules for foreign key relationships..."

# Extract tables with foreign key columns
TABLE_COUNT=$(grep -c '"name".*:' "$DATA_REL" | head -1 || echo "0")

# Look for 'references' fields in columns
FK_COUNT=$(grep -c '"references":' "$DATA_REL" || echo "0")

if [[ $FK_COUNT -eq 0 ]]; then
  echo "[OK] No foreign key relationships defined"
  exit 0
fi

echo "Found $FK_COUNT foreign key relationships"

# For each FK, verify it has a cascade rule (onDelete field)
FK_WITH_CASCADE=$(grep -B 1 '"references":' "$DATA_REL" | grep -c '"onDelete":' || echo "0")

if [[ $FK_WITH_CASCADE -lt $FK_COUNT ]]; then
  MISSING=$((FK_COUNT - FK_WITH_CASCADE))
  echo "[X] FAIL: $MISSING foreign keys missing cascade rules (onDelete)"
  FAIL=1
else
  echo "[OK] All $FK_COUNT foreign keys have cascade rules"
fi

exit $FAIL
