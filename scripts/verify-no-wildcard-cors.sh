#!/bin/bash
set -euo pipefail
echo "=== verify-no-wildcard-cors ==="

FAIL=0

# Derive server directory from service-contracts.json
SERVICE_CONTRACTS="docs/service-contracts.json"

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] service-contracts.json not found"
  exit 0
fi

SERVER_DIR=$(grep -o '"routeFile": "[^"]*"' "$SERVICE_CONTRACTS" | head -1 | cut -d'"' -f4 | sed 's|/.*||')

if [[ -z "$SERVER_DIR" ]]; then
  echo "[SKIP] Cannot derive server directory from service-contracts.json"
  exit 0
fi

if [[ ! -d "$SERVER_DIR" ]]; then
  echo "[SKIP] Server directory not found: $SERVER_DIR"
  exit 0
fi

# Search for literal wildcard CORS (origin: '*')
echo "Scanning $SERVER_DIR for wildcard CORS..."

WILDCARD_MATCHES=$(grep -r "origin.*['\"]\\*['\"]" "$SERVER_DIR" --include="*.ts" --include="*.js" 2>/dev/null || echo "")

if [[ -n "$WILDCARD_MATCHES" ]]; then
  echo "[X] FAIL: Found wildcard CORS in production code"
  echo "$WILDCARD_MATCHES" | sed 's/^/    /'
  FAIL=1
else
  echo "[OK] No wildcard CORS found"
fi

exit $FAIL
