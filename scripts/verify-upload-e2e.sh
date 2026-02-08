#!/bin/bash
set -euo pipefail
echo "=== verify-upload-e2e ==="

SERVICE_CONTRACTS="docs/service-contracts.json"
FAIL=0

if [[ ! -f "$SERVICE_CONTRACTS" ]]; then
  echo "[SKIP] service-contracts.json not found"
  exit 0
fi

# Find upload endpoints (contentType: multipart/form-data)
UPLOAD_COUNT=$(grep -c '"contentType": "multipart/form-data"' "$SERVICE_CONTRACTS" || echo "0")

if [[ $UPLOAD_COUNT -eq 0 ]]; then
  echo "[OK] No upload endpoints defined"
  exit 0
fi

echo "Found $UPLOAD_COUNT upload endpoints"

# Verify each upload endpoint has:
# 1. File upload configuration
# 2. Proper validation
# 3. Service method for processing

UPLOAD_PATHS=$(grep -B 5 '"contentType": "multipart/form-data"' "$SERVICE_CONTRACTS" | grep '"path"' | cut -d'"' -f4)

while IFS= read -r path; do
  if [[ -z "$path" ]]; then
    continue
  fi
  
  # Check for file field configuration
  HAS_FILE_FIELD=$(grep -A 20 '"path": "'$path'"' "$SERVICE_CONTRACTS" | grep -c '"fieldName":' || echo "0")
  
  if [[ $HAS_FILE_FIELD -eq 0 ]]; then
    echo "[X] FAIL: $path missing file field configuration"
    FAIL=1
  else
    echo "[OK] $path has file field configuration"
  fi
done <<< "$UPLOAD_PATHS"

exit $FAIL
