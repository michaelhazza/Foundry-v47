#!/bin/bash
set -euo pipefail
echo "=== verify-body-validation ==="

SERVICE_CONTRACTS="docs/service-contracts.json"
FAIL=0

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] service-contracts.json not found"
  exit 0
fi

# Find POST/PUT/PATCH endpoints that accept JSON body
BODY_ENDPOINTS=$(grep -B 2 '"contentType": "application/json"' "$SERVICE_CONTRACTS" | grep '"path"' | cut -d'"' -f4)

if [[ -z "$BODY_ENDPOINTS" ]]; then
  echo "[OK] No endpoints with JSON body"
  exit 0
fi

echo "Checking body validation for endpoints with JSON payloads..."

# For each endpoint, verify it has request body schema
while IFS= read -r path; do
  if [[ -z "$path" ]]; then
    continue
  fi
  
  HAS_SCHEMA=$(grep -A 20 '"path": "'$path'"' "$SERVICE_CONTRACTS" | grep -c '"requestBody":' || echo "0")
  
  if [[ $HAS_SCHEMA -eq 0 ]]; then
    echo "[X] FAIL: $path missing request body schema"
    FAIL=1
  else
    echo "[OK] $path has request body schema"
  fi
done <<< "$BODY_ENDPOINTS"

exit $FAIL
