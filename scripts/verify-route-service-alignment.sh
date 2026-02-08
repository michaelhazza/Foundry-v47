#!/bin/bash
set -euo pipefail

ENDPOINT_INDEX="$1"
SERVICE_CONTRACTS="docs/service-contracts.json"
FAIL=0

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] service-contracts.json not found"
  exit 0
fi

# Extract endpoint details
ENDPOINT_PATH=$(grep -o '"path": "[^"]*"' "$SERVICE_CONTRACTS" | sed -n "$((ENDPOINT_INDEX+1))p" | cut -d'"' -f4)

if [[ -z "$ENDPOINT_PATH" ]]; then
  echo "[SKIP] No endpoint at index $ENDPOINT_INDEX"
  exit 0
fi

# Extract routeFile and serviceFile for this endpoint
ROUTE_FILE=$(grep -A 5 '"path": "'$ENDPOINT_PATH'"' "$SERVICE_CONTRACTS" | grep '"routeFile"' | cut -d'"' -f4)
SERVICE_FILE=$(grep -A 10 '"path": "'$ENDPOINT_PATH'"' "$SERVICE_CONTRACTS" | grep '"serviceFile"' | cut -d'"' -f4)

if [[ -z "$ROUTE_FILE" ]]; then
  echo "[X] FAIL: $ENDPOINT_PATH has no routeFile"
  FAIL=1
fi

if [[ -z "$SERVICE_FILE" ]]; then
  echo "[X] FAIL: $ENDPOINT_PATH has no serviceFile"
  FAIL=1
fi

if [[ -n "$ROUTE_FILE" ]] && [[ ! -f "$ROUTE_FILE" ]]; then
  echo "[X] FAIL: Route file not found: $ROUTE_FILE"
  FAIL=1
fi

if [[ -n "$SERVICE_FILE" ]] && [[ ! -f "$SERVICE_FILE" ]]; then
  echo "[X] FAIL: Service file not found: $SERVICE_FILE"
  FAIL=1
fi

if [[ $FAIL -eq 0 ]]; then
  echo "[OK] $ENDPOINT_PATH route-service alignment verified"
fi

exit $FAIL
