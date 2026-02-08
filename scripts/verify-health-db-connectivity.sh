#!/bin/bash
set -euo pipefail
echo "=== verify-health-db-connectivity ==="

SERVICE_CONTRACTS="docs/service-contracts.json"
FAIL=0

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] service-contracts.json not found"
  exit 0
fi

# Find health endpoint by purpose (not by hardcoded path)
HEALTH_ENDPOINT_COUNT=$(grep -c '"purpose": "healthCheck"' "$SERVICE_CONTRACTS" || echo "0")

if [[ $HEALTH_ENDPOINT_COUNT -eq 0 ]]; then
  echo "[X] FAIL: No health check endpoint found (purpose: healthCheck)"
  FAIL=1
  exit $FAIL
fi

if [[ $HEALTH_ENDPOINT_COUNT -gt 1 ]]; then
  echo "[X] FAIL: Multiple health check endpoints found (expected 1, got $HEALTH_ENDPOINT_COUNT)"
  FAIL=1
  exit $FAIL
fi

echo "[OK] Health check endpoint found"

# Extract health endpoint details using grep/sed
HEALTH_PATH=$(grep -B 3 '"purpose": "healthCheck"' "$SERVICE_CONTRACTS" | grep '"path"' | cut -d'"' -f4)
HEALTH_ROUTE_FILE=$(grep -B 5 '"purpose": "healthCheck"' "$SERVICE_CONTRACTS" | grep '"routeFile"' | cut -d'"' -f4)

if [[ -z "$HEALTH_PATH" ]]; then
  echo "[X] FAIL: Health endpoint has no path"
  FAIL=1
else
  echo "[OK] Health endpoint path: $HEALTH_PATH"
fi

if [[ -z "$HEALTH_ROUTE_FILE" ]]; then
  echo "[X] FAIL: Health endpoint has no routeFile"
  FAIL=1
elif [[ ! -f "$HEALTH_ROUTE_FILE" ]]; then
  echo "[X] FAIL: Health route file not found: $HEALTH_ROUTE_FILE"
  FAIL=1
else
  echo "[OK] Health route file exists: $HEALTH_ROUTE_FILE"
fi

exit $FAIL
