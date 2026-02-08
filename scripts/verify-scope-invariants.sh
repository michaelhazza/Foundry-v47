#!/bin/bash
set -euo pipefail
echo "=== verify-scope-invariants ==="

SCOPE_MANIFEST="docs/scope-manifest.json"
FAIL=0

if [[ ! -f "$SCOPE_MANIFEST" ]]; then
  echo "[SKIP] scope-manifest.json not found"
  exit 0
fi

# Verify phase is set
PHASE=$(grep -o '"phase": "[^"]*"' "$SCOPE_MANIFEST" | cut -d'"' -f4)
if [[ -z "$PHASE" ]]; then
  echo "[X] FAIL: Missing phase declaration"
  FAIL=1
elif [[ "$PHASE" != "mvp" ]]; then
  echo "[X] FAIL: Phase must be 'mvp', got: $PHASE"
  FAIL=1
else
  echo "[OK] Phase: $PHASE"
fi

# Verify requiredEntities exists
if ! grep -q '"requiredEntities"' "$SCOPE_MANIFEST"; then
  echo "[X] FAIL: Missing requiredEntities array"
  FAIL=1
else
  ENTITY_COUNT=$(grep -c '"requiredEntities"' "$SCOPE_MANIFEST" || echo "0")
  echo "[OK] requiredEntities array present"
fi

# Verify platformConstraints exists
if ! grep -q '"platformConstraints"' "$SCOPE_MANIFEST"; then
  echo "[X] FAIL: Missing platformConstraints object"
  FAIL=1
else
  echo "[OK] platformConstraints present"
fi

exit $FAIL
