#!/bin/bash
set -euo pipefail
echo "=== verify-error-handlers ==="

SERVICE_CONTRACTS="docs/service-contracts.json"
FAIL=0

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] service-contracts.json not found"
  exit 0
fi

# Derive server directory from service-contracts.json
SERVER_DIR=$(grep -o '"routeFile": "[^"]*"' "$SERVICE_CONTRACTS" | head -1 | cut -d'"' -f4 | sed 's|/.*||')

if [[ -z "$SERVER_DIR" ]]; then
  echo "[X] FAIL: Cannot derive server directory from service-contracts.json"
  exit 1
fi

if [[ ! -d "$SERVER_DIR" ]]; then
  echo "[SKIP] Server directory not found: $SERVER_DIR"
  exit 0
fi

# Find Express entry file (look for app.listen or createServer)
ENTRY_FILE=$(find "$SERVER_DIR" -name "*.ts" -o -name "*.js" -type f | xargs grep -l "app\.listen\|createServer" 2>/dev/null | head -1)

if [[ -z "$ENTRY_FILE" ]]; then
  echo "[X] FAIL: Cannot find Express entry file"
  exit 1
fi

echo "Checking Express entry file: $ENTRY_FILE"

# Check 1: JSON body parser with error handling
if ! grep -q "express\.json\|bodyParser\.json\|express\.urlencoded" "$ENTRY_FILE"; then
  echo "[X] FAIL: No JSON body parser found in $ENTRY_FILE"
  FAIL=1
else
  echo "[OK] JSON body parser found"
fi

# Check 2: Global error handler (4-parameter middleware: err, req, res, next)
if ! grep -Pzo '(err|error)\s*,\s*(req|request)\s*,\s*(res|response)\s*,\s*(next)' "$ENTRY_FILE" > /dev/null 2>&1; then
  echo "[X] FAIL: No global error handler (4-param middleware) found in $ENTRY_FILE"
  FAIL=1
else
  echo "[OK] Global error handler found"
fi

if [[ $FAIL -eq 0 ]]; then
  echo "[OK] Error handler verification passed"
fi

exit $FAIL
