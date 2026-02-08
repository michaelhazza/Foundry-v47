#!/bin/bash
set -euo pipefail
echo "=== verify-env-var-usage-proof ==="

ENV_MANIFEST="docs/env-manifest.json"
FAIL=0

if [[ ! -f "$ENV_MANIFEST" ]]; then
  echo "[SKIP] env-manifest.json not found"
  exit 0
fi

# Extract all required env vars from manifest
ENV_VAR_COUNT=$(grep -c '"name"' "$ENV_MANIFEST" || echo "0")

if [[ $ENV_VAR_COUNT -eq 0 ]]; then
  echo "[OK] No environment variables defined"
  exit 0
fi

echo "Checking $ENV_VAR_COUNT environment variables for usage proof..."

# For each env var, verify it has a validatedInFile
for i in $(seq 0 $((ENV_VAR_COUNT - 1))); do
  # Extract env var name and validatedInFile using grep/sed
  ENV_VAR=$(grep -o '"name": "[^"]*"' "$ENV_MANIFEST" | sed -n "$((i+1))p" | cut -d'"' -f4)
  VALIDATED_IN=$(grep -A 2 '"name": "'$ENV_VAR'"' "$ENV_MANIFEST" | grep '"validatedInFile"' | cut -d'"' -f4)
  
  if [[ -z "$VALIDATED_IN" ]]; then
    echo "[X] FAIL: $ENV_VAR has no validatedInFile"
    FAIL=1
  elif [[ ! -f "$VALIDATED_IN" ]]; then
    echo "[X] FAIL: $ENV_VAR validatedInFile not found: $VALIDATED_IN"
    FAIL=1
  else
    echo "[OK] $ENV_VAR validated in $VALIDATED_IN"
  fi
done

exit $FAIL
