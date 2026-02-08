#!/bin/bash
set -euo pipefail
echo "=== verify-env-manifest-schema ==="

ENV_MANIFEST="docs/env-manifest.json"
FAIL=0

if [[ ! -f "$ENV_MANIFEST" ]]; then
  echo "[SKIP] env-manifest.json not found"
  exit 0
fi

# Verify schema version
if ! grep -q '"\$schema": "env-manifest-v' "$ENV_MANIFEST"; then
  echo "[X] FAIL: Missing or invalid \$schema field"
  FAIL=1
else
  echo "[OK] Schema version present"
fi

# Verify required array exists
if ! grep -q '"required"' "$ENV_MANIFEST"; then
  echo "[X] FAIL: Missing required array"
  FAIL=1
else
  echo "[OK] required array present"
fi

# Verify each required entry has mandatory fields
ENV_COUNT=$(grep -c '"name"' "$ENV_MANIFEST" || echo "0")

if [[ $ENV_COUNT -gt 0 ]]; then
  echo "Validating $ENV_COUNT environment variable entries..."
  
  for i in $(seq 0 $((ENV_COUNT - 1))); do
    ENV_NAME=$(grep -o '"name": "[^"]*"' "$ENV_MANIFEST" | sed -n "$((i+1))p" | cut -d'"' -f4)
    
    # Check for required fields: usage, validatedInFile
    HAS_USAGE=$(grep -A 3 '"name": "'$ENV_NAME'"' "$ENV_MANIFEST" | grep -c '"usage"' || echo "0")
    HAS_VALIDATED=$(grep -A 3 '"name": "'$ENV_NAME'"' "$ENV_MANIFEST" | grep -c '"validatedInFile"' || echo "0")
    
    if [[ $HAS_USAGE -eq 0 ]]; then
      echo "[X] FAIL: $ENV_NAME missing 'usage' field"
      FAIL=1
    fi
    
    if [[ $HAS_VALIDATED -eq 0 ]]; then
      echo "[X] FAIL: $ENV_NAME missing 'validatedInFile' field"
      FAIL=1
    fi
    
    if [[ $HAS_USAGE -gt 0 ]] && [[ $HAS_VALIDATED -gt 0 ]]; then
      echo "[OK] $ENV_NAME has required fields"
    fi
  done
fi

exit $FAIL
