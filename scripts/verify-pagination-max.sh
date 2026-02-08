#!/bin/bash
set -euo pipefail

ENDPOINT_INDEX="$1"
SERVICE_CONTRACTS="docs/service-contracts.json"

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] service-contracts.json not found"
  exit 0
fi

# Extract endpoint path and method
ENDPOINT_PATH=$(grep -o '"path": "[^"]*"' "$SERVICE_CONTRACTS" | sed -n "$((ENDPOINT_INDEX+1))p" | cut -d'"' -f4)
ENDPOINT_METHOD=$(grep -B 1 '"path": "'$ENDPOINT_PATH'"' "$SERVICE_CONTRACTS" | grep '"method"' | cut -d'"' -f4)

if [[ -z "$ENDPOINT_PATH" ]] || [[ "$ENDPOINT_METHOD" != "GET" ]]; then
  echo "[SKIP] Endpoint is not a GET (pagination only applies to list endpoints)"
  exit 0
fi

# Check if this is a list endpoint (returns array)
IS_LIST=$(grep -A 30 '"path": "'$ENDPOINT_PATH'"' "$SERVICE_CONTRACTS" | grep -c '"returnsArray": true' || echo "0")

if [[ $IS_LIST -eq 0 ]]; then
  echo "[SKIP] Not a list endpoint"
  exit 0
fi

# Verify pagination parameters exist
HAS_LIMIT=$(grep -A 30 '"path": "'$ENDPOINT_PATH'"' "$SERVICE_CONTRACTS" | grep -c '"limit"' || echo "0")
HAS_OFFSET=$(grep -A 30 '"path": "'$ENDPOINT_PATH'"' "$SERVICE_CONTRACTS" | grep -c '"offset"' || echo "0")

if [[ $HAS_LIMIT -eq 0 ]] || [[ $HAS_OFFSET -eq 0 ]]; then
  echo "[X] FAIL: $ENDPOINT_PATH missing pagination parameters (limit/offset)"
  exit 1
fi

echo "[OK] $ENDPOINT_PATH has pagination parameters"
exit 0
