#!/bin/bash
set -euo pipefail
echo "=== verify-organisation-endpoint-naming ==="

SERVICE_CONTRACTS="docs/service-contracts.json"
FAIL=0

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] service-contracts.json not found"
  exit 0
fi

# Find organisation-related endpoints
ORG_ENDPOINTS=$(grep -o '"path": "[^"]*organisation[^"]*"' "$SERVICE_CONTRACTS" | cut -d'"' -f4)

if [[ -z "$ORG_ENDPOINTS" ]]; then
  echo "[OK] No organisation endpoints found"
  exit 0
fi

echo "Checking organisation endpoint naming..."

# Verify current organisation endpoint uses /me pattern
CURRENT_ORG_ENDPOINT=$(echo "$ORG_ENDPOINTS" | grep "/organisations/me" || echo "")

if [[ -z "$CURRENT_ORG_ENDPOINT" ]]; then
  echo "[X] FAIL: No /api/organisations/me endpoint found (singleton pattern required)"
  FAIL=1
else
  echo "[OK] Current organisation endpoint uses /me pattern"
fi

# Check for anti-pattern: /organisations/:id with route parameter
HAS_ID_PARAM=$(echo "$ORG_ENDPOINTS" | grep "/organisations/:[^/]*" | grep -v "/me" || echo "")

if [[ -n "$HAS_ID_PARAM" ]]; then
  echo "[X] FAIL: Found /organisations/:id endpoint (use /organisations/me for current org)"
  echo "$HAS_ID_PARAM" | sed 's/^/    /'
  FAIL=1
fi

exit $FAIL
