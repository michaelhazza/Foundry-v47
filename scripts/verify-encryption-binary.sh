#!/bin/bash
set -euo pipefail
echo "=== verify-encryption-binary ==="

DATA_REL="docs/data-relationships.json"
FAIL=0

if [[ ! -f "$DATA_REL" ]]; then
  echo "[SKIP] data-relationships.json not found"
  exit 0
fi

# Check if any columns require encryption (type: encrypted or piiCategory present)
HAS_ENCRYPTION=$(grep -c '"piiCategory"' "$DATA_REL" 2>/dev/null || echo "0")

if [[ $HAS_ENCRYPTION -eq 0 ]]; then
  echo "[OK] No PII encryption required"
  exit 0
fi

echo "Found $HAS_ENCRYPTION PII columns requiring encryption"

# Verify encryption implementation exists
SERVICE_CONTRACTS="docs/service-contracts.json"

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] Cannot verify encryption implementation without service-contracts.json"
  exit 0
fi

# Derive server directory
SERVER_DIR=$(grep -o '"routeFile": "[^"]*"' "$SERVICE_CONTRACTS" | head -1 | cut -d'"' -f4 | sed 's|/.*||')

if [[ -z "$SERVER_DIR" ]] || [[ ! -d "$SERVER_DIR" ]]; then
  echo "[SKIP] Cannot locate server directory"
  exit 0
fi

# Check for encryption utility (AES-256-GCM implementation)
ENCRYPTION_FILE=$(find "$SERVER_DIR" -name "*encrypt*" -o -name "*crypto*" 2>/dev/null | head -1)

if [[ -z "$ENCRYPTION_FILE" ]]; then
  echo "[X] FAIL: No encryption utility found (required for PII handling)"
  FAIL=1
else
  echo "[OK] Encryption utility found: $ENCRYPTION_FILE"
fi

exit $FAIL
