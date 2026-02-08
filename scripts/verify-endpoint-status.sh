#!/bin/bash
set -euo pipefail

ENDPOINT_INDEX="$1"
SERVICE_CONTRACTS="docs/service-contracts.json"

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] service-contracts.json not found"
  exit 0
fi

# Extract endpoint path for this index
ENDPOINT_PATH=$(grep -o '"path": "[^"]*"' "$SERVICE_CONTRACTS" | sed -n "$((ENDPOINT_INDEX+1))p" | cut -d'"' -f4)

if [[ -z "$ENDPOINT_PATH" ]]; then
  echo "[SKIP] No endpoint at index $ENDPOINT_INDEX"
  exit 0
fi

# Check if endpoint has status code documentation
HAS_STATUS=$(grep -A 50 '"path": "'$ENDPOINT_PATH'"' "$SERVICE_CONTRACTS" | grep -c '"statusCode":' || echo "0")

if [[ $HAS_STATUS -eq 0 ]]; then
  echo "[X] FAIL: $ENDPOINT_PATH has no status code documentation"
  exit 1
fi

echo "[OK] $ENDPOINT_PATH has status code documentation"
exit 0
